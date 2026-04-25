#!/usr/bin/env bash
# Superkabe MCP Server — auto-configure helper
#
# Detects which MCP clients are installed (Claude Desktop, Claude Code, Cursor,
# Continue), prompts for SUPERKABE_API_KEY + SUPERKABE_API_URL, and patches each
# client's config to register the Superkabe MCP server.
#
# Idempotent: re-running updates the existing entry rather than duplicating it.
# Backs up every config it touches to <path>.bak.<timestamp> first.
#
# Usage:  ./setup.sh
#
set -euo pipefail

# ─── Pretty output ───────────────────────────────────────────────────
c_bold=$'\e[1m'; c_dim=$'\e[2m'; c_red=$'\e[31m'; c_green=$'\e[32m'
c_yellow=$'\e[33m'; c_blue=$'\e[34m'; c_reset=$'\e[0m'

info()  { printf '%s%s%s\n' "$c_blue"   "→ $*" "$c_reset"; }
ok()    { printf '%s%s%s\n' "$c_green"  "✓ $*" "$c_reset"; }
warn()  { printf '%s%s%s\n' "$c_yellow" "! $*" "$c_reset"; }
err()   { printf '%s%s%s\n' "$c_red"    "✗ $*" "$c_reset" 1>&2; }
hd()    { printf '\n%s%s%s\n' "$c_bold" "── $* ──" "$c_reset"; }

# ─── Pre-flight ──────────────────────────────────────────────────────
hd "Superkabe MCP Server setup"

if ! command -v node >/dev/null 2>&1; then
    err "Node.js not found. Install Node 20+ from https://nodejs.org and re-run."
    exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
    err "Node.js 20+ required. Found: $(node -v)"
    exit 1
fi
ok "Node.js $(node -v)"

if ! command -v jq >/dev/null 2>&1; then
    err "jq not found. Install with: brew install jq  (macOS)  /  apt-get install jq  (Linux)"
    exit 1
fi
ok "jq $(jq --version)"

# ─── Detect platform ─────────────────────────────────────────────────
case "$(uname -s)" in
    Darwin)  PLATFORM=macos ;;
    Linux)   PLATFORM=linux ;;
    MINGW*|MSYS*|CYGWIN*) PLATFORM=windows ;;
    *)       PLATFORM=unknown ;;
esac
info "Detected platform: $PLATFORM"

# ─── Client config paths ─────────────────────────────────────────────
case "$PLATFORM" in
    macos)
        CLAUDE_DESKTOP="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
        ;;
    linux)
        CLAUDE_DESKTOP="$HOME/.config/Claude/claude_desktop_config.json"
        ;;
    windows)
        CLAUDE_DESKTOP="${APPDATA:-$HOME/AppData/Roaming}/Claude/claude_desktop_config.json"
        ;;
    *)
        CLAUDE_DESKTOP=""
        ;;
esac

CLAUDE_CODE="$HOME/.claude/settings.json"
CURSOR_GLOBAL="$HOME/.cursor/mcp.json"

# ─── Prompt for credentials ──────────────────────────────────────────
hd "Credentials"

DEFAULT_API_URL="${SUPERKABE_API_URL:-https://api.superkabe.com}"
read -r -p "Superkabe API key (sk_live_... or sk_test_...): " API_KEY
if [ -z "$API_KEY" ]; then
    err "API key is required. Generate one at Dashboard → API & MCP."
    exit 1
fi

read -r -p "API URL [$DEFAULT_API_URL]: " API_URL
API_URL="${API_URL:-$DEFAULT_API_URL}"
API_URL="${API_URL%/}"  # strip trailing slash

# ─── Decide command/args ─────────────────────────────────────────────
# If we're running from inside a checked-out repo and dist/index.js exists,
# use a node + absolute-path config (more reliable than npx for source builds).
# Otherwise default to npx so users without a clone still work.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_PATH="$SCRIPT_DIR/dist/index.js"

if [ -f "$DIST_PATH" ]; then
    info "Built server detected at $DIST_PATH — using node + absolute path"
    USE_LOCAL=1
    SERVER_CMD="node"
    SERVER_ARGS=( "$DIST_PATH" )
else
    info "Using npx -y @superkabe/mcp-server (no local build found)"
    USE_LOCAL=0
    SERVER_CMD="npx"
    SERVER_ARGS=( "-y" "@superkabe/mcp-server" )
fi

# ─── Build the entry JSON via jq ─────────────────────────────────────
ENTRY_JSON="$(jq -n \
    --arg cmd "$SERVER_CMD" \
    --argjson args "$(printf '%s\n' "${SERVER_ARGS[@]}" | jq -R . | jq -s .)" \
    --arg key "$API_KEY" \
    --arg url "$API_URL" \
    '{ command: $cmd, args: $args, env: { SUPERKABE_API_KEY: $key, SUPERKABE_API_URL: $url } }'
)"

# ─── Patch a single config file ──────────────────────────────────────
# $1 = path to config
# $2 = top-level key holding mcpServers ("" for root, or "mcpServers" if nested)
patch_config() {
    local path="$1"
    local label="$2"

    mkdir -p "$(dirname "$path")"

    if [ -f "$path" ]; then
        # Validate existing JSON
        if ! jq empty "$path" >/dev/null 2>&1; then
            warn "$label config exists but is not valid JSON: $path"
            warn "  Skipping. Fix the file or delete it and re-run."
            return 1
        fi
        local backup="$path.bak.$(date +%Y%m%d-%H%M%S)"
        cp "$path" "$backup"
        info "$label: backed up to $backup"
    else
        echo '{}' > "$path"
    fi

    # Merge: ensure .mcpServers exists, set .mcpServers.superkabe = ENTRY
    local tmp="$path.tmp.$$"
    jq --argjson entry "$ENTRY_JSON" '
        (.mcpServers //= {}) |
        .mcpServers.superkabe = $entry
    ' "$path" > "$tmp" && mv "$tmp" "$path"

    ok "$label: configured at $path"
}

# ─── Run patchers ────────────────────────────────────────────────────
hd "Patching client configs"

PATCHED=0

# Claude Desktop
if [ -n "$CLAUDE_DESKTOP" ]; then
    if [ -f "$CLAUDE_DESKTOP" ] || [ -d "$(dirname "$CLAUDE_DESKTOP")" ]; then
        patch_config "$CLAUDE_DESKTOP" "Claude Desktop" && PATCHED=$((PATCHED + 1)) || true
    else
        read -r -p "Claude Desktop not detected. Configure anyway? [y/N] " yn
        if [[ "$yn" =~ ^[Yy]$ ]]; then
            patch_config "$CLAUDE_DESKTOP" "Claude Desktop" && PATCHED=$((PATCHED + 1)) || true
        else
            warn "Claude Desktop: skipped"
        fi
    fi
fi

# Claude Code
if [ -d "$HOME/.claude" ] || command -v claude >/dev/null 2>&1; then
    patch_config "$CLAUDE_CODE" "Claude Code" && PATCHED=$((PATCHED + 1)) || true
else
    read -r -p "Claude Code not detected. Configure anyway? [y/N] " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
        patch_config "$CLAUDE_CODE" "Claude Code" && PATCHED=$((PATCHED + 1)) || true
    else
        warn "Claude Code: skipped"
    fi
fi

# Cursor
if [ -d "$HOME/.cursor" ] || command -v cursor >/dev/null 2>&1; then
    patch_config "$CURSOR_GLOBAL" "Cursor" && PATCHED=$((PATCHED + 1)) || true
else
    read -r -p "Cursor not detected. Configure anyway? [y/N] " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
        patch_config "$CURSOR_GLOBAL" "Cursor" && PATCHED=$((PATCHED + 1)) || true
    else
        warn "Cursor: skipped"
    fi
fi

# Continue is per-project — we don't auto-detect, just print instructions
hd "Continue (per-project)"
cat <<EOF
Continue stores config in <project>/.continue/config.json. To add Superkabe,
merge this block into the existing config:

{
  "mcpServers": {
    "superkabe": $(echo "$ENTRY_JSON" | jq .)
  }
}
EOF

# ─── Done ────────────────────────────────────────────────────────────
hd "Done"
if [ "$PATCHED" -gt 0 ]; then
    ok "Patched $PATCHED client config(s)."
    echo
    echo "Next steps:"
    echo "  1. Quit and relaunch your MCP client (Claude Desktop, Cursor, etc.)"
    echo "  2. Verify the Superkabe tools appear (16 tools total)"
    echo "  3. Try: \"List my campaigns\" as your first prompt"
    echo
    echo "Full docs: https://superkabe.com/docs/mcp-server"
else
    warn "No client configs were patched. Re-run with at least one MCP client installed."
fi

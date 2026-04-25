# Superkabe MCP Server

Connect [Claude](https://claude.ai), [Cursor](https://cursor.com), [Continue](https://continue.dev), or any MCP-compatible AI agent to your Superkabe cold email platform. Once connected, the agent can manage leads, run campaigns, validate emails, monitor mailbox/domain health, and reply to threads — all through natural-language prompts.

```
┌─────────────────┐  stdio JSON-RPC   ┌──────────────────┐  HTTPS+Bearer  ┌──────────────────┐
│  MCP client     │ ◀───────────────▶ │  Superkabe MCP   │ ──────────────▶│  Superkabe v1    │
│  (Claude/Cursor)│                   │  server (this)   │                │  REST API        │
└─────────────────┘                   └──────────────────┘                └──────────────────┘
```

The full reference docs (with all 16 tools, schemas, security model, troubleshooting) live at **<https://superkabe.com/docs/mcp-server>**. This README is the quickstart.

---

## 1. Quickstart (5 minutes)

### Prerequisites

- **Node.js 20+**
- **A Superkabe API key** — generate one in *Dashboard → API & MCP* with the scopes you want the agent to have. Start with read-only (`leads:read`, `campaigns:read`, `mailboxes:read`, `domains:read`, `replies:read`, `validation:read`, `reports:read`, `account:read`) and grant write/send scopes only when you actively want the agent taking those actions.
- **An MCP-compatible client** — Claude Desktop, Claude Code, Cursor, Continue, or any conformant client.

### Install

**Option A — npx (no install)**

```bash
SUPERKABE_API_KEY=sk_live_... npx -y @superkabe/mcp-server
```

**Option B — from source**

```bash
git clone https://github.com/Superkabereal/Superkabe.git superkabe
cd superkabe/mcp-server
npm install
npm run build
```

### Auto-configure your client

We ship a setup script that patches your MCP client config automatically:

```bash
# From the mcp-server/ directory:
./setup.sh
```

It detects which clients you have installed (Claude Desktop, Claude Code, Cursor, Continue), prompts for your API key + API URL, and writes the right JSON to the right path. Re-run any time to update or to add another client.

### Manual setup

If you'd rather hand-edit, see §2 below.

### First prompt

Restart your client. A *tools* icon (or equivalent) should now show 16 Superkabe tools. Try:

> *"List my campaigns and tell me which mailboxes are currently in healing."*

---

## 2. Manual configuration

Same JSON shape across all clients — only the file location differs.

```json
{
  "mcpServers": {
    "superkabe": {
      "command": "npx",
      "args": ["-y", "@superkabe/mcp-server"],
      "env": {
        "SUPERKABE_API_KEY": "sk_live_...",
        "SUPERKABE_API_URL": "https://api.superkabe.com"
      }
    }
  }
}
```

| Client          | Config file path |
|-----------------|------------------|
| Claude Desktop (macOS)   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| Claude Desktop (Linux)   | `~/.config/Claude/claude_desktop_config.json` |
| Claude Code              | `~/.claude/settings.json` (under `mcpServers`) or per-project `.mcp.json` |
| Cursor                   | `~/.cursor/mcp.json` (global) or `<project>/.cursor/mcp.json` (per-project) |
| Continue                 | `<project>/.continue/config.json` (under `mcpServers`) |

If you cloned from source instead of using npx, replace the `command`/`args` block with:

```json
"command": "node",
"args": ["/absolute/path/to/superkabe/mcp-server/dist/index.js"],
```

> **Never put `SUPERKABE_API_KEY` in `args[]`.** It will leak into `ps aux` and OS process lists. Use the `env` block.

---

## 3. Environment variables

| Variable              | Required | Default                  | Notes |
|-----------------------|----------|--------------------------|-------|
| `SUPERKABE_API_KEY`   | yes      | —                        | Bearer token. Server crashes at startup if missing. |
| `SUPERKABE_API_URL`   | no       | `http://localhost:4000`  | Override for staging / production. Trailing slash stripped. |

For production: `SUPERKABE_API_URL=https://api.superkabe.com`.

---

## 4. The 16 tools

Every tool maps 1:1 to a v1 REST endpoint and is gated by a specific scope on your API key.

| Tool                      | Risk     | Scope required        | What it does |
|---------------------------|----------|-----------------------|--------------|
| `get_account`             | low      | `account:read`        | Plan, usage counts, tier limits. |
| `import_leads`            | medium   | `leads:write`         | Bulk import (max 5,000). |
| `list_leads`              | low      | `leads:read`          | Paginated list with filters (status, validation_status, search). |
| `get_lead`                | low      | `leads:read`          | Single lead with full validation + engagement history. |
| `validate_leads`          | medium   | `validation:trigger`  | Async validate by lead IDs or emails. |
| `get_validation_results`  | low      | `validation:read`     | Org-wide validation breakdown by status. |
| `create_campaign`         | high     | `campaigns:write`     | Create sequencer campaign with steps + variants + schedule. |
| `list_campaigns`          | low      | `campaigns:read`      | All campaigns with status, lead/step counts. |
| `get_campaign`            | low      | `campaigns:read`      | Full campaign incl. steps, variants, first 100 leads. |
| `update_campaign`         | high     | `campaigns:write`     | Edit name / schedule / daily limit. Paused or draft only. |
| `launch_campaign`         | **high** | `campaigns:write`     | **Starts real sends.** |
| `pause_campaign`          | medium   | `campaigns:write`     | Stop sending on an active campaign. |
| `get_campaign_report`     | low      | `reports:read`        | Sent / replies / reply-rate / status breakdown. |
| `get_campaign_replies`    | low      | `replies:read`        | Inbound replies (last 100 threads). |
| `send_reply`              | **high** | `replies:send`        | **Sends a real email** from the original mailbox. |
| `list_mailboxes`          | low      | `mailboxes:read`      | Health, send/bounce counts, warmup, recovery phase. |
| `list_domains`            | low      | `domains:read`        | Health, bounce-rate trends, engagement, recovery phase. |

**Read-only starter scope set:** `account:read leads:read validation:read campaigns:read reports:read replies:read mailboxes:read domains:read` — gets you 11/16 tools with zero ability to change anything or send mail.

---

## 5. Sanity-check the server

```bash
SUPERKABE_API_KEY=sk_live_... \
SUPERKABE_API_URL=https://api.superkabe.com \
node dist/index.js

# Expect on stderr:
# Superkabe MCP Server v1.0.0 connected (https://api.superkabe.com)
```

The process sits idle waiting for JSON-RPC on stdin. Ctrl-C to exit. MCP clients spawn this process automatically — you do not run it manually in normal use.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Tools icon never appears | Bad JSON or wrong config path | `jq . <config>` to validate; quit & relaunch the client |
| `FATAL: SUPERKABE_API_KEY is required` | Env not passed to subprocess | Put key under `env`, not `args` |
| All tool calls return `API returned 401` | Key revoked / wrong env | Reissue key; check `SUPERKABE_API_URL` matches the key's environment |
| Some tools return `Missing required scope` | Key lacks that scope | Edit key in dashboard or issue a broader one |
| `ECONNREFUSED 127.0.0.1:4000` | Default URL used; no local backend | Set `SUPERKABE_API_URL=https://api.superkabe.com` |
| Tool calls slow (>2s) | Large org + cold DB | Add filters (`page`, `status`, `search`) to `list_leads` |

### Live logs

```bash
# Claude Desktop (macOS)
tail -f "$HOME/Library/Logs/Claude/mcp-server-superkabe.log"

# Claude Desktop (Windows)
Get-Content -Wait "$env:APPDATA\Claude\Logs\mcp-server-superkabe.log"

# Claude Desktop (Linux)
tail -f "$HOME/.config/Claude/logs/mcp-server-superkabe.log"

# Cursor
tail -f "$HOME/.cursor/logs/mcp-server-superkabe.log"

# Verbose Node HTTP tracing
NODE_DEBUG=http,https SUPERKABE_API_KEY=... node dist/index.js
```

---

## 7. Updating

```bash
cd superkabe/mcp-server
git pull
npm install
npm run build
# Restart your MCP client
```

New tools are auto-advertised over the protocol — no client changes required.

---

## 8. Security model

- **No ambient credentials.** The server reads exactly one env var (`SUPERKABE_API_KEY`).
- **Scoped keys.** Tools the server *attempts* are defined at build time; tools the server is *allowed* to execute depend on your key's scopes. Grant the minimum.
- **Org-scoped.** Every API call is auto-scoped to the key's organization. The server cannot leak across tenants.
- **Stdio, not sockets.** The server opens no listening ports. Compromise requires local process access.
- **No persistent state.** Killing the process forgets everything.

For the high-risk tools (`launch_campaign`, `update_campaign`, `pause_campaign`, `create_campaign`, `send_reply`), prefer a **separate API key per risk tier** so you can revoke narrowly.

---

## 9. Protocol compatibility

- Implements MCP server capability `tools` only. No `resources`, `prompts`, or `sampling` yet.
- Built on `@modelcontextprotocol/sdk` 1.12.x; any conformant client should interoperate.
- Transport: `StdioServerTransport`. HTTP/SSE on the roadmap — open an issue if you need it.

---

## Links

- **Full docs:** <https://superkabe.com/docs/mcp-server>
- **API reference:** <https://superkabe.com/docs/api-documentation>
- **Dashboard:** <https://superkabe.com/dashboard/api-mcp>
- **Issues:** <https://github.com/Superkabereal/Superkabe/issues>

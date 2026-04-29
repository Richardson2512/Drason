import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Claude (MCP Server) | Superkabe Docs',
    description: 'Connect Claude — claude.ai browser, Claude Desktop, Claude Code, Cursor — to Superkabe via the MCP protocol. OAuth 2.0 for browser, stdio for local clients. 17 tools, full security model, complete reference.',
    alternates: { canonical: '/docs/mcp-server' },
    openGraph: {
        title: 'Claude (MCP Server) | Superkabe Docs',
        description: 'Connect Claude — claude.ai browser, Claude Desktop, Claude Code, Cursor — to Superkabe via the MCP protocol. OAuth 2.0 for browser, stdio for local clients. 17 tools, full security model, complete reference.',
        url: '/docs/mcp-server',
        siteName: 'Superkabe',
        type: 'article',
    },
};

function Code({ children, lang = 'json' }: { children: string; lang?: string }) {
    const lcolor = lang === 'bash' ? 'text-blue-600' : lang === 'response' ? 'text-green-700' : 'text-gray-700';
    const bg = lang === 'response' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200';
    return (
        <div className={`${bg} border p-4 my-3 overflow-x-auto`}>
            <pre className={`text-sm ${lcolor} whitespace-pre`}>{children}</pre>
        </div>
    );
}

function Pill({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'green' | 'amber' | 'red' | 'blue' | 'purple' }) {
    const tones: Record<string, string> = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return <span className={`inline-block px-2 py-0.5 text-xs font-semibold border ${tones[tone]}`}>{children}</span>;
}

export default function McpServerDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Claude (MCP Server)
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Connect any Claude surface to Superkabe via the Model Context Protocol — run leads, campaigns, validation, and replies through natural language prompts
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Two ways to connect</h3>
                <p className="text-blue-900 mb-3 text-sm">Pick the one that matches your Claude surface:</p>
                <ul className="space-y-2 text-sm text-blue-900">
                    <li><strong>Claude.ai (browser):</strong> Remote MCP via OAuth. No install. Paste a URL into Settings → Integrations → Add Integration. Skip to <a href="#claude-ai" className="underline">§ 1</a>.</li>
                    <li><strong>Claude Desktop / Claude Code / Cursor / Continue:</strong> Local stdio process via the <code>@superkabe/mcp-server</code> npm package + your API key. Skip to <a href="#local-clients" className="underline">§ 2</a>.</li>
                </ul>
            </div>

            <h2 id="overview" className="text-3xl font-bold mb-4 mt-12 text-gray-900">Overview</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe exposes 17 tools over the Model Context Protocol — Anthropic&apos;s open standard for letting AI agents discover and call backend APIs. Once Claude is connected, you can prompt naturally:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 my-4">
                <p className="text-sm italic text-gray-700 m-0">&quot;Import these 200 leads, validate their emails, create a 3-step sequence targeting SaaS founders, and launch it through my Outlook mailboxes.&quot;</p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
                Claude chains the right tools (<code>import_leads</code> → <code>validate_leads</code> → <code>get_validation_results</code> → <code>create_campaign</code> → <code>launch_campaign</code>), reads the results between steps, and executes. No Superkabe UI required for the workflow itself.
            </p>

            <h2 id="claude-ai" className="text-3xl font-bold mb-4 mt-12 text-gray-900">1. Claude.ai (browser)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Claude.ai connects to remote MCP servers over HTTPS using <strong>OAuth 2.0 with Dynamic Client Registration (RFC 7591) and PKCE (RFC 7636)</strong>. Superkabe runs an OAuth authorization server alongside the MCP endpoint at <code>api.superkabe.com</code>, so the entire connection is handled in-browser through a consent flow — no API key copy/paste, no install.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Add the integration</h3>
            <ol className="space-y-3 text-gray-600 list-decimal list-inside mb-6">
                <li>Open <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">claude.ai</a> → <strong>Settings</strong> → <strong>Integrations</strong> → <strong>Add Integration</strong>.</li>
                <li>Paste this URL:</li>
            </ol>
            <Code lang="bash">{`https://api.superkabe.com/mcp`}</Code>
            <ol className="space-y-3 text-gray-600 list-decimal list-inside mt-4 mb-6" start={3}>
                <li>Claude.ai opens a popup to Superkabe&apos;s consent screen.</li>
                <li>Sign in to your Superkabe account if you aren&apos;t already.</li>
                <li>Review the requested scopes and click <strong>Authorize</strong>. The 17 Superkabe tools become available in any Claude conversation.</li>
            </ol>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-6">
                <h3 className="font-bold text-amber-900 text-base mb-2">Heads-up</h3>
                <p className="text-sm text-amber-900 m-0">Custom integrations are gated to paid Claude.ai plans (Pro / Team / Enterprise). Free accounts can use the local-clients path in <a href="#local-clients" className="underline">§ 2</a> instead.</p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What happens behind the scenes</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
                When Claude.ai first calls <code>POST /mcp</code> without auth:
            </p>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside mb-6">
                <li>Superkabe returns <code>401</code> with <code>WWW-Authenticate: Bearer resource_metadata=&quot;…/.well-known/oauth-protected-resource/mcp&quot;</code>.</li>
                <li>Claude.ai fetches that metadata and discovers our authorization server.</li>
                <li>Claude.ai fetches <code>/.well-known/oauth-authorization-server</code> for the auth endpoints.</li>
                <li>Claude.ai POSTs to <code>/register</code> (Dynamic Client Registration) — no manual app registration required.</li>
                <li>Claude.ai redirects you to <code>/authorize</code>, which bounces to <code>/oauth/consent</code> on superkabe.com.</li>
                <li>You log in, click Authorize. Superkabe returns an authorization code to claude.ai.</li>
                <li>Claude.ai exchanges the code for an access token at <code>/token</code> (with PKCE verifier).</li>
                <li>From here on, every <code>/mcp</code> call carries <code>Authorization: Bearer oat_…</code>.</li>
            </ol>
            <p className="text-gray-600 leading-relaxed mb-4">
                Access tokens expire after 1 hour. Refresh tokens are valid for 90 days. Claude.ai refreshes silently — you only see the consent screen the first time you connect.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Verify the connection</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
                Once authorized, the dashboard <a href="/dashboard/integrations" className="text-blue-600 hover:underline">Integrations</a> page shows the Claude card as <Pill tone="green">Connected</Pill>. The same status comes from <code>GET /api/oauth/connections</code> — see <a href="#api-reference" className="text-blue-600 hover:underline">§ 5</a>.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Disconnect</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
                <a href="/dashboard/integrations" className="text-blue-600 hover:underline">Dashboard → Integrations</a> → Claude card → <strong>Manage</strong> → <strong>Disconnect</strong>. Revokes all tokens for that client immediately. Claude.ai will prompt you to re-authorize on next use. See <a href="/docs/disconnecting" className="text-blue-600 hover:underline">Disconnecting Integrations</a> for details.
            </p>

            <h2 id="local-clients" className="text-3xl font-bold mb-4 mt-12 text-gray-900">2. Local clients (Desktop, Code, Cursor)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Claude Desktop, Claude Code (CLI), Cursor, and Continue spawn the MCP server as a <strong>local stdio process</strong> on your machine. Authentication is a Superkabe API key in the <code>env</code> block of your client config — same key you&apos;d use for the REST API.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Generate an API key</h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside mb-4">
                <li>Open <a href="/dashboard/api-mcp" className="text-blue-600 hover:underline">Dashboard → API &amp; MCP</a>.</li>
                <li>Click <strong>Create new key</strong>. Give it a name (e.g. &quot;Claude Desktop on laptop&quot;).</li>
                <li>Tick the scopes you want Claude to have. Read-only set: <code>account:read leads:read campaigns:read mailboxes:read domains:read replies:read validation:read reports:read</code>.</li>
                <li>Copy the key (<code>sk_live_…</code>). It&apos;s shown once — store it somewhere secure.</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Configure your client</h3>
            <p className="text-gray-600 leading-relaxed mb-3">Same JSON shape across every client — only the file path differs:</p>
            <Code>{`{
  "mcpServers": {
    "superkabe": {
      "command": "npx",
      "args": ["-y", "@superkabe/mcp-server"],
      "env": {
        "SUPERKABE_API_KEY": "sk_live_your_key_here",
        "SUPERKABE_API_URL": "https://api.superkabe.com"
      }
    }
  }
}`}</Code>

            <p className="text-gray-600 leading-relaxed mb-2">Where to put it:</p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 text-sm">
                <table className="w-full text-left text-gray-700">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="pb-2 pr-4 font-semibold">Client</th>
                            <th className="pb-2 font-semibold">Config path</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="py-1.5 pr-4">Claude Desktop (macOS)</td><td className="py-1.5"><code className="text-xs">~/Library/Application Support/Claude/claude_desktop_config.json</code></td></tr>
                        <tr><td className="py-1.5 pr-4">Claude Desktop (Windows)</td><td className="py-1.5"><code className="text-xs">%APPDATA%\Claude\claude_desktop_config.json</code></td></tr>
                        <tr><td className="py-1.5 pr-4">Claude Desktop (Linux)</td><td className="py-1.5"><code className="text-xs">~/.config/Claude/claude_desktop_config.json</code></td></tr>
                        <tr><td className="py-1.5 pr-4">Claude Code</td><td className="py-1.5"><code className="text-xs">~/.claude/settings.json</code> (under <code>mcpServers</code>) or per-project <code>.mcp.json</code></td></tr>
                        <tr><td className="py-1.5 pr-4">Cursor</td><td className="py-1.5"><code className="text-xs">~/.cursor/mcp.json</code> (global) or per-project</td></tr>
                        <tr><td className="py-1.5 pr-4">Continue</td><td className="py-1.5"><code className="text-xs">&lt;project&gt;/.continue/config.json</code> under <code>mcpServers</code></td></tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">Restart your client. Look for a <em>tools</em> indicator (Claude Desktop shows a hammer icon, Cursor shows the connector count). 17 Superkabe tools should be available.</p>

            <div className="bg-red-50 border border-red-200 p-6 mb-6">
                <h3 className="font-bold text-red-900 text-base mb-2">Never put the API key in args[]</h3>
                <p className="text-sm text-red-900 m-0">It will leak into <code>ps aux</code> and OS process lists. Always use the <code>env</code> block.</p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">First prompt</h3>
            <p className="text-gray-600 leading-relaxed mb-2">Try one of these to confirm the connection:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-6">
                <li>&quot;List my campaigns and tell me which mailboxes are in healing.&quot;</li>
                <li>&quot;Show me all replies from the last 24 hours and flag anything that looks positive.&quot;</li>
                <li>&quot;If any campaign has a bounce rate above 2%, pause it.&quot;</li>
            </ul>

            <h2 id="tools" className="text-3xl font-bold mb-4 mt-12 text-gray-900">3. The 17 tools</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every tool maps 1:1 to a v1 REST endpoint and is gated by a specific scope on your API key (or OAuth grant). Grant the minimum.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-sm overflow-x-auto">
                <table className="w-full text-left text-gray-700">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="pb-2 pr-4 font-semibold">Tool</th>
                            <th className="pb-2 pr-4 font-semibold">Risk</th>
                            <th className="pb-2 pr-4 font-semibold">Scope</th>
                            <th className="pb-2 font-semibold">What it does</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        <tr><td className="py-1.5 pr-4"><code>get_account</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>account:read</code></td><td className="py-1.5">Plan, usage counts, tier limits.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>import_leads</code></td><td className="py-1.5 pr-4"><Pill tone="amber">medium</Pill></td><td className="py-1.5 pr-4"><code>leads:write</code></td><td className="py-1.5">Bulk import (max 5,000).</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>list_leads</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>leads:read</code></td><td className="py-1.5">Paginated list with filters.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>get_lead</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>leads:read</code></td><td className="py-1.5">Single lead with validation + engagement history.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>validate_leads</code></td><td className="py-1.5 pr-4"><Pill tone="amber">medium</Pill></td><td className="py-1.5 pr-4"><code>validation:trigger</code></td><td className="py-1.5">Async validate by lead IDs or emails.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>get_validation_results</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>validation:read</code></td><td className="py-1.5">Org-wide breakdown by status.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>create_campaign</code></td><td className="py-1.5 pr-4"><Pill tone="red">high</Pill></td><td className="py-1.5 pr-4"><code>campaigns:write</code></td><td className="py-1.5">Sequencer campaign with steps + variants + schedule.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>list_campaigns</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>campaigns:read</code></td><td className="py-1.5">All campaigns with status, lead/step counts.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>get_campaign</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>campaigns:read</code></td><td className="py-1.5">Full campaign incl. steps, variants, first 100 leads.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>update_campaign</code></td><td className="py-1.5 pr-4"><Pill tone="red">high</Pill></td><td className="py-1.5 pr-4"><code>campaigns:write</code></td><td className="py-1.5">Edit name / schedule / daily limit. Paused or draft only.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>launch_campaign</code></td><td className="py-1.5 pr-4"><Pill tone="red">high</Pill></td><td className="py-1.5 pr-4"><code>campaigns:write</code></td><td className="py-1.5"><strong>Starts real sends.</strong></td></tr>
                        <tr><td className="py-1.5 pr-4"><code>pause_campaign</code></td><td className="py-1.5 pr-4"><Pill tone="amber">medium</Pill></td><td className="py-1.5 pr-4"><code>campaigns:write</code></td><td className="py-1.5">Stop sending on an active campaign.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>get_campaign_report</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>reports:read</code></td><td className="py-1.5">Sent / replies / reply-rate / status breakdown.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>get_campaign_replies</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>replies:read</code></td><td className="py-1.5">Inbound replies (last 100 threads).</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>send_reply</code></td><td className="py-1.5 pr-4"><Pill tone="red">high</Pill></td><td className="py-1.5 pr-4"><code>replies:send</code></td><td className="py-1.5"><strong>Sends a real email</strong> from the original mailbox.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>list_mailboxes</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>mailboxes:read</code></td><td className="py-1.5">Health, send/bounce counts, warmup, recovery phase.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>list_domains</code></td><td className="py-1.5 pr-4"><Pill tone="gray">low</Pill></td><td className="py-1.5 pr-4"><code>domains:read</code></td><td className="py-1.5">Health, bounce-rate trends, engagement, recovery phase.</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 id="security" className="text-3xl font-bold mb-4 mt-12 text-gray-900">4. Security model</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Per-grant org scoping.</strong> Every OAuth access token and API key is tied to one organization. Cross-tenant access is structurally impossible — there&apos;s no &quot;super-key&quot; that crosses orgs.</li>
                <li><strong>Hashed at rest.</strong> Both <code>sk_live_…</code> API keys and <code>oat_…</code> OAuth tokens are stored only as SHA-256 hashes. The plaintext value is shown to the user once at creation and never again.</li>
                <li><strong>Scope-gated tools.</strong> The MCP server attempts every tool, but the backend rejects calls whose scope isn&apos;t on the bearer token. Read-only keys can&apos;t create campaigns even if Claude tries.</li>
                <li><strong>Short-lived OAuth tokens.</strong> Access tokens expire after 1 hour; refresh tokens after 90 days. Revocation via <code>POST /revoke</code> or the dashboard is immediate.</li>
                <li><strong>PKCE-only OAuth.</strong> All OAuth clients are public clients with PKCE — no client secrets shipped to claude.ai or any other browser-resident integration.</li>
                <li><strong>Stateless transport.</strong> The HTTP MCP endpoint (<code>/mcp</code>) holds no per-session state — every request is independently authenticated, no session hijack surface.</li>
                <li><strong>Stdio opens no ports.</strong> Local clients spawn the npm package as a subprocess that talks over stdin/stdout. Compromise requires local process access.</li>
            </ul>

            <h2 id="api-reference" className="text-3xl font-bold mb-4 mt-12 text-gray-900">5. API reference (OAuth + connections)</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Discovery</h3>
            <Code lang="bash">{`GET https://api.superkabe.com/.well-known/oauth-authorization-server
GET https://api.superkabe.com/.well-known/oauth-protected-resource/mcp`}</Code>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">OAuth endpoints</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4 text-sm">
                <li><code>POST /register</code> — Dynamic Client Registration (RFC 7591). Returns <code>client_id</code>; no secret (PKCE).</li>
                <li><code>GET /authorize</code> — kicks off the consent flow. Redirects to <code>/oauth/consent</code> on superkabe.com.</li>
                <li><code>POST /token</code> — exchanges authorization code for access + refresh tokens. Also handles refresh-token grant.</li>
                <li><code>POST /revoke</code> — revokes a single token (access or refresh).</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">List active connections</h3>
            <Code lang="bash">{`GET https://api.superkabe.com/api/oauth/connections
Authorization: Bearer sk_live_…  # or any auth — JWT cookie also works`}</Code>
            <p className="text-gray-600 leading-relaxed mb-3">Response:</p>
            <Code lang="response">{`[
  {
    "client_id": "mcp_client_a4cce2cca6baf67e084ef681",
    "client_name": "Claude",
    "client_uri": null,
    "logo_uri": null,
    "scopes": ["account:read", "leads:read", "leads:write", "campaigns:read", "campaigns:write", ...],
    "granted_at": "2026-04-29T10:43:24.000Z",
    "last_used_at": "2026-04-29T11:02:08.000Z",
    "access_token_expires_at": "2026-04-29T12:02:08.000Z",
    "refresh_expires_at": "2026-07-28T10:43:24.000Z"
  }
]`}</Code>
            <p className="text-gray-600 leading-relaxed mb-3">Powers the &quot;Connected&quot; status on the Integrations page. One row per distinct OAuth client tied to your org with at least one non-revoked, non-expired grant. Refresh-token rotation is deduped by <code>client_id</code>.</p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Revoke connections</h3>
            <Code lang="bash">{`POST https://api.superkabe.com/api/oauth/connections/revoke
Authorization: Bearer <jwt-or-api-key>
Content-Type: application/json

{ "client_id": "mcp_client_a4cce2cca6baf67e084ef681" }`}</Code>
            <p className="text-gray-600 leading-relaxed mb-3">
                Marks every access &amp; refresh token for that <code>(org, client)</code> pair as revoked. Effective immediately — claude.ai will get 401 on next call. Omit <code>client_id</code> to revoke <em>all</em> OAuth grants for the org at once.
            </p>

            <h2 id="troubleshooting" className="text-3xl font-bold mb-4 mt-12 text-gray-900">6. Troubleshooting</h2>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 text-sm overflow-x-auto">
                <table className="w-full text-left text-gray-700">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="pb-2 pr-4 font-semibold">Symptom</th>
                            <th className="pb-2 pr-4 font-semibold">Likely cause</th>
                            <th className="pb-2 font-semibold">Fix</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        <tr><td className="py-1.5 pr-4">claude.ai &quot;Couldn&apos;t reach the MCP server&quot;</td><td className="py-1.5 pr-4">Free Claude.ai plan or transient handshake failure</td><td className="py-1.5">Verify you&apos;re on Pro/Team/Enterprise; remove and re-add the integration.</td></tr>
                        <tr><td className="py-1.5 pr-4">Tools icon never appears (Desktop / Cursor)</td><td className="py-1.5 pr-4">Bad JSON or wrong config path</td><td className="py-1.5"><code>jq . &lt;config&gt;</code> to validate; quit &amp; relaunch the client.</td></tr>
                        <tr><td className="py-1.5 pr-4">Stdio: <code>FATAL: SUPERKABE_API_KEY required</code></td><td className="py-1.5 pr-4">Env not passed to subprocess</td><td className="py-1.5">Put key under <code>env</code>, not <code>args</code>.</td></tr>
                        <tr><td className="py-1.5 pr-4">All tool calls return 401</td><td className="py-1.5 pr-4">Key revoked / wrong env</td><td className="py-1.5">Reissue key; check <code>SUPERKABE_API_URL</code>.</td></tr>
                        <tr><td className="py-1.5 pr-4">Some tools return &quot;Missing required scope&quot;</td><td className="py-1.5 pr-4">Key/token lacks that scope</td><td className="py-1.5">Edit key in dashboard or re-authorize claude.ai with broader scopes.</td></tr>
                        <tr><td className="py-1.5 pr-4"><code>ECONNREFUSED 127.0.0.1:4000</code></td><td className="py-1.5 pr-4">Default URL used; no local backend</td><td className="py-1.5">Set <code>SUPERKABE_API_URL=https://api.superkabe.com</code>.</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Verbose logs (stdio)</h3>
            <Code lang="bash">{`# Claude Desktop (macOS)
tail -f "$HOME/Library/Logs/Claude/mcp-server-superkabe.log"

# Claude Desktop (Windows)
Get-Content -Wait "$env:APPDATA\\Claude\\Logs\\mcp-server-superkabe.log"

# Cursor
tail -f "$HOME/.cursor/logs/mcp-server-superkabe.log"

# Verbose Node HTTP tracing
NODE_DEBUG=http,https SUPERKABE_API_KEY=… npx @superkabe/mcp-server`}</Code>

            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li><a href="/docs/api-documentation" className="text-blue-600 hover:text-blue-700 font-medium">→ REST API v1 reference</a></li>
                    <li><a href="/docs/disconnecting" className="text-blue-600 hover:text-blue-700 font-medium">→ Disconnecting integrations</a></li>
                    <li><a href="/dashboard/api-mcp" className="text-blue-600 hover:text-blue-700 font-medium">→ Generate an API key</a></li>
                    <li><a href="/dashboard/integrations" className="text-blue-600 hover:text-blue-700 font-medium">→ Integrations dashboard</a></li>
                </ul>
            </div>
        </div>
    );
}

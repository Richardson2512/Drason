import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'MCP Server | Superkabe Docs',
 description: 'Connect Claude Desktop or any Model Context Protocol client to Superkabe. Full reference for installation, configuration, security, and every one of the 16 exposed tools.',
 alternates: { canonical: '/docs/mcp-server' },
 openGraph: {
 title: 'MCP Server | Superkabe Docs',
 description: 'Connect Claude Desktop or any Model Context Protocol client to Superkabe. Full reference for installation, configuration, security, and every one of the 16 exposed tools.',
 url: '/docs/mcp-server',
 siteName: 'Superkabe',
 type: 'article',
 },
};

// ─────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────
// SVG diagrams
// ─────────────────────────────────────────────────────────────────────

function ArchDiagram() {
 return (
 <figure className="my-8">
 <svg viewBox="0 0 760 320" className="w-full h-auto bg-white border border-gray-200 p-4">
 <defs>
 <marker id="mcp-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
 <path d="M0,0 L10,5 L0,10 z" fill="#6B7280" />
 </marker>
 </defs>

 {/* Claude Desktop */}
 <rect x="20" y="40" width="180" height="240" rx="12" fill="#FDF4FF" stroke="#A855F7" strokeWidth="1.5" />
 <text x="110" y="70" textAnchor="middle" fontFamily="system-ui" fontSize="14" fontWeight="700" fill="#6B21A8">Claude Desktop</text>
 <text x="110" y="88" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#9333EA">(or any MCP client)</text>

 <rect x="40" y="110" width="140" height="40" rx="6" fill="#FFFFFF" stroke="#C084FC" />
 <text x="110" y="135" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#7C3AED">Claude model</text>

 <rect x="40" y="170" width="140" height="40" rx="6" fill="#FFFFFF" stroke="#C084FC" />
 <text x="110" y="195" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#7C3AED">tool_use / tool_result</text>

 <rect x="40" y="230" width="140" height="35" rx="6" fill="#FFFFFF" stroke="#C084FC" />
 <text x="110" y="252" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#7C3AED">MCP client (stdio)</text>

 {/* MCP server */}
 <rect x="260" y="90" width="220" height="140" rx="12" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
 <text x="370" y="120" textAnchor="middle" fontFamily="system-ui" fontSize="14" fontWeight="700" fill="#065F46">Superkabe MCP Server</text>
 <text x="370" y="138" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#047857">Node.js subprocess</text>
 <text x="370" y="165" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#065F46">@modelcontextprotocol/sdk</text>
 <text x="370" y="183" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#065F46">16 registered tools</text>
 <text x="370" y="201" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#065F46">StdioServerTransport</text>

 {/* Superkabe API */}
 <rect x="540" y="40" width="200" height="100" rx="12" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
 <text x="640" y="70" textAnchor="middle" fontFamily="system-ui" fontSize="14" fontWeight="700" fill="#1E40AF">Superkabe API v1</text>
 <text x="640" y="88" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#3B82F6">api.superkabe.com</text>
 <text x="640" y="112" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#2563EB">Bearer SUPERKABE_API_KEY</text>

 {/* Platform */}
 <rect x="540" y="180" width="200" height="100" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
 <text x="640" y="210" textAnchor="middle" fontFamily="system-ui" fontSize="14" fontWeight="700" fill="#92400E">Superkabe platform</text>
 <text x="640" y="232" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">Postgres · Redis · BullMQ</text>
 <text x="640" y="250" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">Sequencer + protection</text>

 {/* Arrows */}
 <line x1="200" y1="160" x2="255" y2="160" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#mcp-arr)" />
 <text x="215" y="152" fontFamily="system-ui" fontSize="10" fill="#6B7280">stdio</text>

 <line x1="480" y1="140" x2="535" y2="110" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#mcp-arr)" />
 <text x="495" y="115" fontFamily="system-ui" fontSize="10" fill="#6B7280">HTTPS</text>

 <line x1="640" y1="140" x2="640" y2="175" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#mcp-arr)" />
 </svg>
 <figcaption className="text-xs text-gray-500 text-center mt-2">Fig 1. The MCP server is a thin Node.js subprocess spawned by the MCP client. It translates JSON-RPC tool calls over stdio into authenticated HTTPS calls against the Superkabe v1 API.</figcaption>
 </figure>
 );
}

function ToolCallDiagram() {
 return (
 <figure className="my-8">
 <svg viewBox="0 0 760 280" className="w-full h-auto bg-white border border-gray-200 p-4">
 <defs>
 <marker id="tool-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
 <path d="M0,0 L10,5 L0,10 z" fill="#6B7280" />
 </marker>
 </defs>

 {/* lifelines */}
 {[
 { x: 80, label: 'User' },
 { x: 240, label: 'Claude' },
 { x: 400, label: 'MCP Server' },
 { x: 560, label: 'Superkabe API' },
 { x: 700, label: 'Postgres' },
 ].map(l => (
 <g key={l.label}>
 <rect x={l.x - 50} y="20" width="100" height="30" rx="6" fill="#F1F5F9" stroke="#64748B" />
 <text x={l.x} y="40" textAnchor="middle" fontFamily="system-ui" fontSize="11" fontWeight="600" fill="#0F172A">{l.label}</text>
 <line x1={l.x} y1="50" x2={l.x} y2="260" stroke="#CBD5E1" strokeDasharray="3 3" />
 </g>
 ))}

 {/* messages */}
 <line x1="80" y1="75" x2="240" y2="75" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#tool-arr)" />
 <text x="160" y="70" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#6B7280">&quot;list my active campaigns&quot;</text>

 <line x1="240" y1="105" x2="400" y2="105" stroke="#8B5CF6" strokeWidth="1.5" markerEnd="url(#tool-arr)" />
 <text x="320" y="100" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#8B5CF6">tool_use: list_campaigns</text>

 <line x1="400" y1="135" x2="560" y2="135" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#tool-arr)" />
 <text x="480" y="130" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#059669">GET /api/v1/campaigns</text>

 <line x1="560" y1="165" x2="700" y2="165" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#tool-arr)" />
 <text x="630" y="160" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#2563EB">SELECT ... WHERE org_id</text>

 <line x1="700" y1="190" x2="560" y2="190" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#tool-arr)" strokeDasharray="4 2" />
 <line x1="560" y1="215" x2="400" y2="215" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#tool-arr)" strokeDasharray="4 2" />
 <text x="480" y="210" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#059669">{"{ success, data: [...] }"}</text>

 <line x1="400" y1="245" x2="240" y2="245" stroke="#8B5CF6" strokeWidth="1.5" markerEnd="url(#tool-arr)" strokeDasharray="4 2" />
 <text x="320" y="240" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#8B5CF6">tool_result (text/JSON)</text>
 </svg>
 <figcaption className="text-xs text-gray-500 text-center mt-2">Fig 2. A single tool call traverses four hops: user &rarr; Claude &rarr; MCP server &rarr; Superkabe API &rarr; Postgres. Response travels back the same path.</figcaption>
 </figure>
 );
}

// ─────────────────────────────────────────────────────────────────────
// Tool reference block
// ─────────────────────────────────────────────────────────────────────

type ToolRef = {
 name: string;
 title: string;
 scope: string;
 risk: 'low' | 'medium' | 'high';
 description: string;
 inputs?: { name: string; type: string; required?: boolean; description: string }[];
 returns: string;
};

const TOOLS: ToolRef[] = [
 {
 name: 'get_account',
 title: 'Get Account Info',
 scope: 'account:read',
 risk: 'low',
 description: 'Returns organization name, subscription tier, status, usage counters, and plan limits. Claude usually calls this first to understand what the user can and cannot do.',
 returns: 'Object with id, name, slug, tier, status, usage{leads,domains,mailboxes}, limits{leads,domains,mailboxes,monthly_sends,validation_credits}.',
 },
 {
 name: 'import_leads',
 title: 'Import Leads',
 scope: 'leads:write',
 risk: 'medium',
 description: 'Import up to 5,000 leads in a single call. Duplicates by email are detected and skipped. New leads enter with status `held` and must go through validation before they can be routed.',
 inputs: [
 { name: 'leads', type: 'array', required: true, description: 'Array of lead objects. Each must have `email` (required). Optional fields: `persona`, `source`, `lead_score` (0-100, default 50).' },
 ],
 returns: 'Object with total, created, duplicates, errors, and per-row results[{email,id,status,error?}].',
 },
 {
 name: 'list_leads',
 title: 'List Leads',
 scope: 'leads:read',
 risk: 'low',
 description: 'Paginated list of leads with filters. Use this after import to inspect validation_status or emails_sent / emails_replied stats.',
 inputs: [
 { name: 'page', type: 'number', description: 'Page number (default 1).' },
 { name: 'limit', type: 'number', description: 'Results per page, 1-100, default 50.' },
 { name: 'status', type: 'string', description: 'held · active · paused · blocked' },
 { name: 'validation_status', type: 'string', description: 'valid · risky · invalid · unknown · pending' },
 { name: 'search', type: 'string', description: 'Case-insensitive email substring match.' },
 ],
 returns: 'Object with data[] and meta{total,page,limit,totalPages}.',
 },
 {
 name: 'get_lead',
 title: 'Get Lead Details',
 scope: 'leads:read',
 risk: 'low',
 description: 'Full Lead row by ID, including validation score, catch-all / disposable flags, and engagement counters.',
 inputs: [{ name: 'lead_id', type: 'string', required: true, description: 'Lead ID.' }],
 returns: 'Full Lead object.',
 },
 {
 name: 'validate_leads',
 title: 'Validate Lead Emails',
 scope: 'validation:trigger',
 risk: 'medium',
 description: 'Queues validation on existing leads. Asynchronous — poll `list_leads` to see the updated `validation_status`. Consumes validation credits (one per unique non-cached domain).',
 inputs: [
 { name: 'lead_ids', type: 'string[]', description: 'Lead IDs to validate (either this or emails).' },
 { name: 'emails', type: 'string[]', description: 'Emails to validate — must already exist in Superkabe.' },
 ],
 returns: 'Object with queued count, lead_ids, and a polling hint.',
 },
 {
 name: 'get_validation_results',
 title: 'Get Validation Analytics',
 scope: 'validation:read',
 risk: 'low',
 description: 'Organization-wide validation rollup: total validated leads, breakdown by status.',
 returns: 'Object with total_validated and status_breakdown{valid,risky,invalid,unknown}.',
 },
 {
 name: 'create_campaign',
 title: 'Create Campaign',
 scope: 'campaigns:write',
 risk: 'high',
 description: 'Creates a native-sequencer campaign in `draft` status with sequence steps, optional A/B variants, and optional initial leads. Assigned leads pass through the health gate — RED leads are excluded, YELLOW enter as paused, GREEN as active.',
 inputs: [
 { name: 'name', type: 'string', required: true, description: 'Campaign name.' },
 { name: 'steps', type: 'array', required: true, description: 'Sequence steps. Each has subject, body_html, optional body_text, delay_days, delay_hours, and variants[].' },
 { name: 'lead_ids', type: 'string[]', description: 'Lead IDs to assign. Runs through the health gate.' },
 { name: 'schedule', type: 'object', description: 'timezone (IANA), start_time, end_time, days[], daily_limit, send_gap_minutes.' },
 ],
 returns: 'Object with id, name, status, steps_count, leads_assigned, leads_blocked.',
 },
 {
 name: 'list_campaigns',
 title: 'List Campaigns',
 scope: 'campaigns:read',
 risk: 'low',
 description: 'Lists every native-sequencer campaign in the org with status, lead/step counts, and schedule metadata.',
 returns: 'Array of campaign summaries.',
 },
 {
 name: 'get_campaign',
 title: 'Get Campaign Details',
 scope: 'campaigns:read',
 risk: 'low',
 description: 'Full campaign with every sequence step (and variants) plus the first 100 assigned leads.',
 inputs: [{ name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID.' }],
 returns: 'Campaign object with steps[].variants[] and leads[].',
 },
 {
 name: 'update_campaign',
 title: 'Update Campaign',
 scope: 'campaigns:write',
 risk: 'high',
 description: 'Updates name, daily_limit, send_gap_minutes, or schedule fields. Returns 400 if the campaign is currently `active` — pause first, update, then launch again.',
 inputs: [
 { name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID.' },
 { name: 'name', type: 'string', description: 'New name.' },
 { name: 'daily_limit', type: 'number', description: 'New per-mailbox daily send limit.' },
 { name: 'schedule_timezone', type: 'string', description: 'IANA TZ.' },
 { name: 'schedule_start_time', type: 'string', description: 'HH:MM, e.g. 09:00.' },
 { name: 'schedule_end_time', type: 'string', description: 'HH:MM, e.g. 17:00.' },
 { name: 'schedule_days', type: 'string[]', description: 'e.g. ["mon","tue","wed","thu","fri"].' },
 ],
 returns: 'Object with id, name, status.',
 },
 {
 name: 'launch_campaign',
 title: 'Launch Campaign',
 scope: 'campaigns:write',
 risk: 'high',
 description: 'Flips status to `active` and stamps `launched_at`. Requires at least 1 step and 1 assigned lead. The send-queue dispatcher picks up the campaign on its next 60s tick.',
 inputs: [{ name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID to launch.' }],
 returns: 'Object with id, status, leads, steps.',
 },
 {
 name: 'pause_campaign',
 title: 'Pause Campaign',
 scope: 'campaigns:write',
 risk: 'high',
 description: 'Flips status to `paused`. Safe to call repeatedly; returns 400 if the campaign is not currently `active`.',
 inputs: [{ name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID to pause.' }],
 returns: 'Object with id and status.',
 },
 {
 name: 'get_campaign_report',
 title: 'Get Campaign Report',
 scope: 'reports:read',
 risk: 'low',
 description: 'Aggregate performance metrics: total leads, lead_status_breakdown, emails_sent, replies, and reply_rate.',
 inputs: [{ name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID.' }],
 returns: 'Report object.',
 },
 {
 name: 'get_campaign_replies',
 title: 'Get Campaign Replies',
 scope: 'replies:read',
 risk: 'low',
 description: 'Up to the 100 most recently replied-on threads. Each thread carries the latest inbound message (subject, body_text, received_at). Returned `thread_id` is the handle for `send_reply`.',
 inputs: [{ name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID.' }],
 returns: 'Object with total_replies and replies[].',
 },
 {
 name: 'send_reply',
 title: 'Send Reply',
 scope: 'replies:send',
 risk: 'high',
 description: 'Sends an outbound message on an existing thread through the mailbox that originally received it. Requires the mailbox to have `connection_status = active`. This sends a real email — get explicit user confirmation first.',
 inputs: [
 { name: 'thread_id', type: 'string', required: true, description: 'Thread to reply to (from get_campaign_replies).' },
 { name: 'body_html', type: 'string', description: 'HTML body.' },
 { name: 'body_text', type: 'string', description: 'Plain-text fallback (used if body_html omitted).' },
 ],
 returns: 'Object with message_id, thread_id, from, to, status.',
 },
 {
 name: 'list_mailboxes',
 title: 'List Mailboxes',
 scope: 'mailboxes:read',
 risk: 'low',
 description: 'Every connected sending account with health status, send counters, bounce counters, warmup reputation, and recovery phase. Useful for infrastructure audits.',
 returns: 'Array of mailbox summaries.',
 },
 {
 name: 'list_domains',
 title: 'List Domains',
 scope: 'domains:read',
 risk: 'low',
 description: 'Every sending domain with lifetime engagement totals, bounce-rate trend, warning_count, resilience_score, and recovery phase.',
 returns: 'Array of domain summaries.',
 },
];

function Tool({ tool, idx }: { tool: ToolRef; idx: number }) {
 const riskTone = tool.risk === 'high' ? 'red' : tool.risk === 'medium' ? 'amber' : 'green';
 return (
 <section id={`tool-${tool.name}`} className="bg-white border border-gray-200 p-6 mb-6 shadow-sm scroll-mt-28">
 <div className="flex flex-wrap items-center gap-3 mb-3">
 <span className="text-xs font-mono text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
 <h3 className="text-xl font-bold text-gray-900 m-0">
 <code className="text-blue-600">{tool.name}</code>
 </h3>
 <span className="text-sm text-gray-500">— {tool.title}</span>
 <Pill tone={riskTone}>risk: {tool.risk}</Pill>
 <Pill tone="gray">scope: {tool.scope}</Pill>
 </div>
 <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

 {tool.inputs && tool.inputs.length > 0 && (
 <>
 <h4 className="text-sm font-bold text-gray-700 mb-2">Inputs</h4>
 <div className="bg-gray-50 border border-gray-200 overflow-hidden mb-4">
 <table className="w-full text-sm">
 <thead className="bg-gray-100">
 <tr>
 <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
 <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
 <th className="px-3 py-2 text-left font-semibold text-gray-700">Req?</th>
 <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {tool.inputs.map(i => (
 <tr key={i.name}>
 <td className="px-3 py-2 font-mono text-blue-600">{i.name}</td>
 <td className="px-3 py-2 font-mono text-gray-600">{i.type}</td>
 <td className="px-3 py-2">{i.required ? <Pill tone="red">yes</Pill> : <span className="text-gray-400 text-xs">no</span>}</td>
 <td className="px-3 py-2 text-gray-600">{i.description}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </>
 )}

 <h4 className="text-sm font-bold text-gray-700 mb-1">Returns</h4>
 <p className="text-sm text-gray-600">{tool.returns}</p>
 </section>
 );
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export default function MCPServerPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-4 text-gray-900">MCP Server <Pill tone="purple">v1.0.0</Pill></h1>
 <p className="text-xl text-gray-500 mb-8">
 Connect Claude Desktop or any Model Context Protocol (MCP) client to your Superkabe organization. Drives the full v1 API surface — 16 tools covering leads, campaigns, validation, replies, and infrastructure — through a single Node.js subprocess over stdio.
 </p>

 {/* ── Quick facts ── */}
 <div className="grid md:grid-cols-2 gap-4 mb-12">
 <div className="bg-purple-50 border border-purple-200 p-5">
 <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Server name</div>
 <code className="text-sm text-gray-800">superkabe</code>
 </div>
 <div className="bg-purple-50 border border-purple-200 p-5">
 <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Transport</div>
 <code className="text-sm text-gray-800">stdio</code>
 </div>
 <div className="bg-gray-50 border border-gray-200 p-5">
 <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Tools registered</div>
 <div className="text-sm text-gray-800">16</div>
 </div>
 <div className="bg-gray-50 border border-gray-200 p-5">
 <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">SDK</div>
 <code className="text-sm text-gray-800">@modelcontextprotocol/sdk</code>
 </div>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="what" className="text-3xl font-bold mt-12 mb-4 text-gray-900">1. What is MCP?</h2>
 <p className="text-gray-600 mb-4">
 The <a href="https://modelcontextprotocol.io" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> is an open standard for connecting AI clients (like Claude Desktop, Claude Code, Cursor, and third-party agents) to external tools, data sources, and actions through a uniform JSON-RPC contract. An MCP <em>server</em> exposes a set of tools, resources, and prompts that the client can discover and invoke on behalf of the model.
 </p>
 <p className="text-gray-600 mb-4">
 The Superkabe MCP server is a thin translation layer: it receives tool invocations from the client over stdio, turns them into authenticated HTTPS calls against <code className="px-1.5 py-0.5 bg-gray-100 ">/api/v1</code>, and returns the structured JSON response back to the model.
 </p>

 <ArchDiagram />

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="why" className="text-3xl font-bold mt-12 mb-4 text-gray-900">2. Why use it?</h2>
 <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
 <li><strong>Chat with your platform.</strong> Ask Claude Desktop &quot;which of my mailboxes have bounced in the last 24h?&quot; and let it answer from live Superkabe data.</li>
 <li><strong>Agentic workflows.</strong> Build agents in Claude Code or Cursor that plan outbound campaigns, inspect engagement, draft replies, or audit deliverability — all without hand-rolling the REST client.</li>
 <li><strong>Zero glue code.</strong> Input/output schemas are declared with Zod and auto-discovered by every MCP client. You do not write client bindings.</li>
 <li><strong>Least-privilege security.</strong> The key you hand the MCP server carries exactly the scopes you grant — nothing more. Revoke the key to revoke the agent.</li>
 </ul>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="install" className="text-3xl font-bold mt-12 mb-4 text-gray-900">3. Installation</h2>

 <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900">Prerequisites</h3>
 <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
 <li>Node.js 20 or newer</li>
 <li>A Superkabe account and an API key generated from <strong>Dashboard → API &amp; MCP</strong></li>
 <li>An MCP-compatible client — Claude Desktop, Claude Code, Cursor, Continue, or any custom runtime</li>
 </ul>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Option A — install from source (recommended during staging)</h3>
 <Code lang="bash">{`git clone https://github.com/Superkabereal/Superkabe.git superkabe
cd superkabe/mcp-server
npm install
npm run build # compiles TypeScript to dist/index.js`}</Code>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Option B — npx (once published)</h3>
 <Code lang="bash">{`# No install step — npx fetches and runs on demand
SUPERKABE_API_KEY=sk_live_... npx -y @superkabe/mcp-server`}</Code>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Sanity-check the server</h3>
 <p className="text-gray-600 mb-2">Run it directly and confirm it prints the connection line to stderr:</p>
 <Code lang="bash">{`SUPERKABE_API_KEY=sk_live_abc123 \\
SUPERKABE_API_URL=https://api.superkabe.com \\
node dist/index.js

# stderr:
# Superkabe MCP Server v1.0.0 connected (https://api.superkabe.com)`}</Code>
 <p className="text-gray-600 mb-4">The process will sit idle waiting for JSON-RPC on stdin. Ctrl-C to exit. MCP clients spawn this process automatically — you do not run it manually in normal use.</p>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="configure" className="text-3xl font-bold mt-12 mb-4 text-gray-900">4. Client configuration</h2>

 <h3 id="claude-desktop" className="text-2xl font-semibold mt-6 mb-3 text-gray-900">4.1 Claude Desktop</h3>
 <p className="text-gray-600 mb-2">Edit your Claude Desktop config file:</p>
 <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
 <li><strong>macOS:</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
 <li><strong>Windows:</strong> <code>%APPDATA%\Claude\claude_desktop_config.json</code></li>
 <li><strong>Linux:</strong> <code>~/.config/Claude/claude_desktop_config.json</code></li>
 </ul>
 <Code lang="json">{`{
 "mcpServers": {
 "superkabe": {
 "command": "node",
 "args": ["/absolute/path/to/superkabe/mcp-server/dist/index.js"],
 "env": {
 "SUPERKABE_API_KEY": "sk_live_abc123...",
 "SUPERKABE_API_URL": "https://api.superkabe.com"
 }
 }
 }
}`}</Code>
 <p className="text-gray-600 mb-4">Restart Claude Desktop. A new <em>tools</em> icon should appear in the chat — clicking it lists all 16 Superkabe tools.</p>

 <h3 id="claude-code" className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.2 Claude Code</h3>
 <p className="text-gray-600 mb-2">Two equivalent options. Same JSON shape as Claude Desktop:</p>
 <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
 <li><strong>Global:</strong> add to <code>~/.claude/settings.json</code> under an <code>mcpServers</code> key.</li>
 <li><strong>Per-project:</strong> create <code>.mcp.json</code> at the project root.</li>
 </ul>
 <Code lang="json">{`// .mcp.json (project root) or under mcpServers in ~/.claude/settings.json
{
 "mcpServers": {
 "superkabe": {
 "command": "npx",
 "args": ["-y", "@superkabe/mcp-server"],
 "env": {
 "SUPERKABE_API_KEY": "sk_live_abc123...",
 "SUPERKABE_API_URL": "https://api.superkabe.com"
 }
 }
 }
}`}</Code>
 <p className="text-gray-600 mb-4">Restart the Claude Code session. <code>/mcp</code> in the CLI lists registered servers; the Superkabe tools should appear with no further setup.</p>

 <h3 id="cursor" className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.3 Cursor</h3>
 <p className="text-gray-600 mb-2">Cursor reads MCP config from one of two locations:</p>
 <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
 <li><strong>Global:</strong> <code>~/.cursor/mcp.json</code></li>
 <li><strong>Per-project:</strong> <code>&lt;project&gt;/.cursor/mcp.json</code></li>
 </ul>
 <Code lang="json">{`// ~/.cursor/mcp.json
{
 "mcpServers": {
 "superkabe": {
 "command": "npx",
 "args": ["-y", "@superkabe/mcp-server"],
 "env": {
 "SUPERKABE_API_KEY": "sk_live_abc123...",
 "SUPERKABE_API_URL": "https://api.superkabe.com"
 }
 }
 }
}`}</Code>
 <p className="text-gray-600 mb-4">Open <em>Cursor Settings → MCP</em> to see the server status (green dot = connected). Composer agents pick up the tools automatically on next prompt.</p>

 <h3 id="continue" className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.4 Continue</h3>
 <p className="text-gray-600 mb-2">Continue reads <code>&lt;project&gt;/.continue/config.json</code>. Add an <code>mcpServers</code> entry alongside your existing config:</p>
 <Code lang="json">{`// .continue/config.json
{
 "models": [ /* your models */ ],
 "mcpServers": {
 "superkabe": {
 "command": "npx",
 "args": ["-y", "@superkabe/mcp-server"],
 "env": {
 "SUPERKABE_API_KEY": "sk_live_abc123...",
 "SUPERKABE_API_URL": "https://api.superkabe.com"
 }
 }
 }
}`}</Code>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.5 Auto-configure (any client)</h3>
 <p className="text-gray-600 mb-2">If you cloned the repo, run the bundled setup script — it detects which clients you have, prompts for your API key + URL, and writes the right JSON to the right path:</p>
 <Code lang="bash">{`cd superkabe/mcp-server
./setup.sh`}</Code>
 <p className="text-gray-600 mb-4">Re-run any time to update credentials or add another client.</p>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.6 Built from source instead of npx</h3>
 <p className="text-gray-600 mb-2">If you cloned the repo and ran <code>npm run build</code>, swap <code>command</code>/<code>args</code> for an absolute path to the compiled entry:</p>
 <Code lang="json">{`"command": "node",
"args": ["/absolute/path/to/superkabe/mcp-server/dist/index.js"],`}</Code>

 <h3 id="env" className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.7 Environment variables</h3>
 <div className="bg-white border border-gray-200 overflow-hidden mb-6 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-2 font-semibold text-gray-700">Variable</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Required</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Default</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Notes</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-600">
 <tr>
 <td className="px-4 py-3 font-mono text-blue-600">SUPERKABE_API_KEY</td>
 <td className="px-4 py-3"><Pill tone="red">yes</Pill></td>
 <td className="px-4 py-3">—</td>
 <td className="px-4 py-3">Bearer token. Server crashes at startup if missing.</td>
 </tr>
 <tr>
 <td className="px-4 py-3 font-mono text-blue-600">SUPERKABE_API_URL</td>
 <td className="px-4 py-3">no</td>
 <td className="px-4 py-3 font-mono"><code>http://localhost:4000</code></td>
 <td className="px-4 py-3">Override for staging / production. Trailing slash is stripped.</td>
 </tr>
 </tbody>
 </table>
 </div>

 <div className="bg-red-50 border border-red-200 p-5 mb-8">
 <h4 className="font-bold text-red-800 mb-2">Never put the API key in args[]</h4>
 <p className="text-sm text-gray-700">Always pass <code>SUPERKABE_API_KEY</code> through the <code>env</code> block. Keys placed in <code>args</code> show up in <code>ps aux</code> and system process lists; env vars do not.</p>
 </div>

 <h3 id="scopes" className="text-2xl font-semibold mt-8 mb-3 text-gray-900">4.8 Scope matrix — which scopes do I need?</h3>
 <p className="text-gray-600 mb-4">Each MCP tool is gated by a single API-key scope. Pick the scopes that match the tools you actually want the agent to call. The agent will receive a <code>Missing required scope</code> error for anything you didn&apos;t grant.</p>
 <div className="bg-white border border-gray-200 overflow-hidden mb-6 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-2 font-semibold text-gray-700">Tool</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Risk</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Required scope</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-600">
 <tr><td className="px-4 py-2 font-mono">get_account</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">account:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">list_leads</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">leads:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">get_lead</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">leads:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">import_leads</td><td className="px-4 py-2"><Pill tone="amber">medium</Pill></td><td className="px-4 py-2 font-mono">leads:write</td></tr>
 <tr><td className="px-4 py-2 font-mono">validate_leads</td><td className="px-4 py-2"><Pill tone="amber">medium</Pill></td><td className="px-4 py-2 font-mono">validation:trigger</td></tr>
 <tr><td className="px-4 py-2 font-mono">get_validation_results</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">validation:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">list_campaigns</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">campaigns:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">get_campaign</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">campaigns:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">create_campaign</td><td className="px-4 py-2"><Pill tone="red">high</Pill></td><td className="px-4 py-2 font-mono">campaigns:write</td></tr>
 <tr><td className="px-4 py-2 font-mono">update_campaign</td><td className="px-4 py-2"><Pill tone="red">high</Pill></td><td className="px-4 py-2 font-mono">campaigns:write</td></tr>
 <tr><td className="px-4 py-2 font-mono">launch_campaign</td><td className="px-4 py-2"><Pill tone="red">high</Pill></td><td className="px-4 py-2 font-mono">campaigns:write</td></tr>
 <tr><td className="px-4 py-2 font-mono">pause_campaign</td><td className="px-4 py-2"><Pill tone="amber">medium</Pill></td><td className="px-4 py-2 font-mono">campaigns:write</td></tr>
 <tr><td className="px-4 py-2 font-mono">get_campaign_report</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">reports:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">get_campaign_replies</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">replies:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">send_reply</td><td className="px-4 py-2"><Pill tone="red">high</Pill></td><td className="px-4 py-2 font-mono">replies:send</td></tr>
 <tr><td className="px-4 py-2 font-mono">list_mailboxes</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">mailboxes:read</td></tr>
 <tr><td className="px-4 py-2 font-mono">list_domains</td><td className="px-4 py-2"><Pill tone="green">low</Pill></td><td className="px-4 py-2 font-mono">domains:read</td></tr>
 </tbody>
 </table>
 </div>

 <h4 className="font-bold text-gray-900 mt-6 mb-2">Recommended scope bundles</h4>
 <ul className="list-disc list-inside text-gray-600 space-y-2 mb-8">
 <li><strong>Read-only analyst</strong> (11/16 tools, zero writes): <code>account:read leads:read validation:read campaigns:read reports:read replies:read mailboxes:read domains:read</code></li>
 <li><strong>Lead ops</strong> (read-only + import + validate, no campaign sends): the read-only set plus <code>leads:write validation:trigger</code></li>
 <li><strong>Full agent</strong> (all 16 tools incl. real sends): every scope above plus <code>campaigns:write replies:send</code></li>
 </ul>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-8">
 <h4 className="font-bold text-amber-900 mb-2">Use a separate key per risk tier</h4>
 <p className="text-sm text-gray-700">If you need both a read-only daily-brief agent and a full-send campaign agent, issue two separate API keys with the relevant scopes and configure them as two different MCP servers (<code>superkabe-read</code>, <code>superkabe-write</code>). Lets you revoke send capability in one click without breaking your reporting flow.</p>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="lifecycle" className="text-3xl font-bold mt-12 mb-4 text-gray-900">5. Tool call lifecycle</h2>
 <ToolCallDiagram />
 <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-8">
 <li>User asks Claude a question that requires live data.</li>
 <li>Claude chooses a registered tool and emits <code>tool_use</code> with JSON arguments.</li>
 <li>The MCP client serializes the call as JSON-RPC and writes it to the server&apos;s stdin.</li>
 <li>The server validates the arguments against the Zod schema, makes an HTTPS call to the Superkabe v1 API with <code>Authorization: Bearer $SUPERKABE_API_KEY</code>.</li>
 <li>The v1 controller enforces the relevant scope, runs the Postgres query, returns <code>{'{ success, data }'}</code>.</li>
 <li>The server wraps the response as a <code>text</code> content block (JSON-stringified) and returns it over stdio.</li>
 <li>Claude receives the <code>tool_result</code>, incorporates it into its next response.</li>
 </ol>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="security" className="text-3xl font-bold mt-12 mb-4 text-gray-900">6. Security model</h2>
 <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
 <li><strong>No ambient credentials.</strong> The server reads exactly one env var (<code>SUPERKABE_API_KEY</code>). It does not read <code>~/.aws/credentials</code>, <code>gcloud</code>, or any other system state.</li>
 <li><strong>Scoped keys.</strong> The tools the server <em>attempts</em> are defined at build time. The tools the server is <em>allowed</em> to execute are determined by the scopes on the API key you hand it. Grant the minimum.</li>
 <li><strong>Organization scoping.</strong> Every API call is automatically scoped to the key&apos;s organization by <code>orgContext</code>. The MCP server cannot leak across tenants.</li>
 <li><strong>Rate limits apply.</strong> MCP traffic is rate-limited per API key like any other client (§6 of the API documentation).</li>
 <li><strong>Stdio not sockets.</strong> The server opens no listening ports; compromise requires local process access.</li>
 <li><strong>No persistent state.</strong> The server holds only transient request context. Killing the process forgets everything.</li>
 </ul>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-8">
 <h4 className="font-bold text-amber-900 mb-2">High-risk tool warning</h4>
 <p className="text-sm text-gray-700">Tools marked <Pill tone="red">risk: high</Pill> below can mutate production state or send real emails (<code>launch_campaign</code>, <code>update_campaign</code>, <code>pause_campaign</code>, <code>create_campaign</code>, <code>send_reply</code>). Only grant the matching scope when you actively want the agent to take those actions, and prefer a dedicated key per risk tier so you can revoke narrowly.</p>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="tools" className="text-3xl font-bold mt-12 mb-4 text-gray-900">7. Tool reference</h2>
 <p className="text-gray-600 mb-6">Every tool exposed by the Superkabe MCP server, in the order it appears in <code>mcp-server/src/index.ts</code>. Each tool maps 1:1 to a v1 API endpoint — see the <a href="/docs/api-documentation" className="text-blue-600 underline">API documentation</a> for response shapes.</p>

 {/* Quick index */}
 <div className="bg-gray-50 border border-gray-200 p-5 mb-8">
 <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Tool index</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
 {TOOLS.map(t => (
 <a key={t.name} href={`#tool-${t.name}`} className="text-blue-600 hover:underline font-mono">{t.name}</a>
 ))}
 </div>
 </div>

 {TOOLS.map((t, i) => <Tool key={t.name} tool={t} idx={i} />)}

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="errors" className="text-3xl font-bold mt-12 mb-4 text-gray-900">8. Error handling</h2>
 <p className="text-gray-600 mb-4">When the v1 API returns a non-2xx status, the MCP server converts the error into a text content block and sets <code>isError: true</code> on the tool result. Example:</p>
 <Code lang="response">{`// Server returns to Claude:
{
 "content": [{ "type": "text", "text": "Error: Missing required scope: campaigns:write" }],
 "isError": true
}`}</Code>
 <p className="text-gray-600 mb-4">Common failure modes and how Claude should recover:</p>
 <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-2 font-semibold text-gray-700">Message starts with</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Root cause</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Recovery</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-600">
 <tr><td className="px-4 py-2 font-mono"><code>Missing required scope</code></td><td className="px-4 py-2">API key lacks the scope the tool needs</td><td className="px-4 py-2">Grant scope in dashboard or reissue key</td></tr>
 <tr><td className="px-4 py-2 font-mono"><code>API returned 401</code></td><td className="px-4 py-2">Key revoked or malformed</td><td className="px-4 py-2">Re-issue key, update client config</td></tr>
 <tr><td className="px-4 py-2 font-mono"><code>API returned 404</code></td><td className="px-4 py-2">Resource ID does not belong to org</td><td className="px-4 py-2">Re-read relevant list_* tool, use correct ID</td></tr>
 <tr><td className="px-4 py-2 font-mono"><code>API returned 429</code></td><td className="px-4 py-2">Rate limit exceeded</td><td className="px-4 py-2">Wait, retry with backoff</td></tr>
 <tr><td className="px-4 py-2 font-mono"><code>API returned 400</code></td><td className="px-4 py-2">Invalid input (e.g. launching a campaign with 0 leads)</td><td className="px-4 py-2">Fix the input, do not retry blindly</td></tr>
 <tr><td className="px-4 py-2 font-mono"><code>fetch failed</code></td><td className="px-4 py-2">Network error / API unreachable</td><td className="px-4 py-2">Retry once; if persistent, report to user</td></tr>
 </tbody>
 </table>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="examples" className="text-3xl font-bold mt-12 mb-4 text-gray-900">9. Example sessions</h2>

 <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900">9.1 Daily deliverability brief</h3>
 <div className="bg-gray-50 border border-gray-200 p-5 mb-6">
 <p className="text-sm text-gray-700 mb-3"><strong>User:</strong> <em>&quot;Give me a deliverability brief for today — which mailboxes are healing, which domains had bounces, what should I look at first?&quot;</em></p>
 <p className="text-sm text-gray-600"><strong>Claude calls, in order:</strong></p>
 <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
 <li><code>get_account</code> — confirm tier/limits</li>
 <li><code>list_mailboxes</code> — filter client-side to <code>recovery_phase !== null</code></li>
 <li><code>list_domains</code> — sort by <code>aggregated_bounce_rate_trend DESC</code></li>
 <li>Formats a markdown brief with the three domains most at risk and the healing mailboxes&apos; phases.</li>
 </ul>
 </div>

 <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900">9.2 Launching a net-new campaign</h3>
 <div className="bg-gray-50 border border-gray-200 p-5 mb-6">
 <p className="text-sm text-gray-700 mb-3"><strong>User:</strong> <em>&quot;Import these 200 VP-Engineering leads and launch them into a 3-step sequence targeted at technical founders. Use my Q2 template.&quot;</em></p>
 <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
 <li><code>import_leads</code> with the CSV contents</li>
 <li><code>validate_leads</code> on the returned lead IDs</li>
 <li>Wait ~10s, then <code>list_leads</code> to check <code>validation_status</code></li>
 <li><code>create_campaign</code> with the 3 steps and the valid lead IDs</li>
 <li><strong>Pause for user confirmation</strong> before calling <code>launch_campaign</code> (it triggers real sends)</li>
 </ul>
 </div>

 <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900">9.3 Reply triage</h3>
 <div className="bg-gray-50 border border-gray-200 p-5 mb-6">
 <p className="text-sm text-gray-700 mb-3"><strong>User:</strong> <em>&quot;Any hot replies on the April campaign? Draft responses for the ones that look positive.&quot;</em></p>
 <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
 <li><code>list_campaigns</code> to find the April campaign ID</li>
 <li><code>get_campaign_replies</code> to pull the last 100 threads</li>
 <li>Claude classifies sentiment client-side, drafts replies, and presents them to the user</li>
 <li>On approval, calls <code>send_reply</code> per thread (requires <code>replies:send</code> scope)</li>
 </ul>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="troubleshooting" className="text-3xl font-bold mt-12 mb-4 text-gray-900">10. Troubleshooting</h2>
 <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-2 font-semibold text-gray-700">Symptom</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Likely cause</th>
 <th className="px-4 py-2 font-semibold text-gray-700">Fix</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-600">
 <tr><td className="px-4 py-3">Tools icon does not appear in Claude Desktop</td><td className="px-4 py-3">Config path wrong or JSON invalid</td><td className="px-4 py-3">Validate JSON with <code>jq . claude_desktop_config.json</code>; quit &amp; relaunch Claude Desktop</td></tr>
 <tr><td className="px-4 py-3"><code>FATAL: SUPERKABE_API_KEY is required</code></td><td className="px-4 py-3">Env var not passed through to subprocess</td><td className="px-4 py-3">Put the key under the <code>env</code> block, not <code>args</code></td></tr>
 <tr><td className="px-4 py-3">Every tool call returns <code>API returned 401</code></td><td className="px-4 py-3">Key revoked or wrong env</td><td className="px-4 py-3">Re-issue key; confirm <code>SUPERKABE_API_URL</code> matches the key&apos;s environment</td></tr>
 <tr><td className="px-4 py-3">Some tools work, others return <code>Missing required scope</code></td><td className="px-4 py-3">Key lacks those scopes</td><td className="px-4 py-3">Edit key in dashboard (or issue a broader key)</td></tr>
 <tr><td className="px-4 py-3"><code>ECONNREFUSED 127.0.0.1:4000</code></td><td className="px-4 py-3">Default API URL used, but backend is not running locally</td><td className="px-4 py-3">Set <code>SUPERKABE_API_URL=https://api.superkabe.com</code></td></tr>
 <tr><td className="px-4 py-3">Slow tool calls (&gt; 2s for list endpoints)</td><td className="px-4 py-3">Large organization data + cold DB</td><td className="px-4 py-3">Add filters to <code>list_leads</code> (page, status); report if persistent</td></tr>
 </tbody>
 </table>
 </div>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Enable debug logging</h3>
 <p className="text-gray-600 mb-2">The server logs to stderr so MCP client logs capture it:</p>
 <Code lang="bash">{`# macOS Claude Desktop logs
tail -f "~/Library/Logs/Claude/mcp-server-superkabe.log"

# Run manually with verbose Node logs
NODE_DEBUG=http,https SUPERKABE_API_KEY=... node dist/index.js`}</Code>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="updating" className="text-3xl font-bold mt-12 mb-4 text-gray-900">11. Updating</h2>
 <p className="text-gray-600 mb-4">When new tools are added to the Superkabe MCP server you simply update the package and restart your MCP client — schemas are auto-advertised over the protocol. No client code changes.</p>
 <Code lang="bash">{`cd superkabe/mcp-server
git pull
npm install
npm run build
# Restart Claude Desktop / Cursor / your client`}</Code>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="compat" className="text-3xl font-bold mt-12 mb-4 text-gray-900">12. Protocol compatibility</h2>
 <ul className="list-disc list-inside text-gray-600 space-y-1 mb-8">
 <li>Implements MCP server capability <code>tools</code> only — no <code>resources</code>, <code>prompts</code>, or <code>sampling</code> yet.</li>
 <li>Tested against <code>@modelcontextprotocol/sdk</code> 1.12.x on the server side; any conformant MCP client should interoperate.</li>
 <li>Transport is <code>StdioServerTransport</code>. HTTP/SSE transport is on the roadmap; open an issue if you need it.</li>
 </ul>

 {/* ═════════════════════════════════════════════════════════════ */}
 <div className="bg-green-50 border border-green-200 p-6 mt-8">
 <h3 className="font-bold text-green-800 mb-2">Next steps</h3>
 <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
 <li>Read the <a href="/docs/api-documentation" className="text-blue-600 underline">API documentation</a> for the exact shape of every tool&apos;s response.</li>
 <li>Generate a scoped API key in <strong>Dashboard → API &amp; MCP</strong>.</li>
 <li>Copy the Claude Desktop config snippet above and restart the app.</li>
 <li>Try <em>&quot;list my campaigns&quot;</em> as your first prompt.</li>
 </ul>
 </div>
 </div>
 );
}

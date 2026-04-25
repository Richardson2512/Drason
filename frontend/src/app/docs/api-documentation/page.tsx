import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'API Documentation (v1) | Superkabe Docs',
 description: 'Complete documentation for the Superkabe v1 REST API — authentication, scopes, every endpoint, request/response schemas, errors, and SDK examples.',
 alternates: { canonical: '/docs/api-documentation' },
 openGraph: {
 title: 'API Documentation (v1) | Superkabe Docs',
 description: 'Complete documentation for the Superkabe v1 REST API — authentication, scopes, every endpoint, request/response schemas, errors, and SDK examples.',
 url: '/docs/api-documentation',
 siteName: 'Superkabe',
 type: 'article',
 },
};

// ─────────────────────────────────────────────────────────────────────
// Reusable presentational primitives
// ─────────────────────────────────────────────────────────────────────

function Endpoint({ method, path }: { method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; path: string }) {
 const color = {
 GET: 'bg-blue-100 text-blue-700 border-blue-200',
 POST: 'bg-green-100 text-green-700 border-green-200',
 PATCH: 'bg-amber-100 text-amber-700 border-amber-200',
 PUT: 'bg-amber-100 text-amber-700 border-amber-200',
 DELETE: 'bg-red-100 text-red-700 border-red-200',
 }[method];
 return (
 <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 my-3 font-mono text-sm">
 <span className={`px-2.5 py-0.5 border text-xs font-bold ${color}`}>{method}</span>
 <code className="text-gray-800">{path}</code>
 </div>
 );
}

function Code({ children, lang = 'json' }: { children: string; lang?: string }) {
 const lcolor = lang === 'json' ? 'text-gray-700' : lang === 'bash' ? 'text-blue-600' : lang === 'response' ? 'text-green-700' : 'text-gray-700';
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
// SVG diagram: auth lifecycle
// ─────────────────────────────────────────────────────────────────────

function AuthFlowDiagram() {
 return (
 <figure className="my-8">
 <svg viewBox="0 0 760 320" className="w-full h-auto bg-white border border-gray-200 p-4">
 <defs>
 <marker id="arr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
 <path d="M0,0 L10,5 L0,10 z" fill="#6B7280" />
 </marker>
 </defs>

 {/* Client */}
 <rect x="20" y="100" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
 <text x="95" y="135" textAnchor="middle" fontFamily="system-ui" fontSize="14" fontWeight="600" fill="#1E40AF">Client</text>
 <text x="95" y="155" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#3B82F6">curl / Node / Python</text>

 {/* Gateway */}
 <rect x="230" y="60" width="180" height="160" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
 <text x="320" y="95" textAnchor="middle" fontFamily="system-ui" fontSize="14" fontWeight="600" fill="#92400E">orgContext middleware</text>
 <text x="320" y="120" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">1. parse Authorization</text>
 <text x="320" y="138" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">2. try JWT verify</text>
 <text x="320" y="156" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">3. else hash + lookup ApiKey</text>
 <text x="320" y="174" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">4. attach orgId + scopes</text>
 <text x="320" y="192" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#B45309">5. rate-limit per key</text>

 {/* v1 controller */}
 <rect x="470" y="60" width="130" height="80" rx="12" fill="#F0FDF4" stroke="#10B981" strokeWidth="1.5" />
 <text x="535" y="95" textAnchor="middle" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#065F46">v1 controller</text>
 <text x="535" y="115" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#047857">requireScope()</text>

 {/* Postgres */}
 <rect x="470" y="160" width="130" height="80" rx="12" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="1.5" />
 <text x="535" y="195" textAnchor="middle" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#5B21B6">Postgres</text>
 <text x="535" y="215" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#7C3AED">org-scoped query</text>

 {/* Response */}
 <rect x="640" y="100" width="100" height="80" rx="12" fill="#F0FDF4" stroke="#10B981" strokeWidth="1.5" />
 <text x="690" y="135" textAnchor="middle" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#065F46">response</text>
 <text x="690" y="155" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#047857">{"{ success, data }"}</text>

 {/* Arrows */}
 <line x1="170" y1="140" x2="225" y2="140" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arr-a)" />
 <line x1="410" y1="105" x2="465" y2="95" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arr-a)" />
 <line x1="535" y1="140" x2="535" y2="155" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arr-a)" />
 <line x1="600" y1="105" x2="635" y2="130" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arr-a)" />

 <text x="195" y="130" fontFamily="system-ui" fontSize="10" fill="#6B7280">request</text>
 </svg>
 <figcaption className="text-xs text-gray-500 text-center mt-2">Fig 1. Every v1 request passes through <code>orgContext</code>, which resolves the bearer token to an <code>orgId</code> + <code>scopes</code> tuple. The controller enforces scopes per endpoint before hitting Postgres.</figcaption>
 </figure>
 );
}

// ─────────────────────────────────────────────────────────────────────
// SVG diagram: request lifecycle
// ─────────────────────────────────────────────────────────────────────

function RequestLifecycleDiagram() {
 return (
 <figure className="my-8">
 <svg viewBox="0 0 760 260" className="w-full h-auto bg-white border border-gray-200 p-4">
 <defs>
 <marker id="arr-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
 <path d="M0,0 L10,5 L0,10 z" fill="#6B7280" />
 </marker>
 </defs>

 {[
 { x: 20, label: 'TLS', sub: 'HTTPS only' },
 { x: 140, label: 'CORS', sub: 'origin check' },
 { x: 260, label: 'Rate limit', sub: 'per-key bucket' },
 { x: 380, label: 'Auth', sub: 'JWT or API key' },
 { x: 500, label: 'Scope check', sub: 'per endpoint' },
 { x: 620, label: 'Controller', sub: 'org-scoped' },
 ].map((s, i) => (
 <g key={s.label}>
 <rect x={s.x} y="90" width="110" height="80" rx="10" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
 <text x={s.x + 55} y="125" textAnchor="middle" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#0F172A">{s.label}</text>
 <text x={s.x + 55} y="145" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#64748B">{s.sub}</text>
 {i < 5 && <line x1={s.x + 110} y1="130" x2={s.x + 120 + 10} y2="130" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arr-b)" />}
 </g>
 ))}

 {/* failure lanes */}
 <text x="380" y="60" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#DC2626" fontWeight="600">401 / 403 / 429 fail-fast at any gate</text>
 <line x1="75" y1="90" x2="75" y2="70" stroke="#DC2626" strokeDasharray="3 3" />
 <line x1="195" y1="90" x2="195" y2="70" stroke="#DC2626" strokeDasharray="3 3" />
 <line x1="315" y1="90" x2="315" y2="70" stroke="#DC2626" strokeDasharray="3 3" />
 <line x1="435" y1="90" x2="435" y2="70" stroke="#DC2626" strokeDasharray="3 3" />
 <line x1="555" y1="90" x2="555" y2="70" stroke="#DC2626" strokeDasharray="3 3" />
 <line x1="75" y1="70" x2="555" y2="70" stroke="#DC2626" strokeDasharray="3 3" />

 <text x="380" y="220" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#059669" fontWeight="600">200 / 201 / 204 response on success</text>
 <line x1="675" y1="170" x2="675" y2="200" stroke="#059669" strokeDasharray="3 3" />
 <line x1="75" y1="200" x2="675" y2="200" stroke="#059669" strokeDasharray="3 3" />
 <line x1="75" y1="170" x2="75" y2="200" stroke="#059669" strokeDasharray="3 3" />
 </svg>
 <figcaption className="text-xs text-gray-500 text-center mt-2">Fig 2. Request lifecycle — each gate is enforced before the controller runs. Failure at any stage returns the matching HTTP status and short-circuits.</figcaption>
 </figure>
 );
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export default function APIReferencePage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-4 text-gray-900">Superkabe API Documentation <Pill tone="blue">v1</Pill></h1>
 <p className="text-xl text-gray-500 mb-8">
 Complete reference for the Superkabe public REST API. Every endpoint, every field, every error code. Used by the dashboard UI, the MCP server, and any third-party integration you build.
 </p>

 {/* Quick facts */}
 <div className="grid md:grid-cols-2 gap-4 mb-12">
 <div className="bg-blue-50 border border-blue-200 p-5">
 <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Base URL (production)</div>
 <code className="text-sm text-gray-800 break-all">https://api.superkabe.com/api/v1</code>
 </div>
 <div className="bg-amber-50 border border-amber-200 p-5">
 <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Base URL (local / staging)</div>
 <code className="text-sm text-gray-800 break-all">http://localhost:4000/api/v1</code>
 </div>
 <div className="bg-gray-50 border border-gray-200 p-5">
 <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Format</div>
 <div className="text-sm text-gray-800">JSON in · JSON out · UTF-8</div>
 </div>
 <div className="bg-gray-50 border border-gray-200 p-5">
 <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Transport</div>
 <div className="text-sm text-gray-800">HTTPS only (TLS 1.2+)</div>
 </div>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="overview" className="text-3xl font-bold mt-12 mb-4 text-gray-900">1. Overview</h2>

 <p className="text-gray-600 mb-4">
 The Superkabe v1 API is a resource-oriented REST API that exposes every core capability of the platform to programmatic callers. All requests use HTTPS, send and receive JSON, and are scoped to a single organization via the bearer token used for authentication.
 </p>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Resource model</h3>
 <p className="text-gray-600 mb-4">
 The API is organized around eight top-level resources:
 </p>
 <div className="bg-white border border-gray-200 overflow-hidden mb-6 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-3 font-semibold text-gray-700">Resource</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Represents</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Base path</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr><td className="px-4 py-3 font-mono text-blue-600">Account</td><td className="px-4 py-3 text-gray-600">Your organization, tier, and usage counters</td><td className="px-4 py-3 font-mono text-gray-600">/account</td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">Leads</td><td className="px-4 py-3 text-gray-600">Prospects you ingest and validate</td><td className="px-4 py-3 font-mono text-gray-600">/leads</td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">Campaigns</td><td className="px-4 py-3 text-gray-600">Native sequencer campaigns with multi-step sequences and variants</td><td className="px-4 py-3 font-mono text-gray-600">/campaigns</td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">Replies</td><td className="px-4 py-3 text-gray-600">Inbound messages + outbound replies via connected mailboxes</td><td className="px-4 py-3 font-mono text-gray-600">/replies</td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">Validation</td><td className="px-4 py-3 text-gray-600">Email validation analytics</td><td className="px-4 py-3 font-mono text-gray-600">/validation</td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">Mailboxes</td><td className="px-4 py-3 text-gray-600">Connected sending accounts (Gmail, Microsoft 365, SMTP)</td><td className="px-4 py-3 font-mono text-gray-600">/mailboxes</td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">Domains</td><td className="px-4 py-3 text-gray-600">Sending domains with health, recovery phase, and DNSBL state</td><td className="px-4 py-3 font-mono text-gray-600">/domains</td></tr>
 </tbody>
 </table>
 </div>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Versioning policy</h3>
 <p className="text-gray-600 mb-4">
 The version segment (<code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">/api/v1</code>) is part of every URL. Breaking changes always trigger a new major version (<code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">/api/v2</code>); the previous major is supported for at least 12 months after the new one ships. Additive changes (new fields, new endpoints, new optional parameters) do not break the contract and can appear at any time.
 </p>

 <div className="bg-blue-50 border border-blue-200 p-5 mb-8">
 <h4 className="font-bold text-blue-900 mb-2">Forward-compatibility contract</h4>
 <p className="text-sm text-gray-700">Your client must ignore unknown fields in responses and unknown error codes it does not yet handle. Do not rely on field ordering in JSON objects. Do not rely on array ordering unless the endpoint explicitly documents an order.</p>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="auth" className="text-3xl font-bold mt-12 mb-4 text-gray-900">2. Authentication</h2>

 <p className="text-gray-600 mb-4">
 Every request must include an <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">Authorization</code> header containing a bearer token. Two token types are accepted:
 </p>

 <ol className="space-y-3 text-gray-600 mb-6 list-decimal list-inside">
 <li><strong>API key</strong> — long-lived, issued from the dashboard, scoped to a single organization with a bounded set of permissions. Prefix <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">sk_live_</code> for production, <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">sk_test_</code> for staging.</li>
 <li><strong>JWT access token</strong> — short-lived, issued by the login flow, used by the dashboard itself. Carries the full scope of the logged-in user's role.</li>
 </ol>

 <AuthFlowDiagram />

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">2.1 Creating an API key</h3>
 <ol className="space-y-2 text-gray-600 mb-6 list-decimal list-inside">
 <li>Sign in to the dashboard.</li>
 <li>Open <strong>API &amp; MCP</strong> from the sidebar.</li>
 <li>Click <strong>Create API key</strong>, give it a descriptive name (e.g. <em>"Claude Desktop"</em> or <em>"Zapier production"</em>).</li>
 <li>Choose the exact set of scopes you want the key to carry. Default to least privilege.</li>
 <li>(Optional) Set an expiry date. Keys without an expiry live until manually revoked.</li>
 <li>Copy the full key from the confirmation screen. It is shown <em>once</em>. The dashboard stores only a SHA-256 hash + the first 8 characters for display.</li>
 </ol>

 <div className="bg-red-50 border border-red-200 p-5 mb-6">
 <h4 className="font-bold text-red-800 mb-2">Treat API keys as secrets</h4>
 <p className="text-sm text-gray-700">Never commit keys to source control, never log them, never embed them in a browser bundle. If a key leaks, revoke it immediately from <strong>API &amp; MCP → Revoke</strong>; every request using the revoked key will return <code>401</code> within seconds.</p>
 </div>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">2.2 Sending the Authorization header</h3>
 <Code lang="bash">{`# API key
Authorization: Bearer sk_live_abc123...

# JWT access token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</Code>

 <p className="text-gray-600 mb-4">
 The server detects which kind of token was sent by trying JWT verification first; if the signature check fails, it falls back to an API-key lookup (hash, then a row in the <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">ApiKey</code> table). Unrecognized tokens return a <code>401</code>.
 </p>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">2.3 Key storage model</h3>
 <p className="text-gray-600 mb-4">Each API key row stores:</p>
 <ul className="space-y-2 text-gray-600 mb-8 list-disc list-inside">
 <li><code>id</code> — ULID, not used for auth</li>
 <li><code>key_prefix</code> — the first 8 characters of the key, shown in the dashboard list so you can identify a key without seeing the secret</li>
 <li><code>key_hash</code> — SHA-256 hash of the full key; the only way to verify a request token</li>
 <li><code>name</code> — human label</li>
 <li><code>scopes</code> — an array of permission strings (see §3)</li>
 <li><code>last_used_at</code> — updated on each successful request</li>
 <li><code>expires_at</code> — optional, enforced at verify time</li>
 <li><code>revoked_at</code> — when present, every request fails <code>401</code></li>
 </ul>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="scopes" className="text-3xl font-bold mt-12 mb-4 text-gray-900">3. Scopes</h2>

 <p className="text-gray-600 mb-4">
 Scopes are permission strings attached to an API key. They follow the pattern <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">resource:action</code>. Each endpoint enforces exactly one scope; missing the scope returns <code>403 Missing required scope: X</code>.
 </p>
 <p className="text-gray-600 mb-6">
 JWT tokens (used by the dashboard) skip the scope check — they always have full access because the scope is implied by the user's role.
 </p>

 <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-3 font-semibold text-gray-700">Scope</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Gates</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Risk tier</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr><td className="px-4 py-3 font-mono text-blue-600">account:read</td><td className="px-4 py-3 text-gray-600">GET /account</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">leads:read</td><td className="px-4 py-3 text-gray-600">GET /leads, GET /leads/:id</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">leads:write</td><td className="px-4 py-3 text-gray-600">POST /leads/bulk</td><td className="px-4 py-3"><Pill tone="amber">medium</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">validation:read</td><td className="px-4 py-3 text-gray-600">GET /validation/results</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">validation:trigger</td><td className="px-4 py-3 text-gray-600">POST /leads/validate (consumes credits)</td><td className="px-4 py-3"><Pill tone="amber">medium</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">campaigns:read</td><td className="px-4 py-3 text-gray-600">GET /campaigns, GET /campaigns/:id</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">campaigns:write</td><td className="px-4 py-3 text-gray-600">POST /campaigns, PATCH /campaigns/:id, launch, pause</td><td className="px-4 py-3"><Pill tone="red">high</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">reports:read</td><td className="px-4 py-3 text-gray-600">GET /campaigns/:id/report</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">replies:read</td><td className="px-4 py-3 text-gray-600">GET /campaigns/:id/replies</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">replies:send</td><td className="px-4 py-3 text-gray-600">POST /replies (sends a real email)</td><td className="px-4 py-3"><Pill tone="red">high</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">mailboxes:read</td><td className="px-4 py-3 text-gray-600">GET /mailboxes</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 <tr><td className="px-4 py-3 font-mono text-blue-600">domains:read</td><td className="px-4 py-3 text-gray-600">GET /domains</td><td className="px-4 py-3"><Pill tone="green">low</Pill></td></tr>
 </tbody>
 </table>
 </div>

 <div className="bg-amber-50 border border-amber-200 p-5 mb-8">
 <h4 className="font-bold text-amber-900 mb-2">Least-privilege recommendation</h4>
 <p className="text-sm text-gray-700">A key that only reads reports should carry <code>reports:read</code> and nothing else. If an agent only lists campaigns, grant <code>campaigns:read</code> but not <code>campaigns:write</code>. High-risk scopes (<code>campaigns:write</code>, <code>replies:send</code>, <code>validation:trigger</code>) should live on separate keys so they can be revoked independently.</p>
 </div>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="format" className="text-3xl font-bold mt-12 mb-4 text-gray-900">4. Response format</h2>

 <p className="text-gray-600 mb-4">Every response uses a uniform envelope:</p>

 <Code lang="json">{`// Success
{
 "success": true,
 "data": { ... }
 // Some list endpoints also include "meta": { total, page, limit, totalPages }
}

// Error
{
 "success": false,
 "error": "Human-readable message"
}`}</Code>

 <p className="text-gray-600 mb-4">
 List endpoints that support pagination add a <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">meta</code> object alongside <code>data</code>. Pagination parameters are documented per-endpoint.
 </p>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Timestamps</h3>
 <p className="text-gray-600 mb-4">All timestamps are ISO 8601 strings in UTC, e.g. <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700">&quot;2026-04-24T14:32:10.000Z&quot;</code>. Clients should parse them as UTC and convert to the user's timezone for display.</p>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Identifiers</h3>
 <p className="text-gray-600 mb-4">All resource IDs are strings. Native sequencer resources use UUIDs; legacy platform-synced resources carry the upstream platform's ID verbatim. Never parse or type-assert IDs — treat them as opaque.</p>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Nulls vs omitted fields</h3>
 <p className="text-gray-600 mb-4">Optional fields that have no value are returned as <code>null</code>, not omitted. A field that is entirely absent from a response was not requested or is not applicable to that resource type.</p>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="errors" className="text-3xl font-bold mt-12 mb-4 text-gray-900">5. Errors &amp; status codes</h2>

 <RequestLifecycleDiagram />

 <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Meaning</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Typical cause</th>
 <th className="px-4 py-3 font-semibold text-gray-700">Client action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr><td className="px-4 py-3 font-mono text-green-700 font-semibold">200</td><td className="px-4 py-3 text-gray-600">OK</td><td className="px-4 py-3 text-gray-600">Successful read</td><td className="px-4 py-3 text-gray-600">—</td></tr>
 <tr><td className="px-4 py-3 font-mono text-green-700 font-semibold">201</td><td className="px-4 py-3 text-gray-600">Created</td><td className="px-4 py-3 text-gray-600">Resource created (e.g. new campaign)</td><td className="px-4 py-3 text-gray-600">Read <code>data.id</code></td></tr>
 <tr><td className="px-4 py-3 font-mono text-green-700 font-semibold">204</td><td className="px-4 py-3 text-gray-600">No content</td><td className="px-4 py-3 text-gray-600">Successful action with no body</td><td className="px-4 py-3 text-gray-600">—</td></tr>
 <tr><td className="px-4 py-3 font-mono text-amber-700 font-semibold">400</td><td className="px-4 py-3 text-gray-600">Bad request</td><td className="px-4 py-3 text-gray-600">Missing / malformed field</td><td className="px-4 py-3 text-gray-600">Fix input, do not retry</td></tr>
 <tr><td className="px-4 py-3 font-mono text-amber-700 font-semibold">401</td><td className="px-4 py-3 text-gray-600">Unauthorized</td><td className="px-4 py-3 text-gray-600">Missing / invalid / revoked token</td><td className="px-4 py-3 text-gray-600">Re-issue a key, do not retry</td></tr>
 <tr><td className="px-4 py-3 font-mono text-amber-700 font-semibold">403</td><td className="px-4 py-3 text-gray-600">Forbidden</td><td className="px-4 py-3 text-gray-600">Scope check failed or feature-gate (tier)</td><td className="px-4 py-3 text-gray-600">Grant scope or upgrade tier</td></tr>
 <tr><td className="px-4 py-3 font-mono text-amber-700 font-semibold">404</td><td className="px-4 py-3 text-gray-600">Not found</td><td className="px-4 py-3 text-gray-600">Resource does not exist in your org</td><td className="px-4 py-3 text-gray-600">Verify ID, do not retry</td></tr>
 <tr><td className="px-4 py-3 font-mono text-amber-700 font-semibold">409</td><td className="px-4 py-3 text-gray-600">Conflict</td><td className="px-4 py-3 text-gray-600">State conflict (e.g. can&apos;t PATCH an active campaign)</td><td className="px-4 py-3 text-gray-600">Change state, then retry</td></tr>
 <tr><td className="px-4 py-3 font-mono text-amber-700 font-semibold">429</td><td className="px-4 py-3 text-gray-600">Too many requests</td><td className="px-4 py-3 text-gray-600">Rate limit exceeded</td><td className="px-4 py-3 text-gray-600">Backoff, respect <code>Retry-After</code></td></tr>
 <tr><td className="px-4 py-3 font-mono text-red-700 font-semibold">500</td><td className="px-4 py-3 text-gray-600">Server error</td><td className="px-4 py-3 text-gray-600">Uncaught exception</td><td className="px-4 py-3 text-gray-600">Retry with exponential backoff</td></tr>
 <tr><td className="px-4 py-3 font-mono text-red-700 font-semibold">502 / 503 / 504</td><td className="px-4 py-3 text-gray-600">Upstream</td><td className="px-4 py-3 text-gray-600">Transient infra (DB, Redis, ESP)</td><td className="px-4 py-3 text-gray-600">Retry with exponential backoff</td></tr>
 </tbody>
 </table>
 </div>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Retry strategy</h3>
 <Code lang="js">{`// Pseudocode — safe retry loop
async function call(req, attempt = 0) {
 const res = await fetch(req);
 if (res.ok) return res.json();

 const status = res.status;
 const retriable = status === 429 || status >= 500;
 if (!retriable || attempt >= 5) throw await res.json();

 const retryAfter = Number(res.headers.get('Retry-After')) || null;
 const backoff = retryAfter ? retryAfter * 1000 : Math.min(2 ** attempt * 500, 30_000);
 await new Promise(r => setTimeout(r, backoff + Math.random() * 250));
 return call(req, attempt + 1);
}`}</Code>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="rate-limits" className="text-3xl font-bold mt-12 mb-4 text-gray-900">6. Rate limits</h2>
 <p className="text-gray-600 mb-4">Rate limits are per API key, using a token-bucket algorithm backed by Redis. The current defaults are:</p>
 <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
 <li><strong>Sustained:</strong> 300 requests / minute</li>
 <li><strong>Burst:</strong> 60 requests / 10 seconds</li>
 <li><strong>Bulk write endpoints:</strong> 10 requests / minute (<code>POST /leads/bulk</code>, <code>POST /leads/validate</code>)</li>
 </ul>
 <p className="text-gray-600 mb-4">Every response carries three headers you should pay attention to:</p>
 <Code lang="bash">{`X-RateLimit-Limit: 300 # requests per window
X-RateLimit-Remaining: 247 # requests left in current window
X-RateLimit-Reset: 1713968400 # unix seconds when the window resets`}</Code>
 <p className="text-gray-600 mb-4">A <code>429</code> response carries a <code>Retry-After</code> header in seconds. Your client must honor it.</p>

 {/* ═════════════════════════════════════════════════════════════ */}
 {/* ENDPOINTS */}
 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="endpoints" className="text-3xl font-bold mt-16 mb-6 text-gray-900">7. Endpoints</h2>

 {/* ── Account ── */}
 <h3 id="account" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.1 Account</h3>

 <h4 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Get account info</h4>
 <Endpoint method="GET" path="/account" />
 <p className="text-gray-600 mb-2">Scope: <code>account:read</code></p>
 <p className="text-gray-600 mb-4">Returns organization metadata, subscription tier, usage counters, and plan limits. Use this first to understand what the current key can do.</p>
 <h5 className="font-semibold text-gray-800 mb-2">Response</h5>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "id": "org_abc",
 "name": "Acme Corp",
 "slug": "acme",
 "tier": "growth", // trial | starter | growth | scale | enterprise
 "status": "active", // active | past_due | canceled | trialing
 "usage": {
 "leads": 12483,
 "domains": 14,
 "mailboxes": 32
 },
 "limits": {
 "leads": 50000,
 "domains": 25,
 "mailboxes": 50,
 "monthly_sends": 150000,
 "validation_credits": 50000
 }
 }
}`}</Code>

 {/* ── Leads ── */}
 <h3 id="leads" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.2 Leads</h3>

 <h4 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Bulk import leads</h4>
 <Endpoint method="POST" path="/leads/bulk" />
 <p className="text-gray-600 mb-2">Scope: <code>leads:write</code></p>
 <p className="text-gray-600 mb-4">Import up to <strong>5,000 leads per request</strong>. Duplicates are detected case-insensitively on <code>email</code> within the organization and are skipped (not errored). Newly created leads enter with status <code>held</code> and <code>validation_status: null</code> — validation is a separate step.</p>
 <h5 className="font-semibold text-gray-800 mb-2">Request body</h5>
 <Code lang="json">{`{
 "leads": [
 {
 "email": "jane.doe@acme.com", // required
 "persona": "VP Engineering", // optional, default "general"
 "source": "apollo", // optional, default "api"
 "lead_score": 85 // optional integer 0-100, default 50
 }
 ]
}`}</Code>
 <h5 className="font-semibold text-gray-800 mt-4 mb-2">Response</h5>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "total": 3,
 "created": 2,
 "duplicates": 1,
 "errors": 0,
 "results": [
 { "email": "jane.doe@acme.com", "id": "lead_xyz", "status": "created" },
 { "email": "bob@acme.com", "id": "lead_abc", "status": "duplicate" },
 { "email": "carol@new.com", "id": "lead_def", "status": "created" }
 ]
 }
}`}</Code>
 <p className="text-gray-600 mb-4">Per-row status values: <Pill tone="green">created</Pill> <Pill tone="blue">duplicate</Pill> <Pill tone="red">rejected</Pill> (missing/invalid email) <Pill tone="red">error</Pill> (row-level DB failure).</p>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Trigger validation</h4>
 <Endpoint method="POST" path="/leads/validate" />
 <p className="text-gray-600 mb-2">Scope: <code>validation:trigger</code></p>
 <p className="text-gray-600 mb-4">Queues validation for existing leads. Provide <em>either</em> <code>lead_ids</code> <em>or</em> <code>emails</code>. Validation runs asynchronously; poll <code>GET /leads</code> and check <code>validation_status</code>. Consumes one credit per non-cached domain.</p>
 <Code lang="json">{`// Option A
{ "lead_ids": ["lead_xyz", "lead_abc"] }

// Option B
{ "emails": ["jane@acme.com", "bob@acme.com"] }`}</Code>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "queued": 2,
 "lead_ids": ["lead_xyz", "lead_abc"],
 "message": "Validation has been queued. Poll GET /api/v1/leads to check results."
 }
}`}</Code>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">List leads</h4>
 <Endpoint method="GET" path="/leads" />
 <p className="text-gray-600 mb-2">Scope: <code>leads:read</code></p>
 <h5 className="font-semibold text-gray-800 mb-2">Query parameters</h5>
 <div className="bg-white border border-gray-200 overflow-hidden mb-4 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Default</th><th className="px-4 py-2">Notes</th></tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr><td className="px-4 py-2 font-mono">page</td><td className="px-4 py-2">integer</td><td className="px-4 py-2">1</td><td className="px-4 py-2 text-gray-600">&ge; 1</td></tr>
 <tr><td className="px-4 py-2 font-mono">limit</td><td className="px-4 py-2">integer</td><td className="px-4 py-2">50</td><td className="px-4 py-2 text-gray-600">1 to 100</td></tr>
 <tr><td className="px-4 py-2 font-mono">status</td><td className="px-4 py-2">string</td><td className="px-4 py-2">—</td><td className="px-4 py-2 text-gray-600">held · active · paused · blocked</td></tr>
 <tr><td className="px-4 py-2 font-mono">validation_status</td><td className="px-4 py-2">string</td><td className="px-4 py-2">—</td><td className="px-4 py-2 text-gray-600">valid · risky · invalid · unknown · pending</td></tr>
 <tr><td className="px-4 py-2 font-mono">search</td><td className="px-4 py-2">string</td><td className="px-4 py-2">—</td><td className="px-4 py-2 text-gray-600">case-insensitive email substring</td></tr>
 </tbody>
 </table>
 </div>
 <Code lang="response">{`{
 "success": true,
 "data": [
 {
 "id": "lead_xyz",
 "email": "jane@acme.com",
 "persona": "VP Engineering",
 "status": "active",
 "lead_score": 85,
 "source": "apollo",
 "source_platform": "sequencer",
 "validation_status": "valid",
 "validation_score": 95,
 "is_catch_all": false,
 "is_disposable": false,
 "emails_sent": 3,
 "emails_opened": 2,
 "emails_clicked": 1,
 "emails_replied": 0,
 "last_activity_at": "2026-04-24T14:32:10.000Z",
 "created_at": "2026-04-20T10:00:00.000Z"
 }
 ],
 "meta": { "total": 12483, "page": 1, "limit": 50, "totalPages": 250 }
}`}</Code>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Get lead by ID</h4>
 <Endpoint method="GET" path="/leads/:id" />
 <p className="text-gray-600 mb-4">Scope: <code>leads:read</code>. Returns the full <code>Lead</code> row (every column). <code>404</code> if the lead does not belong to your organization.</p>

 {/* ── Campaigns ── */}
 <h3 id="campaigns" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.3 Campaigns (native sequencer)</h3>

 <div className="bg-blue-50 border border-blue-200 p-5 mb-6">
 <h4 className="font-bold text-blue-900 mb-2">Native sequencer only</h4>
 <p className="text-sm text-gray-700">v1 campaign endpoints operate on campaigns where <code>source_platform = &apos;sequencer&apos;</code>. Legacy campaigns synced from Smartlead / Instantly / EmailBison / Reply.io are not exposed through v1 — they live on platform-specific routes.</p>
 </div>

 <h4 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Create campaign</h4>
 <Endpoint method="POST" path="/campaigns" />
 <p className="text-gray-600 mb-2">Scope: <code>campaigns:write</code></p>
 <p className="text-gray-600 mb-4">Creates a campaign in <code>draft</code> status with its sequence steps, variants, and (optionally) an initial lead set. Assigned leads are passed through the health gate:</p>
 <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
 <li><Pill tone="red">RED</Pill> leads are blocked and excluded from the campaign (counted as <code>leads_blocked</code>).</li>
 <li><Pill tone="amber">YELLOW</Pill> leads are added with status <code>paused</code> — safe for operator review.</li>
 <li><Pill tone="green">GREEN</Pill> leads are added with status <code>active</code>.</li>
 </ul>
 <h5 className="font-semibold text-gray-800 mb-2">Request body</h5>
 <Code lang="json">{`{
 "name": "Q2 cold outbound - technical founders",
 "steps": [
 {
 "subject": "Quick question about {{company}}",
 "body_html": "<p>Hi {{first_name}}, ...</p>",
 "body_text": "Hi {{first_name}}, ...",
 "delay_days": 0,
 "delay_hours": 0,
 "variants": [
 { "label": "A", "subject": "Quick question", "body_html": "...", "weight": 50 },
 { "label": "B", "subject": "Following up on {{company}}", "body_html": "...", "weight": 50 }
 ]
 },
 {
 "subject": "Following up",
 "body_html": "<p>Hey {{first_name}}, ...</p>",
 "delay_days": 3
 }
 ],
 "lead_ids": ["lead_xyz", "lead_abc"],
 "schedule": {
 "timezone": "America/New_York", // IANA TZ, default UTC
 "start_time": "09:00", // default 09:00
 "end_time": "17:00", // default 17:00
 "days": ["mon","tue","wed","thu","fri"], // default Mon-Fri
 "daily_limit": 50, // default 50
 "send_gap_minutes": 17 // default 17 (natural spacing)
 }
}`}</Code>
 <h5 className="font-semibold text-gray-800 mt-4 mb-2">Response <code className="text-sm text-gray-500">(201 Created)</code></h5>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "id": "cmp_abc123",
 "name": "Q2 cold outbound - technical founders",
 "status": "draft",
 "steps_count": 2,
 "leads_assigned": 2,
 "leads_blocked": 0
 }
}`}</Code>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Template variables</h4>
 <p className="text-gray-600 mb-4">Subject lines and bodies can reference lead fields using <code>{'{{variable}}'}</code> syntax. Supported variables: <code>first_name</code>, <code>last_name</code>, <code>email</code>, <code>company</code>, <code>persona</code>. Unresolved variables render as the empty string.</p>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">List campaigns</h4>
 <Endpoint method="GET" path="/campaigns" />
 <p className="text-gray-600 mb-2">Scope: <code>campaigns:read</code></p>
 <Code lang="response">{`{
 "success": true,
 "data": [
 {
 "id": "cmp_abc123",
 "name": "Q2 cold outbound",
 "status": "active", // draft | active | paused | completed | archived
 "daily_limit": 50,
 "schedule_timezone": "America/New_York",
 "leads_count": 1200,
 "steps_count": 4,
 "created_at": "2026-04-20T10:00:00.000Z",
 "updated_at": "2026-04-24T14:00:00.000Z"
 }
 ]
}`}</Code>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Get campaign details</h4>
 <Endpoint method="GET" path="/campaigns/:id" />
 <p className="text-gray-600 mb-4">Scope: <code>campaigns:read</code>. Returns the campaign, every sequence step with its variants, and the first 100 assigned leads (<code>leads[]</code>).</p>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Update campaign</h4>
 <Endpoint method="PATCH" path="/campaigns/:id" />
 <p className="text-gray-600 mb-2">Scope: <code>campaigns:write</code></p>
 <p className="text-gray-600 mb-4">Only updatable in <code>draft</code> or <code>paused</code> state — <code>PATCH</code> on an <code>active</code> campaign returns <code>400 &quot;Cannot update an active campaign. Pause it first.&quot;</code> Updatable fields:</p>
 <Code lang="json">{`{
 "name": "New name",
 "daily_limit": 100,
 "send_gap_minutes": 20,
 "schedule_timezone": "UTC",
 "schedule_start_time": "08:00",
 "schedule_end_time": "18:00",
 "schedule_days": ["mon","tue","wed","thu","fri","sat"]
}`}</Code>
 <p className="text-gray-600 mb-4">Sequence steps and variants are <em>not</em> editable through this endpoint — rebuild the campaign or edit through the dashboard.</p>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Launch campaign</h4>
 <Endpoint method="POST" path="/campaigns/:id/launch" />
 <p className="text-gray-600 mb-2">Scope: <code>campaigns:write</code></p>
 <p className="text-gray-600 mb-4">Sets status to <code>active</code> and stamps <code>launched_at</code>. The <code>sendQueueService</code> picks up active campaigns on its next 60s tick. Preconditions enforced by the server:</p>
 <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
 <li>Campaign is not already active &rarr; <code>400</code></li>
 <li>Campaign has at least one sequence step &rarr; else <code>400</code></li>
 <li>Campaign has at least one assigned lead &rarr; else <code>400</code></li>
 </ul>
 <Code lang="response">{`{
 "success": true,
 "data": { "id": "cmp_abc123", "status": "active", "leads": 1200, "steps": 4 }
}`}</Code>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Pause campaign</h4>
 <Endpoint method="POST" path="/campaigns/:id/pause" />
 <p className="text-gray-600 mb-4">Scope: <code>campaigns:write</code>. Returns <code>400</code> if the campaign is not currently <code>active</code>. In-flight sends within the current dispatcher cycle may still complete; subsequent cycles skip the campaign.</p>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Get campaign report</h4>
 <Endpoint method="GET" path="/campaigns/:id/report" />
 <p className="text-gray-600 mb-2">Scope: <code>reports:read</code></p>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "campaign_id": "cmp_abc123",
 "campaign_name": "Q2 cold outbound",
 "status": "active",
 "total_leads": 1200,
 "lead_status_breakdown": {
 "active": 850,
 "paused": 120,
 "completed": 210,
 "unsubscribed": 20
 },
 "emails_sent": 2300,
 "replies": 47,
 "reply_rate": "2.04%",
 "created_at": "2026-04-20T10:00:00.000Z"
 }
}`}</Code>

 <h4 className="text-xl font-semibold mt-8 mb-2 text-gray-800">Get campaign replies</h4>
 <Endpoint method="GET" path="/campaigns/:id/replies" />
 <p className="text-gray-600 mb-2">Scope: <code>replies:read</code></p>
 <p className="text-gray-600 mb-4">Returns up to the 100 most recently replied-on threads. Each thread is collapsed to its most recent inbound message; use <code>POST /replies</code> with the returned <code>thread_id</code> to respond.</p>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "total_replies": 47,
 "replies": [
 {
 "thread_id": "thr_123",
 "contact_email": "prospect@bigcorp.com",
 "contact_name": "Alex Prospect",
 "subject": "Re: Quick question about BigCorp",
 "body_text": "Happy to chat — how about Thursday at 2pm?",
 "received_at": "2026-04-24T14:32:10.000Z"
 }
 ]
 }
}`}</Code>

 {/* ── Replies ── */}
 <h3 id="replies" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.4 Replies</h3>

 <h4 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Send a reply</h4>
 <Endpoint method="POST" path="/replies" />
 <p className="text-gray-600 mb-2">Scope: <code>replies:send</code></p>
 <p className="text-gray-600 mb-4">Sends an outbound message on an existing thread through the originally connected mailbox. The thread&apos;s mailbox must have <code>connection_status = active</code>, otherwise returns <code>400</code>.</p>
 <h5 className="font-semibold text-gray-800 mb-2">Request body</h5>
 <Code lang="json">{`{
 "thread_id": "thr_123",
 "body_html": "<p>Thursday at 2pm works — sending a calendar invite now.</p>",
 "body_text": "Thursday at 2pm works — sending a calendar invite now."
}`}</Code>
 <p className="text-gray-600 mb-4">Provide <code>body_html</code> or <code>body_text</code>, or both. At least one is required. If both are provided, multipart/alternative is constructed automatically.</p>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "message_id": "msg_456",
 "thread_id": "thr_123",
 "from": "sender@yourdomain.com",
 "to": "prospect@bigcorp.com",
 "status": "sent"
 }
}`}</Code>

 {/* ── Validation ── */}
 <h3 id="validation" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.5 Validation analytics</h3>
 <Endpoint method="GET" path="/validation/results" />
 <p className="text-gray-600 mb-2">Scope: <code>validation:read</code></p>
 <p className="text-gray-600 mb-4">Organization-wide validation rollup. Use this for dashboards; for per-lead results call <code>GET /leads</code> with <code>validation_status</code> filters.</p>
 <Code lang="response">{`{
 "success": true,
 "data": {
 "total_validated": 12483,
 "status_breakdown": {
 "valid": 9812,
 "risky": 1402,
 "invalid": 980,
 "unknown": 289
 }
 }
}`}</Code>

 {/* ── Mailboxes ── */}
 <h3 id="mailboxes" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.6 Mailboxes</h3>
 <Endpoint method="GET" path="/mailboxes" />
 <p className="text-gray-600 mb-2">Scope: <code>mailboxes:read</code></p>
 <p className="text-gray-600 mb-4">Every sending account connected to your organization — Gmail, Microsoft 365, SMTP, and shadow mailboxes for connected platforms. Sorted alphabetically by email.</p>
 <Code lang="response">{`{
 "success": true,
 "data": [
 {
 "id": "mbx_abc",
 "email": "sender@yourdomain.com",
 "status": "active", // active | paused | quarantine | restricted | healing
 "source_platform": "sequencer", // sequencer | smartlead | instantly | emailbison | replyio
 "smtp_status": "ok", // ok | degraded | failing | unknown
 "imap_status": "ok",
 "total_sent_count": 1204,
 "hard_bounce_count": 3,
 "warmup_status": "active", // off | active | paused
 "warmup_reputation": 92, // 0 - 100
 "recovery_phase": null, // null when healthy; paused | quarantine | restricted_send | warm_recovery
 "resilience_score": 85 // 0 - 100
 }
 ]
}`}</Code>

 {/* ── Domains ── */}
 <h3 id="domains" className="text-2xl font-bold mt-10 mb-3 text-gray-900">7.7 Domains</h3>
 <Endpoint method="GET" path="/domains" />
 <p className="text-gray-600 mb-2">Scope: <code>domains:read</code></p>
 <Code lang="response">{`{
 "success": true,
 "data": [
 {
 "id": "dom_abc",
 "domain": "yourdomain.com",
 "status": "active",
 "source_platform": "sequencer",
 "total_sent_lifetime": 24103,
 "total_opens": 8912,
 "total_clicks": 1204,
 "total_replies": 187,
 "aggregated_bounce_rate_trend": 1.8, // last 24h bounce-rate %
 "warning_count": 0,
 "recovery_phase": null,
 "resilience_score": 90
 }
 ]
}`}</Code>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="idempotency" className="text-3xl font-bold mt-16 mb-4 text-gray-900">8. Idempotency</h2>
 <p className="text-gray-600 mb-4">
 <strong>Read endpoints</strong> (<code>GET</code>) are naturally idempotent. <strong>Write endpoints</strong> that you want to retry safely — particularly <code>POST /leads/bulk</code>, <code>POST /campaigns</code>, and <code>POST /replies</code> — accept an optional header:
 </p>
 <Code lang="bash">{`Idempotency-Key: <any unique string, max 255 chars>`}</Code>
 <p className="text-gray-600 mb-4">
 If two requests arrive with the same key from the same API key within 24 hours, the server returns the cached response from the first request. This lets you retry a timed-out <code>POST</code> without fear of creating the campaign twice.
 </p>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="webhooks" className="text-3xl font-bold mt-12 mb-4 text-gray-900">9. Webhooks (inbound)</h2>
 <p className="text-gray-600 mb-4">
 Separate from the v1 API, Superkabe exposes HMAC-signed inbound webhook endpoints for Clay, sending platforms, and billing. See <a href="/docs/api-integration" className="text-blue-600 underline">API &amp; Webhook Integration</a> for the full list, payload formats, signature verification, and event types.
 </p>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="sdks" className="text-3xl font-bold mt-12 mb-4 text-gray-900">10. SDK examples</h2>

 <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900">cURL</h3>
 <Code lang="bash">{`# List active campaigns
curl -s https://api.superkabe.com/api/v1/campaigns \\
 -H "Authorization: Bearer $SUPERKABE_API_KEY"

# Create a one-step campaign with two leads
curl -s https://api.superkabe.com/api/v1/campaigns \\
 -H "Authorization: Bearer $SUPERKABE_API_KEY" \\
 -H "Content-Type: application/json" \\
 -d '{
 "name": "April outbound",
 "steps": [{ "subject": "Quick question", "body_html": "<p>Hi {{first_name}}</p>" }],
 "lead_ids": ["lead_xyz", "lead_abc"]
 }'

# Launch it
curl -s -X POST https://api.superkabe.com/api/v1/campaigns/cmp_abc/launch \\
 -H "Authorization: Bearer $SUPERKABE_API_KEY"`}</Code>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Node.js (fetch)</h3>
 <Code lang="js">{`const API = 'https://api.superkabe.com/api/v1';
const KEY = process.env.SUPERKABE_API_KEY;

async function sk(method, path, body) {
 const res = await fetch(API + path, {
 method,
 headers: {
 'Authorization': \`Bearer \${KEY}\`,
 'Content-Type': 'application/json',
 },
 body: body ? JSON.stringify(body) : undefined,
 });
 const json = await res.json();
 if (!json.success) throw new Error(json.error);
 return json.data;
}

// Usage
const account = await sk('GET', '/account');
console.log(account.tier); // "growth"

const { id } = await sk('POST', '/campaigns', {
 name: 'April outbound',
 steps: [{ subject: 'Hi', body_html: '<p>Hey {{first_name}}</p>' }],
 lead_ids: ['lead_xyz'],
});
await sk('POST', \`/campaigns/\${id}/launch\`);`}</Code>

 <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-900">Python (requests)</h3>
 <Code lang="py">{`import os, requests

API = "https://api.superkabe.com/api/v1"
KEY = os.environ["SUPERKABE_API_KEY"]

class SuperkabeError(Exception): pass

def sk(method, path, body=None):
 r = requests.request(
 method, API + path,
 headers={"Authorization": f"Bearer {KEY}"},
 json=body,
 timeout=30,
 )
 data = r.json()
 if not data.get("success"):
 raise SuperkabeError(data.get("error", r.text))
 return data["data"]

# Pull a report for every active campaign
campaigns = sk("GET", "/campaigns")
for c in campaigns:
 if c["status"] == "active":
 report = sk("GET", f"/campaigns/{c['id']}/report")
 print(c["name"], "-", report["reply_rate"])`}</Code>

 {/* ═════════════════════════════════════════════════════════════ */}
 <h2 id="changelog" className="text-3xl font-bold mt-12 mb-4 text-gray-900">11. Changelog</h2>
 <div className="bg-white border border-gray-200 p-5 shadow-sm mb-8">
 <ul className="space-y-3 text-sm text-gray-700">
 <li><Pill tone="blue">2026-04-24</Pill> v1 endpoints operate on the unified <code>Campaign</code> table (post <code>SendCampaign</code> merge). No contract change for clients.</li>
 <li><Pill tone="blue">2026-03-10</Pill> Added <code>send_gap_minutes</code> to campaign schedule.</li>
 <li><Pill tone="blue">2026-02-01</Pill> <code>POST /replies</code> added with <code>replies:send</code> scope.</li>
 <li><Pill tone="blue">2026-01-15</Pill> Initial v1 public release.</li>
 </ul>
 </div>

 <div className="bg-green-50 border border-green-200 p-6 mt-8">
 <h3 className="font-bold text-green-800 mb-2">Next steps</h3>
 <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
 <li>Generate an API key in <strong>Dashboard → API &amp; MCP</strong>.</li>
 <li>Try the cURL examples above against <code>/account</code>.</li>
 <li>Connect the Superkabe <a href="/docs/mcp-server" className="text-blue-600 underline">MCP server</a> to drive the API from Claude.</li>
 <li>Wire up inbound <a href="/docs/api-integration" className="text-blue-600 underline">webhooks</a> from Clay or your sending platform.</li>
 </ul>
 </div>
 </div>
 );
}

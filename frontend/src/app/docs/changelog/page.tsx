import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "What's New | Superkabe Docs",
    description: 'Changelog — every shipped feature, integration, and platform improvement at Superkabe, in reverse chronological order.',
    alternates: { canonical: '/docs/changelog' },
    openGraph: {
        title: "What's New | Superkabe Docs",
        description: 'Changelog — every shipped feature, integration, and platform improvement at Superkabe, in reverse chronological order.',
        url: '/docs/changelog',
        siteName: 'Superkabe',
        type: 'article',
    },
};

interface Entry {
    date: string;          // ISO date
    title: string;
    tag?: 'new' | 'improved' | 'fix';
    body: React.ReactNode;
}

const TAG_STYLES: Record<NonNullable<Entry['tag']>, string> = {
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    improved: 'bg-blue-50 text-blue-700 border-blue-200',
    fix: 'bg-amber-50 text-amber-700 border-amber-200',
};

function TagPill({ tag }: { tag: NonNullable<Entry['tag']> }) {
    return (
        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${TAG_STYLES[tag]}`}>
            {tag}
        </span>
    );
}

const ENTRIES: Entry[] = [
    {
        date: '2026-04-29',
        title: 'Claude (browser) integration via OAuth 2.0',
        tag: 'new',
        body: (
            <>
                <p className="text-gray-600 leading-relaxed mb-3">
                    Claude.ai (browser) can now connect to Superkabe directly. Paste <code className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-800 text-xs">https://api.superkabe.com/mcp</code> into Claude.ai → Settings → Integrations → Add Integration. The OAuth flow handles consent, scoping, and token issuance entirely in-browser — no API key copy/paste, no install. The 17 Superkabe tools become available in any Claude conversation immediately.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Full RFC 6749 / 7591 / 7636 / 8414 / 9728 implementation — Dynamic Client Registration, PKCE, RFC 9728 protected-resource metadata.</li>
                    <li>Consent UI at <a href="/oauth/consent" className="text-blue-600 hover:underline">/oauth/consent</a> with explicit scope review.</li>
                    <li>Active grants visible at <a href="/dashboard/integrations" className="text-blue-600 hover:underline">/dashboard/integrations</a> as a new Claude card. Disconnect with one click.</li>
                    <li>Access tokens 1-hour TTL, refresh tokens 90-day, both hashed at rest.</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">Read the <a href="/docs/mcp-server#claude-ai" className="text-blue-600 hover:underline">Claude (MCP Server) docs</a>.</p>
            </>
        ),
    },
    {
        date: '2026-04-29',
        title: 'OAuth connection management API',
        tag: 'new',
        body: (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><code>GET /api/oauth/connections</code> — list active OAuth grants for the org.</li>
                <li><code>POST /api/oauth/connections/revoke</code> — disconnect by <code>client_id</code> or all at once.</li>
                <li>Powers the Claude card on the Integrations page. Refresh-token rotation deduped by client.</li>
            </ul>
        ),
    },
    {
        date: '2026-04-29',
        title: 'AI Assistants section on the Integrations page',
        tag: 'new',
        body: (
            <p className="text-gray-600 leading-relaxed">
                New &quot;AI Assistants&quot; group on the Integrations dashboard with a Claude card. Flips to &quot;Connected&quot; once you authorize via claude.ai. Manage button links straight to the API &amp; MCP page. Official Anthropic, HubSpot, and Salesforce brand SVGs served from <code>/brands/</code>.
            </p>
        ),
    },
    {
        date: '2026-04-29',
        title: 'Pricing: + API on Starter and Pro',
        tag: 'improved',
        body: (
            <p className="text-gray-600 leading-relaxed">
                All paid tiers (Starter, Pro, Growth, Scale) now show <strong>+ API</strong> in the credits feature line. JSON-LD descriptions and FAQ updated to match. <a href="/pricing" className="text-blue-600 hover:underline">/pricing</a>.
            </p>
        ),
    },
    {
        date: '2026-04-29',
        title: 'Onboarding fix: Google OAuth signup respects /onboarding',
        tag: 'fix',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Personal Gmail signups now successfully reach the &quot;Name your organization&quot; step. The <code>/onboarding</code> route is on the public-pages allowlist in the Next.js middleware so unauthenticated users with only the <code>pending_token</code> cookie aren&apos;t bounced to the landing page.
            </p>
        ),
    },
    {
        date: '2026-04-28',
        title: 'Consent audit trail + compliance fields',
        tag: 'new',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Every ToS and Privacy acceptance is now recorded with version numbers, timestamps, and IP. Re-acceptance modal fires when a new version ships. Powers GDPR / data-rights reporting at <a href="/dashboard/data-rights" className="text-blue-600 hover:underline">/dashboard/data-rights</a>.
            </p>
        ),
    },
    {
        date: '2026-04-27',
        title: 'Lead protection layer — 11 audit fixes',
        tag: 'improved',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Closed 11 audit gaps across the lead protection pipeline: tighter dual-enrollment detection, sharper held-state transitions, cleaner per-mailbox risk caps for YELLOW leads. See <a href="/docs/risk-scoring" className="text-blue-600 hover:underline">Risk Scoring</a>.
            </p>
        ),
    },
    {
        date: '2026-04-27',
        title: '5-phase healing pipeline — 18 audit fixes',
        tag: 'improved',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Healing pipeline (Pause → Quarantine → Restricted Send → Warm Recovery → Healthy) hardened across 18 audit findings: stricter graduation criteria, cleaner phase-transition events, better Slack alert context. See <a href="/docs/warmup-recovery" className="text-blue-600 hover:underline">Warmup &amp; Recovery</a>.
            </p>
        ),
    },
    {
        date: '2026-04-25',
        title: 'Marketing site: Mailivery-style design',
        tag: 'improved',
        body: (
            <p className="text-gray-600 leading-relaxed">
                All 69 blog posts and product pages converted to a unified centered-column layout with sticky left TOC, brand-cream background (<code>#F7F2EB</code>), and a dark CTA strip. Faster to scan, consistent across the site.
            </p>
        ),
    },
    {
        date: '2026-04-25',
        title: 'Pricing schema: SoftwareApplication + AggregateOffer',
        tag: 'improved',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Replaced the legacy ItemList nesting with the canonical <code>SoftwareApplication</code> + <code>AggregateOffer</code> JSON-LD pattern (lowPrice $0, highPrice $349, offerCount 5). Each tier has its own <code>UnitPriceSpecification</code> with <code>billingDuration: P1M</code>. Better for Google rich-result eligibility and AI-overview citation.
            </p>
        ),
    },
    {
        date: '2026-04-25',
        title: '7 new SEO blog posts',
        tag: 'new',
        body: (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Smartlead alternatives</li>
                <li>Instantly alternatives</li>
                <li>EmailBison alternatives</li>
                <li>Woodpecker alternatives</li>
                <li>Lemlist alternatives</li>
                <li>Cheapest cold email tools of 2026</li>
                <li>Top 7 cold email tools of 2026</li>
            </ul>
        ),
    },
    {
        date: '2026-04-25',
        title: 'Bing IndexNow + Webmaster compliance',
        tag: 'new',
        body: (
            <p className="text-gray-600 leading-relaxed">
                IndexNow protocol implemented for instant Bing/Yandex indexation on publish. Bing Webmaster Tools verification + sitemap.xml registered. Marketing pages now picked up within hours instead of days.
            </p>
        ),
    },
    {
        date: '2026-04-24',
        title: 'Bounce threshold reframing across docs and blog',
        tag: 'improved',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Eight blog posts and the platform-rules doc updated to reflect the actual threshold: <strong>3% bounce rate after 60+ sends, with a 5-bounce safety net</strong> for low-volume mailboxes. Replaces the previous &quot;Pause at 5 bounces&quot; phrasing which was confusing for high-volume senders.
            </p>
        ),
    },
    {
        date: '2026-04-24',
        title: 'Reply.io: roadmap, not shipped',
        tag: 'fix',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Cleaned up 9 stale references that implied Reply.io was a connected protection platform. Shipped Protection-mode platforms today: <strong>Smartlead, Instantly, EmailBison</strong>. Reply.io is on the roadmap (target Q2 2026).
            </p>
        ),
    },
    {
        date: '2026-04-24',
        title: 'Postmaster Tools integration (feature-flagged)',
        tag: 'new',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Google Postmaster Tools OAuth + reputation read API. Feature-flagged on Growth/Scale tiers — domain reputation pulled directly from Google&apos;s view, not just our own bounce-rate inference. Surfaces in the domain detail view at <a href="/dashboard/domains" className="text-blue-600 hover:underline">/dashboard/domains</a>.
            </p>
        ),
    },
    {
        date: '2026-04-22',
        title: 'Migration tools: Smartlead and Instantly v2',
        tag: 'new',
        body: (
            <p className="text-gray-600 leading-relaxed">
                One-click imports for teams switching from Smartlead and Instantly. Pulls campaigns, sequences, leads, block list, and mailbox metadata. API keys auto-discard after 24h. See <a href="/docs/migration/from-smartlead" className="text-blue-600 hover:underline">Migrate from Smartlead</a> and <a href="/docs/migration/from-instantly" className="text-blue-600 hover:underline">Migrate from Instantly</a>.
            </p>
        ),
    },
    {
        date: '2026-04-15',
        title: 'MCP Server v1.0 (stdio)',
        tag: 'new',
        body: (
            <p className="text-gray-600 leading-relaxed">
                Initial Model Context Protocol server published as <code>@superkabe/mcp-server</code> on npm. 17 tools exposed over stdio for Claude Desktop, Claude Code, Cursor, and Continue. (Browser/OAuth flow shipped April 29 — see top of changelog.)
            </p>
        ),
    },
];

function formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
}

export default function ChangelogPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                What&apos;s New
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Every shipped feature, integration, and platform improvement at Superkabe — newest first.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-10">
                <p className="text-sm text-blue-900 m-0">
                    Subscribe to product updates by email — visit <a href="/dashboard/settings" className="underline">Settings → Notifications</a> in the dashboard. Or follow our <a href="/blog" className="underline">blog</a> for deep-dives on each release.
                </p>
            </div>

            <div className="space-y-10">
                {ENTRIES.map((e, i) => (
                    <article key={i} className="bg-white border border-gray-200 p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <time className="text-xs font-mono text-gray-500" dateTime={e.date}>
                                {formatDate(e.date)}
                            </time>
                            {e.tag && <TagPill tag={e.tag} />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 m-0 mb-3">{e.title}</h2>
                        <div className="text-gray-700">{e.body}</div>
                    </article>
                ))}
            </div>

            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Older releases</h3>
                <p className="text-gray-600 leading-relaxed mb-3">
                    Older releases are archived but searchable in our blog. The earliest production deployments date to October 2025.
                </p>
                <ul className="space-y-2">
                    <li><a href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">→ Browse the blog</a></li>
                    <li><a href="/docs/getting-started" className="text-blue-600 hover:text-blue-700 font-medium">→ Quick Start</a></li>
                    <li><a href="/release-notes" className="text-blue-600 hover:text-blue-700 font-medium">→ Release notes (engineering)</a></li>
                </ul>
            </div>
        </div>
    );
}

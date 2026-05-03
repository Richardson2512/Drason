import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Apollo.io Integration | Superkabe Docs',
    description: 'Connect Apollo.io to Superkabe — paste any Apollo people-search, saved-search, or saved-list URL and Superkabe replays the search via the official Apollo API to import contacts as leads.',
    alternates: { canonical: '/docs/integrations/apollo' },
    openGraph: {
        title: 'Apollo.io Integration | Superkabe Docs',
        description: 'Connect Apollo.io to Superkabe — paste any Apollo people-search, saved-search, or saved-list URL and Superkabe replays the search via the official Apollo API to import contacts as leads.',
        url: '/docs/integrations/apollo',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function ApolloIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Apollo.io Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Paste an Apollo URL — Superkabe replays the search via the official Apollo API and imports contacts as leads.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>URL-paste import.</strong> Paste any <code>app.apollo.io</code> people-search, saved-search, or saved-list URL. Superkabe parses the filters, previews the result count, and pulls contacts via Apollo&apos;s official <code>/v1/mixed_people/search</code> endpoint.</li>
                <li><strong>Credit-aware.</strong> Personal-email reveal is opt-in. With reveal off, Superkabe pulls profile data only — credits flow only when reveal is on (~1 credit per contact via Apollo&apos;s <code>/v1/people/bulk_match</code>).</li>
                <li><strong>Capped + idempotent.</strong> Set a hard cap per import (default ceiling 50,000 — Apollo&apos;s own per-search max). Re-running the same URL upserts on email — you won&apos;t get duplicate leads.</li>
                <li><strong>Resumable.</strong> Imports paginate one page per tick. If the worker restarts mid-job, the cursor + page counter pick back up exactly where it left off.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Connect Apollo</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                <li>In Apollo, go to <strong>Settings → Integrations → API</strong> and create a new API key. Apollo requires a <strong>paid plan with API access</strong> (Professional or higher) for the search endpoints to return data — the free tier returns <code>403</code>.</li>
                <li>Copy the key. In Superkabe: <strong>Dashboard → Integrations → Apollo.io → Connect Apollo</strong>. Paste the key and click Connect. Superkabe validates against <code>/v1/auth/health</code> and stores the key encrypted at rest (AES-256-GCM).</li>
                <li>Once connected, click <strong>Manage import</strong> on the connection card to open the import wizard.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Run an import</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                <li>In Apollo, build a search the way you normally would. Copy the URL straight from your browser&apos;s address bar.</li>
                <li>Paste it into the Superkabe import wizard and click <strong>Preview</strong>. Superkabe parses the filters, shows you a human-readable summary, and runs a 1-record search to estimate the total count (no credits consumed for the preview).</li>
                <li>Optionally pick a target campaign and tighten the cap. Decide whether to reveal personal emails (toggle off if you only need profile data).</li>
                <li>Click <strong>Start import</strong>. The job is queued and the worker pulls one page per tick (~100 contacts/tick). The recent-imports table updates live.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Supported Apollo URL shapes</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><code>https://app.apollo.io/#/people?personTitles[]=…&personLocations[]=…</code> — live people-search filters</li>
                <li><code>https://app.apollo.io/#/people?searchId=…</code> — saved search by ID</li>
                <li><code>https://app.apollo.io/#/people-search/lists/show/&lt;listId&gt;</code> — saved contact list</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
                Filters Superkabe recognizes today: titles, seniorities, person + organization locations, departments, industries, employee-count ranges, funding stages, technologies, keywords. Anything Superkabe can&apos;t map is logged and ignored — you&apos;ll see exactly which filters were applied in the preview.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Limits + safety</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Per-search cap.</strong> Apollo&apos;s own ceiling is 50,000 records per search — Superkabe enforces this defensively. The wizard&apos;s cap field clamps to that.</li>
                <li><strong>Rate-limits.</strong> Apollo returns <code>429</code> with <code>Retry-After</code> when a per-minute / per-hour / per-day budget is exceeded. Superkabe honors the header once before failing the page.</li>
                <li><strong>Disconnect wipes the key.</strong> Clicking Disconnect on the connection card overwrites <code>api_key_encrypted</code> with an empty value and cancels any in-flight imports. Imported leads stay; only the connection is removed.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Privacy + compliance</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                When you import from Apollo, you&apos;re responsible for ensuring you have a lawful basis to email the contacts you&apos;re pulling — Superkabe is the processor, you&apos;re the controller. Imported leads enter the same lifecycle as Clay/CSV-ingested leads: validation, suppression checks, unsubscribe handling, and CAN-SPAM / CASL / GDPR enforcement at send-time.
            </p>
            <p className="text-gray-600 leading-relaxed">
                Apollo&apos;s data terms also require that you stop emailing a contact if they unsubscribe. Superkabe&apos;s suppression list does this automatically — every unsubscribe / hard-bounce / spam-complaint flips the lead&apos;s <code>unsubscribed_at</code> globally for your workspace, across all campaigns.
            </p>
        </div>
    );
}

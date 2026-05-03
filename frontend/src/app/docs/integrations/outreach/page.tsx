import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Outreach Integration | Superkabe Docs',
    description: 'Connect Outreach.io via OAuth and export your Superkabe cold call list directly into an Outreach sequence — pick from existing sequences or create a new one inline.',
    alternates: { canonical: '/docs/integrations/outreach' },
    openGraph: {
        title: 'Outreach Integration | Superkabe Docs',
        description: 'Connect Outreach.io via OAuth and export your Superkabe cold call list directly into an Outreach sequence — pick from existing sequences or create a new one inline.',
        url: '/docs/integrations/outreach',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function OutreachIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Outreach Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Push your Superkabe cold call list straight into an Outreach sequence. One click from the cold-call list page; idempotent on email; no CSV juggling.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Cold-call-list export.</strong> The cold-call list page gets an <strong>Export to Outreach</strong> button alongside Download CSV. Click it to push every prospect on the list into a chosen Outreach sequence under a chosen mailbox.</li>
                <li><strong>Pick or create.</strong> The sequence dropdown lists every enabled sequence in your Outreach workspace. The first option is <strong>+ Create new sequence</strong>, which spins up an empty sequence inline — you fill the steps inside Outreach&apos;s editor.</li>
                <li><strong>Idempotent.</strong> Prospects are upserted on email; re-exporting the same list never creates duplicates. Already-in-sequence prospects are skipped, not re-added.</li>
                <li><strong>Background-safe.</strong> Each export runs as a background job — close the tab and Superkabe finishes the push. Status updates land in the recent-exports table on the Outreach integration page.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">One-time setup (admin)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                You only do this once per Superkabe deployment. Customers connect to your central Outreach OAuth app — they never have to register their own.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Register a Superkabe OAuth app in Outreach</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                <li>Sign in at <a href="https://accounts.outreach.io/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">accounts.outreach.io</a> with the developer-account user that should own the app.</li>
                <li>App Management → New OAuth Application → name it &quot;Superkabe&quot;, add a logo + description.</li>
                <li>Set the <strong>Redirect URI</strong> to:
                    <div className="bg-gray-50 border border-gray-200 p-3 my-2"><code className="text-blue-600">https://api.superkabe.com/api/integrations/outreach/callback</code></div>
                </li>
                <li>Add OAuth scopes:
                    <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                        <li><code>profile.read</code></li>
                        <li><code>prospects.read</code> + <code>prospects.write</code></li>
                        <li><code>sequences.read</code> + <code>sequences.write</code></li>
                        <li><code>sequenceStates.write</code></li>
                        <li><code>mailboxes.read</code></li>
                        <li><code>tags.read</code></li>
                    </ul>
                </li>
                <li>Save → grab the <strong>Application ID</strong> and <strong>Application Secret</strong> from the app detail page.</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Set the env vars</h3>
            <p className="text-gray-600 mb-3">Add these to Railway (production) or your <code>.env</code> (local):</p>
            <div className="bg-gray-900 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-emerald-400 m-0 whitespace-pre">{`OUTREACH_CLIENT_ID=…
OUTREACH_CLIENT_SECRET=…
OUTREACH_REDIRECT_URI=https://api.superkabe.com/api/integrations/outreach/callback`}</pre>
            </div>
            <p className="text-gray-600">Restart the backend. The first user to click <strong>Connect Outreach</strong> on the integrations page is bounced to Outreach&apos;s consent screen, approves the scopes, and lands back on Superkabe with a green Connected badge.</p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">User flow (per customer)</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                <li><strong>Connect.</strong> Dashboard → Integrations → Outreach → Connect Outreach. The user approves the OAuth scopes once. Outreach rotates refresh tokens on every refresh — Superkabe writes the new tokens back automatically.</li>
                <li><strong>Open the cold call list.</strong> Either Today&apos;s Call List or any Custom List you&apos;ve generated. Click <strong>Export to Outreach</strong> next to Download CSV.</li>
                <li><strong>Pick (or create) a sequence.</strong> The dropdown shows your enabled sequences with their active-prospect count. Pick one, or pick <strong>+ Create new sequence…</strong> and name it inline. The new sequence is created empty — you fill the steps inside Outreach&apos;s editor.</li>
                <li><strong>Pick a mailbox.</strong> Sequences run under a specific Outreach mailbox; pick the one to send through.</li>
                <li><strong>Export.</strong> Click <strong>Export</strong>. The job is queued and runs in the background. Watch progress in the recent-exports table on the Outreach integration page (or refresh the cold-call list page).</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Limits + behavior</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Per-export cap.</strong> 5,000 prospects per export. Larger lists should be split — Outreach&apos;s own per-call rate limits make a single 50K push impractical anyway.</li>
                <li><strong>Tags.</strong> Every prospect Superkabe creates is tagged <code>Superkabe</code> in Outreach so you can filter for them later.</li>
                <li><strong>Re-exports.</strong> Re-exporting the same list to the same sequence is a no-op for already-in prospects. Prospects in other sequences aren&apos;t affected.</li>
                <li><strong>Disconnect wipes tokens.</strong> Disconnect from the integration page wipes the encrypted access + refresh tokens and cancels any in-flight exports. Prospects already pushed to Outreach stay in Outreach.</li>
                <li><strong>Rate-limits.</strong> Outreach returns <code>429</code> with <code>Retry-After</code> when you exceed your account-wide budget. Superkabe honors the header once before failing the chunk; the worker resumes from the next prospect on the next tick.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Privacy + compliance</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                When you export from Superkabe, you&apos;re responsible for ensuring your prospects have a lawful basis (consent, legitimate interest, contract) for outbound contact under your jurisdiction&apos;s rules — Superkabe is the processor, you&apos;re the controller of both the source data and what happens once it lands in Outreach.
            </p>
            <p className="text-gray-600 leading-relaxed">
                Superkabe&apos;s suppression list still applies on the Superkabe side — leads marked <code>unsubscribed_at</code> in Superkabe will not be eligible for the cold call list in the first place, so they never reach Outreach. If a prospect unsubscribes inside Outreach later, that flag stays in Outreach; we don&apos;t pull data back from this integration.
            </p>
        </div>
    );
}

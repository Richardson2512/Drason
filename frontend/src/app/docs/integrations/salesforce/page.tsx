import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Salesforce Integration | Superkabe Docs',
    description: 'Connect Salesforce (production or sandbox) to Superkabe via OAuth — import contacts via SOQL or list view, write activities to the Task object, sync HasOptedOutOfEmail.',
    alternates: { canonical: '/docs/integrations/salesforce' },
    openGraph: {
        title: 'Salesforce Integration | Superkabe Docs',
        description: 'Connect Salesforce (production or sandbox) to Superkabe via OAuth — import contacts via SOQL or list view, write activities to the Task object, sync HasOptedOutOfEmail.',
        url: '/docs/integrations/salesforce',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SalesforceIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Salesforce Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Connect a production or sandbox Salesforce org via OAuth, import contacts using a list view or SOQL, and write every Superkabe activity to the Task object.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Contact import.</strong> Pick any Contact list view OR write a SOQL query — Superkabe paginates via REST and creates leads.</li>
                <li><strong>Activity push.</strong> Every Superkabe send/open/click/reply/bounce becomes a Salesforce Task (<code>WhoId</code> = the contact, <code>TaskSubtype</code> = Email, <code>Status</code> = Completed). Tasks render natively on the contact&apos;s Activity Timeline.</li>
                <li><strong>Suppression sync.</strong> Contacts with <code>HasOptedOutOfEmail = true</code> are pulled into Superkabe&apos;s block list.</li>
                <li><strong>Production AND sandbox.</strong> A radio at connect time picks the OAuth login host (<code>login.salesforce.com</code> vs. <code>test.salesforce.com</code>); Salesforce returns the <code>instance_url</code> Superkabe uses for every subsequent call.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">One-time setup (admin)</h2>
            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Create a Salesforce Connected App</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                <li>Sign in to a Salesforce org (production or DE org). Setup → App Manager → New Connected App.</li>
                <li>Name it &quot;Superkabe&quot;. Add a contact email + logo URL.</li>
                <li>Enable OAuth Settings.</li>
                <li>Set <strong>Callback URL</strong> to:
                    <div className="bg-gray-50 border border-gray-200 p-3 my-2"><code className="text-blue-600">https://api.superkabe.com/api/integrations/salesforce/callback</code></div>
                </li>
                <li>Selected OAuth scopes:
                    <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                        <li>Manage user data via APIs (<code>api</code>)</li>
                        <li>Perform requests at any time (<code>refresh_token</code>, <code>offline_access</code>)</li>
                    </ul>
                </li>
                <li>Save. Salesforce takes ~10 minutes to propagate.</li>
                <li>Open the new app — copy <strong>Consumer Key</strong> and <strong>Consumer Secret</strong>.</li>
                <li>(Recommended) Manage → Edit Policies → Permitted Users: <em>Admin approved users are pre-authorized</em>. Add the profile(s) that should be allowed to connect.</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Set the env vars</h3>
            <div className="bg-gray-900 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-emerald-400 m-0 whitespace-pre">{`SALESFORCE_CLIENT_ID=…
SALESFORCE_CLIENT_SECRET=…
SALESFORCE_REDIRECT_URI=https://api.superkabe.com/api/integrations/salesforce/callback`}</pre>
            </div>
            <p className="text-gray-600">Restart the backend. Logs should show <code>[CRM_REGISTRY] registered provider salesforce</code>.</p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">User flow (per customer)</h2>

            <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded-lg">
                <p className="text-sm text-amber-900 m-0 leading-relaxed">
                    <strong>What you&apos;ll see during consent:</strong> Salesforce displays a security warning on the consent screen for any third-party app that isn&apos;t AppExchange-verified — text along the lines of &quot;If someone contacted you via phone or email and instructed you to use this app, do not proceed.&quot; This is Salesforce&apos;s standard anti-phishing protection (added 2023) — it shows for every legitimate B2B integration on first connect to a new org. Since you arrived at the screen by clicking <strong>Connect Salesforce</strong> on your own Superkabe dashboard, it&apos;s safe to proceed. The warning only appears on the very first authorization; future token refreshes happen server-side without a consent screen. Enterprise admins who want to skip the warning entirely for their org can pre-authorize Superkabe via Profile permissions in Setup.
                </p>
            </div>

            <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                <li><strong>Connect.</strong> Dashboard → Integrations → CRM → Connect Salesforce → choose <strong>Production</strong> or <strong>Sandbox</strong>. User is bounced through Salesforce&apos;s OAuth screen, approves, lands back with their <code>instance_url</code> persisted.</li>
                <li><strong>Import.</strong> Manage Import → choose <strong>List view</strong> (recommended) or <strong>Custom SOQL</strong>. Map fields, click Start. The worker pages through results via Salesforce&apos;s <code>nextRecordsUrl</code>.</li>
                <li><strong>Activity push.</strong> Every Superkabe event is written as a Task on the matching Contact. Tasks show on the timeline immediately.</li>
                <li><strong>Disconnect.</strong> Same as HubSpot — tokens wiped, queue cancelled, links retained.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">SOQL examples</h2>
            <div className="bg-gray-50 border border-gray-200 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-gray-700 m-0">{`-- All contacts at companies in your ICP
SELECT Id, Email, FirstName, LastName, Title, Account.Name, Account.Industry
FROM Contact
WHERE Account.Industry IN ('Software', 'Information Technology and Services')
  AND Email != NULL
  AND HasOptedOutOfEmail = false
LIMIT 1000

-- Newly added contacts (last 7 days)
SELECT Id, Email, FirstName, LastName, Title, Account.Name
FROM Contact
WHERE CreatedDate = LAST_N_DAYS:7
  AND Email != NULL
ORDER BY CreatedDate DESC`}</pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What gets written to Salesforce</h2>
            <p className="text-gray-600 mb-3">Each Superkabe event becomes a Task with these fields:</p>
            <div className="bg-gray-50 border border-gray-200 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-gray-700 m-0">{`Subject:       "Superkabe — Email opened: <subject>"
Description:   <full body + metadata + timestamp>
Status:        Completed
Priority:      Normal
ActivityDate:  YYYY-MM-DD (event occurred_at)
WhoId:         <Contact.Id>
TaskSubtype:   Email`}</pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Rate limits, retries, limitations</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Salesforce REST API call limits are per-org per-24h (varies by tier). The activity-push worker batches imports per tick and respects <code>503 + Retry-After</code>.</li>
                <li>Token refresh is automatic on 401 — the <code>instance_url</code> from the refresh response replaces the stored one (covers My Domain migrations).</li>
                <li>v1 uses REST <code>/query</code> with <code>nextRecordsUrl</code> pagination. Bulk API 2.0 graduates in Phase 4 for imports &gt;25,000 contacts.</li>
                <li>Custom Object support and AppExchange listing are on the roadmap.</li>
                <li>Sandbox connections detect their environment from the returned <code>instance_url</code> so refresh always hits the right login host.</li>
            </ul>

            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li><a href="/dashboard/integrations/crm" className="text-blue-600 hover:text-blue-700 font-medium">→ Connect Salesforce now</a></li>
                    <li><a href="/docs/integrations/hubspot" className="text-blue-600 hover:text-blue-700 font-medium">→ HubSpot setup</a></li>
                    <li><a href="/docs/disconnecting" className="text-blue-600 hover:text-blue-700 font-medium">→ Revoke / disconnect</a></li>
                </ul>
            </div>
        </div>
    );
}

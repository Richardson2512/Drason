import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Instantly Integration | Superkabe Docs',
    description: 'Layer Superkabe protection on Instantly - one API key, no rebuild. Auto-pause at 3% bounce, 5-phase healing, ESP-aware routing on Instantly mailboxes.',
    alternates: { canonical: '/docs/integrations/instantly' },
    openGraph: {
        title: 'Instantly Integration | Superkabe Docs',
        description: 'Layer Superkabe protection on top of Instantly - one API key, no sequence rebuild.',
        url: '/docs/integrations/instantly',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function InstantlyIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Instantly Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Plug Superkabe&apos;s protection layer into your existing Instantly workspace. Sequences, warmup, and the lead database keep working exactly as before.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Event ingestion.</strong> Superkabe ingests every Instantly send / open / click / reply / bounce / complaint event via webhook.</li>
                <li><strong>Auto-pause enforcement.</strong> At 3% bounce rate after 60-send minimum, Superkabe calls the Instantly API to pause the affected mailbox.</li>
                <li><strong>5-phase healing.</strong> Paused mailboxes graduate through Pause - Quarantine - Restricted Send - Warm Recovery - Healthy automatically.</li>
                <li><strong>ESP-aware routing.</strong> 30-day per-recipient-ESP scoring drives lead-to-mailbox assignment.</li>
                <li><strong>DNSBL monitoring.</strong> 400+ DNSBLs checked every 6-24 hours for every Instantly-connected domain.</li>
                <li><strong>Warmup respect.</strong> Instantly&apos;s bundled warmup network continues to run; warmup traffic is excluded from auto-pause threshold calculations.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Setup</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Get your Instantly API key</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Log into Instantly. Settings - API keys. Create a key with read/write scopes for campaigns, mailboxes, and events. Copy the key.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Paste it into Superkabe</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Dashboard - Integrations - Sending platforms - Instantly - Connect. Paste the API key. Superkabe validates against Instantly&apos;s API and lists your Instantly mailboxes for confirmation.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Confirm the mailbox list</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe shows every Instantly mailbox the API key can access. By default all are enrolled into the protection layer. Uncheck any you want to exclude. Click <strong>Enable protection</strong>.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Configure thresholds (optional)</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Defaults: 3% bounce-rate pause, 60-send minimum, 2% warning, 5-bounce safety net. Override per workspace in Dashboard - Settings - Protection rules.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Webhook configuration</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Auto-configured when the API key is added. To verify or re-configure manually:
            </p>
            <div className="bg-gray-900 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-emerald-400 m-0 whitespace-pre">{`Webhook URL:  https://api.superkabe.com/api/webhooks/instantly/<workspace_id>
Events:       email_sent, email_opened, email_clicked, email_replied,
              email_bounced, email_complained, email_unsubscribed
Method:       POST
Auth:         HMAC signature in X-Instantly-Signature header`}</pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What about Instantly&apos;s bundled features?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Sequences, the bundled warmup network, the B2B lead database, and the unified inbox all continue to work as before. The protection layer does not touch them. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Warmup.</strong> Warmup sends are recognized and excluded from bounce-rate thresholds. You can keep using Instantly&apos;s warmup network indefinitely.</li>
                <li><strong>Lead database.</strong> Leads sourced from Instantly&apos;s database flow through Superkabe&apos;s validation gate the same as leads sourced anywhere else.</li>
                <li><strong>Unified inbox.</strong> Reply triage continues to happen inside Instantly. Reply events are also ingested into the Superkabe lead timeline for cross-channel halt with Super LinkedIn.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Rate limits and reliability</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Instantly returns <code>429</code> on rate-limit breaches. The Superkabe client honors <code>Retry-After</code> automatically.</li>
                <li>Pause/resume commands queue with exponential backoff if Instantly is temporarily unreachable.</li>
                <li>Webhook deliveries deduplicate on <code>(workspace_id, event_id)</code> - retries do not double-count.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Disconnecting</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Dashboard - Integrations - Instantly - Disconnect. The API key is wiped, queued pause commands are cancelled, and Instantly mailboxes resume operation without Superkabe&apos;s protection. Audit history and reputation scoring are retained for clean reconnection.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><Link href="/product/instantly-infrastructure-protection" className="text-blue-600 hover:underline">Instantly Infrastructure Protection</Link> - the product overview</li>
                <li><Link href="/blog/superkabe-vs-instantly" className="text-blue-600 hover:underline">Superkabe vs Instantly</Link> - head-to-head if you are considering migrating off Instantly entirely</li>
                <li><Link href="/docs/multi-platform-sync" className="text-blue-600 hover:underline">Multi-platform sync</Link> - how Instantly events flow into the canonical event stream</li>
                <li><Link href="/docs/data-sync-coverage" className="text-blue-600 hover:underline">Data sync coverage</Link> - per-event-type coverage matrix</li>
            </ul>
        </div>
    );
}

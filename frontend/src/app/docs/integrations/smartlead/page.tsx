import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Smartlead Integration | Superkabe Docs',
    description: 'Layer Superkabe protection on Smartlead - one API key, no rebuild. Auto-pause at 3% bounce, 5-phase healing, ESP-aware routing on Smartlead mailboxes.',
    alternates: { canonical: '/docs/integrations/smartlead' },
    openGraph: {
        title: 'Smartlead Integration | Superkabe Docs',
        description: 'Layer Superkabe protection on top of Smartlead - one API key, no sequence rebuild.',
        url: '/docs/integrations/smartlead',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SmartleadIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smartlead Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Plug Superkabe&apos;s protection layer into your existing Smartlead workspace. No sequence rebuild, no mailbox reconfiguration.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Event ingestion.</strong> Superkabe ingests every Smartlead send / open / click / reply / bounce / complaint event via webhook.</li>
                <li><strong>Auto-pause enforcement.</strong> At 3% bounce rate after 60-send minimum, Superkabe calls the Smartlead API to pause the affected mailbox.</li>
                <li><strong>5-phase healing.</strong> Paused mailboxes graduate through Pause - Quarantine - Restricted Send - Warm Recovery - Healthy automatically.</li>
                <li><strong>ESP-aware routing.</strong> 30-day per-recipient-ESP scoring drives lead-to-mailbox assignment via Smartlead&apos;s assignment API.</li>
                <li><strong>DNSBL monitoring.</strong> 400+ DNSBLs checked every 6-24 hours for every Smartlead-connected domain.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Setup</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Get your Smartlead API key</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Log into Smartlead. Settings - API. Copy the workspace API key. You need owner or admin permissions to access this.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Paste it into Superkabe</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Dashboard - Integrations - Sending platforms - Smartlead - Connect. Paste the API key. Superkabe validates the key against Smartlead&apos;s API and lists your Smartlead mailboxes for confirmation.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Confirm the mailbox list</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe shows every Smartlead mailbox the API key has access to. By default all mailboxes are enrolled into the protection layer; uncheck any you want to exclude. Click <strong>Enable protection</strong>.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Configure thresholds (optional)</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Defaults: 3% bounce-rate pause, 60-send minimum, 2% warning, 5-bounce absolute safety net. Override per-workspace in Dashboard - Settings - Protection rules.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Webhook configuration</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe auto-configures Smartlead&apos;s outbound webhook to the Superkabe ingestion endpoint when the API key is added. If you need to verify or re-configure manually:
            </p>
            <div className="bg-gray-900 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-emerald-400 m-0 whitespace-pre">{`Webhook URL:  https://api.superkabe.com/api/webhooks/smartlead/<workspace_id>
Events:       email.sent, email.opened, email.clicked, email.replied,
              email.bounced, email.complaint, email.unsubscribed
Method:       POST
Auth:         HMAC signature in X-Smartlead-Signature header`}</pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What changes inside Smartlead</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Operationally very little. Sequences, mailbox rotation, and the Smartlead UI continue to work exactly as before. The only visible change is that mailboxes occasionally pause without anyone clicking pause - and resume without anyone clicking resume. The Superkabe dashboard records exactly which rule triggered each action with the underlying telemetry.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Rate limits and reliability</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Smartlead returns <code>429</code> on rate-limit breaches. The Superkabe client honors <code>Retry-After</code> automatically.</li>
                <li>Pause/resume commands queue with exponential backoff if Smartlead is temporarily unreachable (1m, 5m, 15m, 1h, 4h, 12h).</li>
                <li>Webhook deliveries are deduplicated on <code>(workspace_id, event_id)</code> - duplicate Smartlead retries do not double-count.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Disconnecting</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Dashboard - Integrations - Smartlead - Disconnect. The API key is wiped, queued pause commands are cancelled, and Smartlead mailboxes resume normal operation without Superkabe&apos;s protection layer. Audit history and the mailbox reputation scoring are retained so reconnecting later picks up seamlessly.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><Link href="/product/smartlead-deliverability-protection" className="text-blue-600 hover:underline">Smartlead Deliverability Protection</Link> - the product overview</li>
                <li><Link href="/docs/multi-platform-sync" className="text-blue-600 hover:underline">Multi-platform sync</Link> - how Smartlead events flow into the canonical event stream</li>
                <li><Link href="/docs/data-sync-coverage" className="text-blue-600 hover:underline">Data sync coverage</Link> - per-event-type coverage matrix</li>
                <li><Link href="/blog/why-smartlead-emails-going-to-spam" className="text-blue-600 hover:underline">Why Smartlead emails go to spam</Link> - diagnosis playbook for protected workspaces</li>
            </ul>
        </div>
    );
}

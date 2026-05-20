import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Multi-Platform Sync | Superkabe Docs',
    description: 'How Superkabe ingests delivery events from Smartlead, Instantly, EmailBison, and the native sequencer, and applies one governance layer across all.',
    alternates: { canonical: '/docs/multi-platform-sync' },
    openGraph: {
        title: 'Multi-Platform Sync | Superkabe Docs',
        description: 'How Superkabe synchronizes delivery events across every connected sending platform and applies unified governance.',
        url: '/docs/multi-platform-sync',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function MultiPlatformSyncDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Multi-Platform Sync
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                One ingestion layer, every sending platform, one canonical event stream.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What multi-platform sync does</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Superkabe ingests delivery events (send, open, click, reply, bounce, complaint, deferral) from every connected sending platform - Smartlead, Instantly, EmailBison, and the native sequencer - in real time. Each platform speaks a slightly different webhook dialect; the sync layer normalizes everything into one canonical event schema, then feeds it to the rule engine that powers auto-pause, healing, and ESP-aware routing.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How a single event flows</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                <li><strong>Platform emits a webhook.</strong> Smartlead, Instantly, or EmailBison fires the webhook on every send/open/click/reply/bounce/complaint event.</li>
                <li><strong>Adapter normalizes.</strong> Each platform has a dedicated adapter (<code>src/services/adapters/smartleadAdapter.ts</code>, <code>instantlyAdapter.ts</code>, <code>emailbisonAdapter.ts</code>) that maps platform-specific fields to Superkabe&apos;s canonical event shape.</li>
                <li><strong>Event lands in the ingestion table.</strong> The normalized event is written to <code>connected_account_events</code> with a stable composite key <code>(platform, remote_event_id)</code> so duplicate webhooks deduplicate at insert time.</li>
                <li><strong>Rule engine picks it up.</strong> The same rule engine that runs against native sequencer events runs against the normalized event. Bounce-rate enforcement, healing transitions, and ESP-routing updates all fire identically regardless of upstream platform.</li>
                <li><strong>Action flows back.</strong> If the rule engine decides to pause a mailbox, it calls the platform&apos;s pause endpoint via the same adapter (this time in the outbound direction). The platform UI reflects the pause; the audit log records the decision.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Coverage by platform</h2>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Platform</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Ingestion</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Outbound (pause/resume)</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Auth</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">Smartlead</td>
                            <td className="py-3 px-4 text-gray-600">Webhook</td>
                            <td className="py-3 px-4 text-gray-600">REST</td>
                            <td className="py-3 px-4 text-gray-600">Workspace API key</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">Instantly</td>
                            <td className="py-3 px-4 text-gray-600">Webhook</td>
                            <td className="py-3 px-4 text-gray-600">REST</td>
                            <td className="py-3 px-4 text-gray-600">Workspace API key</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">EmailBison</td>
                            <td className="py-3 px-4 text-gray-600">Webhook</td>
                            <td className="py-3 px-4 text-gray-600">REST</td>
                            <td className="py-3 px-4 text-gray-600">Workspace API key</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 font-semibold text-gray-800">Native sequencer</td>
                            <td className="py-3 px-4 text-gray-600">Direct DB</td>
                            <td className="py-3 px-4 text-gray-600">Direct DB</td>
                            <td className="py-3 px-4 text-gray-600">Native</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
                Coverage detail per event type is documented under <Link href="/docs/data-sync-coverage" className="text-blue-600 hover:underline">data sync coverage</Link>.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What happens if a platform is unreachable</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Ingestion continues from every other connected platform. Outbound pause/resume commands queue with exponential backoff (1m, 5m, 15m, 1h, 4h, 12h). When the affected platform returns, queued commands flush in order. If a bounce-rate threshold was breached during the outage, the resulting pause executes on reconnect - so reputation protection is never bypassed by an upstream outage.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How idempotency is enforced</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Every ingested event carries a composite key <code>(platform, remote_event_id)</code>. The ingestion table has a unique index on that key, so duplicate webhook deliveries (which happen routinely - platforms retry aggressively) are silently dropped at the database layer. The rule engine sees each logical event exactly once.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><Link href="/docs/data-sync-coverage" className="text-blue-600 hover:underline">Data sync coverage</Link> - per-event-type, per-platform support matrix</li>
                <li><Link href="/docs/platform-rules" className="text-blue-600 hover:underline">Platform rules</Link> - rate limits and ESP-specific constraints applied per platform</li>
                <li><Link href="/docs/webhooks" className="text-blue-600 hover:underline">Webhooks</Link> - configuring webhook delivery to and from Superkabe</li>
                <li><Link href="/product/multi-platform-outbound-protection" className="text-blue-600 hover:underline">Multi-platform outbound protection</Link> - the governance layer that consumes this sync data</li>
            </ul>
        </div>
    );
}

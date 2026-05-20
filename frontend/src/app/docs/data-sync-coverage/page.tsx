import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Data Sync Coverage | Superkabe Docs',
    description: 'Per-event-type, per-platform support matrix for Superkabe ingestion. What is captured from Smartlead, Instantly, EmailBison, and the native sequencer.',
    alternates: { canonical: '/docs/data-sync-coverage' },
    openGraph: {
        title: 'Data Sync Coverage | Superkabe Docs',
        description: 'Per-event-type, per-platform support matrix for Superkabe ingestion.',
        url: '/docs/data-sync-coverage',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DataSyncCoverageDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Data Sync Coverage
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                What every connected platform contributes to Superkabe analytics, broken down by event type.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
                The analytics dashboard, the bounce-rate enforcement engine, the healing pipeline, and the ESP-aware routing logic all consume the same canonical event stream described in <Link href="/docs/multi-platform-sync" className="text-blue-600 hover:underline">multi-platform sync</Link>. This page documents exactly which event types each connected platform contributes - so when an analytics number looks off, you can trace it back to its origin without guessing.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Event coverage matrix</h2>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Event</th>
                            <th className="py-3 px-4 text-center font-bold text-gray-900">Smartlead</th>
                            <th className="py-3 px-4 text-center font-bold text-gray-900">Instantly</th>
                            <th className="py-3 px-4 text-center font-bold text-gray-900">EmailBison</th>
                            <th className="py-3 px-4 text-center font-bold text-gray-900">Native</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">send</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">open</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">click</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">reply</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">bounce (hard)</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                            <td className="py-3 px-4 text-center text-green-700 font-bold">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">bounce (soft)</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-yellow-700">Partial</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">complaint (FBL)</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-yellow-700">Partial</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">deferral</td>
                            <td className="py-3 px-4 text-center text-yellow-700">Partial</td>
                            <td className="py-3 px-4 text-center text-yellow-700">Partial</td>
                            <td className="py-3 px-4 text-center text-gray-400">No</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 font-semibold text-gray-800">unsubscribe</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                            <td className="py-3 px-4 text-center text-green-700">Full</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
                <strong>Full</strong> means the event is captured in real time with all relevant metadata (timestamp, recipient ESP, bounce code, etc.). <strong>Partial</strong> means the event is captured but with reduced metadata (typically just the timestamp and the recipient). <strong>No</strong> means the platform does not emit this event type; the rule engine compensates by inferring it from adjacent signals when possible.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How partial coverage is handled</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                When a platform delivers a partial event (e.g., a bounce with no SMTP response code), Superkabe&apos;s rule engine falls back to conservative defaults. A bounce without classification is treated as soft-bounce for threshold counting but still contributes to total bounce count - so the 5-bounce safety net still trips correctly. The dashboard surfaces partial events with a small icon so operators can see when classification was inferred vs reported.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Where deferrals matter</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Deferrals are temporary delivery delays (typically a 4xx SMTP response) and matter most for early fatigue detection. The native sequencer captures every deferral; Smartlead and Instantly capture some via webhook (typically only the deferrals that ultimately result in a bounce or delayed delivery). When deferral data is incomplete, the fatigue-detection engine uses bounce/complaint trends instead - so the protection layer still operates, it just has slightly less early-warning signal.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Refreshing back-filled history</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                When a new platform is first connected, the ingestion worker back-fills the most recent 30 days of events (or 60 days for hard bounces and complaints, since those have longer-tail reputation impact). After back-fill completes, ongoing ingestion is webhook-driven. To force a re-back-fill (e.g. after an API key rotation revealed missing data), use the Re-sync button on the platform&apos;s Integrations card.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><Link href="/docs/multi-platform-sync" className="text-blue-600 hover:underline">Multi-platform sync</Link> - how the ingestion pipeline works end to end</li>
                <li><Link href="/docs/help/analytics" className="text-blue-600 hover:underline">Analytics dashboard</Link> - how synced events show up in the UI</li>
                <li><Link href="/docs/help/bounce-classification" className="text-blue-600 hover:underline">Bounce classification</Link> - how hard/soft/transient classification is applied</li>
            </ul>
        </div>
    );
}

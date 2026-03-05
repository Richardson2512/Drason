import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Data Sync Coverage by Platform | Superkabe Docs',
    description: 'Understand exactly what data Superkabe can and cannot sync from Smartlead, Instantly, and EmailBison. Per-entity breakdown of historical vs real-time data availability for campaigns, mailboxes, leads, and domains.',
    alternates: { canonical: '/docs/data-sync-coverage' },
    openGraph: {
        title: 'Data Sync Coverage by Platform | Superkabe Docs',
        description: 'Understand exactly what data Superkabe can and cannot sync from Smartlead, Instantly, and EmailBison. Per-entity breakdown of historical vs real-time data availability for campaigns, mailboxes, leads, and domains.',
        url: '/docs/data-sync-coverage',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DataSyncCoveragePage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Data Sync Coverage by Platform
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Exactly what data Superkabe pulls from each sending platform, what it cannot pull, and why some metrics start at zero until webhooks accumulate real events.
            </p>

            {/* Quick Summary */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Key Principle</h2>
                <p className="text-blue-800 mb-4">
                    Superkabe only displays <strong>real, verified data</strong> from each platform's documented API endpoints and webhook events. We never estimate, proportionally distribute, or guess metrics. If a platform does not expose specific data through its API, that metric will remain at zero until real webhook events accumulate it.
                </p>
                <p className="text-blue-700 text-sm">
                    This means some metrics may appear empty immediately after connecting a platform. This is expected behavior, not a bug.
                </p>
            </div>

            {/* Smartlead Section */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Smartlead</h2>
            <p className="text-gray-600 mb-6">
                Smartlead provides the richest historical data through its <a href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800 underline">statistics API</a>, message history, and CSV lead exports. Superkabe syncs campaigns, mailboxes, and leads every 20 minutes via the <a href="/docs/multi-platform-sync" className="text-blue-600 hover:text-blue-800 underline">parallel cron system</a>.
            </p>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Campaign Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Emails Sent</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Statistics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Opens, Clicks, Replies</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Statistics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Bounces</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Statistics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Bounce Rate</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Calculated from stats</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Updated on each event</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Mailbox Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Bounce Count (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Message-history API with sender attribution</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks include sender email</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Emails Sent (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Mailbox-statistics API per campaign</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks include sender email</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Opens, Clicks, Replies (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Mailbox-statistics API per campaign</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks include sender email</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Warmup Status</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Email accounts API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Synced every 20 min</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 text-sm text-green-800">
                <strong>Full per-mailbox historical data available:</strong> Smartlead&apos;s mailbox-statistics endpoint returns per-mailbox sent, open, click, reply, and bounce counts for each campaign. Superkabe aggregates these across all campaigns during sync, using <code className="bg-green-100 px-1 rounded">Math.max()</code> to never overwrite higher webhook-accumulated values. Historical bounce attribution also uses the message-history API for additional accuracy.
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Lead Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Open Count, Click Count, Reply Count</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; CSV lead export</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Bounce Status (is_bounced)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; CSV lead export</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Which Mailbox Sent to This Lead</td>
                            <td className="py-2 pr-4"><span className="text-red-600 font-semibold">No</span> &mdash; Not in CSV columns</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhook payload includes sender</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Instantly Section */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Instantly</h2>
            <p className="text-gray-600 mb-6">
                Instantly provides the best per-mailbox historical data of all three platforms through its daily analytics API. Superkabe syncs via the <a href="/docs/instantly-integration" className="text-blue-600 hover:text-blue-800 underline">Instantly integration</a> every 20 minutes.
            </p>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Campaign Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Emails Sent, Opens, Clicks, Replies</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Campaign summary API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Bounces</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Campaign summary API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Mailbox Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Emails Sent (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Daily analytics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Bounces (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Daily analytics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Opens (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Daily analytics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 text-sm text-green-800">
                <strong>Instantly has the best mailbox coverage:</strong> The daily analytics endpoint returns actual per-mailbox, per-day stats including <code className="bg-green-100 px-1 rounded">bounced</code>, <code className="bg-green-100 px-1 rounded">emails_sent</code>, and <code className="bg-green-100 px-1 rounded">opens</code>. Superkabe uses these directly with no estimation.
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Lead Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Lead Status</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Campaign leads API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Per-Lead Engagement</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Lead status from API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* EmailBison Section */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">EmailBison</h2>
            <p className="text-gray-600 mb-6">
                EmailBison has the most limited API surface of the three platforms. It provides campaign-level stats and sender email metadata, but <strong>no per-mailbox analytics endpoint</strong>. All per-mailbox engagement data comes exclusively from <a href="/docs/emailbison-integration" className="text-blue-600 hover:text-blue-800 underline">webhook events</a>.
            </p>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Campaign Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Emails Sent, Opens, Clicks, Replies</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Campaign stats in lead list</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Bounces</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Campaign stats in lead list</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Mailbox Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Bounce Count (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-red-600 font-semibold">No</span> &mdash; No per-mailbox analytics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhook bounce events include sender_email</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Emails Sent (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-red-600 font-semibold">No</span> &mdash; No per-mailbox analytics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhook send events include sender_email</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Opens, Clicks, Replies (per mailbox)</td>
                            <td className="py-2 pr-4"><span className="text-red-600 font-semibold">No</span> &mdash; No per-mailbox analytics API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhook events include sender_email</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-sm text-amber-800">
                <strong>Why EmailBison mailbox stats start at zero:</strong> EmailBison's <code className="bg-amber-100 px-1 rounded">/api/sender-emails</code> endpoint returns mailbox metadata (email address, status) but no engagement or bounce statistics. All per-mailbox metrics accumulate exclusively from webhook events after you connect.
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">Lead Data</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Historical</th>
                            <th className="text-left py-2 text-gray-900 font-bold">Real-Time</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Lead Email, Name, Status</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Leads API</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Bounce Count (per lead)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> &mdash; Leads API includes bounces field</td>
                            <td className="py-2"><span className="text-green-600 font-semibold">Yes</span> &mdash; Webhooks</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Domain Data - Universal */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Domain Data (All Platforms)</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-gray-600 mb-4">
                    No sending platform exposes domain-level analytics directly. Domain health metrics in Superkabe are always <strong>derived from child mailbox aggregation</strong>. This applies to all three platforms equally.
                </p>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Source</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Domain Bounce Rate</td>
                            <td className="py-2">Aggregated from all mailboxes under the domain</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4">Domain Health Score</td>
                            <td className="py-2">Calculated by Superkabe's <a href="/docs/risk-scoring" className="text-blue-600 hover:text-blue-800 underline">risk scoring engine</a></td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4">Domain Status</td>
                            <td className="py-2">Derived from mailbox statuses via the <a href="/docs/state-machine" className="text-blue-600 hover:text-blue-800 underline">state machine</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Platform Comparison */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Platform Comparison Summary</h2>
            <p className="text-gray-600 mb-6">
                A side-by-side view of what each platform provides for <strong>per-mailbox</strong> historical data, since this is where the biggest differences exist.
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Per-Mailbox Metric</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Smartlead</th>
                            <th className="text-left py-2 pr-4 text-gray-900 font-bold">Instantly</th>
                            <th className="text-left py-2 text-gray-900 font-bold">EmailBison</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-medium">Historical Bounces</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (message-history)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (daily analytics)</td>
                            <td className="py-2"><span className="text-red-600 font-semibold">No</span> (webhooks only)</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-medium">Historical Sent Count</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (mailbox-statistics)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (daily analytics)</td>
                            <td className="py-2"><span className="text-red-600 font-semibold">No</span></td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-medium">Historical Opens</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (mailbox-statistics)</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (daily analytics)</td>
                            <td className="py-2"><span className="text-red-600 font-semibold">No</span></td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4 font-medium">Historical Clicks/Replies</td>
                            <td className="py-2 pr-4"><span className="text-green-600 font-semibold">Yes</span> (mailbox-statistics)</td>
                            <td className="py-2 pr-4"><span className="text-red-600 font-semibold">No</span></td>
                            <td className="py-2"><span className="text-red-600 font-semibold">No</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* What This Means */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What This Means for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-green-900 mb-3">Available Immediately</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>All campaign-level stats (every platform)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Per-mailbox bounces on Smartlead (via message-history backfill)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Full per-mailbox stats on Smartlead (via mailbox-statistics API) and Instantly (via daily analytics)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Lead engagement data on Smartlead (via CSV export)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Mailbox metadata and warmup status</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                    <h3 className="font-bold text-amber-900 mb-3">Accumulates Over Time</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>All per-mailbox metrics on EmailBison (webhook events)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Which mailbox sent to which lead on Smartlead</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* FAQ */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Why are my EmailBison mailbox stats showing zero?</h3>
                    <p className="text-gray-600 text-sm">
                        EmailBison does not provide a per-mailbox analytics API. Superkabe tracks per-mailbox stats exclusively through webhook events. After connecting, these metrics will accumulate as new emails are sent, opened, bounced, and replied to. This is not a sync failure &mdash; it reflects the actual data available from the platform.
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">How does Smartlead per-mailbox data compare to Instantly?</h3>
                    <p className="text-gray-600 text-sm">
                        Both platforms now provide full per-mailbox historical data. Smartlead&apos;s mailbox-statistics endpoint returns sent, open, click, reply, and bounce counts per mailbox per campaign. Instantly&apos;s daily analytics endpoint returns per-mailbox, per-day breakdowns. Smartlead actually provides more granular data (clicks and replies) that Instantly does not expose per-mailbox.
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">How does Superkabe attribute historical bounces to Smartlead mailboxes?</h3>
                    <p className="text-gray-600 text-sm">
                        Through two methods: the mailbox-statistics endpoint provides aggregate bounce counts per mailbox per campaign, and the message-history API provides individual bounce attribution with a <code className="bg-gray-100 px-1 rounded">from</code> field identifying the sending mailbox. Superkabe uses <code className="bg-gray-100 px-1 rounded">Math.max()</code> to keep the higher value from either source.
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Will my domain health score be affected by missing historical data?</h3>
                    <p className="text-gray-600 text-sm">
                        Domain health is derived from child mailbox aggregation. If mailbox bounce counts are available (historically on Smartlead/Instantly, or via webhooks on EmailBison), domain health will be accurate. The <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800 underline">monitoring system</a> uses available data and does not penalize for missing pre-connection history.
                    </p>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Documentation</h3>
                <div className="space-y-2">
                    <a href="/docs/multi-platform-sync" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Multi-Platform Data Sync
                    </a>
                    <a href="/docs/help/analytics" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Do Campaign Analytics Work?
                    </a>
                    <a href="/docs/smartlead-integration" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Smartlead Integration Guide
                    </a>
                    <a href="/docs/instantly-integration" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Instantly Integration Guide
                    </a>
                    <a href="/docs/emailbison-integration" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; EmailBison Integration Guide
                    </a>
                </div>
            </div>
        </div>
    );
}

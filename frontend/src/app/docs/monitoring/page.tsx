import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Monitoring System | Superkabe Docs',
    description: 'Production-hardened monitoring with tiered thresholds, sliding windows, and ratio-based domain protection for outbound email.',
    alternates: { canonical: '/docs/monitoring' },
    openGraph: {
        title: 'Monitoring System | Superkabe Docs',
        description: 'Production-hardened monitoring with tiered thresholds, sliding windows, and ratio-based domain protection for outbound email.',
        url: '/docs/monitoring',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function MonitoringPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Monitoring System
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Production-hardened monitoring with tiered thresholds, sliding windows, and ratio-based domain protection
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">1. Tiered Mailbox Thresholds</h2>
            <p className="text-gray-600 mb-6">
                We use a two-tier system to catch issues before they cause irreversible damage:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚠️</span>
                        <h3 className="text-xl font-bold text-amber-700">WARNING State</h3>
                    </div>
                    <p className="text-2xl font-bold text-amber-600 mb-2">3 bounces / 60 sends</p>
                    <p className="text-gray-500 text-sm mb-4">~5% bounce rate</p>
                    <div className="bg-white/80 rounded-xl p-3">
                        <p className="text-gray-600 text-sm">
                            <strong>Action:</strong> Mailbox transitions to <code className="text-amber-600 bg-amber-100 px-1 rounded">warning</code> state. Logging intensifies. Operators alerted.
                        </p>
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🛑</span>
                        <h3 className="text-xl font-bold text-red-700">PAUSE State</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mb-2">5 bounces / 100 sends</p>
                    <p className="text-gray-500 text-sm mb-4">5% bounce rate threshold</p>
                    <div className="bg-white/80 rounded-xl p-3">
                        <p className="text-gray-600 text-sm">
                            <strong>Action:</strong> Mailbox paused immediately. No new emails sent. Cooldown period begins.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-700 mb-2">Why Two Tiers?</h3>
                <p className="text-gray-600">
                    Early warning at 3/60 gives operators time to investigate <em>before</em> the mailbox is paused at 5/100.
                    This prevents surprises and allows manual intervention.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">1b. Minimum Volume Requirement</h2>
            <p className="text-gray-600 mb-6">
                Enforcement thresholds only activate after a mailbox reaches a <strong>minimum send volume</strong>.
                This prevents the system from overreacting to statistically insignificant data.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">📊</span>
                    <h3 className="text-xl font-bold text-orange-700">Why minimum volume matters</h3>
                </div>
                <p className="text-gray-600 mb-4">
                    A mailbox that sent <strong>4 emails</strong> and received <strong>1 bounce</strong> has a <strong>25% bounce rate</strong> — but
                    this is not statistically meaningful. One bounce at low volume does not indicate a deliverability problem.
                    Pausing mailboxes based on tiny sample sizes would constantly churn accounts during early warmup.
                </p>
                <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-gray-700 text-sm font-semibold mb-2">The three enforcement triggers:</p>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-orange-200">
                            <tr>
                                <th className="pb-2 text-gray-700">Trigger</th>
                                <th className="pb-2 text-gray-700">Condition</th>
                                <th className="pb-2 text-gray-700">Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-2 text-orange-600 font-semibold">Percentage</td>
                                <td className="py-2 text-gray-600">3%+ bounce rate <strong>AND</strong> 60+ sends</td>
                                <td className="py-2 text-gray-500">Catches sustained problems after sufficient data</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-orange-600 font-semibold">Absolute</td>
                                <td className="py-2 text-gray-600">5+ bounces in sliding window</td>
                                <td className="py-2 text-gray-500">Safety net regardless of send volume</td>
                            </tr>
                            <tr>
                                <td className="py-2 text-orange-600 font-semibold">Early warning</td>
                                <td className="py-2 text-gray-600">3+ bounces within first 60 sends</td>
                                <td className="py-2 text-gray-500">Flags risk before percentage trigger activates</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Example: Low Volume vs High Volume</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm font-bold text-green-700 mb-2">4 sends, 1 bounce (25%)</p>
                        <p className="text-gray-600 text-sm">Below 60-send minimum. No enforcement action. The system monitors but waits for more data before making decisions.</p>
                        <p className="text-green-600 text-xs mt-2 font-semibold">Result: Mailbox stays active</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm font-bold text-red-700 mb-2">80 sends, 3 bounces (3.75%)</p>
                        <p className="text-gray-600 text-sm">Above 60-send minimum and above 3% threshold. The bounce pattern is statistically significant.</p>
                        <p className="text-red-600 text-xs mt-2 font-semibold">Result: Mailbox paused, removed from campaigns, enters healing</p>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">2. Sliding Window Logic</h2>
            <p className="text-gray-600 mb-6">
                Instead of hard resetting stats to 0/0 after 100 sends, we use a <strong>sliding window</strong> that keeps 50% of past data.
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Old Behavior (Hard Reset)</h3>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <code className="text-sm text-gray-700">
                        100 sent, 6 bounces → reset → 0 sent, 0 bounces<br />
                        Problem: Volatility patterns erased
                    </code>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">New Behavior (Sliding Window)</h3>
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                    <code className="text-sm text-green-700">
                        100 sent, 6 bounces → slide → 50 sent, 3 bounces<br />
                        Benefit: Volatility preserved, reputation context maintained
                    </code>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-green-700 mb-2">Impact</h3>
                <p className="text-gray-600">
                    A mailbox with a history of bounces won't suddenly appear "clean" after 100 sends.
                    The sliding window ensures reputation tracking reflects reality.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">3. Ratio-Based Domain Protection</h2>
            <p className="text-gray-600 mb-6">
                Domain health is calculated using <strong>percentage of unhealthy mailboxes</strong>, not absolute counts.
                This allows the system to scale from small teams (3 mailboxes) to large agencies (200+ mailboxes).
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Threshold</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Percentage</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-amber-600 font-semibold">WARNING</td>
                            <td className="px-6 py-4 text-gray-600">30% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain enters <code className="px-2 py-1 bg-amber-50 rounded text-amber-600">warning</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-semibold">PAUSE</td>
                            <td className="px-6 py-4 text-gray-600">50% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain paused, all mailboxes blocked</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Scaling Example</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200">
                        <tr>
                            <th className="pb-2 text-gray-700">Total Mailboxes</th>
                            <th className="pb-2 text-gray-700">Unhealthy</th>
                            <th className="pb-2 text-gray-700">Percentage</th>
                            <th className="pb-2 text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-2 text-gray-700">3</td>
                            <td className="py-2 text-gray-700">1</td>
                            <td className="py-2 text-gray-700">33%</td>
                            <td className="py-2 text-amber-600">⚠️ Warning</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">10</td>
                            <td className="py-2 text-gray-700">2</td>
                            <td className="py-2 text-gray-700">20%</td>
                            <td className="py-2 text-green-600">✅ Healthy</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">10</td>
                            <td className="py-2 text-gray-700">5</td>
                            <td className="py-2 text-gray-700">50%</td>
                            <td className="py-2 text-red-600">🛑 Paused</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">30</td>
                            <td className="py-2 text-gray-700">10</td>
                            <td className="py-2 text-gray-700">33%</td>
                            <td className="py-2 text-amber-600">⚠️ Warning</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">200</td>
                            <td className="py-2 text-gray-700">110</td>
                            <td className="py-2 text-gray-700">55%</td>
                            <td className="py-2 text-red-600">🛑 Paused</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-700 mb-2">Why Ratios?</h3>
                <p className="text-gray-600 mb-3">
                    Absolute thresholds don't scale:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• With 3 mailboxes, losing 2 is catastrophic (67% failure)</li>
                    <li>• With 30 mailboxes, losing 2 is negligible (7% failure)</li>
                    <li>• Ratio-based logic adapts automatically as infrastructure grows</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Monitoring Dashboard</h2>
            <p className="text-gray-600 mb-6">
                The monitoring dashboard provides real-time visibility into:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="font-semibold text-blue-700 mb-2">Mailbox Metrics</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Current status (healthy, warning, paused)</li>
                        <li>• Window bounce count (e.g., 3/60)</li>
                        <li>• Total sends and bounces</li>
                        <li>• Cooldown expiry time</li>
                    </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="font-semibold text-blue-700 mb-2">Domain Aggregations</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Total mailboxes vs unhealthy count</li>
                        <li>• Unhealthy percentage</li>
                        <li>• Domain status (healthy, warning, paused)</li>
                        <li>• Average risk score across mailboxes</li>
                    </ul>
                </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-700 mb-2">🎯 Production-Hardened</h3>
                <p className="text-gray-600">
                    These monitoring refinements are based on real-world outbound operations:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                    <li>• <strong>Tiered thresholds</strong> prevent surprise pauses</li>
                    <li>• <strong>Sliding windows</strong> maintain reputation context</li>
                    <li>• <strong>Ratio-based domains</strong> scale with infrastructure</li>
                    <li>• All thresholds are tunable in Configuration</li>
                </ul>
            </div>
        </div>
    );
}

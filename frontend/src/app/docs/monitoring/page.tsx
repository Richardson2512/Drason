export default function MonitoringPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Monitoring System
            </h1>
            <p className="text-xl text-gray-600 mb-12">
                Production-hardened monitoring with tiered thresholds, sliding windows, and ratio-based domain protection
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12">1. Tiered Mailbox Thresholds</h2>
            <p className="text-gray-600 mb-6">
                We use a two-tier system to catch issues before they cause irreversible damage:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚠️</span>
                        <h3 className="text-xl font-bold text-yellow-400">WARNING State</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-300 mb-2">3 bounces / 60 sends</p>
                    <p className="text-gray-400 text-sm mb-4">~5% bounce rate</p>
                    <div className="bg-gray-50/50 rounded p-3">
                        <p className="text-gray-600 text-sm">
                            <strong>Action:</strong> Mailbox transitions to <code className="text-yellow-300">warning</code> state. Logging intensifies. Operators alerted.
                        </p>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🛑</span>
                        <h3 className="text-xl font-bold text-red-400">PAUSE State</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-300 mb-2">5 bounces / 100 sends</p>
                    <p className="text-gray-400 text-sm mb-4">5% bounce rate threshold</p>
                    <div className="bg-gray-50/50 rounded p-3">
                        <p className="text-gray-600 text-sm">
                            <strong>Action:</strong> Mailbox paused immediately. No new emails sent. Cooldown period begins.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Why Two Tiers?</h3>
                <p className="text-gray-600">
                    Early warning at 3/60 gives operators time to investigate <em>before</em> the mailbox is paused at 5/100.
                    This prevents surprises and allows manual intervention.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">2. Sliding Window Logic</h2>
            <p className="text-gray-600 mb-6">
                Instead of hard resetting stats to 0/0 after 100 sends, we use a <strong>sliding window</strong> that keeps 50% of past data.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Old Behavior (Hard Reset)</h3>
                <div className="bg-gray-50 rounded p-4 mb-4">
                    <code className="text-sm text-gray-600">
                        100 sent, 6 bounces → reset → 0 sent, 0 bounces<br />
                        Problem: Volatility patterns erased
                    </code>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">New Behavior (Sliding Window)</h3>
                <div className="bg-gray-50 rounded p-4 mb-4">
                    <code className="text-sm text-green-300">
                        100 sent, 6 bounces → slide → 50 sent, 3 bounces<br />
                        Benefit: Volatility preserved, reputation context maintained
                    </code>
                </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-green-400 mb-2">Impact</h3>
                <p className="text-gray-600">
                    A mailbox with a history of bounces won't suddenly appear "clean" after 100 sends.
                    The sliding window ensures reputation tracking reflects reality.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">3. Ratio-Based Domain Protection</h2>
            <p className="text-gray-600 mb-6">
                Domain health is calculated using <strong>percentage of unhealthy mailboxes</strong>, not absolute counts.
                This allows the system to scale from small teams (3 mailboxes) to large agencies (200+ mailboxes).
            </p>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Threshold</th>
                            <th className="px-6 py-3 text-gray-600">Percentage</th>
                            <th className="px-6 py-3 text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 text-yellow-400 font-semibold">WARNING</td>
                            <td className="px-6 py-4 text-gray-600">30% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain enters <code className="px-2 py-1 bg-gray-50 rounded text-yellow-300">warning</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-400 font-semibold">PAUSE</td>
                            <td className="px-6 py-4 text-gray-600">50% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain paused, all mailboxes blocked</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Scaling Example</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200">
                        <tr>
                            <th className="pb-2 text-gray-600">Total Mailboxes</th>
                            <th className="pb-2 text-gray-600">Unhealthy</th>
                            <th className="pb-2 text-gray-600">Percentage</th>
                            <th className="pb-2 text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        <tr>
                            <td className="py-2 text-gray-600">3</td>
                            <td className="py-2 text-gray-600">1</td>
                            <td className="py-2 text-gray-600">33%</td>
                            <td className="py-2 text-yellow-300">⚠️ Warning</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">10</td>
                            <td className="py-2 text-gray-600">2</td>
                            <td className="py-2 text-gray-600">20%</td>
                            <td className="py-2 text-green-300">✅ Healthy</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">10</td>
                            <td className="py-2 text-gray-600">5</td>
                            <td className="py-2 text-gray-600">50%</td>
                            <td className="py-2 text-red-300">🛑 Paused</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">30</td>
                            <td className="py-2 text-gray-600">10</td>
                            <td className="py-2 text-gray-600">33%</td>
                            <td className="py-2 text-yellow-300">⚠️ Warning</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">200</td>
                            <td className="py-2 text-gray-600">110</td>
                            <td className="py-2 text-gray-600">55%</td>
                            <td className="py-2 text-red-300">🛑 Paused</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Why Ratios?</h3>
                <p className="text-gray-600 mb-3">
                    Absolute thresholds don't scale:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• With 3 mailboxes, losing 2 is catastrophic (67% failure)</li>
                    <li>• With 30 mailboxes, losing 2 is negligible (7% failure)</li>
                    <li>• Ratio-based logic adapts automatically as infrastructure grows</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Monitoring Dashboard</h2>
            <p className="text-gray-600 mb-6">
                The monitoring dashboard provides real-time visibility into:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">Mailbox Metrics</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Current status (healthy, warning, paused)</li>
                        <li>• Window bounce count (e.g., 3/60)</li>
                        <li>• Total sends and bounces</li>
                        <li>• Cooldown expiry time</li>
                    </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">Domain Aggregations</h4>
                    <ul className="text-gray-600 text-sm space-y-1">
                        <li>• Total mailboxes vs unhealthy count</li>
                        <li>• Unhealthy percentage</li>
                        <li>• Domain status (healthy, warning, paused)</li>
                        <li>• Average risk score across mailboxes</li>
                    </ul>
                </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-400 mb-2">🎯 Production-Hardened</h3>
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

export default function PlatformRulesPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Platform Rules
            </h1>
            <p className="text-xl text-gray-600 mb-12">
                Understand the automated rules, thresholds, and enforcement mechanisms that protect your infrastructure
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12">System Modes</h2>
            <p className="text-gray-600 mb-6">
                Drason operates in 3 modes that control enforcement behavior:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">OBSERVE</h3>
                    <p className="text-gray-600 mb-4">Logs all events, no automated actions</p>
                    <p className="text-sm text-gray-400">Use for: Testing, learning baseline metrics</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-3">SUGGEST</h3>
                    <p className="text-gray-600 mb-4">Provides recommendations, no blocking</p>
                    <p className="text-sm text-gray-400">Use for: Review suggestions before automation</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-3">ENFORCE</h3>
                    <p className="text-gray-600 mb-4">Fully automated pausing and blocking</p>
                    <p className="text-sm text-gray-400">Use for: Production-ready automated protection</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Mailbox-Level Rules (Tiered)</h2>
            <p className="text-gray-600 mb-6">
                We use a two-tier threshold system to catch issues early:
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">⚠️ WARNING Threshold</h3>
                <p className="text-gray-600 mb-2"><strong>3 bounces</strong> within <strong>60 sends</strong></p>
                <p className="text-gray-400 text-sm mb-4">~5% bounce rate — early detection</p>
                <p className="text-gray-600">
                    <strong>Action:</strong> Mailbox transitions to <code className="px-2 py-1 bg-gray-50 rounded text-yellow-300">warning</code> state
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-red-400 mb-3">🛑 PAUSE Threshold</h3>
                <p className="text-gray-600 mb-2"><strong>5 bounces</strong> within <strong>100 sends</strong></p>
                <p className="text-gray-400 text-sm mb-4">5% bounce rate — hard stop</p>
                <p className="text-gray-600">
                    <strong>Action:</strong> Mailbox transitions to <code className="px-2 py-1 bg-gray-50 rounded text-red-300">paused</code> state
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Flow Example</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <code className="text-sm text-gray-600">
                    healthy → warning (3/60) → paused (5/100)<br />
                    &nbsp;&nbsp;↑__________________________________|<br />
                    &nbsp;&nbsp;└── recovering → healthy (after clean window)
                </code>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Domain-Level Rules (Ratio-Based)</h2>
            <p className="text-gray-600 mb-6">
                Domain health uses percentage-based thresholds that scale with infrastructure size:
            </p>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Threshold</th>
                            <th className="px-6 py-3 text-gray-600">Ratio</th>
                            <th className="px-6 py-3 text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 text-yellow-400 font-semibold">WARNING</td>
                            <td className="px-6 py-4 text-gray-600">30% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain → <code className="px-2 py-1 bg-gray-50 rounded text-yellow-300">warning</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-400 font-semibold">PAUSE</td>
                            <td className="px-6 py-4 text-gray-600">50% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain → <code className="px-2 py-1 bg-gray-50 rounded text-red-300">paused</code> + cascade</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Scaling Example</h3>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-blue-500/30">
                            <th className="pb-2 text-gray-600">Mailboxes</th>
                            <th className="pb-2 text-gray-600">Unhealthy</th>
                            <th className="pb-2 text-gray-600">Old Logic</th>
                            <th className="pb-2 text-gray-600">New Logic</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-500/20">
                        <tr>
                            <td className="py-2 text-gray-600">3</td>
                            <td className="py-2 text-gray-600">1</td>
                            <td className="py-2 text-gray-600">✅ Healthy</td>
                            <td className="py-2 text-yellow-300">⚠️ Warning (33%)</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">10</td>
                            <td className="py-2 text-gray-600">2</td>
                            <td className="py-2 text-red-300">🛑 Pause</td>
                            <td className="py-2 text-green-300">✅ Healthy (20%)</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">10</td>
                            <td className="py-2 text-gray-600">5</td>
                            <td className="py-2 text-red-300">🛑 Pause</td>
                            <td className="py-2 text-red-300">🛑 Pause (50%)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Cooldown System</h2>
            <p className="text-gray-600 mb-6">
                After a mailbox is paused, it enters a cooldown period with exponential backoff:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <p className="text-gray-600 mb-4">
                    <strong>Formula:</strong> <code className="px-2 py-1 bg-gray-800 rounded text-blue-300">Cooldown = 1 hour × 2^(consecutive_pauses - 1)</code>
                </p>
                <p className="text-gray-600 mb-4">
                    <strong>Maximum:</strong> Capped at 16 hours
                </p>
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200">
                        <tr>
                            <th className="pb-2 text-gray-600">Pause #</th>
                            <th className="pb-2 text-gray-600">Cooldown</th>
                            <th className="pb-2 text-gray-600">Cumulative Offline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        <tr>
                            <td className="py-2 text-gray-600">1st</td>
                            <td className="py-2 text-gray-600">1 hour</td>
                            <td className="py-2 text-gray-400">1 hour</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">2nd</td>
                            <td className="py-2 text-gray-600">2 hours</td>
                            <td className="py-2 text-gray-400">3 hours</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">3rd</td>
                            <td className="py-2 text-gray-600">4 hours</td>
                            <td className="py-2 text-gray-400">7 hours</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">4th</td>
                            <td className="py-2 text-gray-600">8 hours</td>
                            <td className="py-2 text-gray-400">15 hours</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-600">5th+</td>
                            <td className="py-2 text-gray-600">16 hours (max)</td>
                            <td className="py-2 text-gray-400">31+ hours</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold text-green-400 mb-2">📊 Key Insight</h3>
                <p className="text-gray-600">
                    These thresholds are production-hardened based on email deliverability best practices:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600">
                    <li>• <strong>5% bounce rate</strong> is the industry-accepted maximum before reputation damage</li>
                    <li>• <strong>Early warnings at 3 bounces</strong> give operators time to investigate</li>
                    <li>• <strong>Ratio-based domains</strong> scale from small (3 mailboxes) to large (200+) infrastructure</li>
                    <li>• <strong>Exponential cooldown</strong> prevents rapid re-entry into unhealthy patterns</li>
                </ul>
            </div>
        </div>
    );
}

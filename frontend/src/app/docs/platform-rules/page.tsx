export default function PlatformRulesPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Platform Rules
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understand the automated rules, thresholds, and enforcement mechanisms that protect your infrastructure
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">System Modes</h2>
            <p className="text-gray-600 mb-6">
                Drason operates in 3 modes that control enforcement behavior:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-700 mb-3">OBSERVE</h3>
                    <p className="text-gray-600 mb-4">Logs all events, no automated actions</p>
                    <p className="text-sm text-gray-500">Use for: Testing, learning baseline metrics</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-700 mb-3">SUGGEST</h3>
                    <p className="text-gray-600 mb-4">Provides recommendations, no blocking</p>
                    <p className="text-sm text-gray-500">Use for: Review suggestions before automation</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-purple-700 mb-3">ENFORCE</h3>
                    <p className="text-gray-600 mb-4">Fully automated pausing and blocking</p>
                    <p className="text-sm text-gray-500">Use for: Production-ready automated protection</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Mailbox-Level Rules (Tiered)</h2>
            <p className="text-gray-600 mb-6">
                We use a two-tier threshold system to catch issues early:
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-amber-700 mb-3">⚠️ WARNING Threshold</h3>
                <p className="text-gray-700 mb-2"><strong>3 bounces</strong> within <strong>60 sends</strong></p>
                <p className="text-gray-500 text-sm mb-4">~5% bounce rate — early detection</p>
                <p className="text-gray-600">
                    <strong>Action:</strong> Mailbox transitions to <code className="px-2 py-1 bg-amber-100 rounded text-amber-700">warning</code> state
                </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-red-700 mb-3">🛑 PAUSE Threshold</h3>
                <p className="text-gray-700 mb-2"><strong>5 bounces</strong> within <strong>100 sends</strong></p>
                <p className="text-gray-500 text-sm mb-4">5% bounce rate — hard stop</p>
                <p className="text-gray-600">
                    <strong>Action:</strong> Mailbox transitions to <code className="px-2 py-1 bg-red-100 rounded text-red-700">paused</code> state
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Flow Example</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <code className="text-sm text-gray-700">
                    healthy → warning (3/60) → paused (5/100)<br />
                    &nbsp;&nbsp;↑__________________________________|<br />
                    &nbsp;&nbsp;└── recovering → healthy (after clean window)
                </code>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Domain-Level Rules (Ratio-Based)</h2>
            <p className="text-gray-600 mb-6">
                Domain health uses percentage-based thresholds that scale with infrastructure size:
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Threshold</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Ratio</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-amber-600 font-semibold">WARNING</td>
                            <td className="px-6 py-4 text-gray-600">30% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain → <code className="px-2 py-1 bg-amber-50 rounded text-amber-600">warning</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-semibold">PAUSE</td>
                            <td className="px-6 py-4 text-gray-600">50% unhealthy</td>
                            <td className="px-6 py-4 text-gray-600">Domain → <code className="px-2 py-1 bg-red-50 rounded text-red-600">paused</code> + cascade</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Scaling Example</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-blue-200">
                            <th className="pb-2 text-gray-700">Mailboxes</th>
                            <th className="pb-2 text-gray-700">Unhealthy</th>
                            <th className="pb-2 text-gray-700">Old Logic</th>
                            <th className="pb-2 text-gray-700">New Logic</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                        <tr>
                            <td className="py-2 text-gray-700">3</td>
                            <td className="py-2 text-gray-700">1</td>
                            <td className="py-2 text-gray-700">✅ Healthy</td>
                            <td className="py-2 text-amber-600">⚠️ Warning (33%)</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">10</td>
                            <td className="py-2 text-gray-700">2</td>
                            <td className="py-2 text-red-600">🛑 Pause</td>
                            <td className="py-2 text-green-600">✅ Healthy (20%)</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">10</td>
                            <td className="py-2 text-gray-700">5</td>
                            <td className="py-2 text-red-600">🛑 Pause</td>
                            <td className="py-2 text-red-600">🛑 Pause (50%)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Cooldown System</h2>
            <p className="text-gray-600 mb-6">
                After a mailbox is paused, it enters a cooldown period with exponential backoff:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <p className="text-gray-700 mb-4">
                    <strong>Formula:</strong> <code className="px-2 py-1 bg-white rounded text-blue-600">Cooldown = 1 hour × 2^(consecutive_pauses - 1)</code>
                </p>
                <p className="text-gray-700 mb-4">
                    <strong>Maximum:</strong> Capped at 16 hours
                </p>
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200">
                        <tr>
                            <th className="pb-2 text-gray-700">Pause #</th>
                            <th className="pb-2 text-gray-700">Cooldown</th>
                            <th className="pb-2 text-gray-700">Cumulative Offline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-2 text-gray-700">1st</td>
                            <td className="py-2 text-gray-700">1 hour</td>
                            <td className="py-2 text-gray-500">1 hour</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">2nd</td>
                            <td className="py-2 text-gray-700">2 hours</td>
                            <td className="py-2 text-gray-500">3 hours</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">3rd</td>
                            <td className="py-2 text-gray-700">4 hours</td>
                            <td className="py-2 text-gray-500">7 hours</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">4th</td>
                            <td className="py-2 text-gray-700">8 hours</td>
                            <td className="py-2 text-gray-500">15 hours</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-gray-700">5th+</td>
                            <td className="py-2 text-gray-700">16 hours (max)</td>
                            <td className="py-2 text-gray-500">31+ hours</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-green-700 mb-2">📊 Key Insight</h3>
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

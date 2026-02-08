export default function ExecutionGatePage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Execution Gate
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Intelligent gate logic that determines whether a lead can be processed, with failure classification and retry strategies
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What is the Execution Gate?</h2>
            <p className="text-gray-600 mb-6">
                Before a lead is sent to Smartlead, it passes through our <strong>execution gate</strong>.
                The gate performs safety checks to ensure the infrastructure can handle the lead without causing damage.
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Gate Checks (in order)</h3>
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1. Campaign exists</strong> — Is the target campaign configured?</li>
                    <li><strong>2. Campaign active</strong> — Is the campaign currently running?</li>
                    <li><strong>3. Mailbox available</strong> — Are there healthy mailboxes?</li>
                    <li><strong>4. Domain healthy</strong> — Is the domain in good standing?</li>
                    <li><strong>5. Risk acceptable</strong> — Is the hard risk score below threshold?</li>
                </ol>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Failure Classification</h2>
            <p className="text-gray-600 mb-6">
                Not all failures are equal. We classify gate failures into 4 types, each with different retry logic:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-red-700 mb-3">HEALTH_ISSUE</h3>
                    <p className="text-gray-600 mb-4">
                        Mailbox or domain has exceeded bounce thresholds
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 text-sm">
                        <p className="text-gray-500 mb-1"><strong>Retryable:</strong> No</p>
                        <p className="text-gray-500 mb-1"><strong>Deferrable:</strong> No</p>
                        <p className="text-gray-500"><strong>Action:</strong> Block until manual recovery</p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-amber-700 mb-3">SYNC_ISSUE</h3>
                    <p className="text-gray-600 mb-4">
                        Missing campaign or configuration data
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 text-sm">
                        <p className="text-gray-500 mb-1"><strong>Retryable:</strong> No</p>
                        <p className="text-gray-500 mb-1"><strong>Deferrable:</strong> Yes</p>
                        <p className="text-gray-500"><strong>Action:</strong> Hold lead, retry after sync</p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-700 mb-3">INFRA_ISSUE</h3>
                    <p className="text-gray-600 mb-4">
                        API timeout or connectivity problems
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 text-sm">
                        <p className="text-gray-500 mb-1"><strong>Retryable:</strong> Yes</p>
                        <p className="text-gray-500 mb-1"><strong>Deferrable:</strong> No</p>
                        <p className="text-gray-500"><strong>Action:</strong> Retry with exponential backoff</p>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-700 mb-3">SOFT_WARNING</h3>
                    <p className="text-gray-600 mb-4">
                        High velocity but no bounce issues
                    </p>
                    <div className="bg-white/80 rounded-xl p-3 text-sm">
                        <p className="text-gray-500 mb-1"><strong>Retryable:</strong> N/A</p>
                        <p className="text-gray-500 mb-1"><strong>Deferrable:</strong> N/A</p>
                        <p className="text-gray-500"><strong>Action:</strong> Allow, log for monitoring</p>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Mode-Based Behavior</h2>
            <p className="text-gray-600 mb-6">
                The gate's behavior changes based on system mode:
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Mode</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Check Result</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Gate Behavior</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-semibold">OBSERVE</td>
                            <td className="px-6 py-4 text-gray-600">Any</td>
                            <td className="px-6 py-4 text-gray-600">✅ Allow all, log results</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-green-600 font-semibold">SUGGEST</td>
                            <td className="px-6 py-4 text-gray-600">Failed</td>
                            <td className="px-6 py-4 text-gray-600">⚠️ Log recommendation, allow</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-purple-600 font-semibold">ENFORCE</td>
                            <td className="px-6 py-4 text-gray-600">Failed</td>
                            <td className="px-6 py-4 text-gray-600">🛑 Block execution</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Example Gate Flow</h2>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                    {`Lead arrives → Execute Gate Checks

1. Campaign exists? → YES
2. Campaign active? → YES
3. Mailboxes available? → YES (3 healthy mailboxes found)
4. Domain healthy? → YES (domain in 'active' state)
5. Hard risk score acceptable? → YES (avgHardScore: 35, threshold: 60)

Result: ✅ ALLOWED
Action: Lead sent to Smartlead campaign`}
                </pre>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                    {`Lead arrives → Execute Gate Checks

1. Campaign exists? → YES
2. Campaign active? → YES
3. Mailboxes available? → NO (all 3 mailboxes paused)
4. Domain healthy? → N/A
5. Hard risk score acceptable? → N/A

Result: 🛑 BLOCKED
Failure Type: HEALTH_ISSUE
Reason: "No healthy mailboxes available. 3 paused due to bounce threshold."
Retryable: false
Deferrable: false`}
                </pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Lead States</h2>
            <p className="text-gray-600 mb-6">
                Leads transition through states based on gate results:
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-semibold">held</span>
                        <span className="text-gray-400">→</span>
                        <p className="text-gray-600">Lead received from Clay, waiting for gate check</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-100 border border-green-200 rounded-lg text-green-700 font-semibold">active</span>
                        <span className="text-gray-400">→</span>
                        <p className="text-gray-600">Passed gate, sent to Smartlead campaign</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-amber-100 border border-amber-200 rounded-lg text-amber-700 font-semibold">paused</span>
                        <span className="text-gray-400">→</span>
                        <p className="text-gray-600">Gate blocked (HEALTH_ISSUE), manual intervention required</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-semibold">completed</span>
                        <span className="text-gray-400">→</span>
                        <p className="text-gray-600">Outreach finished, no longer monitored</p>
                    </div>
                </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-700 mb-2">🎯 Key Insight</h3>
                <p className="text-gray-600">
                    The execution gate is the <strong>last line of defense</strong> before leads enter production campaigns.
                    By classifying failures and providing intelligent retry logic, we protect infrastructure while maximizing throughput.
                </p>
            </div>
        </div>
    );
}

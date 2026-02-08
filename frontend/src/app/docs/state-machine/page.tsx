export default function StateMachinePage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                State Machine
            </h1>
            <p className="text-xl text-gray-600 mb-12">
                Understand mailbox states, domain states, and valid transitions through the protection lifecycle
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12">Mailbox States</h2>
            <p className="text-gray-600 mb-6">
                Mailboxes transition through several states based on bounce thresholds and cooldown periods:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-3">healthy</h3>
                    <p className="text-gray-600 mb-4">Default state. Mailbox is actively sending.</p>
                    <div className="bg-gray-50/50 rounded p-3 text-sm">
                        <p className="text-gray-400"><strong>Bounce count:</strong> {`< 3 within 60 sends`}</p>
                        <p className="text-gray-400"><strong>Can send:</strong> Yes</p>
                        <p className="text-gray-400"><strong>Gate allows:</strong> Yes</p>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">warning</h3>
                    <p className="text-gray-600 mb-4">Early warning state. Issue detected.</p>
                    <div className="bg-gray-50/50 rounded p-3 text-sm">
                        <p className="text-gray-400"><strong>Bounce count:</strong> ≥3 within 60 sends</p>
                        <p className="text-gray-400"><strong>Can send:</strong> Yes (monitored)</p>
                        <p className="text-gray-400"><strong>Gate allows:</strong> Yes</p>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">warming</h3>
                    <p className="text-gray-600 mb-4">New mailbox being warmed up.</p>
                    <div className="bg-gray-50/50 rounded p-3 text-sm">
                        <p className="text-gray-400"><strong>Bounce count:</strong> N/A</p>
                        <p className="text-gray-400"><strong>Can send:</strong> Limited volume</p>
                        <p className="text-gray-400"><strong>Gate allows:</strong> Gradual ramp</p>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-3">paused</h3>
                    <p className="text-gray-600 mb-4">Automatically paused due to bounce threshold.</p>
                    <div className="bg-gray-50/50 rounded p-3 text-sm">
                        <p className="text-gray-400"><strong>Bounce count:</strong> ≥5 within 100 sends</p>
                        <p className="text-gray-400"><strong>Can send:</strong> No</p>
                        <p className="text-gray-400"><strong>Gate allows:</strong> No (blocked)</p>
                    </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-3">recovering</h3>
                    <p className="text-gray-600 mb-4">Cooldown period expired, gradual recovery.</p>
                    <div className="bg-gray-50/50 rounded p-3 text-sm">
                        <p className="text-gray-400"><strong>Bounce count:</strong> Sliding window healing</p>
                        <p className="text-gray-400"><strong>Can send:</strong> Yes (gradual)</p>
                        <p className="text-gray-400"><strong>Gate allows:</strong> Yes (monitored)</p>
                    </div>
                </div>

                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-400 mb-3">active</h3>
                    <p className="text-gray-600 mb-4">Generic active state (legacy).</p>
                    <div className="bg-gray-50/50 rounded p-3 text-sm">
                        <p className="text-gray-400"><strong>Can send:</strong> Yes</p>
                        <p className="text-gray-400"><strong>Gate allows:</strong> Yes</p>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Mailbox State Transitions</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 overflow-x-auto">
                <pre className="text-sm text-gray-600">
                    {`
    ┌─────────┐
    │ warming │
    └────┬────┘
         │
         ▼
    ┌─────────┐    3 bounces/60 sends    ┌─────────┐
    │ healthy ├────────────────────────►  │ warning │
    └────▲────┘                           └────┬────┘
         │                                     │
         │                                     │ 5 bounces/100 sends
         │                                     ▼
         │                                ┌────────┐
         │          cooldown expired      │ paused │
         │         ◄──────────────────────┤        │
         │                                └────────┘
         │                                     │
         │                                     │
    ┌────┴───────┐                            │
    │ recovering │◄───────────────────────────┘
    └────────────┘
`}
                </pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Domain States</h2>
            <p className="text-gray-600 mb-6">
                Domains aggregate mailbox health and have their own state machine:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-3">healthy</h3>
                    <p className="text-gray-600 mb-4"><strong>Condition:</strong></p>
                    <p className="text-gray-400 text-sm">{`< 30% mailboxes unhealthy`}</p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">warning</h3>
                    <p className="text-gray-600 mb-4"><strong>Condition:</strong></p>
                    <p className="text-gray-400 text-sm">≥30% mailboxes unhealthy</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-3">paused</h3>
                    <p className="text-gray-600 mb-4"><strong>Condition:</strong></p>
                    <p className="text-gray-400 text-sm">≥50% mailboxes unhealthy</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Domain State Transitions</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 overflow-x-auto">
                <pre className="text-sm text-gray-600">
                    {`
    ┌─────────┐    30% unhealthy    ┌─────────┐    50% unhealthy    ┌────────┐
    │ healthy ├────────────────────► │ warning ├────────────────────► │ paused │
    └────▲────┘                      └────▲────┘                      └────┬───┘
         │                                │                                │
         │ <15% unhealthy                 │ <15% unhealthy                 │
         └────────────────────────────────┴────────────────────────────────┘
                                     (gradual recovery)
`}
                </pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">Lead States</h2>
            <p className="text-gray-600 mb-6">
                Leads also have states based on execution gate results:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">held</h3>
                    <p className="text-gray-600 mb-4">Lead received from Clay, waiting for gate check.</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-3">active</h3>
                    <p className="text-gray-600 mb-4">Passed execution gate, sent to Smartlead campaign.</p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">paused</h3>
                    <p className="text-gray-600 mb-4">Blocked by gate due to HEALTH_ISSUE.</p>
                </div>

                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-400 mb-3">completed</h3>
                    <p className="text-gray-600 mb-4">Outreach finished, no longer monitored.</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12">State Transition Events</h2>
            <p className="text-gray-600 mb-6">
                All state transitions are logged in the <code className="px-2 py-1 bg-gray-800 rounded">state_transitions</code> table:
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Transition Record</h3>
                <div className="bg-gray-50 rounded p-4 text-sm">
                    <code className="text-gray-600">
                        {`{
  "entity_type": "mailbox",
  "entity_id": "mb_123",
  "from_state": "healthy",
  "to_state": "paused",
  "reason": "Exceeded 5 bounces within 100 sends",
  "triggered_by": "bounce_threshold"
}`}
                    </code>
                </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-400 mb-2">🔍 Audit Trail</h3>
                <p className="text-gray-600">
                    Every state change is logged with:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 text-sm">
                    <li>• Timestamp of transition</li>
                    <li>• Previous and new state</li>
                    <li>• Reason for transition</li>
                    <li>• Triggering event or threshold</li>
                </ul>
                <p className="text-gray-400 mt-4 text-sm">
                    This provides complete infrastructure forensics for debugging and compliance.
                </p>
            </div>
        </div>
    );
}

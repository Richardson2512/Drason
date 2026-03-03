import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Do Audit Logs Work? | Superkabe Help',
    description: 'Learn how Superkabe tracks every system action with an immutable audit trail. Filter by entity type, review triggers, and maintain full operational visibility.',
    alternates: { canonical: '/docs/help/audit-logs' },
    openGraph: {
        title: 'How Do Audit Logs Work? | Superkabe Help',
        description: 'Learn how Superkabe tracks every system action with an immutable audit trail. Filter by entity type, review triggers, and maintain full operational visibility.',
        url: '/docs/help/audit-logs',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function AuditLogsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Do Audit Logs Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding Superkabe's immutable event trail for complete operational visibility
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Superkabe records every significant system action &mdash; mailbox pauses, lead state transitions, domain health changes, and campaign modifications &mdash; into an <strong>immutable audit log</strong>.
                    You can filter by entity type to investigate exactly what happened and when.
                </p>
                <p className="text-blue-700 text-sm">
                    Access it from <strong>Dashboard &rarr; Audit</strong>.
                </p>
            </div>

            {/* What Gets Logged */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What Events Does Superkabe Log?</h2>
            <p className="text-gray-600 mb-6">
                Every automated and manual action that changes the state of your infrastructure is recorded. Audit logs are immutable &mdash; once written, they cannot be modified or deleted.
            </p>

            <div className="space-y-4 mb-12">
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                            📬
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Mailbox Events</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>&#x2022; Mailbox paused due to bounce threshold</li>
                                <li>&#x2022; Recovery phase transitions (paused &rarr; quarantine &rarr; restricted_send &rarr; warm_recovery &rarr; healthy)</li>
                                <li>&#x2022; Warmup enabled or disabled</li>
                                <li>&#x2022; Mailbox added to or removed from campaigns</li>
                                <li>&#x2022; Connection status changes (connected/disconnected)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Lead Events</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>&#x2022; Lead ingested and classified (GREEN/YELLOW/RED)</li>
                                <li>&#x2022; Lead routed to campaign</li>
                                <li>&#x2022; Lead blocked (spam complaint, unsubscribe, or health gate)</li>
                                <li>&#x2022; Engagement events (opened, clicked, replied)</li>
                                <li>&#x2022; Lead score recalculated</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                            🌐
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Domain Events</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>&#x2022; Domain health status changes</li>
                                <li>&#x2022; DNS assessment results (SPF/DKIM/DMARC)</li>
                                <li>&#x2022; Blacklist detection and delisting</li>
                                <li>&#x2022; Domain paused or resumed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to Read Audit Logs */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I Read the Audit Log?</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-12">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Column</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">What It Shows</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-medium text-gray-700">Timestamp</td>
                            <td className="px-6 py-4 text-gray-600">Exact date and time the event occurred (your local timezone)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium text-gray-700">Entity</td>
                            <td className="px-6 py-4 text-gray-600">The type of resource affected: lead, mailbox, or domain</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium text-gray-700">Entity ID</td>
                            <td className="px-6 py-4 text-gray-600">Unique identifier of the specific resource (for cross-referencing)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium text-gray-700">Trigger</td>
                            <td className="px-6 py-4 text-gray-600">What caused the event (e.g., webhook, cron, manual sync, health check)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium text-gray-700">Action</td>
                            <td className="px-6 py-4 text-gray-600">The system action taken (e.g., mailbox_paused, lead_blocked, domain_healed)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium text-gray-700">Details</td>
                            <td className="px-6 py-4 text-gray-600">Human-readable description of what happened and why</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* How to Filter */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I Filter Audit Logs?</h2>
            <p className="text-gray-600 mb-4">
                Use the entity filter tabs at the top of the audit log to narrow down events:
            </p>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 mb-12">
                <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">All</span>
                    <span className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm font-medium border border-gray-200">Lead</span>
                    <span className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm font-medium border border-gray-200">Mailbox</span>
                    <span className="px-4 py-2 bg-white text-gray-600 rounded-full text-sm font-medium border border-gray-200">Domain</span>
                </div>
                <p className="text-sm text-gray-600">
                    Select <strong>All</strong> to see every event, or click a specific entity type to see only events related to that resource. This is useful when investigating a specific mailbox pause or lead routing issue.
                </p>
            </div>

            {/* Why Are Audit Logs Important */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Why Are Audit Logs Important?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <div className="text-3xl mb-2">🔍</div>
                        <h3 className="font-bold mb-2 text-gray-900">Root Cause Analysis</h3>
                        <p className="text-gray-600">When something goes wrong, trace the exact sequence of events that led to the issue. Every state change is recorded.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">📋</div>
                        <h3 className="font-bold mb-2 text-gray-900">Compliance & Accountability</h3>
                        <p className="text-gray-600">Maintain a complete, tamper-proof record of all system actions for internal compliance requirements.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">🤝</div>
                        <h3 className="font-bold mb-2 text-gray-900">Team Transparency</h3>
                        <p className="text-gray-600">Everyone on your team can see what the system did and why. No more guessing about automatic actions.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">⏱️</div>
                        <h3 className="font-bold mb-2 text-gray-900">Timeline Reconstruction</h3>
                        <p className="text-gray-600">Rebuild the complete history of any mailbox, domain, or lead from creation to current state.</p>
                    </div>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/notifications" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Do Notifications Work?
                    </a>
                    <a href="/docs/help/auto-healing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Auto-Healing Works (5-Phase Pipeline)
                    </a>
                    <a href="/docs/state-machine" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; State Machine (Technical Details)
                    </a>
                </div>
            </div>
        </div>
    );
}

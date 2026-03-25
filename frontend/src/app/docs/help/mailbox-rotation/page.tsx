import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Does Mailbox Rotation Work? | Superkabe Help',
    description: 'Learn how Superkabe automatically swaps in standby mailboxes when a sending mailbox is paused, keeping your campaigns running without interruption.',
    alternates: { canonical: '/docs/help/mailbox-rotation' },
    openGraph: {
        title: 'How Does Mailbox Rotation Work? | Superkabe Help',
        description: 'Learn how Superkabe automatically swaps in standby mailboxes when a sending mailbox is paused, keeping your campaigns running without interruption.',
        url: '/docs/help/mailbox-rotation',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function MailboxRotationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Does Mailbox Rotation Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Automatic standby swaps that keep your campaigns sending when mailboxes go down
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800">
                    When a mailbox is paused due to health issues, Superkabe automatically swaps in a healthy standby mailbox
                    from the same domain to keep your campaigns sending. If no standby is available, campaigns continue with their
                    remaining healthy mailboxes. If <strong>all</strong> mailboxes on a campaign are paused, the campaign itself auto-pauses.
                </p>
            </div>

            {/* How It Works */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Rotation Works Step by Step</h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-12">
                <ol className="space-y-6">
                    <li className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Mailbox Is Paused</h3>
                            <p className="text-gray-600 text-sm">A mailbox exceeds the bounce threshold (3% after 60+ sends) and is automatically paused. It is removed from all active campaigns on your sending platform.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Standby Search</h3>
                            <p className="text-gray-600 text-sm">Superkabe looks for standby mailboxes on the <strong>same domain</strong> as the paused mailbox. This preserves domain reputation continuity and DKIM alignment.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Health &amp; Capacity Check</h3>
                            <p className="text-gray-600 text-sm">The standby must be healthy (not paused, not in recovery) and not already assigned to too many campaigns. Overloaded standbys are skipped.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Platform Swap</h3>
                            <p className="text-gray-600 text-sm">The standby mailbox is added to the affected campaigns on your sending platform (Smartlead, Instantly, or EmailBison). This happens via API &mdash; no manual action needed.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Campaign Continues</h3>
                            <p className="text-gray-600 text-sm">The campaign keeps sending with the new mailbox. An audit log entry is created recording the swap.</p>
                        </div>
                    </li>
                </ol>
            </div>

            {/* Standby Requirements */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What Makes a Valid Standby?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-green-900 mb-3">Eligible for Rotation</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">&#x2713;</span>
                            <span>Status is <strong>healthy</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">&#x2713;</span>
                            <span>On the <strong>same domain</strong> as the paused mailbox</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">&#x2713;</span>
                            <span>Not already in too many campaigns</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600">&#x2713;</span>
                            <span>Connected to the sending platform</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-red-900 mb-3">Not Eligible</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-red-600">&#x2717;</span>
                            <span>Currently paused or in any recovery phase</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-600">&#x2717;</span>
                            <span>On a different domain</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-600">&#x2717;</span>
                            <span>Already at maximum campaign capacity</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-600">&#x2717;</span>
                            <span>Not connected to the sending platform</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* What If No Standby */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What If No Standby Is Available?</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Some Mailboxes Still Healthy</h3>
                    <p className="text-gray-600 text-sm">
                        The campaign continues sending with its remaining healthy mailboxes. Volume will naturally decrease since fewer
                        mailboxes are active. Superkabe logs a warning so you know the campaign is running below capacity.
                    </p>
                </div>
                <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">All Mailboxes Paused</h3>
                    <p className="text-gray-600 text-sm">
                        If every single mailbox assigned to a campaign is paused (or removed during recovery), the campaign itself is
                        <strong> automatically paused</strong> on the sending platform. This is the only condition that triggers a campaign-level pause &mdash;
                        bounce rate alone never pauses a campaign directly.
                    </p>
                </div>
            </div>

            {/* Practical Example */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Example Scenario</h2>
                <div className="space-y-4 text-sm text-gray-700">
                    <p>You have 3 mailboxes on <strong>acmecorp.com</strong>:</p>
                    <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-2">
                        <p>&#x2022; <strong>john@acmecorp.com</strong> &mdash; Active in Campaign A and Campaign B</p>
                        <p>&#x2022; <strong>sarah@acmecorp.com</strong> &mdash; Active in Campaign A</p>
                        <p>&#x2022; <strong>mike@acmecorp.com</strong> &mdash; Standby (healthy, not in any campaigns)</p>
                    </div>
                    <p><strong>What happens when john@acmecorp.com bounces above 3%:</strong></p>
                    <div className="bg-white rounded-lg p-4 border border-purple-200 space-y-2">
                        <p>1. john@acmecorp.com is paused and removed from Campaign A and Campaign B</p>
                        <p>2. Superkabe finds mike@acmecorp.com as an eligible standby (same domain, healthy, low campaign count)</p>
                        <p>3. mike@acmecorp.com is added to Campaign A and Campaign B via the sending platform API</p>
                        <p>4. Both campaigns continue sending without interruption</p>
                        <p>5. john@acmecorp.com enters the healing pipeline and will recover over the coming days</p>
                    </div>
                </div>
            </div>

            {/* Best Practice */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-green-900">Best Practice: Keep Standby Mailboxes Ready</h2>
                <p className="text-green-800 mb-4">
                    For every 2&ndash;3 active mailboxes on a domain, maintain at least 1 warmed-up standby. This ensures
                    rotation can happen instantly when needed. A standby mailbox should be:
                </p>
                <ul className="space-y-2 text-sm text-green-800">
                    <li>&#x2022; Fully warmed up and healthy</li>
                    <li>&#x2022; Connected to your sending platform</li>
                    <li>&#x2022; On the same domain as your active mailboxes</li>
                    <li>&#x2022; Not assigned to any campaigns (reserved for rotation)</li>
                </ul>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-amber-900">Important Note on Platform Sync</h2>
                <p className="text-amber-800">
                    Mailbox rotation happens on your sending platform (Smartlead, Instantly, EmailBison) via their API. If the platform
                    API is temporarily unavailable, the swap will be retried. Check your audit logs if a rotation seems delayed &mdash;
                    you&rsquo;ll see the exact API response and retry attempts.
                </p>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/auto-healing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Auto-Healing Works (5-Phase Pipeline)
                    </a>
                    <a href="/docs/help/campaign-paused" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Why Is My Campaign Paused?
                    </a>
                    <a href="/docs/help/load-balancing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Load Balancing Works
                    </a>
                </div>
            </div>
        </div>
    );
}

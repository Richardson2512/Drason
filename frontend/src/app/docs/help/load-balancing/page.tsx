import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Does Load Balancing Work? | Superkabe Help',
    description: 'Learn how Superkabe analyzes mailbox distribution across campaigns and provides intelligent rebalancing suggestions to prevent overload and improve.',
    alternates: { canonical: '/docs/help/load-balancing' },
    openGraph: {
        title: 'How Does Load Balancing Work? | Superkabe Help',
        description: 'Learn how Superkabe analyzes mailbox distribution across campaigns and provides intelligent rebalancing suggestions to prevent overload and improve.',
        url: '/docs/help/load-balancing',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function LoadBalancingPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Does Load Balancing Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding how Superkabe distributes sending load across your mailboxes to maximize deliverability
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Superkabe's load balancing analyzes how your mailboxes are distributed across campaigns.
                    It identifies <strong>overloaded</strong>, <strong>optimal</strong>, and <strong>underutilized</strong> mailboxes,
                    then provides actionable suggestions to rebalance your infrastructure for better deliverability.
                </p>
                <p className="text-blue-700 text-sm">
                    Access it from <strong>Dashboard &rarr; Load Balancing</strong>.
                </p>
            </div>

            {/* What is Load Balancing */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What Is Mailbox Load Balancing?</h2>
            <p className="text-gray-600 mb-6">
                When you run multiple campaigns, each campaign uses one or more mailboxes to send emails.
                If too many campaigns share the same mailbox, that mailbox becomes overloaded &mdash; increasing its bounce risk and hurting sender reputation.
                Conversely, underutilized mailboxes represent wasted capacity.
            </p>
            <p className="text-gray-600 mb-8">
                Superkabe continuously monitors your mailbox-to-campaign ratio and flags imbalances before they cause deliverability problems.
            </p>

            {/* Load Categories */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Are Mailboxes Categorized?</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                            🔴
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Overloaded</h3>
                            <p className="text-gray-600 mb-2">
                                The mailbox is assigned to too many campaigns. This increases sending volume beyond safe thresholds and raises bounce risk.
                            </p>
                            <p className="text-sm text-red-700 font-medium">
                                Action needed: Move this mailbox out of some campaigns or add additional mailboxes to share the load.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                            🟢
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Optimal</h3>
                            <p className="text-gray-600">
                                The mailbox has a healthy number of campaign assignments. Sending volume is within safe limits. No action required.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                            🟡
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Underutilized</h3>
                            <p className="text-gray-600">
                                The mailbox is assigned to very few or zero campaigns. It could be added to campaigns that need more sending capacity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What Metrics Are Shown */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What Metrics Does Superkabe Show?</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-1">Total</div>
                        <p className="text-sm text-gray-500">Total mailboxes and campaigns in your organization</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-1">Distribution</div>
                        <p className="text-sm text-gray-500">How many mailboxes are overloaded, optimal, or underutilized</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-1">Average</div>
                        <p className="text-sm text-gray-500">Average number of campaigns per mailbox across your org</p>
                    </div>
                </div>
            </div>

            {/* Optimization Suggestions */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do Optimization Suggestions Work?</h2>
            <p className="text-gray-600 mb-4">
                Superkabe generates prioritized suggestions based on your current mailbox distribution. Each suggestion includes a priority level and a recommended action:
            </p>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-12">
                <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">HIGH</span>
                            <h3 className="font-bold text-gray-900">Add Mailbox</h3>
                        </div>
                        <p className="text-sm text-gray-600">A campaign needs more mailboxes to handle its sending volume safely. Click <strong>Apply</strong> to add a suggested mailbox instantly.</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">MEDIUM</span>
                            <h3 className="font-bold text-gray-900">Remove Mailbox</h3>
                        </div>
                        <p className="text-sm text-gray-600">A campaign has too many mailboxes relative to its volume. Click <strong>Apply</strong> to remove the excess mailbox from the campaign.</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">LOW</span>
                            <h3 className="font-bold text-gray-900">Move Mailbox</h3>
                        </div>
                        <p className="text-sm text-gray-600">A mailbox would perform better in a different campaign. This suggestion is informational &mdash; review and adjust manually in your sending platform.</p>
                    </div>
                </div>
            </div>

            {/* When Should I Rebalance */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">When Should I Rebalance?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-green-900 mb-3">Rebalance When:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>You see overloaded mailboxes (red) in the report</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>After adding or removing campaigns</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>After mailboxes are paused or enter recovery</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>When bounce rates increase unexpectedly</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                    <h3 className="font-bold text-amber-900 mb-3">Health Warnings</h3>
                    <p className="text-sm text-gray-700 mb-3">
                        If Superkabe detects infrastructure issues that affect load balancing, a Health Warnings section appears at the top of the report. These warnings indicate:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                        <li>&#x2022; Campaigns with zero healthy mailboxes</li>
                        <li>&#x2022; Mailboxes in recovery that shouldn't receive new campaigns</li>
                        <li>&#x2022; Domains with unhealthy mailbox ratios</li>
                    </ul>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/campaign-paused" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Why Is My Campaign Paused?
                    </a>
                    <a href="/docs/help/bounce-classification" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Does Bounce Classification Work?
                    </a>
                    <a href="/docs/monitoring" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Monitoring System (Technical Details)
                    </a>
                </div>
            </div>
        </div>
    );
}

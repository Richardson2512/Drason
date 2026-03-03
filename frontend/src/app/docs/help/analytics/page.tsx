import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Do Campaign Analytics Work? | Superkabe Help',
    description: 'Learn how to read Superkabe campaign analytics, track daily sending metrics, and use engagement data to optimize your outbound email performance.',
    alternates: { canonical: '/docs/help/analytics' },
    openGraph: {
        title: 'How Do Campaign Analytics Work? | Superkabe Help',
        description: 'Learn how to read Superkabe campaign analytics, track daily sending metrics, and use engagement data to optimize your outbound email performance.',
        url: '/docs/help/analytics',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function AnalyticsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Do Campaign Analytics Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding your daily sending metrics and engagement trends across all campaigns
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Superkabe's analytics dashboard tracks <strong>daily sending volume, opens, clicks, replies, and bounces</strong> for each campaign.
                    Select a campaign and date range to visualize engagement trends and identify deliverability issues early.
                </p>
                <p className="text-blue-700 text-sm">
                    Access it from <strong>Dashboard &rarr; Analytics</strong>.
                </p>
            </div>

            {/* What Metrics Are Tracked */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What Metrics Does Superkabe Track?</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                            📤
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Emails Sent</h3>
                            <p className="text-gray-600">
                                Total number of emails dispatched from your mailboxes each day. This is your baseline volume metric.
                                A sudden drop may indicate paused mailboxes or campaign issues.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                            👁️
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Opens</h3>
                            <p className="text-gray-600">
                                How many recipients opened your emails. Superkabe tracks this via pixel tracking from your sending platform.
                                Healthy campaigns typically see 40-60% open rates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                            🔗
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Clicks</h3>
                            <p className="text-gray-600">
                                Number of link clicks tracked in your emails. High click rates indicate strong call-to-action effectiveness and content relevance.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                            💬
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Replies</h3>
                            <p className="text-gray-600">
                                Direct replies from recipients. This is the strongest engagement signal and positively impacts your sender reputation with email providers.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                            ⛔
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Bounces</h3>
                            <p className="text-gray-600">
                                Emails that failed to deliver. Superkabe tracks hard bounces (permanent failures) separately.
                                If bounce rate exceeds 3%, Superkabe automatically pauses the affected mailbox.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How to Use Analytics */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I Use the Analytics Dashboard?</h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-12">
                <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Select a Campaign</h3>
                            <p className="text-gray-600 text-sm">Use the campaign dropdown to choose which campaign to analyze. Analytics are campaign-specific to give you focused insights.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Set Your Date Range</h3>
                            <p className="text-gray-600 text-sm">Choose a start and end date. Defaults to the last 30 days. Narrow the range to investigate specific incidents or widen it for trend analysis.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Read the Summary Cards</h3>
                            <p className="text-gray-600 text-sm">At a glance, see <strong>Total Sent</strong>, <strong>Avg Open Rate</strong>, <strong>Avg Reply Rate</strong>, and <strong>Total Bounces</strong> for the selected period.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Analyze the Trend Chart</h3>
                            <p className="text-gray-600 text-sm">The multi-line area chart shows daily trends for all five metrics. Hover over any point to see exact values for that day.</p>
                        </div>
                    </li>
                </ol>
            </div>

            {/* What Should I Look For */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">What Patterns Should I Watch For?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-green-900 mb-3">Healthy Patterns</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Consistent daily sending volume</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Open rates above 40%</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Bounce line stays flat near zero</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Replies trending upward over time</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-red-900 mb-3">Warning Signs</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Sudden drop in sending volume (mailboxes may be paused)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Bounce spikes (list quality issue or domain blacklisting)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Open rates declining (reputation degradation)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>&#x2022;</span>
                            <span>Zero replies for multiple days (content or targeting issue)</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/bounce-classification" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Does Bounce Classification Work?
                    </a>
                    <a href="/docs/help/campaign-paused" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Why Is My Campaign Paused?
                    </a>
                    <a href="/docs/monitoring" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Monitoring System (Technical Details)
                    </a>
                </div>
            </div>
        </div>
    );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Slack Integration Guide | Superkabe Docs',
    description: 'Deploy the Superkabe Slack bot for real-time infrastructure alerts and observability in your team channels.',
    alternates: { canonical: '/docs/slack-integration' },
    openGraph: {
        title: 'Slack Integration Guide | Superkabe Docs',
        description: 'Deploy the Superkabe Slack bot for real-time infrastructure alerts and observability in your team channels.',
        url: '/docs/slack-integration',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SlackIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Slack Bot Integration Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Deploy the Superkabe Slack App to bring infrastructure observability directly to your engineering or Go-To-Market channels.
            </p>

            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What You'll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    The Superkabe Slack integration is a two-way street. It allows you to:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>✅ Receive instant push alerts when domains are auto-paused to prevent burning.</li>
                    <li>✅ Be notified of critical infrastructure score transitions.</li>
                    <li>✅ Run interactive Slash Commands to fetch live health data without opening the dashboard.</li>
                </ol>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1: Connect Your Workspace</h2>
            <p className="text-gray-600 mb-4">
                Authorize the Superkabe Slack Application to access your workspace routing and scopes.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-700 text-sm">
                    <li><strong>1.</strong> In Superkabe, navigate to <strong>Dashboard → Settings</strong>.</li>
                    <li><strong>2.</strong> Scroll down to the <strong>Slack Bot Integration</strong> card.</li>
                    <li><strong>3.</strong> Click the <strong>Add to Slack</strong> button. You will be redirected to the secure Slack OAuth portal.</li>
                    <li><strong>4.</strong> Select your Slack workspace and authorize the requested permissions (`chat:write`, `commands`, `app_mentions:read`).</li>
                    <li><strong>5.</strong> Upon success, you will be redirected back to the Superkabe Settings dashboard.</li>
                </ol>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2: Configure Proactive Alerts</h2>
            <p className="text-gray-600 mb-4">
                Superkabe can send critical alerts directly to a designated Slack channel when intervention is required.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-4 text-gray-600">
                    <li>
                        <strong>1. Select a Destination Channel</strong>
                        <p className="text-sm text-gray-500 mt-1">
                            In the Slack Integration settings block, use the dropdown to select which channel should receive risk event notifications. Note: The Bot must be invited to private channels manually.
                        </p>
                    </li>
                    <li>
                        <strong>2. What Triggers an Alert?</strong>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                            <li className="bg-white border border-gray-200 p-3 rounded-xl">
                                <span className="font-bold text-red-600">Domain Burn Prevention</span>
                                <p className="text-gray-500 mt-1">Sent when 50% of mailboxes on a domain drop below the health threshold.</p>
                            </li>
                            <li className="bg-white border border-gray-200 p-3 rounded-xl">
                                <span className="font-bold text-amber-600">Execution Gate Blocking</span>
                                <p className="text-gray-500 mt-1">Sent when major campaigns are suspended from sending traffic.</p>
                            </li>
                        </ul>
                    </li>
                </ol>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 3: Live Slash Commands</h2>
            <p className="text-gray-600 mb-4">
                The Superkabe bot listens for interactive commands in any channel it is invited to:
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
                <ul className="space-y-6">
                    <li className="flex flex-col gap-2">
                        <code className="text-black bg-white px-3 py-2 rounded-lg w-fit border border-purple-200 font-bold shadow-sm whitespace-nowrap">
                            /superkabe health
                        </code>
                        <div className="text-purple-900 text-sm">
                            <p className="mb-2">Returns an executive summary of your overall infrastructure score and active critical risks.</p>
                            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded-md">
                                <strong>Example Response:</strong> "Your Global Infrastructure Score is 92/100. 1 Domain requires immediate attention."
                            </p>
                        </div>
                    </li>
                    <li className="flex flex-col gap-2 mt-4">
                        <code className="text-black bg-white px-3 py-2 rounded-lg w-fit border border-purple-200 font-bold shadow-sm whitespace-nowrap">
                            /superkabe domain [domain name]
                        </code>
                        <div className="text-purple-900 text-sm">
                            <p className="mb-2">Fetches the rolling 24-hour reputation, bounce rate, and active monitoring status of a specific domain.</p>
                            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded-md">
                                <strong>Example Request:</strong> `/superkabe domain superkabe.ai`<br />
                                <strong>Example Response:</strong> "superkabe.ai is HEALTHY. 4/4 mailboxes operational. 2.1% bounce rate over last 100 sends."
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">🎉 Integration Complete!</h2>
                <p className="text-gray-600 mb-4">
                    Your team is now synced with Superkabe's real-time analysis engine. Check out:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800">Learn how alerts are triggered</a></li>
                    <li>✓ <a href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800">Learn about Smartlead</a></li>
                    <li>✓ <a href="/docs/emailbison-integration" className="text-blue-600 hover:text-blue-800">Learn about EmailBison</a></li>
                </ul>
            </div>
        </div>
    );
}

export default function AdvancedIntegrationsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Advanced Integrations Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Learn how to configure EmailBison, deploy the Slack Bot, and manage multi-platform data syncing.
            </p>

            {/* EmailBison Integration */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">EmailBison Integration</h2>
            <p className="text-gray-600 mb-4">
                Connect your EmailBison account to ingest live warm-up metrics, engagement tracking, and reputation scoring natively into Superkabe.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-3">1. Add EmailBison API Key</h3>
                <ol className="space-y-3 text-gray-700 text-sm">
                    <li><strong>1.</strong> Navigate to your <strong>Superkabe Settings</strong> dashboard.</li>
                    <li><strong>2.</strong> Scroll down to the <strong>EmailBison Integration</strong> card.</li>
                    <li><strong>3.</strong> Obtain your API Key from the EmailBison developer portal and paste it into the Superkabe configuration box.</li>
                    <li><strong>4.</strong> Click <strong>Save Configuration</strong>. This will generate your customized webhook endpoint.</li>
                </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Configure Real-Time Webhooks</h3>
                <p className="text-gray-600 text-sm mb-4">
                    Real-time webhooks allow EmailBison to instantly report soft bounces, hard bounces, and engagement drops (spam flagging) directly to Superkabe's State Machine.
                </p>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Webhook URL:</p>
                        <code className="text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm inline-block">https://api.superkabe.com/api/monitor/emailbison-webhook</code>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Required Custom Header:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500 text-xs mb-1">Key Name:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">x-organization-id</code>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs mb-1">Value:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">YOUR_ORG_ID</code>
                                <p className="text-gray-400 text-xs mt-1">Found in Superkabe Settings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slack Integration */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Slack Bot Integration</h2>
            <p className="text-gray-600 mb-4">
                Bring Superkabe's observability pipeline directly to your engineering or Go-To-Market Slack channels. Receive critical alerts immediately when domains are burning or campaigns are auto-paused.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Connecting Your Workspace</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> In Superkabe, go to <strong>Settings → Slack Bot Integration</strong>.</li>
                    <li><strong>2.</strong> Click the <strong>Add to Slack</strong> button.</li>
                    <li><strong>3.</strong> Authorize the Superkabe Slack application to access your workspace routing and scopes.</li>
                    <li><strong>4.</strong> Once connected, select a <strong>Destination Channel</strong> from the dropdown to designate where proactive push alerts will be sent.</li>
                </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-purple-900 mb-3">Live Slash Commands</h3>
                <p className="text-purple-700 text-sm mb-4">
                    The Superkabe bot listens for interactive commands in Slack so you don't even need to open the dashboard to check your infrastructure health:
                </p>
                <ul className="space-y-3">
                    <li className="flex flex-col gap-1">
                        <code className="text-black bg-white px-2 py-1 rounded w-fit border border-purple-200 font-bold">/superkabe health</code>
                        <span className="text-purple-800 text-sm">Returns an executive summary of your overall infrastructure score and active critical risks.</span>
                    </li>
                    <li className="flex flex-col gap-1">
                        <code className="text-black bg-white px-2 py-1 rounded w-fit border border-purple-200 font-bold">/superkabe domain [domain name]</code>
                        <span className="text-purple-800 text-sm">Fetches the rolling 24-hour reputation, bounce rate, and active monitoring status of a specific domain.</span>
                    </li>
                </ul>
            </div>

            {/* Multi-Platform Sync */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Multi-Platform Data Sync</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">🚀</div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Parallel Cron Execution</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            You are not restricted to one data source. Superkabe allows concurrent parallel integrations between Smartlead, EmailBison, and Clay.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Superkabe runs independent <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800 underline">sync workers</a> every <strong>20 minutes</strong> for each platform. Because they run in isolation via distinct queue processors, if the Smartlead API goes down, it will not affect your EmailBison warm-up health checks and vice-versa. Data is aggregated seamlessly back into the unified Drason database schemas.
                        </p>
                        <hr className="border-gray-100 my-4" />
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Triggering Manual Syncs</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Normally, you rely on Webhooks for real-time risk blocking, but if you need to force-pull historical data or manually reconcile state representations on demand (e.g. after a massive CSV upload to an email engine), you can navigate to the respective Integration card in Settings and click the <strong>Trigger Manual Sync</strong> button.
                        </p>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready for the Next Level?</h2>
                <p className="text-gray-600 mb-4">
                    Now that you've mastered advanced integrations and alerts, learn how Superkabe scores your domains based on this consolidated data.
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/risk-scoring" className="text-blue-600 hover:text-blue-800 font-semibold">Risk Scoring Algorithms</a></li>
                    <li>✓ <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-800 font-semibold">Rules Enforced by the State Machine</a></li>
                    <li>✓ <a href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800 font-semibold">Back to Smartlead Docs</a></li>
                </ul>
            </div>
        </div>
    );
}

export default function EmailBisonIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                EmailBison Integration Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Connect your EmailBison account to ingest live warm-up metrics, engagement tracking, and reputation scoring natively into Superkabe.
            </p>

            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What You'll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    By the end of this guide, your EmailBison warm-up mailboxes will:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>✅ Sync mailbox reputation and warm-up milestones automatically.</li>
                    <li>✅ Send real-time engagement events (opens, clicks, replies) to Superkabe.</li>
                    <li>✅ Report critical deliverability drops (spam placements) for auto-healing.</li>
                </ol>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1: Add EmailBison API Key</h2>
            <p className="text-gray-600 mb-4">
                Superkabe needs your EmailBison API key to fetch your mailbox warm-up status.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-700 text-sm">
                    <li><strong>1.</strong> Navigate to your <strong>Superkabe Dashboard → Settings</strong>.</li>
                    <li><strong>2.</strong> Scroll down to the <strong>EmailBison Integration</strong> card.</li>
                    <li><strong>3.</strong> Log in to the EmailBison Developer Portal and copy your API Key.</li>
                    <li><strong>4.</strong> Paste it into the Superkabe configuration box and click <strong>Save Configuration</strong>. This generates your webhook endpoint.</li>
                </ol>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2: Configure Real-Time Webhooks</h2>
            <p className="text-gray-600 mb-4">
                Real-time webhooks allow EmailBison to instantly report soft bounces, hard bounces, and engagement drops directly to Superkabe's State Machine.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Webhook URL:</p>
                        <code className="text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm inline-block">https://api.superkabe.com/api/monitor/emailbison-webhook</code>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Required Custom Header:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-3 rounded-xl">
                                <p className="text-gray-500 text-xs mb-1">Header Name:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">x-organization-id</code>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-xl">
                                <p className="text-gray-500 text-xs mb-1">Header Value:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">YOUR_ORG_ID</code>
                                <p className="text-gray-400 text-xs mt-1">Found in Superkabe Settings</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Events to Subscribe To:</p>
                    <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><span className="text-green-500">☑</span> <code className="bg-gray-100 px-1 rounded">opened</code></li>
                        <li className="flex items-center gap-2"><span className="text-green-500">☑</span> <code className="bg-gray-100 px-1 rounded">clicked</code></li>
                        <li className="flex items-center gap-2"><span className="text-green-500">☑</span> <code className="bg-gray-100 px-1 rounded">replied</code></li>
                        <li className="flex items-center gap-2"><span className="text-red-500">☑</span> <code className="bg-gray-100 px-1 rounded">bounced</code></li>
                        <li className="flex items-center gap-2"><span className="text-red-500">☑</span> <code className="bg-gray-100 px-1 rounded">spam</code></li>
                        <li className="flex items-center gap-2"><span className="text-red-500">☑</span> <code className="bg-gray-100 px-1 rounded">unsubscribed</code></li>
                    </ul>
                </div>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 3: Multi-Platform Sync</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Parallel Cron Execution</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Superkabe allows concurrent parallel integrations between Smartlead, EmailBison, and Clay. We run independent sync workers every <strong>20 minutes</strong> for each platform. Because they run in isolation via distinct queue processors, if the Smartlead API goes down, it will not affect your EmailBison warm-up health checks and vice-versa.
                </p>
                <h4 className="text-sm font-bold text-gray-900 mt-6 mb-2">Triggering Manual Syncs</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Normally, you rely on Webhooks for real-time risk blocking, but if you need to force-pull historical data or manually reconcile state representations on demand, you can navigate to the EmailBison Integration card in Settings and click the <strong>Trigger Manual Sync</strong> button.
                </p>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">🎉 Integration Complete!</h2>
                <p className="text-gray-600 mb-4">
                    Your EmailBison infrastructure is now connected. Next steps:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800">Learn about continuous monitoring</a></li>
                    <li>✓ <a href="/docs/risk-scoring" className="text-blue-600 hover:text-blue-800">Review Risk Scoring Algorithms</a></li>
                    <li>✓ <a href="/docs/slack-integration" className="text-blue-600 hover:text-blue-800">Set up Slack alerts for bounces</a></li>
                </ul>
            </div>
        </div>
    );
}

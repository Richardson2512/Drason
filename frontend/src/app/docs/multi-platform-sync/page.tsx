export default function MultiPlatformSyncPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Multi-Platform Data Sync
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Learn how Superkabe synchronizes data across multiple third-party integrations like Smartlead, EmailBison, and Clay simultaneously.
            </p>

            {/* Architecture Overview */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Parallel Cron Execution</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="text-4xl mt-1">🔄</div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Isolated Sync Workers</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            You are not restricted to one data source. Superkabe allows concurrent parallel integrations between Smartlead, EmailBison, and Clay.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Superkabe runs independent <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800 underline">sync workers</a> every <strong>20 minutes</strong> for each platform. Because they run in isolation via distinct queue processors, if the Smartlead API goes down, it will not affect your EmailBison warm-up health checks and vice-versa. Data is aggregated seamlessly back into the unified Drason database schemas.
                        </p>
                    </div>
                </div>
            </div>

            {/* Manual Syncing */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Triggering Manual Syncs</h2>
            <p className="text-gray-600 mb-4">
                Normally, you safely rely on real-time Webhooks for risk blocking and the automated cron scheduler for historical state synchronization. However, there are times you may want to force a manual sync instantly.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-900 mb-3">When to Use Manual Sync</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• After uploading a massive CSV of new leads to Clay.</li>
                    <li>• After reconnecting an integration that was temporarily paused.</li>
                    <li>• If you ever observe an unexpected discrepancy in mailbox counts between Smartlead and Superkabe.</li>
                </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-4 text-gray-600">
                    <li>
                        <strong>1. Navigate to Settings</strong>
                        <p className="text-sm text-gray-500 mt-1">Open <strong>Dashboard → Settings</strong> in Superkabe.</p>
                    </li>
                    <li>
                        <strong>2. Locate the Target Platform</strong>
                        <p className="text-sm text-gray-500 mt-1">Scroll down to the specific integration block you want to force-sync (e.g., Smartlead or EmailBison).</p>
                    </li>
                    <li>
                        <strong>3. Execute the Sync</strong>
                        <p className="text-sm text-gray-500 mt-1">Click the <strong>Trigger Manual Sync</strong> button. A progress modal will appear taking 30-90 seconds to fetch and rebuild the latest state.</p>
                    </li>
                </ol>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Integration Guides</h2>
                <p className="text-gray-600 mb-4">
                    Learn more about configuring specific integrations and understanding their data structures:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800">Smartlead Integration</a></li>
                    <li>✓ <a href="/docs/emailbison-integration" className="text-blue-600 hover:text-blue-800">EmailBison Integration</a></li>
                    <li>✓ <a href="/docs/clay-integration" className="text-blue-600 hover:text-blue-800">Clay Integration</a></li>
                </ul>
            </div>
        </div>
    );
}

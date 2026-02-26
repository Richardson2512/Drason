import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Instantly Integration Guide | Superkabe',
    description: 'Connect your Instantly account to sync campaigns, monitor deliverability, and protect mailboxes with Superkabe.',
    alternates: {
        canonical: '/docs/instantly-integration',
    },
};

export default function InstantlyIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Instantly Integration Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Connect your Instantly account to sync campaigns, track per-mailbox engagement, and enable real-time deliverability protection inside Superkabe.
            </p>

            {/* What You'll Accomplish */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What You'll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    By the end of this guide, your Instantly campaigns will:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>✅ Sync campaigns and mailboxes into Superkabe automatically every 20 minutes</li>
                    <li>✅ Send real-time engagement events (opens, clicks, replies, bounces) via webhooks</li>
                    <li>✅ Trigger automated mailbox pausing when bounce thresholds are breached</li>
                    <li>✅ Enable domain-level protection when multiple mailboxes go unhealthy</li>
                    <li>✅ Provide per-mailbox stats visible on the Superkabe dashboard</li>
                </ol>
            </div>

            {/* Prerequisites */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Prerequisites</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <ul className="space-y-3 text-gray-600">
                    <li>✓ Active Superkabe account (<a href="/signup" className="text-blue-600 hover:text-blue-800">Sign up here</a>)</li>
                    <li>✓ Instantly account on the <strong>Growth plan or above</strong> (required for V2 API access)</li>
                    <li>✓ Admin access to Instantly Settings to generate API keys and configure webhooks</li>
                    <li>✓ Your Organization ID from Superkabe Settings (UUID format)</li>
                </ul>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1: Generate Your Instantly V2 API Key</h2>
            <p className="text-gray-600 mb-4">
                Superkabe uses the Instantly V2 API to sync your campaigns, mailboxes, and sending statistics.
                The V2 API is required — V1 keys will not work.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                <p className="text-amber-800 text-sm font-semibold">⚠️ Plan Requirement</p>
                <p className="text-amber-700 text-sm mt-1">
                    Instantly V2 API access requires the <strong>Growth plan or above</strong>.
                    If you are on the Sending plan, you will need to upgrade before proceeding.
                </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Get Your V2 API Key</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> Log in to your Instantly account</li>
                    <li><strong>2.</strong> Navigate to <strong>Settings → API Keys</strong></li>
                    <li><strong>3.</strong> Click <strong>Create API Key</strong> and give it a name (e.g., <em>Superkabe</em>)</li>
                    <li><strong>4.</strong> Select <strong>V2</strong> as the API version</li>
                    <li>
                        <strong>5.</strong> Copy the generated key — it will look like:
                        <code className="block mt-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg text-xs">
                            inst_v2_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                        </code>
                    </li>
                    <li><strong>6.</strong> Store it securely — it won't be shown again after leaving the page</li>
                </ol>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2: Add Your API Key to Superkabe</h2>
            <p className="text-gray-600 mb-4">
                Once you have your V2 API key, add it to Superkabe so campaigns and mailboxes can be synced.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> In Superkabe, go to <strong>Settings → Integrations</strong></li>
                    <li><strong>2.</strong> Select the <strong>Instantly</strong> tab</li>
                    <li><strong>3.</strong> Paste your V2 API key into the <strong>Instantly API V2 Key</strong> field</li>
                    <li><strong>4.</strong> Click <strong>Save Configuration</strong></li>
                    <li><strong>5.</strong> Superkabe will validate the key and begin syncing your campaigns and mailboxes</li>
                </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-green-700 mb-2">✓ Expected Result</h3>
                <p className="text-gray-600 text-sm">
                    After saving, your Instantly campaigns and sending accounts will appear in the Superkabe dashboard under <strong>Campaigns</strong> and <strong>Mailboxes</strong> within a few minutes.
                </p>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 3: Get Your Webhook URL and Organization ID</h2>
            <p className="text-gray-600 mb-4">
                You'll need two pieces of information to configure webhooks in Instantly.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <div className="space-y-5">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Webhook URL:</p>
                        <p className="text-gray-500 text-xs mb-2">
                            Found in <strong>Superkabe → Settings → Instantly → Webhook Endpoint</strong> (copy button provided)
                        </p>
                        <code className="text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm inline-block">
                            https://api.superkabe.com/api/monitor/instantly-webhook
                        </code>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Your Organization ID:</p>
                        <p className="text-gray-500 text-xs mb-2">
                            Found in <strong>Superkabe → Settings → API Keys → Organization ID</strong>
                        </p>
                        <code className="text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm inline-block">
                            YOUR_ORGANIZATION_ID
                        </code>
                        <p className="text-gray-400 text-xs mt-1">UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)</p>
                    </div>
                </div>
            </div>

            {/* Step 4 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 4: Configure Webhooks in Instantly</h2>
            <p className="text-gray-600 mb-4">
                Set up Instantly to send real-time events to Superkabe so per-mailbox stats and health signals are always up to date.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-5 text-gray-600">
                    <li>
                        <strong>1. Open Instantly Webhook Settings</strong>
                        <p className="text-sm text-gray-500 mt-1">
                            Instantly Dashboard → <strong>Settings → Integrations → Webhooks</strong> → <strong>Add Webhook</strong>
                        </p>
                    </li>
                    <li>
                        <strong>2. Enter the Webhook URL</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 text-sm">
                            <p className="text-gray-500 mb-2">Paste this URL into the webhook URL field:</p>
                            <code className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs block">
                                https://api.superkabe.com/api/monitor/instantly-webhook
                            </code>
                        </div>
                    </li>
                    <li>
                        <strong>3. Add the Organization ID Header</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 text-sm">
                            <p className="text-gray-500 mb-3">
                                Click <strong>Add Header</strong> and enter the following:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-700 font-medium mb-1">Header Name:</p>
                                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">x-organization-id</code>
                                </div>
                                <div>
                                    <p className="text-gray-700 font-medium mb-1">Header Value:</p>
                                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">YOUR_ORG_ID</code>
                                    <p className="text-gray-400 text-xs mt-1">(your UUID from Superkabe Settings)</p>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>4. Select Events to Monitor</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-3">Enable all of the following event types:</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">☑</span>
                                    <code className="px-2 py-1 bg-green-50 rounded text-green-700">email_sent</code>
                                    <span className="text-gray-500">— Tracks send volume per mailbox</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">☑</span>
                                    <code className="px-2 py-1 bg-blue-50 rounded text-blue-700">email_opened</code>
                                    <span className="text-gray-500">— Open rate tracking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">☑</span>
                                    <code className="px-2 py-1 bg-blue-50 rounded text-blue-700">email_clicked</code>
                                    <span className="text-gray-500">— Click rate tracking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-500">☑</span>
                                    <code className="px-2 py-1 bg-purple-50 rounded text-purple-700">email_replied</code>
                                    <span className="text-gray-500">— Reply rate tracking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500">☑</span>
                                    <code className="px-2 py-1 bg-red-50 rounded text-red-700">email_bounced</code>
                                    <span className="text-gray-500">— Critical for health monitoring</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-500">☑</span>
                                    <code className="px-2 py-1 bg-amber-50 rounded text-amber-700">email_unsubscribed</code>
                                    <span className="text-gray-500">— Unsubscribe tracking</span>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li>
                        <strong>5. Save the Webhook</strong>
                        <p className="text-sm text-gray-500 mt-1">
                            Click <strong>Save</strong>. Instantly may send a test ping to verify your endpoint is reachable.
                        </p>
                    </li>
                </ol>
            </div>

            {/* Step 5 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 5: Auto-Sync and Manual Sync</h2>
            <p className="text-gray-600 mb-4">
                Superkabe syncs your Instantly data on two schedules:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">⚡</span>
                        <h3 className="text-lg font-bold text-purple-800">24/7 Auto-Sync</h3>
                        <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">LIVE</span>
                    </div>
                    <p className="text-purple-700 text-sm">
                        Superkabe automatically syncs your Instantly campaigns, mailboxes, and stats every <strong>20 minutes</strong>.
                        No action required — it runs continuously in the background.
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🔄</span>
                        <h3 className="text-lg font-bold text-gray-800">Manual Sync</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                        For immediate updates after making changes in Instantly (e.g., pausing a campaign, adding mailboxes),
                        use the <strong>Trigger Manual Sync</strong> button in Settings → Instantly.
                    </p>
                </div>
            </div>

            {/* Step 6 - Verify */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 6: Verify the Integration</h2>
            <p className="text-gray-600 mb-4">
                Confirm that campaigns and events are flowing correctly into Superkabe.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Check Campaign Sync</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> In Superkabe, navigate to <strong>Campaigns</strong></li>
                    <li><strong>2.</strong> Your Instantly campaigns should be listed with their current status</li>
                    <li><strong>3.</strong> Click a campaign to see its associated mailboxes and per-mailbox stats</li>
                </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Check Webhook Events</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> Send a test email from one of your Instantly campaigns</li>
                    <li><strong>2.</strong> Wait 1–2 minutes for the <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">email_sent</code> webhook event</li>
                    <li><strong>3.</strong> In Superkabe, go to <strong>Audit Log</strong> and look for a recent Instantly event entry</li>
                    <li><strong>4.</strong> Check <strong>Mailboxes</strong> — the sending mailbox's <em>Sent</em> counter should have incremented</li>
                </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-green-700 mb-2">✓ What Success Looks Like</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>✓ Instantly campaigns visible in Superkabe Campaigns page</li>
                    <li>✓ Per-mailbox stats (Sent, Opens, Clicks, Replies, Bounces) updating in real time</li>
                    <li>✓ Bounce events appearing in the Audit Log</li>
                    <li>✓ Mailbox health scores reflecting actual engagement patterns</li>
                    <li>✓ Warnings triggered when mailbox bounce thresholds approach</li>
                </ul>
            </div>

            {/* What Superkabe Monitors */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Superkabe Monitors From Instantly</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="space-y-5 text-gray-600 text-sm">
                    <div>
                        <p className="font-semibold text-blue-700 mb-2">Per-Mailbox Engagement Metrics:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• <strong>Sent</strong> — total emails dispatched from each mailbox</li>
                            <li>• <strong>Opens</strong> — unique open count per mailbox</li>
                            <li>• <strong>Clicks</strong> — link clicks tracked per mailbox</li>
                            <li>• <strong>Replies</strong> — response rate per mailbox</li>
                            <li>• <strong>Bounces</strong> — hard bounce count (triggers health logic)</li>
                            <li>• <strong>Unsubscribes</strong> — opt-out signals per mailbox</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-red-600 mb-2">Mailbox Health Thresholds:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• <strong>Warning:</strong> 3 bounces within the last 60 sends</li>
                            <li>• <strong>Pause:</strong> 5 bounces within the last 100 sends</li>
                            <li>• Uses a rolling window — not hard resets on each sync</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-amber-600 mb-2">Domain-Level Protection:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• <strong>Warning:</strong> 30% of domain mailboxes are unhealthy</li>
                            <li>• <strong>Pause:</strong> 50% of domain mailboxes are unhealthy</li>
                            <li>• Ratio-based so it scales with your infrastructure size</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-purple-700 mb-2">Campaign-Level Visibility:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• Campaign status synced (active, paused, completed)</li>
                            <li>• Mailbox assignment per campaign tracked</li>
                            <li>• Execution blocking reasons logged in the audit trail</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Troubleshooting */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Troubleshooting</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Issue</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Solution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-gray-700">API key rejected on save</td>
                            <td className="px-6 py-4 text-gray-600">Ensure you're using a <strong>V2</strong> key, not a V1 key. Requires Growth plan or above.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Campaigns not appearing</td>
                            <td className="px-6 py-4 text-gray-600">Wait up to 20 minutes for the next auto-sync, or use <strong>Trigger Manual Sync</strong> in Settings.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Webhooks returning 401</td>
                            <td className="px-6 py-4 text-gray-600">Verify the <code className="px-2 py-1 bg-gray-100 rounded">x-organization-id</code> header value matches your Superkabe Organization ID exactly.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Per-mailbox stats not updating</td>
                            <td className="px-6 py-4 text-gray-600">Confirm all 6 webhook event types are selected in Instantly and the webhook URL is correct.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Webhook events not appearing in Audit Log</td>
                            <td className="px-6 py-4 text-gray-600">Check Instantly's webhook delivery log for failed attempts. Normal processing latency is 15–60 seconds.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Mailboxes missing from campaign view</td>
                            <td className="px-6 py-4 text-gray-600">Trigger a manual sync. Newly added sending accounts may take up to one sync cycle to appear.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">🎉 Integration Complete!</h2>
                <p className="text-gray-600 mb-4">
                    Your Instantly campaigns are now connected to Superkabe. Here's what to explore next:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800">Learn about monitoring thresholds</a></li>
                    <li>✓ <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-800">Understand platform rules and system modes</a></li>
                    <li>✓ <a href="/docs/execution-gate" className="text-blue-600 hover:text-blue-800">Review execution gate logic</a></li>
                    <li>✓ <a href="/docs/help/24-7-monitoring" className="text-blue-600 hover:text-blue-800">How 24/7 auto-sync works</a></li>
                    <li>✓ Monitor your dashboard daily for the first week to establish a healthy baseline</li>
                </ul>
            </div>
        </div>
    );
}

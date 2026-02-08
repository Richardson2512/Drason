export default function SmartleadIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Smartlead Integration Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Step-by-step guide to connect Smartlead with Superkabe for real-time bounce monitoring and mailbox protection
            </p>

            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What You'll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    By the end of this guide, your Smartlead campaigns will:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>✅ Send real-time bounce and delivery events to Superkabe</li>
                    <li>✅ Trigger automated mailbox pausing at 5 bounces / 100 sends</li>
                    <li>✅ Enable domain-level protection when 50% of mailboxes are unhealthy</li>
                    <li>✅ Provide visibility into execution blocking reasons</li>
                </ol>
            </div>

            {/* Prerequisites */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Prerequisites</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <ul className="space-y-3 text-gray-600">
                    <li>✓ Active Superkabe account (<a href="/signup" className="text-blue-600 hover:text-blue-800">Sign up here</a>)</li>
                    <li>✓ Smartlead account with active campaigns</li>
                    <li>✓ Smartlead API key (found in Smartlead Settings)</li>
                    <li>✓ Your mailboxes should be imported into Superkabe first</li>
                    <li>✓ Admin access to Smartlead webhook settings</li>
                </ul>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1: Add Smartlead API Key to Superkabe</h2>
            <p className="text-gray-600 mb-4">
                Superkabe needs your Smartlead API key to sync campaign and mailbox data.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Get Your Smartlead API Key</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> Log in to Smartlead</li>
                    <li><strong>2.</strong> Navigate to <strong>Settings → API</strong></li>
                    <li><strong>3.</strong> Copy your API key (format: <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">sl_live_xxxxxxxxxxxx</code>)</li>
                </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Add API Key to Superkabe</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> In Superkabe, go to <strong>Settings → Integrations</strong></li>
                    <li><strong>2.</strong> Find the <strong>Smartlead</strong> section</li>
                    <li><strong>3.</strong> Paste your API key in the <strong>API Key</strong> field</li>
                    <li><strong>4.</strong> Click <strong>Save</strong></li>
                    <li><strong>5.</strong> Superkabe will validate the key and sync your campaigns</li>
                </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-green-700 mb-2">✓ Expected Result</h3>
                <p className="text-gray-600">
                    After saving, you should see your Smartlead campaigns appear in the Superkabe dashboard under <strong>Campaigns</strong>.
                </p>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2: Get Your Webhook URL and Organization ID</h2>
            <p className="text-gray-600 mb-4">
                You'll need these to configure webhooks in Smartlead.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Webhook URL:</p>
                        <code className="text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm inline-block">https://api.superkabe.com/api/monitor/smartlead-webhook</code>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Your Organization ID:</p>
                        <p className="text-gray-500 text-sm">Found in <strong>Superkabe → Settings → API Keys</strong></p>
                        <code className="text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm inline-block mt-1">org_YOUR_ORGANIZATION_ID</code>
                    </div>
                </div>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 3: Configure Webhooks in Smartlead</h2>
            <p className="text-gray-600 mb-4">
                Set up Smartlead to send bounce and delivery events to Superkabe in real-time.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-4 text-gray-600">
                    <li>
                        <strong>1. Navigate to Smartlead Webhook Settings</strong>
                        <p className="text-sm text-gray-500 mt-1">Smartlead Dashboard → Settings → Webhooks → Add New Webhook</p>
                    </li>
                    <li>
                        <strong>2. Enter Webhook Details</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 space-y-3 text-sm">
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Webhook Name:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Superkabe Monitoring</code>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Webhook URL:</p>
                                <code className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">https://api.superkabe.com/api/monitor/smartlead-webhook</code>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>3. Add Custom Header</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 text-sm">
                            <p className="text-gray-500 mb-2">Click <strong>Add Header</strong> and input:</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-700 mb-1">Header Name:</p>
                                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">x-organization-id</code>
                                </div>
                                <div>
                                    <p className="text-gray-700 mb-1">Header Value:</p>
                                    <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">org_YOUR_ORG_ID</code>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>4. Select Events to Monitor</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-3">Check the following event types:</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-600">☑</span>
                                    <code className="px-2 py-1 bg-green-50 rounded text-green-600">email_sent</code>
                                    <span className="text-gray-500">— Tracks send volume</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500">☑</span>
                                    <code className="px-2 py-1 bg-red-50 rounded text-red-600">email_bounce</code>
                                    <span className="text-gray-500">— Critical for monitoring</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500">☑</span>
                                    <code className="px-2 py-1 bg-red-50 rounded text-red-600">hard_bounce</code>
                                    <span className="text-gray-500">— Hard failures</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-amber-500">☑</span>
                                    <code className="px-2 py-1 bg-amber-50 rounded text-amber-600">soft_bounce</code>
                                    <span className="text-gray-500">— Logged, not counted</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-500">☑</span>
                                    <code className="px-2 py-1 bg-red-50 rounded text-red-600">delivery_failure</code>
                                    <span className="text-gray-500">— Delivery issues</span>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li>
                        <strong>5. Save and Test</strong>
                        <p className="text-sm text-gray-500 mt-1">Click <strong>Save Webhook</strong>. Smartlead may send a test event to verify the endpoint.</p>
                    </li>
                </ol>
            </div>

            {/* Step 4 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 4: (Optional) Configure Webhook Secret</h2>
            <p className="text-gray-600 mb-4">
                For production environments, enable webhook signature validation for added security.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> In Smartlead, generate a webhook secret (if supported)</li>
                    <li><strong>2.</strong> In Superkabe, go to <strong>Settings → Integrations → Smartlead</strong></li>
                    <li><strong>3.</strong> Add the secret in the <strong>Webhook Secret</strong> field</li>
                    <li><strong>4.</strong> Superkabe will validate incoming webhook signatures using HMAC-SHA256</li>
                </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-700 mb-2">💡 Development vs Production</h3>
                <p className="text-gray-600 text-sm">
                    In development, Superkabe allows webhooks without signature validation. For production, we strongly recommend configuring a webhook secret.
                </p>
            </div>

            {/* Step 5 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 5: Verify Webhook Integration</h2>
            <p className="text-gray-600 mb-4">
                Test that Smartlead events are flowing correctly into Superkabe.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Method 1: Send a Test Email</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> From one of your Smartlead campaigns, send a test email</li>
                    <li><strong>2.</strong> Wait 1-2 minutes for the <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">email_sent</code> webhook</li>
                    <li><strong>3.</strong> In Superkabe, check <strong>Dashboard → Mailboxes</strong></li>
                    <li><strong>4.</strong> Verify the send count incremented for the mailbox</li>
                </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Method 2: Check Audit Logs</h3>
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> Navigate to <strong>Superkabe → Audit Log</strong></li>
                    <li><strong>2.</strong> Look for recent events like:</li>
                </ol>
                <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 text-xs">
                    <ul className="space-y-1 text-gray-600">
                        <li>• <code className="text-green-600 bg-green-50 px-1 rounded">EMAIL_SENT</code> event from Smartlead</li>
                        <li>• <code className="text-blue-600 bg-blue-50 px-1 rounded">MONITORING</code> action for mailbox</li>
                        <li>• Mailbox ID and campaign ID should match</li>
                    </ul>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-green-700 mb-2">✓ What Success Looks Like</h3>
                <p className="text-gray-600 mb-4">
                    When webhooks are working correctly, you'll see:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>✓ Real-time send counts updating in Superkabe dashboard</li>
                    <li>✓ Bounce events logged in audit trail</li>
                    <li>✓ Mailbox health scores reflecting actual sending patterns</li>
                    <li>✓ Warnings appearing when thresholds approach (3 bounces / 60 sends)</li>
                </ul>
            </div>

            {/* Step 6 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 6: Configure System Mode</h2>
            <p className="text-gray-600 mb-4">
                Choose how aggressively Superkabe should protect your infrastructure.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-700 mb-3">OBSERVE</h3>
                    <p className="text-gray-600 text-sm mb-4">Logs all events without blocking execution.</p>
                    <p className="text-gray-500 text-xs"><strong>Use for:</strong> First week of integration to establish baseline</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-700 mb-3">SUGGEST</h3>
                    <p className="text-gray-600 text-sm mb-4">Provides recommendations without automated actions.</p>
                    <p className="text-gray-500 text-xs"><strong>Use for:</strong> Review mode before enabling enforcement</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-purple-700 mb-3">ENFORCE</h3>
                    <p className="text-gray-600 text-sm mb-4">Fully automated pausing and protection.</p>
                    <p className="text-gray-500 text-xs"><strong>Use for:</strong> Production protection (recommended)</p>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <p className="text-gray-600 mb-4"><strong>To change system mode:</strong></p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Navigate to <strong>Settings → System Mode</strong></li>
                    <li><strong>2.</strong> Select your preferred mode</li>
                    <li><strong>3.</strong> Click <strong>Save Changes</strong></li>
                </ol>
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
                            <td className="px-6 py-4 text-gray-700">Webhooks return 401</td>
                            <td className="px-6 py-4 text-gray-600">Verify <code className="px-2 py-1 bg-gray-100 rounded">x-organization-id</code> header is correct</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Events not appearing</td>
                            <td className="px-6 py-4 text-gray-600">Check webhook URL ends with <code className="px-2 py-1 bg-gray-100 rounded">/smartlead-webhook</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Signature validation fails</td>
                            <td className="px-6 py-4 text-gray-600">Ensure webhook secret matches in both Smartlead and Superkabe</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Mailbox not found errors</td>
                            <td className="px-6 py-4 text-gray-600">Sync mailboxes from Smartlead via Settings → Sync Data</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Delayed event processing</td>
                            <td className="px-6 py-4 text-gray-600">Normal latency is 30-60 seconds; check Smartlead webhook logs</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Understanding Monitoring */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Understanding What Superkabe Monitors</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="space-y-4 text-gray-600 text-sm">
                    <div>
                        <p className="font-semibold text-blue-700 mb-2">Mailbox-Level Monitoring:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• <strong>Warning:</strong> 3 bounces within last 60 sends</li>
                            <li>• <strong>Pause:</strong> 5 bounces within last 100 sends</li>
                            <li>• Uses rolling window (not hard resets)</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-amber-600 mb-2">Domain-Level Monitoring:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• <strong>Warning:</strong> 30% of mailboxes unhealthy</li>
                            <li>• <strong>Pause:</strong> 50% of mailboxes unhealthy</li>
                            <li>• Ratio-based for scalability</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-purple-700 mb-2">Lead-Level Protection:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• Blocked if assigned mailbox/domain is paused</li>
                            <li>• Execution gate checks before each send</li>
                            <li>• State transitions logged in audit trail</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">🎉 Integration Complete!</h2>
                <p className="text-gray-600 mb-4">
                    Your Smartlead campaigns are now protected by Superkabe. Next steps:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800">Learn about monitoring thresholds</a></li>
                    <li>✓ <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-800">Understand platform rules</a></li>
                    <li>✓ <a href="/docs/execution-gate" className="text-blue-600 hover:text-blue-800">Review execution gate logic</a></li>
                    <li>✓ Monitor your dashboard daily for the first week</li>
                </ul>
            </div>
        </div>
    );
}

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
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What You&apos;ll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    The Superkabe Slack integration is a two-way street. It allows you to:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>Receive instant push alerts when mailboxes or domains are paused or at risk.</li>
                    <li>Get real-time recommendations in Suggest mode — so your team can act before damage occurs.</li>
                    <li>Be notified of load balancing changes, predictive risk warnings, and recovery completions.</li>
                    <li>Run interactive Slash Commands to fetch live health data without opening the dashboard.</li>
                </ol>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1: Connect Your Workspace</h2>
            <p className="text-gray-600 mb-4">
                Authorize the Superkabe Slack Application to access your workspace.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-700 text-sm">
                    <li><strong>1.</strong> In Superkabe, navigate to <strong>Dashboard &rarr; Settings</strong>.</li>
                    <li><strong>2.</strong> Scroll down to the <strong>Slack Bot Integration</strong> card.</li>
                    <li><strong>3.</strong> Click the <strong>Add to Slack</strong> button. You will be redirected to the secure Slack OAuth portal.</li>
                    <li><strong>4.</strong> Select your Slack workspace and authorize the requested permissions (<code>chat:write</code>, <code>commands</code>, <code>app_mentions:read</code>).</li>
                    <li><strong>5.</strong> Upon success, you will be redirected back to the Superkabe Settings dashboard.</li>
                </ol>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2: Configure Alert Channel</h2>
            <p className="text-gray-600 mb-4">
                Choose which Slack channel receives Superkabe alerts. The bot will send a test message to verify access before saving.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-700 text-sm">
                    <li><strong>1.</strong> In the Slack Integration settings card, use the <strong>channel dropdown</strong> to select a destination channel.</li>
                    <li><strong>2.</strong> The bot automatically lists all public channels. For <strong>private channels</strong>, you must first invite the bot manually (<code>/invite @Superkabe</code>).</li>
                    <li><strong>3.</strong> Click <strong>Save</strong>. A test message is sent to the channel to confirm access.</li>
                    <li><strong>4.</strong> The integration status will show <strong>Active</strong> with a green badge once configured.</li>
                </ol>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <strong>Note:</strong> If the bot loses access to the channel (deleted, archived, or permissions revoked), the status will automatically update to reflect the issue, and alerts will be paused until the channel is reconfigured.
                </div>
            </div>

            {/* Alerts by System Mode */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Alerts by System Mode</h2>
            <p className="text-gray-600 mb-6">
                The alerts you receive in Slack depend on your organization&apos;s <strong>system mode</strong>. Here&apos;s what to expect in each mode:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-gray-400 mb-2">Observe Mode</h3>
                    <p className="text-sm text-gray-500">No Slack alerts are sent. All events are logged internally for review in the audit log.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-amber-700 mb-2">Suggest Mode</h3>
                    <p className="text-sm text-gray-600">
                        Slack alerts are sent as <strong>recommendations</strong>. No automated actions are taken — your team decides what to do.
                        Each alert clearly states <em>&quot;No action taken — manual intervention recommended.&quot;</em>
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-red-700 mb-2">Enforce Mode</h3>
                    <p className="text-sm text-gray-600">
                        Slack alerts confirm <strong>automated actions</strong> that have already been taken (e.g., mailbox paused, domain paused, mailbox rotated).
                    </p>
                </div>
            </div>

            {/* Full Alert Catalog */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Complete Alert Catalog</h2>
            <p className="text-gray-600 mb-6">
                Superkabe sends the following types of Slack alerts. Each alert is color-coded by severity and deduplicated within 15-minute windows to prevent spam.
            </p>

            {/* Mailbox & Domain Alerts */}
            <h3 className="text-xl font-bold mb-3 text-gray-900">Mailbox &amp; Domain Monitoring</h3>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3 font-bold text-gray-700">Alert</th>
                            <th className="text-left p-3 font-bold text-gray-700">Severity</th>
                            <th className="text-left p-3 font-bold text-gray-700">Mode</th>
                            <th className="text-left p-3 font-bold text-gray-700">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="p-3 font-medium">Mailbox Warning Recommended</td>
                            <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Warning</span></td>
                            <td className="p-3 text-gray-500">Suggest</td>
                            <td className="p-3 text-gray-500">Mailbox is showing early warning signs (e.g., 3 bounces within 60 sends). Review recommended.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Mailbox Pause Recommended</td>
                            <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Critical</span></td>
                            <td className="p-3 text-gray-500">Suggest</td>
                            <td className="p-3 text-gray-500">Mailbox has exceeded bounce threshold and should be paused. Manual intervention recommended.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Mailbox Paused</td>
                            <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Critical</span></td>
                            <td className="p-3 text-gray-500">Enforce</td>
                            <td className="p-3 text-gray-500">Mailbox has been automatically paused and removed from all campaigns.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Domain Warning Recommended</td>
                            <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Warning</span></td>
                            <td className="p-3 text-gray-500">Suggest</td>
                            <td className="p-3 text-gray-500">A percentage of domain mailboxes are unhealthy. Monitor closely.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Domain Pause Recommended</td>
                            <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Critical</span></td>
                            <td className="p-3 text-gray-500">Suggest</td>
                            <td className="p-3 text-gray-500">Domain has critical health issues and should be paused. Immediate review required.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Domain Paused</td>
                            <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Critical</span></td>
                            <td className="p-3 text-gray-500">Enforce</td>
                            <td className="p-3 text-gray-500">Domain has been automatically paused. All mailboxes on the domain are cascade-paused.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Campaign Pause Recommended</td>
                            <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Critical</span></td>
                            <td className="p-3 text-gray-500">Suggest</td>
                            <td className="p-3 text-gray-500">Campaign should be paused due to cross-entity health correlation. Review recommended.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Recovery Alerts */}
            <h3 className="text-xl font-bold mb-3 text-gray-900">Recovery &amp; Healing</h3>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3 font-bold text-gray-700">Alert</th>
                            <th className="text-left p-3 font-bold text-gray-700">Severity</th>
                            <th className="text-left p-3 font-bold text-gray-700">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="p-3 font-medium">Mailbox Recovered</td>
                            <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Info</span></td>
                            <td className="p-3 text-gray-500">Mailbox has completed the 5-phase recovery pipeline and is back in production.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Domain Recovered</td>
                            <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Info</span></td>
                            <td className="p-3 text-gray-500">Domain has completed recovery and all mailboxes are operational.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Load Balancing Alerts */}
            <h3 className="text-xl font-bold mb-3 text-gray-900">Load Balancing</h3>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3 font-bold text-gray-700">Alert</th>
                            <th className="text-left p-3 font-bold text-gray-700">Severity</th>
                            <th className="text-left p-3 font-bold text-gray-700">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="p-3 font-medium">Load Balancing Report</td>
                            <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Warning</span></td>
                            <td className="p-3 text-gray-500">Summary of overloaded or underutilized mailboxes with suggested rebalancing actions.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Mailbox Added to Campaign</td>
                            <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Info</span></td>
                            <td className="p-3 text-gray-500">A healthy mailbox was added to a campaign to balance sending load.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Mailbox Removed from Campaign</td>
                            <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Warning</span></td>
                            <td className="p-3 text-gray-500">An overloaded or unhealthy mailbox was removed from a campaign.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Predictive Monitoring Alerts */}
            <h3 className="text-xl font-bold mb-3 text-gray-900">Predictive Monitoring</h3>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left p-3 font-bold text-gray-700">Alert</th>
                            <th className="text-left p-3 font-bold text-gray-700">Severity</th>
                            <th className="text-left p-3 font-bold text-gray-700">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="p-3 font-medium">Campaign At Risk</td>
                            <td className="p-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Critical</span></td>
                            <td className="p-3 text-gray-500">Predictive model detects a campaign is at risk of stalling. Includes risk score, estimated time to stall, and recommended actions.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Unhealthy Mailboxes Removed</td>
                            <td className="p-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Warning</span></td>
                            <td className="p-3 text-gray-500">Predictive action automatically removed unhealthy mailboxes from a campaign to prevent stalling.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-medium">Healthy Mailboxes Added</td>
                            <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Info</span></td>
                            <td className="p-3 text-gray-500">Predictive action added healthy standby mailboxes to a campaign to maintain sending capacity.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Alert Features */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Alert Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Deduplication</h3>
                    <p className="text-sm text-gray-600">
                        Alerts are deduplicated within 15-minute windows. If the same event fires multiple times (e.g., repeated bounce processing), you&apos;ll only receive one Slack message per window.
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Color-Coded Severity</h3>
                    <p className="text-sm text-gray-600">
                        Messages use Slack Block Kit with color-coded sidebars: <span className="text-green-600 font-bold">green</span> for info, <span className="text-amber-600 font-bold">yellow</span> for warnings, and <span className="text-red-600 font-bold">red</span> for critical alerts.
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Non-Blocking</h3>
                    <p className="text-sm text-gray-600">
                        Alert delivery never blocks core operations. If Slack is unreachable or rate-limited, the system retries with exponential backoff (up to 3 attempts) and continues processing.
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-Freeze on Errors</h3>
                    <p className="text-sm text-gray-600">
                        If the bot token is revoked, the channel is deleted, or permissions are removed, the integration status automatically updates and alerts pause until you reconfigure.
                    </p>
                </div>
            </div>

            {/* Slash Commands */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Slash Commands</h2>
            <p className="text-gray-600 mb-4">
                The Superkabe bot listens for interactive commands in any channel it is invited to:
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
                <ul className="space-y-6">
                    <li className="flex flex-col gap-2">
                        <code className="text-black bg-white px-3 py-2 rounded-lg w-fit border border-purple-200 font-bold shadow-sm whitespace-nowrap">
                            /superkabe status &lt;domain&gt;
                        </code>
                        <div className="text-purple-900 text-sm">
                            <p className="mb-2">Returns the health status, bounce rate, and active mailbox count for a specific domain.</p>
                            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded-md">
                                <strong>Example:</strong> <code>/superkabe status superkabe.ai</code><br />
                                <strong>Response:</strong> &quot;superkabe.ai is HEALTHY. 4/4 mailboxes operational. 2.1% bounce rate over last 100 sends.&quot;
                            </p>
                        </div>
                    </li>
                    <li className="flex flex-col gap-2 mt-4">
                        <code className="text-black bg-white px-3 py-2 rounded-lg w-fit border border-purple-200 font-bold shadow-sm whitespace-nowrap">
                            /superkabe mailbox &lt;email&gt;
                        </code>
                        <div className="text-purple-900 text-sm">
                            <p className="mb-2">Fetches the current status, health score, and recovery phase of a specific mailbox.</p>
                            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded-md">
                                <strong>Example:</strong> <code>/superkabe mailbox john@superkabe.ai</code><br />
                                <strong>Response:</strong> &quot;john@superkabe.ai — Status: HEALTHY, Score: 85, Phase: active, Sends: 142, Bounces: 2&quot;
                            </p>
                        </div>
                    </li>
                    <li className="flex flex-col gap-2 mt-4">
                        <code className="text-black bg-white px-3 py-2 rounded-lg w-fit border border-purple-200 font-bold shadow-sm whitespace-nowrap">
                            /superkabe org
                        </code>
                        <div className="text-purple-900 text-sm">
                            <p className="mb-2">Returns an executive summary of your organization&apos;s infrastructure — total mailboxes, domains, active campaigns, and any critical risks.</p>
                            <p className="text-xs text-purple-700 bg-purple-100 p-2 rounded-md">
                                <strong>Example:</strong> <code>/superkabe org</code><br />
                                <strong>Response:</strong> &quot;12 mailboxes across 3 domains. 5 active campaigns. 1 mailbox in recovery. System mode: Suggest.&quot;
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Token Security */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Security</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ul className="space-y-3 text-gray-700 text-sm">
                    <li><strong>Encrypted at rest:</strong> Your Slack bot token is encrypted using AES-256-GCM before being stored. It is never logged or exposed in API responses.</li>
                    <li><strong>OAuth 2.0:</strong> Connection uses Slack&apos;s official OAuth 2.0 flow. No passwords or tokens are manually entered.</li>
                    <li><strong>Webhook verification:</strong> All incoming Slack events and commands are verified using Slack&apos;s signing secret to prevent spoofing.</li>
                    <li><strong>Isolated decryption:</strong> Token decryption runs in an isolated scope, separate from web request threads, to prevent accidental token leakage.</li>
                </ul>
            </div>

            {/* Disconnect */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Disconnecting</h2>
            <p className="text-gray-600 mb-4">
                To disconnect the Slack integration:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-700 text-sm">
                    <li><strong>1.</strong> Navigate to <strong>Dashboard &rarr; Settings</strong>.</li>
                    <li><strong>2.</strong> In the Slack Integration card, click <strong>Disconnect</strong>.</li>
                    <li><strong>3.</strong> Confirm the action. The bot token will be revoked and the integration record removed.</li>
                    <li><strong>4.</strong> You can reconnect at any time by clicking <strong>Add to Slack</strong> again.</li>
                </ol>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Next Steps</h2>
                <p className="text-gray-600 mb-4">
                    Your team is now synced with Superkabe&apos;s real-time analysis engine. Check out:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li><a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800">How monitoring &amp; enforcement works</a></li>
                    <li><a href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800">Smartlead Integration</a></li>
                    <li><a href="/docs/emailbison-integration" className="text-blue-600 hover:text-blue-800">EmailBison Integration</a></li>
                </ul>
            </div>
        </div>
    );
}

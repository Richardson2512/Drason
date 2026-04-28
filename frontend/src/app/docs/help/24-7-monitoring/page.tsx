import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: '24/7 Infrastructure Monitoring | Superkabe Help',
 description: 'How Superkabe continuously monitors your email infrastructure and automatically protects your sender reputation.',
 alternates: { canonical: '/docs/help/24-7-monitoring' },
 openGraph: {
 title: '24/7 Infrastructure Monitoring | Superkabe Help',
 description: 'How Superkabe continuously monitors your email infrastructure and automatically protects your sender reputation.',
 url: '/docs/help/24-7-monitoring',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function MonitoringPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 24/7 Infrastructure Monitoring
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 How Superkabe continuously monitors your email infrastructure and automatically protects your sender reputation
 </p>

 {/* What Is 24/7 Monitoring */}
 <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 p-8 mb-12">
 <h2 className="text-2xl font-bold mb-4 text-gray-900">What Is 24/7 Monitoring?</h2>
 <p className="text-gray-700 mb-4 text-lg">
 Superkabe runs an <strong>automated background worker</strong> that syncs your platform data every 20 minutes around the clock.
 This continuous monitoring enables real-time detection of infrastructure health issues and immediate protection through auto-pause.
 </p>
 <div className="bg-white p-6 border-2 border-green-100 mt-4">
 <p className="text-gray-800 mb-2 font-bold">Key Features:</p>
 <ul className="text-gray-700 space-y-2 mb-0">
 <li>✅ <strong>Automatic syncing every 20 minutes</strong> - No manual refresh needed</li>
 <li>✅ <strong>Real-time health detection</strong> - Issues caught within minutes, not hours</li>
 <li>✅ <strong>Instant auto-pause</strong> - Campaigns/mailboxes stopped immediately when thresholds crossed</li>
 <li>✅ <strong>Auto-healing kickoff</strong> - Recovery process starts automatically</li>
 <li>✅ <strong>Zero downtime</strong> - Runs 24/7/365, even while you sleep</li>
 </ul>
 </div>
 </div>

 {/* How It Works */}
 <h2 className="text-3xl font-bold mb-8 text-gray-900 mt-12">How It Works</h2>

 <div className="space-y-6 mb-12">
 {/* Step 1 */}
 <div className="bg-white border-l-4 border-blue-500 p-6 shadow-lg">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
 1
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Data Sync (Every 20 Minutes)</h3>
 <p className="text-gray-600 mb-3">
 The Platform Sync Worker runs automatically in the background, fetching the latest data from your connected sending platforms:
 </p>
 <div className="bg-blue-50 p-4 border border-blue-100">
 <ul className="text-sm text-gray-700 space-y-1 mb-0">
 <li>• <strong>Campaigns</strong> - Status, settings, and performance metrics</li>
 <li>• <strong>Mailboxes</strong> - Send volumes, bounce rates, and activity</li>
 <li>• <strong>Leads</strong> - Engagement data and delivery status</li>
 <li>• <strong>Domains</strong> - DNS health and reputation signals</li>
 </ul>
 </div>
 <p className="text-sm text-gray-500 mt-3"><strong>Frequency:</strong> Every 20 minutes (1,200 seconds)</p>
 </div>
 </div>
 </div>

 {/* Step 2 */}
 <div className="bg-white border-l-4 border-purple-500 p-6 shadow-lg">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">
 2
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Infrastructure Assessment (After Each Sync)</h3>
 <p className="text-gray-600 mb-3">
 After syncing data, the system automatically triggers a comprehensive infrastructure health assessment:
 </p>
 <div className="bg-purple-50 p-4 border border-purple-100">
 <ul className="text-sm text-gray-700 space-y-2 mb-0">
 <li>• <strong>DNS Health Checks</strong> - SPF, DKIM, DMARC validation</li>
 <li>• <strong>Blacklist Monitoring</strong> - Scans 20+ blacklist databases</li>
 <li>• <strong>Bounce Rate Analysis</strong> - Rolling 24h/7d/30d windows</li>
 <li>• <strong>Volume Pattern Detection</strong> - Unusual spikes or drops</li>
 <li>• <strong>Domain Reputation Scoring</strong> - Health degradation tracking</li>
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* Step 3 */}
 <div className="bg-white border-l-4 border-red-500 p-6 shadow-lg">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700">
 3
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Threshold Detection & Auto-Pause</h3>
 <p className="text-gray-600 mb-3">
 When health metrics cross critical thresholds, the system <strong>immediately pauses</strong> affected entities:
 </p>
 <div className="bg-red-50 p-4 border border-red-100">
 <p className="text-sm text-gray-700 mb-2"><strong>Automatic pause triggers:</strong></p>
 <ul className="text-sm text-gray-600 space-y-1 mb-0">
 <li>🔴 Bounce rate ≥3% (after 60 sends) - Industry-aligned protection</li>
 <li>🔴 Domain appears on major blacklist</li>
 <li>🔴 SPF/DKIM authentication failures</li>
 <li>🔴 Mailbox complaint rate &gt;0.1%</li>
 <li>🔴 Sudden volume spike (2x normal)</li>
 </ul>
 <p className="text-xs text-gray-500 mt-2 italic">
 ⚠️ Early warning at 2% bounce rate | Minimum 60 sends required for auto-pause
 </p>
 </div>
 <p className="text-sm font-semibold text-red-700 mt-3">
 ⚡ Pausing happens INSTANTLY - outreach stops within seconds to protect your reputation
 </p>
 </div>
 </div>
 </div>

 {/* Step 4 */}
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-lg">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
 4
 </div>
 <div className="flex-1">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Healing Activation</h3>
 <p className="text-gray-600 mb-3">
 Once paused, the auto-healing pipeline automatically starts working to recover your infrastructure:
 </p>
 <div className="bg-green-50 p-4 border border-green-100">
 <ul className="text-sm text-gray-700 space-y-1 mb-0">
 <li>✓ Cooldown period begins (4-48 hours)</li>
 <li>✓ DNS re-validation runs automatically</li>
 <li>✓ Graduated recovery phases start</li>
 <li>✓ Volume restrictions applied safely</li>
 <li>✓ Health monitoring continues</li>
 </ul>
 </div>
 <p className="text-sm text-gray-500 mt-3">
 <a href="/docs/help/auto-healing" className="text-green-600 hover:text-green-700 font-medium underline">
 → Learn more about the Auto-Healing Pipeline
 </a>
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Visual Timeline */}
 <div className="bg-gray-900 p-8 mb-12 text-white">
 <h2 className="text-2xl font-bold mb-6">Monitoring Cycle Timeline</h2>
 <div className="space-y-3 font-mono text-sm">
 <div className="flex items-center gap-3">
 <span className="text-green-400 font-bold">00:00</span>
 <span className="text-gray-400">→</span>
 <span>Sync Worker starts, fetches platform data</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-green-400 font-bold">00:02</span>
 <span className="text-gray-400">→</span>
 <span>Data updated in local database</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-green-400 font-bold">00:03</span>
 <span className="text-gray-400">→</span>
 <span>Infrastructure assessment triggered</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-green-400 font-bold">00:04</span>
 <span className="text-gray-400">→</span>
 <span>Health checks run (DNS, blacklists, bounce rates)</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-red-400 font-bold">00:05</span>
 <span className="text-gray-400">→</span>
 <span className="text-red-300">⚠️ Threshold violation detected → Auto-pause triggered</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-yellow-400 font-bold">00:06</span>
 <span className="text-gray-400">→</span>
 <span className="text-yellow-300">Notifications sent to your team</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-blue-400 font-bold">00:07</span>
 <span className="text-gray-400">→</span>
 <span className="text-blue-300">Auto-healing pipeline initiated</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-gray-400 font-bold">...</span>
 <span className="text-gray-400"></span>
 <span className="text-gray-400">(Wait 20 minutes)</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-green-400 font-bold">20:00</span>
 <span className="text-gray-400">→</span>
 <span className="text-green-300">🔄 Next sync cycle begins</span>
 </div>
 </div>
 <p className="text-gray-400 text-xs mt-6">
 * Times are approximate. Actual duration depends on API response times and data volume.
 </p>
 </div>

 {/* Why Every 20 Minutes */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Why Every 20 Minutes?</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
 <div className="bg-white border-2 border-blue-200 p-6">
 <h3 className="font-bold text-blue-900 mb-3 text-lg">⚡ Fast Enough</h3>
 <p className="text-gray-700 text-sm mb-3">
 20 minutes strikes the perfect balance between responsiveness and API efficiency.
 </p>
 <ul className="text-sm text-gray-600 space-y-2 mb-0">
 <li>• Catches issues before they escalate</li>
 <li>• Prevents bulk damage (max ~100-200 emails at risk)</li>
 <li>• Real-time enough for proactive protection</li>
 </ul>
 </div>
 <div className="bg-white border-2 border-green-200 p-6">
 <h3 className="font-bold text-green-900 mb-3 text-lg">🌿 Respectful</h3>
 <p className="text-gray-700 text-sm mb-3">
 We respect each platform's API rate limits and server resources.
 </p>
 <ul className="text-sm text-gray-600 space-y-2 mb-0">
 <li>• 72 syncs per day (well within limits)</li>
 <li>• Sequential org processing with delays</li>
 <li>• No API throttling or rate limit errors</li>
 </ul>
 </div>
 </div>

 {/* What Gets Synced */}
 <div className="bg-white border-2 border-gray-200 p-8 mb-12 shadow-sm">
 <h2 className="text-2xl font-bold mb-6 text-gray-900">What Data Gets Synced?</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
 <span className="text-2xl">📧</span>
 Mailboxes
 </h3>
 <ul className="text-sm text-gray-600 space-y-1 mb-0">
 <li>• Email address and provider</li>
 <li>• Bounce/reply/open counts</li>
 <li>• Daily send volumes</li>
 <li>• Warmup status and phase</li>
 <li>• Associated campaigns</li>
 </ul>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
 <span className="text-2xl">🎯</span>
 Campaigns
 </h3>
 <ul className="text-sm text-gray-600 space-y-1 mb-0">
 <li>• Campaign name and status</li>
 <li>• Lead counts and sequences</li>
 <li>• Assigned mailboxes</li>
 <li>• Send schedules</li>
 <li>• Performance metrics</li>
 </ul>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
 <span className="text-2xl">👥</span>
 Leads
 </h3>
 <ul className="text-sm text-gray-600 space-y-1 mb-0">
 <li>• Email addresses</li>
 <li>• Delivery status (sent/bounced)</li>
 <li>• Engagement (opens/replies)</li>
 <li>• Campaign assignments</li>
 <li>• Lead health classification</li>
 </ul>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
 <span className="text-2xl">🌐</span>
 Domains
 </h3>
 <ul className="text-sm text-gray-600 space-y-1 mb-0">
 <li>• Domain names</li>
 <li>• DNS records (SPF, DKIM, DMARC)</li>
 <li>• Blacklist status</li>
 <li>• Associated mailboxes</li>
 <li>• Health scores</li>
 </ul>
 </div>
 </div>
 </div>

 {/* Manual Sync */}
 <div className="bg-blue-50 border-2 border-blue-200 p-6 mb-12">
 <h2 className="text-2xl font-bold mb-4 text-blue-900">Can I Manually Trigger a Sync?</h2>
 <p className="text-blue-800 mb-4">
 <strong>Yes!</strong> While the automated worker runs every 20 minutes, you can force an immediate sync anytime:
 </p>
 <div className="bg-white p-4 border border-blue-200">
 <p className="text-sm text-gray-700 mb-2 font-semibold">How to manually sync:</p>
 <ol className="text-sm text-gray-600 space-y-1 mb-0 list-decimal list-inside">
 <li>Go to <strong>Settings → Integrations</strong></li>
 <li>Find your platform connection</li>
 <li>Click the <strong>"Sync Now"</strong> button</li>
 <li>Wait for the sync to complete (~30-60 seconds)</li>
 </ol>
 </div>
 <p className="text-blue-700 text-sm mt-4">
 💡 <strong>Tip:</strong> Manual syncs are useful right after making changes in your sending platform (adding mailboxes, updating campaigns, etc.)
 </p>
 </div>

 {/* Worker Health */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Worker Health & Reliability</h2>
 <div className="bg-white border-2 border-gray-200 p-8 mb-12">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="text-center">
 <div className="text-4xl mb-3">🔄</div>
 <h3 className="font-bold text-gray-900 mb-2">Self-Healing</h3>
 <p className="text-sm text-gray-600">
 If a sync fails, the worker logs the error and continues with the next cycle. No manual intervention needed.
 </p>
 </div>
 <div className="text-center">
 <div className="text-4xl mb-3">📊</div>
 <h3 className="font-bold text-gray-900 mb-2">Health Tracking</h3>
 <p className="text-sm text-gray-600">
 Worker status is tracked with metrics: total syncs, success rate, duration, consecutive failures.
 </p>
 </div>
 <div className="text-center">
 <div className="text-4xl mb-3">🚨</div>
 <h3 className="font-bold text-gray-900 mb-2">Critical Alerts</h3>
 <p className="text-sm text-gray-600">
 After 3+ consecutive complete failures, the system logs a CRITICAL alert for investigation.
 </p>
 </div>
 </div>
 </div>

 {/* Benefits Summary */}
 <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 p-8 mb-12">
 <h2 className="text-2xl font-bold mb-6 text-gray-900">Key Benefits of 24/7 Monitoring</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex items-start gap-3 bg-white p-4 border border-green-200">
 <span className="text-2xl flex-shrink-0">🛡️</span>
 <div>
 <h3 className="font-bold text-gray-900 mb-1 text-sm">Proactive Protection</h3>
 <p className="text-xs text-gray-600 mb-0">Issues detected and stopped before they damage your reputation</p>
 </div>
 </div>
 <div className="flex items-start gap-3 bg-white p-4 border border-green-200">
 <span className="text-2xl flex-shrink-0">😴</span>
 <div>
 <h3 className="font-bold text-gray-900 mb-1 text-sm">Sleep Soundly</h3>
 <p className="text-xs text-gray-600 mb-0">Works while you sleep - no need to check dashboards constantly</p>
 </div>
 </div>
 <div className="flex items-start gap-3 bg-white p-4 border border-green-200">
 <span className="text-2xl flex-shrink-0">⚡</span>
 <div>
 <h3 className="font-bold text-gray-900 mb-1 text-sm">Instant Response</h3>
 <p className="text-xs text-gray-600 mb-0">Auto-pause happens within seconds of threshold violation</p>
 </div>
 </div>
 <div className="flex items-start gap-3 bg-white p-4 border border-green-200">
 <span className="text-2xl flex-shrink-0">🤖</span>
 <div>
 <h3 className="font-bold text-gray-900 mb-1 text-sm">Zero Manual Work</h3>
 <p className="text-xs text-gray-600 mb-0">Fully automated from sync to pause to healing</p>
 </div>
 </div>
 <div className="flex items-start gap-3 bg-white p-4 border border-green-200">
 <span className="text-2xl flex-shrink-0">📈</span>
 <div>
 <h3 className="font-bold text-gray-900 mb-1 text-sm">Reputation Protection</h3>
 <p className="text-xs text-gray-600 mb-0">Prevents permanent blacklisting and domain burning</p>
 </div>
 </div>
 <div className="flex items-start gap-3 bg-white p-4 border border-green-200">
 <span className="text-2xl flex-shrink-0">🔄</span>
 <div>
 <h3 className="font-bold text-gray-900 mb-1 text-sm">Seamless Recovery</h3>
 <p className="text-xs text-gray-600 mb-0">Auto-healing starts immediately after pause</p>
 </div>
 </div>
 </div>
 </div>

 {/* FAQs */}
 <div className="bg-gray-50 border border-gray-200 p-8 mb-12">
 <h2 className="text-2xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
 <div className="space-y-6">
 <div>
 <h3 className="font-bold text-gray-900 mb-2 text-base">Q: Does the worker run even if I'm not logged in?</h3>
 <p className="text-sm text-gray-600 mb-0">
 <strong>Yes!</strong> The worker runs on the server 24/7 regardless of whether anyone is logged in.
 It's a background service that operates independently.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2 text-base">Q: Will I get notified when something is paused?</h3>
 <p className="text-sm text-gray-600 mb-0">
 Yes, you'll receive immediate notifications via the in-app notifications panel.
 You can also configure webhook alerts in Settings to get notified via Slack, email, or other channels.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2 text-base">Q: Can I change the sync frequency?</h3>
 <p className="text-sm text-gray-600 mb-0">
 Currently, the 20-minute interval is fixed to balance responsiveness with API efficiency.
 Enterprise customers can request custom intervals by contacting support.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2 text-base">Q: What if my API key expires?</h3>
 <p className="text-sm text-gray-600 mb-0">
 The worker will log sync failures and you'll be notified. Update your API key in Settings → Integrations to resume syncing.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2 text-base">Q: Does this cost extra API calls?</h3>
 <p className="text-sm text-gray-600 mb-0">
 The worker uses each platform's standard API endpoints. Most plans have generous API limits
 (thousands of calls per day), and our 72 daily syncs are well within normal usage.
 </p>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2 text-base">Q: Can I pause the automatic monitoring?</h3>
 <p className="text-sm text-gray-600 mb-0">
 The 24/7 monitoring is a core feature and runs by default. However, you can pause specific campaigns
 or mailboxes manually if needed. Monitoring continues in the background for health tracking.
 </p>
 </div>
 </div>
 </div>

 {/* Related Articles */}
 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
 <div className="space-y-2">
 <a href="/docs/help/auto-healing" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 → How Auto-Healing Works
 </a>
 <a href="/docs/help/campaign-paused" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 → Why Is My Campaign Paused?
 </a>
 <a href="/docs/getting-started" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 → Getting Started Guide
 </a>
 <a href="/docs/monitoring" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 → Monitoring Thresholds
 </a>
 </div>
 </div>
 </div>
 );
}

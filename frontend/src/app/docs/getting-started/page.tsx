export default function GettingStartedPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Getting Started
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Set up Drason to protect your outbound infrastructure in minutes
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What is Drason?</h2>
            <p className="text-gray-600 leading-relaxed">
                Drason is a monitoring and protection layer for outbound email infrastructure. We don't send emails—
                we monitor your Smartlead campaigns and prevent infrastructure damage before it becomes irreversible.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How It Works</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg shadow-gray-100">
                <ol className="space-y-4 text-gray-600 list-decimal list-inside">
                    <li><strong className="text-gray-900">Clay Integration:</strong> We fetch your enriched leads from Clay webhooks</li>
                    <li><strong className="text-gray-900">Campaign Routing:</strong> Leads are routed to appropriate Smartlead campaigns based on ICP</li>
                    <li><strong className="text-gray-900">Monitoring:</strong> We track bounce rates, failures, and domain health in real-time</li>
                    <li><strong className="text-gray-900">Protection:</strong> Mailboxes are paused automatically when thresholds are exceeded</li>
                    <li><strong className="text-gray-900">Recovery:</strong> Sliding window logic allows gradual healing after pause</li>
                </ol>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Quick Start</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Create an Account</h3>
            <p className="text-gray-600">
                Sign up at <code className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-800">drason.com/signup</code> and choose your pricing tier.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Connect Smartlead</h3>
            <p className="text-gray-600 mb-4">
                Navigate to <strong className="text-gray-900">Configuration</strong> and add your Smartlead API key:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <code className="text-blue-600">Settings → Integrations → Smartlead API Key</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Set Up Clay Webhook</h3>
            <p className="text-gray-600 mb-4">
                In Clay, configure your webhook to send enriched leads to Drason:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <code className="text-green-600">https://api.drason.com/webhooks/clay</code>
            </div>
            <p className="text-gray-600">
                Include fields: email, firstName, lastName, company, campaignId
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Choose System Mode</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 mb-4">
                    Drason operates in 3 modes:
                </p>
                <ul className="space-y-3">
                    <li>
                        <strong className="text-blue-600">OBSERVE:</strong>
                        <span className="text-gray-600 ml-2">Logs events without blocking (testing)</span>
                    </li>
                    <li>
                        <strong className="text-green-600">SUGGEST:</strong>
                        <span className="text-gray-600 ml-2">Provides recommendations without automated action</span>
                    </li>
                    <li>
                        <strong className="text-purple-600">ENFORCE:</strong>
                        <span className="text-gray-600 ml-2">Fully automated protection (production)</span>
                    </li>
                </ul>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">5. Monitor Your Dashboard</h3>
            <p className="text-gray-600">
                View real-time stats on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Active leads by state (held, active, paused)</li>
                <li>Mailbox health and bounce rates</li>
                <li>Domain-level aggregations</li>
                <li>Execution gate blocking reasons</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Happens Next?</h2>
            <p className="text-gray-600 mb-4">
                Once integrated, Drason will:
            </p>
            <ol className="space-y-3 text-gray-600 list-decimal list-inside mb-8">
                <li>Receive leads from Clay webhooks</li>
                <li>Route them to appropriate Smartlead campaigns</li>
                <li>Monitor bounce events and failures</li>
                <li>Pause mailboxes at 5 bounces within 100 sends</li>
                <li>Warn you at 3 bounces within 60 sends (early detection)</li>
                <li>Pause domains when 50% of mailboxes become unhealthy</li>
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-amber-700 mb-2">💡 Pro Tip</h3>
                <p className="text-gray-700">
                    Start in <strong className="text-gray-900">OBSERVE</strong> mode for your first week to understand baseline metrics
                    before enabling <strong className="text-gray-900">ENFORCE</strong> mode for production protection.
                </p>
            </div>

            <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Read Platform Rules to understand thresholds
                        </a>
                    </li>
                    <li>
                        <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Learn about the Monitoring System
                        </a>
                    </li>
                    <li>
                        <a href="/docs/configuration" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Configure thresholds for your team
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configuration | Superkabe Docs',
    description: 'Set up integrations and tune thresholds for your organization. Configure Smartlead API keys, Clay webhooks, and monitoring rules.',
    alternates: { canonical: '/docs/configuration' },
    openGraph: {
        title: 'Configuration | Superkabe Docs',
        description: 'Set up integrations and tune thresholds for your organization. Configure Smartlead API keys, Clay webhooks, and monitoring rules.',
        url: '/docs/configuration',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function ConfigurationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Configuration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Set up integrations and tune thresholds for your organization's infrastructure needs
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Integration Setup</h2>
            <p className="text-gray-600 mb-6">
                Superkabe integrates with Clay and Smartlead to monitor your outbound infrastructure.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Smartlead API Key</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-gray-600 mb-4">
                    <strong>Location:</strong> Settings → Integrations → Smartlead
                </p>
                <p className="text-gray-600 mb-4">
                    <strong>Required:</strong> Yes (for campaign routing and bounce monitoring)
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-2">API Key Format:</p>
                    <code className="text-blue-600">sl_live_xxxxxxxxxxxxxxxxxxxx</code>
                </div>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Clay Webhook</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-gray-600 mb-4">
                    <strong>Webhook URL:</strong>
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <code className="text-green-600">https://api.superkabe.com/webhooks/clay</code>
                </div>
                <p className="text-gray-600 mb-4">
                    <strong>Required Fields:</strong>
                </p>
                <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">email</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">firstName</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">lastName</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">company</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">campaignId</code> — Smartlead campaign ID to route to</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Threshold Configuration</h2>
            <p className="text-gray-600 mb-6">
                All monitoring thresholds are configurable at the organization level. Default values are production-hardened.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Mailbox-Level Thresholds</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Threshold</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Default Value</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-amber-600 font-mono text-sm">MAILBOX_WARNING_BOUNCES</td>
                            <td className="px-6 py-4 text-gray-600">3</td>
                            <td className="px-6 py-4 text-gray-600">Bounces to trigger warning</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-amber-600 font-mono text-sm">MAILBOX_WARNING_WINDOW</td>
                            <td className="px-6 py-4 text-gray-600">60</td>
                            <td className="px-6 py-4 text-gray-600">Sends within warning window</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-mono text-sm">MAILBOX_PAUSE_BOUNCES</td>
                            <td className="px-6 py-4 text-gray-600">5</td>
                            <td className="px-6 py-4 text-gray-600">Bounces to trigger pause</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-mono text-sm">MAILBOX_PAUSE_WINDOW</td>
                            <td className="px-6 py-4 text-gray-600">100</td>
                            <td className="px-6 py-4 text-gray-600">Sends within pause window</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">ROLLING_WINDOW_SIZE</td>
                            <td className="px-6 py-4 text-gray-600">100</td>
                            <td className="px-6 py-4 text-gray-600">Window before sliding</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Domain-Level Thresholds</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Threshold</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Default Value</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-amber-600 font-mono text-sm">DOMAIN_WARNING_RATIO</td>
                            <td className="px-6 py-4 text-gray-600">0.3</td>
                            <td className="px-6 py-4 text-gray-600">30% unhealthy → warning</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-mono text-sm">DOMAIN_PAUSE_RATIO</td>
                            <td className="px-6 py-4 text-gray-600">0.5</td>
                            <td className="px-6 py-4 text-gray-600">50% unhealthy → pause</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">DOMAIN_MINIMUM_MAILBOXES</td>
                            <td className="px-6 py-4 text-gray-600">3</td>
                            <td className="px-6 py-4 text-gray-600">Below this, use absolute logic</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Risk Score Thresholds</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Threshold</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Default Value</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-mono text-sm">HARD_RISK_CRITICAL</td>
                            <td className="px-6 py-4 text-gray-600">60</td>
                            <td className="px-6 py-4 text-gray-600">Hard score → blocks execution</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-amber-600 font-mono text-sm">HARD_RISK_WARNING</td>
                            <td className="px-6 py-4 text-gray-600">40</td>
                            <td className="px-6 py-4 text-gray-600">Hard score → warning state</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">SOFT_RISK_HIGH</td>
                            <td className="px-6 py-4 text-gray-600">75</td>
                            <td className="px-6 py-4 text-gray-600">Soft score → logs only</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">SOFT_RISK_WARNING</td>
                            <td className="px-6 py-4 text-gray-600">50</td>
                            <td className="px-6 py-4 text-gray-600">Soft score → monitoring</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Cooldown Configuration</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Threshold</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Default Value</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">COOLDOWN_MINIMUM_MS</td>
                            <td className="px-6 py-4 text-gray-600">3600000</td>
                            <td className="px-6 py-4 text-gray-600">1 hour minimum</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">COOLDOWN_MULTIPLIER</td>
                            <td className="px-6 py-4 text-gray-600">2</td>
                            <td className="px-6 py-4 text-gray-600">Exponential backoff</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-blue-600 font-mono text-sm">COOLDOWN_MAX_MS</td>
                            <td className="px-6 py-4 text-gray-600">57600000</td>
                            <td className="px-6 py-4 text-gray-600">16 hours maximum</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8 mb-8">
                <h3 className="text-xl font-bold text-amber-700 mb-2">⚠️ Tuning Warning</h3>
                <p className="text-gray-600 mb-4">
                    These thresholds are production-hardened based on industry best practices:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• <strong>5% bounce rate</strong> is the maximum before reputation damage</li>
                    <li>• Lowering thresholds increases false positives</li>
                    <li>• Raising thresholds risks permanent domain burnout</li>
                    <li>• Test changes in <strong>OBSERVE</strong> mode first</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">System Mode</h2>
            <p className="text-gray-600 mb-6">
                Configure the enforcement behavior for your organization:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-700 mb-3">OBSERVE</h3>
                    <p className="text-gray-600 mb-4 text-sm">No automated actions. All events logged.</p>
                    <p className="text-gray-500 text-xs">Use for: Testing and learning baseline metrics</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-700 mb-3">SUGGEST</h3>
                    <p className="text-gray-600 mb-4 text-sm">Provides recommendations without enforcement.</p>
                    <p className="text-gray-500 text-xs">Use for: Reviewing automation suggestions</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-purple-700 mb-3">ENFORCE</h3>
                    <p className="text-gray-600 mb-4 text-sm">Fully automated protection and pausing.</p>
                    <p className="text-gray-500 text-xs">Use for: Production-ready automated safety</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-blue-700 mb-2">🎯 Best Practice</h3>
                <p className="text-gray-600 mb-4">
                    Recommended configuration workflow:
                </p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1. Start in OBSERVE</strong> — Run for 1 week to establish baseline</li>
                    <li><strong>2. Review metrics</strong> — Confirm thresholds align with your infra</li>
                    <li><strong>3. Switch to SUGGEST</strong> — Review automated recommendations for 1 week</li>
                    <li><strong>4. Enable ENFORCE</strong> — Full production protection</li>
                </ol>
            </div>
        </div>
    );
}

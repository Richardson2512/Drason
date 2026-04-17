import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'What Do Status Colors Mean? | Superkabe Help',
    description: 'Understanding the green, yellow, red, and gray status colors across mailboxes, domains, campaigns, and leads in Superkabe.',
    alternates: { canonical: '/docs/help/status-colors' },
    openGraph: {
        title: 'What Do Status Colors Mean? | Superkabe Help',
        description: 'Understanding the green, yellow, red, and gray status colors across mailboxes, domains, campaigns, and leads in Superkabe.',
        url: '/docs/help/status-colors',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function StatusColorsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                What Do Status Colors Mean?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                A visual guide to the health indicators across your entire infrastructure
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800">
                    Superkabe uses a consistent color system across all entities: <strong className="text-emerald-700">Green = healthy and active</strong>, <strong className="text-amber-700">Yellow/Amber = warning, needs attention</strong>, <strong className="text-red-700">Red = paused or critical</strong>, <strong className="text-gray-600">Gray = inactive or unknown</strong>.
                </p>
            </div>

            <h2 id="mailbox-colors" className="text-3xl font-bold mb-6 text-gray-900">Mailbox Status Colors</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl overflow-hidden mb-12">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Color</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Status</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Meaning</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-emerald-700">Healthy</td>
                            <td className="px-6 py-4 text-gray-600">Mailbox is active, connected, and sending normally. Bounce rate is within safe limits.</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">None needed</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-amber-700">Warning</td>
                            <td className="px-6 py-4 text-gray-600">Bounce rate is elevated or approaching threshold. SMTP/IMAP connection may be intermittent.</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Monitor closely. Check DNS and connection status.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-red-700">Paused</td>
                            <td className="px-6 py-4 text-gray-600">Superkabe has auto-paused this mailbox due to high bounce rate, connection failure, or blacklisting. No emails are being sent.</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Review the healing pipeline. The auto-healing system will attempt recovery automatically.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-gray-600">Inactive</td>
                            <td className="px-6 py-4 text-gray-600">Mailbox exists in the sending platform but is not currently assigned to any active campaign.</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Assign to a campaign or remove if unused.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 id="domain-colors" className="text-3xl font-bold mb-6 text-gray-900">Domain Status Colors</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl overflow-hidden mb-12">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Color</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Status</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Meaning</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-emerald-700">Healthy</td>
                            <td className="px-6 py-4 text-gray-600">DNS records valid, not blacklisted, bounce rate under threshold.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-amber-700">Warning</td>
                            <td className="px-6 py-4 text-gray-600">DNS degradation detected, minor blacklist hit, or bounce rate trending up.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-red-700">Critical</td>
                            <td className="px-6 py-4 text-gray-600">Major blacklist (Spamhaus, Barracuda), SPF/DKIM/DMARC failing, or domain burned. All mailboxes on this domain are paused.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 id="lead-colors" className="text-3xl font-bold mb-6 text-gray-900">Lead Health Colors</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl overflow-hidden mb-12">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Color</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Classification</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">What Happens</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-emerald-700">GREEN</td>
                            <td className="px-6 py-4 text-gray-600">Lead passes all checks. Routed to campaign and pushed to sending platform.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-amber-700">YELLOW</td>
                            <td className="px-6 py-4 text-gray-600">Lead has minor risk factors (catch-all domain, low confidence score). Routed but flagged for monitoring.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /></td>
                            <td className="px-6 py-4 font-bold text-red-700">RED</td>
                            <td className="px-6 py-4 text-gray-600">Lead blocked by execution gate. Invalid email, disposable address, or health score too low. Never reaches the sending platform.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/entity-statuses" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Understanding Status Labels (Detailed)
                    </a>
                    <a href="/docs/help/infrastructure-score-explained" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How is the Infrastructure Score Calculated?
                    </a>
                    <a href="/docs/help/auto-healing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Does Auto-Healing Work?
                    </a>
                </div>
            </div>
        </div>
    );
}

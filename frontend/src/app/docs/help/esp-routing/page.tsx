import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Does ESP-Aware Routing Work? | Superkabe Help',
    description: 'Learn how Superkabe routes leads to the best-performing mailboxes based on recipient ESP using 30-day rolling performance data.',
    alternates: { canonical: '/docs/help/esp-routing' },
    openGraph: {
        title: 'How Does ESP-Aware Routing Work? | Superkabe Help',
        description: 'Learn how Superkabe routes leads to the best-performing mailboxes based on recipient ESP performance data.',
        url: '/docs/help/esp-routing',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function EspRoutingPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Does ESP-Aware Routing Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Superkabe scores mailboxes by their actual performance per recipient ESP and pins the best ones for each lead
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    When a lead is routed to a campaign, Superkabe classifies the recipient&apos;s email provider (Gmail, Microsoft, Yahoo) via MX lookup, then scores each mailbox in the campaign based on its <strong>30-day bounce rate to that specific ESP</strong>. The top 3 performing mailboxes are pinned for this lead via <code>assigned_email_accounts</code>. The sending platform only uses those mailboxes for this specific lead.
                </p>
                <p className="text-blue-700 text-sm">
                    This goes beyond simple ESP matching. A Gmail mailbox with a 2% bounce rate to Gmail recipients gets a low score &mdash; an Outlook mailbox with 0.1% bounce rate to Gmail gets a high score. Performance beats provider matching.
                </p>
            </div>

            <h2 id="how-it-works" className="text-3xl font-bold mb-6 text-gray-900">How ESP Classification Works</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-8">
                <p className="text-gray-600 mb-4">During email validation, Superkabe resolves the recipient domain&apos;s MX records and classifies the email provider:</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-gray-700 font-semibold">MX Pattern</th>
                                <th className="px-4 py-2 text-gray-700 font-semibold">ESP Bucket</th>
                                <th className="px-4 py-2 text-gray-700 font-semibold">Example domains</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr><td className="px-4 py-2 font-mono text-sm text-gray-600">*.google.com, *.gmail.com</td><td className="px-4 py-2 font-bold" style={{ color: '#EA4335' }}>Gmail</td><td className="px-4 py-2 text-gray-500">gmail.com, any Google Workspace domain</td></tr>
                            <tr><td className="px-4 py-2 font-mono text-sm text-gray-600">*.outlook.com, *.microsoft.com</td><td className="px-4 py-2 font-bold" style={{ color: '#0078D4' }}>Microsoft</td><td className="px-4 py-2 text-gray-500">outlook.com, hotmail.com, any M365 domain</td></tr>
                            <tr><td className="px-4 py-2 font-mono text-sm text-gray-600">*.yahoodns.net</td><td className="px-4 py-2 font-bold" style={{ color: '#6001D2' }}>Yahoo</td><td className="px-4 py-2 text-gray-500">yahoo.com, aol.com</td></tr>
                            <tr><td className="px-4 py-2 font-mono text-sm text-gray-600">Everything else</td><td className="px-4 py-2 font-bold text-gray-500">Other</td><td className="px-4 py-2 text-gray-500">Self-hosted, Proofpoint, Mimecast</td></tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-gray-500 text-sm mt-4">Classification is cached per domain in the DomainInsight table. One lookup per domain, reused for all leads at that domain.</p>
            </div>

            <h2 id="scoring" className="text-3xl font-bold mb-6 text-gray-900">How Mailbox Scoring Works</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">1. Data Collection</h3>
                    <p className="text-gray-600 text-sm">Every email sent, bounced, and replied generates a tracking event tagged with the sending mailbox and the recipient&apos;s ESP. These events accumulate over 30-day rolling windows.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">2. Performance Aggregation</h3>
                    <p className="text-gray-600 text-sm">Every 6 hours, the ESP performance worker aggregates events into a per-mailbox per-ESP matrix: send count, bounce count, reply count, and computed bounce rate for the last 30 days.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">3. Scoring at Route Time</h3>
                    <p className="text-gray-600 text-sm">When a lead is pushed to a campaign, Superkabe scores each campaign mailbox against the recipient&apos;s ESP. Lower bounce rate = higher score. A volume confidence bonus rewards mailboxes with more data. Top 3 mailboxes are selected.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">4. Mailbox Pinning</h3>
                    <p className="text-gray-600 text-sm">The selected mailbox IDs are passed to Smartlead via <code>assigned_email_accounts</code>. Smartlead will only use those 3 mailboxes for this specific lead. Its own ESP matching and load balancing run within this restricted pool.</p>
                </div>
            </div>

            <h2 id="warming-up" className="text-3xl font-bold mb-6 text-gray-900">What Does &ldquo;Warming Up&rdquo; Mean?</h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-lg">
                <p className="text-amber-800 mb-3">
                    ESP scoring requires at least <strong>30 sends per mailbox per ESP bucket</strong> before the score is considered reliable. Until that threshold is reached, the cell shows &ldquo;warming up&rdquo; in the ESP Performance Matrix and scoring is skipped &mdash; the sending platform picks the mailbox instead.
                </p>
                <p className="text-amber-700 text-sm">
                    At 10,000 sends/month with 20 mailboxes and 4 ESP buckets, you&apos;ll have reliable data within 3&ndash;4 weeks of normal sending.
                </p>
            </div>

            <h2 id="esp-matrix" className="text-3xl font-bold mb-6 text-gray-900">Reading the ESP Performance Matrix</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-12">
                <p className="text-gray-600 mb-4">The matrix on the Email Validation page shows each mailbox&apos;s bounce rate per ESP:</p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li><span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#D1FAE5' }} /> <strong className="text-emerald-700">&lt;1% bounce rate</strong> &mdash; healthy. This mailbox performs well for this ESP.</li>
                    <li><span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#FEF3C7' }} /> <strong className="text-amber-700">1&ndash;2% bounce rate</strong> &mdash; warning. Monitor closely, may degrade further.</li>
                    <li><span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ background: '#FEE2E2' }} /> <strong className="text-red-700">&gt;2% bounce rate</strong> &mdash; problematic. Superkabe avoids routing this ESP&apos;s leads to this mailbox.</li>
                    <li><span className="text-gray-400 text-xs mr-2">warming up</span> &mdash; fewer than 30 sends in this cell. Not enough data to score.</li>
                </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/csv-upload" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How to Upload CSV Leads</a>
                    <a href="/docs/help/email-validation" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Does Email Validation Work?</a>
                    <a href="/docs/help/validation-credits" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Do Validation Credits Work?</a>
                </div>
            </div>
        </div>
    );
}

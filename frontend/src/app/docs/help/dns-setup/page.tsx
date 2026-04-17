import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DNS Setup Guide (SPF, DKIM, DMARC) | Superkabe Help',
    description: 'Step-by-step guide to setting up SPF, DKIM, and DMARC records for your sending domains to pass email authentication checks.',
    alternates: { canonical: '/docs/help/dns-setup' },
    openGraph: {
        title: 'DNS Setup Guide (SPF, DKIM, DMARC) | Superkabe Help',
        description: 'Step-by-step guide to setting up SPF, DKIM, and DMARC records for your sending domains.',
        url: '/docs/help/dns-setup',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DnsSetupPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                DNS Setup Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                How to configure SPF, DKIM, and DMARC records for your sending domains
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Every sending domain needs three DNS records to pass authentication: <strong>SPF</strong> (authorizes which servers can send), <strong>DKIM</strong> (signs emails cryptographically), and <strong>DMARC</strong> (tells receivers what to do with unauthenticated mail). Superkabe checks all three during infrastructure assessment and flags any that are missing or misconfigured.
                </p>
                <p className="text-blue-700 text-sm">
                    Use our free tools: <a href="/tools/spf-lookup" className="underline font-semibold">SPF Lookup</a> | <a href="/tools/dkim-lookup" className="underline font-semibold">DKIM Lookup</a> | <a href="/tools/dmarc-lookup" className="underline font-semibold">DMARC Lookup</a>
                </p>
            </div>

            <h2 id="spf" className="text-3xl font-bold mb-6 text-gray-900">1. SPF (Sender Policy Framework)</h2>
            <p className="text-gray-600 mb-4">
                SPF tells receiving mail servers which IP addresses and services are authorized to send email from your domain.
            </p>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">How to Set Up</h3>
                <ol className="space-y-3 text-gray-600">
                    <li><strong>Go to your DNS provider</strong> (GoDaddy, Cloudflare, Namecheap, etc.)</li>
                    <li><strong>Add a TXT record</strong> for your root domain (e.g., <code>yourdomain.com</code>)</li>
                    <li><strong>Set the value</strong> to your SPF record. Example for Google Workspace + Smartlead:
                        <div className="bg-gray-50 rounded-lg p-3 mt-2 text-sm font-mono">
                            v=spf1 include:_spf.google.com include:spf.smartlead.ai ~all
                        </div>
                    </li>
                    <li><strong>Verify</strong> using the <a href="/tools/spf-lookup" className="text-blue-600 underline">SPF Lookup tool</a></li>
                </ol>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-lg">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Common Mistakes</h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                    <li><strong>Multiple SPF records</strong> &mdash; only one TXT record starting with <code>v=spf1</code> is allowed per domain. Merge includes into one record.</li>
                    <li><strong>Too many DNS lookups</strong> &mdash; SPF allows a maximum of 10 DNS lookups. Each <code>include:</code> counts as one. Use <code>ip4:</code> for static IPs to save lookups.</li>
                    <li><strong>Using -all instead of ~all</strong> &mdash; <code>-all</code> (hard fail) can cause legitimate emails to be rejected during warmup. Use <code>~all</code> (soft fail) until fully warmed.</li>
                </ul>
            </div>

            <h2 id="dkim" className="text-3xl font-bold mb-6 text-gray-900">2. DKIM (DomainKeys Identified Mail)</h2>
            <p className="text-gray-600 mb-4">
                DKIM adds a cryptographic signature to every outgoing email, proving it hasn&apos;t been modified in transit.
            </p>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">How to Set Up</h3>
                <ol className="space-y-3 text-gray-600">
                    <li><strong>Generate a DKIM key pair</strong> in your email platform (Google Workspace Admin &rarr; Gmail &rarr; Authenticate Email, or Smartlead &rarr; Domain Settings)</li>
                    <li><strong>Add a TXT record</strong> with the selector as a subdomain (e.g., <code>google._domainkey.yourdomain.com</code>)</li>
                    <li><strong>Set the value</strong> to the public key provided by your email platform</li>
                    <li><strong>Verify</strong> using the <a href="/tools/dkim-lookup" className="text-blue-600 underline">DKIM Lookup tool</a> with your selector</li>
                </ol>
            </div>

            <h2 id="dmarc" className="text-3xl font-bold mb-6 text-gray-900">3. DMARC (Domain-based Message Authentication)</h2>
            <p className="text-gray-600 mb-4">
                DMARC ties SPF and DKIM together and tells receiving servers what to do when authentication fails.
            </p>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">Recommended Setup for Cold Email</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm font-mono mb-4">
                    v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; pct=100
                </div>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li><strong>p=none</strong> &mdash; monitoring only (recommended for new domains). Move to <code>p=quarantine</code> after 30 days of clean reports.</li>
                    <li><strong>rua=</strong> &mdash; email address to receive aggregate reports. Use a dedicated address or a DMARC reporting service.</li>
                    <li><strong>pct=100</strong> &mdash; apply the policy to 100% of emails.</li>
                </ul>
            </div>

            <h2 id="superkabe-checks" className="text-3xl font-bold mb-6 text-gray-900">What Superkabe Checks</h2>
            <p className="text-gray-600 mb-4">
                During infrastructure assessment, Superkabe verifies all three records for every domain:
            </p>
            <div className="bg-white border border-[#D1CBC5] rounded-xl overflow-hidden mb-12">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Check</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Pass Criteria</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Impact if Missing</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">SPF</td>
                            <td className="px-6 py-4 text-gray-600">Valid <code>v=spf1</code> TXT record with &le;10 lookups</td>
                            <td className="px-6 py-4 text-red-600">Emails may land in spam or be rejected</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">DKIM</td>
                            <td className="px-6 py-4 text-gray-600">Valid public key at selector subdomain</td>
                            <td className="px-6 py-4 text-red-600">Emails can be spoofed, reputation damage</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">DMARC</td>
                            <td className="px-6 py-4 text-gray-600">Valid <code>v=DMARC1</code> TXT record at <code>_dmarc.</code> subdomain</td>
                            <td className="px-6 py-4 text-red-600">No policy enforcement, phishing vulnerability</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/infrastructure-score-explained" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How is the Infrastructure Score Calculated?
                    </a>
                    <a href="/docs/help/entity-statuses" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Understanding Status Labels
                    </a>
                    <a href="/tools" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Free SPF, DKIM, DMARC Lookup Tools
                    </a>
                </div>
            </div>
        </div>
    );
}

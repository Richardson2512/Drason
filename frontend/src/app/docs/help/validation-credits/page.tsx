import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Do Validation Credits Work? | Superkabe Help',
    description: 'Understanding monthly validation credit limits, usage tracking, caching, and how credits are consumed across CSV uploads and API ingestion.',
    alternates: { canonical: '/docs/help/validation-credits' },
    openGraph: {
        title: 'How Do Validation Credits Work? | Superkabe Help',
        description: 'Understanding monthly validation credit limits, usage tracking, caching, and credit consumption.',
        url: '/docs/help/validation-credits',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function ValidationCreditsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Do Validation Credits Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Monthly credit limits, usage tracking, and how to get the most out of your validation allowance
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Every paid plan includes monthly email validation credits. <strong>One credit = one email validated</strong>. Credits reset on your billing anniversary. Duplicates and cached results don&apos;t consume credits. Check your usage on <strong>Dashboard &rarr; Billing &rarr; Usage</strong>.
                </p>
            </div>

            <h2 id="limits" className="text-3xl font-bold mb-6 text-gray-900">Monthly Credit Limits by Plan</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl overflow-hidden mb-12">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Plan</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Credits/Month</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Validation Depth</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">Trial</td>
                            <td className="px-6 py-4 text-gray-600">10,000</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Internal checks only (syntax, MX, disposable, catch-all)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">Starter</td>
                            <td className="px-6 py-4 text-gray-600">10,000</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Internal checks only</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">Growth</td>
                            <td className="px-6 py-4 text-gray-600">50,000</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Internal + MillionVerifier API for risky leads</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">Scale</td>
                            <td className="px-6 py-4 text-gray-600">100,000</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Internal + MillionVerifier API for medium-risk leads</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">Enterprise</td>
                            <td className="px-6 py-4 text-gray-600">Unlimited</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">Full hybrid validation with custom thresholds</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 id="what-uses" className="text-3xl font-bold mb-6 text-gray-900">What Uses a Credit?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-emerald-700 mb-3">Uses 1 Credit</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li>Each unique email validated for the first time</li>
                        <li>Each email from a CSV upload (first time)</li>
                        <li>Each lead ingested via Clay webhook (first time)</li>
                        <li>Each lead pushed via API (first time)</li>
                    </ul>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-700 mb-3">Does NOT Use a Credit</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li>Duplicate emails (same email uploaded again)</li>
                        <li>Cached validation results (within 30-day cache window)</li>
                        <li>ESP classification (uses existing MX data from validation)</li>
                        <li>Routing leads to campaigns</li>
                        <li>Exporting results as CSV</li>
                    </ul>
                </div>
            </div>

            <h2 id="what-happens" className="text-3xl font-bold mb-6 text-gray-900">What Happens When Credits Run Out?</h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-lg">
                <p className="text-amber-800 mb-3">
                    If you upload a CSV batch and credits are exhausted mid-batch, remaining leads are flagged with <strong>&ldquo;Monthly validation credit limit reached. Upgrade your plan.&rdquo;</strong> instead of being validated. Leads already validated in the batch are unaffected.
                </p>
                <p className="text-amber-700 text-sm">
                    Upgrade to a higher plan at <strong>Dashboard &rarr; Billing</strong> to increase your monthly limit. Credits reset on your billing anniversary &mdash; unused credits do not roll over.
                </p>
            </div>

            <h2 id="tracking" className="text-3xl font-bold mb-6 text-gray-900">How to Track Usage</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Billing &rarr; Usage</h3>
                    <p className="text-gray-600 text-sm">The <strong>Emails Validated</strong> stat card shows your lifetime validation count alongside Active Leads, Domains, and Mailboxes.</p>
                </div>
                <div className="bg-white border border-[#D1CBC5] rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Email Validation &rarr; Analytics</h3>
                    <p className="text-gray-600 text-sm">The validation analytics panel shows total validated, pass rate, invalid rate, and a breakdown by source (CSV, Clay, API). The 30-day trend chart shows daily validation volume.</p>
                </div>
            </div>

            <h2 id="optimization" className="text-3xl font-bold mb-6 text-gray-900">Optimizing Credit Usage</h2>
            <div className="bg-white border border-[#D1CBC5] rounded-xl p-6 mb-12">
                <ul className="space-y-3 text-gray-600">
                    <li><strong>Deduplicate before upload</strong> &mdash; remove obvious duplicates from your CSV before uploading. Superkabe catches them, but deduplicating client-side saves processing time.</li>
                    <li><strong>Use Clay for enrichment</strong> &mdash; Clay leads are typically higher quality than raw CSV imports. Your Clay invalid rate will be lower, meaning fewer wasted credits.</li>
                    <li><strong>Leverage caching</strong> &mdash; validation results are cached for 30 days per domain. Re-importing the same leads within 30 days uses cached results (no credit spent).</li>
                    <li><strong>Monitor source quality</strong> &mdash; check the &ldquo;Invalid Rate by Source&rdquo; chart on the validation analytics page. If CSV uploads have a 15% invalid rate, the list source needs cleanup.</li>
                </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/billing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Does Billing Work?</a>
                    <a href="/docs/help/email-validation" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How Does Email Validation Work?</a>
                    <a href="/docs/help/csv-upload" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">&rarr; How to Upload CSV Leads</a>
                </div>
            </div>
        </div>
    );
}

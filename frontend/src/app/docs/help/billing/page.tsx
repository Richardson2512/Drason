import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'How Does Billing & Subscriptions Work? | Superkabe Help',
 description: 'Learn about Superkabe subscription plans, usage limits, trial periods, invoices, and how to manage your billing settings.',
 alternates: { canonical: '/docs/help/billing' },
 openGraph: {
 title: 'How Does Billing & Subscriptions Work? | Superkabe Help',
 description: 'Learn about Superkabe subscription plans, usage limits, trial periods, invoices, and how to manage your billing settings.',
 url: '/docs/help/billing',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function BillingPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 How Does Billing Work?
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Understanding Superkabe subscription plans, usage limits, and payment management
 </p>

 {/* Quick Answer */}
 <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
 <p className="text-blue-800 mb-4">
 Superkabe offers tiered plans based on the number of <strong>active leads</strong>, <strong>domains</strong> (protection limit), and <strong>mailboxes</strong> you monitor.
 Every paid plan also includes <strong>email validation credits</strong> for the hybrid validation layer that checks every lead before send.
 Every account starts with a <strong>free trial</strong>. Usage is tracked in real-time and you can upgrade, downgrade, or cancel at any time.
 </p>
 <p className="text-blue-700 text-sm">
 Access it from <strong>Dashboard &rarr; Billing</strong>.
 </p>
 </div>

 {/* Available Plans */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">What Plans Are Available?</h2>
 <div className="bg-white border border-gray-200 overflow-hidden shadow-sm mb-12">
 <table className="w-full text-left">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-gray-700 font-semibold">Plan</th>
 <th className="px-6 py-3 text-gray-700 font-semibold">Price</th>
 <th className="px-6 py-3 text-gray-700 font-semibold">Leads</th>
 <th className="px-6 py-3 text-gray-700 font-semibold">Domains <span className="text-xs font-normal text-gray-400">(protection only)</span></th>
 <th className="px-6 py-3 text-gray-700 font-semibold">Mailboxes</th>
 <th className="px-6 py-3 text-gray-700 font-semibold">Validation Credits</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr>
 <td className="px-6 py-4 font-bold text-gray-900">Trial</td>
 <td className="px-6 py-4 text-green-700 font-medium">Free</td>
 <td className="px-6 py-4 text-gray-600">10,000</td>
 <td className="px-6 py-4 text-gray-600">20</td>
 <td className="px-6 py-4 text-gray-600">75</td>
 <td className="px-6 py-4 text-gray-600">10,000</td>
 </tr>
 <tr>
 <td className="px-6 py-4 font-bold text-gray-900">Starter</td>
 <td className="px-6 py-4 text-gray-700 font-medium">$19/mo</td>
 <td className="px-6 py-4 text-gray-600">3,000</td>
 <td className="px-6 py-4 text-gray-600">7</td>
 <td className="px-6 py-4 text-gray-600">25</td>
 <td className="px-6 py-4 text-gray-600">3,000/mo</td>
 </tr>
 <tr>
 <td className="px-6 py-4 font-bold text-gray-900">Pro</td>
 <td className="px-6 py-4 text-gray-700 font-medium">$49/mo</td>
 <td className="px-6 py-4 text-gray-600">10,000</td>
 <td className="px-6 py-4 text-gray-600">20</td>
 <td className="px-6 py-4 text-gray-600">75</td>
 <td className="px-6 py-4 text-gray-600">10,000/mo</td>
 </tr>
 <tr>
 <td className="px-6 py-4 font-bold text-gray-900">Growth</td>
 <td className="px-6 py-4 text-gray-700 font-medium">$199/mo</td>
 <td className="px-6 py-4 text-gray-600">50,000</td>
 <td className="px-6 py-4 text-gray-600">75</td>
 <td className="px-6 py-4 text-gray-600">350</td>
 <td className="px-6 py-4 text-gray-600">50,000/mo</td>
 </tr>
 <tr>
 <td className="px-6 py-4 font-bold text-gray-900">Scale</td>
 <td className="px-6 py-4 text-gray-700 font-medium">$349/mo</td>
 <td className="px-6 py-4 text-gray-600">100,000</td>
 <td className="px-6 py-4 text-gray-600">150</td>
 <td className="px-6 py-4 text-gray-600">700</td>
 <td className="px-6 py-4 text-gray-600">100,000/mo</td>
 </tr>
 <tr>
 <td className="px-6 py-4 font-bold text-gray-900">Enterprise</td>
 <td className="px-6 py-4 text-gray-700 font-medium">Custom</td>
 <td className="px-6 py-4 text-gray-600">Unlimited</td>
 <td className="px-6 py-4 text-gray-600">Unlimited</td>
 <td className="px-6 py-4 text-gray-600">Unlimited</td>
 <td className="px-6 py-4 text-gray-600">Unlimited</td>
 </tr>
 </tbody>
 </table>
 </div>

 {/* How Do Usage Limits Work */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do Usage Limits Work?</h2>
 <p className="text-gray-600 mb-4">
 Your plan determines the maximum number of active leads, domains (protection limit), mailboxes, and email validation credits Superkabe monitors.
 Usage is tracked in real-time with visual progress bars on the billing page, including a lifetime count of emails validated.
 </p>

 {/* Email Validation Credits */}
 <div className="bg-white border border-[#D1CBC5] p-6 mb-6">
 <h3 className="text-lg font-bold mb-2 text-gray-900">What Are Email Validation Credits?</h3>
 <p className="text-gray-600 mb-3">
 Every paid plan includes monthly email validation credits. One credit = one email checked through the hybrid validation layer (syntax, MX, SMTP probe, disposable detection, role detection, catch-all detection).
 </p>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Automatic use</strong> &mdash; every lead ingested from Clay or API is validated before routing to Smartlead/Instantly/EmailBison. No manual action required.</span>
 </li>
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Cached results</strong> &mdash; Superkabe caches validation results for 30 days, so re-ingesting the same email doesn&apos;t re-spend a credit.</span>
 </li>
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Tracked on Billing &rarr; Usage</strong> &mdash; &ldquo;Emails Validated&rdquo; stat card shows lifetime total across all sources (internal + MillionVerifier).</span>
 </li>
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Resets monthly</strong> on your billing anniversary. Unused credits don&apos;t roll over.</span>
 </li>
 </ul>
 </div>
 <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 ">
 <h3 className="text-lg font-bold text-amber-900 mb-2">What Happens at 80%+ Usage?</h3>
 <p className="text-amber-800 mb-2">
 When you exceed 80% of any limit, Superkabe highlights that metric in orange as an early warning.
 This gives you time to upgrade before hitting the cap.
 </p>
 <p className="text-amber-700 text-sm">
 If you reach 100%, new resources of that type cannot be synced until you upgrade or remove existing ones.
 </p>
 </div>

 {/* Trial Period */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How Does the Free Trial Work?</h2>
 <div className="space-y-4 mb-12">
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">Full Access</h3>
 <p className="text-gray-600 text-sm">During your trial, you get full access to all Superkabe features with Pro-level limits (10K leads, 20 domains (protection limit), 75 mailboxes).</p>
 </div>
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">Trial Countdown</h3>
 <p className="text-gray-600 text-sm">A countdown timer on the dashboard shows how many days remain. You'll receive a warning notification when fewer than 7 days are left.</p>
 </div>
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">After Trial Expires</h3>
 <p className="text-gray-600 text-sm">Your data is preserved but monitoring pauses. Subscribe to any paid plan to resume protection immediately. No data is lost.</p>
 </div>
 </div>

 {/* Invoices */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How Do I View Invoices?</h2>
 <p className="text-gray-600 mb-4">
 Navigate to <strong>Dashboard &rarr; Billing &rarr; Billing tab</strong> to view your complete invoice history. Each invoice shows:
 </p>
 <div className="bg-white border border-gray-200 p-6 mb-12 shadow-sm">
 <ul className="space-y-2 text-gray-600">
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Date</strong> &mdash; When the invoice was generated</span>
 </li>
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Amount</strong> &mdash; Total charged (in USD)</span>
 </li>
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Status</strong> &mdash; Paid, pending, or failed</span>
 </li>
 <li className="flex items-start gap-2">
 <span>&#x2022;</span>
 <span><strong>Download</strong> &mdash; PDF receipt for your records</span>
 </li>
 </ul>
 </div>

 {/* Related Articles */}
 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
 <div className="space-y-2">
 <a href="/docs/getting-started" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Getting Started with Superkabe
 </a>
 <a href="/docs/help/account-management" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Do I Manage My Account?
 </a>
 <a href="/docs/configuration" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Configuration Guide
 </a>
 </div>
 </div>
 </div>
 );
}

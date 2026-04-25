import type { Metadata } from 'next';
import Link from 'next/link';
import SpfLookupClient from './SpfLookupClient';

export const metadata: Metadata = {
 title: "Free SPF Record Lookup Tool – Check Your Domain's SPF Record",
 description: "Free SPF record lookup tool. Enter any domain to check its SPF record, view authorized sending servers, and detect misconfigurations that cause email.",
 openGraph: {
 title: "Free SPF Record Lookup Tool – Check Your Domain's SPF Record",
 description: "Free SPF record lookup tool. Enter any domain to check its SPF record, view authorized sending servers, and detect misconfigurations that cause email.",
 url: '/tools/spf-lookup',
 siteName: 'Superkabe',
 type: 'website',
 },
 alternates: {
 canonical: '/tools/spf-lookup',
 },
};

const faqItems = [
 {
 q: 'What is an SPF record?',
 a: 'An SPF (Sender Policy Framework) record is a DNS TXT record that lists the mail servers authorized to send email on behalf of your domain. When a receiving server gets an email, it checks the sender\'s domain SPF record to verify the sending server is permitted. If the server is not listed, the email may be rejected or marked as spam.',
 },
 {
 q: 'How do I read an SPF record?',
 a: 'An SPF record starts with "v=spf1" followed by mechanisms that define authorized senders. Common mechanisms include "ip4:" and "ip6:" for specific IP addresses, "include:" for third-party senders (like Google or Mailchimp), "a" and "mx" for your domain\'s A and MX records, and "all" at the end to set the default policy for unlisted senders. The qualifier before each mechanism (+, -, ~, ?) determines whether matching senders pass, fail, softfail, or are treated as neutral.',
 },
 {
 q: 'What does the 10 DNS lookup limit mean?',
 a: 'RFC 7208 limits SPF evaluation to 10 DNS lookups per check. Each "include", "a", "mx", "ptr", "exists", and "redirect" mechanism triggers a DNS lookup. If your SPF record exceeds 10 lookups, receiving servers return a PermError and the SPF check fails entirely. This is the most common SPF misconfiguration, especially for domains using multiple email services. To fix it, consolidate includes, replace "include" with direct "ip4"/"ip6" entries, or use SPF flattening.',
 },
 {
 q: 'What is the difference between ~all and -all?',
 a: '"~all" (softfail) tells receiving servers that unlisted senders are probably unauthorized but should not be outright rejected. "-all" (hard fail) tells receivers to reject emails from unlisted servers. For domains actively sending email, "-all" provides the strongest protection against spoofing. "~all" is recommended during initial setup or migration to avoid accidentally blocking legitimate email. Most deliverability experts recommend moving to "-all" once you have confirmed all sending sources are listed.',
 },
 {
 q: 'Can I have multiple SPF records on one domain?',
 a: 'No. RFC 7208 requires exactly one SPF record per domain. If a domain publishes multiple SPF TXT records, receiving servers must return a PermError, which means the SPF check fails for all emails. If you need to authorize multiple sending services, combine them into a single SPF record using "include:" mechanisms. This is a common mistake when adding new email providers without removing or updating the existing SPF record.',
 },
 {
 q: 'Why does my SPF check show "No SPF record found"?',
 a: 'This means your domain\'s DNS has no TXT record starting with "v=spf1". Common reasons include: the record was never created, it was accidentally deleted during a DNS migration, or it is published on a subdomain instead of the root domain. Without an SPF record, receiving servers cannot verify your sending authorization, which leads to poor inbox placement and makes your domain vulnerable to spoofing.',
 },
];

export default function SpfLookupPage() {
 const webAppSchema = {
 "@context": "https://schema.org",
 "@type": "WebApplication",
 "name": "Free SPF Record Lookup Tool",
 "description": "Enter any domain to check its SPF record, view authorized sending servers, and detect misconfigurations that cause email authentication failures.",
 "url": "https://www.superkabe.com/tools/spf-lookup",
 "applicationCategory": "Utility",
 "operatingSystem": "Any",
 "offers": {
 "@type": "Offer",
 "price": "0",
 "priceCurrency": "USD",
 },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 };

 const howToSchema = {
 "@context": "https://schema.org",
 "@type": "HowTo",
 "name": "How to Check Your Domain's SPF Record",
 "description": "Use Superkabe's free SPF lookup tool to check if your domain has a valid SPF record and identify misconfigurations.",
 "step": [
 {
 "@type": "HowToStep",
 "position": 1,
 "name": "Enter your domain",
 "text": "Type your domain name (e.g. example.com) into the lookup field. Do not include https:// or any path.",
 },
 {
 "@type": "HowToStep",
 "position": 2,
 "name": "Run the lookup",
 "text": "Click the \"Check SPF Record\" button. The tool queries DNS over HTTPS to retrieve all TXT records for your domain and filters for SPF records.",
 },
 {
 "@type": "HowToStep",
 "position": 3,
 "name": "Review the results",
 "text": "Review the raw SPF record, parsed mechanisms, DNS lookup count, and any warnings about misconfigurations like exceeding the 10-lookup limit or using a weak all mechanism.",
 },
 ],
 };

 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": faqItems.map(item => ({
 "@type": "Question",
 "name": item.q,
 "acceptedAnswer": {
 "@type": "Answer",
 "text": item.a,
 },
 })),
 };

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 {/* Hero / Title */}
 <div className="mb-8">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-600 mb-4">
 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
 Free Tool &middot; No Signup Required
 </div>
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
 SPF Record Lookup
 </h1>
 <p className="text-gray-600 leading-relaxed max-w-2xl">
 Enter any domain to check its SPF record. View authorized sending servers, count DNS lookups, and detect misconfigurations before they damage your deliverability.
 </p>
 </div>

 {/* Interactive Tool */}
 <SpfLookupClient />

 {/* Educational Content */}
 <div className="mt-16 space-y-12">

 {/* What is an SPF Record? */}
 <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
 <h2 className="text-xl font-bold text-gray-900 mb-4">What is an SPF Record?</h2>
 <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
 <p>
 SPF (Sender Policy Framework) is a DNS-based email authentication protocol defined in RFC 7208. It allows domain owners to publish a list of mail servers that are authorized to send email on their behalf.
 </p>
 <p>
 When a receiving mail server gets an email claiming to be from your domain, it looks up the SPF record in your DNS. If the sending server&apos;s IP address matches one of the authorized mechanisms in the record, the SPF check passes. If not, the result depends on the &quot;all&quot; mechanism at the end of the record &mdash; typically softfail (~all) or hard fail (-all).
 </p>
 <p>
 SPF is one of three email authentication protocols (alongside DKIM and DMARC) that are now required by Google and Yahoo for all bulk email senders. Without a valid SPF record, your emails are significantly more likely to land in spam or be rejected outright.
 </p>
 </div>
 </section>

 {/* How to Read SPF Results */}
 <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
 <h2 className="text-xl font-bold text-gray-900 mb-4">How to Read SPF Results</h2>
 <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
 <p>
 An SPF record is a single string made up of a version tag and a series of mechanisms. Here is how to interpret each part:
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 pr-4 font-semibold text-gray-900">Mechanism</th>
 <th className="text-left py-3 pr-4 font-semibold text-gray-900">Example</th>
 <th className="text-left py-3 font-semibold text-gray-900">Meaning</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 <tr>
 <td className="py-3 pr-4 font-mono text-gray-800">v=spf1</td>
 <td className="py-3 pr-4 font-mono text-gray-500">v=spf1</td>
 <td className="py-3 text-gray-600">Version identifier. Must be the first token.</td>
 </tr>
 <tr>
 <td className="py-3 pr-4 font-mono text-gray-800">ip4 / ip6</td>
 <td className="py-3 pr-4 font-mono text-gray-500">ip4:192.0.2.0/24</td>
 <td className="py-3 text-gray-600">Authorize a specific IPv4 or IPv6 address or CIDR range. No DNS lookup required.</td>
 </tr>
 <tr>
 <td className="py-3 pr-4 font-mono text-gray-800">include</td>
 <td className="py-3 pr-4 font-mono text-gray-500">include:_spf.google.com</td>
 <td className="py-3 text-gray-600">Authorize all servers listed in another domain&apos;s SPF record. Counts as a DNS lookup.</td>
 </tr>
 <tr>
 <td className="py-3 pr-4 font-mono text-gray-800">a</td>
 <td className="py-3 pr-4 font-mono text-gray-500">a</td>
 <td className="py-3 text-gray-600">Authorize the IP(s) that your domain&apos;s A record points to. Counts as a DNS lookup.</td>
 </tr>
 <tr>
 <td className="py-3 pr-4 font-mono text-gray-800">mx</td>
 <td className="py-3 pr-4 font-mono text-gray-500">mx</td>
 <td className="py-3 text-gray-600">Authorize the IP(s) of your domain&apos;s MX (mail exchange) servers. Counts as a DNS lookup.</td>
 </tr>
 <tr>
 <td className="py-3 pr-4 font-mono text-gray-800">all</td>
 <td className="py-3 pr-4 font-mono text-gray-500">-all</td>
 <td className="py-3 text-gray-600">Default rule for senders not matching any mechanism. Qualifiers: + pass, ~ softfail, - fail, ? neutral.</td>
 </tr>
 </tbody>
 </table>
 </div>
 <p>
 Each mechanism can be prefixed with a qualifier: <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">+</code> (pass, default), <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">-</code> (fail), <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">~</code> (softfail), or <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">?</code> (neutral). The qualifier determines what happens when a sending server matches that mechanism.
 </p>
 </div>
 </section>

 {/* Common SPF Misconfigurations */}
 <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
 <h2 className="text-xl font-bold text-gray-900 mb-4">Common SPF Misconfigurations</h2>
 <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
 <div>
 <h3 className="font-semibold text-gray-900 mb-2">1. Exceeding the 10 DNS Lookup Limit</h3>
 <p>
 Each <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">include</code>, <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">a</code>, <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">mx</code>, <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">ptr</code>, <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">exists</code>, and <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">redirect</code> mechanism triggers a DNS lookup. Included domains may also have their own includes, which count toward your total. If the total exceeds 10, the SPF check returns PermError and all emails fail authentication. Fix this by replacing includes with direct IP addresses or using SPF flattening services.
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-gray-900 mb-2">2. Missing Include for a Sending Service</h3>
 <p>
 Every third-party service that sends email on your behalf (Google Workspace, Microsoft 365, Mailchimp, SendGrid, Smartlead, etc.) needs its own <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">include:</code> mechanism in your SPF record. If you add a new email provider but forget to update SPF, emails from that provider will fail the SPF check. Always check your provider&apos;s documentation for the correct include value.
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-gray-900 mb-2">3. Wrong Mechanism Order</h3>
 <p>
 SPF mechanisms are evaluated left to right. While order does not change the final result for most records, placing the <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">all</code> mechanism anywhere other than the end will cause everything after it to be ignored. Always put <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">-all</code> or <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">~all</code> as the last mechanism in the record.
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-gray-900 mb-2">4. Using +all or ?all</h3>
 <p>
 Setting the all mechanism to <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">+all</code> (pass) means any server in the world can send email as your domain. This defeats the entire purpose of SPF. Similarly, <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">?all</code> (neutral) provides no indication to receivers about unauthorized senders. Use <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">~all</code> (softfail) as a minimum and <code className="px-1.5 py-0.5 bg-gray-100 text-xs font-mono">-all</code> (hard fail) for maximum protection.
 </p>
 </div>
 <div>
 <h3 className="font-semibold text-gray-900 mb-2">5. Multiple SPF Records on One Domain</h3>
 <p>
 A domain must have exactly one SPF TXT record. Publishing two or more causes a PermError for every SPF check, meaning all emails fail authentication. This commonly happens when a new record is added without removing the old one. If you need to authorize additional senders, edit the existing record to include them.
 </p>
 </div>
 </div>
 </section>

 {/* FAQ */}
 <section>
 <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
 <div className="space-y-3">
 {faqItems.map(faq => (
 <details key={faq.q} className="group bg-white border border-gray-100 shadow-sm">
 <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
 <span className="font-semibold text-gray-900 pr-4 text-sm">{faq.q}</span>
 <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">&#9660;</span>
 </summary>
 <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
 {faq.a}
 </div>
 </details>
 ))}
 </div>
 </section>

 {/* Related Tools */}
 <section>
 <h2 className="text-xl font-bold text-gray-900 mb-6">Related Tools</h2>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { title: 'SPF Record Generator', description: 'Generate a properly formatted SPF TXT record for your domain.', href: '/tools/spf-generator' },
 { title: 'DKIM Record Lookup', description: 'Verify your DKIM DNS record and public key are published correctly.', href: '/tools/dkim-lookup' },
 { title: 'DMARC Record Lookup', description: 'Check your DMARC policy, reporting settings, and alignment mode.', href: '/tools/dmarc-lookup' },
 ].map(tool => (
 <Link
 key={tool.href}
 href={tool.href}
 className="group block p-6 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">
 {tool.title}
 </h3>
 <p className="text-xs text-gray-500">{tool.description}</p>
 <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
 Use tool <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
 </span>
 </Link>
 ))}
 </div>
 </section>

 {/* Related Reading */}
 <section>
 <h2 className="text-xl font-bold text-gray-900 mb-6">Related Reading</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Link
 href="/blog/spf-dkim-dmarc-explained"
 className="group block p-6 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">
 SPF, DKIM & DMARC Setup Guide
 </h3>
 <p className="text-xs text-gray-500">Step-by-step DNS authentication setup for outbound email teams. Learn how SPF, DKIM, and DMARC work together to protect your domain.</p>
 </Link>
 <Link
 href="/blog/email-deliverability-guide"
 className="group block p-6 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">
 Complete Email Deliverability Guide
 </h3>
 <p className="text-xs text-gray-500">Everything you need to know about inbox placement, sender reputation, and avoiding spam filters.</p>
 </Link>
 </div>
 </section>

 {/* CTA */}
 <section className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
 <h2 className="text-xl font-bold text-gray-900 mb-3">Monitor SPF Records Automatically</h2>
 <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-2xl">
 This free tool checks your SPF record on demand. Superkabe monitors SPF, DKIM, and DMARC across all your sending domains every 24 hours and alerts you before misconfigurations cause deliverability failures.
 </p>
 <Link
 href="/signup"
 className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
 >
 Start free trial
 </Link>
 </section>
 </div>
 </>
 );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import DmarcGeneratorClient from './DmarcGeneratorClient';

export const metadata: Metadata = {
 title: 'Free DMARC Record Generator – Create Your DMARC TXT Record',
 description:
 'Free DMARC record generator tool. Configure your DMARC policy, reporting addresses, and alignment settings to create a properly formatted DMARC TXT record.',
 openGraph: {
 title: 'Free DMARC Record Generator – Create Your DMARC TXT Record',
 description:
 'Free DMARC record generator tool. Configure your DMARC policy, reporting addresses, and alignment settings to create a properly formatted DMARC TXT record.',
 url: '/tools/dmarc-generator',
 siteName: 'Superkabe',
 type: 'website',
 },
 alternates: {
 canonical: '/tools/dmarc-generator',
 },
};

export default function DmarcGeneratorPage() {
 const webAppSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebApplication',
 name: 'Free DMARC Record Generator',
 description:
 'Generate a properly formatted DMARC TXT record for your domain. Configure policy, reporting, alignment, and percentage settings.',
 url: 'https://www.superkabe.com/tools/dmarc-generator',
 applicationCategory: 'DeveloperApplication',
 operatingSystem: 'Any',
 offers: {
 '@type': 'Offer',
 price: '0',
 priceCurrency: 'USD',
 },
 publisher: { '@id': 'https://www.superkabe.com/#organization' },
 };

 const howToSchema = {
 '@context': 'https://schema.org',
 '@type': 'HowTo',
 name: 'How to Generate a DMARC Record',
 description: 'Create a properly formatted DMARC TXT record for your domain in four steps.',
 step: [
 {
 '@type': 'HowToStep',
 position: 1,
 name: 'Choose your DMARC policy',
 text: 'Select your enforcement level: none (monitor only), quarantine (send to spam), or reject (block entirely). Start with none for new domains.',
 },
 {
 '@type': 'HowToStep',
 position: 2,
 name: 'Add reporting email addresses',
 text: 'Enter one or more email addresses to receive aggregate (rua) and optionally forensic (ruf) DMARC reports. These reports show who is sending email as your domain.',
 },
 {
 '@type': 'HowToStep',
 position: 3,
 name: 'Configure alignment settings',
 text: 'Choose relaxed or strict alignment for DKIM and SPF. Relaxed allows subdomains to pass; strict requires an exact domain match.',
 },
 {
 '@type': 'HowToStep',
 position: 4,
 name: 'Copy the generated record',
 text: 'Copy the generated DMARC TXT record and publish it at _dmarc.yourdomain.com in your DNS provider.',
 },
 ],
 publisher: { '@id': 'https://www.superkabe.com/#organization' },
 };

 const faqSchema = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: [
 {
 '@type': 'Question',
 name: 'What is a DMARC record?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'A DMARC (Domain-based Message Authentication, Reporting & Conformance) record is a DNS TXT record published at _dmarc.yourdomain.com. It tells receiving mail servers what to do when an email fails SPF or DKIM authentication checks, and where to send reports about authentication results.',
 },
 },
 {
 '@type': 'Question',
 name: 'What DMARC policy should I start with?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'Start with p=none (monitor only) so you can receive reports without affecting email delivery. Once you have confirmed that all legitimate sending sources pass SPF and DKIM, gradually move to p=quarantine and then p=reject. Use the pct= tag to apply the policy to a percentage of messages during the transition.',
 },
 },
 {
 '@type': 'Question',
 name: 'What is the difference between rua and ruf in DMARC?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'rua (Reporting URI for Aggregate reports) receives daily XML summaries of all authentication results for your domain. ruf (Reporting URI for Forensic reports) receives individual failure reports with message-level detail. Aggregate reports are essential for monitoring; forensic reports are optional and may contain personally identifiable information.',
 },
 },
 {
 '@type': 'Question',
 name: 'What is DMARC alignment?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'DMARC alignment checks whether the domain in the From header matches the domain used for SPF and DKIM authentication. Relaxed alignment (default) allows subdomains to match the organizational domain. Strict alignment requires an exact domain match. Most organizations should start with relaxed alignment.',
 },
 },
 {
 '@type': 'Question',
 name: 'How long does it take for a DMARC record to take effect?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'DMARC records take effect as soon as they propagate through DNS, which typically takes 15 minutes to 48 hours depending on your DNS provider and TTL settings. Aggregate reports usually start arriving within 24-72 hours of publishing the record.',
 },
 },
 ],
 };

 const faqs = [
 {
 q: 'What is a DMARC record?',
 a: 'A DMARC (Domain-based Message Authentication, Reporting & Conformance) record is a DNS TXT record published at _dmarc.yourdomain.com. It tells receiving mail servers what to do when an email fails SPF or DKIM authentication checks, and where to send reports about authentication results.',
 },
 {
 q: 'What DMARC policy should I start with?',
 a: 'Start with p=none (monitor only) so you can receive reports without affecting email delivery. Once you have confirmed that all legitimate sending sources pass SPF and DKIM, gradually move to p=quarantine and then p=reject. Use the pct= tag to apply the policy to a percentage of messages during the transition.',
 },
 {
 q: 'What is the difference between rua and ruf in DMARC?',
 a: 'rua (Reporting URI for Aggregate reports) receives daily XML summaries of all authentication results for your domain. ruf (Reporting URI for Forensic reports) receives individual failure reports with message-level detail. Aggregate reports are essential for monitoring; forensic reports are optional and may contain personally identifiable information.',
 },
 {
 q: 'What is DMARC alignment?',
 a: 'DMARC alignment checks whether the domain in the From header matches the domain used for SPF and DKIM authentication. Relaxed alignment (default) allows subdomains to match the organizational domain. Strict alignment requires an exact domain match. Most organizations should start with relaxed alignment.',
 },
 {
 q: 'How long does it take for a DMARC record to take effect?',
 a: 'DMARC records take effect as soon as they propagate through DNS, which typically takes 15 minutes to 48 hours depending on your DNS provider and TTL settings. Aggregate reports usually start arriving within 24-72 hours of publishing the record.',
 },
 ];

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 {/* Interactive Generator */}
 <DmarcGeneratorClient />

 {/* Understanding DMARC Policies */}
 <section className="mt-16">
 <div className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding DMARC Policies</h2>
 <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
 <p>
 DMARC policies tell receiving mail servers what to do when an email claiming to come from your domain fails
 both SPF and DKIM authentication. The three policy levels represent increasing enforcement:
 </p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
 <div className="p-5 bg-purple-50/50 border border-purple-100">
 <h3 className="font-bold text-gray-900 mb-1 text-base">p=none</h3>
 <p className="text-purple-700 text-xs font-semibold mb-2">Monitor Only</p>
 <p className="text-sm text-gray-600">
 No action taken on failing emails. Reports are collected so you can see who is sending as your
 domain. This is the starting point for any DMARC deployment.
 </p>
 </div>
 <div className="p-5 bg-amber-50/50 border border-amber-100">
 <h3 className="font-bold text-gray-900 mb-1 text-base">p=quarantine</h3>
 <p className="text-amber-700 text-xs font-semibold mb-2">Send to Spam</p>
 <p className="text-sm text-gray-600">
 Failing emails are delivered to the spam/junk folder instead of the inbox. This is the
 intermediate enforcement level during rollout.
 </p>
 </div>
 <div className="p-5 bg-green-50/50 border border-green-100">
 <h3 className="font-bold text-gray-900 mb-1 text-base">p=reject</h3>
 <p className="text-green-700 text-xs font-semibold mb-2">Block Entirely</p>
 <p className="text-sm text-gray-600">
 Failing emails are rejected outright and never delivered. This is the strongest protection against
 spoofing and phishing using your domain.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* DMARC Rollout Strategy */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">DMARC Rollout Strategy</h2>
 <p className="text-sm text-gray-600 mb-6">
 Moving directly to p=reject without monitoring will break legitimate email. Follow this phased approach to
 deploy DMARC safely:
 </p>
 <ol className="space-y-4">
 <li className="flex items-start gap-4">
 <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shrink-0">1</span>
 <div>
 <p className="font-semibold text-gray-900 text-sm">p=none (Monitor)</p>
 <p className="text-sm text-gray-600">
 Publish <code className="bg-gray-100 px-1 py-0.5 text-xs">p=none</code> with a reporting
 address. Collect aggregate reports for 2&ndash;4 weeks. Identify all legitimate sending sources and
 ensure they pass SPF and DKIM.
 </p>
 </div>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shrink-0">2</span>
 <div>
 <p className="font-semibold text-gray-900 text-sm">p=quarantine; pct=25</p>
 <p className="text-sm text-gray-600">
 Quarantine 25% of failing messages. Monitor reports for false positives. If legitimate emails are
 being quarantined, fix their authentication before proceeding.
 </p>
 </div>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shrink-0">3</span>
 <div>
 <p className="font-semibold text-gray-900 text-sm">p=quarantine; pct=100</p>
 <p className="text-sm text-gray-600">
 Quarantine all failing messages. Continue monitoring for 1&ndash;2 weeks to confirm no legitimate
 mail is impacted.
 </p>
 </div>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold shrink-0">4</span>
 <div>
 <p className="font-semibold text-gray-900 text-sm">p=reject; pct=25</p>
 <p className="text-sm text-gray-600">
 Begin rejecting 25% of failing messages outright. This is a significant step &mdash; rejected emails
 are not delivered at all.
 </p>
 </div>
 </li>
 <li className="flex items-start gap-4">
 <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-bold shrink-0">5</span>
 <div>
 <p className="font-semibold text-gray-900 text-sm">p=reject; pct=100</p>
 <p className="text-sm text-gray-600">
 Full enforcement. All emails that fail DMARC are rejected. Your domain is now fully protected
 against spoofing.
 </p>
 </div>
 </li>
 </ol>
 </div>
 </section>

 {/* DMARC Reporting Explained */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">DMARC Reporting Explained</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 bg-purple-50/50 border border-purple-100">
 <h3 className="font-bold text-gray-900 mb-2">Aggregate Reports (rua)</h3>
 <p className="text-sm text-gray-600 mb-3">
 Daily XML reports sent to your specified email address. They summarize authentication results for all
 emails sent using your domain, grouped by sending source.
 </p>
 <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
 <li>Volume of emails per sending IP</li>
 <li>SPF and DKIM pass/fail rates</li>
 <li>Policy applied to failing messages</li>
 <li>Sending organization identifiers</li>
 </ul>
 </div>
 <div className="p-6 bg-gray-50 border border-gray-200">
 <h3 className="font-bold text-gray-900 mb-2">Forensic Reports (ruf)</h3>
 <p className="text-sm text-gray-600 mb-3">
 Individual failure reports with message-level detail. Sent in near real-time when a specific email
 fails DMARC. Useful for debugging but may contain PII.
 </p>
 <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
 <li>Full message headers</li>
 <li>Specific authentication failure details</li>
 <li>Sending and receiving server information</li>
 <li>Not widely supported by all receivers</li>
 </ul>
 <p className="text-xs text-amber-700 mt-3 font-medium">
 Note: Many large providers (Gmail, Yahoo) do not send forensic reports due to privacy concerns.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* Alignment Modes */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10 shadow-sm">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Alignment Modes</h2>
 <p className="text-sm text-gray-600 mb-6">
 DMARC alignment determines how strictly the domain in the From header must match the domains used for SPF and
 DKIM authentication. You can configure alignment independently for each protocol.
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 bg-purple-50/50 border border-purple-100">
 <h3 className="font-bold text-gray-900 mb-2">Relaxed Alignment (default)</h3>
 <p className="text-sm text-gray-600 mb-3">
 The organizational domains must match, but subdomains are allowed. For example, if the From header is
 user@mail.example.com, an SPF or DKIM domain of example.com will pass.
 </p>
 <p className="text-xs text-purple-700 font-medium">
 Recommended for most organizations, especially those using third-party sending services.
 </p>
 </div>
 <div className="p-6 bg-gray-50 border border-gray-200">
 <h3 className="font-bold text-gray-900 mb-2">Strict Alignment</h3>
 <p className="text-sm text-gray-600 mb-3">
 The domains must match exactly. If the From header is user@mail.example.com, only
 mail.example.com will pass &mdash; example.com alone will fail.
 </p>
 <p className="text-xs text-gray-500 font-medium">
 Use strict alignment only when you have full control over all sending infrastructure and want maximum
 protection.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* FAQ */}
 <section className="mt-12">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
 <div className="space-y-4">
 {faqs.map((faq) => (
 <details key={faq.q} className="group bg-white border border-gray-100 shadow-sm">
 <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
 <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
 <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">&#9660;</span>
 </summary>
 <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
 </details>
 ))}
 </div>
 </section>

 {/* Related Tools */}
 <section className="mt-12">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tools</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: 'DMARC Record Lookup',
 description: 'Check if your domain has a valid DMARC record and see the current policy settings.',
 href: '/tools/dmarc-lookup',
 },
 {
 title: 'SPF Record Generator',
 description: 'Generate a properly formatted SPF TXT record with authorized senders and failure policy.',
 href: '/tools/spf-generator',
 },
 {
 title: 'DKIM Record Generator',
 description: 'Create a DKIM TXT record with your public key, selector, and signing configuration.',
 href: '/tools/dkim-generator',
 },
 ].map((tool) => (
 <Link
 key={tool.href}
 href={tool.href}
 className="group block p-6 bg-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-sm">
 {tool.title}
 </h3>
 <p className="text-xs text-gray-500">{tool.description}</p>
 <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-gray-400 group-hover:text-purple-600 transition-colors">
 Use tool <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
 </span>
 </Link>
 ))}
 </div>
 </section>

 {/* Related Reading */}
 <section className="mt-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
 <Link
 href="/blog/spf-dkim-dmarc-explained"
 className="group block p-6 bg-white border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors text-sm">
 SPF, DKIM &amp; DMARC Setup Guide
 </h3>
 <p className="text-xs text-gray-500">
 Step-by-step DNS authentication setup for outbound email teams. Learn how SPF, DKIM, and DMARC work together
 to protect your domain and improve deliverability.
 </p>
 </Link>
 </section>

 {/* CTA */}
 <section className="mt-12 mb-4">
 <div className="bg-purple-50 border border-purple-100 p-8 md:p-10">
 <h2 className="text-xl font-bold text-gray-900 mb-3">Need continuous DMARC monitoring?</h2>
 <p className="text-sm text-gray-600 mb-6 max-w-2xl">
 This free tool generates your DMARC record on demand. Superkabe monitors SPF, DKIM, and DMARC across all your
 sending domains automatically &mdash; every 24 hours &mdash; and alerts you before misconfigurations cause
 deliverability failures.
 </p>
 <Link
 href="/signup"
 className="inline-block px-6 py-3 bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
 >
 Start free trial
 </Link>
 </div>
 </section>
 </>
 );
}

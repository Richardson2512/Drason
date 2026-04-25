import type { Metadata } from 'next';
import Link from 'next/link';
import DkimLookupClient from './DkimLookupClient';

export const metadata: Metadata = {
 title: 'Free DKIM Record Lookup Tool – Verify Your DKIM DNS Record',
 description: 'Free DKIM record lookup tool. Enter your domain and selector to verify your DKIM public key is published correctly and email signatures can be validated.',
 openGraph: {
 title: 'Free DKIM Record Lookup Tool – Verify Your DKIM DNS Record',
 description: 'Free DKIM record lookup tool. Enter your domain and selector to verify your DKIM public key is published correctly and email signatures can be validated.',
 url: '/tools/dkim-lookup',
 siteName: 'Superkabe',
 type: 'website',
 },
 alternates: {
 canonical: '/tools/dkim-lookup',
 },
};

const webAppSchema = {
 "@context": "https://schema.org",
 "@type": "WebApplication",
 "name": "Free DKIM Record Lookup Tool",
 "description": "Enter your domain and DKIM selector to verify your DKIM public key is published correctly in DNS.",
 "url": "https://www.superkabe.com/tools/dkim-lookup",
 "applicationCategory": "DeveloperApplication",
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
 "name": "How to Look Up a DKIM Record",
 "description": "Use the free DKIM lookup tool to verify your domain's DKIM public key is published correctly in DNS.",
 "step": [
 {
 "@type": "HowToStep",
 "position": 1,
 "name": "Enter your domain",
 "text": "Type your domain name (e.g. example.com) into the domain field.",
 },
 {
 "@type": "HowToStep",
 "position": 2,
 "name": "Enter your DKIM selector",
 "text": "Type your DKIM selector (e.g. google, s1, default) into the selector field. You can find this in the DKIM-Signature header of any email sent from your domain.",
 },
 {
 "@type": "HowToStep",
 "position": 3,
 "name": "View your DKIM results",
 "text": "Review the parsed DKIM record including the public key, key type, version, and any flags. The tool highlights issues like missing or revoked keys.",
 },
 ],
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
};

const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "What is a DKIM record?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "A DKIM (DomainKeys Identified Mail) record is a DNS TXT record that contains a public cryptographic key. When you send an email, your mail server signs the message with a private key. The receiving server looks up this DKIM record to retrieve the public key and verify the signature, confirming the email is authentic and has not been tampered with in transit.",
 },
 },
 {
 "@type": "Question",
 "name": "What is a DKIM selector?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "A DKIM selector is a string that identifies which DKIM key to use for signature verification. It allows a single domain to have multiple DKIM keys for different mail systems. The selector is included in the DKIM-Signature header of every signed email as the s= value. The full DNS lookup name is selector._domainkey.yourdomain.com.",
 },
 },
 {
 "@type": "Question",
 "name": "How do I find my DKIM selector?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Open any email sent from your domain and view the full email headers. Look for the DKIM-Signature header and find the s= tag — that is your selector. For example, Google Workspace typically uses 'google' as the selector, Microsoft 365 uses 'selector1' or 'selector2', and other providers use varying conventions.",
 },
 },
 {
 "@type": "Question",
 "name": "What does an empty DKIM public key (p=) mean?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "An empty p= tag in a DKIM record means the key has been revoked. This is the standard way to decommission a DKIM key — the record stays in DNS but with an empty public key value. Emails signed with a revoked key will fail DKIM verification. This is commonly done during key rotation or when migrating to a new email provider.",
 },
 },
 {
 "@type": "Question",
 "name": "Can a domain have multiple DKIM records?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Each DKIM record uses a different selector, so a domain can have as many DKIM keys as needed. This is common when a domain sends email through multiple services — each service gets its own selector and key pair. For example, your primary email might use 'google' while your marketing platform uses 'k1'.",
 },
 },
 {
 "@type": "Question",
 "name": "What key length should my DKIM key be?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "DKIM keys should be at least 1024 bits, and 2048 bits is the current recommended standard. Keys shorter than 1024 bits are considered insecure and may be rejected by receiving servers. Some providers like Google Workspace use 2048-bit keys by default. Longer keys provide stronger security but must fit within DNS TXT record size limits.",
 },
 },
 ],
};

const commonSelectors = [
 { provider: 'Google Workspace', selector: 'google', notes: 'Default selector for Gmail / Google Workspace' },
 { provider: 'Microsoft 365', selector: 'selector1, selector2', notes: 'Two selectors for automatic key rotation' },
 { provider: 'Mailchimp', selector: 'k1', notes: 'Standard DKIM selector' },
 { provider: 'SendGrid', selector: 's1, s2', notes: 'Two selectors for key rotation' },
 { provider: 'Amazon SES', selector: 'varies (CNAME-based)', notes: 'Uses unique auto-generated selectors per domain' },
 { provider: 'Postmark', selector: '20yymmdd (date-based)', notes: 'Date-stamped selectors for key rotation' },
 { provider: 'Zoho Mail', selector: 'zmail', notes: 'Default selector for Zoho' },
 { provider: 'Fastmail', selector: 'fm1, fm2, fm3', notes: 'Multiple selectors for redundancy' },
 { provider: 'Brevo (Sendinblue)', selector: 'mail', notes: 'Standard DKIM selector' },
 { provider: 'HubSpot', selector: 'hs1, hs2', notes: 'Two selectors used by HubSpot email' },
];

export default function DkimLookupPage() {
 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 {/* Hero */}
 <div className="mb-10">
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full text-xs font-medium text-emerald-700 mb-6">
 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
 Free Tool &middot; No Signup Required
 </div>
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
 DKIM Record Lookup
 </h1>
 <p className="text-lg text-gray-600 max-w-2xl">
 Enter your domain and DKIM selector to verify your public key is published correctly in DNS. Confirm that receiving servers can validate your email signatures.
 </p>
 </div>

 {/* Interactive Tool */}
 <DkimLookupClient />

 {/* What is a DKIM Record? */}
 <section className="mt-16">
 <div className="bg-white border border-gray-100 shadow-sm p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a DKIM Record?</h2>
 <div className="space-y-4 text-gray-600 leading-relaxed">
 <p>
 DKIM (DomainKeys Identified Mail) is an email authentication protocol that uses public-key cryptography to verify that an email message was sent by an authorized mail server and has not been modified in transit.
 </p>
 <p>
 When you send an email, your mail server creates a digital signature using a private key and adds it to the message headers as a <code className="px-1.5 py-0.5 bg-gray-100 text-sm font-mono">DKIM-Signature</code> header. The receiving server then looks up the corresponding public key in your domain&apos;s DNS records and uses it to verify the signature.
 </p>
 <p>
 The DKIM public key is stored as a TXT record at <code className="px-1.5 py-0.5 bg-gray-100 text-sm font-mono">selector._domainkey.yourdomain.com</code>. The selector allows you to have multiple DKIM keys for the same domain &mdash; useful when you send email through different services (e.g., your primary email provider, a marketing platform, and a transactional email service).
 </p>
 <p>
 DKIM is one of the three core email authentication protocols (alongside SPF and DMARC) required by Google and Yahoo for bulk senders since February 2024. Without a valid DKIM record, your emails are more likely to be flagged as spam or rejected entirely.
 </p>
 </div>
 </div>
 </section>

 {/* How to Find Your DKIM Selector */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 shadow-sm p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Find Your DKIM Selector</h2>
 <div className="space-y-4 text-gray-600 leading-relaxed">
 <p>
 Your DKIM selector is included in every signed email your domain sends. To find it:
 </p>
 <ol className="list-decimal list-inside space-y-3 ml-2">
 <li>Open an email sent from your domain (send one to yourself if needed).</li>
 <li>View the full email headers (in Gmail: click the three dots &rarr; &quot;Show original&quot;).</li>
 <li>
 Search for the <code className="px-1.5 py-0.5 bg-gray-100 text-sm font-mono">DKIM-Signature</code> header.
 </li>
 <li>
 Find the <code className="px-1.5 py-0.5 bg-gray-100 text-sm font-mono">s=</code> tag &mdash; that value is your selector.
 </li>
 </ol>
 <div className="mt-4 bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-x-auto">
 <span className="text-gray-500">DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;</span><br />
 &nbsp;&nbsp;<span className="text-gray-500">d=example.com;</span> <span className="text-yellow-300">s=google;</span><br />
 &nbsp;&nbsp;<span className="text-gray-500">h=from:to:subject:date:message-id; ...</span>
 </div>
 <p className="text-sm text-gray-500 mt-2">
 In this example, the selector is <strong className="text-gray-700">google</strong>. The full DNS lookup would be <code className="px-1.5 py-0.5 bg-gray-100 text-sm font-mono">google._domainkey.example.com</code>.
 </p>
 </div>
 </div>
 </section>

 {/* Common DKIM Selectors by Provider */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 shadow-sm p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Common DKIM Selectors by Provider</h2>
 <p className="text-gray-600 mb-6">
 If you are not sure which selector your provider uses, try these common defaults:
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-3 px-4 font-semibold text-gray-900">Provider</th>
 <th className="text-left py-3 px-4 font-semibold text-gray-900">Selector(s)</th>
 <th className="text-left py-3 px-4 font-semibold text-gray-900 hidden md:table-cell">Notes</th>
 </tr>
 </thead>
 <tbody>
 {commonSelectors.map((row) => (
 <tr key={row.provider} className="border-b border-gray-50 hover:bg-gray-50/50">
 <td className="py-3 px-4 text-gray-900 font-medium">{row.provider}</td>
 <td className="py-3 px-4">
 <code className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-mono">{row.selector}</code>
 </td>
 <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{row.notes}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </section>

 {/* How to Read DKIM Results */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 shadow-sm p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Read DKIM Results</h2>
 <div className="space-y-4 text-gray-600 leading-relaxed">
 <p>
 A DKIM TXT record contains several tag-value pairs. Here are the key fields to understand:
 </p>
 <div className="space-y-4 mt-4">
 <div className="p-4 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-3">
 <code className="px-2 py-1 bg-emerald-100 text-emerald-800 font-mono text-sm font-bold shrink-0">v=DKIM1</code>
 <div>
 <p className="font-semibold text-gray-900 text-sm">Version</p>
 <p className="text-sm text-gray-600">Identifies this as a DKIM record. Always set to DKIM1.</p>
 </div>
 </div>
 </div>
 <div className="p-4 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-3">
 <code className="px-2 py-1 bg-emerald-100 text-emerald-800 font-mono text-sm font-bold shrink-0">k=rsa</code>
 <div>
 <p className="font-semibold text-gray-900 text-sm">Key Type</p>
 <p className="text-sm text-gray-600">The cryptographic algorithm used. RSA is the most common. Ed25519 is a newer, more efficient alternative.</p>
 </div>
 </div>
 </div>
 <div className="p-4 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-3">
 <code className="px-2 py-1 bg-emerald-100 text-emerald-800 font-mono text-sm font-bold shrink-0">p=MIIBIj...</code>
 <div>
 <p className="font-semibold text-gray-900 text-sm">Public Key</p>
 <p className="text-sm text-gray-600">The base64-encoded public key used to verify signatures. An empty <code className="px-1 py-0.5 bg-gray-100 text-xs">p=</code> means the key has been revoked.</p>
 </div>
 </div>
 </div>
 <div className="p-4 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-3">
 <code className="px-2 py-1 bg-emerald-100 text-emerald-800 font-mono text-sm font-bold shrink-0">t=y</code>
 <div>
 <p className="font-semibold text-gray-900 text-sm">Flags</p>
 <p className="text-sm text-gray-600"><code className="px-1 py-0.5 bg-gray-100 text-xs">t=y</code> means the domain is testing DKIM (receivers should treat failures leniently). <code className="px-1 py-0.5 bg-gray-100 text-xs">t=s</code> means strict mode &mdash; the signing domain must exactly match the From header domain.</p>
 </div>
 </div>
 </div>
 <div className="p-4 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-3">
 <code className="px-2 py-1 bg-emerald-100 text-emerald-800 font-mono text-sm font-bold shrink-0">n=...</code>
 <div>
 <p className="font-semibold text-gray-900 text-sm">Notes</p>
 <p className="text-sm text-gray-600">Optional human-readable notes about the key. Not used for verification.</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* FAQ */}
 <section className="mt-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
 <div className="space-y-4">
 {[
 {
 q: 'What is a DKIM record?',
 a: 'A DKIM (DomainKeys Identified Mail) record is a DNS TXT record containing a public cryptographic key. When you send an email, your mail server signs the message with a private key. The receiving server looks up this DKIM record, retrieves the public key, and uses it to verify the signature — confirming the email is authentic and unaltered.',
 },
 {
 q: 'What is a DKIM selector?',
 a: 'A DKIM selector is a string that identifies which DKIM key to use for verification. It allows a domain to have multiple DKIM keys for different mail systems. The selector appears in the DKIM-Signature email header as the s= value, and the full DNS name is selector._domainkey.yourdomain.com.',
 },
 {
 q: 'How do I find my DKIM selector?',
 a: 'Open any email sent from your domain and view the full headers. Look for the DKIM-Signature header and find the s= tag. Common selectors include "google" for Google Workspace, "selector1" or "selector2" for Microsoft 365, and "k1" for Mailchimp.',
 },
 {
 q: 'What does an empty DKIM public key (p=) mean?',
 a: 'An empty p= tag means the DKIM key has been revoked. The record stays in DNS but without a public key value, so emails signed with this key will fail DKIM verification. This is the standard method for decommissioning a DKIM key during rotation or provider migration.',
 },
 {
 q: 'Can a domain have multiple DKIM records?',
 a: 'Yes. Each DKIM record uses a different selector, so a domain can publish as many DKIM keys as needed. This is common when sending through multiple services — each gets its own selector and key pair.',
 },
 {
 q: 'What key length should my DKIM key be?',
 a: 'DKIM keys should be at least 1024 bits, and 2048 bits is the current recommended standard. Keys shorter than 1024 bits are considered insecure. Some providers like Google Workspace default to 2048-bit keys. Longer keys are more secure but must fit within DNS TXT record size limits.',
 },
 ].map((faq) => (
 <details key={faq.q} className="group bg-white border border-gray-100 shadow-sm">
 <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
 <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
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
 <section className="mt-12">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Related Tools</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 title: 'DKIM Record Generator',
 description: 'Generate a properly formatted DKIM TXT record with your public key and preferred settings.',
 href: '/tools/dkim-generator',
 color: 'emerald',
 },
 {
 title: 'SPF Record Lookup',
 description: 'Check if your domain has a valid SPF record and see all authorized sending servers.',
 href: '/tools/spf-lookup',
 color: 'blue',
 },
 {
 title: 'DMARC Record Lookup',
 description: 'Check your DMARC policy and see how unauthenticated emails are handled.',
 href: '/tools/dmarc-lookup',
 color: 'purple',
 },
 ].map((tool) => (
 <Link
 key={tool.href}
 href={tool.href}
 className={`group block p-6 bg-white border border-gray-100 hover:border-${tool.color}-200 hover:shadow-lg transition-all duration-300`}
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors text-sm">{tool.title}</h3>
 <p className="text-xs text-gray-500">{tool.description}</p>
 </Link>
 ))}
 </div>
 </section>

 {/* Related Reading */}
 <section className="mt-8">
 <h2 className="text-xl font-bold text-gray-900 mb-6">Related Reading</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Link
 href="/blog/spf-dkim-dmarc-explained"
 className="group block p-6 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">SPF, DKIM & DMARC Setup Guide</h3>
 <p className="text-xs text-gray-500">Step-by-step DNS authentication setup for outbound email teams. Covers all three protocols in detail.</p>
 </Link>
 </div>
 </section>

 {/* CTA */}
 <section className="mt-12 mb-8">
 <div className="bg-white border border-gray-100 shadow-sm p-8 md:p-10 text-center">
 <h2 className="text-xl font-bold text-gray-900 mb-3">Monitor DKIM Across All Your Domains</h2>
 <p className="text-gray-600 text-sm max-w-lg mx-auto mb-6">
 This free tool checks one record at a time. Superkabe monitors DKIM, SPF, and DMARC across all your sending domains automatically &mdash; every 24 hours &mdash; and alerts you before misconfigurations damage deliverability.
 </p>
 <Link
 href="/signup"
 className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
 >
 Start free trial
 </Link>
 </div>
 </section>
 </>
 );
}

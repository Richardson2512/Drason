import type { Metadata } from 'next';
import Link from 'next/link';
import DkimGeneratorClient from './DkimGeneratorClient';

export const metadata: Metadata = {
 title: 'Free DKIM Record Generator – Create Your DKIM TXT Record',
 description: 'Free DKIM record generator tool. Configure your selector, paste your public key, and generate a properly formatted DKIM TXT record for your domain DNS.',
 openGraph: {
 title: 'Free DKIM Record Generator – Create Your DKIM TXT Record',
 description: 'Free DKIM record generator tool. Configure your selector, paste your public key, and generate a properly formatted DKIM TXT record for your domain DNS.',
 url: '/tools/dkim-generator',
 siteName: 'Superkabe',
 type: 'website',
 },
 alternates: {
 canonical: '/tools/dkim-generator',
 },
};

export default function DkimGeneratorPage() {
 const webAppSchema = {
 "@context": "https://schema.org",
 "@type": "WebApplication",
 "name": "Free DKIM Record Generator",
 "description": "Generate a properly formatted DKIM TXT record for your domain DNS. Configure selector, public key, key type, and flags.",
 "url": "https://www.superkabe.com/tools/dkim-generator",
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
 "name": "How to Generate a DKIM Record",
 "description": "Create a properly formatted DKIM TXT record for your domain in four steps.",
 "step": [
 {
 "@type": "HowToStep",
 "position": 1,
 "name": "Choose your selector",
 "text": "Enter the DKIM selector name. This is typically provided by your email service (e.g., 'google' for Google Workspace, 's1' for Microsoft 365, or 'default').",
 },
 {
 "@type": "HowToStep",
 "position": 2,
 "name": "Paste your public key",
 "text": "Copy the DKIM public key from your email provider's admin panel and paste it into the public key field. The key should be base64-encoded.",
 },
 {
 "@type": "HowToStep",
 "position": 3,
 "name": "Configure options",
 "text": "Select the key type (RSA or Ed25519), enable testing mode if you want to test before enforcing, and set strict alignment if needed.",
 },
 {
 "@type": "HowToStep",
 "position": 4,
 "name": "Copy the generated record",
 "text": "Copy the generated DKIM TXT record and add it to your domain's DNS settings at the specified record name.",
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
 "text": "A DKIM (DomainKeys Identified Mail) record is a DNS TXT record that publishes the public key used to verify DKIM signatures on outgoing emails. When an email is sent, the sending server signs it with a private key. The receiving server looks up the corresponding public key in DNS to verify the signature, confirming the email is authentic and unaltered.",
 },
 },
 {
 "@type": "Question",
 "name": "What is a DKIM selector?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "A DKIM selector is a label that identifies which DKIM key pair to use. It allows a domain to have multiple DKIM keys for different email services. The selector appears in the DNS record name as selector._domainkey.yourdomain.com. Common selectors include 'google' for Google Workspace, 's1' or 's2' for Microsoft 365, and 'default' for many other providers.",
 },
 },
 {
 "@type": "Question",
 "name": "Where do I find my DKIM public key?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Your DKIM public key is provided by your email service. In Google Workspace, go to Admin > Apps > Google Workspace > Gmail > Authenticate email. In Microsoft 365, go to the Defender portal under Email authentication > DKIM. For third-party senders like SendGrid or Smartlead, check their DNS authentication or domain verification settings.",
 },
 },
 {
 "@type": "Question",
 "name": "Should I enable DKIM testing mode?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Testing mode (t=y) tells receiving servers to treat DKIM signature failures as non-fatal. Use it when you first set up DKIM to verify everything works before enforcing. Once you confirm emails are signing correctly, remove the testing flag so receiving servers fully enforce DKIM verification.",
 },
 },
 {
 "@type": "Question",
 "name": "What is the difference between RSA and Ed25519 DKIM keys?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "RSA is the standard DKIM key type supported by virtually all mail servers. Ed25519 is a newer algorithm that produces shorter signatures and is faster, but has limited support among receiving servers. Most domains should use RSA (2048-bit) unless you have confirmed that your recipients' mail servers support Ed25519.",
 },
 },
 ],
 };

 const faqs = [
 {
 q: 'What is a DKIM record?',
 a: 'A DKIM (DomainKeys Identified Mail) record is a DNS TXT record that publishes the public key used to verify DKIM signatures on outgoing emails. When an email is sent, the sending server signs it with a private key. The receiving server looks up the corresponding public key in DNS to verify the signature, confirming the email is authentic and unaltered.',
 },
 {
 q: 'What is a DKIM selector?',
 a: 'A DKIM selector is a label that identifies which DKIM key pair to use. It allows a domain to have multiple DKIM keys for different email services. The selector appears in the DNS record name as selector._domainkey.yourdomain.com. Common selectors include "google" for Google Workspace, "s1" or "s2" for Microsoft 365, and "default" for many other providers.',
 },
 {
 q: 'Where do I find my DKIM public key?',
 a: 'Your DKIM public key is provided by your email service. In Google Workspace, go to Admin > Apps > Google Workspace > Gmail > Authenticate email. In Microsoft 365, go to the Defender portal under Email authentication > DKIM. For third-party senders like SendGrid or Smartlead, check their DNS authentication or domain verification settings.',
 },
 {
 q: 'Should I enable DKIM testing mode?',
 a: 'Testing mode (t=y) tells receiving servers to treat DKIM signature failures as non-fatal. Use it when you first set up DKIM to verify everything works before enforcing. Once you confirm emails are signing correctly, remove the testing flag so receiving servers fully enforce DKIM verification.',
 },
 {
 q: 'What is the difference between RSA and Ed25519 DKIM keys?',
 a: 'RSA is the standard DKIM key type supported by virtually all mail servers. Ed25519 is a newer algorithm that produces shorter signatures and is faster, but has limited support among receiving servers. Most domains should use RSA (2048-bit) unless you have confirmed that your recipients\' mail servers support Ed25519.',
 },
 ];

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 {/* Header */}
 <div className="mb-10">
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700 mb-6">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
 </svg>
 DKIM Generator
 </div>
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
 Free DKIM Record Generator
 </h1>
 <p className="text-lg text-gray-600 leading-relaxed">
 Configure your selector, paste your public key, and generate a properly formatted DKIM TXT record ready to add to your domain&apos;s DNS.
 </p>
 </div>

 {/* Interactive Generator */}
 <DkimGeneratorClient />

 {/* What is a DKIM Record? */}
 <section className="mt-16">
 <div className="bg-white border border-gray-100 p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a DKIM Record?</h2>
 <div className="space-y-4 text-gray-600 leading-relaxed">
 <p>
 DKIM (DomainKeys Identified Mail) is an email authentication protocol that uses public-key cryptography to verify that an email was sent by an authorized server and has not been modified in transit. It works by adding a digital signature to the email header, which the receiving mail server validates against a public key published in DNS.
 </p>
 <p>
 The DKIM record itself is a DNS TXT record that contains the public key. When a receiving server gets an email with a DKIM signature, it queries DNS for the public key using the selector and domain from the signature header, then uses that key to verify the signature. A valid signature confirms both authenticity and integrity.
 </p>
 <p>
 Since February 2024, Google and Yahoo require DKIM authentication for all bulk senders. Without a valid DKIM record, your emails are more likely to be flagged as spam or rejected outright. DKIM also contributes to DMARC alignment, which is required for full email authentication compliance.
 </p>
 </div>
 </div>
 </section>

 {/* DKIM Record Fields Explained */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">DKIM Record Fields Explained</h2>
 <div className="space-y-6">
 <div className="p-5 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-4">
 <code className="shrink-0 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold">v=DKIM1</code>
 <div>
 <h3 className="font-semibold text-gray-900 mb-1">Version</h3>
 <p className="text-sm text-gray-600">Identifies the record as a DKIM key record. This tag is required and must be the first tag in the record. The only valid value is <code className="text-xs bg-gray-200 px-1 ">DKIM1</code>.</p>
 </div>
 </div>
 </div>

 <div className="p-5 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-4">
 <code className="shrink-0 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold">k=rsa</code>
 <div>
 <h3 className="font-semibold text-gray-900 mb-1">Key Type</h3>
 <p className="text-sm text-gray-600">Specifies the cryptographic algorithm used. <code className="text-xs bg-gray-200 px-1 ">rsa</code> is the standard and universally supported. <code className="text-xs bg-gray-200 px-1 ">ed25519</code> is newer and produces shorter keys but has limited receiver support.</p>
 </div>
 </div>
 </div>

 <div className="p-5 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-4">
 <code className="shrink-0 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold">p=...</code>
 <div>
 <h3 className="font-semibold text-gray-900 mb-1">Public Key</h3>
 <p className="text-sm text-gray-600">The base64-encoded public key data. This is the key that receiving servers use to verify DKIM signatures. An empty <code className="text-xs bg-gray-200 px-1 ">p=</code> value means the key has been revoked.</p>
 </div>
 </div>
 </div>

 <div className="p-5 bg-gray-50 border border-gray-100">
 <div className="flex items-start gap-4">
 <code className="shrink-0 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold">t=y / t=s</code>
 <div>
 <h3 className="font-semibold text-gray-900 mb-1">Flags</h3>
 <p className="text-sm text-gray-600"><code className="text-xs bg-gray-200 px-1 ">t=y</code> indicates testing mode &mdash; failures should not cause rejection. <code className="text-xs bg-gray-200 px-1 ">t=s</code> enforces strict alignment, requiring the signing domain to exactly match the From header domain (no subdomains).</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* How to Get Your DKIM Public Key */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Get Your DKIM Public Key</h2>
 <div className="space-y-4 text-gray-600 leading-relaxed">
 <p>
 Your DKIM public key is generated by your email service provider. You do not create this key yourself &mdash; you copy it from your provider&apos;s admin panel and publish it in your DNS. Here is where to find it in common providers:
 </p>
 </div>
 </div>
 </section>

 {/* Provider-Specific Setup */}
 <section className="mt-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Provider-Specific Setup</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 bg-emerald-50/50 border border-emerald-100">
 <h3 className="font-bold text-gray-900 mb-3">Google Workspace</h3>
 <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
 <li>Go to Admin Console &rarr; Apps &rarr; Google Workspace &rarr; Gmail</li>
 <li>Click &quot;Authenticate email&quot;</li>
 <li>Select your domain and click &quot;Generate new record&quot;</li>
 <li>Copy the TXT record value (selector is usually <code className="text-xs bg-white px-1 ">google</code>)</li>
 </ol>
 </div>

 <div className="p-6 bg-emerald-50/50 border border-emerald-100">
 <h3 className="font-bold text-gray-900 mb-3">Microsoft 365</h3>
 <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
 <li>Go to Microsoft Defender portal &rarr; Email authentication</li>
 <li>Select DKIM and choose your domain</li>
 <li>Click &quot;Create DKIM keys&quot;</li>
 <li>Publish both CNAME records (selectors <code className="text-xs bg-white px-1 ">selector1</code> and <code className="text-xs bg-white px-1 ">selector2</code>)</li>
 </ol>
 </div>

 <div className="p-6 bg-emerald-50/50 border border-emerald-100">
 <h3 className="font-bold text-gray-900 mb-3">Smartlead</h3>
 <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
 <li>Go to Settings &rarr; Email Accounts</li>
 <li>Select your email account and click &quot;DNS Settings&quot;</li>
 <li>Copy the DKIM TXT record provided</li>
 <li>Add it to your domain DNS with the specified selector</li>
 </ol>
 </div>

 <div className="p-6 bg-emerald-50/50 border border-emerald-100">
 <h3 className="font-bold text-gray-900 mb-3">SendGrid</h3>
 <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
 <li>Go to Settings &rarr; Sender Authentication</li>
 <li>Click &quot;Authenticate Your Domain&quot;</li>
 <li>Follow the wizard to generate DNS records</li>
 <li>SendGrid uses CNAME records (selectors <code className="text-xs bg-white px-1 ">s1</code> and <code className="text-xs bg-white px-1 ">s2</code>)</li>
 </ol>
 </div>
 </div>
 </div>
 </section>

 {/* FAQ */}
 <section className="mt-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
 <div className="space-y-4">
 {faqs.map((faq) => (
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
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tools</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 { title: 'DKIM Record Lookup', description: 'Verify your DKIM DNS record is published correctly.', href: '/tools/dkim-lookup', color: 'emerald' },
 { title: 'SPF Record Generator', description: 'Generate a properly formatted SPF TXT record.', href: '/tools/spf-generator', color: 'blue' },
 { title: 'DMARC Record Generator', description: 'Generate a DMARC TXT record with your preferred policy.', href: '/tools/dmarc-generator', color: 'purple' },
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
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Link
 href="/blog/spf-dkim-dmarc-explained"
 className="group block p-6 bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
 >
 <h3 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors text-sm">SPF, DKIM &amp; DMARC Setup Guide</h3>
 <p className="text-xs text-gray-500">Step-by-step DNS authentication setup for outbound email teams.</p>
 </Link>
 </div>
 </section>

 {/* CTA */}
 <section className="mt-12 mb-8">
 <div className="bg-white border border-gray-100 p-8 md:p-10">
 <h2 className="text-xl font-bold text-gray-900 mb-3">Monitor DKIM Across All Your Domains</h2>
 <p className="text-gray-600 mb-6 leading-relaxed">
 This free tool generates DKIM records on demand. Superkabe monitors DKIM, SPF, and DMARC across all your sending domains automatically &mdash; every 24 hours &mdash; and alerts you before misconfigurations cause deliverability failures.
 </p>
 <Link
 href="/signup"
 className="inline-block px-6 py-3 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
 >
 Start free trial
 </Link>
 </div>
 </section>
 </>
 );
}

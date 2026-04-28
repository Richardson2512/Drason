import Link from 'next/link';

import type { Metadata } from 'next';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

export const metadata: Metadata = {
 title: "Free DKIM Record Lookup Tool – Verify Your Email Signatures",
 description: "Use our free DKIM lookup tool to verify your domain's DKIM signatures. Find missing keys, wrong selectors, and weak key lengths before they cause.",
 openGraph: {
 title: "Free DKIM Record Lookup Tool – Verify Your Email Signatures",
 description: "Use our free DKIM lookup tool to verify your domain's DKIM signatures. Find missing keys, wrong selectors, and weak key lengths before they cause.",
 url: '/blog/free-dkim-lookup-tool',
 siteName: 'Superkabe',
 type: 'article',
 publishedTime: '2026-04-09',
 },
 twitter: {
     card: 'summary_large_image',
     title: 'Free DKIM Record Lookup Tool – Verify Your Email Signatures',
     description: 'Use our free DKIM lookup tool to verify your domain',
     images: ['/image/og-image.png'],
 },
 alternates: {
 canonical: '/blog/free-dkim-lookup-tool',
 },
};

export default function FreeDkimLookupToolArticle() {
 const blogPostingSchema = {
 "@context": "https://schema.org",
 "@type": "BlogPosting",
 "headline": "Free DKIM Record Lookup Tool – Verify Your Email Signatures",
 "description": "Use our free DKIM lookup tool to verify your domain's DKIM signatures. Find missing keys, wrong selectors, and weak key lengths before they cause deliverability failures.",
 "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Deliverability Specialist", "url": "https://www.superkabe.com" },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 "datePublished": "2026-04-09",
 "dateModified": "2026-04-09",
        "image": { "@type": "ImageObject", "url": "https://www.superkabe.com/image/og-image.png", "width": 1200, "height": 630 },
 "mainEntityOfPage": {
 "@type": "WebPage",
 "@id": "https://www.superkabe.com/blog/free-dkim-lookup-tool"
 }
 };

 const howToSchema = {
 "@context": "https://schema.org",
 "@type": "HowTo",
 "name": "How to Look Up Your Domain's DKIM Record",
 "description": "Step-by-step guide to using the free DKIM lookup tool to verify your domain's email signatures.",
 "step": [
 { "@type": "HowToStep", "position": 1, "name": "Enter Your Domain", "text": "Navigate to the DKIM Lookup Tool and enter your sending domain name." },
 { "@type": "HowToStep", "position": 2, "name": "Enter Your DKIM Selector", "text": "Enter the DKIM selector used by your email provider (e.g., 'google' for Google Workspace, 's1' for Microsoft 365)." },
 { "@type": "HowToStep", "position": 3, "name": "Run the Lookup", "text": "Click the lookup button to query the DKIM TXT record at selector._domainkey.yourdomain.com." },
 { "@type": "HowToStep", "position": 4, "name": "Verify the Key", "text": "Check that the DKIM key is present, uses RSA with at least 1024-bit length (2048-bit recommended), and the record syntax is valid." }
 ]
 };

 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "What is a DKIM selector and how do I find mine?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "A DKIM selector is a prefix used to locate your DKIM public key in DNS. The full DNS lookup is selector._domainkey.yourdomain.com. Each email provider uses different selectors: Google Workspace uses 'google', Microsoft 365 uses 'selector1' and 'selector2', SendGrid uses 's1' and 's2', and Smartlead uses provider-specific selectors. You can find your selector by examining the DKIM-Signature header in any email sent from your domain."
 }
 },
 {
 "@type": "Question",
 "name": "What happens if my DKIM record is missing?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "If your DKIM record is missing from DNS, receiving servers cannot verify the cryptographic signatures on your emails. This means DKIM authentication will fail for every email sent from your domain. While emails may still deliver if SPF passes, the lack of DKIM weakens your overall authentication posture and can negatively impact your sender reputation."
 }
 },
 {
 "@type": "Question",
 "name": "What is the recommended DKIM key length?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "The recommended DKIM key length is 2048 bits. While 1024-bit keys are still accepted by most receivers, they are considered weak by modern cryptographic standards. Google recommends 2048-bit keys and some security-focused receivers may penalize shorter key lengths. If your current key is 1024-bit, you should rotate to a 2048-bit key."
 }
 },
 {
 "@type": "Question",
 "name": "Can I have multiple DKIM records for the same domain?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Unlike SPF (which must have exactly one record), you can have multiple DKIM records on a single domain by using different selectors. Each email provider typically uses its own selector, so Google Workspace, Smartlead, and SendGrid can each have their own DKIM key on the same domain without conflict."
 }
 },
 {
 "@type": "Question",
 "name": "How do I check DKIM for emails sent through Google Workspace?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "For Google Workspace, the default DKIM selector is 'google'. Use the DKIM lookup tool with your domain and the selector 'google' to check if your DKIM key is published. If you generated a custom DKIM key in the Google Admin Console, you may have chosen a different selector prefix — check your admin settings to confirm."
 }
 },
 {
 "@type": "Question",
 "name": "How often should I rotate my DKIM keys?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "DKIM key rotation is recommended every 6 to 12 months for security best practices. However, the more critical concern for outbound teams is ensuring the key exists and is valid. If you are still using a 1024-bit key, rotate to 2048-bit immediately. Superkabe monitors DKIM key presence and validity continuously so you are alerted before issues arise."
 }
 }
 ]
 };

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog"}, {"@type": "ListItem", "position": 3, "name": "Free DKIM Record Lookup Tool – Verify Your Email Signatures", "item": "https://www.superkabe.com/blog/free-dkim-lookup-tool"}]}) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 <article>
 <BlogHeader
 tag="Free Tools"
 title="Free DKIM Record Lookup Tool — Verify Your Email Signatures Are Valid"
 dateModified="2026-04-25"
 authorName="Robert Smith"
 authorRole="Deliverability Specialist · Superkabe"
 />

 <FeaturedHero
 badge="FREE TOOLS · 2026"
 eyebrow="9 min read"
 tagline="Verify your DKIM in seconds"
 sub="Lookup · Selectors · Key length · Provider matrix"
 />

 <p className="text-lg text-gray-700 leading-relaxed mb-12">
 DKIM proves that every email you send is authentic and unaltered. If your DKIM key is missing, expired, or misconfigured, your emails lose their cryptographic seal of trust. Use our <Link href="/tools/dkim-lookup" className="underline">free DKIM lookup tool</Link> to verify your domain&apos;s signatures in seconds.
 </p>

 {/* Key Takeaways */}
 <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
 <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
 <ul className="space-y-2 text-blue-800 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> DKIM adds a cryptographic signature to every outgoing email, proving authenticity</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> You need both a domain name and a selector to look up a DKIM record</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Use 2048-bit RSA keys &mdash; 1024-bit keys are considered weak</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Each email provider uses its own selector (Google: &quot;google&quot;, Microsoft: &quot;selector1&quot;)</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Missing DKIM keys weaken your entire authentication stack, even if SPF passes</li>
 </ul>
 </div>


 <div className="prose prose-lg max-w-none">
 <p className="text-lg text-gray-600 leading-relaxed mb-8">
 DKIM (DomainKeys Identified Mail) is the cryptographic layer of email authentication. While <Link href="/blog/free-spf-lookup-tool" className="text-blue-600 hover:underline">SPF</Link> verifies that an email came from an authorized server, DKIM proves that the email itself was authorized by the domain owner and was not tampered with during transit. For outbound email teams, a missing or broken DKIM record means your emails lack a critical trust signal that ISPs use for inbox placement decisions.
 </p>

 <h2 id="what-is-dkim" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Is DKIM and How Do Email Signatures Work?</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DKIM uses public-key cryptography to authenticate email messages. When you send an email, your mail server signs specific headers and the message body using a private key. This generates a unique cryptographic signature that is added to the email as a <code className="bg-gray-100 px-1.5 py-0.5 text-sm">DKIM-Signature</code> header.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 The receiving server then looks up your DKIM public key in DNS &mdash; at a location determined by the selector and domain in the signature header &mdash; and uses that key to verify the signature. If the signature validates, the receiving server knows two things: the email was authorized by the domain owner, and the message content was not modified after signing.
 </p>

 <div className="bg-gray-900 text-green-400 p-6 mb-8 font-mono text-sm overflow-x-auto">
 <p className="text-gray-500 mb-2"># DKIM-Signature header in an email</p>
 <p>DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;</p>
 <p>&nbsp;&nbsp;d=yourdomain.com; s=google;</p>
 <p>&nbsp;&nbsp;h=from:to:subject:date:message-id;</p>
 <p>&nbsp;&nbsp;bh=base64encodedBodyHash;</p>
 <p>&nbsp;&nbsp;b=base64encodedSignature</p>
 </div>

 <p className="text-gray-600 leading-relaxed mb-6">
 The <code className="bg-gray-100 px-1.5 py-0.5 text-sm">d=</code> tag specifies the signing domain, and the <code className="bg-gray-100 px-1.5 py-0.5 text-sm">s=</code> tag specifies the selector. Together, they tell the receiving server to look up the public key at <code className="bg-gray-100 px-1.5 py-0.5 text-sm">selector._domainkey.domain.com</code>. This is the exact record our <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM lookup tool</Link> queries.
 </p>

 <h2 id="finding-selector" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How to Find Your DKIM Selector</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 Unlike SPF and DMARC, DKIM records are not published at a fixed location. You need to know the selector to find the record. Here are three ways to find your DKIM selector:
 </p>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Method 1: Check Your Email Headers</h3>
 <p className="text-gray-600 text-sm mb-3">
 Send a test email from your domain, then view the full headers (in Gmail: click the three dots &rarr; &quot;Show original&quot;). Look for the <code className="bg-gray-100 px-1 text-xs">DKIM-Signature</code> header and find the <code className="bg-gray-100 px-1 text-xs">s=</code> tag. The value after <code className="bg-gray-100 px-1 text-xs">s=</code> is your selector.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Method 2: Check Your Email Provider&apos;s Admin Console</h3>
 <p className="text-gray-600 text-sm mb-3">
 Most email providers display the DKIM selector in their admin settings. In Google Admin Console, navigate to Apps &rarr; Google Workspace &rarr; Gmail &rarr; Authenticate email. For Microsoft 365, check the Exchange admin center under Mail flow &rarr; DKIM.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Method 3: Try Common Selectors</h3>
 <p className="text-gray-600 text-sm">
 If you cannot access headers or admin settings, try the common selectors for your provider using our <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM lookup tool</Link>. See the provider-specific selectors table below.
 </p>
 </div>

 <h2 id="how-to-use-tool" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How to Use the Free DKIM Lookup Tool</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 Our <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">free DKIM lookup tool</Link> queries your domain&apos;s DNS to find and validate your DKIM public key. Here&apos;s how to use it:
 </p>

 <ol className="space-y-4 text-gray-600 mb-8 list-decimal pl-5">
 <li><strong>Enter your domain</strong> &mdash; Type the domain you want to check (e.g., <code className="bg-gray-100 px-1.5 py-0.5 text-sm">yourdomain.com</code>).</li>
 <li><strong>Enter your DKIM selector</strong> &mdash; Type the selector used by your email provider (e.g., <code className="bg-gray-100 px-1.5 py-0.5 text-sm">google</code> for Google Workspace).</li>
 <li><strong>Run the lookup</strong> &mdash; The tool queries the TXT record at <code className="bg-gray-100 px-1.5 py-0.5 text-sm">selector._domainkey.yourdomain.com</code>.</li>
 <li><strong>Review the results</strong> &mdash; The tool displays the full DKIM record, key type, key length, and any issues detected.</li>
 </ol>

 <p className="text-gray-600 leading-relaxed mb-6">
 If your DKIM record is missing or needs to be created, use the <Link href="/tools/dkim-generator" className="text-blue-600 hover:underline">DKIM Generator tool</Link> to create a properly formatted record.
 </p>

 <h2 id="common-dkim-problems" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Common DKIM Problems and How to Fix Them</h2>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">Problem 1: Missing DKIM Key</h3>
 <p className="text-gray-600 text-sm mb-3">
 The most common DKIM issue is simply not having a public key published in DNS. This happens when you set up a domain but skip the DKIM configuration step, or when you migrate DNS providers and the DKIM TXT record is not transferred. Without the public key in DNS, every DKIM signature on your emails will fail verification.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>Fix:</strong> Generate a DKIM key pair through your email provider&apos;s admin console. Publish the public key as a TXT record in DNS at <code className="bg-gray-100 px-1 text-xs">selector._domainkey.yourdomain.com</code>. Verify it is published correctly using the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM lookup tool</Link>.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">Problem 2: Key Too Short (1024-bit)</h3>
 <p className="text-gray-600 text-sm mb-3">
 While 1024-bit RSA keys are technically still valid, they are considered cryptographically weak. Google recommends 2048-bit keys, and some security-conscious organizations may penalize emails signed with shorter keys. If your DKIM lookup shows a 1024-bit key, you should plan a key rotation.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>Fix:</strong> Generate a new 2048-bit DKIM key pair through your email provider. Publish the new public key in DNS alongside the old one (using a new selector). Update your mail server to sign with the new key. After confirming all emails use the new signature, remove the old key.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">Problem 3: Wrong Selector</h3>
 <p className="text-gray-600 text-sm mb-3">
 If the selector in the email&apos;s DKIM-Signature header does not match a published DKIM record in DNS, verification fails. This happens when teams publish the key under the wrong selector name, or when an email provider changes selectors and the DNS record is not updated.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>Fix:</strong> Check the DKIM-Signature header in a test email to confirm the exact selector being used. Then verify that a DKIM TXT record exists at that exact <code className="bg-gray-100 px-1 text-xs">selector._domainkey.yourdomain.com</code> location.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">Problem 4: DNS Record Truncation</h3>
 <p className="text-gray-600 text-sm mb-3">
 DKIM public keys, especially 2048-bit keys, can be long enough that some DNS providers truncate the TXT record. A truncated key will fail verification because the public key data is incomplete. This is particularly common with older DNS management interfaces.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>Fix:</strong> Split the DKIM key into multiple strings within a single TXT record (most DNS providers support this). Verify the full key is published by using the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM lookup tool</Link>.
 </p>
 </div>

 <h2 id="provider-selectors" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Provider-Specific DKIM Selectors</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 Each email provider uses different default DKIM selectors. When using the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM lookup tool</Link>, try these common selectors for your provider:
 </p>

 <div className="overflow-x-auto mb-8">
 <table className="w-full text-sm border-collapse">
 <thead>
 <tr className="bg-gray-50">
 <th className="text-left p-3 font-bold text-gray-900 border-b border-gray-200">Provider</th>
 <th className="text-left p-3 font-bold text-gray-900 border-b border-gray-200">Common Selectors</th>
 <th className="text-left p-3 font-bold text-gray-900 border-b border-gray-200">Notes</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td className="p-3 text-gray-600 border-b border-gray-100">Google Workspace</td>
 <td className="p-3 text-gray-600 border-b border-gray-100"><code className="bg-gray-100 px-1 text-xs">google</code></td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Default selector; custom prefix possible via Admin Console</td>
 </tr>
 <tr>
 <td className="p-3 text-gray-600 border-b border-gray-100">Microsoft 365</td>
 <td className="p-3 text-gray-600 border-b border-gray-100"><code className="bg-gray-100 px-1 text-xs">selector1</code>, <code className="bg-gray-100 px-1 text-xs">selector2</code></td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Two selectors for key rotation; both should be published</td>
 </tr>
 <tr>
 <td className="p-3 text-gray-600 border-b border-gray-100">SendGrid</td>
 <td className="p-3 text-gray-600 border-b border-gray-100"><code className="bg-gray-100 px-1 text-xs">s1</code>, <code className="bg-gray-100 px-1 text-xs">s2</code></td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Uses CNAME records pointing to SendGrid&apos;s DKIM keys</td>
 </tr>
 <tr>
 <td className="p-3 text-gray-600 border-b border-gray-100">Mailgun</td>
 <td className="p-3 text-gray-600 border-b border-gray-100"><code className="bg-gray-100 px-1 text-xs">smtp</code>, <code className="bg-gray-100 px-1 text-xs">k1</code></td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Varies by setup; check Mailgun domain settings</td>
 </tr>
 <tr>
 <td className="p-3 text-gray-600 border-b border-gray-100">Postmark</td>
 <td className="p-3 text-gray-600 border-b border-gray-100"><code className="bg-gray-100 px-1 text-xs">20yymmdd</code></td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Date-based selectors; check Postmark sender signatures</td>
 </tr>
 <tr>
 <td className="p-3 text-gray-600 border-b border-gray-100">Smartlead</td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Provider-specific</td>
 <td className="p-3 text-gray-600 border-b border-gray-100">Check Smartlead domain configuration for exact selector</td>
 </tr>
 </tbody>
 </table>
 </div>

 <h2 id="dkim-in-auth-stack" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How DKIM Fits Into the Authentication Stack</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DKIM is the second layer of the three-part email authentication system. While <Link href="/tools/spf-lookup" className="text-blue-600 hover:underline">SPF</Link> verifies the sending server&apos;s IP address, DKIM verifies the email content itself. <Link href="/tools/dmarc-lookup" className="text-blue-600 hover:underline">DMARC</Link> then ties both together with a policy that tells receivers what to do when authentication fails.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 DKIM is particularly valuable for outbound email because it provides <strong>per-message authentication</strong>. SPF only validates the sending IP, which means any email from that IP passes regardless of content. DKIM, by contrast, cryptographically binds each individual email to the signing domain. This makes it significantly harder for attackers to spoof your domain and provides a stronger trust signal to ISPs.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 For DMARC alignment to pass, either SPF or DKIM must align with the From header domain. In practice, having both pass gives you the strongest authentication posture. For a full walkthrough of how all three protocols work together, see our <Link href="/blog/spf-dkim-dmarc-explained" className="text-blue-600 hover:underline">SPF, DKIM &amp; DMARC setup guide</Link>.
 </p>

 <h2 id="lookup-vs-generator" className="text-2xl font-bold text-gray-900 mt-12 mb-4">DKIM Lookup vs DKIM Generator: When to Use Each</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 Superkabe offers two free DKIM tools for different use cases:
 </p>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">DKIM Lookup Tool</h3>
 <p className="text-gray-600 text-sm mb-2">Use the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM Lookup tool</Link> when you need to:</p>
 <ul className="space-y-1 text-gray-600 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Verify that your DKIM public key is published in DNS</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Check the key length and algorithm of your existing DKIM key</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Diagnose why DKIM authentication is failing on your emails</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Confirm that a newly published DKIM record has propagated</li>
 </ul>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">DKIM Generator Tool</h3>
 <p className="text-gray-600 text-sm mb-2">Use the <Link href="/tools/dkim-generator" className="text-blue-600 hover:underline">DKIM Generator tool</Link> when you need to:</p>
 <ul className="space-y-1 text-gray-600 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Generate a new DKIM key pair for a domain</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Create a properly formatted DKIM TXT record for DNS</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Rotate from a 1024-bit key to a 2048-bit key</li>
 </ul>
 </div>

 <h2 id="faq" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently Asked Questions</h2>

 <div className="space-y-6 mb-12">
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">What is a DKIM selector and how do I find mine?</h3>
 <p className="text-gray-600 text-sm">A DKIM selector is a prefix used to locate your DKIM public key in DNS. The full lookup is <code className="bg-gray-100 px-1 text-xs">selector._domainkey.yourdomain.com</code>. Each provider uses different selectors: Google Workspace uses &quot;google&quot;, Microsoft 365 uses &quot;selector1&quot; and &quot;selector2&quot;, and SendGrid uses &quot;s1&quot; and &quot;s2&quot;. You can find your selector by examining the DKIM-Signature header in any email sent from your domain.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">What happens if my DKIM record is missing?</h3>
 <p className="text-gray-600 text-sm">If your DKIM record is missing from DNS, receiving servers cannot verify the cryptographic signatures on your emails. DKIM authentication will fail for every email. While emails may still deliver if SPF passes, the lack of DKIM weakens your overall authentication posture and can negatively impact your sender reputation.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">What is the recommended DKIM key length?</h3>
 <p className="text-gray-600 text-sm">The recommended DKIM key length is 2048 bits. While 1024-bit keys are still accepted, they are considered weak by modern standards. Google recommends 2048-bit keys and some receivers may penalize shorter key lengths. If you are using a 1024-bit key, plan a rotation to 2048-bit.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">Can I have multiple DKIM records for the same domain?</h3>
 <p className="text-gray-600 text-sm">Yes. Unlike SPF (which must have exactly one record), you can have multiple DKIM records by using different selectors. Each email provider typically uses its own selector, so Google Workspace, Smartlead, and SendGrid can each have their own DKIM key on the same domain without conflict.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">How do I check DKIM for emails sent through Google Workspace?</h3>
 <p className="text-gray-600 text-sm">For Google Workspace, the default DKIM selector is &quot;google&quot;. Use the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM lookup tool</Link> with your domain and the selector &quot;google&quot; to check if your DKIM key is published. If you generated a custom key in the Google Admin Console, you may have chosen a different prefix &mdash; check your admin settings to confirm.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">How often should I rotate my DKIM keys?</h3>
 <p className="text-gray-600 text-sm">DKIM key rotation is recommended every 6 to 12 months for security best practices. The more critical concern for outbound teams is ensuring the key exists and is valid. If you are using a 1024-bit key, rotate to 2048-bit immediately. Superkabe monitors DKIM key presence and validity continuously.</p>
 </div>
 </div>

 </div>

 <BottomCtaStrip
 headline="Stop Checking DKIM Manually"
 body="The free DKIM lookup tool is useful for spot checks, but outbound teams running multiple domains need continuous monitoring. Superkabe automatically validates DKIM keys across all your sending domains and selectors, alerts you when keys are missing or expiring, and prevents authentication failures before they impact deliverability."
 primaryCta={{ label: 'Start free trial', href: '/signup' }}
 secondaryCta={{ label: 'See how it works', href: '/' }}
 />

 <div className="mt-16 pt-10 border-t border-gray-100">
 <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
 <p className="text-gray-600 leading-relaxed max-w-3xl">
 Superkabe continuously monitors DKIM records across all your sending domains, tracking key presence, key length, and selector validity. When a DKIM key goes missing, uses a weak key length, or a selector mismatch is detected, Superkabe flags the issue before it causes authentication failures at scale.
 </p>
 </div>
 </article>

 {/* Internal Link Mesh */}
 <section className="pb-12 mt-16">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
 <div className="grid md:grid-cols-3 gap-4">
 <Link href="/blog/spf-dkim-dmarc-explained" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">SPF, DKIM &amp; DMARC Setup Guide</h3>
 <p className="text-gray-500 text-xs">Complete DNS authentication setup for outbound teams</p>
 </Link>
 <Link href="/blog/free-spf-lookup-tool" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Free SPF Lookup Tool</h3>
 <p className="text-gray-500 text-xs">Check your domain&apos;s SPF configuration</p>
 </Link>
 <Link href="/blog/free-dmarc-lookup-generator-tool" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Free DMARC Lookup &amp; Generator</h3>
 <p className="text-gray-500 text-xs">Configure your domain&apos;s email policy</p>
 </Link>
 <Link href="/blog/email-authentication-checker-tools" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Email Authentication Checker Tools</h3>
 <p className="text-gray-500 text-xs">SPF, DKIM &amp; DMARC verification in one place</p>
 </Link>
 <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate &amp; Deliverability</h3>
 <p className="text-gray-500 text-xs">How bounces destroy sender reputation</p>
 </Link>
 <Link href="/blog/email-reputation-lifecycle" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Email Reputation Lifecycle</h3>
 <p className="text-gray-500 text-xs">How reputation is built and damaged</p>
 </Link>
 </div>
 <div className="mt-6">
 <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">&larr; See how Superkabe protects your infrastructure</Link>
 </div>
 </section>
 </>
 );
}

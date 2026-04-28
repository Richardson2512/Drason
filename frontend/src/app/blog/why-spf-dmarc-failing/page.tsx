import Link from 'next/link';
import type { Metadata } from 'next';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

export const metadata: Metadata = {
 title: 'Why Is My SPF or DMARC Failing?',
 description: 'SPF or DMARC authentication is failing on your emails. Here are the common causes and how to fix each one step by step.',
 openGraph: {
 title: 'Why Is My SPF or DMARC Failing?',
 description: 'SPF or DMARC authentication is failing on your emails. Here are the common causes and how to fix each one step by step.',
 url: '/blog/why-spf-dmarc-failing',
 siteName: 'Superkabe',
 type: 'article',
 publishedTime: '2026-04-18',
 },
 twitter: {
     card: 'summary_large_image',
     title: 'Why Is My SPF or DMARC Failing?',
     description: 'SPF or DMARC authentication is failing on your emails. Here are the common causes and how to fix each one step by step.',
     images: ['/image/og-image.png'],
 },
 alternates: { canonical: '/blog/why-spf-dmarc-failing' },
};

export default function WhySpfDmarcFailingArticle() {
 const blogPostingSchema = {
 "@context": "https://schema.org",
 "@type": "BlogPosting",
 "headline": "Why Is My SPF or DMARC Failing?",
 "description": "SPF or DMARC authentication is failing on your emails. Here are the common causes and how to fix each one step by step.",
 "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Email Infrastructure Engineer", "url": "https://www.superkabe.com" },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.superkabe.com/blog/why-spf-dmarc-failing" },
 "datePublished": "2026-04-18",
 "dateModified": "2026-04-18",
        "image": { "@type": "ImageObject", "url": "https://www.superkabe.com/image/og-image.png", "width": 1200, "height": 630 }
 };

 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "Can I have multiple SPF records on one domain?",
 "acceptedAnswer": { "@type": "Answer", "text": "No. The SPF specification (RFC 7208) states that a domain must have at most one SPF record. If you have two or more TXT records starting with v=spf1, SPF validation returns a PermError and your emails fail authentication. Merge all your sending sources into a single SPF record using multiple include statements." }
 },
 {
 "@type": "Question",
 "name": "What is the difference between SPF -all and ~all?",
 "acceptedAnswer": { "@type": "Answer", "text": "The -all mechanism (hard fail) tells receiving servers to reject any email not matching your SPF record. The ~all mechanism (soft fail) tells them to accept but mark the email as suspicious. For cold email domains, use ~all until you are confident your SPF record includes all legitimate sending sources. Once verified, switch to -all for stronger protection." }
 },
 {
 "@type": "Question",
 "name": "Does DMARC fail if only SPF fails but DKIM passes?",
 "acceptedAnswer": { "@type": "Answer", "text": "No. DMARC passes if either SPF or DKIM passes with domain alignment. So if SPF fails but DKIM passes and the DKIM signing domain aligns with the From domain, DMARC will pass. This is why setting up both SPF and DKIM is important — they act as backup for each other." }
 }
 ]
 };

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog"}, {"@type": "ListItem", "position": 3, "name": "Why Is My SPF or DMARC Failing?", "item": "https://www.superkabe.com/blog/why-spf-dmarc-failing"}]}) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 <article>
 <BlogHeader
                    tag="Troubleshooting"
                    title="Why Is My SPF or DMARC Failing?"
                    dateModified="2026-04-25"
                    authorName="Robert Smith"
                    authorRole="Email Infrastructure Engineer · Superkabe"
                />

                <FeaturedHero
                    badge="TROUBLESHOOTING · 2026"
                    eyebrow="12 min read"
                    tagline="Diagnose SPF and DMARC failures"
                    sub="Authentication · Alignment · Reporting · Real-time monitoring"
                />

                <p className="text-lg text-gray-700 leading-relaxed mb-12">
                    SPF fails when your sending server IP is not included in your domain&apos;s SPF record, or when you exceed the 10 DNS lookup limit. DMARC fails when neither SPF nor DKIM passes with domain alignment. Both cause emails to land in spam or get rejected entirely.
                </p>

 <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
 <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
 <ul className="space-y-2 text-blue-800 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> SPF allows only 10 DNS lookups — exceeding this silently breaks authentication</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> You can only have one SPF record per domain — multiple records cause a PermError</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> DMARC passes if either SPF or DKIM passes with alignment — set up both as backup</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Start DMARC with p=none to monitor, then move to p=quarantine, then p=reject</li>
 </ul>
 </div>

 <div className="prose prose-lg max-w-none">
 <p className="text-gray-600 leading-relaxed mb-6">
 You checked your email headers and saw &quot;SPF: FAIL&quot; or &quot;DMARC: FAIL.&quot; Or maybe your deliverability tanked and someone told you to check your DNS records. Either way, failing email authentication is one of the fastest ways to land in spam — and fixing it requires understanding exactly what broke and why. Here is a complete diagnosis and fix guide for every common SPF, DKIM, and DMARC failure.
 </p>

 <h2 id="spf-failures" className="text-2xl font-bold text-gray-900 mt-12 mb-4">SPF failure causes</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 SPF (Sender Policy Framework) tells receiving mail servers which IP addresses are allowed to send email on behalf of your domain. When SPF fails, the receiving server sees your email as unauthorized.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Missing include for your sending platform</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 The most common SPF failure is simply not including your sending platform in your SPF record. If you send through Google Workspace, your SPF record must include <code className="bg-gray-100 px-2 py-0.5 text-sm">include:_spf.google.com</code>. If you also send through Smartlead, you need their include as well. Every platform that sends email on your behalf must be listed.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to check:</strong> Use the <Link href="/tools/spf-lookup" className="text-blue-600 hover:text-blue-800">Superkabe SPF Lookup tool</Link> to see your current SPF record and what it resolves to. Then verify that every service you send email through is included.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to fix:</strong> Add the missing include to your SPF record. Here is what a complete SPF record looks like for a domain using Google Workspace and Smartlead:
 </p>
 <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm mb-6 overflow-x-auto">
 <p className="m-0">v=spf1 include:_spf.google.com include:spf.smartlead.ai ~all</p>
 </div>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Too many DNS lookups (the 10-lookup limit)</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 The SPF specification limits DNS lookups to 10 per record. Each <code className="bg-gray-100 px-2 py-0.5 text-sm">include:</code>, <code className="bg-gray-100 px-2 py-0.5 text-sm">a:</code>, <code className="bg-gray-100 px-2 py-0.5 text-sm">mx:</code>, and <code className="bg-gray-100 px-2 py-0.5 text-sm">redirect:</code> mechanism counts as one lookup. But includes can be nested — <code className="bg-gray-100 px-2 py-0.5 text-sm">include:_spf.google.com</code> itself triggers 3-4 additional lookups internally. If your total exceeds 10, SPF returns a PermError and fails.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to check:</strong> The <Link href="/tools/spf-lookup" className="text-blue-600 hover:text-blue-800">SPF Lookup tool</Link> shows the total lookup count. Alternatively, run <code className="bg-gray-100 px-2 py-0.5 text-sm">dig TXT yourdomain.com</code> and manually trace each include.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to fix:</strong> Replace <code className="bg-gray-100 px-2 py-0.5 text-sm">include:</code> statements with direct IP addresses where possible. For example, instead of including a third-party service, use their IP range: <code className="bg-gray-100 px-2 py-0.5 text-sm">ip4:198.51.100.0/24</code>. This uses zero DNS lookups. Another option is an SPF flattening service that automatically resolves includes to IPs and keeps your record under the limit.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 Use the <Link href="/tools/spf-generator" className="text-blue-600 hover:text-blue-800">Superkabe SPF Generator</Link> to build an optimized record that stays within the 10-lookup limit.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Multiple SPF records on the same domain</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 A domain can only have one SPF record (one TXT record starting with <code className="bg-gray-100 px-2 py-0.5 text-sm">v=spf1</code>). If you have two, SPF validation returns a PermError and fails for every email. This commonly happens when one team member adds an SPF record for Google Workspace and another adds a separate one for a transactional email service.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to fix:</strong> Merge all sending sources into a single SPF record. Delete the duplicate and combine the includes:
 </p>
 <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm mb-4 overflow-x-auto">
 <p className="m-0 text-red-400">// WRONG — two separate SPF records</p>
 <p className="m-0">v=spf1 include:_spf.google.com ~all</p>
 <p className="m-0">v=spf1 include:sendgrid.net ~all</p>
 <p className="m-0 mt-3 text-red-400">// CORRECT — one merged record</p>
 <p className="m-0">v=spf1 include:_spf.google.com include:sendgrid.net ~all</p>
 </div>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Using -all too early instead of ~all</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 The <code className="bg-gray-100 px-2 py-0.5 text-sm">-all</code> mechanism (hard fail) tells receiving servers to reject any email not in your SPF record. The <code className="bg-gray-100 px-2 py-0.5 text-sm">~all</code> mechanism (soft fail) tells them to accept but flag it. If you set <code className="bg-gray-100 px-2 py-0.5 text-sm">-all</code> before you have included every legitimate sending source, you will reject your own emails.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to fix:</strong> Switch to <code className="bg-gray-100 px-2 py-0.5 text-sm">~all</code> until you are certain every sending service is included. Monitor for a few weeks using DMARC aggregate reports to confirm no legitimate sources are missing, then switch to <code className="bg-gray-100 px-2 py-0.5 text-sm">-all</code>.
 </p>

 <h2 id="dkim-failures" className="text-2xl font-bold text-gray-900 mt-12 mb-4">DKIM failure causes</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DKIM (DomainKeys Identified Mail) adds a cryptographic signature to each email. The receiving server checks this signature against the public key published in your DNS. When DKIM fails, the receiving server cannot verify the email was sent by an authorized source and was not tampered with in transit.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Key not published at the correct selector subdomain</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 DKIM keys are published at a specific subdomain: <code className="bg-gray-100 px-2 py-0.5 text-sm">selector._domainkey.yourdomain.com</code>. The selector is provided by your email platform (for Google Workspace, it is usually <code className="bg-gray-100 px-2 py-0.5 text-sm">google</code>). If the CNAME or TXT record is published at the wrong subdomain, or the selector does not match what the email header specifies, DKIM fails.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to check:</strong> Use the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:text-blue-800">Superkabe DKIM Lookup tool</Link>. Enter your domain and selector to see if the key is published and valid.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to fix:</strong> In Google Workspace Admin Console, go to Apps &gt; Google Workspace &gt; Gmail &gt; Authenticate email. Copy the DKIM record value and publish it as a TXT record at <code className="bg-gray-100 px-2 py-0.5 text-sm">google._domainkey.yourdomain.com</code>. For other providers, follow their specific DKIM setup documentation. Allow up to 48 hours for DNS propagation, then click &quot;Start authentication&quot; in your admin console.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Key rotated by provider but DNS not updated</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 Some email providers rotate DKIM keys periodically for security. When this happens, the old key in your DNS no longer matches the signature in outgoing emails. Google Workspace can rotate keys automatically, but if you set up DKIM manually (as most cold email setups do), you need to update the DNS record to match the new key.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to fix:</strong> Check your email provider&apos;s admin console for the current DKIM key. Compare it to what is published in your DNS. If they differ, update the DNS record with the new key. Set a quarterly reminder to verify DKIM keys have not rotated.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Wrong key length (1024 vs 2048 bit)</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 DKIM keys come in 1024-bit and 2048-bit lengths. The industry standard is moving to 2048-bit for stronger security. Some receiving servers may flag 1024-bit keys as weak, though most still accept them. The more common issue is publishing a 2048-bit key in a DNS TXT record that exceeds the 255-character string limit — this requires splitting the key into two strings within the same TXT record.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to fix:</strong> If your provider offers 2048-bit keys, use them. If the DNS record fails to save due to length, your registrar may need the key split into two quoted strings within a single TXT record. Most modern DNS providers handle this automatically, but some older panels require manual splitting.
 </p>

 <h2 id="dmarc-failures" className="text-2xl font-bold text-gray-900 mt-12 mb-4">DMARC failure causes</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DMARC (Domain-based Message Authentication, Reporting and Conformance) ties SPF and DKIM together. It passes if at least one of them passes <em>with domain alignment</em> — meaning the domain in the SPF or DKIM check matches the domain in the From header.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">SPF and DKIM both failing</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 DMARC requires at least one of SPF or DKIM to pass with alignment. If both fail, DMARC automatically fails. This is the most common scenario — fix your SPF and DKIM issues first (see sections above), and DMARC will pass.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to check:</strong> Look at the email headers for all three results. If SPF and DKIM both show FAIL, focus on fixing those first. Use the <Link href="/tools/dmarc-lookup" className="text-blue-600 hover:text-blue-800">Superkabe DMARC Lookup tool</Link> to verify your DMARC record is published correctly.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Alignment mode mismatch (strict vs relaxed)</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 DMARC alignment means the domain in the From header must match the domain authenticated by SPF or DKIM. In <strong>relaxed mode</strong> (the default), subdomains count — so mail from <code className="bg-gray-100 px-2 py-0.5 text-sm">user@sub.yourdomain.com</code> aligns with SPF for <code className="bg-gray-100 px-2 py-0.5 text-sm">yourdomain.com</code>. In <strong>strict mode</strong>, the domains must match exactly.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 If you set <code className="bg-gray-100 px-2 py-0.5 text-sm">aspf=s</code> or <code className="bg-gray-100 px-2 py-0.5 text-sm">adkim=s</code> (strict) in your DMARC record, and your emails come from a subdomain while your authentication is set up on the root domain, alignment fails even though the underlying checks pass.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to fix:</strong> Unless you have a specific reason for strict alignment, use relaxed mode. Remove <code className="bg-gray-100 px-2 py-0.5 text-sm">aspf=s</code> and <code className="bg-gray-100 px-2 py-0.5 text-sm">adkim=s</code> from your DMARC record, or explicitly set them to <code className="bg-gray-100 px-2 py-0.5 text-sm">aspf=r</code> and <code className="bg-gray-100 px-2 py-0.5 text-sm">adkim=r</code>.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">No DMARC record at all</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 While a missing DMARC record does not technically cause a &quot;DMARC: FAIL&quot; (the result is &quot;none&quot;), it does mean you have no policy protection. ISPs like Gmail and Yahoo now require DMARC records for bulk senders. Without DMARC, you lose visibility into who is sending email as your domain, and some ISPs may treat your emails with lower trust.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 <strong>How to fix:</strong> Add a DMARC record as a TXT record at <code className="bg-gray-100 px-2 py-0.5 text-sm">_dmarc.yourdomain.com</code>. Start with a monitoring-only policy:
 </p>
 <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm mb-4 overflow-x-auto">
 <p className="m-0">v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; pct=100</p>
 </div>
 <p className="text-gray-600 leading-relaxed mb-4">
 After 2-4 weeks of monitoring aggregate reports and confirming no legitimate sources are failing, move to quarantine:
 </p>
 <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm mb-4 overflow-x-auto">
 <p className="m-0">v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100</p>
 </div>
 <p className="text-gray-600 leading-relaxed mb-6">
 Once you are confident, move to reject for maximum protection. Use the <Link href="/tools/dmarc-generator" className="text-blue-600 hover:text-blue-800">Superkabe DMARC Generator</Link> to create a properly formatted record.
 </p>

 <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Subdomain vs root domain policy confusion</h3>
 <p className="text-gray-600 leading-relaxed mb-4">
 DMARC has a <code className="bg-gray-100 px-2 py-0.5 text-sm">sp=</code> tag that sets policy for subdomains. If you send from <code className="bg-gray-100 px-2 py-0.5 text-sm">outreach.yourdomain.com</code> but only have a DMARC record on the root domain with <code className="bg-gray-100 px-2 py-0.5 text-sm">sp=reject</code>, emails from the subdomain will be rejected unless the subdomain has its own DMARC record that overrides the parent policy.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 <strong>How to fix:</strong> If you use subdomains for sending, either set <code className="bg-gray-100 px-2 py-0.5 text-sm">sp=none</code> on the root domain DMARC record while you set up subdomain authentication, or publish a separate DMARC record for each sending subdomain at <code className="bg-gray-100 px-2 py-0.5 text-sm">_dmarc.subdomain.yourdomain.com</code>.
 </p>

 <h2 id="step-by-step-fix" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Step-by-step fix checklist</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 Follow this order to fix authentication failures systematically:
 </p>
 <ol className="text-gray-600 space-y-3 mb-6">
 <li><strong>Check SPF first.</strong> Run your domain through the <Link href="/tools/spf-lookup" className="text-blue-600 hover:text-blue-800">SPF Lookup tool</Link>. Verify you have exactly one SPF record, all sending sources are included, and you are under 10 DNS lookups.</li>
 <li><strong>Check DKIM second.</strong> Use the <Link href="/tools/dkim-lookup" className="text-blue-600 hover:text-blue-800">DKIM Lookup tool</Link> with your selector (usually &quot;google&quot; for Google Workspace). Confirm the key is published and matches what your provider shows in their admin console.</li>
 <li><strong>Check DMARC third.</strong> Use the <Link href="/tools/dmarc-lookup" className="text-blue-600 hover:text-blue-800">DMARC Lookup tool</Link> to verify your record exists at <code className="bg-gray-100 px-2 py-0.5 text-sm">_dmarc.yourdomain.com</code> and the policy is appropriate for your current stage.</li>
 <li><strong>Send a test email.</strong> After making DNS changes (allow 15-60 minutes for propagation), send a test email to a Gmail account. Open it, click the three dots, select &quot;Show original,&quot; and confirm SPF: PASS, DKIM: PASS, DMARC: PASS.</li>
 <li><strong>Monitor aggregate reports.</strong> Set up the <code className="bg-gray-100 px-2 py-0.5 text-sm">rua=</code> tag in your DMARC record to receive aggregate reports. These reports show every IP that sends email as your domain and whether they pass or fail authentication.</li>
 </ol>

 <h2 id="superkabe-dns-monitoring" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe monitors DNS health continuously</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 Fixing SPF, DKIM, and DMARC once is not enough. DNS records can break silently — a provider rotates DKIM keys, someone on your team adds a second SPF record, a DNS migration drops records. You will not know until your emails start hitting spam.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Superkabe&apos;s <Link href="/docs/help/dns-setup" className="text-blue-600 hover:text-blue-800">infrastructure assessment</Link> checks all three authentication records across every sending domain connected to your account. Checks run continuously, not just at setup time. If an SPF record adds a lookup that pushes you past the 10-lookup limit, if a DKIM key stops resolving, or if a DMARC record is deleted during a DNS migration, you get an alert before your next campaign sends unauthenticated emails.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 This matters because DNS issues are silent killers. Your Smartlead campaigns keep sending, your warmup tool keeps showing good scores, but your live emails fail authentication and land in spam. By the time you check headers manually and discover the failure, domain reputation damage has already accumulated over days or weeks.
 </p>

 <h2 id="faq" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently Asked Questions</h2>
 <div className="space-y-4 mb-12">
 <details className="p-4 bg-gray-50 border border-gray-200 group">
 <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">Can I have multiple SPF records on one domain? <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span></summary>
 <p className="mt-3 text-sm text-gray-600">No. The SPF specification (RFC 7208) states that a domain must have at most one SPF record. If you have two or more TXT records starting with v=spf1, SPF validation returns a PermError and your emails fail authentication. Merge all your sending sources into a single SPF record using multiple include statements.</p>
 </details>
 <details className="p-4 bg-gray-50 border border-gray-200 group">
 <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">What is the difference between SPF -all and ~all? <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span></summary>
 <p className="mt-3 text-sm text-gray-600">The -all mechanism (hard fail) tells receiving servers to reject any email not matching your SPF record. The ~all mechanism (soft fail) tells them to accept but mark the email as suspicious. For cold email domains, use ~all until you are confident your SPF record includes all legitimate sending sources. Once verified, switch to -all for stronger protection.</p>
 </details>
 <details className="p-4 bg-gray-50 border border-gray-200 group">
 <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">Does DMARC fail if only SPF fails but DKIM passes? <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span></summary>
 <p className="mt-3 text-sm text-gray-600">No. DMARC passes if either SPF or DKIM passes with domain alignment. So if SPF fails but DKIM passes and the DKIM signing domain aligns with the From domain, DMARC will pass. This is why setting up both SPF and DKIM is important — they act as backup for each other.</p>
 </details>
 </div>
 </div>

 <BottomCtaStrip
                    headline="Catch SPF and DMARC failures in real time"
                    body="Authentication breakage causes silent reputation decline. Superkabe verifies SPF, DKIM, and DMARC continuously and pauses mailboxes before ISPs notice."
                    primaryCta={{ label: 'Start free trial', href: '/signup' }}
                    secondaryCta={{ label: 'See how it works', href: '/' }}
                />
 </article>
 </>
 );
}

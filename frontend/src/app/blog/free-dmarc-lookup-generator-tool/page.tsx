import Link from 'next/link';

import type { Metadata } from 'next';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

export const metadata: Metadata = {
 title: "Free DMARC Lookup & Generator Tool – Configure Your",
 description: "Use our free DMARC lookup and generator tools to check and configure your domain's DMARC policy.",
 openGraph: {
 title: "Free DMARC Lookup & Generator Tool – Configure Your",
 description: "Use our free DMARC lookup and generator tools to check and configure your domain's DMARC policy.",
 url: '/blog/free-dmarc-lookup-generator-tool',
 siteName: 'Superkabe',
 type: 'article',
 publishedTime: '2026-04-09',
 },
 twitter: {
     card: 'summary_large_image',
     title: 'Free DMARC Lookup & Generator Tool – Configure Your',
     description: 'Use our free DMARC lookup and generator tools to check and configure your domain',
     images: ['/image/og-image.png'],
 },
 alternates: {
 canonical: '/blog/free-dmarc-lookup-generator-tool',
 },
};

export default function FreeDmarcLookupGeneratorToolArticle() {
 const blogPostingSchema = {
 "@context": "https://schema.org",
 "@type": "BlogPosting",
 "headline": "Free DMARC Lookup & Generator Tool – Configure Your",
 "description": "Use our free DMARC lookup and generator tools to check and configure your domain's DMARC policy. Understand policy levels, rollout strategy, reporting, and Google/Yahoo requirements.",
 "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Email Infrastructure Engineer", "url": "https://www.superkabe.com" },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 "datePublished": "2026-04-09",
 "dateModified": "2026-04-09",
        "image": { "@type": "ImageObject", "url": "https://www.superkabe.com/image/og-image.png", "width": 1200, "height": 630 },
 "mainEntityOfPage": {
 "@type": "WebPage",
 "@id": "https://www.superkabe.com/blog/free-dmarc-lookup-generator-tool"
 }
 };

 const howToSchema = {
 "@context": "https://schema.org",
 "@type": "HowTo",
 "name": "How to Check and Configure Your DMARC Policy",
 "description": "Step-by-step guide to using the free DMARC lookup and generator tools to set up your domain's email policy.",
 "step": [
 { "@type": "HowToStep", "position": 1, "name": "Check Your Current DMARC Record", "text": "Use the DMARC Lookup Tool to query your domain for an existing DMARC record at _dmarc.yourdomain.com." },
 { "@type": "HowToStep", "position": 2, "name": "Understand Your Current Policy", "text": "Review the policy level (none, quarantine, or reject), reporting addresses, alignment mode, and percentage applied." },
 { "@type": "HowToStep", "position": 3, "name": "Generate a New Policy", "text": "Use the DMARC Generator Tool to create a DMARC record with the correct policy level, reporting addresses, and alignment settings." },
 { "@type": "HowToStep", "position": 4, "name": "Publish and Monitor", "text": "Add the generated DMARC TXT record to your DNS at _dmarc.yourdomain.com. Monitor aggregate reports to verify authentication is working before tightening the policy." }
 ]
 };

 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "What is the difference between DMARC p=none, p=quarantine, and p=reject?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "p=none tells receiving servers to take no action on emails that fail authentication — it's a monitoring-only mode. p=quarantine instructs servers to route failing emails to spam. p=reject tells servers to block failing emails entirely. Most outbound teams should start with p=none for monitoring, then progress to p=quarantine, and eventually p=reject once authentication is fully verified."
 }
 },
 {
 "@type": "Question",
 "name": "Is DMARC required for email sending in 2024 and beyond?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. As of February 2024, Google and Yahoo require all bulk senders (those sending more than 5,000 emails per day) to have a DMARC record published. Even senders below this threshold benefit from DMARC because it provides ISPs with a clear authentication policy, which positively influences inbox placement decisions."
 }
 },
 {
 "@type": "Question",
 "name": "What are DMARC aggregate reports (rua) and why should I enable them?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "DMARC aggregate reports (rua) are XML reports sent by receiving mail servers that show who is sending email using your domain, whether those emails pass or fail authentication, and which ISPs are processing them. These reports are essential for identifying unauthorized senders, diagnosing authentication failures, and verifying that your legitimate email services are properly configured before tightening your DMARC policy."
 }
 },
 {
 "@type": "Question",
 "name": "What is DMARC alignment and why does it matter?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "DMARC alignment means the domain in the From header must match the domain that passed SPF or DKIM. There are two alignment modes: strict (exact domain match) and relaxed (organizational domain match, allowing subdomains). Relaxed alignment is the default and is recommended for most outbound teams because it allows subdomains to align with the parent domain."
 }
 },
 {
 "@type": "Question",
 "name": "How long should I stay on p=none before moving to p=quarantine?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Most organizations should monitor with p=none for 2 to 4 weeks while reviewing aggregate reports. Once you have confirmed that all legitimate email sources pass authentication (SPF and/or DKIM alignment), you can move to p=quarantine. After another 2 to 4 weeks with no issues, progress to p=reject. Rushing this timeline risks blocking legitimate emails."
 }
 },
 {
 "@type": "Question",
 "name": "Can I apply DMARC to only a percentage of my emails?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. The pct tag in your DMARC record specifies the percentage of failing emails to which the policy applies. For example, pct=25 means only 25% of failing emails will be quarantined or rejected, while the rest are treated as if the policy were p=none. This allows gradual rollout. Start with pct=25, increase to pct=50, then pct=100 once you are confident in your authentication."
 }
 }
 ]
 };

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog"}, {"@type": "ListItem", "position": 3, "name": "Free DMARC Lookup & Generator Tool – Configure Your", "item": "https://www.superkabe.com/blog/free-dmarc-lookup-generator-tool"}]}) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 <article>
 <BlogHeader
 tag="Free Tools"
 title="Free DMARC Lookup & Generator Tool — Configure Your Domain's Email Policy"
 dateModified="2026-04-25"
 authorName="Robert Smith"
 authorRole="Email Infrastructure Engineer · Superkabe"
 />

 <FeaturedHero
 badge="FREE TOOLS · 2026"
 eyebrow="10 min read"
 tagline="Configure your DMARC policy"
 sub="Lookup · Generator · p=none → reject · Aggregate reports"
 />

 <p className="text-lg text-gray-700 leading-relaxed mb-12">
 DMARC is the policy layer that ties SPF and DKIM together and tells receiving servers what to do when authentication fails. Without DMARC, ISPs have no instructions for handling spoofed emails from your domain. Use our <Link href="/tools/dmarc-lookup" className="underline">free DMARC lookup tool</Link> to check your current policy, or the <Link href="/tools/dmarc-generator" className="underline">DMARC generator</Link> to create one from scratch.
 </p>

 {/* Key Takeaways */}
 <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
 <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
 <ul className="space-y-2 text-blue-800 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> DMARC tells ISPs what to do when SPF and DKIM fail: nothing (none), spam (quarantine), or block (reject)</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Google and Yahoo require DMARC for all bulk senders since February 2024</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Start with <code className="bg-blue-100 px-1 text-xs">p=none</code>, monitor reports, then progress to <code className="bg-blue-100 px-1 text-xs">p=quarantine</code> and <code className="bg-blue-100 px-1 text-xs">p=reject</code></li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Enable aggregate reports (rua) to see who is sending email using your domain</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Use the <code className="bg-blue-100 px-1 text-xs">pct</code> tag to gradually roll out stricter policies</li>
 </ul>
 </div>


 <div className="prose prose-lg max-w-none">
 <p className="text-lg text-gray-600 leading-relaxed mb-8">
 DMARC (Domain-based Message Authentication, Reporting, and Conformance) is the third and final layer of the email authentication stack. While <Link href="/blog/free-spf-lookup-tool" className="text-blue-600 hover:underline">SPF</Link> authorizes sending servers and <Link href="/blog/free-dkim-lookup-tool" className="text-blue-600 hover:underline">DKIM</Link> cryptographically signs each email, DMARC provides the enforcement policy. It tells receiving servers exactly what to do when an email fails authentication &mdash; and gives domain owners visibility into who is sending email on their behalf.
 </p>

 <h2 id="what-is-dmarc" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Is DMARC and Why Does Every Domain Need It?</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DMARC is a DNS TXT record published at <code className="bg-gray-100 px-1.5 py-0.5 text-sm">_dmarc.yourdomain.com</code>. It serves two critical functions: it tells receiving mail servers what policy to apply when emails fail SPF and DKIM authentication, and it provides a mechanism for receiving reports about email authentication results.
 </p>

 <div className="bg-gray-900 text-green-400 p-6 mb-8 font-mono text-sm overflow-x-auto">
 <p className="text-gray-500 mb-2"># Example DMARC record</p>
 <p>v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100; adkim=r; aspf=r</p>
 </div>

 <p className="text-gray-600 leading-relaxed mb-6">
 Without DMARC, receiving servers have no explicit instructions for handling emails that fail SPF or DKIM checks. They may deliver spoofed emails, route them to spam, or reject them &mdash; the behavior is entirely up to each ISP&apos;s internal heuristics. DMARC removes this ambiguity by giving domain owners explicit control over failure handling.
 </p>
 <p className="text-gray-600 leading-relaxed mb-6">
 For outbound email teams, DMARC is also a compliance requirement. Since February 2024, Google and Yahoo mandate that all bulk senders have a published DMARC record. Domains without DMARC will have their emails throttled or rejected by these providers, regardless of SPF and DKIM status.
 </p>

 <h2 id="policy-levels" className="text-2xl font-bold text-gray-900 mt-12 mb-4">DMARC Policy Levels: none, quarantine, reject</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 The <code className="bg-gray-100 px-1.5 py-0.5 text-sm">p=</code> tag in your DMARC record defines the policy level. Each level represents a different response to authentication failures:
 </p>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">p=none (Monitor Only)</h3>
 <p className="text-gray-600 text-sm mb-3">
 This policy tells receiving servers to take no action on emails that fail authentication. Emails are delivered normally regardless of authentication results. The purpose of <code className="bg-gray-100 px-1 text-xs">p=none</code> is purely monitoring &mdash; you receive aggregate reports showing who is sending email using your domain and whether those emails pass or fail authentication.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>When to use:</strong> During initial DMARC deployment, or when you are still identifying all legitimate email sources for a domain.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">p=quarantine (Route to Spam)</h3>
 <p className="text-gray-600 text-sm mb-3">
 This policy instructs receiving servers to route emails that fail authentication to the spam or junk folder. The email is still delivered, but it is flagged as suspicious. This is a significant step up from <code className="bg-gray-100 px-1 text-xs">p=none</code> because it actively protects your domain from spoofing while still allowing recipients to find misclassified legitimate emails.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>When to use:</strong> After you have monitored with <code className="bg-gray-100 px-1 text-xs">p=none</code> for 2-4 weeks and confirmed all legitimate sources pass authentication.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-4">p=reject (Block Entirely)</h3>
 <p className="text-gray-600 text-sm mb-3">
 This is the strongest policy level. It tells receiving servers to reject emails that fail authentication outright &mdash; they are never delivered to the recipient. This provides maximum protection against domain spoofing but carries risk: if any legitimate email source is not properly configured for SPF/DKIM alignment, those emails will be blocked.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>When to use:</strong> After running <code className="bg-gray-100 px-1 text-xs">p=quarantine</code> successfully for 2-4 weeks with no legitimate emails being affected.
 </p>
 </div>

 <h2 id="rollout-strategy" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The Safe DMARC Rollout Strategy</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 Deploying DMARC too aggressively can block legitimate emails. The recommended rollout strategy uses the <code className="bg-gray-100 px-1.5 py-0.5 text-sm">pct</code> tag to gradually increase enforcement:
 </p>

 <ol className="space-y-4 text-gray-600 mb-8 list-decimal pl-5">
 <li><strong>Week 1-2: p=none</strong> &mdash; Publish a DMARC record with <code className="bg-gray-100 px-1.5 py-0.5 text-sm">p=none</code> and <code className="bg-gray-100 px-1.5 py-0.5 text-sm">rua=mailto:your-reports@domain.com</code>. Monitor aggregate reports to identify all email sources.</li>
 <li><strong>Week 3-4: p=quarantine; pct=25</strong> &mdash; Move to quarantine but only apply the policy to 25% of failing emails. This catches major issues without blocking all traffic.</li>
 <li><strong>Week 5-6: p=quarantine; pct=100</strong> &mdash; Increase to 100% quarantine. Monitor for any legitimate emails landing in spam.</li>
 <li><strong>Week 7-8: p=reject; pct=25</strong> &mdash; Start rejecting, but only 25% of failing emails. This gives you a safety margin during the transition.</li>
 <li><strong>Week 9+: p=reject; pct=100</strong> &mdash; Full enforcement. All emails failing authentication are rejected outright.</li>
 </ol>

 <p className="text-gray-600 leading-relaxed mb-6">
 This phased approach ensures you don&apos;t accidentally block legitimate emails. Use the <Link href="/tools/dmarc-generator" className="text-blue-600 hover:underline">DMARC Generator tool</Link> to create records with the correct <code className="bg-gray-100 px-1.5 py-0.5 text-sm">pct</code> values at each stage of the rollout.
 </p>

 <h2 id="dmarc-reporting" className="text-2xl font-bold text-gray-900 mt-12 mb-4">DMARC Reporting: Understanding rua and ruf</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DMARC provides two types of reports that give domain owners visibility into email authentication activity:
 </p>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Aggregate Reports (rua)</h3>
 <p className="text-gray-600 text-sm mb-3">
 Aggregate reports are XML documents sent by receiving mail servers (typically once per day) that summarize authentication results for your domain. They show the volume of emails processed, which IPs sent them, and whether each email passed or failed SPF, DKIM, and DMARC alignment.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>You should always enable rua.</strong> These reports are the foundation of DMARC monitoring. Without them, you are flying blind &mdash; you have no visibility into who is sending email using your domain or whether authentication is working.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Forensic Reports (ruf)</h3>
 <p className="text-gray-600 text-sm mb-3">
 Forensic reports (also called failure reports) contain details about individual emails that failed authentication, including header information and sometimes message content. They are useful for diagnosing specific authentication failures.
 </p>
 <p className="text-gray-600 text-sm">
 <strong>Note:</strong> Many ISPs do not send forensic reports due to privacy concerns. Aggregate reports (rua) are far more widely supported and should be your primary monitoring mechanism.
 </p>
 </div>

 <div className="bg-gray-900 text-green-400 p-6 mb-8 font-mono text-sm overflow-x-auto">
 <p className="text-gray-500 mb-2"># DMARC record with both report types</p>
 <p>v=DMARC1; p=quarantine; rua=mailto:dmarc-agg@yourdomain.com; ruf=mailto:dmarc-forensic@yourdomain.com; pct=100</p>
 </div>

 <h2 id="how-to-use-tools" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How to Use the Free DMARC Lookup and Generator Tools</h2>

 <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">DMARC Lookup Tool</h3>
 <p className="text-gray-600 leading-relaxed mb-6">
 The <Link href="/tools/dmarc-lookup" className="text-blue-600 hover:underline">DMARC Lookup tool</Link> checks your domain&apos;s existing DMARC configuration:
 </p>
 <ol className="space-y-3 text-gray-600 mb-8 list-decimal pl-5">
 <li><strong>Enter your domain</strong> &mdash; Type the domain you want to check (e.g., <code className="bg-gray-100 px-1.5 py-0.5 text-sm">yourdomain.com</code>).</li>
 <li><strong>Run the lookup</strong> &mdash; The tool queries the TXT record at <code className="bg-gray-100 px-1.5 py-0.5 text-sm">_dmarc.yourdomain.com</code>.</li>
 <li><strong>Review the results</strong> &mdash; See your current policy level, reporting addresses, alignment mode, and percentage value.</li>
 </ol>

 <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">DMARC Generator Tool</h3>
 <p className="text-gray-600 leading-relaxed mb-6">
 The <Link href="/tools/dmarc-generator" className="text-blue-600 hover:underline">DMARC Generator tool</Link> creates a properly formatted DMARC record:
 </p>
 <ol className="space-y-3 text-gray-600 mb-8 list-decimal pl-5">
 <li><strong>Select your policy level</strong> &mdash; Choose none, quarantine, or reject based on where you are in the rollout process.</li>
 <li><strong>Add reporting addresses</strong> &mdash; Enter email addresses for aggregate (rua) and optionally forensic (ruf) reports.</li>
 <li><strong>Configure alignment</strong> &mdash; Choose relaxed (default, recommended) or strict alignment for SPF and DKIM.</li>
 <li><strong>Set the percentage</strong> &mdash; Specify what percentage of failing emails the policy applies to (default is 100).</li>
 <li><strong>Copy the record</strong> &mdash; The tool outputs a complete DMARC TXT record ready to publish at <code className="bg-gray-100 px-1.5 py-0.5 text-sm">_dmarc.yourdomain.com</code>.</li>
 </ol>

 <h2 id="alignment-modes" className="text-2xl font-bold text-gray-900 mt-12 mb-4">DMARC Alignment: Strict vs Relaxed</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 DMARC alignment determines how strictly the domain in the From header must match the domain that passed SPF or DKIM. There are two modes:
 </p>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Relaxed Alignment (adkim=r; aspf=r)</h3>
 <p className="text-gray-600 text-sm">
 Relaxed alignment allows the organizational domain (e.g., <code className="bg-gray-100 px-1 text-xs">yourdomain.com</code>) to match, even if the specific subdomain differs. For example, an email from <code className="bg-gray-100 px-1 text-xs">mail.yourdomain.com</code> would align with DKIM signed by <code className="bg-gray-100 px-1 text-xs">yourdomain.com</code>. This is the default mode and is <strong>recommended for most outbound teams</strong> because it accommodates subdomains and third-party sending services.
 </p>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Strict Alignment (adkim=s; aspf=s)</h3>
 <p className="text-gray-600 text-sm">
 Strict alignment requires an exact domain match. The From header domain must exactly match the domain used in SPF or DKIM. This provides stronger spoofing protection but can cause legitimate emails to fail alignment if you use subdomains or third-party services that sign with a different domain.
 </p>
 </div>

 <h2 id="google-yahoo-requirements" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Google and Yahoo DMARC Requirements</h2>
 <p className="text-gray-600 leading-relaxed mb-6">
 Since February 2024, Google and Yahoo enforce specific email authentication requirements for bulk senders. These requirements are not optional &mdash; non-compliance results in throttling and rejection of your emails. Here is what you need:
 </p>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Requirements for All Senders</h3>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Valid <Link href="/tools/spf-lookup" className="text-blue-600 hover:underline">SPF</Link> record for your sending domain</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Valid <Link href="/tools/dkim-lookup" className="text-blue-600 hover:underline">DKIM</Link> signing for outgoing emails</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Published DMARC record (at minimum <code className="bg-gray-100 px-1 text-xs">p=none</code>)</li>
 </ul>
 </div>

 <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-3">Additional Requirements for Bulk Senders (5,000+ emails/day)</h3>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> DMARC alignment must pass (SPF or DKIM domain aligns with From header)</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> One-click unsubscribe support in marketing emails</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> Spam complaint rate below 0.3% (target below 0.1%)</li>
 </ul>
 </div>

 <p className="text-gray-600 leading-relaxed mb-6">
 For outbound email teams, this means every sending domain must have SPF, DKIM, and DMARC configured. Use our <Link href="/blog/email-authentication-checker-tools" className="text-blue-600 hover:underline">complete authentication checker</Link> to verify all three protocols at once across all your domains.
 </p>

 <h2 id="faq" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently Asked Questions</h2>

 <div className="space-y-6 mb-12">
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">What is the difference between DMARC p=none, p=quarantine, and p=reject?</h3>
 <p className="text-gray-600 text-sm"><code className="bg-gray-100 px-1 text-xs">p=none</code> tells receiving servers to take no action on failing emails &mdash; it is monitoring only. <code className="bg-gray-100 px-1 text-xs">p=quarantine</code> instructs servers to route failing emails to spam. <code className="bg-gray-100 px-1 text-xs">p=reject</code> tells servers to block failing emails entirely. Start with none, progress to quarantine, and eventually to reject.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">Is DMARC required for email sending in 2024 and beyond?</h3>
 <p className="text-gray-600 text-sm">Yes. Since February 2024, Google and Yahoo require all bulk senders to have a DMARC record published. Even senders below the bulk threshold benefit from DMARC because it provides ISPs with a clear policy, which positively influences inbox placement decisions.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">What are DMARC aggregate reports (rua) and why should I enable them?</h3>
 <p className="text-gray-600 text-sm">Aggregate reports (rua) are XML reports from receiving mail servers showing who is sending email using your domain and whether those emails pass authentication. They are essential for identifying unauthorized senders, diagnosing failures, and verifying your setup before tightening your policy. Always enable rua.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">What is DMARC alignment and why does it matter?</h3>
 <p className="text-gray-600 text-sm">DMARC alignment means the From header domain must match the domain that passed SPF or DKIM. There are two modes: strict (exact match) and relaxed (organizational domain match, allowing subdomains). Relaxed alignment is the default and recommended for most outbound teams.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">How long should I stay on p=none before moving to p=quarantine?</h3>
 <p className="text-gray-600 text-sm">Monitor with <code className="bg-gray-100 px-1 text-xs">p=none</code> for 2-4 weeks while reviewing aggregate reports. Once all legitimate email sources pass authentication, move to <code className="bg-gray-100 px-1 text-xs">p=quarantine</code>. After another 2-4 weeks with no issues, progress to <code className="bg-gray-100 px-1 text-xs">p=reject</code>. Use the <code className="bg-gray-100 px-1 text-xs">pct</code> tag to roll out gradually.</p>
 </div>
 <div className="border border-gray-100 p-6">
 <h3 className="font-bold text-gray-900 mb-2">Can I apply DMARC to only a percentage of my emails?</h3>
 <p className="text-gray-600 text-sm">Yes. The <code className="bg-gray-100 px-1 text-xs">pct</code> tag specifies the percentage of failing emails to which the policy applies. For example, <code className="bg-gray-100 px-1 text-xs">pct=25</code> means only 25% of failing emails will be quarantined or rejected. Start with 25%, increase to 50%, then 100% once confident.</p>
 </div>
 </div>

 </div>

 <BottomCtaStrip
 headline="Stop Managing DMARC Manually"
 body="The free DMARC tools help you check and create records, but outbound teams running multiple domains need continuous policy monitoring. Superkabe tracks DMARC policies across all your sending domains, alerts you when policies are too permissive, and monitors aggregate report data to catch authentication failures before they compound."
 primaryCta={{ label: 'Start free trial', href: '/signup' }}
 secondaryCta={{ label: 'See how it works', href: '/' }}
 />

 <div className="mt-16 pt-10 border-t border-gray-100">
 <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
 <p className="text-gray-600 leading-relaxed max-w-3xl">
 Superkabe continuously monitors DMARC policies across all your sending domains. When a domain is missing DMARC, has a policy that is too permissive for its maturity level, or shows authentication failures in aggregate report data, Superkabe flags the issue and recommends the appropriate policy progression.
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
 <Link href="/blog/free-dkim-lookup-tool" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Free DKIM Lookup Tool</h3>
 <p className="text-gray-500 text-xs">Verify your email signatures are valid</p>
 </Link>
 <Link href="/blog/email-authentication-checker-tools" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Email Authentication Checker Tools</h3>
 <p className="text-gray-500 text-xs">SPF, DKIM &amp; DMARC verification in one place</p>
 </Link>
 <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate &amp; Deliverability</h3>
 <p className="text-gray-500 text-xs">How bounces destroy sender reputation</p>
 </Link>
 <Link href="/blog/domain-warming-methodology" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
 <h3 className="font-bold text-gray-900 text-sm mb-2">Domain Warming Methodology</h3>
 <p className="text-gray-500 text-xs">Building sender reputation on new domains</p>
 </Link>
 </div>
 <div className="mt-6">
 <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">&larr; See how Superkabe protects your infrastructure</Link>
 </div>
 </section>
 </>
 );
}

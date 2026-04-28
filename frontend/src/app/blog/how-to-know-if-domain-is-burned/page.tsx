import Link from 'next/link';
import type { Metadata } from 'next';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

export const metadata: Metadata = {
 title: 'How Do I Know If My Email Domain Is Burned?',
 description: '7 warning signs your sending domain is burned and the exact steps to diagnose, recover, or replace it.',
 openGraph: {
 title: 'How Do I Know If My Email Domain Is Burned?',
 description: '7 warning signs your sending domain is burned and the exact steps to diagnose, recover, or replace it.',
 url: '/blog/how-to-know-if-domain-is-burned',
 siteName: 'Superkabe',
 type: 'article',
 publishedTime: '2026-04-18',
 },
 twitter: {
     card: 'summary_large_image',
     title: 'How Do I Know If My Email Domain Is Burned?',
     description: '7 warning signs your sending domain is burned and the exact steps to diagnose, recover, or replace it.',
     images: ['/image/og-image.png'],
 },
 alternates: { canonical: '/blog/how-to-know-if-domain-is-burned' },
};

export default function HowToKnowIfDomainIsBurnedArticle() {
 const blogPostingSchema = {
 "@context": "https://schema.org",
 "@type": "BlogPosting",
 "headline": "How Do I Know If My Email Domain Is Burned?",
 "description": "7 warning signs your sending domain is burned and the exact steps to diagnose, recover, or replace it.",
 "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Deliverability Specialist", "url": "https://www.superkabe.com" },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.superkabe.com/blog/how-to-know-if-domain-is-burned" },
 "datePublished": "2026-04-18",
 "dateModified": "2026-04-18",
        "image": { "@type": "ImageObject", "url": "https://www.superkabe.com/image/og-image.png", "width": 1200, "height": 630 },
 "speakable": {
 "@type": "SpeakableSpecification",
 "cssSelector": [".snippet-answer"]
 }
 };

 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "How long does it take to burn a cold email domain?",
 "acceptedAnswer": { "@type": "Answer", "text": "A domain can burn in as little as 3-5 days if bounce rates spike above 5% or spam complaints exceed 0.3%. Under normal cold email conditions with moderate issues, burnout typically happens over 2-4 weeks as reputation degrades gradually. Domains that were properly warmed up and managed conservatively can last 6-12 months before needing rotation. The speed depends on volume, bounce rate, spam complaint rate, and whether you are monitoring and reacting to early warning signs." }
 },
 {
 "@type": "Question",
 "name": "Can I use a burned domain for anything else?",
 "acceptedAnswer": { "@type": "Answer", "text": "A burned sending domain should not be used for cold email, but it can still function for other purposes. You can use it for a landing page, website hosting, or warm email to people who have opted in. The sending reputation is what is damaged — the domain itself still resolves. However, if the domain is on Spamhaus or similar critical blacklists, even transactional emails from that domain may have deliverability issues. Some teams park burned domains for 6-12 months then attempt re-warming, though success rates are low." }
 },
 {
 "@type": "Question",
 "name": "How many backup domains should I have for cold email?",
 "acceptedAnswer": { "@type": "Answer", "text": "A general rule is to have 1.5-2x the number of domains you are actively sending from as backups in various stages of warmup. If you send from 10 domains, keep 5-10 more warming up. This ensures you can rotate out a burned domain without interrupting campaigns. Each domain should have 2-3 mailboxes and send no more than 50-75 emails per mailbox per day. Warming up backup domains continuously is cheaper than the revenue lost from pausing campaigns while you wait for new domains to warm up." }
 }
 ]
 };

 return (
 <>
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog"}, {"@type": "ListItem", "position": 3, "name": "How Do I Know If My Email Domain Is Burned?", "item": "https://www.superkabe.com/blog/how-to-know-if-domain-is-burned"}]}) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

 <article>
 <BlogHeader
 tag="Troubleshooting"
 title="How Do I Know If My Email Domain Is Burned?"
 dateModified="2026-04-25"
 authorName="Robert Smith"
 authorRole="Deliverability Specialist · Superkabe"
 />

 <FeaturedHero
 badge="TROUBLESHOOTING · 2026"
 eyebrow="11 min read"
 tagline="Spot a burned cold email domain"
 sub="Symptoms · Tests · Recovery odds · Replace vs revive"
 />

 <p className="text-lg text-gray-700 leading-relaxed mb-12">
 A burned domain shows these signs: bounce rates above 3%, emails consistently landing in spam, Google Postmaster showing LOW or BAD reputation, blacklisted on Spamhaus or Barracuda, and open/reply rates near zero despite good copy. If you see 3 or more of these, the domain is likely burned and you need to decide between recovery and replacement.
 </p>

 <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
 <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
 <ul className="space-y-2 text-blue-800 text-sm">
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> A single warning sign is a problem to fix — 3 or more together means the domain is burned</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Google Postmaster Tools is the most authoritative source for domain reputation data</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Recovery is possible if caught within the first 1-2 weeks — after 30 days, replacement is faster</li>
 <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Automated monitoring detects burnout early enough to save most domains before they are fully burned</li>
 </ul>
 </div>

 <div className="prose prose-lg max-w-none">
 <p className="text-gray-600 leading-relaxed mb-6">
 &ldquo;Burned&rdquo; is not a technical classification — it is an operational reality. A burned domain is one where ISPs have decided that emails from your domain are unwanted, and they are routing them to spam or rejecting them outright. There is no single threshold that defines &ldquo;burned.&rdquo; Instead, it is a constellation of signals that together indicate your domain reputation has degraded beyond the point where normal sending is effective. Here are the 7 signs to watch for.
 </p>

 <h2 id="bounce-rate-above-3" className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Bounce rate above 3%</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 A healthy cold email domain maintains bounce rates below 2%. Between 2-3% is a warning zone. Above 3% sustained over multiple sends is a strong indicator of domain damage. At 5%+, damage is almost certainly severe.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Check your bounce rate in your sending platform (Smartlead, Instantly) and calculate it as: <code className="bg-gray-100 px-1 text-sm">(bounced emails / total sent) x 100</code>. Look at the trend, not just the current number. A domain with 1.5% bounce rate that has been climbing by 0.3% per week is heading toward burnout even though it has not crossed 3% yet.
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> Stop sending from this domain immediately. <Link href="/blog/reduce-cold-email-bounce-rate" className="text-blue-600 hover:text-blue-800">Investigate the bounce causes</Link> — are they hard bounces (invalid addresses) or soft bounces (reputation-based rejections)? Hard bounces indicate a list quality problem. Soft bounces indicate the domain is already being flagged by ISPs.</p>
 </div>

 <h2 id="all-emails-spam" className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. All emails going to spam</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 If your emails are consistently landing in spam across multiple recipients and ISPs, the domain reputation is the likely culprit. Test this by sending to seed accounts at Gmail, Outlook, and Yahoo. If the email lands in spam at all three, the problem is domain-level, not content-level.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Be specific about the pattern. If emails land in spam only at Gmail but inbox at Outlook, the problem may be Gmail-specific reputation (check Postmaster Tools) rather than a fully burned domain. If spam placement is universal across providers, the domain is burned. You can also use inbox placement tools like <a href="https://glockapps.com" target="_blank" rel="nofollow noopener noreferrer">GlockApps</a> to test placement across dozens of seed addresses.
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> Send test emails to personal accounts at different providers. If spam placement is across Gmail, Outlook, and Yahoo, the domain is burned. If it is limited to one provider, focus recovery efforts on that specific reputation system.</p>
 </div>

 <h2 id="postmaster-low-bad" className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Google Postmaster shows LOW or BAD reputation</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 <a href="https://postmaster.google.com" target="_blank" rel="nofollow noopener noreferrer">Google Postmaster Tools</a> is the single most authoritative data source for how Gmail perceives your domain. It shows four reputation levels: HIGH, MEDIUM, LOW, and BAD. A domain at LOW is in serious trouble. A domain at BAD is effectively burned for Gmail — which represents roughly 30-40% of all email recipients.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 If you do not have Google Postmaster connected, set it up now. It takes 5 minutes and requires adding a DNS TXT record to verify domain ownership. The tool shows reputation, spam rate, authentication ratios (SPF, DKIM, DMARC), and delivery errors. Note that data has a 24-48 hour delay, so what you see today reflects your sending from 1-2 days ago.
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> If reputation is LOW, stop live campaigns and run warmup-only for 2-3 weeks. Monitor Postmaster daily for improvement. If reputation is BAD and has been for more than 2 weeks, recovery is unlikely — begin preparing a replacement domain. See our <Link href="/blog/domain-reputation-recovery-guide" className="text-blue-600 hover:text-blue-800">domain reputation recovery guide</Link> for the full process.</p>
 </div>

 <h2 id="listed-critical-blacklists" className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Listed on critical blacklists</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 Being listed on Spamhaus SBL/DBL or Barracuda BRBL is one of the strongest signals of a burned domain. These blacklists are checked by virtually every major ISP and corporate mail server. A Spamhaus listing means your emails are being rejected or spam-filtered by the majority of recipients worldwide.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Check using <a href="https://mxtoolbox.com/blacklists.aspx" target="_blank" rel="nofollow noopener noreferrer">MXToolbox Blacklist Check</a> or Superkabe&rsquo;s built-in <Link href="/docs/infrastructure-assessment" className="text-blue-600 hover:text-blue-800">410-DNSBL monitoring</Link>. Being on minor blacklists (UCEPROTECT, PSBL) is concerning but not definitive. Being on Spamhaus or Barracuda alongside other warning signs almost certainly means the domain is burned.
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> Follow the <Link href="/blog/how-to-remove-domain-from-blacklist" className="text-blue-600 hover:text-blue-800">blacklist removal process</Link>. Fix the root cause first, then request delisting. If the listing has persisted for more than 30 days, domain replacement is usually faster than waiting for reputation recovery after delisting.</p>
 </div>

 <h2 id="open-rate-near-zero" className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Open rate dropped to near zero</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 Cold email open rates typically range from 15-30% for well-targeted campaigns. If your open rate has dropped below 5% and you have verified that your subject lines are not the problem (test the same subject lines from a different, healthy domain), the emails are landing in spam. ISPs are not even showing them to recipients.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 A gradual decline over weeks suggests progressive reputation damage. A sudden drop to near-zero suggests an acute event — a blacklisting, a DNS failure, or a recipient server blocking your domain entirely. Check your sending platform&rsquo;s analytics for the date the decline started and cross-reference with any changes you made (new campaign, volume increase, new lead source).
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> Send the same email from a healthy domain to a small test list. If open rates are normal from the other domain, the issue is confirmed as domain reputation. If open rates are low from both domains, the problem may be content-related or ISP-wide.</p>
 </div>

 <h2 id="warmup-scores-declining" className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Warmup tool shows declining scores</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 If you are running warmup alongside live campaigns (which you should be), your warmup tool will show inbox placement scores. A healthy warmup score is 85-100%. If warmup scores are declining — dropping from 90% to 70% to 50% over successive days — your domain reputation is actively degrading and the warmup cannot keep up.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Warmup tools like <a href="https://www.warmupinbox.com" target="_blank" rel="nofollow noopener noreferrer">Warmup Inbox</a> or Instantly&rsquo;s built-in warmup show how many of their test emails landed in inbox vs spam. This is a leading indicator — warmup scores often decline 3-5 days before live campaign metrics show problems because warmup systems check placement actively rather than relying on open tracking.
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> If warmup scores drop below 70%, reduce live volume by 50% immediately. If they drop below 50%, stop live campaigns entirely and run warmup-only until scores recover above 85%. See our guide on <Link href="/blog/why-cold-emails-go-to-spam" className="text-blue-600 hover:text-blue-800">why cold emails go to spam after warmup</Link>.</p>
 </div>

 <h2 id="isp-reputation-errors" className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. ISP error codes mention &ldquo;reputation&rdquo;</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 When emails bounce or are rejected, the receiving server returns an error code and message. If you see messages like &ldquo;550 5.7.1 Our system has detected that this message is likely suspicious due to the very low reputation of the sending domain&rdquo; (Gmail) or &ldquo;550 5.7.606 Access denied, banned sending IP&rdquo; (Outlook), the ISP is explicitly telling you that your reputation is the problem.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Check your bounce logs in Smartlead, Instantly, or whatever platform you use. Filter for 5xx error codes (permanent failures) and look for keywords like &ldquo;reputation,&rdquo; &ldquo;spam,&rdquo; &ldquo;blocked,&rdquo; &ldquo;denied,&rdquo; or &ldquo;policy.&rdquo; These are different from invalid address bounces (which say &ldquo;user unknown&rdquo; or &ldquo;mailbox not found&rdquo;) and indicate domain-level reputation problems.
 </p>
 <div className="bg-amber-50 border border-amber-200 p-5 mb-6">
 <p className="text-amber-900 text-sm m-0"><strong>What to do:</strong> Document which ISPs are returning reputation-based rejections. If it is only one ISP, targeted recovery is possible. If multiple ISPs are rejecting on reputation, the domain is burned and replacement should be prioritized.</p>
 </div>

 <h2 id="recovery-vs-replace" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Recovery vs replacement: a decision framework</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 Not every damaged domain needs to be replaced. Some can be recovered with time and effort. Use this framework to decide:
 </p>
 <div className="overflow-x-auto mb-8">
 <table className="w-full text-sm text-left border-collapse">
 <thead>
 <tr className="border-b-2 border-gray-200">
 <th className="py-3 pr-4 font-bold text-gray-900">Factor</th>
 <th className="py-3 px-3 font-bold text-gray-900 text-emerald-700">Attempt Recovery</th>
 <th className="py-3 px-3 font-bold text-gray-900 text-red-700">Replace the Domain</th>
 </tr>
 </thead>
 <tbody className="text-gray-600">
 <tr className="border-b border-gray-100">
 <td className="py-2.5 pr-4 font-medium text-gray-900">Warning signs present</td>
 <td className="py-2.5 px-3">1-2 signs</td>
 <td className="py-2.5 px-3">3+ signs</td>
 </tr>
 <tr className="border-b border-gray-100">
 <td className="py-2.5 pr-4 font-medium text-gray-900">Postmaster reputation</td>
 <td className="py-2.5 px-3">MEDIUM or LOW</td>
 <td className="py-2.5 px-3">BAD for 2+ weeks</td>
 </tr>
 <tr className="border-b border-gray-100">
 <td className="py-2.5 pr-4 font-medium text-gray-900">Blacklist status</td>
 <td className="py-2.5 px-3">Not on Spamhaus</td>
 <td className="py-2.5 px-3">On Spamhaus 30+ days</td>
 </tr>
 <tr className="border-b border-gray-100">
 <td className="py-2.5 pr-4 font-medium text-gray-900">Duration of issues</td>
 <td className="py-2.5 px-3">Under 2 weeks</td>
 <td className="py-2.5 px-3">Over 4 weeks</td>
 </tr>
 <tr className="border-b border-gray-100">
 <td className="py-2.5 pr-4 font-medium text-gray-900">Domain age</td>
 <td className="py-2.5 px-3">6+ months, established</td>
 <td className="py-2.5 px-3">Under 3 months, easily replaced</td>
 </tr>
 <tr>
 <td className="py-2.5 pr-4 font-medium text-gray-900">Recovery timeline</td>
 <td className="py-2.5 px-3">2-4 weeks warmup-only</td>
 <td className="py-2.5 px-3">2-3 weeks for new domain setup + warmup</td>
 </tr>
 </tbody>
 </table>
 </div>
 <p className="text-gray-600 leading-relaxed mb-6">
 If you decide to recover, the process is: stop all live campaigns, run warmup-only for 2-4 weeks, monitor Postmaster Tools daily, fix all DNS issues, and gradually reintroduce live volume at 25% of previous levels. Read the full process in our <Link href="/blog/domain-burned-recovery-prevention" className="text-blue-600 hover:text-blue-800">domain burnout recovery guide</Link>.
 </p>

 <h2 id="superkabe-detects-burnout" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe detects domain burnout early</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 The 7 warning signs above are all detectable before the domain is fully burned — if you have monitoring in place. Superkabe tracks all of these signals in real time and takes automated action to prevent burnout:
 </p>
 <div className="space-y-3 mb-8">
 <div className="p-4 bg-white border border-[#D1CBC5] ">
 <p className="m-0 text-sm text-gray-700"><strong className="text-gray-900">Predictive risk scoring:</strong> Superkabe assigns a <Link href="/docs/risk-scoring" className="text-blue-600 hover:text-blue-800">health score</Link> to every domain and mailbox based on bounce rate trends, blacklist status, DNS health, and sending patterns. When a domain&rsquo;s score declines, you get an alert before the damage becomes visible in campaign metrics.</p>
 </div>
 <div className="p-4 bg-white border border-[#D1CBC5] ">
 <p className="m-0 text-sm text-gray-700"><strong className="text-gray-900">Auto-pause before the 3% threshold:</strong> Superkabe does not wait until a domain is burned to act. Mailboxes are auto-paused when bounce rates approach dangerous levels — typically at the 2-2.5% range — before ISPs have time to downgrade your reputation.</p>
 </div>
 <div className="p-4 bg-white border border-[#D1CBC5] ">
 <p className="m-0 text-sm text-gray-700"><strong className="text-gray-900">5-phase healing pipeline:</strong> Paused mailboxes enter Superkabe&rsquo;s <Link href="/docs/warmup-recovery" className="text-blue-600 hover:text-blue-800">automated recovery pipeline</Link> — assessment, cooldown, re-warmup, validation send, and restoration. This is the same recovery process described above, but fully automated.</p>
 </div>
 <div className="p-4 bg-white border border-[#D1CBC5] ">
 <p className="m-0 text-sm text-gray-700"><strong className="text-gray-900">Continuous DNS and blacklist monitoring:</strong> Superkabe checks <Link href="/blog/spf-dkim-dmarc-explained" className="text-blue-600 hover:text-blue-800">SPF, DKIM, and DMARC</Link> health and queries 410 blacklists continuously. DNS failures and new blacklist listings trigger immediate alerts.</p>
 </div>
 </div>

 <h2 id="faq" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently Asked Questions</h2>
 <div className="space-y-4 mb-12">
 <details className="p-4 bg-gray-50 border border-gray-200 group">
 <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">How long does it take to burn a cold email domain? <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span></summary>
 <p className="mt-3 text-sm text-gray-600">A domain can burn in as little as 3-5 days if bounce rates spike above 5% or spam complaints exceed 0.3%. Under normal conditions with moderate issues, burnout typically happens over 2-4 weeks. Well-managed domains can last 6-12 months. The speed depends on volume, bounce rate, complaint rate, and whether you are monitoring for early warning signs.</p>
 </details>
 <details className="p-4 bg-gray-50 border border-gray-200 group">
 <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">Can I use a burned domain for anything else? <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span></summary>
 <p className="mt-3 text-sm text-gray-600">A burned sending domain should not be used for cold email, but it can still work for landing pages, website hosting, or warm email to opted-in contacts. The sending reputation is damaged, not the domain itself. Some teams park burned domains for 6-12 months then attempt re-warming, though success rates are low for domains that were on critical blacklists.</p>
 </details>
 <details className="p-4 bg-gray-50 border border-gray-200 group">
 <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">How many backup domains should I have for cold email? <span className="text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span></summary>
 <p className="mt-3 text-sm text-gray-600">Keep 1.5-2x the number of domains you are actively sending from as backups in various warmup stages. If you send from 10 domains, have 5-10 more warming up. Each domain should have 2-3 mailboxes sending no more than 50-75 emails per day. Read our <Link href="/blog/how-many-cold-emails-per-day" className="text-blue-600 hover:text-blue-800">daily sending limits guide</Link> for detailed scaling recommendations.</p>
 </details>
 </div>
 </div>

 <BottomCtaStrip
 headline="Detect domain burnout before it happens"
 body={`Superkabe monitors every warning sign of domain burnout in real time — bounce rates, blacklists, DNS health — and auto-pauses mailboxes before the damage becomes permanent.`}
 primaryCta={{ label: 'Start free trial', href: '/signup' }}
 secondaryCta={{ label: 'See how it works', href: '/' }}
 />
 </article>
 </>
 );
}

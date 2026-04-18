import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How ZeroBounce Handles Catch-All Domains',
    description: 'ZeroBounce labels catch-all emails but leaves the send decision to you. Learn what ZeroBounce does with catch-all domains, where it stops, and how to send.',
    openGraph: {
        title: 'How ZeroBounce Handles Catch-All Domains',
        description: 'ZeroBounce flags catch-all addresses but cannot protect your infrastructure if you send to them. Here is what it does, what it misses, and how to fill the gap.',
        url: '/blog/zerobounce-catch-all-handling',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-04-07',
    },
    alternates: {
        canonical: '/blog/zerobounce-catch-all-handling',
    },
};

export default function ZeroBounceCatchAllHandlingArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "How ZeroBounce Handles Catch-All Domains",
        "description": "ZeroBounce labels catch-all emails but leaves the send decision to you. Learn what ZeroBounce does with catch-all domains, where it stops, and how to send.",
        "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Email Infrastructure Engineer", "url": "https://www.superkabe.com" },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "datePublished": "2026-04-07",
        "dateModified": "2026-04-07",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/zerobounce-catch-all-handling"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How does ZeroBounce classify catch-all emails?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ZeroBounce returns a 'catch-all' status for emails on catch-all domains. This is separate from 'valid', 'invalid', or 'unknown'. It means ZeroBounce detected that the domain accepts all emails regardless of whether the specific mailbox exists. The tool does not attempt to determine if the individual address is real — it just flags the domain type."
                }
            },
            {
                "@type": "Question",
                "name": "Should I send to emails ZeroBounce marks as catch-all?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "It depends on your risk tolerance and infrastructure. If you skip all catch-all emails, you lose 30-40% of your B2B pipeline. If you send to all of them without protection, you risk bounce rates of 5-8%. The practical middle ground is to send to catch-all addresses but with volume caps per mailbox and bounce monitoring in place so you can pause before damage occurs."
                }
            },
            {
                "@type": "Question",
                "name": "Does ZeroBounce monitor bounces after I send to catch-all leads?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. ZeroBounce is a pre-send verification tool. Once you decide to send to a catch-all address, ZeroBounce has no visibility into what happens next. It cannot track whether the email bounced, whether your mailbox bounce rate spiked, or whether your domain reputation took damage. You need a separate monitoring layer for post-send protection."
                }
            },
            {
                "@type": "Question",
                "name": "What percentage of B2B emails are on catch-all domains?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Roughly 30-40% of B2B email addresses sit on catch-all domains. The percentage skews higher for enterprise and mid-market companies. Government organizations and large corporations are especially likely to run catch-all configurations. If your ICP includes companies with 200+ employees, expect a third or more of your leads to be catch-all."
                }
            },
            {
                "@type": "Question",
                "name": "Can ZeroBounce tell me if a specific address on a catch-all domain is real?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. That is the fundamental limitation of catch-all domains. The server accepts everything at the SMTP level, so there is no way for ZeroBounce (or any verification tool using SMTP probing) to distinguish a real mailbox from a fake one. ZeroBounce can only tell you the domain is catch-all — not whether your specific contact exists."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between ZeroBounce catch-all and unknown status?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Catch-all means ZeroBounce confirmed the domain accepts all emails regardless of whether the address exists. Unknown means ZeroBounce could not determine the email status at all — the server may have been temporarily unreachable, rate-limiting verification attempts, or using greylisting. Catch-all is a definitive classification. Unknown is inconclusive."
                }
            }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                    How ZeroBounce handles catch-all domains (and what it misses)
                </h1>
                <p className="text-gray-400 text-sm mb-8">10 min read &middot; Published April 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    ZeroBounce flags catch-all emails with a dedicated status label. That is genuinely helpful. But the label itself does not solve the problem. You still have to decide what to do with 30-40% of your lead list, and ZeroBounce cannot protect you after you make that decision.
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> ZeroBounce returns a &quot;catch-all&quot; status for domains that accept all emails. It does not risk-score individual addresses</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Skipping all catch-all leads means losing a third of your B2B pipeline. Sending to all of them risks 5-8% bounce rates</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> ZeroBounce has no post-send monitoring. If catch-all leads bounce, nobody auto-pauses your mailbox</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> The practical approach: use ZeroBounce for initial verification, then layer Superkabe for catch-all risk distribution and bounce monitoring</li>
                    </ul>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                        <li><a href="#catch-all-quick-refresher" style={{ color: '#2563EB', textDecoration: 'none' }}>Quick refresher: what catch-all domains are</a></li>
                        <li><a href="#how-zerobounce-handles-catch-all" style={{ color: '#2563EB', textDecoration: 'none' }}>How ZeroBounce handles catch-all</a></li>
                        <li><a href="#what-zerobounce-does-well" style={{ color: '#2563EB', textDecoration: 'none' }}>What ZeroBounce does well</a></li>
                        <li><a href="#the-gap" style={{ color: '#2563EB', textDecoration: 'none' }}>The gap after you press send</a></li>
                        <li><a href="#the-numbers" style={{ color: '#2563EB', textDecoration: 'none' }}>The real numbers on catch-all risk</a></li>
                        <li><a href="#risk-aware-distribution" style={{ color: '#2563EB', textDecoration: 'none' }}>Risk-aware distribution: the middle ground</a></li>
                        <li><a href="#faq" style={{ color: '#2563EB', textDecoration: 'none' }}>FAQ</a></li>
                    </ol>
                </div>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <h2 id="catch-all-quick-refresher" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Quick refresher: what catch-all domains are</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        A catch-all domain is one where the mail server accepts emails sent to any address. Real employee, former employee, typo, completely made-up name &mdash; the server says &quot;sure, I will take it&quot; at the SMTP level. What happens after that varies. Some servers dump unmatched emails into a shared inbox. Others silently discard them. Others bounce them internally, hours or days later.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The problem for cold outreach teams: your verification tool cannot tell whether a specific address on a catch-all domain belongs to a real person. The server looks valid for everything. We covered this in depth in our <Link href="/blog/catch-all-domains-cold-outreach" className="text-blue-600 hover:text-blue-800 underline">catch-all domains deep dive</Link> &mdash; read that if you want the full technical breakdown. For this article, the key point is simple: catch-all domains make verification results unreliable for those addresses.
                    </p>

                    {/* Section 2 */}
                    <h2 id="how-zerobounce-handles-catch-all" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How ZeroBounce handles catch-all</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        ZeroBounce takes a straightforward approach. When it checks an email address, it probes the mail server. If the server accepts a test email to a clearly fake address, ZeroBounce classifies the domain as catch-all. Every email on that domain then gets a &quot;catch-all&quot; status in your results.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">ZeroBounce catch-all behavior</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>Status label:</strong> Returns &quot;catch-all&quot; as a distinct status (not valid, not invalid, not unknown)</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>No risk scoring:</strong> Every catch-all address gets the same label regardless of other signals. No 0-100 risk score, no confidence level</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>Decision is yours:</strong> ZeroBounce flags it. What you do with that flag is entirely up to you</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>No per-mailbox awareness:</strong> The tool has no concept of which mailbox will send to that address or how many risky leads that mailbox already has</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>No memory across runs:</strong> If you verify the same domain next month, ZeroBounce checks it fresh. No cached domain intelligence</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is an honest approach. ZeroBounce does not pretend it can verify individual addresses on catch-all domains. It tells you the domain type and lets you decide. The question is whether a binary label gives you enough information to make a good decision.
                    </p>

                    {/* Section 3 */}
                    <h2 id="what-zerobounce-does-well" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What ZeroBounce does well</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Before getting into limitations, ZeroBounce deserves credit for what it does right. This is one of the top verification tools for a reason.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">ZeroBounce strengths</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Non-catch-all accuracy:</strong> Around 98% detection rate for truly invalid addresses on standard domains. Best-in-class</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Spam trap detection:</strong> Identifies known spam trap addresses. Valuable for cold email where one spam trap hit can tank your sender score</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Activity scoring:</strong> Tells you if an email address has been active recently. Helps you prioritize leads beyond just &quot;is this address valid?&quot;</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Data append:</strong> Returns name, gender, location, and account creation date. Useful enrichment if your CRM data is sparse</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Catch-all detection itself:</strong> The fact that ZeroBounce flags catch-all domains at all is valuable. Some cheaper tools just return &quot;valid&quot; for everything on a catch-all domain</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        For emails on non-catch-all domains, ZeroBounce is excellent. You get a clean valid/invalid result with high confidence. The data enrichment is a nice bonus. If your entire list happened to be on standard domains, ZeroBounce would be all you need.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        But your list is not all standard domains. Not even close.
                    </p>

                    {/* Section 4 */}
                    <h2 id="the-gap" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The gap after you press send</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Here is where ZeroBounce&apos;s catch-all handling falls short. Not because the tool is bad, but because the problem extends beyond what any verification tool was designed to solve.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        You run your list through ZeroBounce. You get back 400 &quot;valid&quot; results, 50 &quot;invalid&quot; results, and 200 &quot;catch-all&quot; results. You remove the invalids. Now what? You have 200 catch-all leads and two options:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Option A: Skip all catch-all leads</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            Safe for your infrastructure. Terrible for your pipeline. You just threw away 200 leads. If those leads came from Clay at $0.02-0.05 each, you burned $4-10 in enrichment costs for nothing. More importantly, some of those 200 leads are real people at real companies who would have responded. You will never know which ones.
                        </p>
                        <h3 className="font-bold text-gray-900 mb-3 mt-4">Option B: Send to all catch-all leads</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Risky. Catch-all addresses bounce at roughly 27x the rate of verified addresses. If you dump 200 catch-all leads into one campaign spread across 4 mailboxes, each mailbox absorbs 50 uncertain leads. If 10% of those bounce (a reasonable estimate), each mailbox picks up 5 extra bounces. That can push a mailbox from a healthy 1% bounce rate to 3-4% in a single day. One bad batch.
                        </p>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        ZeroBounce cannot help with either outcome because its job ended when it returned the &quot;catch-all&quot; label. There is no:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">What is missing after the label</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No bounce monitoring:</strong> If catch-all leads bounce after sending, ZeroBounce does not know and cannot alert you</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No auto-pause:</strong> If bounces from catch-all leads push a mailbox over threshold, nothing stops the bleeding automatically</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No risk distribution:</strong> ZeroBounce has no concept of &quot;this mailbox already has 5 catch-all leads today, send the next one through a different mailbox&quot;</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No domain-level intelligence:</strong> No caching of catch-all status per domain. No tracking of historical bounce rates from specific catch-all domains</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No healing:</strong> If a mailbox or domain takes damage from catch-all bounces, there is no graduated recovery process</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is not a criticism of ZeroBounce specifically. NeverBounce, MillionVerifier, Clearout &mdash; they all have the same limitation. Verification tools verify. They do not monitor, protect, or heal. As we covered in our <Link href="/blog/why-verified-emails-still-bounce" className="text-blue-600 hover:text-blue-800 underline">guide on why verified emails still bounce</Link>, even addresses that pass verification can cause problems. Catch-all is just the most common example.
                    </p>

                    {/* Section 5 */}
                    <h2 id="the-numbers" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The real numbers on catch-all risk</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Let us put actual numbers to this so it is not abstract.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Roughly 30-40% of B2B leads sit on catch-all domains. The percentage is higher if you target enterprise companies (Fortune 500, government, large healthcare systems). Lower if you target startups and SMBs running Google Workspace or Microsoft 365.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For a team sending 500 emails per day across 10 mailboxes, that is 150-200 catch-all leads daily. If you skip them all, you are capping your outreach at 300-350 emails per day. You are paying for 10 mailboxes but only using the capacity of 6-7.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        If you send to all of them, expect a bounce rate somewhere between 5-8% on catch-all segments. Industry standard for maintaining good deliverability is under 2%. So your catch-all segment alone can push you well past the danger zone.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The cost of getting this wrong is not trivial. A burned domain takes weeks to recover. A blacklisted IP can take months. And during recovery, every campaign on that domain is either paused or sending to the spam folder. The <Link href="/blog/domain-burned-recovery-prevention" className="text-blue-600 hover:text-blue-800 underline">recovery process for a burned domain</Link> is painful and slow.
                    </p>

                    {/* Section 6 */}
                    <h2 id="risk-aware-distribution" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Risk-aware distribution: the middle ground</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        There is a third option beyond &quot;skip all catch-all&quot; and &quot;send to all catch-all.&quot; Risk-aware distribution means sending to catch-all leads, but with guardrails that limit how much damage any single mailbox or domain can absorb.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is the approach Superkabe takes. When a lead is ingested, Superkabe checks the recipient domain. If the domain is catch-all, that status is cached in the DomainInsight table so every future lead from that domain is automatically flagged. The lead gets a validation score penalty, which feeds into routing decisions. Then the routing engine distributes the lead with per-mailbox caps: a maximum of 2 risky leads per 60 sends on any given mailbox.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        If catch-all bounces start accumulating on a mailbox, Superkabe&apos;s 60-second monitoring cycle catches it. The mailbox gets auto-paused before the bounce rate crosses the threshold that damages the domain. And if a domain does take damage, the 5-phase healing pipeline brings it back gradually rather than slamming it back to full volume.
                    </p>

                    {/* Comparison Table */}
                    <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">ZeroBounce vs Superkabe: catch-all handling</h3>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">Feature</th>
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">ZeroBounce</th>
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">Superkabe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Catch-all detection</td>
                                    <td className="py-4 px-4 text-gray-600 text-xs">Labels as &quot;catch-all&quot; status</td>
                                    <td className="py-4 px-4 text-gray-600 text-xs">Detects + caches per domain in DomainInsight</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Risk scoring</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No scoring. Binary label only</td>
                                    <td className="py-4 px-4 text-green-600 text-xs">0-100 validation score with catch-all penalty</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Send recommendation</td>
                                    <td className="py-4 px-4 text-gray-600 text-xs">User decides</td>
                                    <td className="py-4 px-4 text-gray-600 text-xs">Send with per-mailbox risk caps</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Per-mailbox risk caps</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs">Max 2 risky per 60 sends</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Post-send bounce monitoring</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs">60-second monitoring cycle</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Auto-pause on bounce spike</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs">Yes, configurable threshold</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Domain-level caching</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No. Checks fresh each time</td>
                                    <td className="py-4 px-4 text-green-600 text-xs">Cached in DomainInsight table</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Healing after damage</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs">5-phase graduated recovery</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        These tools are not competitors. They solve different parts of the same problem. ZeroBounce tells you the address might be risky. Superkabe manages that risk during and after sending.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The best setup for teams that want to send to catch-all leads safely: verify your list with ZeroBounce (or any verification tool you trust) to remove definite invalids and spam traps. Then route through Superkabe, which handles the catch-all risk distribution, monitors bounces in real-time, and auto-pauses before damage accumulates.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        For a broader look at how verification tools compare on catch-all handling, see our <Link href="/blog/catch-all-detection-zerobounce-vs-neverbounce" className="text-blue-600 hover:text-blue-800 underline">ZeroBounce vs NeverBounce vs Superkabe comparison</Link>. And for the complete list of verification options beyond ZeroBounce, check our <Link href="/blog/zerobounce-alternatives-infrastructure-monitoring" className="text-blue-600 hover:text-blue-800 underline">ZeroBounce alternatives guide</Link>.
                    </p>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Stop choosing between pipeline and safety</h3>
                            <p className="text-blue-100 leading-relaxed">
                                You should not have to skip 30-40% of your leads because your verification tool cannot protect you after the send. Superkabe lets you send to catch-all leads with per-mailbox risk caps, real-time bounce monitoring, and auto-pause. Keep your pipeline full without burning your domains. <Link href="/" className="text-white underline hover:text-blue-200">See how Superkabe handles catch-all risk</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 id="faq" className="text-2xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">How does ZeroBounce classify catch-all emails?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                ZeroBounce returns a &quot;catch-all&quot; status for emails on catch-all domains. This is separate from &quot;valid,&quot; &quot;invalid,&quot; or &quot;unknown.&quot; It means ZeroBounce detected that the domain accepts all emails regardless of whether the specific mailbox exists. The tool does not attempt to determine if the individual address is real.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Should I send to emails ZeroBounce marks as catch-all?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                It depends on your risk tolerance and infrastructure setup. Skipping all catch-all leads means losing 30-40% of your pipeline. Sending to all of them without protection risks bounce rates of 5-8%. The practical middle ground is sending with volume caps per mailbox and bounce monitoring so you can pause before damage occurs.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Does ZeroBounce monitor bounces after I send to catch-all leads?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                No. ZeroBounce is a pre-send tool. Once you decide to send, ZeroBounce has no visibility into what happens. It cannot track whether the email bounced, whether your mailbox bounce rate spiked, or whether your domain reputation took damage.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What percentage of B2B emails are on catch-all domains?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Roughly 30-40%. The number skews higher for enterprise and mid-market companies. Government organizations and large corporations are especially likely to run catch-all configurations. If your ICP includes companies with 200+ employees, expect a third or more of your leads to be catch-all.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Can ZeroBounce tell me if a specific address on a catch-all domain is real?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                No. The server accepts everything at the SMTP level, so there is no way for ZeroBounce to distinguish a real mailbox from a fake one. ZeroBounce can tell you the domain is catch-all but not whether your specific contact exists.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What is the difference between ZeroBounce catch-all and unknown status?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Catch-all means ZeroBounce confirmed the domain accepts all emails. Unknown means ZeroBounce could not determine the email status &mdash; the server may have been unreachable, rate-limiting, or using greylisting. Catch-all is a definitive classification. Unknown is inconclusive.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/catch-all-domains-cold-outreach" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Catch-All Domains Deep Dive</h3>
                        <p className="text-gray-500 text-xs">The full technical breakdown of catch-all risk</p>
                    </Link>
                    <Link href="/blog/zerobounce-alternatives-infrastructure-monitoring" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">ZeroBounce Alternatives</h3>
                        <p className="text-gray-500 text-xs">Tools that go beyond verification</p>
                    </Link>
                    <Link href="/blog/why-verified-emails-still-bounce" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Why Verified Emails Still Bounce</h3>
                        <p className="text-gray-500 text-xs">Verification is not the end of the story</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">See how Superkabe protects your infrastructure</Link>
                </div>
            </section>
        </>
    );
}

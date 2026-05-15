import Link from 'next/link';
import type { Metadata } from 'next';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

export const metadata: Metadata = {
    title: 'Dedicated IP vs Shared IP for Cold Email - When You Actually Need One',
    description:
        'A practical decision framework for dedicated vs shared IPs in cold email. Volume thresholds, warm-up reality, the OAuth caveat nobody mentions, and what Superkabe charges.',
    openGraph: {
        title: 'Dedicated IP vs Shared IP for Cold Email - When You Actually Need One',
        description:
            'Most teams under 50K sends/month do not need a dedicated IP. Here is when one is worth $39/month, what warm-up actually looks like, and the OAuth caveat that disqualifies most setups.',
        url: '/blog/dedicated-ip-cold-email',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-05-07',
    },
    alternates: { canonical: '/blog/dedicated-ip-cold-email' },
};

export default function DedicatedIpBlogPage() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Dedicated IP vs Shared IP for Cold Email - When You Actually Need One",
        "description": "A practical decision framework for dedicated vs shared IPs in cold email. Volume thresholds, warm-up reality, the OAuth caveat nobody mentions, and what Superkabe charges.",
        "datePublished": "2026-05-07",
        "dateModified": "2026-05-07",
        "image": { "@type": "ImageObject", "url": "https://www.superkabe.com/image/og-image.png", "width": 1200, "height": 630 },
        "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Deliverability Specialist", "url": "https://www.superkabe.com" },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.superkabe.com/blog/dedicated-ip-cold-email" }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog" },
            { "@type": "ListItem", "position": 3, "name": "Dedicated IP vs Shared IP for Cold Email", "item": "https://www.superkabe.com/blog/dedicated-ip-cold-email" }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "Do I need a dedicated IP for cold email?", "acceptedAnswer": { "@type": "Answer", "text": "Probably not, unless you consistently send 50,000+ emails per month from one workspace, you operate in a regulated industry that contractually requires reputation isolation, you need access to Gmail Postmaster Tools and Outlook SNDS, or you have been burned by a shared pool before. Most teams sending under 50K/month see no measurable deliverability gain from a dedicated IP." } },
            { "@type": "Question", "name": "Does a dedicated IP work with Gmail or Outlook OAuth mailboxes?", "acceptedAnswer": { "@type": "Answer", "text": "No. OAuth-connected Gmail and Microsoft mailboxes always send through Google's and Microsoft's own IPs. That is a fundamental property of OAuth-based sending and no platform can change it. Dedicated IPs only apply to the custom-SMTP send path. If your stack is OAuth-only, a dedicated IP is not useful for you." } },
            { "@type": "Question", "name": "How long does it take to warm up a dedicated IP?", "acceptedAnswer": { "@type": "Answer", "text": "4 to 8 weeks. Industry consensus and AWS SES's auto warm-up both target the same curve: 50-100/day for weeks 1-2, 1,000-5,000/day for weeks 3-4, 10,000-50,000/day for weeks 5-6, and full volume from week 7 onward. Aggressive ramps are the most common cause of permanent IP burn." } },
            { "@type": "Question", "name": "How much does a dedicated IP cost?", "acceptedAnswer": { "@type": "Answer", "text": "Industry pricing ranges from $30 to $100 per month per IP. Smartlead and Superkabe both charge $39/month per dedicated IP. SendGrid and Mailgun list closer to $80-100. Underlying AWS SES infrastructure is about $25/month - the markup covers warm-up automation, reputation monitoring, and on-call response when an IP gets listed." } },
            { "@type": "Question", "name": "What is the difference between a dedicated IP and a dedicated server?", "acceptedAnswer": { "@type": "Answer", "text": "A dedicated IP is a single sending address you exclusively control. A dedicated server (Smartlead's SmartServers, for example) is a whole machine with multiple IPs you exclusively control. Servers are an upsell beyond IPs and only make sense at very high volume - typically 80,000+ sends per month per server." } },
            { "@type": "Question", "name": "Will a dedicated IP fix my deliverability problems?", "acceptedAnswer": { "@type": "Answer", "text": "Almost never. Deliverability problems at typical cold email volumes are caused by content, list hygiene, sending velocity, or DNS misconfiguration - not by IP reputation. A dedicated IP does not fix any of those. If your bounce rate is over 5% on a shared pool, fix list hygiene first; the IP change will not save you." } }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <BlogHeader
                    tag="Deliverability"
                    title="Dedicated IP vs shared IP for cold email - when you actually need one"
                    dateModified="2026-05-07"
                    authorName="Robert Smith"
                    authorRole="Deliverability Specialist · Superkabe"
                />

                <FeaturedHero
                    badge="DELIVERABILITY · 2026"
                    eyebrow="9 min read"
                    tagline="A practical decision framework"
                    sub="Volume thresholds · warm-up reality · the OAuth caveat"
                />

                <p className="text-lg text-gray-700 leading-relaxed mb-12">
                    Most cold email teams who buy a dedicated IP didn&apos;t need one. They saw the
                    upgrade tier on a competitor&apos;s pricing page, assumed &quot;dedicated&quot; meant
                    &quot;better,&quot; and signed up for a $39–$99/month line item that never moved
                    their reply rates. The honest version of this article tells you when a dedicated
                    IP is genuinely worth the money - and when it&apos;s a placebo.
                </p>

                <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3 mt-0">Key takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm mb-0">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Below 50K sends/month, the shared pool is almost always the right call</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Above 100K sends/month from one workspace, dedicated starts paying for itself</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> OAuth Gmail/Outlook mailboxes can&apos;t use dedicated IPs - period</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Warm-up takes 4–8 weeks; the throttle is enforced for a reason</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> A dedicated IP does not fix bad lists, bad copy, or bad cadence</li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <h2 id="definitions" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What &quot;shared&quot; and &quot;dedicated&quot; actually mean</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        A <strong>shared IP</strong> is a sending address used by many senders at once.
                        Your provider - Gmail, an ESP like SendGrid, or a cold email platform&apos;s
                        upstream relay - pools customers onto a fleet of IPs. Reputation is collective.
                        If a hundred other senders on the same IP have clean lists, you benefit. If
                        they&apos;re scammers, you suffer.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        A <strong>dedicated IP</strong> is reserved for one sender. You control 100% of
                        the sending behavior; your reputation reflects your decisions and nothing else.
                        That isolation is the value proposition. Everything else - warm-up, monitoring,
                        Postmaster Tools - is operational machinery to actually realize the isolation.
                    </p>

                    <h2 id="oauth-caveat" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The OAuth caveat nobody mentions</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Here&apos;s the part that disqualifies most cold email setups before the
                        conversation even starts: <strong>if you connect a Gmail or Outlook mailbox
                        via OAuth, you cannot use a dedicated IP.</strong> Period. Google and Microsoft
                        send your email through their own infrastructure, on their own IPs, regardless
                        of which platform initiated the send. No code change, no add-on, no upgrade
                        tier changes that.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Dedicated IPs only apply when you&apos;re sending through a custom SMTP server
                        - yours, your platform&apos;s, or a relay like AWS SES. If your cold email stack
                        is 100% OAuth (a lot of agency stacks are), the dedicated IP question is moot.
                        Stop reading. Spend the $39/month on better lists.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        If your stack mixes OAuth and custom SMTP, dedicated IPs only affect the SMTP
                        leg. You can&apos;t consolidate Gmail-connected sends onto an IP you control.
                    </p>

                    <h2 id="when-shared-wins" className="text-2xl font-bold text-gray-900 mt-12 mb-4">When shared IPs win</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Shared pools are usually the better choice. They have three structural
                        advantages most teams underweight:
                    </p>
                    <ul className="text-gray-600 mb-8 space-y-3 list-none pl-0">
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] font-bold mt-0.5">1.</span><span><strong>No warm-up.</strong> A shared pool already has months or years of established reputation. You start sending at full plan volume the day you sign up.</span></li>
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] font-bold mt-0.5">2.</span><span><strong>Free or bundled.</strong> Sharing infrastructure is the entire economic model of every cold email platform&apos;s base tier. The marginal cost to you is zero.</span></li>
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] font-bold mt-0.5">3.</span><span><strong>Zero ops burden.</strong> When an IP gets listed, the provider handles delisting and rebalancing. You never know it happened.</span></li>
                    </ul>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The classic counter-argument - &quot;but other senders can hurt my
                        reputation!&quot; - is mostly theoretical at well-curated platforms. Reputable
                        providers actively monitor their pools and eject bad senders before they
                        contaminate IPs at scale. The risk exists; it just isn&apos;t large enough to
                        justify $39/month plus 4–8 weeks of warm-up for low-volume senders.
                    </p>

                    <h2 id="when-dedicated-wins" className="text-2xl font-bold text-gray-900 mt-12 mb-4">When dedicated IPs genuinely win</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        A dedicated IP is the right choice when at least two of these are true:
                    </p>
                    <div className="bg-white border border-[#D1CBC5] p-6 mb-8">
                        <ul className="space-y-3 text-gray-700 mb-0 list-none pl-0">
                            <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>Consistent volume above 50,000 emails/month</strong> from one workspace. Below that, mailbox providers don&apos;t see enough signal to grade your IP - you&apos;re effectively unwarmed forever.</span></li>
                            <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>Regulated industry exposure.</strong> Finance, healthcare, and legal often have contractual reputation isolation requirements. Shared pools aren&apos;t even an option.</span></li>
                            <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>You want Postmaster Tools and SNDS data.</strong> Gmail&apos;s Postmaster Tools and Microsoft&apos;s SNDS only show you data for IPs you control. On a shared pool you get nothing.</span></li>
                            <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>You&apos;ve been burned before.</strong> If a shared pool incident already cost you a domain&apos;s reputation, isolation has psychological and operational value beyond pure deliverability math.</span></li>
                        </ul>
                    </div>

                    <h2 id="volume-thresholds" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Volume-based decision matrix</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Industry consensus splits roughly along these volume bands:
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="w-full border border-[#D1CBC5] text-sm">
                            <thead>
                                <tr className="bg-[#F7F2EB]">
                                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Monthly send volume</th>
                                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Recommendation</th>
                                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Why</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <tr className="border-b border-gray-100"><td className="p-3 font-medium">Under 20K</td><td className="p-3">Shared</td><td className="p-3 text-gray-600">Not enough signal to warm a dedicated IP. You&apos;d sit at low caps forever.</td></tr>
                                <tr className="border-b border-gray-100"><td className="p-3 font-medium">20K–50K</td><td className="p-3">Shared</td><td className="p-3 text-gray-600">Marginal benefit doesn&apos;t justify $39/mo and 6 weeks of throttled output.</td></tr>
                                <tr className="border-b border-gray-100"><td className="p-3 font-medium">50K–100K</td><td className="p-3">Either - depends on use case</td><td className="p-3 text-gray-600">Tipping point. Buy dedicated if regulated or burned before; otherwise stay shared.</td></tr>
                                <tr><td className="p-3 font-medium">100K+ consistent</td><td className="p-3">Dedicated</td><td className="p-3 text-gray-600">Volume is high enough that any shared-pool incident costs more than $39/mo would save.</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 id="warmup" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Warm-up reality - 4 to 8 weeks of throttled output</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        A fresh dedicated IP has no sending history. To Gmail and Microsoft, it looks
                        like a brand-new sender that just appeared out of nowhere - exactly the
                        signature of a spam operation spinning up burner infrastructure. To prove
                        otherwise, you have to ramp up volume slowly while building a positive
                        engagement signal.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The industry-standard curve, which AWS SES enforces automatically and
                        Superkabe applies by default:
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="w-full border border-[#D1CBC5] text-sm">
                            <thead>
                                <tr className="bg-[#F7F2EB]">
                                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Week</th>
                                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Daily send cap</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <tr className="border-b border-gray-100"><td className="p-3 font-medium">1–2</td><td className="p-3">50–100/day</td></tr>
                                <tr className="border-b border-gray-100"><td className="p-3 font-medium">3–4</td><td className="p-3">1,000–5,000/day</td></tr>
                                <tr className="border-b border-gray-100"><td className="p-3 font-medium">5–6</td><td className="p-3">10,000–50,000/day</td></tr>
                                <tr><td className="p-3 font-medium">7+</td><td className="p-3">Full volume</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        You&apos;re paying $39/month from day one but can only send a few hundred
                        emails per day for the first two weeks. Worth budgeting for. Aggressive ramps
                        - &quot;I have a launch next week, push to 5K/day immediately&quot; - are the
                        single most common cause of permanent reputation damage on new IPs. Mailbox
                        providers see &quot;new IP, sudden volume spike&quot; as a textbook spam signal
                        and flag it within days. That flag can stick for months.
                    </p>

                    <h2 id="superkabe" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe does dedicated IPs</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Our model is deliberate and simple, and tells you what we won&apos;t do:
                    </p>
                    <ul className="text-gray-600 mb-8 space-y-3 list-none pl-0">
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>1 IP per workspace.</strong> Strict cardinality. If you run three workspaces and want all three on dedicated infrastructure, you buy three IPs. We don&apos;t share an IP across your workspaces - that defeats the entire point.</span></li>
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>$39/month per IP.</strong> Same price as Smartlead. About a third of what SendGrid and Mailgun charge for the equivalent service.</span></li>
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>Provisioned on AWS SES.</strong> Industry-standard infrastructure. We&apos;re not running our own relay; we don&apos;t want to be in the IP delisting business at 2 AM.</span></li>
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>Default warm-up enforced.</strong> The schedule above is applied automatically. You can override it from the dashboard, but only after reading a warning modal that explains why aggressive ramps cause permanent IP burn.</span></li>
                        <li className="flex items-start gap-3"><span className="text-[#1C4532] mt-1">▸</span><span><strong>Reputation monitoring at the IP level.</strong> The same DNSBL scans, Postmaster Tools sync, and 5-phase healing pipeline that protects shared-pool sends runs on your dedicated IP. If it&apos;s listed, we pause and heal automatically.</span></li>
                    </ul>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Full setup walkthrough lives in the <Link href="/docs/help/dedicated-ip" className="text-blue-600 hover:text-blue-800 underline">Dedicated IP setup guide</Link>. Technical reference is in the <Link href="/docs/dedicated-ip" className="text-blue-600 hover:text-blue-800 underline">Dedicated IP docs</Link>.
                    </p>

                    <h2 id="what-it-doesnt-fix" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What a dedicated IP does NOT fix</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is the part most upsell pages skip. A dedicated IP solves exactly one
                        problem: the &quot;blame other senders&quot; problem. It does not improve any
                        of these:
                    </p>
                    <ul className="text-gray-600 mb-8 space-y-2 list-disc pl-6">
                        <li><strong>Bad lists</strong> - high bounce rates burn dedicated IPs faster than shared ones, because there&apos;s no other senders to dilute your signal</li>
                        <li><strong>Bad copy</strong> - spam-trigger language and over-aggressive personalization tokens score the same regardless of IP</li>
                        <li><strong>Aggressive cadence</strong> - sending 500 emails in 5 minutes from one mailbox looks like spam from any IP</li>
                        <li><strong>Missing DNS records</strong> - SPF, DKIM, and DMARC failures tank you on dedicated IPs just as fast</li>
                        <li><strong>Domain reputation</strong> - Gmail tracks your domain&apos;s reputation independently of your IP&apos;s. A burned domain is a burned domain</li>
                    </ul>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        If your bounce rate on a shared pool is over 5%, fix list hygiene first. The
                        IP change won&apos;t save you. We mention this because we&apos;ve seen too many
                        teams buy a dedicated IP, change nothing else, and complain a month later that
                        deliverability is the same. It is. Because the IP wasn&apos;t the problem.
                    </p>

                    <h2 id="bottom-line" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The bottom line</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For most cold email teams, the right answer is the boring one: <strong>start
                        on the shared pool, stay on the shared pool, and only upgrade when you cross
                        50K consistent monthly sends or hit a regulated-industry requirement.</strong>
                        If you cross those thresholds, the $39/month is worth it - but go in
                        understanding that you&apos;re buying isolation, not a deliverability fix.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-12">
                        And if you&apos;re sending through OAuth-connected Gmail or Outlook mailboxes,
                        skip the question entirely. Dedicated IPs aren&apos;t available to you,
                        regardless of platform. Spend the budget on better lists or better copy
                        instead.
                    </p>
                </div>

                <BottomCtaStrip
                    headline="Try Superkabe - dedicated IP add-on at $39/mo"
                    body="Start on the shared pool. Add a dedicated IP only when you actually need one. No upsell pressure, no infrastructure surprises."
                    primaryCta={{ label: 'See pricing', href: '/pricing' }}
                    secondaryCta={{ label: 'Dedicated IP docs', href: '/docs/dedicated-ip' }}
                />
            </article>
        </>
    );
}

import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Catch-All Domains: The Hidden Risk Destroying Your Cold',
    description: 'Catch-all domains accept every email address — real or fake. Your verification tool says valid, you send, bounces spike.',
    openGraph: {
        title: 'Catch-All Domains: The Hidden Risk Destroying Your Cold',
        description: 'Catch-all domains make verification useless. They accept everything at SMTP level but bounce internally. Here is how to detect them, score the risk, and protect your domains.',
        url: '/blog/catch-all-domains-cold-outreach',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-03-27',
    },
    alternates: {
        canonical: '/blog/catch-all-domains-cold-outreach',
    },
};

export default function CatchAllDomainsColdOutreachArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Catch-all domains: the hidden risk destroying your cold email deliverability",
        "description": "Catch-all domains accept every email address — real or fake. Your verification tool says valid, you send, bounces spike.",
        "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Email Infrastructure Engineer", "url": "https://www.superkabe.com" },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/catch-all-domains-cold-outreach"
        },
        "datePublished": "2026-03-27",
        "dateModified": "2026-03-27"
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is a catch-all domain?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A catch-all domain is configured so that its mail server accepts email sent to any address at that domain, regardless of whether a real mailbox exists. Send to realname@company.com or gibberish123@company.com and both get accepted at the SMTP level. The server sorts it out later — and if no real mailbox exists, the email bounces internally."
                }
            },
            {
                "@type": "Question",
                "name": "Can email verification tools detect catch-all domains?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Standard SMTP verification cannot determine if an individual address is real on a catch-all domain because the server accepts everything. However, some tools like MillionVerifier and ZeroBounce can flag a domain as catch-all by sending a probe to a deliberately fake address. If the server accepts it, the domain is catch-all. This tells you the domain type but not whether your specific contact exists."
                }
            },
            {
                "@type": "Question",
                "name": "How many B2B leads are on catch-all domains?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Roughly 30-40% of B2B leads sit on catch-all domains. The exact percentage depends on your target market. Enterprise companies and government organizations run catch-all configurations more frequently than startups. If you target mid-market or enterprise, expect a third or more of your leads to be on catch-all domains."
                }
            },
            {
                "@type": "Question",
                "name": "Should I stop sending to catch-all domains entirely?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Blocking all catch-all leads means losing 30-40% of your addressable market. The better approach is risk-distributed sending: flag catch-all leads, spread them across multiple mailboxes, cap the volume per mailbox, and monitor bounce rates on catch-all segments separately. This preserves access to those prospects while limiting the damage any single mailbox absorbs."
                }
            },
            {
                "@type": "Question",
                "name": "What bounce rate should I expect from catch-all domains?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Emails to catch-all domains bounce at roughly 27x the rate of verified non-catch-all addresses. In practical terms, a campaign segment composed entirely of catch-all leads might see 8-15% bounce rates even with good data. Mixing catch-all with verified leads and capping catch-all volume at 10-15% of any mailbox's daily send keeps overall bounce rates manageable."
                }
            },
            {
                "@type": "Question",
                "name": "Which email validation tools detect catch-all domains?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MillionVerifier, ZeroBounce, NeverBounce, and Clearout all flag catch-all domains. MillionVerifier is the most cost-effective option at $0.004 per email. Superkabe includes catch-all detection as part of its validation layer and goes further by caching catch-all status at the domain level and applying per-mailbox routing caps automatically."
                }
            },
            {
                "@type": "Question",
                "name": "How does Superkabe handle catch-all leads differently than verification tools?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Verification tools flag the address and leave it to you. Superkabe detects catch-all status at the domain level, caches that result so every future lead from the same domain is automatically flagged, applies a risk score, and routes catch-all leads with per-mailbox volume caps. If catch-all bounces spike on a particular mailbox, auto-pause kicks in before the domain takes damage."
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
                    Catch-all domains: the hidden risk destroying your cold email deliverability
                </h1>
                <p className="text-gray-400 text-sm mb-8">12 min read &middot; Published March 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    Your verification tool says every email on the list is valid. You send. Bounce rate hits 7%. Two mailboxes get paused. One domain lands on a blacklist. The culprit? Catch-all domains. And your verification tool never stood a chance against them.
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Catch-all domains accept ANY email address at the SMTP level, making individual verification impossible</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Roughly 30-40% of B2B leads sit on catch-all domains. You cannot just skip them</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Emails to catch-all domains bounce at 27x the rate of non-catch-all addresses</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> The fix is not blocking catch-all leads. It is distributing the risk across mailboxes with volume caps</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Domain-level catch-all detection and caching eliminates redundant lookups</li>
                    </ul>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                        <li><a href="#what-are-catch-all" style={{ color: '#2563EB', textDecoration: 'none' }}>What catch-all domains actually are</a></li>
                        <li><a href="#why-verification-fails" style={{ color: '#2563EB', textDecoration: 'none' }}>Why verification tools cannot help</a></li>
                        <li><a href="#the-numbers" style={{ color: '#2563EB', textDecoration: 'none' }}>The numbers: how bad is the problem?</a></li>
                        <li><a href="#damage-pattern" style={{ color: '#2563EB', textDecoration: 'none' }}>The damage pattern</a></li>
                        <li><a href="#detection-approaches" style={{ color: '#2563EB', textDecoration: 'none' }}>Detection approaches that work</a></li>
                        <li><a href="#superkabe-approach" style={{ color: '#2563EB', textDecoration: 'none' }}>How Superkabe handles catch-all leads</a></li>
                        <li><a href="#practical-strategy" style={{ color: '#2563EB', textDecoration: 'none' }}>Practical strategy: distribute risk, do not block</a></li>
                        <li><a href="#faq" style={{ color: '#2563EB', textDecoration: 'none' }}>FAQ</a></li>
                    </ol>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Every cold outreach team eventually gets burned by catch-all domains. It usually happens the same way: you buy a lead list, run it through ZeroBounce or NeverBounce, see a 97% valid rate, load it into Smartlead, and start sending. Within 48 hours, bounces start climbing. By day three, a mailbox is paused. By day five, the domain is on a blacklist. And you are staring at a verification report that said everything was fine.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        The verification report was not wrong. It was incomplete. Catch-all domains break the fundamental assumption that verification relies on: that a mail server will tell you the truth about whether a mailbox exists. They do not. They say yes to everything.
                    </p>

                    <h2 id="what-are-catch-all" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What catch-all domains actually are</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        A catch-all domain is a mail server configuration where the domain accepts email for any address, whether or not a corresponding mailbox exists. Send an email to ceo@catchall-company.com, totallyFakeAddress@catchall-company.com, or keyboard-mash-xyz@catchall-company.com. The server responds 250 OK to all three.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Companies set up catch-all configurations for legitimate reasons. They do not want to miss important messages sent to misspelled addresses. A new employee might start receiving mail before IT creates their individual mailbox. Some organizations route all incoming mail to a central inbox for triage. The intent is not malicious. But the side effect for cold outreach teams is devastating.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Here is the technical flow. Your sending platform connects to the recipient&apos;s mail server and says &quot;I have an email for mike@company.com.&quot; A normal server checks its mailbox list. If Mike exists, it says 250 OK. If Mike does not exist, it says 550 User Unknown. Simple. A catch-all server skips the check entirely. It says 250 OK to every address. The email gets accepted at the gateway, routed to the internal delivery system, and only then does the server discover that the mailbox does not exist. It generates a bounce notification. That bounce hits your sender reputation.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The key distinction: the bounce does not happen at the SMTP connection stage. It happens after delivery acceptance. This is why verification tools cannot see it coming.
                    </p>

                    <h2 id="why-verification-fails" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why verification tools cannot help</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        SMTP-based email verification works by simulating the first part of email delivery. The tool connects to the recipient&apos;s mail server, issues a RCPT TO command for the target address, and reads the response code. 250 means accepted. 550 means rejected. The tool never actually sends an email. It just asks the question.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        On a catch-all domain, the answer to that question is always &quot;yes.&quot; The tool asks &quot;Will you accept mail for mike@company.com?&quot; The server says yes. The tool asks &quot;Will you accept mail for zzzzz99999@company.com?&quot; The server says yes. There is no way to distinguish a real mailbox from a fictional one. The verification result is technically accurate — the server will accept the email. But acceptance is not the same as delivery.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Some verification tools try a secondary check. They send a probe to a deliberately impossible address like test-{'{'}random-hash{'}'}@company.com. If the server accepts that address, the tool flags the domain as catch-all. This is useful metadata. But it does not tell you whether your specific contact — mike@company.com — actually has a mailbox. You know the domain is catch-all. You still do not know if Mike is real.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The good verification tools — MillionVerifier, ZeroBounce, NeverBounce — will flag the address as &quot;catch-all&quot; or &quot;accept-all&quot; in their results. They are honest about the limitation. The problem is what teams do with that information. Most teams see &quot;catch-all&quot; and treat it the same as &quot;valid.&quot; They send at full volume. Then they get burned.
                    </p>

                    <h2 id="the-numbers" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The numbers: how bad is the problem?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Let me put some real numbers on this so it stops being abstract.
                    </p>

                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
                        <h3 className="font-bold text-orange-900 mb-2">Catch-all domains by the numbers</h3>
                        <ul className="space-y-1 text-orange-800 text-sm">
                            <li><strong>30-40%</strong> of B2B lead lists contain addresses on catch-all domains</li>
                            <li><strong>27x</strong> higher bounce rate on catch-all addresses vs. verified non-catch-all</li>
                            <li><strong>8-15%</strong> typical bounce rate when sending exclusively to catch-all leads</li>
                            <li><strong>2%</strong> the bounce rate threshold where ISPs start paying attention</li>
                            <li><strong>5%</strong> the bounce rate where domains start getting blacklisted</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Think about what those numbers mean together. A third of your leads are on catch-all domains. Those leads bounce at dramatically higher rates. And the threshold for domain damage is low — 5% and you are in trouble.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Here is a concrete scenario. You have a campaign with 1,000 leads. 350 are on catch-all domains. The non-catch-all leads bounce at 0.5% (about 3 bounces from 650 sends). The catch-all leads bounce at 10% (35 bounces from 350 sends). Total: 38 bounces from 1,000 sends. That is a 3.8% bounce rate. Your ISP notices. Two more campaigns like this and you are looking at blacklist territory.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Now imagine you are running 5 domains, 3 mailboxes each, sending 50 emails per mailbox per day. Without catch-all awareness, those 350 catch-all leads get distributed evenly. Every mailbox absorbs roughly the same bounce risk. A bad batch of catch-all bounces can take down multiple mailboxes on the same day.
                    </p>

                    <h2 id="damage-pattern" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The damage pattern</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The catch-all damage pattern is insidious because it looks like everything is working until it is not. Here is how it plays out in practice:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">The typical catch-all damage sequence</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9679;</span> <strong>Day 1:</strong> Campaign launches. All emails verified. Everything looks clean</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9679;</span> <strong>Day 2:</strong> First bounces trickle in. 2-3 bounces per mailbox. Seems normal</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9679;</span> <strong>Day 3-4:</strong> Bounces accelerate. Catch-all domains that initially accepted emails start generating delayed bounces. 5-8 bounces per mailbox</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9679;</span> <strong>Day 5:</strong> ISP throttling begins. Open rates drop. Some emails going to spam. You might not notice because the volume masks it</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&#9679;</span> <strong>Day 7-10:</strong> Domain lands on one or more blacklists. Inbox placement drops below 50%. The damage is done</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The delayed nature of catch-all bounces makes this worse. A normal invalid email bounces immediately — your platform sees it, maybe pauses, and you move on. Catch-all bounces can take hours or days to come back because the receiving server accepted the email first. By the time you see the bounce notification, you have already sent the next day&apos;s batch. The damage compounds before you can react.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is exactly the scenario described in our guide on <Link href="/blog/why-verified-emails-still-bounce" className="text-blue-600 hover:text-blue-800 underline">why verified emails still bounce</Link>. Catch-all domains are the single biggest contributor to post-verification bounces.
                    </p>

                    <h2 id="detection-approaches" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Detection approaches that work</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        You cannot verify individual addresses on catch-all domains. But you can detect which domains are catch-all and adjust your strategy accordingly. There are three practical approaches.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. DNS-based detection</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Some catch-all configurations are detectable through MX record analysis. The MX records themselves do not say &quot;this is a catch-all,&quot; but certain hosting patterns correlate strongly with catch-all behavior. Google Workspace domains are almost never catch-all (Google disables it by default). Older Exchange servers running on-premise frequently are. Specific hosting providers and configurations have known catch-all tendencies.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        DNS-based detection is fast and free — no SMTP probing required. But it is probabilistic, not definitive. It narrows the field. It does not give you certainty.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. SMTP probe with dummy address</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is the standard approach. Send an SMTP probe to a deliberately fake address at the domain — something like verify-test-{'{'}randomstring{'}'}@company.com. If the server accepts it, the domain is catch-all. If it rejects it, the domain has individual mailbox checking enabled.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        MillionVerifier, ZeroBounce, and NeverBounce all do this. MillionVerifier is particularly good at it — their catch-all flag is reliable and their pricing ($0.004 per verification) makes it viable even at high volume. The <Link href="/blog/email-validation-vs-verification" className="text-blue-600 hover:text-blue-800 underline">difference between validation and verification</Link> matters here: validation checks syntax and domain health, while verification is the SMTP probe that reveals catch-all status.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Domain-level caching</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is where most teams leave performance on the table. Catch-all is a domain-level property, not an address-level property. If company.com is catch-all, every address at company.com is catch-all. You only need to detect it once.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        But most verification tools check each address independently. You pay for the verification of john@company.com, then sarah@company.com, then mike@company.com, and each time the tool discovers that company.com is catch-all. Three checks. Three charges. Same answer. Domain-level caching stores the catch-all status after the first check and applies it to every subsequent address at that domain.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        If you are running 10,000 leads per month and 35% are on catch-all domains, domain caching can cut your verification costs by 15-20% while giving you faster, consistent results.
                    </p>

                    <h2 id="superkabe-approach" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe handles catch-all leads</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        We built catch-all handling into the core routing logic, not as an afterthought. Here is the pipeline:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Superkabe catch-all pipeline</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Detection:</strong> Every lead passes through domain-level catch-all detection. First lead from a domain triggers the check. Result is cached for all subsequent leads on the same domain</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Risk scoring:</strong> Catch-all leads receive a risk score adjustment. They are not blocked — they are tagged with higher risk so the routing engine accounts for them</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Per-mailbox caps:</strong> Each mailbox has a maximum number of catch-all leads it can receive per day. This prevents any single mailbox from absorbing a concentration of high-risk sends</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Distribution:</strong> Catch-all leads are distributed across mailboxes and domains so that no single domain carries disproportionate risk. If you have 5 domains, catch-all leads get spread across all 5</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Real-time monitoring:</strong> Bounce rates on catch-all segments are tracked separately. If catch-all bounces spike on a mailbox, auto-pause triggers before the threshold damages the domain</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Feedback loop:</strong> Bounce data feeds back into domain risk scores. A catch-all domain that generates high bounces gets a permanent risk increase, affecting routing for all future leads on that domain</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The result: you send to catch-all leads without concentrating risk. If bounces happen — and some will — they are distributed thinly enough that no single mailbox or domain takes meaningful damage. And if a particular catch-all domain turns out to be especially problematic, the system learns and adjusts.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For more detail on how the <Link href="/docs/help/email-validation" className="text-blue-600 hover:text-blue-800 underline">email validation layer</Link> works with catch-all detection, see our documentation.
                    </p>

                    <h2 id="practical-strategy" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Practical strategy: distribute risk, do not block</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The worst response to catch-all domains is to block them entirely. You lose a third of your addressable market. The second worst response is to ignore them and send at full volume. You burn mailboxes. The right response is in the middle: send to catch-all leads, but with controls.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Catch-all sending rules that work</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> <strong>Cap catch-all at 10-15% of daily volume per mailbox.</strong> If a mailbox sends 50 emails per day, no more than 5-8 should be to catch-all addresses</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> <strong>Spread catch-all leads across all available domains.</strong> If you have 5 domains, each one absorbs a fraction of the catch-all risk. Do not let one domain carry it all</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> <strong>Monitor catch-all bounce rates separately.</strong> Your overall bounce rate might look fine at 2%. But if you dig in and catch-all leads are bouncing at 12%, you have a problem building up</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> <strong>Set a lower auto-pause threshold for catch-all heavy campaigns.</strong> Normal threshold might be 5 bounces. For campaigns with high catch-all concentration, consider pausing at 3</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> <strong>Use domain-level caching to avoid redundant verification costs.</strong> Check once per domain, not once per address. Saves money and gives faster routing</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&#9679;</span> <strong>Deprioritize catch-all leads in send order.</strong> Send verified leads first. Send catch-all leads later in the day when you have bounce data from the verified batch. If bounces are already high, hold the catch-all sends</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        These rules are simple to state and hard to implement manually. When you are running 15 mailboxes across 5 domains with 3 campaigns active, manually tracking which leads are catch-all, enforcing per-mailbox caps, and monitoring bounce rates per segment is unrealistic. This is exactly the kind of thing that should be automated.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">The economics of getting it right</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Let me put a dollar figure on this. Say you burn a domain because of uncontrolled catch-all sends. That domain took 3-4 weeks to warm up. It costs $10-15/year for the domain, $3-5/month for the mailbox, and the real cost: 3-4 weeks of warming time where it generates zero pipeline. If a warmed domain produces $5,000-10,000 per month in pipeline value, a burned domain costs $15,000-40,000 in lost opportunity during the recovery and re-warm period.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Now multiply that by the number of domains that could get hit. Teams running 10 domains who ignore catch-all risk are playing a game they will eventually lose. The question is not if. It is when.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">What about enrichment tools?</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Clay, Apollo, and similar enrichment platforms find the email address. They do not assess deliverability risk. Clay will happily give you mike@catchall-company.com and present it as a verified contact. Clay&apos;s job is to find data. Your job is to assess whether sending to that data is safe.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is why a validation layer between enrichment and sending is not optional. Read our guide on <Link href="/blog/email-validation-vs-verification" className="text-blue-600 hover:text-blue-800 underline">email validation vs. verification</Link> for the full breakdown of what each layer does.
                    </p>

                    <h2 id="faq" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Frequently asked questions</h2>

                    <div className="space-y-6 mb-12">
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">What is a catch-all domain?</h3>
                            <p className="text-gray-600 text-sm">A catch-all domain is configured so its mail server accepts email for any address, real or fake. Send to literally-anything@company.com and the server says &quot;accepted.&quot; The email bounces internally if no real mailbox exists, but the server never tells you that during the initial SMTP handshake.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Can email verification detect catch-all domains?</h3>
                            <p className="text-gray-600 text-sm">Verification tools can detect that a domain is catch-all by probing a fake address. If the server accepts the fake address, the domain is catch-all. But verification cannot tell you whether your specific contact&apos;s mailbox exists on that domain. The catch-all flag tells you the domain type. It does not validate individual addresses.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">How many of my leads are probably on catch-all domains?</h3>
                            <p className="text-gray-600 text-sm">In B2B outreach, 30-40% is typical. Enterprise-heavy lists run higher. Startup-focused lists run lower because smaller companies tend to use Google Workspace or Microsoft 365, which do not enable catch-all by default. Check your last verification report — most tools include a &quot;catch-all&quot; or &quot;accept-all&quot; category.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Should I stop sending to catch-all domains?</h3>
                            <p className="text-gray-600 text-sm">No. Blocking catch-all domains means losing a third or more of your addressable market. The right approach is controlled exposure: cap catch-all volume per mailbox at 10-15% of daily sends, distribute across multiple domains, monitor bounce rates on catch-all segments separately, and auto-pause if bounces spike.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Which verification tools flag catch-all domains?</h3>
                            <p className="text-gray-600 text-sm">MillionVerifier ($0.004/email), ZeroBounce ($0.009/email), NeverBounce ($0.008/email), and Clearout ($0.007/email) all flag catch-all domains. MillionVerifier is the best value for catch-all detection specifically. Superkabe includes catch-all detection with domain-level caching as part of its subscription.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">What bounce rate should I expect from catch-all addresses?</h3>
                            <p className="text-gray-600 text-sm">Catch-all addresses bounce at roughly 27x the rate of verified non-catch-all addresses. In practice, a segment of all catch-all leads might bounce at 8-15%. Blended into a normal campaign where 30-35% of leads are catch-all, expect 3-5% total bounce rate even with solid verification on the non-catch-all portion.</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-900 mb-2">How does Superkabe handle catch-all leads?</h3>
                            <p className="text-gray-600 text-sm">Superkabe detects catch-all at the domain level and caches the result. Catch-all leads receive a risk score adjustment, get routed with per-mailbox volume caps, and are distributed across domains to prevent risk concentration. If bounces spike on catch-all segments, auto-pause triggers before domain damage occurs. The system learns from bounce patterns and adjusts domain risk scores over time.</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">The bottom line</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Catch-all domains are not going away. They represent a huge share of the B2B market and blocking them is not realistic. The teams that protect their deliverability are the ones that detect catch-all at the domain level, distribute risk across their infrastructure, and have automated guardrails that trigger before damage accumulates. Verification tells you the domain is catch-all. What you do with that information determines whether your domains survive.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/why-verified-emails-still-bounce" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Why Verified Emails Still Bounce</h3>
                        <p className="text-gray-500 text-xs">Six reasons your verified list bounces and what to do</p>
                    </Link>
                    <Link href="/blog/email-validation-vs-verification" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Email Validation vs Verification</h3>
                        <p className="text-gray-500 text-xs">The terms are different. Here is why it matters.</p>
                    </Link>
                    <Link href="/docs/help/email-validation" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Email Validation Documentation</h3>
                        <p className="text-gray-500 text-xs">How Superkabe&apos;s validation layer works</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">&larr; See how Superkabe protects your infrastructure</Link>
                </div>
            </section>
        </>
    );
}

import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Domain Reputation Dropped? The Complete Recovery Playbook',
    description: 'Step-by-step domain reputation recovery after cold email damage. Covers diagnosis, blacklist removal, re-warming schedules, recovery timelines for Gmail.',
    openGraph: {
        title: 'Domain Reputation Dropped? The Complete Recovery Playbook',
        description: 'Your domain reputation tanked after outreach. Here is the complete recovery playbook: diagnosis, root cause fixes, ISP reset timelines, and re-warming schedules.',
        url: '/blog/domain-reputation-recovery-guide',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-04-01',
    },
    alternates: {
        canonical: '/blog/domain-reputation-recovery-guide',
    },
};

export default function DomainReputationRecoveryGuideArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Domain reputation dropped? The complete recovery playbook",
        "description": "Step-by-step domain reputation recovery after cold email damage. Covers diagnosis, blacklist removal, re-warming schedules, recovery timelines for Gmail.",
        "author": { "@type": "Person", "name": "Edward Sam", "jobTitle": "Deliverability Specialist", "url": "https://www.superkabe.com" },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/domain-reputation-recovery-guide"
        },
        "datePublished": "2026-04-01",
        "dateModified": "2026-04-01"
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How long does domain reputation recovery take?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "For Gmail, moderate reputation drops (Medium to Low) typically recover in 2-4 weeks of clean sending or no sending. Severe drops (Bad reputation or blacklisting) take 4-8 weeks minimum. For Outlook, recovery is generally faster at 1-3 weeks because Microsoft's reputation model resets more frequently. These timelines assume you have fully stopped the problematic behavior and fixed the root cause."
                }
            },
            {
                "@type": "Question",
                "name": "Should I abandon a damaged domain or try to recover it?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "It depends on severity. If the domain is on 5+ blacklists with bounce rates above 15%, starting fresh is usually faster. A new domain costs $10-15 and takes 3-4 weeks to warm. Recovering a severely damaged domain can take 6-8 weeks with no guarantee. For moderate damage (1-2 blacklists, bounce rate under 8%), recovery is almost always worthwhile and faster than starting from scratch."
                }
            },
            {
                "@type": "Question",
                "name": "Can I speed up domain reputation recovery at Gmail?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "There is no way to directly contact Google to speed up reputation recovery. The only accelerator is ensuring zero negative signals during the recovery period. Stop all cold outbound from the domain. If you must send, send only to people who have previously replied positively. Positive engagement signals (opens, replies) during recovery help, but the primary factor is time without bounces or spam complaints."
                }
            },
            {
                "@type": "Question",
                "name": "What causes domain reputation to drop suddenly?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The three most common causes are: (1) a bad lead list with high invalid rates causing a bounce spike, (2) a spam complaint spike from poorly targeted or aggressive outreach, and (3) DNS misconfiguration — a broken SPF record, expired DKIM key, or permissive DMARC policy. A single bad campaign can push an entire domain from High to Low reputation in 24-48 hours."
                }
            },
            {
                "@type": "Question",
                "name": "How do I re-warm a domain after reputation damage?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Start at 10 emails per day for the first week using only verified, high-quality addresses. Increase to 25 per day in week two. Move to 50 per day in week three. Return to normal volume (if metrics stay clean) in week four. Monitor bounce rate and spam complaints at each stage. If any metric spikes, drop back to the previous level. The goal is to build a track record of clean sending that demonstrates to ISPs that your behavior has changed."
                }
            },
            {
                "@type": "Question",
                "name": "Does blacklist removal automatically fix reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Blacklist removal is one step in recovery, not the complete fix. Getting delisted from Spamhaus or Spamcop removes a blocking signal, but ISP reputation scores (Google Postmaster, Microsoft) take additional time to reset independently. You still need to fix the root cause, wait for ISP reputation to improve, and re-warm the domain. Many teams get delisted and immediately resume full sending volume, which gets them re-listed within days."
                }
            },
            {
                "@type": "Question",
                "name": "How does a bad lead list destroy domain reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A list with 8% invalid addresses means 8 out of every 100 emails hard bounce. If you push 5,000 leads into campaigns across 3 domains, that is 400 bounces distributed in the first 24-48 hours of sending. Each domain absorbs roughly 130 bounces. At typical cold email volumes, that pushes each domain well past the 2% bounce threshold and into the 5-8% danger zone where ISPs actively degrade reputation and blacklisting becomes likely."
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
                    Domain reputation dropped? The complete recovery playbook
                </h1>
                <p className="text-gray-400 text-sm mb-8">13 min read · Published April 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    Your domain reputation tanked. Reply rates crashed. Google Postmaster shows &quot;Low&quot; or &quot;Bad.&quot; Maybe you are on a blacklist. Maybe you pushed a bad lead list. Either way, the domain that was generating pipeline last week is now generating spam folder placements. Here is how to fix it.
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Three causes cover 90% of reputation drops: bad lead list, spam complaint spike, DNS misconfiguration</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Gmail recovery takes 2-4 weeks (moderate) or 4-8 weeks (severe). Outlook recovers in 1-3 weeks</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Re-warming schedule: 10/day for week 1, 25/day week 2, 50/day week 3, normal by week 4</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Manual recovery fails at scale. Automated monitoring + pause + healing prevents repeat damage</li>
                    </ul>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                        <li><a href="#three-causes" style={{ color: '#2563EB', textDecoration: 'none' }}>The 3 common causes of reputation drops</a></li>
                        <li><a href="#severity-assessment" style={{ color: '#2563EB', textDecoration: 'none' }}>Severity assessment: how bad is it?</a></li>
                        <li><a href="#five-phase-recovery" style={{ color: '#2563EB', textDecoration: 'none' }}>The 5-phase recovery process</a></li>
                        <li><a href="#recovery-timelines" style={{ color: '#2563EB', textDecoration: 'none' }}>Recovery timelines by ISP</a></li>
                        <li><a href="#rewarming-schedule" style={{ color: '#2563EB', textDecoration: 'none' }}>Re-warming schedule</a></li>
                        <li><a href="#bad-list-deep-dive" style={{ color: '#2563EB', textDecoration: 'none' }}>The bad lead list deep dive</a></li>
                        <li><a href="#manual-vs-automated" style={{ color: '#2563EB', textDecoration: 'none' }}>Why manual recovery fails at scale</a></li>
                    </ol>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Domain reputation recovery is not a mystery. It is a process. But most teams get it wrong because they either skip steps (jumping straight to re-warming without fixing the cause) or lose patience (ramping volume too fast and triggering the same damage again). This guide walks through the complete playbook: diagnosing the cause, assessing severity, executing recovery, and building the systems to prevent it from happening again.
                    </p>

                    {/* Section 1 */}
                    <h2 id="three-causes" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The 3 common causes of reputation drops</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        In our experience monitoring thousands of sending domains, three causes account for roughly 90% of sudden reputation drops. The first step in recovery is identifying which one hit you.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">1</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Bad lead list (high bounce rate)</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    The most common cause by far. You import a batch of leads from Clay, Apollo, or ZoomInfo. The list has a higher-than-expected invalid rate — maybe 8%, maybe 12%. At volume, this translates to hundreds of hard bounces hitting your domains in a single day. ISPs interpret concentrated bouncing as evidence of list purchasing or scraping, and reputation drops fast. The telltale sign: reputation drops within 24-48 hours of launching a new campaign with a new lead list.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">2</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Spam complaint spike</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Recipients marking your email as spam sends a direct signal to the ISP. Google&apos;s threshold is 0.3% — meaning if more than 3 out of every 1,000 Gmail recipients hit &quot;Report Spam,&quot; you trigger a warning. Above 0.5% and deliverability drops fast. Common triggers: poor targeting (emailing people with zero relevance), aggressive copy (too salesy, misleading subject lines), or sending to people who opted out of previous campaigns. The telltale sign: Google Postmaster shows elevated spam rate, but bounce rate is normal.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">3</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">DNS misconfiguration</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    A broken SPF record, an expired DKIM key, or a misconfigured DMARC policy. This can happen silently — a hosting migration changes your IP, and the SPF record no longer includes the right server. A domain registrar auto-renews but resets DNS records. Someone on your team edits DNS for a different reason and accidentally breaks the SPF record. The telltale sign: Google Postmaster shows authentication failure rates spiking, and your <Link href="/blog/spf-dkim-dmarc-explained" className="text-blue-600 hover:text-blue-800 underline">SPF/DKIM/DMARC</Link> checks fail.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 - Severity Assessment */}
                    <h2 id="severity-assessment" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Severity assessment: how bad is it?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Not all reputation drops are equal. A dip from &quot;High&quot; to &quot;Medium&quot; in Google Postmaster is very different from landing on Spamhaus. Before you start recovery, assess where you actually stand. This table maps the severity levels to expected recovery timelines.
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Severity</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Google Postmaster</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Bounce rate</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Recovery time</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Primary action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-yellow-700">Mild</td>
                                    <td className="px-4 py-3 text-gray-600">High → Medium</td>
                                    <td className="px-4 py-3 text-gray-600">2-4%</td>
                                    <td className="px-4 py-3 text-gray-600">1-2 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">Reduce volume, clean lists, monitor</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-orange-700">Moderate</td>
                                    <td className="px-4 py-3 text-gray-600">Medium → Low</td>
                                    <td className="px-4 py-3 text-gray-600">5-8%</td>
                                    <td className="px-4 py-3 text-gray-600">2-4 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">Pause all sends, fix cause, re-warm</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-red-700">Severe</td>
                                    <td className="px-4 py-3 text-gray-600">Low → Bad</td>
                                    <td className="px-4 py-3 text-gray-600">8-15%</td>
                                    <td className="px-4 py-3 text-gray-600">4-8 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">Full stop, blacklist removal, extended re-warm</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-red-900">Critical</td>
                                    <td className="px-4 py-3 text-gray-600">Bad + blacklisted</td>
                                    <td className="px-4 py-3 text-gray-600">15%+</td>
                                    <td className="px-4 py-3 text-gray-600">6-12 weeks or abandon</td>
                                    <td className="px-4 py-3 text-gray-600">Evaluate: recover vs new domain</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The critical distinction is between &quot;Severe&quot; and &quot;Critical.&quot; At the Severe level, recovery is almost always possible and worthwhile. At Critical — Bad reputation plus multiple blacklists plus 15%+ bounce rate — the math often favors starting fresh. A new domain costs $10-15 and warms in 3-4 weeks. Recovery from Critical can take 3 months with no guarantee.
                    </p>

                    {/* Section 3 - Five Phase Recovery */}
                    <h2 id="five-phase-recovery" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The 5-phase recovery process</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Every reputation recovery follows the same five phases. Skipping phases is why most recovery attempts fail or take longer than necessary.
                    </p>

                    <div className="space-y-6 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">P1</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Phase 1: Stop sending</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                        The first 30 minutes matter. Every email sent from a damaged domain compounds the damage. Pause every campaign using mailboxes on the affected domain. Not &quot;reduce volume.&quot; Not &quot;pause the worst campaigns.&quot; Pause everything on that domain. Continue sending from healthy domains.
                                    </p>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        If you are on Smartlead, deactivate the mailboxes in the campaign settings. On Instantly, pause the accounts. The point is to stop the bleeding immediately. Every hour you delay adds days to recovery.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">P2</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Phase 2: Diagnose</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                        Identify which of the three causes hit you. Check these in order:
                                    </p>
                                    <ul className="text-gray-600 text-sm leading-relaxed space-y-1 ml-4 list-disc">
                                        <li>Google Postmaster Tools: Is spam rate elevated? Bounce rate? Authentication failures?</li>
                                        <li>MXToolbox Blacklist Check: Are you on any blacklists?</li>
                                        <li>DNS verification: Are SPF, DKIM, and DMARC records intact and passing?</li>
                                        <li>Campaign data: Which campaign was running when the drop started? What list was it using?</li>
                                        <li>Bounce logs: What percentage of bounces were hard bounces vs soft bounces?</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">P3</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Phase 3: Fix the root cause</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                        This is where most teams cut corners. They want to skip ahead to re-warming. Do not. If the root cause is not fixed, re-warming will just trigger the same damage again.
                                    </p>
                                    <ul className="text-gray-600 text-sm leading-relaxed space-y-1 ml-4 list-disc">
                                        <li><strong>Bad list:</strong> Remove all invalid addresses. Add email validation before any future sends. Quarantine unverified leads. See our <Link href="/blog/domain-burned-recovery-prevention" className="text-blue-600 hover:text-blue-800 underline">bad lead list recovery guide</Link> for the detailed process.</li>
                                        <li><strong>Spam complaints:</strong> Rewrite copy. Tighten targeting criteria. Ensure unsubscribe links work. Consider segmenting by engagement level.</li>
                                        <li><strong>DNS issues:</strong> Fix the broken records. Re-verify with MXToolbox. Test authentication with a manual send.</li>
                                        <li><strong>Blacklisted:</strong> Submit removal requests to each blacklist. Spamhaus, Spamcop, and Barracuda all have self-service removal. Fix the cause first — if you request removal while still triggering the behavior that got you listed, you get re-listed within days.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">P4</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Phase 4: Wait for ISP reputation reset</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                        This is the hardest phase because there is nothing to do. ISPs need time to reassess your domain based on the absence of negative signals. You cannot call Google. There is no ticket to submit. The timeline depends on severity:
                                    </p>
                                    <ul className="text-gray-600 text-sm leading-relaxed space-y-1 ml-4 list-disc">
                                        <li>Mild (Medium → Low): 3-7 days of clean behavior</li>
                                        <li>Moderate (Low): 1-2 weeks of no/minimal sending</li>
                                        <li>Severe (Bad): 2-4 weeks of complete silence</li>
                                        <li>Critical (Bad + blacklisted): 4-6 weeks after blacklist removal</li>
                                    </ul>
                                    <p className="text-gray-600 text-sm leading-relaxed mt-2">
                                        During the wait period, if you must send, send only to people who have previously opened or replied to your emails. Positive engagement signals help, but the primary factor is time without negative signals.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">P5</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Phase 5: Graduated re-warming</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Once Google Postmaster shows improvement (typically from Bad → Low or Low → Medium), begin re-warming. This is not &quot;resume normal sending.&quot; It is a slow, deliberate ramp that proves to ISPs your behavior has changed. Start at 10% of your pre-damage volume and increase weekly. Detailed schedule below.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 - Recovery Timelines */}
                    <h2 id="recovery-timelines" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Recovery timelines by ISP</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Each ISP has its own reputation model and reset cadence. Gmail is the slowest to recover because Google weights historical behavior heavily. Outlook resets faster but can be stricter about re-listing if you reoffend.
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">ISP</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Moderate damage</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Severe / blacklisting</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Gmail</td>
                                    <td className="px-4 py-3 text-gray-600">2-4 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">4-8 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">Slowest reset. Weights historical behavior. 70% of B2B recipients</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">Outlook / Microsoft 365</td>
                                    <td className="px-4 py-3 text-gray-600">1-2 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">2-4 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">Faster reset but stricter on repeat offenders</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Yahoo / AOL</td>
                                    <td className="px-4 py-3 text-gray-600">1-3 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">3-6 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">Shared infrastructure since Verizon merger. Lower B2B relevance</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">Corporate (Barracuda, Cisco)</td>
                                    <td className="px-4 py-3 text-gray-600">1-2 weeks</td>
                                    <td className="px-4 py-3 text-gray-600">2-4 weeks (after delisting)</td>
                                    <td className="px-4 py-3 text-gray-600">Recovery starts after blacklist removal is confirmed</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Section 5 - Re-warming Schedule */}
                    <h2 id="rewarming-schedule" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Re-warming schedule</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Once ISP reputation shows improvement, begin the re-warming process. This schedule assumes a single mailbox on the recovering domain. If you have multiple mailboxes, apply these numbers per mailbox.
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Period</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Daily sends per mailbox</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">List quality</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Watch for</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Day 1-7</td>
                                    <td className="px-4 py-3 text-gray-600">10</td>
                                    <td className="px-4 py-3 text-gray-600">Triple-verified, known good addresses</td>
                                    <td className="px-4 py-3 text-gray-600">Any bounces = stop and re-evaluate</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">Day 8-14</td>
                                    <td className="px-4 py-3 text-gray-600">25</td>
                                    <td className="px-4 py-3 text-gray-600">Verified, high-confidence addresses</td>
                                    <td className="px-4 py-3 text-gray-600">Bounce rate must stay under 1%</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Day 15-21</td>
                                    <td className="px-4 py-3 text-gray-600">50</td>
                                    <td className="px-4 py-3 text-gray-600">Verified addresses, standard quality</td>
                                    <td className="px-4 py-3 text-gray-600">Bounce rate under 2%, check Postmaster</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">Day 22+</td>
                                    <td className="px-4 py-3 text-gray-600">Normal volume (30-50)</td>
                                    <td className="px-4 py-3 text-gray-600">Standard validated lists</td>
                                    <td className="px-4 py-3 text-gray-600">Maintain monitoring, auto-pause in place</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The critical rule: if bounce rate spikes at any stage, drop back to the previous level and hold for another week. Do not push through. Pushing through elevated bounce rates during re-warming is how you end up back at &quot;Bad&quot; and restart the entire cycle.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For more detail on bounce rate thresholds and what ISPs consider acceptable, see our <Link href="/blog/cold-email-bounce-rate-thresholds" className="text-blue-600 hover:text-blue-800 underline">cold email bounce rate thresholds guide</Link>.
                    </p>

                    {/* Section 6 - Bad Lead List Deep Dive */}
                    <h2 id="bad-list-deep-dive" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The bad lead list deep dive</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is the cause worth examining in detail because it is the most common and the most preventable. Here is exactly how a bad list destroys a domain, with real numbers.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Say you export 5,000 leads from Clay for a new outbound campaign. The list targets VP-level contacts at SaaS companies. Looks clean on the surface. But 8% of the addresses are invalid — some people changed jobs, some companies shut down, some addresses were never correct in the first place. That is 400 bad addresses in your list.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        You push those 5,000 leads into campaigns across 3 domains, each with 3 mailboxes. That is 9 mailboxes total, roughly 555 leads per mailbox. At 50 sends per day per mailbox, you are pushing through the entire list in about 11 days.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The invalid addresses are distributed randomly through the list. In the first day, each mailbox sends 50 emails. Statistically, about 4 of those 50 will bounce per mailbox. Across 9 mailboxes, that is 36 bounces on day one. Distributed across 3 domains, each domain absorbs about 12 bounces against 150 sends — an 8% bounce rate on day one.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        By day 3, each domain has accumulated 36 bounces against 450 sends — still hovering near 8%. ISPs have noticed. Gmail has likely already downgraded your domain reputation from High to Medium or Low. By day 7, the accumulated damage pushes one or more domains to &quot;Bad&quot; at Gmail. By day 14, without intervention, at least one domain is blacklisted.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        All of this is preventable with a single step: validating the list before sending. Run those 5,000 leads through email verification (MillionVerifier, ZeroBounce, or Superkabe&apos;s built-in validation). The 400 invalid addresses get flagged and quarantined. They never reach a mailbox. Your domains never see the bounces. Reputation stays intact.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The cost of validation: roughly $15-45 for 5,000 addresses, depending on the provider. The cost of domain recovery: 4-8 weeks of lost pipeline on 3 domains. For most B2B outbound operations, that is $15,000-40,000 in opportunity cost. The ROI of validation is not even close to ambiguous. For the full prevention playbook, see our <Link href="/blog/domain-burned-recovery-prevention" className="text-blue-600 hover:text-blue-800 underline">bad lead list recovery and prevention guide</Link>.
                    </p>

                    {/* Section 7 - Manual vs Automated */}
                    <h2 id="manual-vs-automated" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why manual recovery fails at scale</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The five-phase recovery process above works. But it requires consistent execution over weeks. In practice, most teams fail at two specific points.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        <strong>First, detection is too slow.</strong> Without real-time monitoring, teams discover reputation damage days after it starts. They check Google Postmaster on Monday and see &quot;Low,&quot; but the damage started on Thursday. That is 4 days of compounding damage that could have been prevented. The difference between catching a bounce spike at hour 1 vs day 4 is the difference between pausing a single mailbox and recovering an entire domain.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        <strong>Second, re-warming discipline breaks down.</strong> The re-warming schedule requires holding to 10 sends per day for a full week. Then 25 for another week. Then 50. When you have pipeline targets and 8 weeks of recovery ahead of you, the temptation to accelerate is overwhelming. Teams push from 25 to 75 in week two because &quot;metrics looked fine.&quot; By week three, they are back at &quot;Bad&quot; and restarting the cycle.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Automated recovery solves both problems. A system that monitors continuously catches the damage early. A system that controls sending volume enforces the re-warming schedule without human discipline being the bottleneck.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Superkabe&apos;s 5-phase healing pipeline does exactly this. When a mailbox or domain crosses a threshold, it auto-pauses the affected entity. It diagnoses the cause by correlating bounce patterns across mailboxes and domains. It enforces a graduated re-warming schedule — increasing volume only when metrics confirm the domain is ready. And it does this across every mailbox and domain in your infrastructure simultaneously. See how it works in the <Link href="/docs/help/auto-healing" className="text-blue-600 hover:text-blue-800 underline">auto-healing documentation</Link> and <Link href="/docs/help/quarantine" className="text-blue-600 hover:text-blue-800 underline">quarantine system</Link>.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The bottom line: recovery is a mechanical process. Diagnosis, fix, wait, re-warm. The hard part is not knowing what to do — it is doing it consistently across 10, 20, 50 domains while maintaining pipeline targets. That is an automation problem, not a knowledge problem.
                    </p>
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe automates recovery</h2>
                    <p className="text-gray-600 leading-relaxed max-w-3xl">
                        Superkabe detects reputation damage within 60 seconds, auto-pauses affected mailboxes, diagnoses root causes through cross-entity correlation, and executes graduated re-warming on a strict schedule. No manual checking. No discipline gaps. Built for teams that cannot afford 4-8 weeks of lost pipeline per domain.
                    </p>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/domain-burned-recovery-prevention" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Domain Burned From a Bad Lead List</h3>
                        <p className="text-gray-500 text-xs">Complete recovery and prevention after bounce spikes</p>
                    </Link>
                    <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate and Deliverability</h3>
                        <p className="text-gray-500 text-xs">How bounce rate impacts inbox placement</p>
                    </Link>
                    <Link href="/blog/how-to-check-domain-reputation-cold-email" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">How to Check Domain Reputation</h3>
                        <p className="text-gray-500 text-xs">6 tools compared for cold email senders</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">See how Superkabe protects your infrastructure</Link>
                </div>
            </section>
        </>
    );
}

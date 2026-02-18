import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Domain Warming Methodology – Superkabe Blog',
    description: 'Systematic approach to building sender reputation on new domains. Volume ramp schedules, warming signals, and common mistakes that burn domains.',
};

export default function DomainWarmingArticle() {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Domain Warming Methodology",
        "author": { "@type": "Organization", "name": "Superkabe", "@id": "https://superkabe.com/#organization" },
        "publisher": { "@type": "Organization", "name": "Superkabe", "@id": "https://superkabe.com/#organization" },
        "datePublished": "2026-02-13",
        "dateModified": "2026-02-13",
        "mainEntityOfPage": "https://superkabe.com/blog/domain-warming-methodology"
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Warm a New Email Domain for Cold Outbound",
        "step": [
            { "@type": "HowToStep", "name": "Configure DNS authentication", "text": "Set up SPF, DKIM, and DMARC records for the new domain before sending any emails." },
            { "@type": "HowToStep", "name": "Start at low volume", "text": "Send 5-10 emails per mailbox per day in week 1. Target engaged recipients who are likely to open and reply." },
            { "@type": "HowToStep", "name": "Gradually increase volume", "text": "Increase to 15-20 in week 2, 25-35 in week 3, and 40-50 by week 4-6. Monitor bounce rates at each stage." },
            { "@type": "HowToStep", "name": "Monitor engagement signals", "text": "Track open rates, reply rates, and bounce rates. If bounce rate exceeds 3%, pause and investigate before continuing." },
            { "@type": "HowToStep", "name": "Reach full capacity", "text": "After 6-8 weeks with stable metrics, the domain is fully warmed and can sustain full cold outbound volume." }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How long does it take to warm a new email domain?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "2-4 weeks for basic capability, 6-8 weeks for full cold outbound capacity. Rushing by exceeding daily limits is the most common cause of domain burning."
                }
            },
            {
                "@type": "Question",
                "name": "What is the recommended daily email volume during domain warming?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Start at 5-10 per mailbox in week 1, increase to 15-20 (week 2), 25-35 (week 3), and 40-50 by weeks 4-6. Each mailbox follows its own ramp independently."
                }
            },
            {
                "@type": "Question",
                "name": "Can you warm multiple mailboxes on the same domain simultaneously?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, but combined volume must stay within safe thresholds. Five mailboxes at 10 emails each means 50 total from the domain. ISPs evaluate at both mailbox and domain level."
                }
            },
            {
                "@type": "Question",
                "name": "What is domain warming?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain warming is the process of gradually building sender reputation on a new or inactive email domain by systematically increasing sending volume over 6-8 weeks. It generates positive engagement signals that train ISP scoring models to trust the domain for inbox delivery."
                }
            },
            {
                "@type": "Question",
                "name": "What is mailbox cooldown?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Mailbox cooldown is the practice of temporarily reducing or stopping sending from a mailbox that has accumulated negative reputation signals. The pause allows ISP scoring models to decay the negative signals before the mailbox resumes sending at reduced volume. Cooldown periods typically last 48-72 hours minimum."
                }
            },
            {
                "@type": "Question",
                "name": "How can outbound teams prevent reputation damage?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Outbound teams prevent reputation damage by verifying leads before sending, following graduated warming schedules, monitoring bounce rates in real-time, configuring DNS authentication correctly, and using automated protection tools like Superkabe that pause mailboxes and gate domains when thresholds are breached."
                }
            }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                    Domain Warming Methodology
                </h1>
                <p className="text-gray-400 text-sm mb-8">9 min read · Updated February 2026</p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Domain warming takes 6-8 weeks — there are no shortcuts without consequences</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Start at 5-10 emails/day per mailbox, ramping to 40-50 by week 4-6</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> ISPs track both mailbox-level AND domain-level volume — aggregate matters</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Unverified leads during warming are catastrophic — one bad batch burns the domain</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Superkabe applies tighter thresholds during warming (2 bounces = warning, 20% = gate)</li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Domain warming is the process of gradually building sender reputation on a new or inactive email domain by systematically increasing sending volume over time. A properly warmed domain can sustain 40–50 cold outbound emails per mailbox per day with strong inbox placement. A domain that skips or rushes the warming process will be flagged, throttled, and potentially blacklisted within days.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why Domain Warming Is Required</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        When a new domain begins sending email, ISPs have no historical data to assess its trustworthiness. Without sending history, the domain starts with a neutral reputation — not positive, not negative. ISPs treat emails from neutral-reputation domains with suspicion, routing them to spam or applying heavy throttling.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The warming process generates positive engagement signals (opens, replies, non-bounces) that build the domain&apos;s reputation score over time. Each successful delivery without a bounce or spam complaint contributes to the domain&apos;s credibility with ISPs.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The Warming Ramp Schedule</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The following schedule represents conservative warming for cold outbound domains. These volumes are per mailbox, per day:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Week</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Daily Volume</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Target Engagement</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Max Bounce Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Week 1</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">5–10 emails</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">&gt; 40% open rate</td>
                                    <td className="py-4 px-6 text-green-600 text-sm">&lt; 1%</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Week 2</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">15–20 emails</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">&gt; 30% open rate</td>
                                    <td className="py-4 px-6 text-green-600 text-sm">&lt; 2%</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Week 3</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">25–35 emails</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">&gt; 25% open rate</td>
                                    <td className="py-4 px-6 text-yellow-600 text-sm">&lt; 3%</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Week 4–6</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">40–50 emails</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">&gt; 20% open rate</td>
                                    <td className="py-4 px-6 text-yellow-600 text-sm">&lt; 3%</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Week 6+</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Full capacity</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Stable metrics</td>
                                    <td className="py-4 px-6 text-yellow-600 text-sm">&lt; 5%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Warming Signals That Matter</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        ISPs evaluate multiple signals during the warming period. Not all signals carry equal weight:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 text-green-600">Positive Signals</h3>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li>✓ Recipient opens the email</li>
                                <li>✓ Recipient replies to the email</li>
                                <li>✓ Recipient moves email from spam to inbox</li>
                                <li>✓ Recipient adds sender to contacts</li>
                                <li>✓ Low bounce rate across all mailboxes</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 text-red-600">Negative Signals</h3>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li>✗ Hard bounces (invalid addresses)</li>
                                <li>✗ Spam complaints (mark as spam)</li>
                                <li>✗ Emails deleted without opening</li>
                                <li>✗ Volume spikes (sudden increase)</li>
                                <li>✗ Sending to spam traps</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Common Mistakes That Burn Domains</h2>
                    <ul className="space-y-3 text-gray-600 mb-8">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                            <span><strong>Skipping the ramp entirely:</strong> Sending 50 cold emails on day one from a brand-new domain. ISPs flag this as spam behavior immediately.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                            <span><strong>Using unverified lead lists:</strong> Warming with leads that have not been email-verified. Bounce rates above 3% during warming are catastrophic and will auto-pause your mailbox.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                            <span><strong>Warming all mailboxes simultaneously at full speed:</strong> 5 mailboxes × 50 emails = 250 emails per day from a new domain. ISPs see aggregate domain volume.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                            <span><strong>No engagement during warming:</strong> Sending to addresses that never open or reply generates zero positive signals, leaving the reputation at neutral.</span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe Protects Warming Domains</h2>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Superkabe applies industry-aligned bounce rate protection at all times. Mailboxes auto-pause at 3% bounce rate (after 60 sends), with early warnings at 2%. This aggressive threshold—significantly stricter than industry averages of 5-10%—prevents reputation damage before it occurs. During recovery, mailboxes must maintain &lt;2% bounce rates to graduate back to healthy status, ensuring only verified-clean senders resume outreach.
                    </p>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Key Takeaway</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Domain warming is not optional — it is the foundation of sustainable outbound operations. Rushing the process or cutting corners destroys domains that take weeks to replace. Superkabe enforces warming-phase discipline automatically, ensuring you build reputation instead of burning it.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/email-reputation-lifecycle" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Email Reputation Lifecycle</h3>
                        <p className="text-gray-500 text-xs">How reputation is built and damaged</p>
                    </Link>
                    <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate & Deliverability</h3>
                        <p className="text-gray-500 text-xs">How bounces destroy sender reputation</p>
                    </Link>
                    <Link href="/blog/spf-dkim-dmarc-explained" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">SPF, DKIM, and DMARC</h3>
                        <p className="text-gray-500 text-xs">Email authentication protocols explained</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">← See how Superkabe protects your infrastructure</Link>
                </div>
            </section>

            <Footer />
        </>
    );
}

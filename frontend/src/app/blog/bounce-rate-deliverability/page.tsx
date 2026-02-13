import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Bounce Rate Affects Email Deliverability – Superkabe Blog',
    description: 'Technical guide on email bounce rates, their impact on sender reputation and domain health, and strategies for preventing deliverability degradation.',
};

export default function BounceRateArticle() {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "How Bounce Rate Affects Email Deliverability",
        "author": { "@type": "Organization", "name": "Superkabe", "@id": "https://superkabe.com/#organization" },
        "publisher": { "@type": "Organization", "name": "Superkabe", "@id": "https://superkabe.com/#organization" },
        "datePublished": "2026-02-13",
        "dateModified": "2026-02-13",
        "mainEntityOfPage": "https://superkabe.com/blog/bounce-rate-deliverability"
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is an acceptable email bounce rate?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Below 2% is acceptable. For cold outbound, keep under 3% per domain per rolling 7-day window. Above 5%, most ESPs throttle or suspend."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between a hard bounce and a soft bounce?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Hard bounces are permanent failures (invalid addresses, blocked senders). Soft bounces are temporary (full mailboxes, downtime). Hard bounces directly damage sender reputation; soft bounces only impact if persistent."
                }
            },
            {
                "@type": "Question",
                "name": "How does bounce rate affect domain reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ISPs track bounce rates per domain. Sustained rates above 5% trigger reputation downgrades, routing emails to spam or rejecting entirely. Damage compounds and recovery takes 2-8 weeks."
                }
            },
            {
                "@type": "Question",
                "name": "What bounce rate is considered dangerous?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A bounce rate above 5% is dangerous for any sending domain. At this threshold, ISPs begin throttling and routing emails to spam. Above 10%, domains face blacklisting and permanent rejection. For cold outbound, any rate above 3% per rolling 7-day window warrants immediate investigation."
                }
            },
            {
                "@type": "Question",
                "name": "Does Superkabe reduce bounce rates automatically?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe does not modify leads or sending lists directly. It reduces effective bounce rates by auto-pausing mailboxes that exceed bounce thresholds and gating domain traffic when aggregate bounce ratios become critical. This prevents further bounces from compounding damage to sender reputation."
                }
            },
            {
                "@type": "Question",
                "name": "How does lead quality affect email deliverability?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Low-quality leads — invalid addresses, catch-all domains, disposable emails, and role-based addresses — generate hard bounces and spam complaints. Each hard bounce directly damages sender reputation. A single batch of unverified leads can push a domain above the 5% bounce threshold within hours, triggering ISP penalties."
                }
            }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                    How Bounce Rate Affects Email Deliverability
                </h1>
                <p className="text-gray-400 text-sm mb-8">8 min read · Updated February 2026</p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Bounce rate is the single most heavily weighted signal in ISP reputation models</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Hard bounces (permanent failures) damage reputation directly; soft bounces only matter if persistent</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Above 5%, ISPs begin throttling; above 10%, domains face blacklisting</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Cold outbound is especially vulnerable — one batch of bad leads can burn a domain in hours</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Proactive real-time monitoring is the only viable strategy to prevent compounding damage</li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Email bounce rate is the percentage of sent emails that fail to reach the recipient&apos;s inbox. It is the single most important metric for outbound email infrastructure health. A bounce rate above 5% on any sending domain triggers reputation scoring downgrades at major ISPs, causing all subsequent emails from that domain to be routed to spam or rejected entirely.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Is Email Bounce Rate?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Bounce rate is calculated as the number of bounced emails divided by the total number of emails sent, expressed as a percentage. For example, if you send 1,000 emails and 30 bounce, your bounce rate is 3%.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        There are two categories of bounces that affect deliverability differently:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Hard Bounces (Permanent Failures)</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Hard bounces occur when an email cannot be delivered permanently. Common causes include invalid email addresses, non-existent domains, and recipient mail servers that have permanently blocked the sender. Each hard bounce is recorded by ISPs and directly damages the sending domain&apos;s reputation score.
                        </p>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> SMTP 550: Mailbox does not exist</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> SMTP 551: User not local, no valid forwarding address</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> SMTP 552: Exceeded storage allocation (permanent)</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> SMTP 553: Invalid mailbox name syntax</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Soft Bounces (Temporary Failures)</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Soft bounces are temporary delivery failures. The recipient&apos;s mail server acknowledges the sending domain but cannot accept the message at that moment. Causes include full mailboxes, server downtime, message size limits, and rate limiting. Soft bounces only impact reputation if they persist across multiple send attempts.
                        </p>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-1">●</span> SMTP 421: Service not available, closing connection</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-1">●</span> SMTP 450: Mailbox unavailable (busy or temporarily blocked)</li>
                            <li className="flex items-start gap-2"><span className="text-yellow-500 mt-1">●</span> SMTP 452: Insufficient system storage</li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Bounce Rate Thresholds and ISP Behavior</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Internet Service Providers (ISPs) — Google, Microsoft, Yahoo — maintain internal sender reputation models for every domain that sends email through their systems. Bounce rate is a primary input to these models.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Bounce Rate</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">ISP Response</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Recovery Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-green-600 font-semibold text-sm">&lt; 2%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Normal delivery, no action</td>
                                    <td className="py-4 px-6 text-gray-400 text-sm">N/A</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-yellow-600 font-semibold text-sm">2–5%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Increased spam folder routing, monitoring initiated</td>
                                    <td className="py-4 px-6 text-gray-400 text-sm">1–2 weeks</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-orange-600 font-semibold text-sm">5–10%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Throttling applied, significant spam routing</td>
                                    <td className="py-4 px-6 text-gray-400 text-sm">2–4 weeks</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-red-600 font-semibold text-sm">&gt; 10%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Domain blacklisting, rejection of all emails</td>
                                    <td className="py-4 px-6 text-gray-400 text-sm">4–8 weeks (if recoverable)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why Cold Outbound Is Particularly Vulnerable</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Cold outbound email campaigns are inherently higher-risk for bounce rate issues because the recipient list has not been validated through prior engagement. Unlike marketing emails sent to opted-in subscribers, cold outbound targets addresses that may be outdated, misspelled, or belong to deactivated accounts.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Modern outbound teams typically operate 3–10 domains with 3+ mailboxes per domain, sending 20–30 emails per mailbox per day. At this scale, a single batch of bad leads can push a domain&apos;s bounce rate above the 5% threshold within hours. Once the reputation is damaged, every mailbox on that domain is affected — not just the one that sent the bouncing emails.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe Prevents Bounce-Driven Damage</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Superkabe monitors bounce events in real-time across all sending domains and mailboxes. When bounce rates approach warning thresholds (3% per domain in a rolling 7-day window), Superkabe triggers tiered escalation:
                    </p>
                    <ul className="space-y-3 text-gray-600 mb-8">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                            <span><strong>Warning (3 bounces):</strong> Operators receive alerts. The affected mailbox is flagged for monitoring. No traffic is blocked yet.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                            <span><strong>Pause (5 bounces):</strong> The mailbox is automatically paused. Traffic is redistributed to healthy mailboxes on the same domain using weight-balanced routing.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                            <span><strong>Domain Gate (30% domain bounce ratio):</strong> The execution gate blocks all outgoing SMTP traffic to the domain until bounce rates recover below safe thresholds.</span>
                        </li>
                    </ul>

                    <p className="text-gray-600 leading-relaxed mb-8">
                        This tiered approach ensures that operators have time to react before irreversible damage occurs. By the time a domain reaches the gate threshold, the sending volume on that domain has already been significantly reduced, preventing the bounce rate from compounding further.
                    </p>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Key Takeaway</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Bounce rate is not just a metric — it is the primary signal that determines whether your outbound infrastructure survives or gets burned. Monitoring bounce rates reactively (after damage) is too late. Superkabe provides proactive, real-time protection that blocks damage before it compounds.
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
                        <h3 className="font-bold text-gray-900 text-sm mb-2">The Email Reputation Lifecycle</h3>
                        <p className="text-gray-500 text-xs">How reputation is built, damaged, and recovered</p>
                    </Link>
                    <Link href="/blog/domain-warming-methodology" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Domain Warming Methodology</h3>
                        <p className="text-gray-500 text-xs">Building sender reputation on new domains</p>
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

import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How sender reputation is built, damaged, and repaired over time',
    description: 'How email reputation is built, maintained, damaged, and recovered. Covers ISP scoring models, feedback loops, and the point of no return for domain reputation.',
    alternates: {
        canonical: '/blog/email-reputation-lifecycle',
    },
};

export default function EmailReputationArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "How sender reputation is built, damaged, and repaired over time",
        "description": "How email reputation is built, maintained, damaged, and recovered. Covers ISP scoring models, feedback loops, and the point of no return for domain reputation.",
        "author": {
            "@type": "Organization",
            "name": "Superkabe"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/email-reputation-lifecycle"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How do ISPs calculate email sender reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ISPs use weighted signals: bounce rate (highest weight), spam complaints, engagement metrics (opens, replies), volume consistency, authentication status, and spam trap hits. Each ISP has its own scoring model."
                }
            },
            {
                "@type": "Question",
                "name": "Can a damaged email domain reputation be recovered?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Recovery is possible for moderate damage. Stop sending, fix the root cause, wait 48-72 hours, then re-warm at 50% speed over 2-8 weeks. Severe blacklisting or spam trap hits often make recovery impractical."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between domain reputation and IP reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain reputation is tied to the sending domain name; IP reputation is tied to the server IP. Modern ISPs weight domain reputation more heavily. Changing IPs does not reset domain reputation."
                }
            },
            {
                "@type": "Question",
                "name": "What is sender reputation recovery?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sender reputation recovery is the structured process of rehabilitating a domain that has accumulated negative reputation signals. It involves stopping all sending, identifying and eliminating the root cause, waiting for ISP scoring models to register the pause, then re-warming the domain at reduced volume with stricter monitoring thresholds."
                }
            },
            {
                "@type": "Question",
                "name": "How does Superkabe heal a damaged mailbox?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe implements a graduated healing workflow for damaged mailboxes. It auto-pauses the mailbox, identifies the damage source (bad leads, volume spike, authentication failure), waits for ISP score decay, then re-enables sending at reduced volume. Throughout recovery, tighter thresholds are enforced to prevent relapse."
                }
            },
            {
                "@type": "Question",
                "name": "How long does sender reputation recovery take?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Recovery time depends on the severity of damage. Minor damage (bounce rate spike quickly corrected) takes 1-2 weeks. Moderate damage (sustained high bounce rates) takes 2-4 weeks. Severe damage (blacklisting, spam trap hits) takes 4-8 weeks if recovery is possible at all. Some domains are beyond recovery."
                }
            },
            {
                "@type": "Question",
                "name": "Can Superkabe prevent relapse after recovery?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. After a mailbox or domain enters recovery, Superkabe applies permanently tighter monitoring thresholds for a configurable grace period. Warning triggers are set lower, domain gates activate earlier, and volume caps are enforced more strictly. This prevents the same failure pattern from recurring."
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
                    How sender reputation is built, damaged, and repaired over time
                </h1>
                <p className="text-gray-400 text-sm mb-8">11 min read · Updated February 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    This guide answers a common question from outbound teams: &quot;Is it possible to recover a burned domain, and how exactly are ISP reputation scores calculated?&quot;
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Reputation moves through 4 phases: building (weeks), maintaining (ongoing), damage (hours), recovery (weeks-months)</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Building takes 6 weeks; a single afternoon of bad leads can destroy it</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Domain reputation weighs more than IP reputation in modern ISP models</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Not all domains can be recovered — severe blacklisting may require domain replacement</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Proactive protection is the only cost-effective strategy vs. reactive recovery</li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Email domain reputation is a dynamic score maintained by ISPs that determines whether emails from a domain reach the inbox, land in spam, or get rejected. Reputation moves through a lifecycle: it is built gradually through consistent, positive sending behavior, maintained through ongoing infrastructure discipline, damaged rapidly by spikes in bounces or complaints, and recovered — if possible — through careful remediation. Understanding this lifecycle is essential for any outbound team operating at scale.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Phase 1: Building Reputation (Weeks 1–8)</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Every new domain starts with zero sending history. ISPs have no data to evaluate it, so the domain exists in a neutral state — neither trusted nor untrusted. During this phase, every email sent is scrutinized more heavily than it would be from an established domain.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Building reputation requires generating consistent positive signals: successful deliveries without bounces, recipient engagement (opens and replies), and absence of spam complaints. The key word is consistent. ISPs reward predictable sending patterns and penalize erratic behavior.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This is the domain warming phase. Volume starts low (5–10 emails per mailbox per day) and increases gradually over 4–8 weeks. Attempting to skip this phase — by sending full-volume cold outbound from a new domain — almost always results in immediate throttling or blacklisting.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Phase 2: Maintaining Reputation (Ongoing)</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Once a domain has established positive reputation, maintenance requires ongoing discipline. The primary maintenance requirements are:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <ul className="space-y-4 text-gray-600 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                                <span><strong>Consistent sending volume:</strong> ISPs expect domains to send roughly the same volume week over week. Sudden spikes (e.g., doubling volume overnight) trigger reputation reviews.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                                <span><strong>Low bounce rate:</strong> Keep hard bounce rates below 2% per rolling 7-day window. Soft bounces below 5%.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                                <span><strong>Clean authentication:</strong> SPF, DKIM, and DMARC must remain correctly configured. DNS changes that break authentication cause immediate reputation damage.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                                <span><strong>Spam complaint rate below 0.3%:</strong> Google&apos;s published threshold is 0.3% complaint rate. Exceeding this triggers spam folder routing for all emails from the domain.</span>
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Phase 3: Reputation Damage (Hours to Days)</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Reputation damage happens fast — significantly faster than reputation building. A domain that took 6 weeks to warm can be damaged in a single afternoon. The most common causes of rapid reputation damage:
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Cause</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Time to Damage</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Severity</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-600 text-sm">Batch of invalid leads (high bounce)</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Hours</td>
                                    <td className="py-4 px-6 text-orange-600 font-semibold text-sm">High</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-600 text-sm">Spam trap hit</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Immediate</td>
                                    <td className="py-4 px-6 text-red-600 font-semibold text-sm">Critical</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-600 text-sm">Sudden volume spike</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">1–2 days</td>
                                    <td className="py-4 px-6 text-yellow-600 font-semibold text-sm">Moderate</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-600 text-sm">Spam complaints above 0.3%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">1–3 days</td>
                                    <td className="py-4 px-6 text-orange-600 font-semibold text-sm">High</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-600 text-sm">DNS authentication failure</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Hours</td>
                                    <td className="py-4 px-6 text-red-600 font-semibold text-sm">Critical</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The asymmetry between building and damaging reputation is the central challenge of outbound email operations. It takes 6 weeks to build what can be destroyed in 6 hours. This is why proactive monitoring is not optional — it is the only viable defense.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Phase 4: Recovery (Weeks to Months)</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Recovery from reputation damage follows a process similar to initial warming but with additional constraints. The domain now has negative history that ISPs remember. Recovery steps:
                    </p>
                    <ol className="space-y-3 text-gray-600 mb-8 list-decimal pl-5">
                        <li><strong>Stop all sending immediately.</strong> Continued sending while reputation is damaged compounds the damage exponentially.</li>
                        <li><strong>Identify and fix the root cause.</strong> Was it bad leads? Authentication failure? Volume spike? The cause must be eliminated before re-warming.</li>
                        <li><strong>Wait 48–72 hours.</strong> Allow ISP scoring models to register the sending stop.</li>
                        <li><strong>Re-warm at 50% of normal ramp speed.</strong> Start at 3–5 emails per day, not 5–10. Damaged domains are under closer scrutiny.</li>
                        <li><strong>Monitor engagement aggressively.</strong> Every bounce during recovery carries more weight than during initial warming.</li>
                    </ol>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The Point of No Return</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Not all domains can be recovered. If a domain has been blacklisted by multiple major ISPs (Google, Microsoft, Yahoo), hit recycled spam traps, or sustained bounce rates above 15% for more than a week, recovery is typically not cost-effective. Purchasing a new domain and starting the warming process from scratch is often faster and more reliable than attempting to rehabilitate a severely damaged domain.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        This is the core value proposition of Superkabe: preventing domains from ever reaching the point of no return. By monitoring bounce rates, engagement signals, and authentication health in real-time, Superkabe triggers protective action (mailbox pausing, domain gating, traffic redistribution) before damage becomes irreversible.
                    </p>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Key Takeaway</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Email reputation is not a static score — it is a living metric that moves through distinct lifecycle phases. Building takes weeks, maintaining requires constant discipline, damage happens in hours, and recovery — if possible — takes weeks or months. The only sustainable strategy is proactive protection that prevents damage before it occurs.
                            </p>
                        </div>
                    </div>
                </div>
    
            <div className="mt-16 pt-10 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                    Superkabe continuously tracks bounce rates and DNS authentication status, auto-pausing mailboxes and gating domains when risk thresholds are breached, so you detect and prevent domain degradation before it becomes irreversible.
                </p>
            </div>
        </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate & Deliverability</h3>
                        <p className="text-gray-500 text-xs">How bounces destroy sender reputation</p>
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

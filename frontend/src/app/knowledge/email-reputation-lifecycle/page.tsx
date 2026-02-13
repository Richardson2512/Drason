import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'The Email Reputation Lifecycle – Superkabe Knowledge Hub',
    description: 'How email reputation is built, maintained, damaged, and recovered. Covers ISP scoring models, feedback loops, and the point of no return for domain reputation.',
};

export default function EmailReputationArticle() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How do ISPs calculate email sender reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ISPs calculate sender reputation using a weighted combination of signals: bounce rate (highest weight), spam complaint rate, engagement metrics (opens, replies), sending volume consistency, authentication status (SPF/DKIM/DMARC), and spam trap hits. Each ISP maintains its own proprietary scoring model, but these core signals are universal."
                }
            },
            {
                "@type": "Question",
                "name": "Can a damaged email domain reputation be recovered?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Recovery is possible if the damage is moderate (bounce rates were 5-10% for a short period). Recovery requires stopping all sending, fixing the root cause, then slowly re-warming the domain over 2-8 weeks. However, if the domain has been blacklisted by multiple ISPs or hit spam traps, recovery may be impractical and purchasing a new domain is often more cost-effective."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between domain reputation and IP reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain reputation is tied to the sending domain name (e.g., superkabe.com) while IP reputation is tied to the server's IP address. Modern ISPs weight domain reputation more heavily than IP reputation. Changing IPs does not reset your domain reputation. For outbound teams using shared sending infrastructure like Smartlead, domain reputation is the primary factor."
                }
            }
        ]
    };

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <header className="fixed top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/" className="hover:text-black transition-colors">Product</Link>
                        <Link href="/docs" className="hover:text-black transition-colors">Documentation</Link>
                        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                    <div className="flex gap-4 items-center">
                        <Link href="/login" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Sign In</Link>
                        <Link href="/signup" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">Get Started</Link>
                    </div>
                </div>
            </header>

            <article className="relative z-10 pt-40 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link href="/knowledge" className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium mb-8 hover:gap-3 transition-all">
                        <ArrowLeft size={14} /> Back to Knowledge Hub
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                        The Email Reputation Lifecycle
                    </h1>
                    <p className="text-gray-400 text-sm mb-12">11 min read · Updated February 2026</p>

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
                </div>
            </article>

            <Footer />
        </div>
    );
}

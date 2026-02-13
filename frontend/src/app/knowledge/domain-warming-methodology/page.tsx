import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Domain Warming Methodology – Superkabe Knowledge Hub',
    description: 'Systematic approach to building sender reputation on new domains. Volume ramp schedules, warming signals, and common mistakes that burn domains.',
};

export default function DomainWarmingArticle() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How long does it take to warm a new email domain?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain warming typically takes 2-4 weeks for basic sending capability and 6-8 weeks for full cold outbound capacity. The timeline depends on the warming methodology, engagement rates, and the specific ISPs being targeted. Rushing the process by exceeding daily volume limits is the most common cause of domain burning."
                }
            },
            {
                "@type": "Question",
                "name": "What is the recommended daily email volume during domain warming?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Start with 5-10 emails per day in week 1, increasing to 15-20 in week 2, 25-35 in week 3, and reaching full capacity of 40-50 per day by week 4-6. These volumes are per mailbox. Each mailbox on a domain should follow its own ramp schedule independently."
                }
            },
            {
                "@type": "Question",
                "name": "Can you warm multiple mailboxes on the same domain simultaneously?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, but with caution. Each mailbox contributes to the domain's aggregate reputation. If you warm 5 mailboxes simultaneously at 10 emails each, the domain is sending 50 emails per day total. ISPs evaluate reputation at both the mailbox and domain level, so the combined volume must stay within safe warming thresholds."
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
                        Domain Warming Methodology
                    </h1>
                    <p className="text-gray-400 text-sm mb-12">9 min read · Updated February 2026</p>

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
                                <span><strong>Using unverified lead lists:</strong> Warming with leads that have not been email-verified. Bounce rates above 5% during warming are catastrophic.</span>
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
                            Superkabe recognizes warming-phase domains and applies stricter monitoring thresholds. During the warming period, bounce rate warnings trigger at 2 bounces (instead of the standard 3), and domain-level gates activate at 20% bounce ratio (instead of 30%). This tighter protection prevents a single batch of bad leads from destroying a domain before its reputation is established.
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
                </div>
            </article>

            <Footer />
        </div>
    );
}

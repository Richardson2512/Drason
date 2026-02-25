'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in by checking for auth token cookie
        const cookies = document.cookie.split(';').reduce((acc: any, c) => {
            const [k, v] = c.trim().split('=');
            acc[k] = v;
            return acc;
        }, {});
        setIsLoggedIn(!!cookies.token);
    }, []);

    const features = [
        {
            title: "Superkabe Integration & Monitoring",
            desc: "Native webhooks synchronize with Smartlead and Clay in real-time. We capture every bounce event and delivery block instantly to maintain 99%+ infrastructure health."
        },
        {
            title: "Domain Health Execution Gate",
            desc: "Our intelligent protection layer stops outgoing SMTP traffic to damaged domains. Every email is validated against current domain reputation scores before execution."
        },
        {
            title: "Auto-Healing Infrastructure",
            desc: "Superkabe algorithms automatically detect mailbox fatigue. When a mailbox underperforms, it is instantly paused and traffic is weight-balanced toward healthy assets."
        },
        {
            title: "Multi-Entity Scaling",
            desc: "Supporting unlimited mailboxes and unique domains. Superkabe scales your outbound operations without increasing the risk profile of your primary sender profiles."
        },
        {
            title: "Infrastructure Analytics Engine",
            desc: "Convert raw monitoring signals into actionable deliverability metrics. Visualize your bounce trends and domain health history in one centralized dashboard."
        }
    ];

    const techSpecs = [
        { label: "Integrations", value: "Smartlead, Clay, Instantly, Custom Webhooks" },
        { label: "Monitoring Frequency", value: "Real-time (High Latency Blocking)" },
        { label: "Infrastructure Type", value: "Deliverability Protection Layer (DPL)" },
        { label: "Scaling Limit", value: "Unlimited Domains & Mailboxes" },
        { label: "Response Delay", value: "< 50ms (Gate Check)" }
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How does Superkabe protect sender reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe monitors bounce rates, DNS authentication status, and mailbox health continuously. When a mailbox exceeds safe bounce thresholds, Superkabe auto-pauses it and redistributes traffic to healthy senders. If a domain reaches critical risk levels, all outbound traffic is gated until metrics recover. This prevents the compounding damage that destroys sender reputation."
                }
            },
            {
                "@type": "Question",
                "name": "How is Superkabe different from traditional email deliverability tools?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Traditional deliverability tools report problems after damage has occurred. Superkabe is a real-time protection layer that prevents damage before it compounds. It auto-pauses risky mailboxes, gates domain traffic at unsafe bounce thresholds, and enforces graduated recovery — acting as infrastructure armor rather than a diagnostic dashboard."
                }
            },
            {
                "@type": "Question",
                "name": "Who is Superkabe built for?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe is built for outbound email operators, revenue teams, and agencies managing multi-domain sending infrastructure. It is designed for teams running cold outbound campaigns through platforms like Smartlead or Instantly who need automated protection against domain burnout, bounce-rate spikes, and DNS misconfiguration."
                }
            },
            {
                "@type": "Question",
                "name": "Does Superkabe replace email sending platforms like Smartlead?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Superkabe is a protection layer that sits between your sending platform and your infrastructure. It integrates with tools like Smartlead and Clay via webhooks to monitor bounce events, DNS health, and lead quality. Superkabe does not send emails — it protects the infrastructure that does."
                }
            },
            {
                "@type": "Question",
                "name": "How does Superkabe prevent domain burnout?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain burnout occurs when sustained high bounce rates or spam complaints permanently damage a domain's sender reputation. Superkabe prevents this by monitoring every bounce event in real-time, auto-pausing mailboxes at configurable thresholds, gating entire domains when aggregate risk is critical, and enforcing graduated recovery before resuming full volume."
                }
            },
            {
                "@type": "Question",
                "name": "What problems does Superkabe solve for outbound teams?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe solves domain burnout from unmonitored bounce rates, DNS authentication failures that silently degrade deliverability, mailbox fatigue from excessive sending volume, toxic leads that generate hard bounces, and the inability to detect infrastructure damage before it becomes irreversible. It automates the monitoring and response that would otherwise require manual oversight across every domain and mailbox."
                }
            },
            {
                "@type": "Question",
                "name": "Can Superkabe help recover a damaged email domain?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, for domains with moderate reputation damage. Superkabe enforces a graduated recovery workflow: it stops all sending, identifies the root cause, waits for ISP scoring models to register the pause, then re-warms the domain at reduced volume with tighter monitoring thresholds. Severely blacklisted domains may require replacement rather than recovery."
                }
            },
            {
                "@type": "Question",
                "name": "Is Superkabe an email warmup tool?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Superkabe is an infrastructure protection platform, not a warmup service. Warmup tools generate artificial engagement to build initial reputation. Superkabe monitors and protects live sending infrastructure — tracking bounce rates, DNS health, and mailbox resilience to prevent damage during actual outbound campaigns. Both serve different functions and can be used together."
                }
            },
            {
                "@type": "Question",
                "name": "Does Superkabe support multiple domains?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Superkabe supports unlimited domains and mailboxes per organization. Each domain is monitored independently for DNS authentication compliance, bounce rates, and mailbox health. This isolation ensures that a problem on one domain does not cascade to others, which is critical for agencies and teams operating multi-domain outbound infrastructure."
                }
            },
            {
                "@type": "Question",
                "name": "What is domain burnout?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain burnout occurs when sustained high bounce rates or spam complaints permanently damage a domain's sender reputation, making inbox placement nearly impossible even after configuration fixes."
                }
            },
            {
                "@type": "Question",
                "name": "What is mailbox fatigue?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Mailbox fatigue is the degradation of sender reputation caused by sending too many emails too quickly from a single address, measurable through sudden spikes in soft bounces and declining open rates."
                }
            },
            {
                "@type": "Question",
                "name": "What is a Deliverability Protection Layer (DPL)?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A Deliverability Protection Layer (DPL) is infrastructural middleware that sits between your enrichment tools and sending accounts to actively halt vulnerable outbound traffic before ISP reputation penalties are triggered."
                }
            }
        ]
    };

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] overflow-hidden font-sans">

            {/* FAQPage Schema for AI Overviews */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Explicit WebSite + Org Schema for Entity Resolution */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: "Superkabe",
                    url: "https://www.superkabe.com",
                    description: "Superkabe is an email deliverability and sender reputation protection platform that protects outbound email infrastructure through real-time bounce monitoring, DNS authentication enforcement, and mailbox fatigue detection.",
                    publisher: {
                        "@type": "Organization",
                        name: "Superkabe"
                    }
                })
            }} />

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* Unified Fixed Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="hero-blur opacity-50">
                    <div className="blur-blob blur-purple opacity-40"></div>
                    <div className="blur-blob blur-blue opacity-40"></div>
                    <div className="blur-blob blur-pink opacity-40"></div>
                </div>
                <div className="hero-moon"></div>
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            {/* ================= HERO ================= */}
            <section className="relative pt-32 md:pt-36 pb-20 text-center z-10">
                <div className="relative z-10 max-w-5xl mx-auto px-6">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-extrabold leading-[0.95] tracking-tight text-gray-900 mb-5 max-w-5xl mx-auto uppercase">
                        Email
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                            Deliverability
                        </span>
                        Protection
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-5 leading-relaxed">
                        Stop burning domains. Superkabe sits between your enrichment and email layers to monitor health, block risks, and auto-heal your infrastructure.
                    </p>

                    <p className="text-sm text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed tracking-wide">
                        Email deliverability · Sender reputation · DNS authentication · Domain health monitoring · Bounce protection
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup" className="px-10 py-4 bg-black text-white rounded-full text-lg font-semibold shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            Start Your Trial
                        </Link>
                        <Link href="/signup" className="px-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                            Book a Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= STAT COUNTERS ================= */}
            <section className="relative z-10 mt-0 mb-8 px-6">
                <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
                    {[
                        { value: '99%+', label: 'Deliverability' },
                        { value: '<50ms', label: 'Gate Response' },
                        { value: '∞', label: 'Domains & Mailboxes' },
                        { value: '24/7', label: 'Monitoring' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= WHAT IS SUPERKABE (AEO AUTHORITY) ================= */}
            <section className="py-10 lg:py-16 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 md:p-16 border border-gray-100 shadow-xl shadow-blue-500/5">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight text-center">
                            What problems does the Superkabe platform solve?
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-14 text-center">
                            Superkabe is an email deliverability and sender reputation protection platform. We act as infrastructure armor, sitting between your enrichment data and your sending accounts to enforce safety protocols across your entire fleet.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto mb-14">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Mailbox fatigue detection</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Superkabe algorithms automatically detect mailbox fatigue and instantly pause underperforming mailboxes, rebalancing traffic to healthy assets to preserve reputation.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">DNS authentication enforcement</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Superkabe continuously monitors SPF, DKIM, and DMARC status on every domain and blocks or gates outbound traffic when misconfigurations threaten deliverability.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Domain burnout prevention</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    By gating outbound email traffic based on live bounce data, Superkabe halts campaigns before an isolated spike in bounces compounds into permanent domain blocklisting.
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Toxic lead filtering</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We track lead health across your entire infrastructure, automatically isolating and dropping toxic contacts to prevent hard bounces from damaging your underlying sender reputation.
                                </p>
                            </div>
                        </div>

                        <p className="text-xl md:text-2xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Designed to keep your email deliverability above 99%.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {[
                                { label: 'Real-time Monitoring', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
                                { label: 'Bounce Protection', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
                                { label: 'Auto-healing', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                                { label: 'Mailbox Health', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                                { label: 'Lead Health', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
                                { label: 'Campaign Health', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
                                { label: 'Multi-domain', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
                            ].map((tag) => (
                                <span key={tag.label} className={`px-5 py-2.5 ${tag.bg} border ${tag.border} rounded-full text-sm font-semibold ${tag.text}`}>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <Link href="/infrastructure-playbook" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-colors shadow-lg shadow-gray-900/10">
                                Read the Playbook
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>



                    {/* ================= INTEGRATION SEQUENCE ================= */}
                    <div className="mt-16 sm:mt-24 mb-6 relative w-full pt-8 pb-8 flex flex-col items-center w-full">
                        <div className="text-center mb-10 px-6 max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                                The Deliverability Protection Pipeline
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                From enrichment to sending, Superkabe operates as your real-time protection layer. We monitor every bounce and connection issue, instantly pausing underperforming mailboxes and auto-healing your infrastructure by re-routing traffic before your domain reputation is damaged.
                            </p>
                        </div>
                        <div className="relative flex flex-col md:flex-row items-center w-full max-w-[100%] lg:max-w-5xl bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl overflow-hidden group">

                            {/* Animated Background glow inside the glass box */}
                            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000">
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full mix-blend-multiply"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full mix-blend-multiply"></div>
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-pink-500/20 blur-[80px] rounded-full mix-blend-multiply"></div>
                            </div>

                            {/* Container for the sequence */}
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-2 md:gap-0">

                                {/* NODE 1: Clay */}
                                <div className="flex flex-col items-center justify-center relative z-10 w-20 h-20">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl border border-gray-100 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500 relative z-20">
                                        <img src="/clay.png" alt="Clay" className="w-10 h-10 object-contain drop-shadow-sm" />
                                    </div>
                                    <span className="absolute -bottom-8 text-sm font-bold text-gray-700 tracking-wide uppercase text-[11px] whitespace-nowrap">Enrich</span>
                                </div>

                                {/* Link 1 */}
                                <div className="hidden md:flex flex-1 items-center justify-center relative z-0 -mx-3 opacity-100 w-full">
                                    <div className="h-[3px] w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 relative flex items-center justify-center shadow-sm -mt-[1.5px]">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] z-10"></div>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] z-10"></div>
                                        <svg className="w-4 h-4 text-indigo-500 absolute drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                                {/* Mobile Link */}
                                <div className="md:hidden h-12 w-[3px] bg-gradient-to-b from-blue-400 to-purple-500 my-1 opacity-100 flex items-center justify-center relative">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-purple-500"></div>
                                    <svg className="w-5 h-5 text-indigo-500 absolute rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </div>

                                {/* NODE 2: Superkabe */}
                                <div className="flex flex-col items-center justify-center relative z-20 w-[80px] h-[80px]">
                                    <div className="w-[80px] h-[80px] min-h-[80px] rounded-[1.5rem] bg-gray-900 shadow-[0_8px_20px_-8px_rgba(148,3,253,0.4)] border border-gray-800 flex items-center justify-center relative overflow-hidden transform transition-transform group-hover:scale-110 duration-500 z-20">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/10 mix-blend-overlay"></div>
                                        <img src="/image/logo-v2.png" alt="Superkabe" className="w-10 h-10 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] object-contain" />
                                    </div>
                                    <span className="absolute -bottom-8 text-sm font-bold text-gray-900 tracking-wide uppercase text-[11px] whitespace-nowrap">Protect</span>
                                </div>

                                {/* Link 2 */}
                                <div className="hidden md:flex flex-1 items-center justify-center relative z-0 -mx-3 opacity-100 w-full">
                                    <div className="h-[3px] w-full bg-gradient-to-r from-purple-500 via-pink-400 to-rose-400 relative flex items-center justify-center shadow-sm -mt-[1.5px]">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] z-10"></div>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-purple-500 z-10"></div>
                                        <svg className="w-4 h-4 text-pink-500 absolute drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                                {/* Mobile Link */}
                                <div className="md:hidden h-12 w-[3px] bg-gradient-to-b from-purple-500 to-rose-400 my-1 opacity-100 flex items-center justify-center relative">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-rose-400"></div>
                                    <svg className="w-5 h-5 text-pink-500 absolute rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </div>

                                {/* NODE 3: Sending Platform Train */}
                                <div className="flex flex-col items-center justify-center relative z-10 w-[80px] h-[80px]">
                                    <div className="w-[80px] h-[80px] min-h-[80px] rounded-[1.5rem] bg-white shadow-xl border border-gray-100 overflow-hidden relative transform transition-transform group-hover:scale-105 duration-500 z-20">
                                        <div className="absolute inset-x-0 w-full animate-col-train">
                                            <div className="h-20 flex items-center justify-center">
                                                <img src="/smartlead.webp" alt="Smartlead" className="w-10 h-10 object-contain" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <img src="/instantly.png" alt="Instantly" className="w-10 h-10 object-contain" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <img src="/emailbison.png" alt="Email Bison" className="w-10 h-10 object-contain" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <img src="/replyio.png" alt="Reply.io" className="w-10 h-10 object-contain bg-white" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <img src="/smartlead.webp" alt="Smartlead" className="w-10 h-10 object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-8 h-4 overflow-hidden w-28 relative">
                                        <div className="absolute inset-x-0 w-full animate-col-train text-center flex flex-col text-[11px] font-bold text-gray-700 tracking-wide uppercase whitespace-nowrap">
                                            <span className="h-4 flex items-center justify-center mb-[4.1rem]">Smartlead</span>
                                            <span className="h-4 flex items-center justify-center mb-[4.1rem]">Instantly</span>
                                            <span className="h-4 flex items-center justify-center mb-[4.1rem]">Email Bison</span>
                                            <span className="h-4 flex items-center justify-center mb-[4.1rem]">Reply.io</span>
                                            <span className="h-4 flex items-center justify-center">Smartlead</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Link 3 */}
                                <div className="hidden md:flex flex-[0.7] items-center justify-center relative z-0 -mx-3 opacity-100 w-full">
                                    <div className="h-[3px] w-full bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 relative flex items-center justify-center shadow-sm -mt-[1.5px]">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"></div>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-rose-400 z-10"></div>
                                        <svg className="w-4 h-4 text-orange-500 absolute drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                                {/* Mobile Link */}
                                <div className="md:hidden h-12 w-[3px] bg-gradient-to-b from-rose-400 to-amber-400 my-1 opacity-100 flex items-center justify-center relative">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-amber-400"></div>
                                    <svg className="w-5 h-5 text-orange-500 absolute rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </div>

                                {/* NODE 4: Slack */}
                                <div className="flex flex-col items-center justify-center relative z-10 w-20 h-20">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl border border-gray-100 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500 relative z-20">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" className="w-10 h-10 object-contain drop-shadow-sm" />
                                    </div>
                                    <span className="absolute -bottom-8 text-sm font-bold text-gray-700 tracking-wide uppercase text-[11px] whitespace-nowrap">Alerts</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES GRID ================= */}
            <section className="py-10 lg:py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-gray-900 tracking-tight">Total Outbound Infrastructure Control</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">Everything you need to keep your domains healthy and your emails landing in the primary inbox.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {features.map((item, i) => (
                            <div key={i} className="soft-card bg-white p-10 md:p-12 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-7 h-7 bg-blue-600 rounded-lg opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <h3 className="font-bold text-xl md:text-2xl mb-4 text-gray-900">{item.title}</h3>
                                <p className="text-gray-500 text-base leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}

                        <div className="rounded-[2rem] flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-10 md:p-12 shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="relative z-10 text-center">
                                <span className="text-5xl mb-4 block">🛡️</span>
                                <h3 className="font-bold text-2xl mb-2">Enterprise-Grade Deliverability Architecture</h3>
                                <p className="text-blue-100 text-sm">Custom solutions for high-volume teams.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= PRICING ================= */}
            <section className="py-10 lg:py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-end">

                    <div>
                        <div className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">Simple Pricing</div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 tracking-tight">Protect your outbound revenue with Superkabe.</h2>
                        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                            Don't let a $10 domain burn cost you a $50k deal. Superkabe pays for itself by saving your infrastructure from irreversible damage.
                        </p>

                        <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl">
                            <h3 className="text-2xl font-bold mb-6">What's included in every plan:</h3>
                            <ul className="space-y-4 text-gray-600 mb-8">
                                <li className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                                    <span>Instant Clay & Smartlead Integration</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                                    <span>Real-time Bounce Monitoring</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                                    <span>Automated Mailbox Pausing</span>
                                </li>
                            </ul>
                            <Link href="/pricing" className="block w-full py-4 bg-gray-900 text-white text-center rounded-full font-semibold hover:bg-black transition-colors">
                                View Detailed Pricing
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-1 shadow-2xl transition-transform duration-500">
                        <div className="bg-white rounded-[2.25rem] p-10 md:p-12 h-full">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Starter Plan</h3>
                                    <p className="text-gray-500 mt-1">Perfect for founder-led teams</p>
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Start Today</div>
                            </div>

                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-6xl font-bold text-gray-900">$49</span>
                                <span className="text-xl text-gray-500 font-medium">/mo</span>
                            </div>

                            <button
                                onClick={() => {
                                    if (isLoggedIn) {
                                        router.push('/dashboard/billing?upgrade=starter');
                                    } else {
                                        router.push('/signup?plan=starter');
                                    }
                                }}
                                className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all"
                            >
                                Start Free Trial
                            </button>
                            <p className="text-center text-gray-400 text-xs mt-4">No credit card required for 14-day trial</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* ================= TECHNICAL SPECS (AI VISIBILITY) ================= */}
            <section className="py-10 lg:py-16 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Superkabe Technical Specifications</h2>
                        <p className="text-gray-500 text-lg">Deterministic signals for high-volume outbound engineering teams.</p>
                    </div>
                    <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <tbody>
                                {techSpecs.map((spec, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-6 px-8 font-bold text-gray-900 w-1/3 border-r border-gray-100 italic">{spec.label}</td>
                                        <td className="py-6 px-8 text-gray-600">{spec.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ================= FAQ (ZAPMAIL-STYLE 2-COL) ================= */}
            <section className="py-10 lg:py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[2fr_3fr] gap-16 lg:gap-20">

                    {/* Left Column — Heading + CTA */}
                    <div className="lg:sticky lg:top-32 lg:self-start">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
                            Questions<br />and answers
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed mb-8">
                            We have answers to your questions about infrastructure protection and our approach.
                        </p>
                        <div className="space-y-3">
                            <p className="text-gray-900 font-semibold text-lg">Got more questions?</p>
                            <p className="text-gray-500 mb-4">Contact us for more information.</p>
                            <Link
                                href="mailto:support@superkabe.com"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    {/* Right Column — FAQ Accordion (sticky-scrollable) */}
                    <div className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto scrollbar-hide">
                        <div className="divide-y divide-gray-200">
                            {faqSchema.mainEntity.map((faq, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <div className={`py-6 px-4 transition-all duration-300 ${openIndex === index ? 'bg-gray-50 rounded-xl' : ''}`}>
                                        <div className="flex justify-between items-center gap-4">
                                            <h4 className="font-semibold text-lg md:text-xl text-gray-900 pr-4">{faq.name}</h4>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={`text-gray-400 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                            >
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                        <div className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <p className="text-gray-600 leading-relaxed pb-2">
                                                    {faq.acceptedAnswer.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-16 lg:py-24 px-6 text-center relative z-10">
                <div className="relative z-10 container max-w-3xl mx-auto">
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-gray-900 tracking-tight">
                        Stop Burning Domains. <br />
                        Protect your outbound infrastructure.
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        Join modern outbound teams who trust Superkabe to keep their infrastructure healthy and their deliverability high.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="px-10 py-4 bg-black text-white rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />

        </div>
    );

}
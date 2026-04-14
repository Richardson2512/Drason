'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';


export default function PricingPage() {
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
    const pricingSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Superkabe Pricing",
        "description": "Simple, transparent pricing for Superkabe infrastructure protection. Protect your outbound domains today.",
        "url": "https://www.superkabe.com/pricing",
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com",
            "logo": "https://www.superkabe.com/image/logo-v2.png"
        },
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Trial", "description": "Free 7-day trial with up to 3 domains and 9 mailboxes" },
                { "@type": "ListItem", "position": 2, "name": "Starter", "description": "$49/month — 20 domains, 75 mailboxes, email validation, 5-phase healing, DNS monitoring, core protection" },
                { "@type": "ListItem", "position": 3, "name": "Growth", "description": "$199/month — 75 domains, 350 mailboxes, hybrid validation, correlation engine, auto-healing pipeline" },
                { "@type": "ListItem", "position": 4, "name": "Scale", "description": "$349/month — 150 domains, 700 mailboxes, aggressive hybrid validation, advanced correlation, mailbox rotation" },
                { "@type": "ListItem", "position": 5, "name": "Enterprise", "description": "Custom pricing — unlimited domains and mailboxes, full hybrid validation with custom thresholds, super admin console, dedicated SLA" }
            ]
        },
        "datePublished": "2025-11-01",
        "dateModified": "2026-04-07"
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 md:pt-36 pb-12 text-center px-4 md:px-6">
                {/* Fixed Background Layer */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="cloud-bg">
                        <div className="cloud-shadow" />
                        <div className="cloud-puff-1" />
                        <div className="cloud-puff-2" />
                        <div className="cloud-puff-3" />
                    </div>
                    <div className="absolute inset-0 hero-grid"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase mb-6">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Transparent pricing for outbound teams
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight leading-[1.05]">
                        Simple pricing for teams of all sizes
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
                        Superkabe is a control layer for modern outbound teams running multi-domain, multi-mailbox email infrastructure. Pick the tier that matches your scale.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
                        <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="px-7 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors shadow-sm">
                            Start free trial
                        </Link>
                        <a href="https://cal.com/richardson-eugin-simon-qzmevd/30min" target="_blank" rel="noopener noreferrer" className="px-7 py-3 bg-white text-gray-900 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                            Book a demo
                        </a>
                    </div>
                    <p className="text-xs text-gray-400">14-day free trial · No credit card required</p>
                </div>
            </div>

            {/* ─── What's included in every plan (popl-inspired checklist) ─── */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
                <div className="bg-white rounded-3xl border border-gray-200 p-10 md:p-14">
                    <div className="text-center mb-10">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">What&apos;s included in every plan</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Every tier ships with infrastructure-grade protection</h2>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                        {[
                            '14-day free trial with no credit card',
                            'Real-time bounce & failure monitoring',
                            '5-phase graduated healing pipeline',
                            'DNS health checks (SPF, DKIM, DMARC)',
                            'Clay, Smartlead, Instantly, EmailBison integrations',
                            'ICP → Campaign routing engine',
                            'Observe / Suggest / Enforce operational modes',
                            'Mailbox & Campaign-level pause',
                            'Audit log & full infra visibility',
                            'Slack real-time alerts',
                            'Failure classification (hard vs soft)',
                            'Sliding window risk tracking',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                                <span className="leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Pricing Tiers — popl grid-line style, 3 public tiers */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Pick the tier that matches your scale</h2>
                    <p className="text-base text-gray-500">Transparent, flat-rate pricing. Upgrade or downgrade anytime.</p>
                </div>

                <div style={{ borderTop: `1px solid #D1CBC5`, borderLeft: `1px solid #D1CBC5` }}>
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <PricingCard
                            tier="Starter"
                            tierKey="starter"
                            description="For founder-led teams running structured outbound infra."
                            price="$49"
                            period="/ month"
                            features={[
                                "Up to 10,000 active leads",
                                "Up to 20 domains",
                                "Up to 75 mailboxes",
                                "10,000 email validation credits (syntax, MX, disposable, catch-all)",
                                "5-phase healing pipeline",
                                "DNS health monitoring",
                                "Standard support",
                            ]}
                            bestFor="Teams sending ~5k–10k leads/month across multiple domains"
                            ctaText="Start free trial"
                            isLoggedIn={isLoggedIn}
                            router={router}
                        />

                        <PricingCard
                            tier="Growth"
                            tierKey="growth"
                            description="For scaling outbound operations with serious infrastructure exposure."
                            price="$199"
                            period="/ month"
                            features={[
                                "Up to 50,000 active leads",
                                "Up to 75 domains",
                                "Up to 350 mailboxes",
                                "50,000 email validation credits (internal + MillionVerifier API for risky leads)",
                                "Correlation engine",
                                "DNS monitoring + blacklist checks",
                                "Priority support",
                            ]}
                            bestFor="B2B SaaS teams running aggressive outbound operations"
                            ctaText="Start free trial"
                            featured
                            isLoggedIn={isLoggedIn}
                            router={router}
                        />

                        <PricingCard
                            tier="Scale"
                            tierKey="scale"
                            description="For agencies and aggressive outbound engines managing large domain fleets."
                            price="$349"
                            period="/ month"
                            features={[
                                "Up to 100,000 active leads",
                                "Up to 150 domains",
                                "Up to 700 mailboxes",
                                "100,000 email validation credits (internal + API for medium & high risk)",
                                "Advanced correlation engine",
                                "Mailbox rotation (standby swap)",
                                "Priority Slack alerts",
                            ]}
                            bestFor="Agencies and high-volume outbound operations"
                            ctaText="Start free trial"
                            isLoggedIn={isLoggedIn}
                            router={router}
                        />
                    </div>
                </div>
            </div>

            {/* ─── Enterprise Book a Demo (dedicated section) ─── */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-16">
                <div className="rounded-3xl overflow-hidden border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
                        {/* Left: Green gradient panel with illustration */}
                        <div
                            className="relative flex flex-col justify-center items-center p-12 md:p-16 text-white min-h-[360px]"
                            style={{ background: 'linear-gradient(to top, #D4F0DC 0%, #1C4532 55%, #143325 100%)' }}
                        >
                            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </div>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-200 mb-3">Enterprise</div>
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-center">Custom deliverability SLA</h3>
                            <p className="text-sm md:text-base text-emerald-50/90 text-center max-w-sm leading-relaxed">
                                Unlimited domains, unlimited mailboxes, super admin console, and a dedicated support team with guaranteed response times.
                            </p>
                        </div>

                        {/* Right: Benefits list + CTA */}
                        <div className="bg-white p-10 md:p-14">
                            <h4 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">Book a demo</h4>
                            <p className="text-sm text-gray-500 mb-8">30-minute call with our team to scope your outbound infrastructure protection.</p>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'Unlimited active leads, domains, and mailboxes',
                                    'Super admin console with multi-workspace controls',
                                    'Custom healing pipeline configuration',
                                    'Unlimited email validation credits with custom thresholds',
                                    'Dedicated CSM + SLA guarantees',
                                    'Custom integrations & white-glove onboarding',
                                ].map((benefit) => (
                                    <li key={benefit} className="flex items-start gap-3 text-sm text-gray-700">
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="leading-relaxed">{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href="https://cal.com/richardson-eugin-simon-qzmevd/30min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors shadow-sm">
                                    Book a demo
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </a>
                                <a href="mailto:richardson@superkabe.com?subject=Enterprise%20Plan%20Inquiry" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-900 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors">
                                    Email sales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Leads Explanation */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-gray-200">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900 tracking-tight">
                    What "Active Leads" Means
                </h2>
                <p className="text-gray-500 mb-8 text-center text-lg">
                    A lead is counted as active when it is:
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <span className="px-6 py-3 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-semibold shadow-sm">
                        Held
                    </span>
                    <span className="px-6 py-3 bg-green-50 border border-green-200 rounded-full text-green-700 font-semibold shadow-sm">
                        Active
                    </span>
                    <span className="px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 font-semibold shadow-sm">
                        Or paused under protection
                    </span>
                </div>
                <p className="text-gray-500 text-center mb-2">
                    Completed leads are no longer counted.
                </p>
                <div className="text-center space-y-2 mt-6">
                    <p className="text-gray-700 font-semibold">You can process more leads over time.</p>
                    <p className="text-gray-700 font-semibold">You are billed based on concurrent exposure.</p>
                </div>
            </div>

            {/* Why We Don't Charge Per Email */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-gray-200">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900 tracking-tight">
                    Why We Don't Charge Per Email Sent
                </h2>
                <p className="text-xl text-gray-500 mb-4 text-center">
                    Superkabe does not send emails.
                </p>
                <p className="text-xl text-gray-900 mb-4 text-center font-bold">
                    We protect infrastructure.
                </p>
                <p className="text-lg text-gray-500 text-center">
                    You pay based on risk exposure, not throughput.
                </p>
            </div>

            {/* 2026 Outbound Context */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-gray-200">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 tracking-tight">
                    Why This Pricing Aligns With 2026 Outbound
                </h2>
                <p className="text-lg text-gray-500 mb-8 text-center">
                    Modern outbound teams typically run:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">3–10 domains</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">3 mailboxes per domain</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">20–30 emails</p>
                        <p className="text-gray-500">per mailbox per day</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">Structured ICP</p>
                        <p className="text-gray-500">-based campaign routing</p>
                    </div>
                </div>
                <p className="text-gray-700 text-center mt-12 text-lg font-medium">
                    Superkabe is priced to match this operational reality.
                </p>
            </div>

            {/* ROI Framing */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 mb-8 border-t border-gray-200">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 tracking-tight">
                    ROI Framing
                </h2>
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 md:p-12 shadow-sm">
                    <p className="text-lg text-gray-700 mb-6 font-medium">
                        If one burned domain costs:
                    </p>
                    <ul className="space-y-4 mb-8 text-gray-600">
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3 text-xl">•</span>
                            <span>2–3 weeks of degraded sending</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3 text-xl">•</span>
                            <span>5,000+ lost leads</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3 text-xl">•</span>
                            <span>$20k–$80k in pipeline exposure</span>
                        </li>
                    </ul>
                    <p className="text-2xl font-bold text-center text-blue-600">
                        Superkabe costs less than a single mistake.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}

interface PricingCardProps {
    tier: string;
    tierKey: string;
    description: string;
    price: string;
    period: string;
    features: string[];
    bestFor?: string;
    ctaText?: string;
    featured?: boolean;
    isLoggedIn: boolean;
    router: any;
}

function PricingCard({ tier, tierKey, description, price, period, features, bestFor, ctaText = "Get started", featured = false, isLoggedIn, router }: PricingCardProps) {
    const [showContactModal, setShowContactModal] = useState(false);

    const handleCTAClick = () => {
        if (tierKey === 'enterprise') {
            setShowContactModal(true);
            return;
        }
        if (isLoggedIn) {
            router.push(`/dashboard/settings?upgrade=${tierKey}`);
        } else {
            router.push(`/signup?plan=${tierKey}`);
        }
    };

    return (
        <div
            className={`relative flex flex-col p-8 md:p-10 transition-colors duration-300 ${featured ? 'bg-gray-900 text-white' : 'hover:bg-white'}`}
            style={{
                borderRight: `1px solid #D1CBC5`,
                borderBottom: `1px solid #D1CBC5`,
            }}
        >
            {featured && (
                <div className="absolute -top-3 left-8 bg-[#FFAA49] text-gray-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Most popular
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 tracking-tight ${featured ? 'text-white' : 'text-gray-900'}`}>{tier}</h3>
                <p className={`text-sm leading-relaxed min-h-[44px] ${featured ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>
            </div>

            <div className="mb-2 flex items-baseline gap-1">
                <span className={`text-5xl font-extrabold tracking-tight ${featured ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                <span className={`text-sm font-medium ${featured ? 'text-gray-400' : 'text-gray-500'}`}>{period}</span>
            </div>
            <p className={`text-[11px] mb-7 ${featured ? 'text-gray-400' : 'text-gray-400'}`}>14-day free trial · No credit card required</p>

            <button
                onClick={handleCTAClick}
                className={`w-full py-3 rounded-full font-semibold text-sm transition-all mb-8 ${featured
                    ? 'bg-white hover:bg-gray-100 text-gray-900'
                    : 'bg-gray-900 hover:bg-black text-white'
                    }`}
            >
                {ctaText}
            </button>

            <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${featured ? 'text-gray-400' : 'text-gray-500'}`}>What&apos;s included</div>
            <ul className="space-y-3 mb-6 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-3 text-sm ${featured ? 'text-gray-200' : 'text-gray-700'}`}>
                        <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${featured ? 'bg-white/10' : 'bg-gray-900'}`}>
                            <svg className={`w-2.5 h-2.5 ${featured ? 'text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                        <span className="leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>

            {bestFor && (
                <div className={`mt-auto pt-5 border-t ${featured ? 'border-white/10' : 'border-gray-100'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${featured ? 'text-gray-400' : 'text-gray-500'}`}>Best for</p>
                    <p className={`text-xs leading-relaxed ${featured ? 'text-gray-300' : 'text-gray-600'}`}>{bestFor}</p>
                </div>
            )}

            {/* Enterprise Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowContactModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="text-3xl mb-3">🤝</div>
                            <h3 className="text-xl font-bold text-gray-900">Contact Sales</h3>
                            <p className="text-sm text-gray-500 mt-2">How would you like to reach us?</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:richardson@superkabe.com?subject=Enterprise%20Plan%20Inquiry"
                                className="flex items-center gap-3 w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                            >
                                <span className="text-2xl">📧</span>
                                <div>
                                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Send an Email</div>
                                    <div className="text-xs text-gray-500">richardson@superkabe.com</div>
                                </div>
                            </a>
                            <a
                                href="https://cal.com/richardson-eugin-simon-qzmevd/30min"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full px-5 py-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left group"
                            >
                                <span className="text-2xl">📅</span>
                                <div>
                                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Book a Meeting</div>
                                    <div className="text-xs text-gray-500">30-min call via Cal.com</div>
                                </div>
                            </a>
                        </div>
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="w-full mt-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

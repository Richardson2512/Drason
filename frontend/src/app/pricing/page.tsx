'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

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
    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans">

            {/* ================= NAVBAR ================= */}
            <header className="absolute top-4 md:top-8 left-0 right-0 flex justify-center z-50 px-4">
                <div className="glass-nav px-4 md:px-10 py-3 md:py-4 flex items-center gap-4 md:gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full w-full max-w-4xl justify-between md:justify-center md:w-auto">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-lg md:text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/" className="hover:text-black transition-colors">Product</Link>
                        <Link href="/docs" className="hover:text-black transition-colors">Documentation</Link>
                        <Link href="/pricing" className="text-black font-semibold transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                    <div className="flex gap-2 md:gap-4 items-center">
                        <Link href="/login" className="text-gray-600 hover:text-black text-sm font-medium transition-colors hidden sm:block">Sign In</Link>
                        <Link href="/signup" className="px-4 md:px-6 py-2 bg-black text-white rounded-full text-xs md:text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative pt-32 md:pt-48 pb-16 md:pb-24 text-center px-4 md:px-6">
                <div className="hero-blur pointer-events-none">
                    <div className="blur-blob blur-purple opacity-40"></div>
                    <div className="blur-blob blur-blue opacity-40"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight">
                        Superkabe Pricing
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-500 mb-4 max-w-3xl mx-auto">
                        Protect Your Outbound Infrastructure Before It Breaks
                    </p>
                    <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Superkabe is a control layer for modern outbound teams running multi-domain, multi-mailbox email infrastructure.
                    </p>
                    <div className="mt-6 md:mt-8 inline-flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-full">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-700 font-bold text-lg">14-day free trial · No credit card required</span>
                    </div>
                    <div className="mt-6 md:mt-8 space-y-2">
                        <p className="text-lg md:text-xl font-semibold text-gray-900">We don't optimize volume.</p>
                        <p className="text-lg md:text-xl font-semibold text-blue-600">We prevent irreversible damage.</p>
                    </div>
                </div>
            </div>

            {/* Pricing Tiers */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* Starter */}
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
                            "Clay & Smartlead integrations",
                            "ICP → Campaign routing",
                            "Bounce & failure monitoring",
                            "Mailbox & Campaign-level pause",
                            "Sliding window risk tracking",
                            "All operational modes (Observe, Suggest, Enforce)",
                            "Failure classification (hard vs soft)",
                            "Audit log & infra visibility",
                            "Standard support"
                        ]}
                        bestFor="Teams sending ~5k–10k leads/month across multiple domains"
                        ctaText="Start free trial"
                        isLoggedIn={isLoggedIn}
                        router={router}
                    />

                    {/* Growth */}
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
                            "Clay & Smartlead integrations",
                            "ICP → Campaign routing",
                            "Bounce & failure monitoring",
                            "Mailbox & Campaign-level pause",
                            "Sliding window risk tracking",
                            "All operational modes (Observe, Suggest, Enforce)",
                            "Failure classification (hard vs soft)",
                            "Audit log & infra visibility",
                            "Priority support"
                        ]}
                        bestFor="B2B SaaS teams running aggressive outbound operations"
                        ctaText="Start free trial"
                        featured
                        isLoggedIn={isLoggedIn}
                        router={router}
                    />

                    {/* Scale */}
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
                            "Clay & Smartlead integrations",
                            "ICP → Campaign routing",
                            "Bounce & failure monitoring",
                            "Mailbox & Campaign-level pause",
                            "Sliding window risk tracking",
                            "All operational modes (Observe, Suggest, Enforce)",
                            "Failure classification (hard vs soft)",
                            "Audit log & infra visibility",
                            "Slack support"
                        ]}
                        bestFor="Agencies and high-volume outbound operations"
                        ctaText="Start free trial"
                        isLoggedIn={isLoggedIn}
                        router={router}
                    />

                    {/* Enterprise */}
                    <PricingCard
                        tier="Enterprise"
                        tierKey="enterprise"
                        description="For high-volume outbound operators requiring governance controls and SLA guarantees."
                        price="Custom"
                        period=""
                        features={[
                            "Unlimited active leads",
                            "Unlimited domains",
                            "Unlimited mailboxes",
                            "Clay & Smartlead integrations",
                            "ICP → Campaign routing",
                            "Bounce & failure monitoring",
                            "Mailbox & Campaign-level pause",
                            "Sliding window risk tracking",
                            "All operational modes (Observe, Suggest, Enforce)",
                            "Failure classification (hard vs soft)",
                            "Audit log & infra visibility",
                            "Dedicated account support"
                        ]}
                        ctaText="Contact sales"
                        isLoggedIn={isLoggedIn}
                        router={router}
                    />
                </div>
            </div>

            {/* Active Leads Explanation */}
            <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-200">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
                    What "Active Leads" Means
                </h2>
                <p className="text-gray-500 mb-8 text-center text-lg">
                    A lead is counted as active when it is:
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <span className="px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-semibold shadow-sm">
                        Held
                    </span>
                    <span className="px-6 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold shadow-sm">
                        Active
                    </span>
                    <span className="px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 font-semibold shadow-sm">
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
            <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-200">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
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
            <div className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-200">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
                    Why This Pricing Aligns With 2026 Outbound
                </h2>
                <p className="text-lg text-gray-500 mb-8 text-center">
                    Modern outbound teams typically run:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">3–10 domains</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">3 mailboxes per domain</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">20–30 emails</p>
                        <p className="text-gray-500">per mailbox per day</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-2xl font-bold text-blue-600 mb-2">Structured ICP</p>
                        <p className="text-gray-500">-based campaign routing</p>
                    </div>
                </div>
                <p className="text-gray-700 text-center mt-12 text-lg font-medium">
                    Superkabe is priced to match this operational reality.
                </p>
            </div>

            {/* ROI Framing */}
            <div className="max-w-4xl mx-auto px-6 py-16 mb-8 border-t border-gray-200">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
                    ROI Framing
                </h2>
                <div className="bg-red-50 border border-red-100 rounded-3xl p-10 shadow-sm">
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
    const handleCTAClick = () => {
        if (tierKey === 'enterprise') {
            // For enterprise, always go to contact/sales page
            window.location.href = 'mailto:sales@superkabe.com?subject=Enterprise Plan Inquiry';
            return;
        }

        if (isLoggedIn) {
            // Logged in: go to settings page (where billing section is) with upgrade parameter
            router.push(`/dashboard/settings?upgrade=${tierKey}`);
        } else {
            // Not logged in: go to signup with plan parameter
            router.push(`/signup?plan=${tierKey}`);
        }
    };

    return (
        <div className={`relative bg-white rounded-3xl p-6 md:p-8 border ${featured ? 'border-blue-500 shadow-2xl shadow-blue-500/10 lg:scale-105 z-10 mt-6 lg:mt-0' : 'border-gray-100 shadow-lg shadow-gray-200/50'} hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full`}>
            {featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Popular
                </div>
            )}
            <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{tier}</h3>
                <p className="text-gray-500 text-sm leading-relaxed min-h-[40px]">{description}</p>
            </div>

            {tierKey !== 'enterprise' && (
                <div className="mb-4 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        14-day free trial
                    </span>
                </div>
            )}

            <div className="mb-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-4xl font-bold text-gray-900">{price}</span>
                <span className="text-gray-500 ml-1 font-medium">{period}</span>
            </div>

            {tierKey !== 'enterprise' && (
                <p className="text-center text-xs text-gray-500 mb-6">
                    No credit card required
                </p>
            )}

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-600 text-sm">
                        <svg className="w-5 h-5 mr-3 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {bestFor && (
                <div className="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <p className="text-xs text-gray-500">
                        <span className="font-semibold text-blue-700 block mb-1">Best for:</span> {bestFor}
                    </p>
                </div>
            )}

            <button
                onClick={handleCTAClick}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 shadow-lg ${featured ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-gray-900 hover:bg-black text-white shadow-gray-200'}`}
            >
                {ctaText}
            </button>
        </div>
    );
}

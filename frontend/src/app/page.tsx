'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function LandingPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const features = [
        {
            title: "Real-Time Monitoring",
            desc: "Webhooks integrate directly with Smartlead & Clay to track every bounce, block, and delivery event as it happens."
        },
        {
            title: "Smart Execution Gate",
            desc: "Prevent sends from damaged domains. Our execution gate checks domain health before every single email."
        },
        {
            title: "Auto-Healing",
            desc: "Automatically pause burnt mailboxes and reroute traffic to healthy ones without lifting a finger."
        },
        {
            title: "Multi-Inbox Support",
            desc: "Scale your outreach with support for unlimited mailboxes and domains under one roof."
        },
        {
            title: "Analytics Dashboard",
            desc: "Visualize your infrastructure health with real-time charts and actionable insights."
        }
    ];

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] overflow-hidden font-sans">

            {/* ================= NAVBAR ================= */}
            <header className="absolute top-8 left-0 right-0 flex justify-center z-50">
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
                        <Link href="/signup" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ================= HERO ================= */}
            <section className="relative pt-48 pb-36 text-center">
                <div className="hero-blur pointer-events-none">
                    <div className="blur-blob blur-purple opacity-40"></div>
                    <div className="blur-blob blur-blue opacity-40"></div>
                    <div className="blur-blob blur-pink opacity-40"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6">
                    <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight text-gray-900 mb-6">
                        Infrastructure Protection for <br />
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Modern Outbound Teams
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Stop burning domains. Superkabe sits between your enrichment and email layers to monitor health, block distinct risks, and auto-heal your infrastructure.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup" className="px-8 py-4 bg-black text-white rounded-2xl text-lg font-semibold shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            Start Your Trial
                        </Link>
                        <Link href="/book-demo" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                            Book a Demo
                        </Link>
                    </div>

                </div>

                {/* ================= BRANDS TRUST LOOP ================= */}
                <div className="mt-24 overflow-hidden relative w-full pt-10 pb-10 border-y border-gray-100/50 bg-white/30 backdrop-blur-[2px]">
                    <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-[#F5F8FF] to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-[#F5F8FF] to-transparent z-10"></div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-12 opacity-80">
                        Trusted by high-volume outbound teams
                    </p>

                    <div className="flex animate-scroll whitespace-nowrap gap-24 items-center">
                        {[
                            { name: "InsightSnap", logo: "/image/brands/insightsnap.png" },
                            { name: "VanishDrop" },
                            { name: "Certinal" },
                            { name: "Rihario" },
                            { name: "SyllabusTracker" },
                            { name: "InsightSnap", logo: "/image/brands/insightsnap.png" },
                            { name: "VanishDrop" },
                            { name: "Certinal" },
                            { name: "Rihario" },
                            { name: "SyllabusTracker" },
                            { name: "InsightSnap", logo: "/image/brands/insightsnap.png" },
                            { name: "VanishDrop" },
                            { name: "Certinal" },
                            { name: "Rihario" },
                            { name: "SyllabusTracker" }
                        ].map((brand, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {brand.logo ? (
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={brand.logo}
                                            alt={`${brand.name} Logo`}
                                            width={32}
                                            height={32}
                                            className="opacity-40 grayscale brightness-75 contrast-125"
                                        />
                                        <span className="text-2xl md:text-3xl font-extrabold text-gray-400/60 hover:text-gray-900 transition-all duration-300 cursor-default tracking-tight">
                                            {brand.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl md:text-3xl font-extrabold text-gray-400/60 hover:text-gray-900 transition-all duration-300 cursor-default tracking-tight">
                                        {brand.name}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FEATURES GRID ================= */}
            <section className="py-24 px-6 bg-white/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Total Infrastructure Control</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to keep your domains healthy and your emails landing in the primary inbox.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((item, i) => (
                            <div key={i} className="soft-card bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-6 h-6 bg-blue-600 rounded-lg opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}

                        <div className="rounded-3xl flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="relative z-10 text-center">
                                <span className="text-5xl mb-4 block">🛡️</span>
                                <h3 className="font-bold text-2xl mb-2">Enterprise Ready</h3>
                                <p className="text-blue-100 text-sm">Custom solutions for high-volume teams.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= PRICING ================= */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-end">

                    <div>
                        <div className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">Simple Pricing</div>
                        <h2 className="text-5xl font-bold mb-6 text-gray-900">Protect your revenue.</h2>
                        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                            Don't let a $10 domain burn cost you a $50k deal. Superkabe pays for itself by saving your infrastructure from irreversible damage.
                        </p>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
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
                            <Link href="/pricing" className="block w-full py-4 bg-gray-900 text-white text-center rounded-xl font-semibold hover:bg-black transition-colors">
                                View Detailed Pricing
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-1 shadow-2xl transition-transform duration-500">
                        <div className="bg-white rounded-[2.25rem] p-10 h-full">
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

                            <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all">
                                Start Free Trial
                            </button>
                            <p className="text-center text-gray-400 text-xs mt-4">No credit card required for 14-day trial</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* ================= FAQ ================= */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">Common Questions</h2>

                    <div className="space-y-4">
                        {[
                            { q: "How does Superkabe integrate with my stack?", a: "Superkabe uses webhooks to connect directly with your sending tools (Smartlead, Instantly) and your data sources (Clay, tables). Set up takes less than 5 minutes." },
                            { q: "Does Superkabe replace Smartlead or Clay?", a: "No. Superkabe sits *between* them as a protection layer. We monitor the signals they generate and act on them to protect your domains." },
                            { q: "Can I use Superkabe with multiple domains?", a: "Yes! Superkabe is built for multi-domain infrastructure. You can track and protect unlimited domains under a single organization." },
                        ].map((faq, index) => (
                            <div key={index} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-lg text-gray-900">{faq.q}</h4>
                                    <span className="text-2xl text-blue-500 font-light">{openIndex === index ? "−" : "+"}</span>
                                </div>
                                {openIndex === index && (
                                    <p className="text-gray-600 mt-4 leading-relaxed">{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 z-0"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full z-0"></div>

                <div className="relative z-10 container max-w-3xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white tracking-tight">
                        Stop Burning Domains.
                    </h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Join modern outbound teams who trust Superkabe to keep their infrastructure healthy and their deliverability high.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="px-10 py-4 bg-white text-gray-900 rounded-2xl font-bold shadow-xl hover:bg-gray-100 transition-colors"
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
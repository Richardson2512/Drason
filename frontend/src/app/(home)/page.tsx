'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';


export default function LandingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const router = useRouter();

    useEffect(() => {
        const cookies = document.cookie.split(';').reduce((acc: any, c) => {
            const [k, v] = c.trim().split('=');
            acc[k] = v;
            return acc;
        }, {});
        setIsLoggedIn(!!cookies.token);
    }, []);

    // Dashboard screenshots for the carousel
    const dashboardSlides = [
        {
            src: '/Untitled design (7).png',
            alt: 'Superkabe System Overview dashboard showing mailboxes, leads, campaigns, and domains',
            caption: 'Real-time system overview',
        },
        {
            src: '/Untitled design (9).png',
            alt: 'Lead Status, Domain Health, and Mailbox Health gauges',
            caption: 'Per-entity health gauges',
        },
        {
            src: '/Untitled design (8).png',
            alt: 'Infrastructure health score with trend history',
            caption: 'Infrastructure score tracking',
        },
        {
            src: '/Untitled design (10).png',
            alt: 'Smartlead and Clay integration configuration',
            caption: 'Native Smartlead + Clay integration',
        },
        {
            src: '/Untitled design (11).png',
            alt: 'Real-time notifications feed',
            caption: 'Live notifications & alerts',
        },
    ];

    // Auto-advance carousel every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % dashboardSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [dashboardSlides.length]);

    const features = [
        {
            title: "Real-time integration & monitoring",
            desc: "Native webhooks sync with Smartlead, Instantly, EmailBison, and Clay in real-time. Every bounce event is captured instantly to maintain infrastructure health.",
            link: "/product/outbound-email-infrastructure-monitoring",
            bg: "bg-[#F9F5F0]",
            accent: "text-amber-700"
        },
        {
            title: "Domain health execution gate",
            desc: "Our protection layer stops outgoing SMTP traffic to damaged domains. Every email is validated against current domain reputation before execution.",
            link: "/product/domain-burnout-prevention-tool",
            bg: "bg-[#EAF4EC]",
            accent: "text-emerald-700"
        },
        {
            title: "Auto-healing infrastructure",
            desc: "Algorithms detect mailbox fatigue automatically. Underperforming mailboxes are paused and traffic is weight-balanced toward healthy assets.",
            link: "/product/automated-domain-healing",
            bg: "bg-[#EEEAF5]",
            accent: "text-purple-700"
        },
        {
            title: "Multi-platform scaling",
            desc: "Unlimited mailboxes and domains across Smartlead, Instantly, EmailBison, and Reply.io. Scale outbound without increasing risk to your primary senders.",
            link: "/product/multi-platform-outbound-protection",
            bg: "bg-[#F0EAE5]",
            accent: "text-orange-700"
        },
    ];

    const techSpecs = [
        { label: "Integrations", value: "Smartlead, Clay, Instantly, EmailBison, Reply.io" },
        { label: "Monitoring Frequency", value: "Real-time with <50ms execution gate checks" },
        { label: "Infrastructure Type", value: "Deliverability Protection Layer (DPL)" },
        { label: "Scaling Limit", value: "Unlimited domains and mailboxes" },
        { label: "Response Delay", value: "Under 50ms per execution gate check" }
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
            },
            {
                "@type": "Question",
                "name": "Does Superkabe validate emails before sending?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Superkabe runs every email through a hybrid validation pipeline before it reaches your sending platform. Internal checks cover syntax, MX records, disposable domains, and catch-all detection. For Growth and Scale plans, risky leads are additionally verified through the MillionVerifier API. Invalid emails are blocked and never reach your sender."
                }
            }
        ]
    };

    const integrationLogos = [
        { src: '/smartlead.webp', alt: 'Smartlead', name: 'Smartlead' },
        { src: '/instantly.png', alt: 'Instantly', name: 'Instantly' },
        { src: '/emailbison.png', alt: 'EmailBison', name: 'EmailBison' },
        { src: '/replyio.png', alt: 'Reply.io', name: 'Reply.io' },
        { src: '/clay.png', alt: 'Clay', name: 'Clay' },
        { src: '/slack-icon.svg', alt: 'Slack', name: 'Slack' },
    ];

    const faqList = [
        {
            q: "How does Superkabe protect sender reputation?",
            a: "Superkabe monitors bounce rates, DNS authentication status, and mailbox health continuously. When a mailbox exceeds safe bounce thresholds, Superkabe auto-pauses it and redistributes traffic to healthy senders."
        },
        {
            q: "Does Superkabe replace email sending platforms like Smartlead?",
            a: "No. Superkabe is a protection layer that sits between your sending platform and your infrastructure. It integrates with tools like Smartlead and Clay via webhooks. Superkabe does not send emails — it protects the infrastructure that does."
        },
        {
            q: "How does Superkabe prevent domain burnout?",
            a: "Superkabe prevents domain burnout by monitoring every bounce event in real-time, auto-pausing mailboxes at configurable thresholds, gating entire domains when aggregate risk is critical, and enforcing graduated recovery before resuming full volume."
        },
        {
            q: "Can Superkabe recover a damaged email domain?",
            a: "Yes, for domains with moderate reputation damage. Superkabe enforces a 5-phase graduated recovery: pause, quarantine, restricted send, warm recovery, and healthy. Each phase has specific graduation criteria."
        },
        {
            q: "Is Superkabe an email warmup tool?",
            a: "No. Superkabe protects live sending infrastructure — tracking bounce rates, DNS health, and mailbox resilience to prevent damage during actual outbound campaigns. Warmup tools and Superkabe can be used together."
        },
    ];

    return (
        <div className="relative bg-[#E8F1E9] text-[#1E1E2F] font-sans min-h-screen">

            {/* FAQPage Schema */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Website Schema */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: "Superkabe",
                    url: "https://www.superkabe.com",
                    description: "Superkabe is an email deliverability and sender reputation protection platform.",
                    publisher: { "@id": "https://www.superkabe.com/#organization" },
                    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".page-subtitle", ".faq-section"] }
                })
            }} />

            {/* SoftwareApplication Schema */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Superkabe",
                    "url": "https://www.superkabe.com/",
                    "applicationCategory": "Email deliverability protection software",
                    "operatingSystem": "Web-based (SaaS)",
                    "description": "Superkabe is an email deliverability and sender reputation protection platform that acts as a Deliverability Protection Layer (DPL) between enrichment tools and outbound email sending accounts.",
                    "offers": {
                        "@type": "Offer",
                        "price": "49",
                        "priceCurrency": "USD",
                        "url": "https://www.superkabe.com/pricing"
                    },
                    "featureList": [
                        "Mailbox fatigue detection and auto-pausing",
                        "DNS authentication enforcement for SPF, DKIM, and DMARC",
                        "Domain burnout prevention using bounce-based gating",
                        "Toxic lead filtering to prevent hard bounces",
                        "Real-time outbound infrastructure monitoring and analytics",
                        "Automated domain healing with 5-phase recovery pipeline",
                        "Load balancing across mailboxes and campaigns",
                        "Multi-platform support for Smartlead, Clay, Instantly, and EmailBison",
                    ]
                })
            }} />

            <Navbar />

            {/* ── Main Card Container (mint border frame) ── */}
            <div className="relative px-4 md:px-8 pt-24 md:pt-28 pb-8">
                <div className="max-w-[1400px] mx-auto bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.04)]">

                    {/* ── HERO SECTION ── */}
                    <section className="relative px-6 md:px-16 pt-16 md:pt-20 pb-16 md:pb-12 text-center overflow-hidden">
                        {/* Subtle grid background */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                            backgroundSize: '48px 48px'
                        }}></div>

                        <div className="relative z-10 max-w-4xl mx-auto">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600 mb-8">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Built to protect your outbound infrastructure
                            </div>

                            {/* Headline */}
                            <h1 className="page-subtitle text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gray-900 mb-6">
                                Stop burning domains with{' '}
                                <span className="relative inline-block">
                                    <span className="relative z-10 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                        Superkabe
                                    </span>
                                </span>
                                {' '}solutions.
                            </h1>

                            {/* Subheadline */}
                            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
                                The deliverability protection layer for cold outbound teams. Monitor health, block risks, and auto-heal your infrastructure — across Smartlead, Instantly, EmailBison, and Reply.io.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
                                <Link
                                    href={isLoggedIn ? "/dashboard" : "/signup"}
                                    className="px-7 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-all shadow-sm hover:shadow-md"
                                >
                                    Get started for free
                                </Link>
                                <a
                                    href="https://cal.com/richardson-eugin-simon-qzmevd/30min"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-7 py-3 bg-white text-gray-700 border border-gray-200 rounded-full text-sm font-semibold hover:border-gray-300 transition-all"
                                >
                                    Book a demo
                                </a>
                            </div>
                            <p className="text-xs text-gray-400">No credit card required · Free trial</p>
                        </div>

                        {/* Dashboard Mockup with Gradient Glow */}
                        <div className="relative mt-12 md:mt-16 max-w-5xl mx-auto">
                            {/* Gradient glow background */}
                            <div className="absolute inset-0 -inset-x-8 md:-inset-x-20 -inset-y-8 pointer-events-none">
                                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-400/40 rounded-full blur-[120px]"></div>
                                <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-300/30 rounded-full blur-[120px]"></div>
                                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-400/30 rounded-full blur-[120px]"></div>
                            </div>

                            {/* Carousel container */}
                            <div className="relative">
                                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-100 bg-white">
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        {dashboardSlides.map((slide, i) => (
                                            <div
                                                key={i}
                                                className={`absolute inset-0 transition-opacity duration-700 ${i === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                            >
                                                <Image
                                                    src={slide.src}
                                                    alt={slide.alt}
                                                    fill
                                                    className="object-cover object-top"
                                                    priority={i === 0}
                                                    sizes="(max-width: 768px) 100vw, 1024px"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Carousel indicators */}
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    {dashboardSlides.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveSlide(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide
                                                ? 'w-8 bg-gray-900'
                                                : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                                }`}
                                            aria-label={`Slide ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Caption */}
                                <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                                    {dashboardSlides[activeSlide].caption}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── INTEGRATIONS STRIP ── */}
                    <section className="px-6 md:px-16 py-16 md:py-20 border-t border-gray-100">
                        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                    Partnerships with <span className="text-emerald-600">50+</span> platforms
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Native integrations with the outbound email stack — sync in real-time via webhooks and API.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                                {integrationLogos.map((logo, i) => (
                                    <div key={i} className="flex items-center justify-center gap-2 bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:border-gray-200 hover:shadow-sm transition-all">
                                        <Image src={logo.src} alt={logo.alt} width={24} height={24} className="object-contain" />
                                        <span className="text-sm font-semibold text-gray-700">{logo.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FEATURES SECTION ── */}
                    <section className="px-6 md:px-16 py-16 md:py-24 border-t border-gray-100 bg-gray-50/30">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-14">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
                                    Our key features
                                </div>
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                    Discover the key{' '}
                                    <span className="text-emerald-600">features and benefits</span>
                                </h2>
                                <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
                                    Everything you need to protect your outbound infrastructure, monitor health in real-time, and scale without burning domains.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                {features.map((feat, i) => (
                                    <Link
                                        key={i}
                                        href={feat.link}
                                        className={`group block ${feat.bg} rounded-3xl p-8 md:p-10 border border-gray-100/50 hover:shadow-lg transition-all duration-300`}
                                    >
                                        <h3 className={`text-lg md:text-xl font-bold text-gray-900 mb-3`}>
                                            {feat.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                            {feat.desc}
                                        </p>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${feat.accent} group-hover:gap-2.5 transition-all`}>
                                            Learn more <span>→</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── STATS / SOCIAL PROOF ── */}
                    <section className="px-6 md:px-16 py-16 md:py-24 border-t border-gray-100">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                    Built for scale, designed for safety
                                </h2>
                                <p className="text-sm text-gray-500 max-w-2xl mx-auto">
                                    Numbers that matter when every lead, mailbox, and domain counts.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                                {[
                                    { value: "99%+", label: "Deliverability" },
                                    { value: "<50ms", label: "Gate Response" },
                                    { value: "∞", label: "Domains & Mailboxes" },
                                    { value: "24/7", label: "Monitoring" },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
                                        <div className="text-xs text-gray-500 font-medium tracking-wide uppercase">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── TECH SPECS ── */}
                    <section className="px-6 md:px-16 py-16 md:py-20 border-t border-gray-100 bg-gray-50/50">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Technical specifications</h2>
                                <p className="text-sm text-gray-500">Under the hood, built to protect.</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                                {techSpecs.map((spec, i) => (
                                    <div key={i} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 px-6 py-4">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{spec.label}</div>
                                        <div className="text-sm text-gray-800">{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FAQ SECTION ── */}
                    <section className="faq-section px-6 md:px-16 py-16 md:py-24 border-t border-gray-100">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                    Frequently asked questions
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Everything you need to know about Superkabe.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {faqList.map((item, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                                        >
                                            <span className="font-semibold text-gray-900 text-sm md:text-base pr-4">{item.q}</span>
                                            <span className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                                        </button>
                                        {openFaq === i && (
                                            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FINAL CTA ── */}
                    <section className="px-6 md:px-16 py-16 md:py-24 border-t border-gray-100">
                        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-purple-50 p-10 md:p-16 border border-gray-100">
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-[100px]"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px]"></div>
                            </div>
                            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                        Protect your outbound{' '}
                                        <span className="text-emerald-600">infrastructure, today.</span>
                                    </h2>
                                    <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                                        Start in minutes. Connect Smartlead or Clay, configure thresholds, and let Superkabe auto-heal your infrastructure while you focus on revenue.
                                    </p>
                                    <Link
                                        href={isLoggedIn ? "/dashboard" : "/signup"}
                                        className="inline-block px-7 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-all shadow-sm"
                                    >
                                        Get started for free
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                                        <Image
                                            src="/Untitled design (7).png"
                                            alt="Superkabe dashboard preview"
                                            fill
                                            className="object-cover object-top"
                                            sizes="(max-width: 768px) 100vw, 500px"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}

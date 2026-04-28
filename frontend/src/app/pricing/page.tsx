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
 // ─── Pricing JSON-LD ────────────────────────────────────────────────
 // Two scripts (rendered separately below):
 // 1. SoftwareApplication w/ AggregateOffer — gives Google's pricing rich
 // results enough to render price ranges. Each plan is a typed Offer
 // with a UnitPriceSpecification that pins billingDuration/Increment.
 // 2. WebPage that references the SoftwareApplication as mainEntity —
 // gives the page itself proper context (name, description, breadcrumbs
 // already injected by BreadcrumbJsonLd elsewhere).
 // The Trial is included as Offer with price "0" so it shows up in price
 // listings. Enterprise is a sibling Offer without a `price` field —
 // schema-valid for "custom pricing" tiers.

 const SOFTWARE_ID = 'https://www.superkabe.com/#software';

 const softwareSchema = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "@id": SOFTWARE_ID,
 "name": "Superkabe",
 "url": "https://www.superkabe.com",
 "image": "https://www.superkabe.com/image/logo-v2.png",
 "description": "AI cold email platform with native deliverability protection. AI sequences, multi-mailbox sending, validation, ESP-aware routing, and the full healing pipeline in one platform.",
 "applicationCategory": "BusinessApplication",
 "applicationSubCategory": "Email Marketing Software",
 "operatingSystem": "Web",
 "brand": { "@type": "Brand", "name": "Superkabe" },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 "featureList": [
 "AI multi-step cold email sequences",
 "Unlimited mailbox connections (Gmail / Microsoft 365 / SMTP)",
 "Hybrid email validation (syntax / MX / disposable / catch-all / MillionVerifier)",
 "Real-time bounce monitoring with auto-pause at 3% bounce rate",
 "5-phase healing pipeline",
 "ESP-aware mailbox routing",
 "DNSBL + Postmaster + ESP monitoring",
 "Protection Mode for Smartlead / Instantly / EmailBison"
 ],
 "offers": {
 "@type": "AggregateOffer",
 "priceCurrency": "USD",
 "lowPrice": "0",
 "highPrice": "349",
 "offerCount": "5",
 "availability": "https://schema.org/InStock",
 "offers": [
 {
 "@type": "Offer",
 "@id": "https://www.superkabe.com/pricing#trial",
 "name": "Trial",
 "description": "14-day free trial. Full platform access — no credit card required.",
 "price": "0",
 "priceCurrency": "USD",
 "priceValidUntil": "2026-12-31",
 "availability": "https://schema.org/InStock",
 "url": "https://www.superkabe.com/signup",
 "category": "Free trial",
 "eligibleDuration": { "@type": "QuantitativeValue", "value": 14, "unitCode": "DAY" }
 },
 {
 "@type": "Offer",
 "@id": "https://www.superkabe.com/pricing#starter",
 "name": "Starter",
 "description": "Solo founders sending 1k–3k emails/month. Unlimited domains, mailboxes, and leads. 20K sends + 3K validation credits per month. Auto-pause + 5-phase healing included.",
 "price": "19",
 "priceCurrency": "USD",
 "priceValidUntil": "2026-12-31",
 "availability": "https://schema.org/InStock",
 "url": "https://www.superkabe.com/pricing#starter",
 "category": "Subscription",
 "priceSpecification": {
 "@type": "UnitPriceSpecification",
 "price": "19",
 "priceCurrency": "USD",
 "billingDuration": "P1M",
 "billingIncrement": "1",
 "unitText": "MONTH",
 "referenceQuantity": { "@type": "QuantitativeValue", "value": "1", "unitCode": "MON" }
 }
 },
 {
 "@type": "Offer",
 "@id": "https://www.superkabe.com/pricing#pro",
 "name": "Pro",
 "description": "Founder-led teams running structured outbound. Unlimited domains, mailboxes, and leads. 60K–250K sends + 10K–50K validation credits (volume tiers).",
 "price": "49",
 "priceCurrency": "USD",
 "priceValidUntil": "2026-12-31",
 "availability": "https://schema.org/InStock",
 "url": "https://www.superkabe.com/pricing#pro",
 "category": "Subscription",
 "priceSpecification": {
 "@type": "UnitPriceSpecification",
 "price": "49",
 "priceCurrency": "USD",
 "minPrice": "49",
 "maxPrice": "169",
 "billingDuration": "P1M",
 "billingIncrement": "1",
 "unitText": "MONTH",
 "referenceQuantity": { "@type": "QuantitativeValue", "value": "1", "unitCode": "MON" }
 }
 },
 {
 "@type": "Offer",
 "@id": "https://www.superkabe.com/pricing#growth",
 "name": "Growth",
 "description": "Scaling outbound. Unlimited domains, mailboxes, and leads. 300K sends + 60K validation credits + API access. Correlation engine and priority support.",
 "price": "199",
 "priceCurrency": "USD",
 "priceValidUntil": "2026-12-31",
 "availability": "https://schema.org/InStock",
 "url": "https://www.superkabe.com/pricing#growth",
 "category": "Subscription",
 "priceSpecification": {
 "@type": "UnitPriceSpecification",
 "price": "199",
 "priceCurrency": "USD",
 "billingDuration": "P1M",
 "billingIncrement": "1",
 "unitText": "MONTH",
 "referenceQuantity": { "@type": "QuantitativeValue", "value": "1", "unitCode": "MON" }
 }
 },
 {
 "@type": "Offer",
 "@id": "https://www.superkabe.com/pricing#scale",
 "name": "Scale",
 "description": "Agencies managing large domain fleets at volume. Unlimited domains, mailboxes, and leads. 600K sends + 100K validation credits + API access. Advanced correlation, rotation, and priority Slack alerts.",
 "price": "349",
 "priceCurrency": "USD",
 "priceValidUntil": "2026-12-31",
 "availability": "https://schema.org/InStock",
 "url": "https://www.superkabe.com/pricing#scale",
 "category": "Subscription",
 "priceSpecification": {
 "@type": "UnitPriceSpecification",
 "price": "349",
 "priceCurrency": "USD",
 "billingDuration": "P1M",
 "billingIncrement": "1",
 "unitText": "MONTH",
 "referenceQuantity": { "@type": "QuantitativeValue", "value": "1", "unitCode": "MON" }
 }
 }
 ]
 }
 };

 // Sibling Offer (not part of AggregateOffer because it has no price).
 // Schema.org permits an Offer without `price` for "contact us" tiers.
 const enterpriseOffer = {
 "@context": "https://schema.org",
 "@type": "Offer",
 "@id": "https://www.superkabe.com/pricing#enterprise",
 "name": "Enterprise",
 "description": "Custom pricing — unlimited domains and mailboxes, super-admin console, dedicated support team, and a guaranteed deliverability SLA.",
 "priceCurrency": "USD",
 "priceValidUntil": "2026-12-31",
 "availability": "https://schema.org/InStock",
 "url": "https://www.superkabe.com/contact",
 "itemOffered": { "@id": SOFTWARE_ID },
 "category": "Enterprise"
 };

 const pageSchema = {
 "@context": "https://schema.org",
 "@type": "WebPage",
 "@id": "https://www.superkabe.com/pricing",
 "name": "Superkabe Pricing",
 "url": "https://www.superkabe.com/pricing",
 "description": "Transparent pricing for Superkabe — the AI cold email platform with native deliverability protection. AI sequences, multi-mailbox sending, email validation, and the full healing pipeline in every plan. From $19/month, with a 14-day free trial.",
 "isPartOf": { "@id": "https://www.superkabe.com/#website" },
 "publisher": { "@id": "https://www.superkabe.com/#organization" },
 "mainEntity": { "@id": SOFTWARE_ID },
 "datePublished": "2025-11-01",
 "dateModified": "2026-04-29"
 };

 const breadcrumbSchema = {
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
 { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com" },
 { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://www.superkabe.com/pricing" }
 ]
 };

 // FAQPage — visible answers below also use this exact copy so the
 // structured-content / visible-content dedup requirement is satisfied.
 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "How much does Superkabe cost?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Superkabe starts at $19/month for the Starter plan (20K sends + 3K validation credits). Pro is $49–$169/month depending on send volume (60K–250K sends + 10K–50K credits). Growth is $199/month (300K sends + 60K credits + API). Scale is $349/month (600K sends + 100K credits). A 14-day free trial is available with no credit card required."
 }
 },
 {
 "@type": "Question",
 "name": "Does every plan include the deliverability protection layer?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Auto-pause at 3% bounce rate, the 5-phase healing pipeline, ESP-aware routing, DNSBL monitoring, and the correlation engine are unmetered features included in every plan from Starter up. Tier pricing only meters monthly send volume and email validation credits — protection is not a paywalled add-on."
 }
 },
 {
 "@type": "Question",
 "name": "Why does Superkabe charge a flat monthly fee instead of per email?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Per-email pricing penalizes outbound teams for healthy volume and creates a perverse incentive to skip validation to save credits. A flat monthly fee with included send + validation credits aligns the platform with the customer's deliverability outcome, not the volume that put it at risk."
 }
 },
 {
 "@type": "Question",
 "name": "Can I upgrade or downgrade my plan anytime?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Plan changes take effect immediately and are prorated against the current billing cycle. Upgrading mid-month adds the new tier's send + validation budget for the remainder of the cycle. Downgrading retains the higher tier until the next renewal."
 }
 },
 {
 "@type": "Question",
 "name": "What counts as one email send?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "One outbound email message dispatched from a connected mailbox to one recipient. Bounces and unsubscribes do not refund a send. Replies received do not consume sends. Validation checks are metered separately as validation credits, not sends."
 }
 }
 ]
 };

 return (
 <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(enterpriseOffer) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
 Superkabe is the AI cold email platform for modern outbound teams — AI sequences, multi-mailbox sending, email validation, and full deliverability protection in one plan. Pick the tier that matches your scale.
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
 <div className="bg-white border border-gray-200 p-10 md:p-14">
 <div className="text-center mb-10">
 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">What&apos;s included in every plan</p>
 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">What does every Superkabe plan include?</h2>
 </div>
 <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
 {[
 'AI sequence generation with A/B variant testing',
 'Multi-mailbox sending (Google Workspace, Microsoft 365, SMTP)',
 'ESP-aware mailbox routing (Gmail, Microsoft, Yahoo)',
 'Hybrid email validation (syntax, MX, disposable, catch-all)',
 'Unified inbox for all connected mailboxes',
 'Real-time bounce & failure monitoring',
 '5-phase graduated healing pipeline',
 'Health gate lead classification (GREEN/YELLOW/RED)',
 'CSV lead upload with bulk validation',
 'DNS health checks (SPF, DKIM, DMARC)',
 'Protection Mode for Smartlead, Instantly, EmailBison',
 '14-day free trial with no credit card',
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
 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">How much does Superkabe cost?</h2>
 <p className="text-base text-gray-500">Transparent, flat-rate pricing. Upgrade or downgrade anytime.</p>
 </div>

 <div style={{ borderTop: `1px solid #D1CBC5`, borderLeft: `1px solid #D1CBC5` }}>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
 <PricingCard
 tier="Starter"
 tierKey="starter"
 description="For solopreneurs testing cold outreach at low volume."
 price="$19"
 period="/ month"
 sequencerFeatures={[
 "Unlimited domains, mailboxes, leads",
 "20,000 email sends/month",
 "3,000 email validation credits",
 ]}
 protectionFeatures={[
 "Unlimited protection coverage",
 "Auto-pause + 5-phase healing",
 "DNSBL + Postmaster + ESP monitoring",
 ]}
 bestFor="Solo founders sending 1k–3k emails/month"
 ctaText="Start free trial"
 isLoggedIn={isLoggedIn}
 router={router}
 />

 <PricingCard
 tier="Pro"
 tierKey="pro"
 description="For founder-led teams running structured outbound infra."
 price="$49"
 period="/ month"
 sequencerFeatures={[
 "Unlimited domains, mailboxes, leads",
 "60,000 email sends/month",
 "10,000 email validation credits",
 ]}
 protectionFeatures={[
 "Unlimited protection coverage",
 "5-phase healing pipeline",
 "ESP-aware routing",
 "DNSBL + Postmaster + ESP monitoring",
 ]}
 bestFor="Teams sending 5k–10k leads/month across domains"
 ctaText="Start free trial"
 sendsDropdown={[
 { sends: 60000, credits: 10000, price: 49 },
 { sends: 80000, credits: 15000, price: 59 },
 { sends: 100000, credits: 20000, price: 79 },
 { sends: 150000, credits: 30000, price: 109 },
 { sends: 200000, credits: 40000, price: 139 },
 { sends: 250000, credits: 50000, price: 169 },
 ]}
 isLoggedIn={isLoggedIn}
 router={router}
 />

 <PricingCard
 tier="Growth"
 tierKey="growth"
 description="For scaling outbound with serious infrastructure exposure."
 price="$199"
 period="/ month"
 sequencerFeatures={[
 "Unlimited domains, mailboxes, leads",
 "300,000 email sends/month",
 "60,000 email validation credits + API",
 ]}
 protectionFeatures={[
 "Unlimited protection coverage",
 "Correlation engine",
 "Priority support",
 ]}
 bestFor="B2B SaaS teams running aggressive outbound"
 ctaText="Start free trial"
 featured
 isLoggedIn={isLoggedIn}
 router={router}
 />

 <PricingCard
 tier="Scale"
 tierKey="scale"
 description="For agencies managing large domain fleets at volume."
 price="$349"
 period="/ month"
 sequencerFeatures={[
 "Unlimited domains, mailboxes, leads",
 "600,000 email sends/month",
 "100,000 email validation credits + API",
 ]}
 protectionFeatures={[
 "Unlimited protection coverage",
 "Advanced correlation + rotation",
 "Priority Slack alerts",
 ]}
 bestFor="Agencies and high-volume cold email programs"
 ctaText="Start free trial"
 isLoggedIn={isLoggedIn}
 router={router}
 />
 </div>
 </div>
 </div>

 {/* ─── Enterprise Book a Demo (dedicated section) ─── */}
 <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-16">
 <div className="overflow-hidden border border-gray-200">
 <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
 {/* Left: Green gradient panel with illustration */}
 <div
 className="relative flex flex-col justify-center items-center p-12 md:p-16 text-white min-h-[360px]"
 style={{ background: 'linear-gradient(to top, #D4F0DC 0%, #1C4532 55%, #143325 100%)' }}
 >
 <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
 </svg>
 </div>
 <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-200 mb-3">Enterprise</div>
 <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-center">Custom platform + deliverability SLA</h3>
 <p className="text-sm md:text-base text-emerald-50/90 text-center max-w-sm leading-relaxed">
 Unlimited domains, unlimited mailboxes, super admin console, and a dedicated support team with guaranteed response times.
 </p>
 </div>

 {/* Right: Benefits list + CTA */}
 <div className="bg-white p-10 md:p-14">
 <h4 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">Book a demo</h4>
 <p className="text-sm text-gray-500 mb-8">30-minute call with our team to scope your AI cold email platform rollout — sending, validation, and protection.</p>

 <ul className="space-y-3 mb-8">
 {[
 'Unlimited sends, validation credits, and protection coverage',
 'Super admin console with multi-workspace controls',
 'Custom healing pipeline configuration',
 'Custom validation thresholds + bulk-buy credits',
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

 {/* ─── Pricing Explainer Rows (popl split-row grid style) ─── */}
 <div className="relative z-10 max-w-6xl mx-auto">
 {/* Section header */}
 <div className="text-center mb-10 px-6">
 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">How pricing works</p>
 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
 Pricing built for how outbound actually works
 </h2>
 </div>

 {/* ROW 1: Active Leads — visual left, content right */}
 <div style={{ borderTop: `1px solid #D1CBC5`, borderLeft: `1px solid #D1CBC5`, borderRight: `1px solid #D1CBC5` }}>
 <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
 <div
 className="flex flex-col items-center justify-center p-10 md:p-14 min-h-[320px]"
 style={{ borderRight: `1px solid #D1CBC5`, borderBottom: `1px solid #D1CBC5` }}
 >
 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5">A lead counts when it is</p>
 <div className="flex flex-wrap justify-center gap-3 mb-6">
 <span className="px-5 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-semibold">Held</span>
 <span className="px-5 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-semibold">Active</span>
 <span className="px-5 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-yellow-700 text-sm font-semibold">Paused under protection</span>
 </div>
 <p className="text-xs text-gray-500">Completed leads are not counted.</p>
 </div>
 <div className="flex flex-col justify-center p-10 md:p-14" style={{ borderBottom: `1px solid #D1CBC5` }}>
 <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">What we meter</p>
 <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.2]">
 Two meters. That&apos;s it.
 </h3>
 <p className="text-sm text-gray-600 leading-relaxed mb-4">
 We charge for <strong className="text-gray-900">monthly send volume</strong> and <strong className="text-gray-900">email validation credits</strong>. Domains, mailboxes, leads, sequences, and protection coverage are <strong className="text-gray-900">unlimited at every tier</strong>.
 </p>
 <p className="text-sm text-gray-600 leading-relaxed">
 Protection isn&apos;t a feature we throttle by plan size — every connected mailbox gets the full state-machine, DNSBL, Postmaster, and ESP-aware healing pipeline. Scale up your infra without scaling up your bill.
 </p>
 </div>
 </div>
 </div>

 {/* ROW 2: No per-email pricing — content left, big stat right */}
 <div style={{ borderLeft: `1px solid #D1CBC5`, borderRight: `1px solid #D1CBC5` }}>
 <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
 <div className="flex flex-col justify-center p-10 md:p-14" style={{ borderRight: `1px solid #D1CBC5`, borderBottom: `1px solid #D1CBC5` }}>
 <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Pricing philosophy</p>
 <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.2]">
 Why we don&apos;t charge per email sent
 </h3>
 <p className="text-sm text-gray-600 leading-relaxed mb-4">
 You pay for <strong className="text-gray-900">monthly send volume</strong>, not throughput. Every plan includes unlimited sends within your monthly cap — so scaling a healthy campaign never multiplies the bill.
 </p>
 <p className="text-sm text-gray-600 leading-relaxed">
 Per-email pricing penalizes scale. Our tiers match the shape of a healthy cold email program — AI sequences, unlimited multi-mailbox sending, and full protection coverage included at every tier.
 </p>
 </div>
 <div
 className="flex flex-col items-center justify-center p-10 md:p-14 text-center min-h-[320px]"
 style={{
 borderBottom: `1px solid #D1CBC5`,
 background: 'linear-gradient(to top, #FFEBC9 0%, #FFAA49 55%, #D4730F 100%)',
 }}
 >
 <div className="text-white">
 <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-2">Superkabe is</p>
 <p className="text-3xl md:text-4xl font-bold leading-tight mb-3">The AI cold email platform</p>
 <p className="text-3xl md:text-4xl font-bold leading-tight opacity-90">built for deliverability.</p>
 </div>
 </div>
 </div>
 </div>

 {/* ROW 3: 2026 Outbound Context — stats grid left, content right */}
 <div style={{ borderLeft: `1px solid #D1CBC5`, borderRight: `1px solid #D1CBC5` }}>
 <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
 <div
 className="p-10 md:p-14 min-h-[320px] flex items-center"
 style={{ borderRight: `1px solid #D1CBC5`, borderBottom: `1px solid #D1CBC5` }}
 >
 <div className="grid grid-cols-2 gap-0 w-full" style={{ border: `1px solid #D1CBC5` }}>
 {[
 { v: '3–10', l: 'Domains' },
 { v: '3 / domain', l: 'Mailboxes' },
 { v: '20–30', l: 'Emails / mailbox / day' },
 { v: 'Structured', l: 'ICP campaign routing' },
 ].map((s, i) => (
 <div
 key={s.l}
 className="bg-white p-6 text-center"
 style={{
 borderRight: i % 2 === 0 ? `1px solid #D1CBC5` : 'none',
 borderBottom: i < 2 ? `1px solid #D1CBC5` : 'none',
 }}
 >
 <p className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-1">{s.v}</p>
 <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{s.l}</p>
 </div>
 ))}
 </div>
 </div>
 <div className="flex flex-col justify-center p-10 md:p-14" style={{ borderBottom: `1px solid #D1CBC5` }}>
 <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">2026 outbound</p>
 <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.2]">
 Priced to match how modern outbound actually runs
 </h3>
 <p className="text-sm text-gray-600 leading-relaxed mb-4">
 Modern outbound teams don&apos;t blast from a single domain. They run 3–10 sending domains, 3 mailboxes each, 20–30 emails per mailbox per day, with ICP-based routing.
 </p>
 <p className="text-sm text-gray-600 leading-relaxed">
 Superkabe tiers are built around this operational reality — not around email volume.
 </p>
 </div>
 </div>
 </div>

 {/* ROW 4: ROI Framing — content left, red stat panel right */}
 <div style={{ borderLeft: `1px solid #D1CBC5`, borderRight: `1px solid #D1CBC5`, borderBottom: `1px solid #D1CBC5` }}>
 <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
 <div className="flex flex-col justify-center p-10 md:p-14" style={{ borderRight: `1px solid #D1CBC5` }}>
 <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">ROI framing</p>
 <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-5 leading-[1.2]">
 Superkabe costs less than a single mistake
 </h3>
 <p className="text-sm text-gray-600 leading-relaxed mb-5">
 One burned domain doesn&apos;t just cost a domain — it costs weeks of pipeline. Here&apos;s the math.
 </p>
 <Link href={isLoggedIn ? '/dashboard' : '/signup'} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors w-fit">
 Start protecting for free
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
 </Link>
 </div>
 <div className="flex flex-col justify-center p-10 md:p-14 bg-red-50 min-h-[320px]">
 <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-4">One burned domain costs</p>
 <div className="space-y-5">
 {[
 { v: '2–3 weeks', l: 'Of degraded sending' },
 { v: '5,000+', l: 'Lost leads' },
 { v: '$20k–$80k', l: 'In pipeline exposure' },
 ].map((item) => (
 <div key={item.l} className="flex items-baseline justify-between gap-4 pb-4 border-b border-red-100 last:border-0 last:pb-0">
 <p className="text-xl md:text-2xl font-bold text-red-700 tracking-tight shrink-0">{item.v}</p>
 <p className="text-xs text-gray-600 text-right font-medium">{item.l}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* FAQ — visible content matches the FAQPage JSON-LD above so the
     structured-data requirement (FAQPage answers must appear on the
     page) is met. Question phrasing also doubles as AEO-targeted H3s
     for "how much does Superkabe cost" / "do all plans include
     protection" style queries. */}
 <section className="relative z-10 px-4 md:px-6 pt-20 md:pt-24 pb-20">
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-10">
 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing FAQ</p>
 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Common questions about Superkabe pricing</h2>
 </div>
 <div className="space-y-3">
 {faqSchema.mainEntity.map((q, i) => (
 <details
 key={i}
 className="group bg-white border border-[#D1CBC5] rounded-xl overflow-hidden"
 {...(i === 0 ? { open: true } : {})}
 >
 <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
 <h3 className="text-base font-bold text-gray-900">{q.name}</h3>
 <svg className="shrink-0 w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
 </svg>
 </summary>
 <div className="px-5 pb-5 -mt-1">
 <p className="text-sm text-gray-600 leading-relaxed">{q.acceptedAnswer.text}</p>
 </div>
 </details>
 ))}
 </div>
 </div>
 </section>

 <div className="h-16"></div>

 <Footer />
 </div>
 );
}

interface SendsOption {
 sends: number; // e.g. 60000
 credits: number; // e.g. 10000
 price: number; // dollars, integer
}

interface PricingCardProps {
 tier: string;
 tierKey: string;
 description: string;
 price: string;
 period: string;
 sequencerFeatures: string[];
 protectionFeatures: string[];
 bestFor?: string;
 ctaText?: string;
 featured?: boolean;
 isLoggedIn: boolean;
 router: any;
 /**
 * Optional — turns the sends line in Sequencer features into a dropdown.
 * Price + credits on the card update live based on the selected option.
 * Used on the Pro tier to smooth the jump between Pro (60k) and Growth (300k).
 */
 sendsDropdown?: SendsOption[];
}

function formatCredits(n: number): string {
 return n.toLocaleString();
}

function PricingCard({ tier, tierKey, description, price, period, sequencerFeatures, protectionFeatures, bestFor, ctaText = "Get started", featured = false, isLoggedIn, router, sendsDropdown }: PricingCardProps) {
 const [showContactModal, setShowContactModal] = useState(false);

 // Sends dropdown state — only used when sendsDropdown prop is provided.
 const [selectedSendsIdx, setSelectedSendsIdx] = useState(0);
 const [sendsMenuOpen, setSendsMenuOpen] = useState(false);
 const selectedOption = sendsDropdown?.[selectedSendsIdx];

 // Close dropdown on outside click / escape
 useEffect(() => {
 if (!sendsMenuOpen) return;
 const close = (e: MouseEvent) => {
 const target = e.target as HTMLElement;
 if (!target.closest('[data-sends-menu]')) setSendsMenuOpen(false);
 };
 const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSendsMenuOpen(false); };
 document.addEventListener('click', close);
 document.addEventListener('keydown', esc);
 return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
 }, [sendsMenuOpen]);

 // When a sends option is selected, override the displayed price.
 const displayPrice = selectedOption ? `$${selectedOption.price}` : price;

 const handleCTAClick = () => {
 if (tierKey === 'enterprise') {
 setShowContactModal(true);
 return;
 }
 // If the user customized sends, pass the selection through the URL so the
 // signup / settings flow can map it to the right Polar product once the
 // product IDs are available. For now it's a query param waiting to be used.
 const query = selectedOption ? `&sends=${selectedOption.sends}` : '';
 if (isLoggedIn) {
 router.push(`/dashboard/settings?upgrade=${tierKey}${query}`);
 } else {
 router.push(`/signup?plan=${tierKey}${query}`);
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

 {/* FIXED-HEIGHT TOP SECTION — ensures CTA aligns across all tiers */}
 <div className="mb-6">
 <h3 className={`text-2xl font-bold mb-2 tracking-tight ${featured ? 'text-white' : 'text-gray-900'}`}>{tier}</h3>
 <p className={`text-sm leading-relaxed h-[66px] overflow-hidden ${featured ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>
 </div>

 <div className="mb-2 flex items-baseline gap-1">
 <span className={`text-5xl font-extrabold tracking-tight ${featured ? 'text-white' : 'text-gray-900'}`}>{displayPrice}</span>
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

 {/* ── SEQUENCER ── */}
 <div className="mb-6">
 <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${featured ? 'text-gray-400' : 'text-gray-500'}`}>
 Sequencer <span className={`font-normal normal-case tracking-normal ${featured ? 'text-gray-500' : 'text-gray-400'}`}>— Sending, no infra limits</span>
 </div>
 <ul className="space-y-2.5">
 {sequencerFeatures.map((feature, idx) => {
 // If a sendsDropdown is configured, the lines that contain
 // "email sends/month" and "email validation credits" are
 // replaced by live values driven by the dropdown selection.
 const isSendsLine = !!sendsDropdown && /email sends\/month/i.test(feature);
 const isCreditsLine = !!sendsDropdown && /email validation credits/i.test(feature);

 return (
 <li key={idx} className={`flex items-start gap-3 text-sm ${featured ? 'text-gray-200' : 'text-gray-700'}`}>
 <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${featured ? 'bg-white/10' : 'bg-gray-900'}`}>
 <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 </span>

 {isSendsLine && selectedOption ? (
 <div className="leading-relaxed flex-1 relative" data-sends-menu>
 <button
 type="button"
 onClick={(e) => { e.stopPropagation(); setSendsMenuOpen(o => !o); }}
 aria-expanded={sendsMenuOpen}
 aria-haspopup="listbox"
 className={`
 group inline-flex items-center justify-between gap-3 w-full max-w-[240px]
 px-3 py-1.5 border text-left transition-colors
 ${featured
 ? 'bg-white/5 border-white/15 hover:border-white/30 hover:bg-white/10 text-white'
 : 'bg-white border-gray-300 hover:border-gray-500 text-gray-900'}
 ${sendsMenuOpen ? (featured ? 'border-white/40 bg-white/10' : 'border-gray-900') : ''}
 `}
 >
 <span className="flex flex-col leading-tight">
 <span className={`text-[9px] font-semibold uppercase tracking-wider ${featured ? 'text-gray-400' : 'text-gray-500'}`}>
 Email sends
 </span>
 <span className={`text-sm font-semibold ${featured ? 'text-white' : 'text-gray-900'}`}>
 {selectedOption.sends.toLocaleString()}
 </span>
 </span>
 <svg
 className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${sendsMenuOpen ? 'rotate-180' : ''} ${featured ? 'text-gray-400' : 'text-gray-500'}`}
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 strokeWidth={2}
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
 </svg>
 </button>

 {sendsMenuOpen && sendsDropdown && (
 <div
 role="listbox"
 className="absolute left-0 top-full z-30 mt-1.5 w-[260px] bg-white shadow-2xl border border-gray-300 overflow-hidden"
 >
 {sendsDropdown.map((opt, i) => {
 const active = i === selectedSendsIdx;
 return (
 <button
 key={opt.sends}
 type="button"
 role="option"
 aria-selected={active}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedSendsIdx(i);
 setSendsMenuOpen(false);
 }}
 className="group/opt w-full text-left px-3 py-2 flex items-center justify-between gap-3 text-xs text-gray-800 transition-colors hover:bg-gray-900 hover:text-white"
 >
 <span className="flex flex-col leading-tight">
 <span className="font-semibold">
 {opt.sends.toLocaleString()} sends
 </span>
 <span className="text-[10px] text-gray-500 group-hover/opt:text-gray-300">
 {opt.credits.toLocaleString()} validation credits
 </span>
 </span>
 <span className="font-bold tabular-nums text-gray-900 group-hover/opt:text-white">
 ${opt.price}
 <span className="ml-0.5 text-[9px] font-medium text-gray-500 group-hover/opt:text-gray-400">/mo</span>
 </span>
 </button>
 );
 })}
 </div>
 )}
 </div>
 ) : isCreditsLine && selectedOption ? (
 <span className="leading-relaxed">
 {formatCredits(selectedOption.credits)} email validation credits
 </span>
 ) : (
 <span className="leading-relaxed">{feature}</span>
 )}
 </li>
 );
 })}
 </ul>
 </div>

 {/* ── PROTECTION ── */}
 <div className="mb-6 flex-1">
 <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${featured ? 'text-gray-400' : 'text-gray-500'}`}>
 Protection <span className={`font-normal normal-case tracking-normal ${featured ? 'text-gray-500' : 'text-gray-400'}`}>— Monitoring, tier limits apply</span>
 </div>
 <ul className="space-y-2.5">
 {protectionFeatures.map((feature, idx) => (
 <li key={idx} className={`flex items-start gap-3 text-sm ${featured ? 'text-gray-200' : 'text-gray-700'}`}>
 <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${featured ? 'bg-white/10' : 'bg-gray-900'}`}>
 <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 </span>
 <span className="leading-relaxed">{feature}</span>
 </li>
 ))}
 </ul>
 </div>

 {bestFor && (
 <div className={`mt-auto pt-5 border-t ${featured ? 'border-white/10' : 'border-gray-100'}`}>
 <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${featured ? 'text-gray-400' : 'text-gray-500'}`}>Best for</p>
 <p className={`text-xs leading-relaxed ${featured ? 'text-gray-300' : 'text-gray-600'}`}>{bestFor}</p>
 </div>
 )}

 {/* Enterprise Contact Modal */}
 {showContactModal && (
 <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowContactModal(false)}>
 <div className="bg-white p-8 max-w-sm w-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
 <div className="text-center mb-6">
 <div className="text-3xl mb-3">🤝</div>
 <h3 className="text-xl font-bold text-gray-900">Contact Sales</h3>
 <p className="text-sm text-gray-500 mt-2">How would you like to reach us?</p>
 </div>
 <div className="flex flex-col gap-3">
 <a
 href="mailto:richardson@superkabe.com?subject=Enterprise%20Plan%20Inquiry"
 className="flex items-center gap-3 w-full px-5 py-4 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
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
 className="flex items-center gap-3 w-full px-5 py-4 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left group"
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

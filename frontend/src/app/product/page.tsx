import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';
import type { Metadata } from 'next';


export const metadata: Metadata = {
 title: 'Product Hub — The AI Cold Email Platform | Superkabe',
 description: 'Everything inside Superkabe — the AI cold email platform with native deliverability protection. AI sequences, multi-mailbox sending, email validation, ESP-aware routing, and auto-healing all from one product.',
 alternates: { canonical: '/product' },
 openGraph: {
 title: 'Product Hub — The AI Cold Email Platform | Superkabe',
 description: 'AI sequences, multi-mailbox sending, email validation, ESP-aware routing, and auto-healing — all in one platform.',
 url: '/product',
 siteName: 'Superkabe',
 type: 'website',
 },
};

export default function ProductIndexPage() {
 const categories = [
 {
 title: 'Master Documentation & Playbooks',
 links: [
 { title: 'The Infrastructure Playbook', href: '/infrastructure-playbook', desc: 'The authoritative, highly detailed A-Z guide on setting up, protecting, and scaling outbound deliverability. Start here.' },
 ]
 },
 {
 title: 'AI Sequencer & Native Sending',
 links: [
 { title: 'AI Cold Email Sequences', href: '/product/ai-cold-email-sequences', desc: 'Multi-step AI-drafted sequences with per-step variant testing, grounded in your ICP and voice.' },
 { title: 'ESP-Aware Routing + Health Gate', href: '/product/esp-aware-sending-health-gate', desc: 'GREEN/YELLOW/RED scoring and pre-send health gate — Gmail↔Gmail, Outlook↔Outlook matching.' },
 { title: 'Unlimited Multi-Mailbox Sending', href: '/product/unlimited-multi-mailbox-sending', desc: 'Google Workspace, Microsoft 365, and custom SMTP with no per-seat limits.' },
 { title: 'Cold Email Sending Analytics', href: '/product/cold-email-sending-analytics', desc: 'Send funnel, inbox placement, and domain-health analytics with HMAC-signed tracking tokens.' },
 ]
 },
 {
 title: 'Core Platform & Infrastructure',
 links: [
 { title: 'Email Deliverability Protection', href: '/product/email-deliverability-protection', desc: 'Complete overview of our deliverability protection engine.' },
 { title: 'Email Validation Infrastructure', href: '/product/email-validation-infrastructure-protection', desc: 'Hybrid email validation layer that catches invalid, disposable, and risky addresses before they reach your sender.' },
 { title: 'Outbound Domain Protection', href: '/product/outbound-domain-protection', desc: 'Secure your outbound sender domains from hard bounces.' },
 { title: 'Email Infrastructure Health Check', href: '/product/email-infrastructure-health-check', desc: 'Continuous DNS health and reputation monitoring.' },
 { title: 'Cold Email Infrastructure Protection', href: '/product/cold-email-infrastructure-protection', desc: 'Designed for high-volume cold email scaling.' },
 { title: 'Outbound Email Infrastructure Monitoring', href: '/product/outbound-email-infrastructure-monitoring', desc: 'Real-time SMTP block and bounce detection.' },
 { title: 'Email Infrastructure Protection', href: '/product/email-infrastructure-protection', desc: 'The baseline protection system for your agency.' },
 ]
 },
 {
 title: 'Email Validation & Lead Hygiene',
 links: [
 { title: 'Lead Control Plane', href: '/product/lead-control-plane', desc: 'Upload CSV leads into Superkabe. Validate, classify by ESP, and route to campaigns with pinned mailboxes.' },
 { title: 'Email Validation Infrastructure Protection', href: '/product/email-validation-infrastructure-protection', desc: 'The hybrid validation layer that filters invalid, disposable, role-based, and catch-all emails before send.' },
 { title: 'ESP-Aware Mailbox Routing', href: '/product/esp-aware-routing', desc: 'Score mailboxes by 30-day per-ESP performance and pin the best performers for each lead.' },
 ]
 },
 {
 title: 'Bounce & Reputation Management',
 links: [
 { title: 'Sender Reputation Protection Tool', href: '/product/sender-reputation-protection-tool', desc: 'Track and shield sender identity profiles.' },
 { title: 'B2B Sender Reputation Management', href: '/product/b2b-sender-reputation-management', desc: 'Enterprise reputation recovery and scaling.' },
 { title: 'Sender Reputation Monitoring', href: '/product/sender-reputation-monitoring', desc: 'Live reputation scoring from major inbox providers.' },
 { title: 'Bounce Rate Protection System', href: '/product/bounce-rate-protection-system', desc: 'Stop campaigns before bounce caps are hit.' },
 { title: 'Automated Bounce Management', href: '/product/automated-bounce-management', desc: 'Webhook-driven bounce isolation.' },
 { title: 'How to Protect Sender Reputation', href: '/product/how-to-protect-sender-reputation', desc: 'Actionable steps to safeguard deliverability.' },
 { title: 'What is Email Deliverability Protection', href: '/product/what-is-email-deliverability-protection', desc: 'Learn the fundamentals of active deliverability protection.' },
 ]
 },
 {
 title: 'Domain Risk & Auto-Healing',
 links: [
 { title: 'Domain Burnout Prevention Tool', href: '/product/domain-burnout-prevention-tool', desc: 'Forecast and stop domain burnout before it strikes.' },
 { title: 'How to Prevent Domain Burnout', href: '/product/how-to-prevent-domain-burnout', desc: 'Best practices for sustainable warmups.' },
 { title: 'Automated Domain Healing', href: '/product/automated-domain-healing', desc: 'Auto-pausing and traffic distribution algorithms.' },
 ]
 },
 {
 title: 'Product Case Studies',
 links: [
 { title: 'Bounce Reduction Case Study', href: '/product/case-study-bounce-reduction', desc: 'How an agency cut bounces to 0.1%.' },
 { title: 'Domain Recovery Case Study', href: '/product/case-study-domain-recovery', desc: 'Recovering 40 burned domains in 14 days.' },
 { title: 'Infrastructure Protection Case Study', href: '/product/case-study-infrastructure-protection', desc: 'Scaling to 100k sends/day safely.' },
 ]
 }
 ];

 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "CollectionPage",
 "name": "Superkabe Product Hub — AI Cold Email Platform with Deliverability Protection",
 "description": "Everything inside Superkabe — the AI cold email platform with native deliverability protection. AI sequences, multi-mailbox sending, email validation, ESP-aware routing, and auto-healing from one product.",
 "url": "https://www.superkabe.com/product",
 "publisher": {
 "@type": "Organization",
 "name": "Superkabe",
 "url": "https://www.superkabe.com",
 "logo": {
 "@type": "ImageObject",
 "url": "https://www.superkabe.com/image/logo-v2.png"
 }
 },
 "mainEntity": {
 "@type": "ItemList",
 "itemListElement": categories.flatMap((category) =>
 category.links.map((link, index) => ({
 "@type": "ListItem",
 "position": index + 1,
 "name": link.title,
 "item": `https://www.superkabe.com${link.href}`
 }))
 )
 }
 };

 return (
 <div className="bg-[#F7F2EB] text-gray-900 font-sans min-h-screen flex flex-col">
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

 {/* ================= NAVBAR ================= */}
 <Navbar />

 <main className="flex-1 max-w-6xl mx-auto px-6 w-full pt-32 md:pt-40 pb-16">
 {/* Mailivery-style header — tag pill + huge H1 + subtitle */}
 <div className="mb-20">
 <div className="mb-8">
 <span className="inline-block px-5 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium">
 Product Hub
 </span>
 </div>
 <h1
 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6"
 style={{ letterSpacing: '-0.02em' }}
 >
 The AI cold email platform — every layer, one product
 </h1>
 <p className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
 Superkabe is an AI cold email platform with native deliverability protection. Explore the full product — AI sequences, multi-mailbox sending, email validation, ESP-aware routing, and the healing layer that keeps senders alive.
 </p>
 <hr className="mt-10 border-0 border-t border-gray-900" />
 </div>

 <div className="space-y-16 md:space-y-20">
 {categories.map((category) => (
 <section key={category.title}>
 <div className="mb-8 md:mb-10 flex items-baseline justify-between gap-4 flex-wrap">
 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
 {category.title}
 </h2>
 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
 {category.links.length} {category.links.length === 1 ? 'page' : 'pages'}
 </span>
 </div>

 {/* Popl-style grid with continuous border lines */}
 <div style={{ borderTop: `1px solid #E5E7EB`, borderLeft: `1px solid #E5E7EB` }}>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
 {category.links.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className="group block p-8 md:p-10 hover:bg-gray-50 transition-colors duration-300"
 style={{
 borderRight: `1px solid #E5E7EB`,
 borderBottom: `1px solid #E5E7EB`,
 }}
 >
 <h3 className="font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors text-base md:text-lg leading-[1.3] tracking-tight">
 {link.title}
 </h3>
 <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5">
 {link.desc}
 </p>
 <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 group-hover:gap-2.5 transition-all">
 Learn more
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
 </span>
 </Link>
 ))}
 </div>
 </div>
 </section>
 ))}
 </div>

 <BottomCtaStrip
 headline="One platform — every layer of cold email"
 body="AI sequences, multi-mailbox sending, validation, real-time monitoring, threshold-based auto-pause, and the 5-phase healing pipeline. 14-day free trial, no credit card required."
 primaryCta={{ label: 'Start free trial', href: '/signup' }}
 secondaryCta={{ label: 'See pricing', href: '/pricing' }}
 />
 </main>

 <Footer />
 </div>
 );
}

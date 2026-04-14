'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// ─── POPL-STYLE GRID ROW COMPONENTS ───────────────────────────────

const GRID_LINE = '#D1CBC5'; // warm grey that matches the cream #F7F2EB bg

function LineWork() {
    return (
        <div className="flex justify-center max-w-6xl mx-auto px-6">
            <div className="w-1/2 h-[60px] md:h-[100px]" style={{ borderLeft: `1px solid ${GRID_LINE}`, borderRight: `1px solid ${GRID_LINE}` }} />
        </div>
    );
}

interface PlatformRowProps {
    eyebrow: string;
    title: string;
    body: string;
    tags: string[];
    tagColor: 'blue' | 'purple' | 'teal' | 'orange' | 'yellow' | 'pink';
    link: string;
    imageOnLeft: boolean;
    mockup: React.ReactNode;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700' },
};

function PlatformRow({ eyebrow, title, body, tags, tagColor, link, imageOnLeft, mockup }: PlatformRowProps) {
    const tc = TAG_COLORS[tagColor];
    return (
        <>
            <LineWork />
            <div style={{ borderTop: `1px solid ${GRID_LINE}`, borderBottom: `1px solid ${GRID_LINE}` }}>
                <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-stretch ${imageOnLeft ? '' : 'md:flex-row-reverse'}`}>
                    {/* Image side */}
                    <div
                        className="md:w-1/2 flex items-center justify-center p-8 md:p-12 min-h-[360px]"
                        style={{
                            borderLeft: `1px solid ${GRID_LINE}`,
                            borderRight: `1px solid ${GRID_LINE}`,
                        }}
                    >
                        {mockup}
                    </div>
                    {/* Content side */}
                    <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12">
                        <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">{eyebrow}</p>
                        <h3 className="text-2xl md:text-3xl lg:text-[36px] font-bold leading-[1.15] tracking-tight text-gray-900 mb-5">{title}</h3>
                        <p className="text-base text-gray-600 leading-relaxed mb-6">{body}</p>
                        <div className="flex flex-wrap gap-2 mb-7">
                            {tags.map((t) => (
                                <span key={t} className={`px-3 py-1 rounded-full text-[11px] font-semibold ${tc.bg} ${tc.text}`}>{t}</span>
                            ))}
                        </div>
                        <div>
                            <Link href={link} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors">
                                Learn more <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

interface FeatureRowProps {
    eyebrow: string;
    title: string;
    body: string;
    link: string;
    imageOnLeft: boolean;
    mockup: React.ReactNode;
}

function FeatureRow({ eyebrow, title, body, link, imageOnLeft, mockup }: FeatureRowProps) {
    return (
        <>
            <LineWork />
            <div style={{ borderTop: `1px solid ${GRID_LINE}`, borderBottom: `1px solid ${GRID_LINE}` }}>
                <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-stretch ${imageOnLeft ? '' : 'md:flex-row-reverse'}`}>
                    <div
                        className="md:w-1/2 flex items-center justify-center p-8 md:p-12 min-h-[360px]"
                        style={{ borderLeft: `1px solid ${GRID_LINE}`, borderRight: `1px solid ${GRID_LINE}` }}
                    >
                        {mockup}
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12">
                        <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">{eyebrow}</p>
                        <h3 className="text-2xl md:text-3xl lg:text-[36px] font-bold leading-[1.15] tracking-tight text-gray-900 mb-5">{title}</h3>
                        <p className="text-base text-gray-600 leading-relaxed mb-7">{body}</p>
                        <div>
                            <Link href={link} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-black transition-colors">
                                Learn more <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── MOCKUPS ─────────────────────────────────────────────────

function SmartleadMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-semibold text-gray-700">Smartlead Webhook · Connected</span>
            </div>
            <div className="p-4 space-y-2">
                {[
                    { type: 'bounce', email: 'lead.42@acme.com', color: 'red' },
                    { type: 'open', email: 'lead.17@corp.io', color: 'blue' },
                    { type: 'reply', email: 'lead.08@biz.com', color: 'emerald' },
                    { type: 'bounce', email: 'lead.33@dom.com', color: 'red' },
                ].map((ev, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 rounded-lg">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${ev.color}-100 text-${ev.color}-700 uppercase`}>{ev.type}</span>
                        <span className="text-gray-700 font-mono">{ev.email}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InstantlyMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Campaign</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">API v2</span>
            </div>
            <div className="text-sm font-bold text-gray-900 mb-3">Q2 Enterprise Outbound</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {[{ v: '1,847', l: 'Sent' }, { v: '342', l: 'Opens' }, { v: '47', l: 'Replies' }].map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-center">
                        <div className="text-sm font-bold text-gray-900">{m.v}</div>
                        <div className="text-[10px] text-gray-500 font-semibold uppercase">{m.l}</div>
                    </div>
                ))}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '72%' }} />
            </div>
            <div className="text-[10px] text-gray-500 mt-2">72% delivered · Bearer auth active</div>
        </div>
    );
}

function EmailBisonMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Warmup Control</span>
            </div>
            <div className="space-y-2.5">
                {[
                    { name: 'sarah@acme.co', vol: 85, max: 100, status: 'active' },
                    { name: 'mark@acme.co', vol: 45, max: 50, status: 'active' },
                    { name: 'lisa@acme.co', vol: 100, max: 100, status: 'full' },
                ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-gray-700 w-32 truncate">{m.name}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(m.vol / m.max) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold w-14 text-right">{m.vol}/{m.max}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px]">
                <span className="text-gray-500">3 mailboxes · warmup active</span>
                <span className="text-teal-700 font-semibold">+Attach mailbox</span>
            </div>
        </div>
    );
}

function ClayMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2.5 border-b border-orange-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-orange-700">Clay Webhook Endpoint</span>
                <span className="text-[10px] text-orange-700 font-mono">POST</span>
            </div>
            <div className="p-4 font-mono text-[10px] text-gray-700 bg-gray-50 border-b border-gray-100">
                https://api.superkabe.com/ingest/clay
            </div>
            <div className="p-4 space-y-2">
                {[
                    { name: 'Alex Chen', co: 'TechCorp', status: 'GREEN', color: 'emerald' },
                    { name: 'Priya Patel', co: 'FinServe', status: 'YELLOW', color: 'amber' },
                    { name: 'Sam Jordan', co: 'HealthAI', status: 'GREEN', color: 'emerald' },
                ].map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <div>
                            <div className="font-semibold text-gray-900 text-[11px]">{l.name}</div>
                            <div className="text-gray-500 text-[10px]">{l.co}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold bg-${l.color}-100 text-${l.color}-700`}>{l.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SlackMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#4A154B] text-white px-4 py-2.5 flex items-center gap-2">
                <span className="text-[11px] font-bold">#superkabe-alerts</span>
            </div>
            <div className="p-4 space-y-3">
                {[
                    { icon: '🔴', t: 'Mailbox paused', m: 'sarah@acme.co — 5 hard bounces in 60min' },
                    { icon: '⚠️', t: 'Domain warning', m: 'acme.co bounce rate 2.8% (threshold 3%)' },
                    { icon: '✅', t: 'Healing complete', m: 'mark@acme.co resumed to healthy' },
                ].map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                        <span className="text-sm mt-0.5">{a.icon}</span>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-[11px]">{a.t}</div>
                            <div className="text-gray-600 text-[10px] truncate">{a.m}</div>
                        </div>
                        <span className="text-[9px] text-gray-400">now</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReplyIoMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="text-sm font-bold text-gray-900 mb-1">Q2 2026 Rollout</div>
            <div className="text-xs text-gray-500 mb-4">Reply.io adapter in active development</div>
            <div className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
        </div>
    );
}

function MonitoringMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Sync</span>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-green-700 font-semibold">24/7</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                    { l: 'Bounces', v: '12', c: 'text-red-600' },
                    { l: 'Opens', v: '348', c: 'text-blue-600' },
                    { l: 'Replies', v: '47', c: 'text-emerald-600' },
                    { l: 'Blocks', v: '3', c: 'text-amber-600' },
                ].map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-2.5">
                        <div className={`text-lg font-bold ${m.c}`}>{m.v}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-semibold">{m.l}</div>
                    </div>
                ))}
            </div>
            <div className="text-[10px] text-gray-500 font-mono">Last event: bounce · 2s ago</div>
        </div>
    );
}

function ExecutionGateMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between">
                <span className="text-xs font-bold">EXECUTION GATE</span>
                <span className="text-[10px] text-green-400 font-mono">ACTIVE</span>
            </div>
            <div className="p-4 space-y-2">
                {[
                    { domain: 'acme.co', score: 92, pass: true },
                    { domain: 'corp.io', score: 78, pass: true },
                    { domain: 'biz.com', score: 34, pass: false },
                    { domain: 'tech.dev', score: 88, pass: true },
                ].map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-700">{d.domain}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${d.pass ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${d.score}%` }} />
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${d.pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {d.pass ? 'PASS' : 'GATE'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HealingMockup() {
    const phases = [
        { l: 'Paused', active: false, color: 'bg-gray-200' },
        { l: 'Quarantine', active: false, color: 'bg-amber-300' },
        { l: 'Restricted', active: true, color: 'bg-blue-400' },
        { l: 'Warm Recovery', active: false, color: 'bg-purple-300' },
        { l: 'Healthy', active: false, color: 'bg-emerald-400' },
    ];
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">5-Phase Recovery</span>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">Phase 3/5</span>
            </div>
            <div className="space-y-2.5">
                {phases.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${p.active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {i + 1}
                        </div>
                        <div className="flex-1">
                            <div className={`text-xs font-semibold ${p.active ? 'text-gray-900' : 'text-gray-400'}`}>{p.l}</div>
                            {p.active && <div className="text-[10px] text-gray-500">10 clean sends / 15 required</div>}
                        </div>
                        {p.active && <div className="w-12 h-1 bg-blue-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '66%' }} /></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScalingMockup() {
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Multi-Platform Fleet</span>
                <span className="text-[10px] text-gray-700 font-semibold">∞ mailboxes</span>
            </div>
            <div className="space-y-2">
                {[
                    { plat: 'Smartlead', c: 42, color: 'blue' },
                    { plat: 'Instantly', c: 28, color: 'purple' },
                    { plat: 'EmailBison', c: 15, color: 'teal' },
                    { plat: 'Reply.io', c: 0, color: 'pink', soon: true },
                ].map((p, i) => (
                    <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg bg-${p.color}-50`}>
                        <span className={`text-xs font-bold text-${p.color}-700`}>{p.plat}</span>
                        {p.soon ? (
                            <span className={`text-[10px] text-${p.color}-700 font-semibold`}>Coming soon</span>
                        ) : (
                            <span className={`text-xs font-mono text-${p.color}-700`}>{p.c} mailboxes</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalyticsMockup() {
    const bars = [40, 62, 55, 78, 68, 85, 72, 90, 82, 95];
    return (
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Domain Health Trend</span>
                <span className="text-xs font-bold text-emerald-600">+12% ↗</span>
            </div>
            <div className="flex items-end gap-1.5 h-24 mb-3">
                {bars.map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>10 days</span>
                <span className="font-mono">99.2% deliverability</span>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [heroSlide, setHeroSlide] = useState(0);
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

    // Hero carousel — cleaned dashboard screenshots (purple gradient removed)
    const heroSlides = [
        { src: '/Untitled design (6).png', alt: 'Sign-in experience with automated infrastructure healing preview' },
        { src: '/Untitled design (8).png', alt: 'Infrastructure health score with 90-day trend' },
        { src: '/Untitled design (9).png', alt: 'Lead, domain, and mailbox health gauges' },
        { src: '/Untitled design (10).png', alt: 'Smartlead and Clay integration configuration' },
        { src: '/Untitled design (11).png', alt: 'Real-time notifications feed' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    const features = [
        {
            title: "Superkabe Integration & Monitoring",
            desc: "Native webhooks synchronize with Smartlead and Clay in real-time. We capture every bounce event and delivery block instantly to maintain 99%+ infrastructure health.",
            link: "/product/outbound-email-infrastructure-monitoring"
        },
        {
            title: "Domain Health Execution Gate",
            desc: "Our intelligent protection layer stops outgoing SMTP traffic to damaged domains. Every email is validated against current domain reputation scores before execution.",
            link: "/product/domain-burnout-prevention-tool"
        },
        {
            title: "Auto-Healing Infrastructure",
            desc: "Superkabe algorithms automatically detect mailbox fatigue. When a mailbox underperforms, it is instantly paused and traffic is weight-balanced toward healthy assets.",
            link: "/product/automated-domain-healing"
        },
        {
            title: "Multi-Entity Scaling",
            desc: "Supporting unlimited mailboxes and unique domains. Superkabe scales your outbound operations without increasing the risk profile of your primary sender profiles.",
            link: "/product/multi-platform-outbound-protection"
        },
        {
            title: "Infrastructure Analytics Engine",
            desc: "Convert raw monitoring signals into actionable deliverability metrics. Visualize your bounce trends and domain health history in one centralized dashboard.",
            link: "/product/email-infrastructure-health-check"
        }
    ];

    const techSpecs = [
        { label: "Integrations", value: "Smartlead, Clay, Instantly, EmailBison, and Custom Webhooks" },
        { label: "Monitoring Frequency", value: "Real-time monitoring with high-latency blocking of risky traffic" },
        { label: "Infrastructure Type", value: "Deliverability Protection Layer (DPL) for outbound email" },
        { label: "Scaling Limit", value: "Unlimited domains and mailboxes with no increase in risk profile" },
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

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] overflow-hidden font-sans">

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
                    description: "Superkabe is an email deliverability and sender reputation protection platform. We act as infrastructure armor, sitting between your enrichment data and your sending accounts to enforce safety protocols across your entire fleet.",
                    publisher: {
                        "@id": "https://www.superkabe.com/#organization"
                    },
                    speakable: {
                        "@type": "SpeakableSpecification",
                        cssSelector: ["h1", ".page-subtitle", ".faq-section"]
                    }
                })
            }} />

            {/* SoftwareApplication Schema for AI Product Comparison */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Superkabe",
                    "url": "https://www.superkabe.com/",
                    "applicationCategory": "Email deliverability protection software",
                    "operatingSystem": "Web-based (SaaS)",
                    "description": "Superkabe is an email deliverability and sender reputation protection platform that acts as a Deliverability Protection Layer (DPL) between enrichment tools and outbound email sending accounts to prevent domain burnout, mailbox fatigue, and DNS misconfigurations in real time.",
                    "offers": {
                        "@type": "Offer",
                        "price": "49",
                        "priceCurrency": "USD",
                        "description": "Starter plan for founder-led teams with real-time bounce monitoring, automated mailbox pausing, and instant Clay and Smartlead integration.",
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
                        "Predictive campaign risk monitoring",
                        "Slack integration for real-time alerts and slash commands",
                        "Multi-platform support for Smartlead, Clay, Instantly, and EmailBison",
                        "Hybrid email validation (syntax, MX, disposable, catch-all + MillionVerifier API)",
                        "Health gate classification (GREEN/YELLOW/RED) with risk-aware routing",
                        "Correlation engine for cross-entity failure detection",
                        "Mailbox rotation with standby swap on pause",
                        "Reports and CSV export for leads, campaigns, mailboxes, domains"
                    ]
                })
            }} />

            {/* ================= NAVBAR ================= */}
            <Navbar />

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

            {/* ================= HERO (SPLIT LAYOUT) ================= */}
            <section className="relative pt-32 md:pt-36 pb-10 z-10 px-6">
                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* LEFT — content + CTAs */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold leading-[1.02] tracking-tight text-gray-900 mb-5">
                            Cold Email{' '}
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                                Deliverability{' '}
                            </span>
                            Protection Tool
                        </h1>

                        <p className="text-lg md:text-xl text-gray-500 mb-5 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Stop burning domains. Superkabe sits between your enrichment and email layers to monitor health, block risks, and auto-heal your infrastructure.
                        </p>

                        <p className="text-sm text-gray-400 mb-8 leading-relaxed tracking-wide max-w-xl mx-auto lg:mx-0">
                            Email deliverability · Sender reputation · DNS authentication · Domain health monitoring · Bounce protection
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center lg:justify-start justify-center">
                            <Link href="/signup" className="px-10 py-4 bg-black text-white rounded-full text-lg font-semibold shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                Start Your Trial
                            </Link>
                            <a href="https://cal.com/richardson-eugin-simon-qzmevd/30min" target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                Book a Demo
                            </a>
                        </div>
                    </div>

                    {/* RIGHT — static dashboard preview with subtle animations */}
                    <div className="relative">
                        {/* Gradient glow backdrop */}
                        <div className="absolute inset-0 -inset-x-4 -inset-y-8 pointer-events-none">
                            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-400/30 rounded-full blur-[100px] animate-pulse-slow"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-400/25 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                        </div>

                        {/* Dashboard carousel */}
                        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl shadow-blue-500/10 animate-float">
                            <div className="relative aspect-[16/10] overflow-hidden">
                                {heroSlides.map((slide, i) => (
                                    <div
                                        key={i}
                                        className={`absolute inset-0 transition-all duration-700 ease-out ${i === heroSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03] pointer-events-none'}`}
                                    >
                                        <Image
                                            src={slide.src}
                                            alt={slide.alt}
                                            fill
                                            className="object-cover object-top"
                                            priority={i === 0}
                                            sizes="(max-width: 1024px) 100vw, 700px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Carousel indicators */}
                        <div className="flex items-center justify-center gap-2 mt-5 relative z-10">
                            {heroSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setHeroSlide(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroSlide ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* Floating accent cards */}
                        <div className="hidden lg:block absolute -top-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Mailboxes</div>
                                    <div className="text-sm font-bold text-gray-900">100 healthy</div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block absolute -bottom-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '1.2s' }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">73</div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Infra Score</div>
                                    <div className="text-sm font-bold text-gray-900">Monitoring</div>
                                </div>
                            </div>
                        </div>
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

            {/* ================= WHAT IS SUPERKABE (AEO AUTHORITY - BENTO GRID) ================= */}
            <section className="py-14 lg:py-20 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Intro */}
                    <div className="text-center mb-12 md:mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 mb-5 tracking-wide">
                            <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span>
                            Explore the Superkabe platform
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                            What problems does the Superkabe platform solve?
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            Superkabe is an email deliverability and sender reputation protection platform. We act as infrastructure armor, sitting between your enrichment data and your sending accounts to enforce safety protocols across your entire fleet.
                        </p>
                    </div>

                    {/* Bento Grid — varied-width cells inspired by popl.co */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 mb-14">

                        {/* Row 1: Mailbox fatigue (wide) + DNS auth */}
                        <div className="md:col-span-4 bg-white border border-gray-200 rounded-3xl p-7 md:p-9 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mailbox Health</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 tracking-tight">Mailbox fatigue detection</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                Superkabe algorithms automatically detect mailbox fatigue and instantly pause underperforming mailboxes, rebalancing traffic to healthy assets to preserve reputation.
                            </p>
                        </div>

                        <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Authentication</div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 tracking-tight">DNS authentication enforcement</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Continuously monitors SPF, DKIM, and DMARC on every domain and blocks outbound traffic when misconfigurations threaten deliverability.
                            </p>
                        </div>

                        {/* Row 2: Three equal columns */}
                        <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
                            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.5c.73 1.81 1 4.53 0 6.5-1 2 1.415 1.5 1.5 1.5-.085.5-1.2 1.5-1.843 2z" /></svg>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Domain Safety</div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 tracking-tight">Domain burnout prevention</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Gates outbound email traffic based on live bounce data, halting campaigns before an isolated spike compounds into permanent blocklisting.
                            </p>
                        </div>

                        <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
                            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lead Quality</div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 tracking-tight">Toxic lead filtering</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Tracks lead health across your infrastructure, automatically isolating toxic contacts to prevent hard bounces from damaging sender reputation.
                            </p>
                        </div>

                        <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
                            <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Validation</div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 tracking-tight">Email validation before sending</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Syntax, MX, disposable domain, and catch-all detection before emails reach your sender. MillionVerifier API verification for risky leads.
                            </p>
                        </div>

                        {/* Row 3: Full-width Health Gate */}
                        <div className="md:col-span-6 bg-white border border-gray-200 rounded-3xl p-7 md:p-10 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Risk-Aware Routing</div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-tight">Health gate classifies every lead before it ships</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                        Every lead is classified <span className="font-bold text-emerald-700">GREEN</span>, <span className="font-bold text-amber-700">YELLOW</span>, or <span className="font-bold text-red-700">RED</span> based on validation score, engagement signals, and domain health. RED leads are blocked. GREEN leads route normally. YELLOW leads distribute across mailboxes with per-sender risk caps.
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center gap-3 shrink-0">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">G</div>
                                        <span className="text-[10px] text-emerald-700 font-semibold mt-1.5">GREEN</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">Y</div>
                                        <span className="text-[10px] text-amber-700 font-semibold mt-1.5">YELLOW</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">R</div>
                                        <span className="text-[10px] text-red-700 font-semibold mt-1.5">RED</span>
                                    </div>
                                </div>
                            </div>
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
                                { label: 'Email Validation', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
                                { label: 'Health Gate', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                            ].map((tag) => (
                                <span key={tag.label} className={`px-5 py-2.5 ${tag.bg} border ${tag.border} rounded-full text-sm font-semibold ${tag.text}`}>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <p className="text-gray-500 text-sm mb-4 max-w-xl mx-auto">The Superkabe Infrastructure Playbook documents best practices for maintaining 99%+ deliverability across multi-domain outbound email infrastructure.</p>
                            <Link href="/infrastructure-playbook" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-colors shadow-lg shadow-gray-900/10">
                                Read the Playbook
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
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
                                        <Image src="/clay.png" alt="Clay" width={40} height={40} className="object-contain drop-shadow-sm" />
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
                                        <Image src="/image/logo-v2.png" alt="Superkabe" width={40} height={40} className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] object-contain" />
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
                                                <Image src="/smartlead.webp" alt="Smartlead" width={40} height={40} className="object-contain" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <Image src="/instantly.png" alt="Instantly" width={40} height={40} className="object-contain" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <Image src="/emailbison.png" alt="Email Bison" width={40} height={40} className="object-contain" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <Image src="/replyio.png" alt="Reply.io" width={40} height={40} className="object-contain bg-white" />
                                            </div>
                                            <div className="h-20 flex items-center justify-center">
                                                <Image src="/smartlead.webp" alt="Smartlead" width={40} height={40} className="object-contain" />
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
                                        <Image src="/slack-icon.svg" alt="Slack" width={40} height={40} className="object-contain drop-shadow-sm" />
                                    </div>
                                    <span className="absolute -bottom-8 text-sm font-bold text-gray-700 tracking-wide uppercase text-[11px] whitespace-nowrap">Alerts</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= INTEGRATIONS SECTION (popl-inspired row grid) ================= */}
            <section className="relative z-10 py-14 lg:py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase mb-6">
                            6+ Integrations
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                            Connects to your entire outbound stack
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Superkabe plugs into the tools you already use. No migration, no rip-and-replace. Connect your sending platform, enrich leads from Clay, and get alerts in Slack — all in under 5 minutes.
                        </p>
                    </div>
                </div>

                {/* Integrations — alternating rows with visible grid lines */}
                <PlatformRow
                    eyebrow="Sending Platform"
                    title="Real-time webhook sync for Smartlead"
                    body="Real-time webhook sync for bounces, opens, and replies. Auto-pause campaigns, remove/add mailboxes, and push leads via API."
                    tags={['Webhook Sync', 'API Mutations', 'CSV Export']}
                    tagColor="blue"
                    link="/docs/smartlead-integration"
                    imageOnLeft={true}
                    mockup={<SmartleadMockup />}
                />
                <PlatformRow
                    eyebrow="API v2 Integration"
                    title="Full campaign control for Instantly"
                    body="Full campaign sync via API v2 with Bearer auth. Pause/resume campaigns, manage account-campaign mappings, and track per-mailbox analytics."
                    tags={['API v2', 'Bearer Auth', 'Analytics']}
                    tagColor="purple"
                    link="/docs/instantly-integration"
                    imageOnLeft={false}
                    mockup={<InstantlyMockup />}
                />
                <PlatformRow
                    eyebrow="Warmup Control"
                    title="Campaign sync + sender health for EmailBison"
                    body="Campaign and sender-email sync with warmup control. Attach/remove mailboxes from campaigns and manage leads across sequences."
                    tags={['REST API', 'Warmup Control', 'Lead Mgmt']}
                    tagColor="teal"
                    link="/docs/emailbison-integration"
                    imageOnLeft={true}
                    mockup={<EmailBisonMockup />}
                />
                <PlatformRow
                    eyebrow="Webhook Ingestion"
                    title="Lead enrichment pipeline from Clay"
                    body="Webhook ingestion for enriched leads. Clay pushes leads to Superkabe, where they get validated, health-gated, and routed to the right campaign automatically."
                    tags={['Webhook', 'Lead Routing', 'Auto-Validation']}
                    tagColor="orange"
                    link="/docs/clay-integration"
                    imageOnLeft={false}
                    mockup={<ClayMockup />}
                />
                <PlatformRow
                    eyebrow="Real-Time Alerts"
                    title="Instant infrastructure events in Slack"
                    body="Real-time alerts for every infrastructure event. Mailbox paused, domain blacklisted, campaign stopped, healing milestones — all in your Slack channel."
                    tags={['Alerts', 'Real-Time', 'Configurable']}
                    tagColor="yellow"
                    link="/docs/slack-integration"
                    imageOnLeft={true}
                    mockup={<SlackMockup />}
                />
                <PlatformRow
                    eyebrow="Coming Q2 2026"
                    title="Reply.io support in development"
                    body="Campaign and mailbox monitoring for Reply.io users. Same protection layer — different sending platform. Currently in development."
                    tags={['Planned', 'Q2 2026']}
                    tagColor="pink"
                    link="/product/reply-io-deliverability-protection"
                    imageOnLeft={false}
                    mockup={<ReplyIoMockup />}
                />

                {/* Bottom how it connects — kept as-is for SEO/AEO content */}
                <div className="max-w-6xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-900">1</div>
                        <div className="font-bold text-gray-900 mb-1 text-sm">Connect in 2 clicks</div>
                        <p className="text-xs text-gray-500">Paste your API key. Superkabe syncs campaigns, mailboxes, and leads automatically.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-900">2</div>
                        <div className="font-bold text-gray-900 mb-1 text-sm">Bi-directional sync</div>
                        <p className="text-xs text-gray-500">Webhooks push real-time events to Superkabe. API mutations push actions back to your platform.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-900">3</div>
                        <div className="font-bold text-gray-900 mb-1 text-sm">Zero downtime</div>
                        <p className="text-xs text-gray-500">Your sending platform keeps working exactly as before. Superkabe adds the protection layer on top.</p>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES GRID (TOTAL OUTBOUND INFRASTRUCTURE CONTROL - popl row layout) ================= */}
            <section className="relative z-10 py-14 lg:py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase mb-6">
                            Platform Capabilities
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-gray-900 tracking-tight">Total Outbound Infrastructure Control</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">Everything you need to keep your domains healthy and your emails landing in the primary inbox.</p>
                    </div>
                </div>

                <FeatureRow
                    eyebrow="Integration & Monitoring"
                    title={features[0].title}
                    body={features[0].desc}
                    link={features[0].link}
                    imageOnLeft={true}
                    mockup={<MonitoringMockup />}
                />
                <FeatureRow
                    eyebrow="Execution Gate"
                    title={features[1].title}
                    body={features[1].desc}
                    link={features[1].link}
                    imageOnLeft={false}
                    mockup={<ExecutionGateMockup />}
                />
                <FeatureRow
                    eyebrow="Auto-Healing"
                    title={features[2].title}
                    body={features[2].desc}
                    link={features[2].link}
                    imageOnLeft={true}
                    mockup={<HealingMockup />}
                />
                <FeatureRow
                    eyebrow="Multi-Entity Scaling"
                    title={features[3].title}
                    body={features[3].desc}
                    link={features[3].link}
                    imageOnLeft={false}
                    mockup={<ScalingMockup />}
                />
                <FeatureRow
                    eyebrow="Analytics Engine"
                    title={features[4].title}
                    body={features[4].desc}
                    link={features[4].link}
                    imageOnLeft={true}
                    mockup={<AnalyticsMockup />}
                />
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
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Superkabe Technical Specifications for Outbound Email Deliverability</h2>
                        <p className="text-gray-500 text-lg max-w-3xl mx-auto">These are the core technical characteristics of the Superkabe Deliverability Protection Layer (DPL) for high-volume outbound email teams.</p>
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
            <section className="py-10 lg:py-12 px-6 text-center relative z-10">
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
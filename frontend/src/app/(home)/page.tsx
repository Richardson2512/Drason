'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import MarketingBackdrop from '@/components/MarketingBackdrop';
import CustomersMarquee from '@/components/marketing/CustomersMarquee';
// In subdomain mode, app routes (signup/login/dashboard) live on the
// `app.*` host. `appUrl` returns an absolute URL pointing there when
// NEXT_PUBLIC_APP_URL is set, and a relative path otherwise - so the
// marketing site's primary CTA always lands on the right host without
// the middleware needing to do a 302 redirect on every click.
import { appUrl } from '@/lib/urls';
import {
    GmailLogo as GmailLogoSvg,
    GoogleWorkspaceLogo,
    MicrosoftLogo,
    SmtpLogo,
    ApolloLogo,
    ZoomInfoLogo,
    ClayLogo,
    AirtableLogo,
    HubSpotLogo,
    SalesforceLogo,
    OutreachLogo,
    HeyreachLogo,
    JustcallLogo,
    ZapmailLogo,
    ScaledmailLogo,
    SlackLogo,
    WebhooksLogo,
} from '@/components/marketing/BrandLogos';

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
 blue: { bg: 'bg-[#FFEBC9]/40', text: 'text-[#D4730F]' },
 purple: { bg: 'bg-[#FFEBC9]/40', text: 'text-[#D4730F]' },
 teal: { bg: 'bg-[#D4F0DC]/50', text: 'text-[#1C4532]' },
 orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
 yellow: { bg: 'bg-[#FFEBC9]/50', text: 'text-[#D4730F]' },
 pink: { bg: 'bg-[#FFEBC9]/40', text: 'text-[#D4730F]' },
};

// ─── Integrations marquee ──────────────────────────────────────────────────
// Vertical scrolling columns of integration cards. Each column renders its
// items twice in a row inside a `flex flex-col`, then animates from
// translateY(0) to translateY(-50%) (or the reverse, for "down" columns).
// Because the second copy is an exact clone of the first, the wrap point is
// invisible - the marquee reads as a continuous, never-ending feed.

interface MarqueeItem {
    /** Inline SVG brand-logo component - rendered at 28px in the card. */
    Logo: React.ComponentType<{ size?: number }>;
    name: string;
    /** Right-aligned status pill - Live (green) or Soon (gray) */
    status: 'live' | 'soon';
    /** Category line under the brand */
    category: string;
}

function MarqueeCard({ item }: { item: MarqueeItem }) {
    const { Logo } = item;
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-gray-300 transition-shadow">
            <div className="shrink-0 w-7 h-7 flex items-center justify-center">
                <Logo size={28} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                <div className="text-[11px] text-gray-500 truncate">{item.category}</div>
            </div>
            <span
                className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    item.status === 'live'
                        ? 'bg-[#D4F0DC]/50 text-[#1C4532] border border-[#D4F0DC]'
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
            >
                {item.status === 'live' ? 'Live' : 'Soon'}
            </span>
        </div>
    );
}

function MarqueeColumn({
    items,
    direction,
    speed,
}: {
    items: MarqueeItem[];
    direction: 'up' | 'down';
    speed: 'normal' | 'slow';
}) {
    const cls =
        direction === 'up'
            ? speed === 'slow' ? 'animate-marquee-up-slow' : 'animate-marquee-up'
            : speed === 'slow' ? 'animate-marquee-down-slow' : 'animate-marquee-down';
    return (
        <div className="marquee-col relative h-full overflow-hidden">
            <div className={`flex flex-col gap-3 ${cls}`}>
                {[...items, ...items].map((item, i) => (
                    <MarqueeCard key={`${item.name}-${i}`} item={item} />
                ))}
            </div>
        </div>
    );
}

// Column data - distributed so all four columns have similar lengths and a
// mix of categories to keep the visual balanced.
const col1: MarqueeItem[] = [
    { Logo: ClayLogo, name: 'Clay', category: 'Lead enrichment', status: 'live' },
    { Logo: GmailLogoSvg, name: 'Gmail', category: 'Mailbox provider', status: 'live' },
    { Logo: ApolloLogo, name: 'Apollo', category: 'Lead enrichment', status: 'soon' },
    { Logo: HubSpotLogo, name: 'HubSpot', category: 'CRM sync', status: 'live' },
    { Logo: ZapmailLogo, name: 'Zapmail', category: 'Mailbox import', status: 'live' },
    { Logo: JustcallLogo, name: 'Justcall', category: 'Dialer sync', status: 'soon' },
];
const col2: MarqueeItem[] = [
    { Logo: MicrosoftLogo, name: 'Microsoft 365', category: 'Mailbox provider', status: 'live' },
    { Logo: SlackLogo, name: 'Slack', category: 'Alerts', status: 'live' },
    { Logo: ZoomInfoLogo, name: 'ZoomInfo', category: 'Lead enrichment', status: 'soon' },
    { Logo: OutreachLogo, name: 'Outreach', category: 'Sales engagement', status: 'soon' },
    { Logo: ScaledmailLogo, name: 'Scaledmail', category: 'Mailbox import', status: 'soon' },
    { Logo: HeyreachLogo, name: 'Heyreach', category: 'LinkedIn outreach', status: 'soon' },
];
const col3: MarqueeItem[] = [
    { Logo: WebhooksLogo, name: 'Webhooks', category: 'Developer', status: 'live' },
    { Logo: AirtableLogo, name: 'Airtable', category: 'Lead source', status: 'soon' },
    { Logo: SalesforceLogo, name: 'Salesforce', category: 'CRM sync', status: 'live' },
    { Logo: SmtpLogo, name: 'SMTP / Custom', category: 'Mailbox provider', status: 'live' },
    { Logo: ClayLogo, name: 'Clay', category: 'Lead enrichment', status: 'live' },
    { Logo: HubSpotLogo, name: 'HubSpot', category: 'CRM sync', status: 'live' },
];
const col4: MarqueeItem[] = [
    { Logo: GoogleWorkspaceLogo, name: 'Google Workspace', category: 'Mailbox provider', status: 'live' },
    { Logo: ApolloLogo, name: 'Apollo', category: 'Lead enrichment', status: 'soon' },
    { Logo: ZapmailLogo, name: 'Zapmail', category: 'Mailbox import', status: 'live' },
    { Logo: JustcallLogo, name: 'Justcall', category: 'Dialer sync', status: 'soon' },
    { Logo: ZoomInfoLogo, name: 'ZoomInfo', category: 'Lead enrichment', status: 'soon' },
    { Logo: SlackLogo, name: 'Slack', category: 'Alerts', status: 'live' },
];

// ─── End integrations marquee ──────────────────────────────────────────────

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
 background: 'linear-gradient(to top, #FFEBC9 0%, #FFAA49 55%, #D4730F 100%)',
 }}
 >
 {mockup}
 </div>
 {/* Content side */}
 <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12">
 <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">{eyebrow}</p>
 <h3 className="text-xl md:text-2xl lg:text-[28px] font-bold leading-[1.15] tracking-tight text-gray-900 mb-5">{title}</h3>
 <p className="text-sm text-gray-600 leading-relaxed mb-5">{body}</p>
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
 style={{
 borderLeft: `1px solid ${GRID_LINE}`,
 borderRight: `1px solid ${GRID_LINE}`,
 background: 'linear-gradient(to top, #D4F0DC 0%, #1C4532 55%, #143325 100%)',
 }}
 >
 {mockup}
 </div>
 <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12">
 <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">{eyebrow}</p>
 <h3 className="text-xl md:text-2xl lg:text-[28px] font-bold leading-[1.15] tracking-tight text-gray-900 mb-5">{title}</h3>
 <p className="text-sm text-gray-600 leading-relaxed mb-6">{body}</p>
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

function GmailMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm overflow-hidden">
 <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
 <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4730F] via-[#FFAA49] to-[#D4730F] shrink-0 flex items-center justify-center text-white text-[10px] font-bold">G</div>
 <span className="text-xs font-bold text-gray-900 flex-1">Gmail · OAuth</span>
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 <span className="text-[10px] font-semibold text-green-700">Connected</span>
 </div>
 </div>
 <div className="p-4 space-y-2">
 {[
 { type: 'sent', email: 'lead.42@acme.com', color: 'emerald' },
 { type: 'open', email: 'lead.17@corp.io', color: 'blue' },
 { type: 'reply', email: 'lead.08@biz.com', color: 'emerald' },
 { type: 'bounce', email: 'lead.33@dom.com', color: 'red' },
 ].map((ev, i) => (
 <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 ">
 <span className={`px-2 py-0.5 text-[10px] font-bold bg-${ev.color}-100 text-${ev.color}-700 uppercase`}>{ev.type}</span>
 <span className="text-gray-700 font-mono">{ev.email}</span>
 </div>
 ))}
 </div>
 </div>
 );
}

function MicrosoftMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm p-5">
 <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
 <div className="w-6 h-6 grid grid-cols-2 gap-[2px] shrink-0">
 <div className="bg-orange-500" /><div className="bg-green-500" />
 <div className="bg-[#FFEBC9]/400" /><div className="bg-[#FFEBC9]/500" />
 </div>
 <span className="text-xs font-bold text-gray-900 flex-1">Microsoft 365 · OAuth</span>
 <span className="text-[10px] px-2 py-0.5 bg-[#FFEBC9] text-[#D4730F] font-semibold">Active</span>
 </div>
 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Native Sequence</div>
 <div className="text-sm font-bold text-gray-900 mb-3">Q2 Enterprise Outbound</div>
 <div className="grid grid-cols-3 gap-2 mb-4">
 {[{ v: '1,847', l: 'Sent' }, { v: '342', l: 'Opens' }, { v: '47', l: 'Replies' }].map((m, i) => (
 <div key={i} className="bg-gray-50 p-2.5 text-center">
 <div className="text-sm font-bold text-gray-900">{m.v}</div>
 <div className="text-[10px] text-gray-500 font-semibold uppercase">{m.l}</div>
 </div>
 ))}
 </div>
 <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-[#D4730F] to-[#D4730F] rounded-full" style={{ width: '72%' }} />
 </div>
 <div className="text-[10px] text-gray-500 mt-2">Native send · ESP-aware routing live</div>
 </div>
 );
}

function SmtpMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm p-5">
 <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
 <div className="w-6 h-6 bg-gray-900 text-white shrink-0 flex items-center justify-center text-[9px] font-bold rounded">SMTP</div>
 <span className="text-xs font-bold text-gray-900 flex-1">SMTP · Encrypted creds</span>
 <span className="text-[10px] px-2 py-0.5 bg-[#D4F0DC] text-[#1C4532] font-semibold">3 mailboxes</span>
 </div>
 <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Daily Send Caps</div>
 <div className="space-y-2.5">
 {[
 { name: 'sarah@acme.co', vol: 85, max: 100 },
 { name: 'mark@acme.co', vol: 45, max: 50 },
 { name: 'lisa@acme.co', vol: 100, max: 100 },
 ].map((m, i) => (
 <div key={i} className="flex items-center gap-3 text-xs">
 <span className="font-mono text-gray-700 w-32 truncate">{m.name}</span>
 <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
 <div className="h-full bg-[#D4F0DC]/500 rounded-full" style={{ width: `${(m.vol / m.max) * 100}%` }} />
 </div>
 <span className="text-[10px] text-gray-500 font-semibold w-14 text-right">{m.vol}/{m.max}</span>
 </div>
 ))}
 </div>
 <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px]">
 <span className="text-gray-500">3 mailboxes · auto-paused at 3% bounce</span>
 <span className="text-[#1C4532] font-semibold">+Add mailbox</span>
 </div>
 </div>
 );
}

function ClayMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm overflow-hidden">
 <div className="bg-gradient-to-r from-orange-50 to-[#FFEBC9]/50 px-4 py-3 border-b border-orange-100 flex items-center gap-3">
 <Image src="/clay.png" alt="Clay" width={24} height={24} loading="lazy" className="object-contain shrink-0" />
 <span className="text-xs font-bold text-gray-900 flex-1">Clay</span>
 <span className="text-[10px] text-orange-700 font-mono font-bold">POST</span>
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
 <span className={`px-2 py-0.5 text-[9px] font-bold bg-${l.color}-100 text-${l.color}-700`}>{l.status}</span>
 </div>
 ))}
 </div>
 </div>
 );
}

function SlackMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm overflow-hidden">
 <div className="bg-[#4A154B] text-white px-4 py-3 flex items-center gap-3">
 <Image src="/slack-icon.svg" alt="Slack" width={20} height={20} loading="lazy" className="object-contain shrink-0 brightness-0 invert" />
 <span className="text-xs font-bold flex-1">#superkabe-alerts</span>
 <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 ">live</span>
 </div>
 <div className="p-4 space-y-3">
 {[
 { icon: '🔴', t: 'Mailbox paused', m: 'sarah@acme.co - 5 hard bounces in 60min' },
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

function MonitoringMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm p-5">
 <div className="flex items-center justify-between mb-3">
 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Sync</span>
 <div className="flex items-center gap-1.5">
 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 <span className="text-[10px] text-green-700 font-semibold">24/7</span>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2 mb-3">
 {[
 { l: 'Bounces', v: '12', c: 'text-gray-700' },
 { l: 'Opens', v: '348', c: 'text-[#D4730F]' },
 { l: 'Replies', v: '47', c: 'text-[#1C4532]' },
 { l: 'Blocks', v: '3', c: 'text-[#D4730F]' },
 ].map((m, i) => (
 <div key={i} className="bg-gray-50 p-2.5">
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
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm overflow-hidden">
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
 <div className={`h-full ${d.pass ? 'bg-[#D4F0DC]/500' : 'bg-gray-1000'}`} style={{ width: `${d.score}%` }} />
 </div>
 <span className={`text-[10px] font-bold px-1.5 py-0.5 ${d.pass ? 'bg-[#D4F0DC] text-[#1C4532]' : 'bg-gray-200 text-gray-800'}`}>
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
 { l: 'Quarantine', active: false, color: 'bg-[#FFAA49]' },
 { l: 'Restricted', active: true, color: 'bg-[#FFAA49]' },
 { l: 'Warm Recovery', active: false, color: 'bg-[#FFAA49]' },
 { l: 'Healthy', active: false, color: 'bg-[#1C4532]' },
 ];
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm p-5">
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">5-Phase Recovery</span>
 <span className="text-[10px] text-[#D4730F] font-semibold bg-[#FFEBC9]/40 px-2 py-0.5 ">Phase 3/5</span>
 </div>
 <div className="space-y-2.5">
 {phases.map((p, i) => (
 <div key={i} className="flex items-center gap-3">
 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${p.active ? 'bg-[#FFEBC9]/400 text-white' : 'bg-gray-100 text-gray-400'}`}>
 {i + 1}
 </div>
 <div className="flex-1">
 <div className={`text-xs font-semibold ${p.active ? 'text-gray-900' : 'text-gray-400'}`}>{p.l}</div>
 {p.active && <div className="text-[10px] text-gray-500">10 clean sends / 15 required</div>}
 </div>
 {p.active && <div className="w-12 h-1 bg-[#FFEBC9] rounded-full overflow-hidden"><div className="h-full bg-[#FFEBC9]/400 rounded-full" style={{ width: '66%' }} /></div>}
 </div>
 ))}
 </div>
 </div>
 );
}

function ScalingMockup() {
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm p-5">
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mailbox Fleet</span>
 <span className="text-[10px] text-gray-700 font-semibold">∞ mailboxes</span>
 </div>
 <div className="space-y-2">
 {[
 { plat: 'Gmail (OAuth)', c: 42, color: 'blue' },
 { plat: 'Microsoft 365 (OAuth)', c: 28, color: 'purple' },
 { plat: 'Custom SMTP', c: 15, color: 'teal' },
 ].map((p, i) => (
 <div key={i} className={`flex items-center justify-between p-2.5 bg-${p.color}-50`}>
 <span className={`text-xs font-bold text-${p.color}-700`}>{p.plat}</span>
 <span className={`text-xs font-mono text-${p.color}-700`}>{p.c} mailboxes</span>
 </div>
 ))}
 </div>
 </div>
 );
}

function AnalyticsMockup() {
 const bars = [40, 62, 55, 78, 68, 85, 72, 90, 82, 95];
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm p-5">
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Domain Health Trend</span>
 <span className="text-xs font-bold text-[#1C4532]">+12% ↗</span>
 </div>
 <div className="flex items-end gap-1.5 h-24 mb-3">
 {bars.map((h, i) => (
 <div key={i} className="flex-1 bg-gradient-to-t from-[#D4730F] to-[#D4730F] opacity-80" style={{ height: `${h}%` }} />
 ))}
 </div>
 <div className="flex items-center justify-between text-[10px] text-gray-500">
 <span>10 days</span>
 <span className="font-mono">99.2% deliverability</span>
 </div>
 </div>
 );
}

function ValidationMockup() {
 const leads = [
 { email: 'alex@acme.com', status: 'VALID', badge: 'Syntax + MX', color: 'emerald' },
 { email: 'priya@temp-mail.io', status: 'BLOCKED', badge: 'Disposable', color: 'red' },
 { email: 'sam@catchall.dev', status: 'VERIFIED', badge: 'MillionVerifier', color: 'blue' },
 { email: 'jordan@xyz.', status: 'BLOCKED', badge: 'Invalid syntax', color: 'red' },
 ];
 return (
 <div className="w-full max-w-[420px] bg-white border border-gray-200 shadow-sm overflow-hidden">
 <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
 <span className="text-xs font-bold text-gray-700">Validation Pipeline</span>
 <span className="text-[10px] font-mono bg-[#D4F0DC] text-[#1C4532] px-2 py-0.5 font-semibold">4/4 processed</span>
 </div>
 <div className="p-4 space-y-2.5">
 {leads.map((l, i) => (
 <div key={i} className="flex items-center justify-between text-xs">
 <div className="flex-1 min-w-0 mr-2">
 <div className="font-mono text-gray-900 text-[11px] truncate">{l.email}</div>
 <div className="text-[10px] text-gray-500 mt-0.5">{l.badge}</div>
 </div>
 <span className={`px-2 py-0.5 text-[9px] font-bold bg-${l.color}-100 text-${l.color}-700 shrink-0`}>{l.status}</span>
 </div>
 ))}
 </div>
 <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] bg-gray-50">
 <span className="text-gray-500">2 valid · 2 blocked</span>
 <span className="text-[#1C4532] font-semibold">Hard bounces prevented</span>
 </div>
 </div>
 );
}

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
 title: "AI sequences that actually sound like you",
 desc: "Draft multi-step cold sequences in seconds. Superkabe's AI writes subject lines and bodies against your ICP, then variant-tests every step so the highest-performing copy rises to the top.",
 link: "/product/ai-cold-email-sequences"
 },
 {
 title: "ESP-aware routing + health gate",
 desc: "Every lead is scored GREEN/YELLOW/RED and routed to the mailbox with the best track record against that recipient's ESP. Gmail-to-Gmail sends flow through your best-performing Gmail senders, Outlook-to-Outlook through Outlook, and so on.",
 link: "/product/esp-aware-sending-health-gate"
 },
 {
 title: "Auto-healing built into the platform",
 desc: "When a mailbox's bounce rate creeps up, Superkabe instantly pauses it, reroutes traffic to healthy senders, and works through a graduated recovery pipeline - quarantine → restricted-send → warm recovery → healthy - before sending resumes.",
 link: "/product/automated-domain-healing"
 },
 {
 title: "Unlimited multi-mailbox sending",
 desc: "Connect Google Workspace, Microsoft 365, or any SMTP infra provider (Zapmail, Scaledmail, MissionInbox). No seat limits - scale mailboxes and domains without increasing the risk profile of any single sender.",
 link: "/product/unlimited-multi-mailbox-sending"
 },
 {
 title: "Inbox placement + sending analytics",
 desc: "Track sends, opens, clicks, replies, and bounces per campaign and per mailbox. Monitor domain health trends and inbox placement rates over custom time ranges - no stitching together a separate BI tool.",
 link: "/product/cold-email-sending-analytics"
 },
 {
 title: "Email validation before every send",
 desc: "Every lead runs through syntax, MX, disposable, and catch-all checks before it reaches your sender. Risky leads get verified via the MillionVerifier API. Invalid emails are blocked - they never touch your sender reputation.",
 link: "/product/email-validation-infrastructure-protection"
 }
 ];

 const techSpecs = [
 { label: "Platform Type", value: "AI cold email platform with native deliverability protection" },
 { label: "Sending Providers", value: "Google Workspace, Microsoft 365, Custom SMTP (Zapmail, Scaledmail, MissionInbox, and others)" },
 { label: "Lead-source & alert integrations", value: "Clay, Slack" },
 { label: "Scale", value: "Unlimited mailboxes and domains per organization" },
 { label: "Monitoring Cadence", value: "Real-time bounce + reply webhooks plus 60-second dispatcher cycles" },
 { label: "Validation Pipeline", value: "Syntax, MX, disposable, catch-all detection plus MillionVerifier API on Growth and Scale plans" },
 ];

 const faqSchema = {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {
 "@type": "Question",
 "name": "What is Superkabe?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Superkabe is an AI-driven cold email platform with native deliverability protection. It combines AI sequence generation, multi-mailbox sending, email validation, ESP-aware lead routing, and a continuous protection layer (auto-pause, auto-heal, bounce monitoring) into a single product - so outbound teams don't have to stitch a sender, a validator, and a deliverability tool together."
 }
 },
 {
 "@type": "Question",
 "name": "Who is Superkabe built for?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Superkabe is built for outbound-led revenue teams, agencies, and founders running cold email at scale. It fits teams that want one platform to write and send sequences (instead of piecing together a copy tool, a sender, and a deliverability monitor) while keeping multi-mailbox, multi-domain infrastructure healthy long-term."
 }
 },
 {
 "@type": "Question",
 "name": "How is Superkabe different from Smartlead, Instantly, or Lemlist?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Traditional cold email platforms focus on sending and sequencing; deliverability is typically a dashboard you glance at after the damage is done. Superkabe is the AI cold email platform with deliverability protection built directly into the send pipeline - every send passes through SMTP transcript capture, DSN parsing, DNSBL + Postmaster reputation lookups, and the auto-pause + 5-phase healing state machine before it leaves. Sending and protection are one product, not two. Migrating off another platform? Use the one-time import to bring your campaigns, sequences, leads, and mailbox metadata across in a single click."
 }
 },
 {
 "@type": "Question",
 "name": "What mailboxes can I send from?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Superkabe sends from your own mailboxes - Google Workspace and Microsoft 365 via OAuth, or any SMTP provider with encrypted credentials (Zapmail, Scaledmail, MissionInbox, custom workspaces, and more). You connect mailboxes once; Superkabe handles authentication, rotation, ESP-aware routing, and the deliverability protection layer for every send."
 }
 },
 {
 "@type": "Question",
 "name": "How does Superkabe use AI?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "AI powers sequence generation (multi-step drafts from a short ICP brief), variant testing (A/B subject lines and bodies that promote the highest-performing copy automatically), and ESP-aware routing (matching each lead to the mailbox most likely to reach their inbox). More AI capabilities - reply categorization and send-time optimization - are rolling out continuously."
 }
 },
 {
 "@type": "Question",
 "name": "How does Superkabe prevent domain burnout?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Domain burnout happens when sustained high bounce rates or complaints permanently damage a sender reputation. Superkabe prevents it by monitoring every bounce in real-time, auto-pausing mailboxes at configurable thresholds, gating entire domains when aggregate risk is critical, and enforcing a five-phase graduated recovery (quarantine → restricted-send → warm-recovery → healthy) before full sending resumes."
 }
 },
 {
 "@type": "Question",
 "name": "Does Superkabe validate emails before sending?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Every lead runs through syntax, MX, disposable-domain, and catch-all checks before a send. Risky leads get an additional verification pass via the MillionVerifier API on Growth and Scale plans. Invalid emails are blocked before they touch the sender - not after the bounce is recorded."
 }
 },
 {
 "@type": "Question",
 "name": "What is ESP-aware routing?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "ESP-aware routing classifies the recipient's mail provider (Gmail, Microsoft 365, Yahoo, other) and selects a sending mailbox with the best historical inbox placement for that ESP. A Gmail recipient is more likely to be sent from a Gmail mailbox with proven Gmail-to-Gmail deliverability, and so on. This increases inbox rates versus naive round-robin mailbox rotation."
 }
 },
 {
 "@type": "Question",
 "name": "Does Superkabe support multiple mailboxes and domains?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Superkabe supports unlimited mailboxes and domains per organization - Google Workspace, Microsoft 365, or any SMTP infra provider (Zapmail, Scaledmail, MissionInbox, and others). Each domain is monitored and protected independently so issues on one domain never cascade to others."
 }
 },
 {
 "@type": "Question",
 "name": "Can Superkabe help recover a damaged domain?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes, for domains with moderate reputation damage. Superkabe runs a graduated recovery workflow: it halts all sending, identifies the root cause, waits for ISP scoring models to register the pause, then re-warms the domain at reduced volume with tighter monitoring. Severely blacklisted domains may need to be replaced."
 }
 },
 {
 "@type": "Question",
 "name": "Does Superkabe include email warmup?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Yes. Superkabe includes native mailbox warmup through a built-in peer-to-peer warmup pool, alongside cold email sending and the deliverability protection layer. New mailboxes build initial reputation inside the platform, then the same platform protects and optimizes live sending - monitoring bounce rates, ESP placement, and mailbox health during real campaigns. Warmup and protection in one place, with no separate warmup subscription to bolt on."
 }
 },
 {
 "@type": "Question",
 "name": "What is domain burnout?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Domain burnout is permanent damage to a sending domain's reputation caused by sustained high bounce rates or spam complaints. Once burned, inbox placement drops dramatically and is difficult to recover without replacing the domain - which is why Superkabe's protection layer exists to prevent the compounding damage before it becomes irreversible."
 }
 },
 {
 "@type": "Question",
 "name": "What is mailbox fatigue?",
 "acceptedAnswer": {
 "@type": "Answer",
 "text": "Mailbox fatigue is the gradual degradation of a single sender address's reputation from over-sending. Symptoms include rising soft-bounce rates, falling open rates, and increasing spam-folder placement. Superkabe detects fatigue early and automatically pauses the mailbox while redistributing traffic to healthy senders."
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
 description: "Superkabe is an AI cold email platform with native deliverability protection. Draft AI sequences, send across unlimited mailboxes, validate every email, and let the protection layer auto-pause, reroute, and heal senders in real time.",
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
 "applicationCategory": "Cold email sending and deliverability platform",
 "operatingSystem": "Web-based (SaaS)",
 "description": "Superkabe is an AI cold email platform with native deliverability protection. It combines AI sequence generation, multi-mailbox sending across Gmail, Microsoft 365, and SMTP, email validation, ESP-aware lead routing, and an auto-healing protection layer (auto-pause, auto-rotate, domain reputation monitoring) into a single product for outbound revenue teams.",
 "offers": {
 "@type": "Offer",
 "price": "19",
 "priceCurrency": "USD",
 "description": "Starter plan for founder-led teams - AI sequences, multi-mailbox sending, email validation, and the full deliverability protection stack.",
 "url": "https://www.superkabe.com/pricing"
 },
 "featureList": [
 "AI-generated cold email sequences with variant testing",
 "Multi-mailbox sending across Google Workspace, Microsoft 365, and SMTP",
 "ESP-aware lead routing for higher inbox placement",
 "Hybrid email validation (syntax, MX, disposable, catch-all + MillionVerifier API)",
 "Unified inbox for replies across all connected mailboxes",
 "Mailbox fatigue detection and auto-pausing",
 "DNS authentication enforcement for SPF, DKIM, and DMARC",
 "Domain burnout prevention using bounce-based gating",
 "Automated domain healing with 5-phase recovery pipeline",
 "Health gate classification (GREEN/YELLOW/RED) with risk-aware routing",
 "Predictive campaign risk monitoring and correlation engine",
 "Load balancing across mailboxes and campaigns",
 "Slack integration for real-time alerts and slash commands",
 "Lead-source ingestion from Clay via signed webhooks",
 "Reports and CSV export for leads, campaigns, mailboxes, domains",
 "Dedicated AI agents for cold email tasks (sequence writing, reply classification, send-time optimization)",
 "Public REST API v1 and MCP server for programmatic access"
 ]
 })
 }} />

 {/* ================= NAVBAR ================= */}
 <Navbar />

 {/* Fixed thin-square grid background - sits behind everything */}
 <MarketingBackdrop />

 {/* ================= HERO - centered, beige, screenshot below ================= */}
 <section className="relative pt-44 md:pt-52 pb-8 z-10 px-6">
 <div className="max-w-3xl mx-auto text-center">
 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-semibold leading-[1.18] tracking-[-0.01em] text-gray-900 mb-4">
 AI-powered cold email with{' '}
 <span className="italic font-normal text-[#D4730F]" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, 'Times New Roman', serif" }}>deliverability protection</span>.
 </h1>

 <p className="text-sm md:text-base text-gray-500 mb-4 leading-relaxed max-w-xl mx-auto">
 Send, personalize, and scale cold email - with a protection layer that auto-pauses, reroutes, and heals before your domains burn.
 </p>

 <p className="text-[11px] text-gray-400 mb-6 tracking-wide">
 AI sequences · Multi-mailbox sending · Email validation · Auto-healing
 </p>

 <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
 <a href={appUrl('/signup')} className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-colors">
 Start Your Trial
 </a>
 <a href="https://cal.com/richardson-eugin-simon-qzmevd/30min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-900 border border-[#D1CBC5] rounded-full text-xs font-semibold hover:border-gray-900 transition-colors">
 Book a Demo
 </a>
 </div>
 </div>
 </section>

 {/* ================= HERO SCREENSHOT - Protection Overview ================= */}
 <section className="relative z-10 px-6 pb-12 md:pb-16">
 <div className="max-w-6xl mx-auto">
 <div className="relative rounded-2xl overflow-hidden border border-[#D1CBC5] shadow-xl shadow-gray-900/5 bg-white">
 <Image
 src="/image/dashboard-overview.png"
 alt="Superkabe - protection overview dashboard with healing pipeline and lead health gate"
 width={1920}
 height={1200}
 priority
 className="w-full h-auto"
 />
 </div>
 </div>
 </section>

 {/* ================= STAT COUNTERS ================= */}
 <section className="relative z-10 mt-0 mb-8 px-6">
 <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
 {[
 { value: '99%+', label: 'Inbox Rate' },
 { value: '10×', label: 'AI Personalization' },
 { value: '∞', label: 'Mailboxes' },
 { value: '24/7', label: 'Auto-Healing' },
 ].map((stat) => (
 <div key={stat.label} className="text-center">
 <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
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
 <h2 className="h2-rule mb-5">
 What does the Superkabe platform do for you?
 </h2>
 <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
 Superkabe is an AI-driven cold email platform with deliverability protection built in. Draft sequences with AI, send across unlimited mailboxes, validate every email, route each lead to the mailbox with the best ESP track record - and let the protection layer auto-pause, reroute, and heal whenever a mailbox or domain starts to drift.
 </p>
 </div>

 {/* Bento Grid - varied-width cells inspired by popl.co */}
 <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 mb-14">

 {/* Row 1: Mailbox fatigue (wide) + DNS auth */}
 <div className="md:col-span-4 bg-white border border-gray-200 p-7 md:p-9 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-11 h-11 bg-[#FFEBC9]/50 border border-[#FFEBC9] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
 <svg className="w-5 h-5 text-[#D4730F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
 </div>
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mailbox Health</span>
 </div>
 <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 tracking-tight">Mailbox fatigue detection</h3>
 <p className="text-sm md:text-base text-gray-600 leading-relaxed">
 Superkabe algorithms automatically detect mailbox fatigue and instantly pause underperforming mailboxes, rebalancing traffic to healthy assets to preserve reputation.
 </p>
 </div>

 <div className="md:col-span-2 bg-white border border-gray-200 p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
 <div className="w-11 h-11 bg-[#FFEBC9]/40 border border-[#FFEBC9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <svg className="w-5 h-5 text-[#D4730F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
 </div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Authentication</div>
 <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 tracking-tight">DNS authentication enforcement</h3>
 <p className="text-sm text-gray-600 leading-relaxed">
 Continuously monitors SPF, DKIM, and DMARC on every domain and blocks outbound traffic when misconfigurations threaten deliverability.
 </p>
 </div>

 {/* Row 2: Three equal columns */}
 <div className="md:col-span-2 bg-white border border-gray-200 p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
 <div className="w-11 h-11 bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.5c.73 1.81 1 4.53 0 6.5-1 2 1.415 1.5 1.5 1.5-.085.5-1.2 1.5-1.843 2z" /></svg>
 </div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Domain Safety</div>
 <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 tracking-tight">Domain burnout prevention</h3>
 <p className="text-sm text-gray-600 leading-relaxed">
 Gates outbound email traffic based on live bounce data, halting campaigns before an isolated spike compounds into permanent blocklisting.
 </p>
 </div>

 <div className="md:col-span-2 bg-white border border-gray-200 p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
 <div className="w-11 h-11 bg-[#FFEBC9]/40 border border-[#FFEBC9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <svg className="w-5 h-5 text-[#D4730F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
 </div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lead Quality</div>
 <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 tracking-tight">Toxic lead filtering</h3>
 <p className="text-sm text-gray-600 leading-relaxed">
 Tracks lead health across your infrastructure, automatically isolating toxic contacts to prevent hard bounces from damaging sender reputation.
 </p>
 </div>

 <div className="md:col-span-2 bg-white border border-gray-200 p-7 md:p-8 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
 <div className="w-11 h-11 bg-[#FFEBC9]/40 border border-[#FFEBC9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
 <svg className="w-5 h-5 text-[#D4730F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
 </div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Validation</div>
 <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 tracking-tight">Email validation before sending</h3>
 <p className="text-sm text-gray-600 leading-relaxed">
 Syntax, MX, disposable domain, and catch-all detection before emails reach your sender. MillionVerifier API verification for risky leads.
 </p>
 </div>

 {/* Row 3: Full-width Health Gate */}
 <div className="md:col-span-6 bg-white border border-gray-200 p-7 md:p-10 hover:border-gray-300 hover:shadow-[0_5px_20px_rgba(26,26,26,0.06)] transition-all duration-300 group">
 <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center">
 <div className="w-12 h-12 bg-[#D4F0DC]/50 border border-[#D4F0DC] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
 <svg className="w-6 h-6 text-[#1C4532]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
 </div>
 <div>
 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Risk-Aware Routing</div>
 <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 tracking-tight">Health gate classifies every lead before it ships</h3>
 <p className="text-sm md:text-base text-gray-600 leading-relaxed">
 Every lead is classified <span className="font-bold text-[#1C4532]">GREEN</span>, <span className="font-bold text-[#D4730F]">YELLOW</span>, or <span className="font-bold text-gray-800">RED</span> based on validation score, engagement signals, and domain health. RED leads are blocked. GREEN leads route normally. YELLOW leads distribute across mailboxes with per-sender risk caps.
 </p>
 </div>
 <div className="hidden md:flex items-center gap-3 shrink-0">
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 bg-[#D4F0DC]/500 flex items-center justify-center text-white font-bold text-sm shadow-sm">G</div>
 <span className="text-[10px] text-[#1C4532] font-semibold mt-1.5">GREEN</span>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 bg-[#FFEBC9]/500 flex items-center justify-center text-white font-bold text-sm shadow-sm">Y</div>
 <span className="text-[10px] text-[#D4730F] font-semibold mt-1.5">YELLOW</span>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 bg-gray-1000 flex items-center justify-center text-white font-bold text-sm shadow-sm">R</div>
 <span className="text-[10px] text-gray-800 font-semibold mt-1.5">RED</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto mb-14">
 {/* LEFT - 2-col feature card grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {[
 {
 title: 'Leads',
 desc: 'Validate, route & enrich prospects',
 svg: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
 },
 {
 title: 'Sequence',
 desc: 'AI-drafted multi-step campaigns',
 svg: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
 },
 {
 title: 'Schedule',
 desc: 'Send-window control per mailbox',
 svg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
 },
 {
 title: 'Settings',
 desc: 'Throttling rules & guardrails',
 svg: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
 },
 {
 title: 'Sender Mailboxes',
 desc: 'Multi-provider sending pool',
 svg: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
 },
 {
 title: 'Launch',
 desc: 'Activate, monitor, auto-heal',
 svg: <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
 },
 ].map((f) => (
 <div key={f.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#D1CBC5]">
 <div className="w-8 h-8 rounded-lg bg-[#FFEBC9]/40 border border-[#FFEBC9] flex items-center justify-center shrink-0 text-[#D4730F]">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">{f.svg}</svg>
 </div>
 <div className="min-w-0">
 <div className="text-sm font-semibold text-gray-900 leading-tight">{f.title}</div>
 <div className="text-xs text-gray-500 mt-0.5 leading-snug">{f.desc}</div>
 </div>
 </div>
 ))}
 </div>

 {/* RIGHT - heading + checklist + pill row */}
 <div>
 <h2 className="h2-rule mb-4">
 AI-powered sending with a 99%+ inbox rate baked in.
 </h2>
 <p className="text-base md:text-sm text-gray-500 leading-relaxed mb-7">
 Predictable, multi-step campaigns with deliverability protection layered into every send.
 </p>
 <ul className="space-y-3 mb-8">
 {[
 'Proprietary 5-phase healing pipeline for paused mailboxes',
 'ESP-aware routing for higher inbox placement on Gmail and Outlook',
 'Real-time bounce monitoring with threshold-based auto-pause',
 'Hybrid email validation - syntax, MX, disposable, catch-all',
 'Complete REST API + MCP server for programmatic control',
 ].map((item) => (
 <li key={item} className="flex items-start gap-2.5">
 <svg className="w-5 h-5 text-[#1C4532] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 <span className="text-sm md:text-base text-gray-700 leading-relaxed">{item}</span>
 </li>
 ))}
 </ul>
 <div className="flex flex-wrap gap-1.5">
 {['Leads', 'Sequence', 'Schedule', 'Settings', 'Sender Mailboxes', 'Launch'].map((tag) => (
 <span key={tag} className="px-3 py-1 bg-white border border-[#D1CBC5] rounded-md text-xs font-medium text-gray-700">
 {tag}
 </span>
 ))}
 </div>
 </div>
 </div>
 <div className="text-center mt-6">
 <p className="text-gray-500 text-sm mb-4 max-w-xl mx-auto">The Superkabe Infrastructure Playbook documents best practices for maintaining 99%+ deliverability across multi-domain outbound email infrastructure.</p>
 <Link href="/infrastructure-playbook" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-colors shadow-lg shadow-gray-900/10">
 Read the Playbook
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
 </Link>
 </div>



 {/* ================= CUSTOMERS (hanging-badge marquee + laptop) ================= */}
 <CustomersMarquee />

 {/* ================= INTEGRATIONS GRID (vertical marquee) ================= */}
 <div className="mt-0 mb-0 relative w-full pt-2 pb-2 flex flex-col items-center">
 <div className="text-center mb-12 px-6 max-w-3xl">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase mb-5">
 Native Integrations
 </div>
 <h2 className="h2-rule mb-4">
 Plugs into your stack - no middleman.
 </h2>
 <p className="text-lg text-gray-600 leading-relaxed">
 Pull leads in from your enrichment tools, route them through your own mailboxes, and sync activity back to your CRM, dialer, or Slack - all native, all configurable in minutes.
 </p>
 </div>

 {/* Marquee grid: four vertical columns alternating direction. Each column
 duplicates its cards so the translateY 0 → -50% loop wraps seamlessly.
 Edge fades + hover-pause are handled in globals.css. */}
 <div className="relative w-full max-w-6xl px-4">
 {/* Top + bottom fade so the cards fade in/out instead of clipping hard. */}
 <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 z-10 bg-gradient-to-b from-[#FAF6F0] to-transparent" />
 <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 z-10 bg-gradient-to-t from-[#FAF6F0] to-transparent" />

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[520px] overflow-hidden">
 <MarqueeColumn direction="up" speed="normal" items={col1} />
 <MarqueeColumn direction="down" speed="slow" items={col2} />
 <MarqueeColumn direction="up" speed="slow" items={col3} />
 <MarqueeColumn direction="down" speed="normal" items={col4} />
 </div>
 </div>
 </div>
 </section>

 {/* ================= INTEGRATIONS SECTION (popl-inspired row grid) ================= */}
 <section className="relative z-10 pt-4 pb-14 lg:pt-6 lg:pb-20 px-6">
 <div className="max-w-6xl mx-auto">
 {/* Header */}
 <div className="text-center mb-12">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase mb-6">
 Lead Sources · Mailboxes · Alerts
 </div>
 <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
 Connect your mailboxes. Send from Superkabe.
 </h2>
 <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
 Pipe leads in from your enrichment tools, route them through your own mailboxes, and sync activity back to your CRM, dialer, or Slack - all native, all configurable in minutes.
 </p>
 </div>
 </div>

 {/* Integrations - alternating rows with visible grid lines */}
 <PlatformRow
 eyebrow="Native Send"
 title="Connect Gmail with one-click OAuth"
 body="Authorize once and Superkabe sends through your Gmail mailbox with full DKIM/SPF alignment. Real-time tracking of opens, clicks, replies, and bounces - plus reputation signals direct from Google Postmaster Tools."
 tags={['OAuth', 'Postmaster Tools', 'Real-Time Tracking']}
 tagColor="blue"
 link="/docs/getting-started"
 imageOnLeft={true}
 mockup={<GmailMockup />}
 />
 <PlatformRow
 eyebrow="Native Send"
 title="Connect Microsoft 365 with OAuth"
 body="Authorize once and Superkabe sends through your Microsoft 365 mailbox. ESP-aware lead routing prefers the mailbox with the strongest 30-day deliverability for each recipient's inbox provider."
 tags={['OAuth', 'ESP Routing', 'SNDS']}
 tagColor="purple"
 link="/docs/getting-started"
 imageOnLeft={false}
 mockup={<MicrosoftMockup />}
 />
 <PlatformRow
 eyebrow="Native Send"
 title="Bring any SMTP mailbox"
 body="Encrypted credentials for any SMTP/IMAP provider. Per-mailbox daily caps, automatic pausing at the first signal of bounce-rate drift, and continuous DNSBL monitoring across the sending IP."
 tags={['Encrypted Creds', 'Daily Caps', 'DNSBL']}
 tagColor="teal"
 link="/docs/getting-started"
 imageOnLeft={true}
 mockup={<SmtpMockup />}
 />
 <PlatformRow
 eyebrow="Lead Source"
 title="Push enriched leads from Clay into Superkabe"
 body="Webhook ingestion for enriched leads. Clay pushes rows to Superkabe, where they get validated, health-gated, and auto-routed into the right AI sequence - no spreadsheet middle step."
 tags={['Webhook', 'Auto-Routing', 'Validation']}
 tagColor="orange"
 link="/docs/clay-integration"
 imageOnLeft={false}
 mockup={<ClayMockup />}
 />
 <PlatformRow
 eyebrow="Real-Time Alerts"
 title="Instant deliverability events in Slack"
 body="Real-time alerts for sends, replies, bounces, and healing milestones. Mailbox paused, domain blacklisted, sequence stalled, inbox placement dropped - all surfaced in your Slack channel."
 tags={['Alerts', 'Real-Time', 'Configurable']}
 tagColor="yellow"
 link="/docs/slack-integration"
 imageOnLeft={true}
 mockup={<SlackMockup />}
 />

 {/* Bottom how it connects - kept as-is for SEO/AEO content */}
 <div className="max-w-6xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
 <div className="text-center">
 <div className="w-12 h-12 mx-auto mb-3 bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-900">1</div>
 <div className="font-bold text-gray-900 mb-1 text-sm">Connect in 2 clicks</div>
 <p className="text-xs text-gray-500">Paste your API key. Superkabe syncs campaigns, mailboxes, and leads automatically.</p>
 </div>
 <div className="text-center">
 <div className="w-12 h-12 mx-auto mb-3 bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-900">2</div>
 <div className="font-bold text-gray-900 mb-1 text-sm">Bi-directional sync</div>
 <p className="text-xs text-gray-500">Webhooks push real-time events to Superkabe. API mutations push actions back to your platform.</p>
 </div>
 <div className="text-center">
 <div className="w-12 h-12 mx-auto mb-3 bg-white border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-900">3</div>
 <div className="font-bold text-gray-900 mb-1 text-sm">Zero downtime</div>
 <p className="text-xs text-gray-500">Keep sending wherever you send today - Superkabe layers protection on top. Or migrate to Superkabe when you're ready for AI sequences + protection in one.</p>
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
 <h2 className="h2-rule mb-5">Everything your cold email program needs - in one platform.</h2>
 <p className="text-gray-500 max-w-2xl mx-auto text-lg">AI sequence builder, multi-mailbox sending, ESP-aware routing, email validation, and a full deliverability protection stack - plus dedicated AI agents and a full API for programmatic control.</p>
 </div>
 </div>

 <FeatureRow
 eyebrow="AI Sequences"
 title={features[0].title}
 body={features[0].desc}
 link={features[0].link}
 imageOnLeft={true}
 mockup={<MonitoringMockup />}
 />
 <FeatureRow
 eyebrow="ESP-Aware Routing"
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
 eyebrow="Multi-Mailbox Scale"
 title={features[3].title}
 body={features[3].desc}
 link={features[3].link}
 imageOnLeft={false}
 mockup={<ScalingMockup />}
 />
 <FeatureRow
 eyebrow="Platform Analytics"
 title={features[4].title}
 body={features[4].desc}
 link={features[4].link}
 imageOnLeft={true}
 mockup={<AnalyticsMockup />}
 />
 <FeatureRow
 eyebrow="Email Validation"
 title={features[5].title}
 body={features[5].desc}
 link={features[5].link}
 imageOnLeft={false}
 mockup={<ValidationMockup />}
 />
 </section>

 {/* ================= PRICING ================= */}
 <section className="py-10 lg:py-16 px-6 relative z-10">
 <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-end">

 <div>
 <div className="inline-block px-4 py-1 rounded-full bg-[#FFEBC9]/40 text-[#D4730F] text-sm font-semibold mb-6">Simple Pricing</div>
 <h2 className="h2-rule mb-6">One platform for cold email outreach and protection.</h2>
 <p className="text-gray-500 mb-8 text-lg leading-relaxed">
 Stop paying for an AI writer, a sender, a validator, and a deliverability tool separately. Superkabe bundles AI sequences, multi-mailbox sending, email validation, and the full protection layer - for the price of one line item.
 </p>

 <div className="bg-white p-10 border border-gray-100 shadow-xl">
 <h3 className="text-2xl font-bold mb-6">What's included in every plan:</h3>
 <ul className="space-y-4 text-gray-600 mb-8">
 <li className="flex items-center gap-3">
 <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
 <span>AI sequence generation + variant testing</span>
 </li>
 <li className="flex items-center gap-3">
 <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
 <span>Unlimited mailboxes + ESP-aware routing</span>
 </li>
 <li className="flex items-center gap-3">
 <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
 <span>Email validation + auto-healing protection stack</span>
 </li>
 </ul>
 <Link href="/pricing" className="block w-full py-4 bg-gray-900 text-white text-center rounded-full font-semibold hover:bg-black transition-colors">
 View Detailed Pricing
 </Link>
 </div>
 </div>

 <div className="bg-gradient-to-br from-[#D4730F] to-[#1C4532] p-1 shadow-2xl transition-transform duration-500">
 <div className="bg-white p-10 md:p-12 h-full">
 <div className="flex justify-between items-start mb-8">
 <div>
 <h3 className="text-xl font-bold text-gray-900">Starter Plan</h3>
 <p className="text-gray-500 mt-1">Perfect for founder-led teams</p>
 </div>
 <div className="bg-[#FFEBC9]/40 text-[#D4730F] px-3 py-1 text-xs font-bold uppercase tracking-wider">Start Today</div>
 </div>

 <div className="flex items-baseline gap-1 mb-10">
 <span className="text-6xl font-bold text-gray-900">$19</span>
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
 className="w-full py-4 bg-[#D4730F] text-white rounded-full font-bold shadow-lg shadow-[#FFEBC9] hover:shadow-xl hover:bg-[#1C4532] transition-all"
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
 <h2 className="h2-rule mb-4">How the Superkabe platform is built</h2>
 <p className="text-gray-500 text-lg max-w-3xl mx-auto">The core technical characteristics of Superkabe - an AI cold email platform with native deliverability protection - for teams running high-volume outbound.</p>
 </div>
 <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
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

 {/* Left Column - Heading + CTA */}
 <div className="lg:sticky lg:top-32 lg:self-start">
 <h2 className="h2-rule mb-6">
 Questions<br />and answers
 </h2>
 <p className="text-gray-500 text-lg leading-relaxed mb-8">
 Straight answers about the Superkabe platform - AI sequencing, multi-mailbox sending, email validation, and built-in deliverability protection.
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

 {/* Right Column - FAQ Accordion (sticky-scrollable) */}
 <div className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto scrollbar-hide">
 <div className="divide-y divide-gray-200">
 {faqSchema.mainEntity.map((faq, index) => (
 <div
 key={index}
 className="cursor-pointer"
 onClick={() => setOpenIndex(openIndex === index ? null : index)}
 >
 <div className={`py-6 px-4 transition-all duration-300 ${openIndex === index ? 'bg-gray-50 ' : ''}`}>
 <div className="flex justify-between items-center gap-4">
 <h3 className="font-semibold text-base md:text-lg text-gray-900 pr-4">{faq.name}</h3>
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
 <h2 className="h2-rule mb-8">
 Send smarter. <br />
 Protect what you send with.
 </h2>
 <p className="text-base text-gray-600 mb-12 max-w-2xl mx-auto">
 Join modern outbound teams running their entire cold email operation on Superkabe - AI sequences, multi-mailbox sending, and deliverability protection in one platform.
 </p>

 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <a
 href={appUrl('/signup')}
 className="px-10 py-4 bg-black text-white rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all"
 >
 Get Started Free
 </a>
 </div>
 </div>
 </section>

 <Footer />

 </div>
 );

}
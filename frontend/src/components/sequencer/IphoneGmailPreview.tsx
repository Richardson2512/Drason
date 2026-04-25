'use client';

/**
 * IphoneGmailPreview
 *
 * Pixel-tuned replica of Gmail mobile (Android-style render that ships on
 * iOS too) on an iPhone 16 / 6.1" form factor in dark mode. Two view modes:
 *
 *   - 'inbox'  → tabbed inbox list with Updates / Promotions / Social
 *                bundles, individual email rows, floating Compose FAB,
 *                bottom Mail/Meet nav.
 *   - 'opened' → top toolbar (back, archive, trash, mark-unread, more),
 *                subject + Inbox label, sender row, body, Reply/Forward
 *                bottom action pills.
 *
 * Calibrated against the iPhone 6.1" Gmail screenshots provided April 2026.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import {
    Menu,
    Info,
    Tag,
    Users,
    Star,
    ArrowLeft,
    Archive,
    Trash2,
    MailOpen,
    MoreVertical,
    Smile,
    CornerUpLeft,
    Forward,
    Pencil,
    Mail as MailIcon,
    Video,
    ChevronDown,
} from 'lucide-react';

interface Props {
    subject: string;
    bodyHtml: string;
    senderName: string;
    senderEmail: string;
    inboxPreview?: string;
    /** Predicted Gemini summary for mobile, if any. */
    aiSummary?: string;
    view: 'inbox' | 'opened';
}

// ─── Tokens (dark mode) ──────────────────────────────────────────────────────

const TOK = {
    bgScreen: '#0F1318',
    bgCard: '#1F2125',
    bgSearch: '#2A2D31',
    bgBanner: '#1F2125',
    border: '#2A2D31',
    textPrimary: '#FFFFFF',
    textSecondary: '#A4A8AB',
    textTertiary: '#7A7E83',
    blueLink: '#8AB4F8',
    composeBg: '#1A4FB6',
    composeFg: '#E3EDFD',
    pillUpdatesBg: '#FCE0BB',
    pillUpdatesFg: '#3B1F00',
    pillPromosBg: '#A8E0B6',
    pillPromosFg: '#0B3B14',
    pillSocialBg: '#BFD7F2',
    pillSocialFg: '#0B2B4D',
    pillInboxBg: '#2D3036',
    pillInboxFg: '#A4A8AB',
    star: '#5F6368',
    badgeRed: '#E94235',
    iconUpdatesRing: '#F7B26A',
    iconPromosBg: '#34A853',
    iconSocialBg: '#7AB7E5',
    avatarPalette: ['#7AB7E5', '#F4B400', '#0F9D58', '#DB4437', '#AB47BC', '#26A69A', '#FF7043', '#5C6BC0'],
    avatarGray: '#5A5C61',
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function avatarFor(name: string): { bg: string; letter: string } {
    const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    const palette = TOK.avatarPalette;
    return { bg: palette[Math.abs(hash) % palette.length], letter };
}

function timeShort(): string {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function dayMonth(): string {
    const d = new Date();
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short' });
}

// ─── Status bar ──────────────────────────────────────────────────────────────

function StatusBar() {
    const t = (() => {
        const d = new Date();
        let h = d.getHours();
        const m = d.getMinutes();
        h = h % 12 || 12;
        return `${h}:${m.toString().padStart(2, '0')}`;
    })();
    return (
        <div
            style={{
                height: 54, paddingLeft: 24, paddingRight: 24, display: 'flex',
                alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 8,
                color: '#FFFFFF', fontSize: 16, fontWeight: 600,
            }}
        >
            <span>{t}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Cellular bars */}
                <svg width="18" height="11" viewBox="0 0 18 11">
                    {[3, 5, 7, 9].map((h, i) => (
                        <rect key={i} x={i * 4} y={11 - h} width="3" height={h} rx={0.5} fill="#FFFFFF" />
                    ))}
                </svg>
                {/* Wifi */}
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <path d="M8 9.5l-1.5-1.5a2 2 0 0 1 3 0L8 9.5z" fill="#FFFFFF" />
                    <path d="M3.5 5a6 6 0 0 1 9 0" stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M1 2.5a10 10 0 0 1 14 0" stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </svg>
                {/* Battery */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <div style={{ width: 24, height: 12, border: '1.2px solid #FFFFFF', borderRadius: 3, padding: 1, position: 'relative' }}>
                        <div style={{ width: '40%', height: '100%', background: '#FFFFFF', borderRadius: 1 }} />
                        <span style={{ position: 'absolute', top: -1, left: 2, fontSize: 8, fontWeight: 700, color: '#000', letterSpacing: -0.5 }}>1</span>
                    </div>
                    <div style={{ width: 1.5, height: 4, background: '#FFFFFF', borderRadius: 1 }} />
                </div>
            </div>
        </div>
    );
}

// ─── Inbox view ──────────────────────────────────────────────────────────────

function SearchBar() {
    return (
        <div style={{ padding: '8px 16px 12px' }}>
            <div
                style={{
                    height: 48, borderRadius: 999, background: TOK.bgSearch, display: 'flex',
                    alignItems: 'center', paddingLeft: 14, paddingRight: 6, gap: 14,
                }}
            >
                <Menu size={20} color={TOK.textPrimary} strokeWidth={1.7} />
                <span style={{ flex: 1, fontSize: 16, color: TOK.textSecondary }}>Search in mail</span>
                {/* Account avatar */}
                <div
                    style={{
                        width: 32, height: 32, borderRadius: 999,
                        background: 'linear-gradient(135deg, #FBE4D2, #1F2937 75%)',
                    }}
                />
            </div>
        </div>
    );
}

function PrimaryLabel() {
    return (
        <div style={{ paddingLeft: 16, paddingTop: 4, paddingBottom: 8 }}>
            <span style={{ fontSize: 12, color: TOK.textSecondary }}>Primary</span>
        </div>
    );
}

function BundleRow({
    icon,
    label,
    preview,
    pillText,
    pillBg,
    pillFg,
}: {
    icon: React.ReactNode;
    label: string;
    preview: string;
    pillText: string;
    pillBg: string;
    pillFg: string;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: TOK.textPrimary }}>{label}</span>
                    <span
                        style={{
                            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
                            background: pillBg, color: pillFg,
                        }}
                    >
                        {pillText}
                    </span>
                </div>
                <div
                    style={{
                        marginTop: 2, fontSize: 14, color: TOK.textPrimary, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {preview}
                </div>
            </div>
        </div>
    );
}

function GotItBanner() {
    return (
        <div style={{ marginLeft: 16, marginRight: 16, padding: '14px 16px 12px', borderRadius: 12, background: TOK.bgCard }}>
            <p style={{ margin: 0, fontSize: 14, color: TOK.textSecondary, lineHeight: 1.5 }}>
                Now, Gmail puts messages that may not need your immediate attention in updates. You can change this at any time in settings.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                <span style={{ fontSize: 14, color: TOK.blueLink, fontWeight: 500 }}>Got it</span>
                <span style={{ fontSize: 14, color: TOK.blueLink, fontWeight: 500 }}>Learn more</span>
            </div>
        </div>
    );
}

function EmailRow({
    sender,
    subject,
    preview,
    time,
    unread = true,
    avatar,
    avatarBg,
    highlight = false,
}: {
    sender: string;
    subject: string;
    preview: string;
    time: string;
    unread?: boolean;
    avatar: string;
    avatarBg: string;
    highlight?: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex', gap: 14, padding: '14px 16px 14px',
                borderBottom: `1px solid ${TOK.border}`,
                background: highlight ? 'rgba(138, 180, 248, 0.06)' : 'transparent',
            }}
        >
            <div
                style={{
                    width: 40, height: 40, borderRadius: 999, background: avatarBg,
                    color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 600, flexShrink: 0,
                }}
            >
                {avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span
                        style={{
                            fontSize: 16, fontWeight: unread ? 700 : 500, color: TOK.textPrimary,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                        }}
                    >
                        {sender}
                    </span>
                    <span style={{ fontSize: 12, color: TOK.textSecondary, fontWeight: 600, flexShrink: 0 }}>
                        {time}
                    </span>
                </div>
                <div
                    style={{
                        marginTop: 2, fontSize: 14, color: TOK.textPrimary, fontWeight: unread ? 700 : 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {subject || <span style={{ fontStyle: 'italic', color: TOK.textSecondary }}>(no subject)</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                    <span
                        style={{
                            flex: 1, fontSize: 13, color: TOK.textSecondary,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                    >
                        {preview}
                    </span>
                    <Star size={18} color={TOK.star} strokeWidth={1.6} />
                </div>
            </div>
        </div>
    );
}

function ComposeFab() {
    return (
        <div
            style={{
                position: 'absolute', right: 14, bottom: 88,
                display: 'inline-flex', alignItems: 'center', gap: 10,
                height: 52, padding: '0 22px 0 18px', borderRadius: 999,
                background: TOK.composeBg, color: TOK.composeFg, fontSize: 15, fontWeight: 600,
                boxShadow: '0 6px 18px rgba(26, 79, 182, 0.45)',
            }}
        >
            <Pencil size={18} strokeWidth={1.8} />
            Compose
        </div>
    );
}

function BottomNav() {
    return (
        <div
            style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 88,
                background: TOK.bgScreen, borderTop: `1px solid ${TOK.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                paddingBottom: 28,
            }}
        >
            {/* Mail (selected, with badge) */}
            <div style={{ position: 'relative', padding: '8px 24px', background: '#1F4FB6', borderRadius: 16 }}>
                <MailIcon size={22} color="#E3EDFD" strokeWidth={1.8} />
                <div
                    style={{
                        position: 'absolute', top: 0, right: 8,
                        background: '#F4B894', color: '#3B1F00',
                        fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                    }}
                >
                    99+
                </div>
            </div>
            <div style={{ padding: 8 }}>
                <Video size={22} color={TOK.textSecondary} strokeWidth={1.8} />
            </div>
        </div>
    );
}

function GmailMobileInbox({
    subject,
    sender,
    preview,
}: {
    subject: string;
    sender: string;
    preview: string;
}) {
    const av = avatarFor(sender);
    return (
        <div style={{ position: 'relative', flex: 1, background: TOK.bgScreen, overflow: 'hidden' }}>
            <SearchBar />
            <PrimaryLabel />
            <div style={{ overflowY: 'auto', height: 'calc(100% - 100px)', paddingBottom: 110 }}>
                {/* Updates bundle */}
                <BundleRow
                    icon={
                        <div
                            style={{
                                width: 28, height: 28, borderRadius: 999, border: `2px solid ${TOK.iconUpdatesRing}`,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Info size={14} color={TOK.iconUpdatesRing} strokeWidth={2} />
                        </div>
                    }
                    label="Updates"
                    preview="Myntra – Mantastic Days Are Here…"
                    pillText="99+ new"
                    pillBg={TOK.pillUpdatesBg}
                    pillFg={TOK.pillUpdatesFg}
                />
                <GotItBanner />

                {/* Promotions bundle */}
                <BundleRow
                    icon={
                        <Tag size={22} color={TOK.iconPromosBg} strokeWidth={2} fill="none" />
                    }
                    label="Promotions"
                    preview="Amazon.in – We found something…"
                    pillText="99+ new"
                    pillBg={TOK.pillPromosBg}
                    pillFg={TOK.pillPromosFg}
                />

                {/* User's email — pinned at the top of the individual rows */}
                <EmailRow
                    sender={sender || 'Sender'}
                    subject={subject}
                    preview={preview || ''}
                    time={timeShort()}
                    unread
                    avatar={av.letter}
                    avatarBg={av.bg}
                    highlight
                />

                {/* Realistic neighbor rows from the calibration screenshot */}
                <EmailRow
                    sender="AI Daily Nutshell"
                    subject="The AI Energy Breakthrough No One Is Ta…"
                    preview="🔥 AI Just Changed Clean Energy Forever:…"
                    time="5:30 PM"
                    avatar="in"
                    avatarBg="#0A66C2"
                />
                <EmailRow
                    sender="no-reply@amazonpay.in"
                    subject="Your Amazon Pay Wallet is Inactive"
                    preview="Hi Richardson, Since you have not used you…"
                    time="4:26 PM"
                    avatar="?"
                    avatarBg={TOK.avatarGray}
                />

                {/* Social bundle */}
                <BundleRow
                    icon={<Users size={22} color={TOK.iconSocialBg} strokeWidth={2} />}
                    label="Social"
                    preview="Jasper Prabu – You have an invitati…"
                    pillText="53 new"
                    pillBg={TOK.pillSocialBg}
                    pillFg={TOK.pillSocialFg}
                />

                <EmailRow
                    sender="Railway"
                    subject="Railway Agent, IPv6 Support"
                    preview="It's Friday and you know what that means! H…"
                    time="4:03 AM"
                    avatar="R"
                    avatarBg="#FFFFFF"
                />
                <EmailRow
                    sender="Google Cloud Platform"
                    subject="[Action required] Your veri…"
                    preview="Your verification is past due."
                    time="24 Apr"
                    avatar="G"
                    avatarBg="#A06FE2"
                />
            </div>
            <ComposeFab />
            <BottomNav />
        </div>
    );
}

// ─── Opened view ─────────────────────────────────────────────────────────────

function OpenedToolbar() {
    return (
        <div
            style={{
                height: 56, display: 'flex', alignItems: 'center', paddingLeft: 8, paddingRight: 8,
                color: TOK.textPrimary,
            }}
        >
            <div style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={22} strokeWidth={1.7} />
            </div>
            <span style={{ flex: 1 }} />
            <div style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 30, height: 30, border: `1.5px solid ${TOK.textPrimary}`, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Archive size={14} strokeWidth={1.7} />
                </div>
            </div>
            <div style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} strokeWidth={1.7} />
            </div>
            <div style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <MailOpen size={20} strokeWidth={1.7} />
                <span style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: 999, background: '#FFFFFF' }} />
            </div>
            <div style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoreVertical size={20} strokeWidth={1.7} />
            </div>
        </div>
    );
}

function GmailMobileOpened({
    subject,
    senderName,
    senderEmail,
    bodyHtml,
    aiSummary,
}: {
    subject: string;
    senderName: string;
    senderEmail: string;
    bodyHtml: string;
    aiSummary?: string;
}) {
    const av = avatarFor(senderName || senderEmail);
    return (
        <div style={{ position: 'relative', flex: 1, background: TOK.bgScreen, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <OpenedToolbar />

            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px', paddingBottom: 110 }}>
                {/* Subject */}
                <h1 style={{ fontSize: 22, color: TOK.textPrimary, margin: 0, fontWeight: 500, lineHeight: 1.25 }}>
                    {subject || '(no subject)'}
                </h1>

                {/* Inbox label + star */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <span
                        style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: TOK.pillInboxBg, color: TOK.pillInboxFg,
                            fontSize: 12, padding: '4px 10px', borderRadius: 6,
                        }}
                    >
                        Inbox
                    </span>
                    <Star size={22} color={TOK.star} strokeWidth={1.5} />
                </div>

                {/* Sender row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                    <div
                        style={{
                            width: 40, height: 40, borderRadius: 999, background: av.bg, color: '#FFFFFF',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 600, flexShrink: 0,
                        }}
                    >
                        {av.letter}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: TOK.textPrimary }}>{senderName || senderEmail || 'Sender'}</span>
                            <span style={{ fontSize: 13, color: TOK.textSecondary }}>{dayMonth()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 13, color: TOK.textSecondary }}>
                            to me <ChevronDown size={14} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${TOK.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Smile size={16} color={TOK.textSecondary} />
                        </div>
                        <CornerUpLeft size={20} color={TOK.textSecondary} strokeWidth={1.7} />
                        <div style={{ width: 24 }}>
                            <MoreVertical size={20} color={TOK.textSecondary} strokeWidth={1.7} />
                        </div>
                    </div>
                </div>

                {/* Optional Gemini summary */}
                {aiSummary && (
                    <div
                        style={{
                            marginTop: 20, padding: '10px 14px', borderRadius: 12,
                            background: 'rgba(138, 180, 248, 0.10)',
                            border: '1px solid rgba(138, 180, 248, 0.22)',
                            fontSize: 13, color: TOK.textPrimary,
                        }}
                    >
                        <div style={{ fontSize: 10, color: TOK.blueLink, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                            Gemini Summary
                        </div>
                        {aiSummary}
                    </div>
                )}

                {/* Body */}
                <div
                    className="prose prose-sm max-w-none"
                    style={{ color: TOK.textPrimary, fontSize: 15, lineHeight: 1.6, marginTop: 24 }}
                    dangerouslySetInnerHTML={{ __html: bodyHtml || '<p style="color:#9CA3AF;font-style:italic">(empty body)</p>' }}
                />
            </div>

            {/* Reply / Forward bottom action bar */}
            <div
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 96, paddingBottom: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    background: TOK.bgScreen, borderTop: `1px solid ${TOK.border}`,
                }}
            >
                <div
                    style={{
                        height: 48, padding: '0 28px', borderRadius: 999,
                        border: `1px solid ${TOK.border}`, color: TOK.textPrimary,
                        display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500,
                    }}
                >
                    <CornerUpLeft size={18} />
                    Reply
                </div>
                <div
                    style={{
                        height: 48, padding: '0 28px', borderRadius: 999,
                        border: `1px solid ${TOK.border}`, color: TOK.textPrimary,
                        display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500,
                    }}
                >
                    <Forward size={18} />
                    Forward
                </div>
                <div
                    style={{
                        width: 48, height: 48, borderRadius: 999,
                        border: `1px solid ${TOK.border}`, color: TOK.textPrimary,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <Smile size={18} />
                </div>
            </div>
        </div>
    );
}

// ─── iPhone chrome + scaling ─────────────────────────────────────────────────

const VIRTUAL_W = 393;
const VIRTUAL_H = 852;

export default function IphoneGmailPreview({
    subject,
    bodyHtml,
    senderName,
    senderEmail,
    inboxPreview,
    aiSummary,
    view,
}: Props) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth;
            // Phone is narrow — only scale DOWN if the container is smaller
            // than the device width plus a little padding for the bezel.
            const target = VIRTUAL_W + 32;
            setScale(Math.min(1, w / target));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const bezel = 12;
    const screenW = VIRTUAL_W;
    const screenH = VIRTUAL_H;
    const deviceW = screenW + bezel * 2;
    const deviceH = screenH + bezel * 2;

    return (
        <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: deviceW * scale, height: deviceH * scale, position: 'relative' }}>
                <div
                    style={{
                        width: deviceW, height: deviceH, transform: `scale(${scale})`, transformOrigin: 'top left',
                        position: 'absolute', top: 0, left: 0,
                    }}
                >
                    {/* iPhone bezel */}
                    <div
                        style={{
                            width: deviceW, height: deviceH, borderRadius: 56,
                            background: 'linear-gradient(180deg, #1A1A1D 0%, #0E0E10 100%)',
                            padding: bezel, boxSizing: 'border-box',
                            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                        }}
                    >
                        {/* Side buttons */}
                        <div style={{ position: 'absolute', left: -2, top: 110, width: 4, height: 32, background: '#0E0E10', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', left: -2, top: 160, width: 4, height: 60, background: '#0E0E10', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', left: -2, top: 230, width: 4, height: 60, background: '#0E0E10', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', right: -2, top: 180, width: 4, height: 92, background: '#0E0E10', borderRadius: 2 }} />

                        {/* Screen */}
                        <div
                            style={{
                                width: screenW, height: screenH, background: TOK.bgScreen, borderRadius: 44,
                                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
                            }}
                        >
                            {/* Dynamic island */}
                            <div
                                style={{
                                    position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
                                    width: 122, height: 36, borderRadius: 20, background: '#000', zIndex: 10,
                                }}
                            />

                            <StatusBar />

                            {view === 'inbox' ? (
                                <GmailMobileInbox
                                    subject={subject}
                                    sender={senderName || senderEmail || 'Sender'}
                                    preview={inboxPreview || ''}
                                />
                            ) : (
                                <GmailMobileOpened
                                    subject={subject}
                                    senderName={senderName}
                                    senderEmail={senderEmail}
                                    bodyHtml={bodyHtml}
                                    aiSummary={aiSummary}
                                />
                            )}

                            {/* Home indicator */}
                            <div
                                style={{
                                    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                                    width: 134, height: 5, borderRadius: 999, background: '#FFFFFF',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

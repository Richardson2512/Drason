'use client';

/**
 * MacbookGmailPreview
 *
 * Pixel-tuned replica of Gmail web on a MacBook Air 13". Two modes:
 *
 *   - 'inbox'  — your email shown as the most-recent row inside a realistic
 *                Gmail inbox (with neighbor demo rows for visual context).
 *                This is what the recipient sees at the moment of decision.
 *   - 'opened' — your email opened, full Gmail reading-pane chrome with
 *                action toolbar, External pill, "Summarize this email" bar,
 *                sender row, and Reply/Forward footer.
 *
 * Colors and spacing were calibrated against real Gmail screenshots
 * (April 2026). The inner UI is rendered at a fixed virtual width of
 * 1280px and CSS-transform-scaled to whatever the host container provides.
 *
 * This component intentionally does NOT call the API — it takes raw
 * subject/bodyHtml/sender props plus an optional pre-truncated inbox
 * preview line and AI summary. The host (RecipientPreviewPanel) drives
 * data fetching.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    Menu,
    Search,
    HelpCircle,
    Settings,
    Sparkles,
    Pencil,
    Inbox as InboxIcon,
    Star,
    Clock,
    Send,
    File as FileIcon,
    Tag,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    RefreshCw,
    MoreVertical,
    ArrowLeft,
    Archive,
    AlertOctagon,
    Trash2,
    MailOpen,
    CalendarPlus,
    CheckSquare,
    FolderInput,
    Tags,
    Smile,
    CornerUpLeft,
    Forward,
    Printer,
    ExternalLink,
    Plus,
    LayoutGrid,
    Calendar,
    StickyNote,
    Check,
    Contact,
    MessageSquare,
} from 'lucide-react';

interface Props {
    subject: string;
    bodyHtml: string;
    senderName: string;
    senderEmail: string;
    /** Pre-truncated inbox preview text from the backend (extracted body). */
    inboxPreview?: string;
    /** Predicted Gemini "Summarize this email" output, if available. */
    aiSummary?: string;
    /** 'inbox' or 'opened' — controlled by parent toolbar. */
    view: 'inbox' | 'opened';
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
//
// Gmail web uses Material 3 dynamic tokens. These are the static values
// closest to what the screenshots actually render at.

const TOK = {
    bg: '#FFFFFF',
    surface: '#F6F8FC',
    railBg: '#FFFFFF',
    sidebarBg: '#F6F8FC',
    border: '#E5E7EB',
    borderSoft: '#F0F0F0',
    composeBg: '#C2E7FF',
    composeFg: '#001D35',
    selectedBg: '#D3E3FD',
    selectedFg: '#001D35',
    hoverBg: '#F2F6FC',
    textPrimary: '#202124',
    textSecondary: '#5F6368',
    textTertiary: '#80868B',
    star: '#5F6368',
    activeDot: '#1E8E3E',
    upgradeBg: '#C2E7FF',
    upgradeFg: '#001D35',
    pillExternalBg: '#FEF7CD',
    pillExternalFg: '#614F1F',
    pillInboxBg: '#E8EAED',
    pillInboxFg: '#3C4043',
    summarizeBg: '#F1F3F4',
    summarizeBorder: '#E8EAED',
    addToCalendarBg: '#C2E7FF',
    addToCalendarFg: '#001D35',
    bodyLink: '#1A73E8',
    avatarPalette: ['#7AB7E5', '#F4B400', '#0F9D58', '#DB4437', '#AB47BC', '#26A69A', '#FF7043', '#5C6BC0'],
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function avatarFor(name: string): { bg: string; letter: string } {
    const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    const palette = TOK.avatarPalette;
    return { bg: palette[Math.abs(hash) % palette.length], letter };
}

function timeNow(): string {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Realistic neighbor inbox rows — picked to mirror the calibration screenshot.
// These render BELOW the user's email so the user sees the truncation and
// visual weight of their subject line in real inbox context.
const NEIGHBOR_ROWS: { sender: string; subject: string; preview: string; time: string }[] = [
    { sender: 'VEED', subject: 'Visual branding and brand controls', preview: 'Visual branding & brand controls To make your videos recognizable, start by aligning them …', time: '8:01 AM' },
    { sender: 'Medium Daily Digest', subject: 'The Boredom Arbitrage: 7 Side Hustles Nobody Posts About That Quietly Pay $1,000–$3,000/Month | Rahul Gaur in Write A Cat…', preview: '', time: '7:50 AM' },
    { sender: 'Roger AI', subject: 'Your Weekly Outbound Report', preview: "Hi Superkabe, Here's what Roger delivered for you this week (April 12–April 18): 📬 54 emails se…", time: '6:30 AM' },
    { sender: 'Instagram', subject: "superkabe, see what's been happening on Instagram", preview: 'Never miss an update Turn on push notifications to stay connected on In…', time: '2:49 AM' },
    { sender: 'DEV Community', subject: 'Two Challenges for Your Weekend', preview: "DEV Challenges happening now Hey there, We've got two Challenges to spotlight this week…", time: 'Apr 24' },
    { sender: 'Substack', subject: 'Growth tip: Promote in reader communities', preview: "Growth tip: Promote Superkabe in reader communities To grow Superkabe's reade…", time: 'Apr 24' },
    { sender: 'Kash at Clay', subject: "You're invited to apply for a Clay cohort", preview: 'Cohorts give you live training, private Slack discussions, and free Clay credits   Clay Lo…', time: 'Apr 24' },
];

// ─── Gmail logo ──────────────────────────────────────────────────────────────
//
// The multicolored M envelope. Approximated via inline SVG — no external asset.

function GmailLogo({ size = 24 }: { size?: number }) {
    return (
        <svg width={size * 1.33} height={size} viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 22V6.4L16 16.8 30 6.4V22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#FFFFFF" />
            <path d="M2 6.4V22a2 2 0 0 0 2 2h2V8.4L2 6.4z" fill="#4285F4" />
            <path d="M30 6.4V22a2 2 0 0 1-2 2h-2V8.4L30 6.4z" fill="#34A853" />
            <path d="M26 4l-10 7.4L6 4l-2 1.6V8.4l12 8.8L28 8.4V5.6L26 4z" fill="#EA4335" />
            <path d="M2 4.4v2L6 8.4V4l-1.6-.8A2 2 0 0 0 2 4.4z" fill="#C5221F" />
            <path d="M30 4.4v2L26 8.4V4l1.6-.8A2 2 0 0 1 30 4.4z" fill="#FBBC04" />
        </svg>
    );
}

// ─── Apps grid (9-dot icon) ──────────────────────────────────────────────────

function AppsGrid({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 18 18">
            {[0, 1, 2].map((y) =>
                [0, 1, 2].map((x) => (
                    <circle key={`${x}-${y}`} cx={3 + x * 6} cy={3 + y * 6} r={1.4} fill={TOK.textSecondary} />
                )),
            )}
        </svg>
    );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function GmailHeader() {
    return (
        <div
            className="flex items-center"
            style={{
                height: 64,
                paddingLeft: 8,
                paddingRight: 16,
                background: TOK.bg,
                borderBottom: `1px solid ${TOK.borderSoft}`,
                gap: 8,
            }}
        >
            {/* Hamburger + logo */}
            <button
                style={{
                    width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: TOK.textSecondary,
                }}
            >
                <Menu size={20} strokeWidth={1.6} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4, paddingRight: 16 }}>
                <GmailLogo size={28} />
                <span style={{ fontFamily: 'Product Sans, system-ui, sans-serif', fontSize: 22, color: '#5F6368', letterSpacing: 0 }}>
                    Gmail
                </span>
            </div>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: 720, marginLeft: 32 }}>
                <div
                    style={{
                        display: 'flex', alignItems: 'center', height: 48, background: '#EAF1FB',
                        borderRadius: 8, paddingLeft: 16, paddingRight: 12, gap: 16,
                    }}
                >
                    <Search size={20} color={TOK.textSecondary} strokeWidth={1.6} />
                    <span style={{ flex: 1, color: TOK.textSecondary, fontSize: 16 }}>Search mail</span>
                    <button style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default', color: TOK.textSecondary }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                    </button>
                </div>
            </div>

            {/* Active pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 32, padding: '6px 10px 6px 12px', borderRadius: 999, border: `1px solid ${TOK.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: TOK.activeDot }} />
                <span style={{ fontSize: 13, color: TOK.textPrimary }}>Active</span>
                <ChevronDown size={14} color={TOK.textSecondary} />
            </div>

            {/* Right cluster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                {[<HelpCircle key="h" size={20} />, <Settings key="s" size={20} />, <svg key="t" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, <Sparkles key="g" size={20} />].map((Ic, i) => (
                    <button key={i} style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent', color: TOK.textSecondary, cursor: 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{Ic}</button>
                ))}
                <button
                    style={{
                        marginLeft: 8, height: 40, padding: '0 20px', borderRadius: 999, border: 'none', background: TOK.upgradeBg,
                        color: TOK.upgradeFg, fontSize: 14, fontWeight: 500, cursor: 'default',
                    }}
                >
                    Upgrade
                </button>
                <button style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><AppsGrid /></button>
                <div style={{ width: 32, height: 32, borderRadius: 999, marginLeft: 4, background: 'linear-gradient(135deg, #FBE4D2, #1F2937 75%)' }} />
            </div>
        </div>
    );
}

// ─── Left rail (Mail / Chat / Meet) ──────────────────────────────────────────

function GmailLeftRail() {
    const items = [
        { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4h16v16H4z"/><polyline points="4 4 12 13 20 4"/></svg>, label: 'Mail' },
        { icon: <MessageSquare size={20} strokeWidth={1.7} />, label: 'Chat' },
        { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="6" width="14" height="12" rx="2"/><polygon points="16 10 22 6 22 18 16 14"/></svg>, label: 'Meet' },
    ];
    return (
        <div style={{ width: 64, paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: TOK.bg, pointerEvents: 'none' }}>
            {items.map((it, i) => (
                <div
                    key={i}
                    style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'transparent',
                        color: TOK.textSecondary,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}
                >
                    {it.icon}
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{it.label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Left sidebar ────────────────────────────────────────────────────────────

function GmailLeftSidebar() {
    const items: { icon: React.ReactNode; label: string; trailing?: React.ReactNode }[] = [
        { icon: <InboxIcon size={18} strokeWidth={1.7} />, label: 'Inbox' },
        { icon: <Star size={18} strokeWidth={1.7} />, label: 'Starred' },
        { icon: <Clock size={18} strokeWidth={1.7} />, label: 'Snoozed' },
        { icon: <Send size={18} strokeWidth={1.7} />, label: 'Sent' },
        { icon: <FileIcon size={18} strokeWidth={1.7} />, label: 'Drafts' },
        { icon: <Tag size={18} strokeWidth={1.7} />, label: 'Categories', trailing: <ChevronRight size={16} color={TOK.textSecondary} /> },
        { icon: <ChevronDown size={18} strokeWidth={1.7} />, label: 'More' },
    ];

    return (
        <div style={{ width: 256, padding: '8px 0 16px', background: TOK.bg, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
            {/* Compose */}
            <div style={{ padding: '0 16px 16px' }}>
                <div
                    style={{
                        height: 56, padding: '0 24px 0 16px', borderRadius: 16, background: TOK.composeBg,
                        color: TOK.composeFg, fontSize: 14, fontWeight: 500, display: 'inline-flex',
                        alignItems: 'center', gap: 12,
                    }}
                >
                    <Pencil size={18} strokeWidth={1.7} />
                    Compose
                </div>
            </div>

            {/* Items */}
            <div style={{ paddingRight: 8, display: 'flex', flexDirection: 'column' }}>
                {items.map((it, i) => (
                    <div
                        key={i}
                        style={{
                            height: 32, paddingLeft: 26, paddingRight: 16, display: 'flex', alignItems: 'center', gap: 16,
                            background: 'transparent',
                            color: TOK.textPrimary,
                            borderTopRightRadius: 999, borderBottomRightRadius: 999,
                            fontSize: 14, fontWeight: 400,
                        }}
                    >
                        {it.icon}
                        <span style={{ flex: 1 }}>{it.label}</span>
                        {it.trailing}
                    </div>
                ))}
            </div>

            {/* Labels section */}
            <div style={{ marginTop: 24, padding: '0 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32 }}>
                    <span style={{ fontSize: 14, color: TOK.textPrimary, fontWeight: 500 }}>Labels</span>
                    <Plus size={16} color={TOK.textSecondary} />
                </div>
            </div>
        </div>
    );
}

// ─── Right rail ──────────────────────────────────────────────────────────────

function GmailRightRail() {
    const icons = [
        <Calendar key="c" size={18} strokeWidth={1.6} color={TOK.textSecondary} />,
        <StickyNote key="k" size={18} strokeWidth={1.6} color={TOK.textSecondary} />,
        <Check key="t" size={18} strokeWidth={1.6} color={TOK.textSecondary} />,
        <Contact key="ct" size={18} strokeWidth={1.6} color={TOK.textSecondary} />,
        <Plus key="p" size={18} strokeWidth={1.6} color={TOK.textSecondary} />,
    ];
    return (
        <div style={{ width: 56, padding: '12px 0', borderLeft: `1px solid ${TOK.borderSoft}`, background: TOK.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {icons.map((ic, i) => (
                <button key={i} style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EA4335', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Z</div>
            <ChevronRight size={16} color={TOK.textSecondary} />
        </div>
    );
}

// ─── Inbox view ──────────────────────────────────────────────────────────────

function InboxToolbar() {
    return (
        <div style={{ height: 48, display: 'flex', alignItems: 'center', paddingLeft: 26, paddingRight: 24, gap: 4, color: TOK.textSecondary }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', height: 36, paddingLeft: 8, paddingRight: 4, gap: 4, border: 'none', background: 'transparent', cursor: 'default', borderRadius: 8 }}>
                <span style={{ width: 18, height: 18, border: `2px solid ${TOK.textSecondary}`, borderRadius: 3 }} />
                <ChevronDown size={16} />
            </button>
            <button style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={18} strokeWidth={1.6} />
            </button>
            <button style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: '#F1F3F4', cursor: 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoreVertical size={18} strokeWidth={1.6} />
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12 }}>1–50 of 337</span>
            <button style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default' }}><ChevronLeft size={16} color={TOK.textSecondary} /></button>
            <button style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default' }}><ChevronRight size={16} color={TOK.textSecondary} /></button>
        </div>
    );
}

function InboxRow({
    sender,
    subject,
    preview,
    time,
    unread = true,
    highlight = false,
}: {
    sender: string;
    subject: string;
    preview: string;
    time: string;
    unread?: boolean;
    highlight?: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', height: 40, paddingLeft: 8, paddingRight: 16,
                background: highlight ? '#FFFBEB' : unread ? '#F2F6FC' : '#FFFFFF',
                borderBottom: `1px solid ${TOK.borderSoft}`, gap: 12, fontSize: 13.5, fontWeight: unread ? 700 : 400,
                color: TOK.textPrimary,
            }}
        >
            <div style={{ width: 28, display: 'inline-flex', justifyContent: 'center' }}>
                <span style={{ width: 18, height: 18, border: `2px solid ${TOK.textTertiary}`, borderRadius: 3 }} />
            </div>
            <div style={{ width: 28, display: 'inline-flex', justifyContent: 'center' }}>
                <Star size={18} strokeWidth={1.6} color={TOK.star} />
            </div>
            <div style={{ width: 200, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flexShrink: 0 }}>
                {sender}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }}>
                <span>{subject}</span>
                {preview && (
                    <>
                        <span style={{ color: TOK.textSecondary, fontWeight: 400 }}> - </span>
                        <span style={{ color: TOK.textSecondary, fontWeight: 400 }}>{preview}</span>
                    </>
                )}
            </div>
            <div style={{ width: 72, textAlign: 'right', fontSize: 12, color: TOK.textSecondary, fontWeight: 400, flexShrink: 0 }}>
                {time}
            </div>
        </div>
    );
}

function InboxView({ subject, sender, preview }: { subject: string; sender: string; preview: string }) {
    return (
        <div style={{ flex: 1, background: TOK.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <InboxToolbar />
            <div style={{ flex: 1, overflow: 'auto', borderTop: `1px solid ${TOK.borderSoft}` }}>
                {/* User's email pinned at the top, gently highlighted */}
                <InboxRow sender={sender || 'Sender'} subject={subject || '(no subject)'} preview={preview} time={timeNow()} unread highlight />
                {NEIGHBOR_ROWS.map((r, i) => (
                    <InboxRow key={i} sender={r.sender} subject={r.subject} preview={r.preview} time={r.time} unread={i < 4} />
                ))}
            </div>
        </div>
    );
}

// ─── Opened view ─────────────────────────────────────────────────────────────

function OpenedToolbar() {
    const ic = (i: React.ReactNode) => (
        <button style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'transparent', color: TOK.textSecondary, cursor: 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i}</button>
    );
    return (
        <div style={{ height: 48, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 24, gap: 0 }}>
            {ic(<ArrowLeft size={20} strokeWidth={1.6} />)}
            <span style={{ width: 12 }} />
            {ic(<Archive size={18} strokeWidth={1.6} />)}
            {ic(<AlertOctagon size={18} strokeWidth={1.6} />)}
            {ic(<Trash2 size={18} strokeWidth={1.6} />)}
            <span style={{ width: 12, borderLeft: `1px solid ${TOK.border}`, height: 24, marginLeft: 4, marginRight: 4 }} />
            {ic(<MailOpen size={18} strokeWidth={1.6} />)}
            {ic(<Clock size={18} strokeWidth={1.6} />)}
            {ic(<CheckSquare size={18} strokeWidth={1.6} />)}
            <span style={{ width: 12, borderLeft: `1px solid ${TOK.border}`, height: 24, marginLeft: 4, marginRight: 4 }} />
            {ic(<FolderInput size={18} strokeWidth={1.6} />)}
            {ic(<Tags size={18} strokeWidth={1.6} />)}
            {ic(<MoreVertical size={18} strokeWidth={1.6} />)}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: TOK.textSecondary }}>5 of 337</span>
            <button style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default' }}><ChevronLeft size={16} color={TOK.textSecondary} /></button>
            <button style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'default' }}><ChevronRight size={16} color={TOK.textSecondary} /></button>
        </div>
    );
}

function OpenedView({
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
        <div style={{ flex: 1, background: TOK.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <OpenedToolbar />
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 96px 24px' }}>
                {/* Subject line + pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 22, color: TOK.textPrimary, margin: 0, fontWeight: 400, letterSpacing: -0.2 }}>
                        {subject || '(no subject)'}
                    </h1>
                    <span style={{ background: TOK.pillExternalBg, color: TOK.pillExternalFg, fontSize: 12, padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>
                        External
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: TOK.pillInboxBg, color: TOK.pillInboxFg, fontSize: 12, padding: '3px 10px 3px 12px', borderRadius: 6 }}>
                        Inbox
                        <span style={{ marginLeft: 4, opacity: 0.6 }}>×</span>
                    </span>
                    <div style={{ flex: 1 }} />
                    <Printer size={18} strokeWidth={1.6} color={TOK.textSecondary} />
                    <ExternalLink size={18} strokeWidth={1.6} color={TOK.textSecondary} />
                </div>

                {/* Add to Calendar suggestion */}
                <div style={{ marginTop: 16 }}>
                    <button
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 16px',
                            borderRadius: 999, border: 'none', background: TOK.addToCalendarBg, color: TOK.addToCalendarFg,
                            fontSize: 13, fontWeight: 500, cursor: 'default',
                        }}
                    >
                        <Sparkles size={14} />
                        Add to Calendar
                    </button>
                </div>

                {/* Summarize bar */}
                <div
                    style={{
                        marginTop: 16, height: 48, display: 'flex', alignItems: 'center', gap: 16,
                        background: TOK.summarizeBg, border: `1px solid ${TOK.summarizeBorder}`,
                        borderRadius: 12, paddingLeft: 16, paddingRight: 16, color: TOK.textSecondary, fontSize: 13,
                    }}
                >
                    <Sparkles size={16} color={TOK.textSecondary} />
                    {aiSummary ? <span style={{ color: TOK.textPrimary }}>{aiSummary}</span> : <span>Summarize this email</span>}
                </div>

                {/* Sender row */}
                <div style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div
                        style={{
                            width: 40, height: 40, borderRadius: 999, background: av.bg, color: 'white',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, flexShrink: 0,
                        }}
                    >
                        {av.letter}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: TOK.textPrimary }}>{senderName || senderEmail || 'Sender'}</span>
                            <div style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: TOK.textSecondary }}>{timeNow()} (just now)</span>
                            <Star size={16} color={TOK.textSecondary} />
                            <Smile size={16} color={TOK.textSecondary} />
                            <CornerUpLeft size={16} color={TOK.textSecondary} />
                            <MoreVertical size={16} color={TOK.textSecondary} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 12, color: TOK.textSecondary }}>
                            to me <ChevronDown size={12} />
                        </div>

                        {/* Body */}
                        <div
                            className="prose prose-sm max-w-none"
                            style={{ fontSize: 14, color: TOK.textPrimary, lineHeight: 1.6, marginTop: 24 }}
                            dangerouslySetInnerHTML={{ __html: bodyHtml || '<p style="color:#9CA3AF;font-style:italic">(empty body)</p>' }}
                        />

                        {/* Reply / Forward */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
                            <button
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 24px 0 18px',
                                    borderRadius: 999, border: `1px solid ${TOK.border}`, background: 'white', color: TOK.textPrimary,
                                    fontSize: 14, fontWeight: 500, cursor: 'default',
                                }}
                            >
                                <CornerUpLeft size={16} />
                                Reply
                            </button>
                            <button
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 24px 0 18px',
                                    borderRadius: 999, border: `1px solid ${TOK.border}`, background: 'white', color: TOK.textPrimary,
                                    fontSize: 14, fontWeight: 500, cursor: 'default',
                                }}
                            >
                                <Forward size={16} />
                                Forward
                            </button>
                            <button
                                style={{
                                    width: 36, height: 36, borderRadius: 999, border: `1px solid ${TOK.border}`, background: 'white', cursor: 'default',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: TOK.textSecondary,
                                }}
                            >
                                <Smile size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MacBook chrome + scaling ────────────────────────────────────────────────

const VIRTUAL_W = 1280;
const VIRTUAL_H = 800;

export default function MacbookGmailPreview({
    subject,
    bodyHtml,
    senderName,
    senderEmail,
    inboxPreview,
    aiSummary,
    view,
}: Props) {
    // Auto-scale the 1280×800 virtual UI to whatever container width we get.
    // ResizeObserver is safer than measuring once because the embedded view
    // can resize when the parent expands a sibling (campaign detail page).
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth;
            const next = Math.min(1, w / VIRTUAL_W);
            setScale(next);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Outer device chrome dimensions scale together with the inner UI.
    const bezel = 16;
    const screenW = VIRTUAL_W;
    const screenH = VIRTUAL_H;
    const deviceW = screenW + bezel * 2;
    const deviceH = screenH + bezel * 2 + 28; // bottom lip

    return (
        <div ref={wrapRef} style={{ width: '100%' }}>
            {/* Scaled device — height collapses to scaled value so we don't leave a gap. */}
            <div style={{ height: deviceH * scale, position: 'relative' }}>
                <div
                    style={{
                        width: deviceW, height: deviceH, transform: `scale(${scale})`, transformOrigin: 'top left',
                        position: 'absolute', top: 0, left: 0,
                    }}
                >
                    {/* Aluminum bezel */}
                    <div
                        style={{
                            width: deviceW, height: deviceH, borderRadius: 18,
                            background: 'linear-gradient(180deg, #C7CCD3 0%, #9DA4AD 100%)',
                            padding: bezel, boxSizing: 'border-box',
                            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25), 0 6px 16px rgba(15, 23, 42, 0.15)',
                            position: 'relative',
                        }}
                    >
                        {/* Notch */}
                        <div
                            style={{
                                position: 'absolute', top: bezel, left: '50%', transform: 'translateX(-50%)',
                                width: 180, height: 22, borderRadius: '0 0 14px 14px', background: '#000', zIndex: 2,
                            }}
                        >
                            <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 999, background: '#1F2937' }} />
                        </div>
                        {/* Screen */}
                        <div style={{ width: screenW, height: screenH, background: TOK.bg, borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <GmailHeader />
                            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                <GmailLeftRail />
                                <GmailLeftSidebar />
                                {view === 'inbox' ? (
                                    <InboxView
                                        subject={subject}
                                        sender={senderName || senderEmail || 'Sender'}
                                        preview={inboxPreview || ''}
                                    />
                                ) : (
                                    <OpenedView
                                        subject={subject}
                                        senderName={senderName}
                                        senderEmail={senderEmail}
                                        bodyHtml={bodyHtml}
                                        aiSummary={aiSummary}
                                    />
                                )}
                                <GmailRightRail />
                            </div>
                        </div>
                        {/* Bottom lip */}
                        <div
                            style={{
                                position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                                width: 90, height: 6, borderRadius: '0 0 8px 8px',
                                background: 'linear-gradient(180deg, #6B7280 0%, #9CA3AF 100%)',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

/**
 * SamsungOutlookPreview
 *
 * Pixel-tuned replica of Outlook mobile (Android, Microsoft Outlook) on a
 * Samsung Galaxy 6.1" device chrome in dark mode. Two view modes:
 *
 *   - 'inbox'  → top header (avatar / Inbox / bell / search), Focused/Other
 *                tabs, Filter pill, "Other emails" bundle, message rows
 *                grouped by section (Yesterday / This week / Last week),
 *                Copilot + compose floating actions, bottom Mail / Calendar
 *                / Apps nav. Optional Microsoft 365 sign-in toast.
 *   - 'opened' → back arrow, subject, action toolbar (reply / forward /
 *                trash / mark / more), sender block (avatar + name + date),
 *                body, bottom action bar with Reply dropdown pill + Copilot.
 *
 * Calibrated against Samsung 6" Outlook screenshots provided April 2026.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import {
    Bell,
    Search,
    Mail as MailIcon,
    Calendar,
    LayoutGrid,
    PenSquare,
    ArrowLeft,
    CornerUpLeft,
    Trash2,
    MoreVertical,
    MoreHorizontal,
    ChevronDown,
    ListPlus,
    Sparkles,
} from 'lucide-react';

interface Props {
    subject: string;
    bodyHtml: string;
    senderName: string;
    senderEmail: string;
    inboxPreview?: string;
    /** Predicted Copilot summary, if any. */
    aiSummary?: string;
    view: 'inbox' | 'opened';
}

// ─── Tokens (Outlook Android dark mode) ──────────────────────────────────────

const TOK = {
    bgScreen: '#0F0F0F',
    bgHeader: '#1A1A1A',
    bgPanel: '#1F1F1F',
    bgRow: 'transparent',
    bgPillSelected: '#2C2C2E',
    bgPillUnselected: '#3A3A3C',
    border: '#2A2A2A',
    rowDivider: '#1F1F1F',
    textPrimary: '#FFFFFF',
    textSecondary: '#9E9EA1',
    textTertiary: '#6F6F73',
    outlookBlue: '#3FA0FF',
    outlookBlueDeep: '#1F88E5',
    badgeBlueBg: '#2563EB',
    avatarPalette: [
        { bg: '#00A47C', fg: '#FFFFFF' }, // green
        { bg: '#A862F0', fg: '#FFFFFF' }, // purple
        { bg: '#F0C946', fg: '#1A1A1A' }, // yellow
        { bg: '#C8967A', fg: '#FFFFFF' }, // tan
        { bg: '#EC6F6F', fg: '#FFFFFF' }, // red
        { bg: '#5AB1E5', fg: '#FFFFFF' }, // blue
        { bg: '#A0A0A0', fg: '#FFFFFF' }, // gray
    ],
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function avatarFor(name: string): { bg: string; fg: string; letters: string } {
    const safe = (name || '?').trim();
    const letters = safe
        .split(/\s+/)
        .map((p) => p.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2) || '?';
    let hash = 0;
    for (let i = 0; i < safe.length; i++) hash = (hash * 31 + safe.charCodeAt(i)) | 0;
    const palette = TOK.avatarPalette;
    const sel = palette[Math.abs(hash) % palette.length];
    return { bg: sel.bg, fg: sel.fg, letters };
}

function timeHHMM(): string {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// ─── Status bar (Android) ────────────────────────────────────────────────────

function StatusBar() {
    return (
        <div
            style={{
                height: 36, paddingLeft: 24, paddingRight: 24, display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                color: '#FFFFFF', fontSize: 13, fontWeight: 600, background: TOK.bgScreen,
            }}
        >
            <span>{timeHHMM()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="14" height="10" viewBox="0 0 14 10">
                    {[2, 4, 6, 8].map((h, i) => (
                        <rect key={i} x={i * 3.5} y={10 - h} width="2.4" height={h} rx={0.5} fill="#FFFFFF" />
                    ))}
                </svg>
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M7 9.5l-1.3-1.3a1.8 1.8 0 0 1 2.6 0L7 9.5z" fill="#FFFFFF" />
                    <path d="M3.2 5a5 5 0 0 1 7.6 0" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <path d="M1 2.6a8.5 8.5 0 0 1 12 0" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </svg>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <div style={{ width: 22, height: 11, border: '1px solid #FFFFFF', borderRadius: 2, padding: 1, position: 'relative' }}>
                        <div style={{ width: '70%', height: '100%', background: '#FFFFFF', borderRadius: 1 }} />
                    </div>
                    <div style={{ width: 1.2, height: 4, background: '#FFFFFF', borderRadius: 1 }} />
                </div>
            </div>
        </div>
    );
}

// ─── Copilot rainbow icon ────────────────────────────────────────────────────

function CopilotIcon({ size = 28 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32">
            <defs>
                <linearGradient id="copilot-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#15B5F1" />
                    <stop offset="35%" stopColor="#7B5BF1" />
                    <stop offset="65%" stopColor="#F15BC8" />
                    <stop offset="100%" stopColor="#FFB95B" />
                </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="14" fill="url(#copilot-grad)" />
            <circle cx="16" cy="16" r="11.5" fill={TOK.bgScreen} />
            <path
                d="M9 13c1.4-2 3.5-2.6 5.6-1.4 2.1 1.2 2.7 3.6 1.5 5.7-.6 1-1.4 1.6-2.4 1.9 1.5.5 2.9 1.7 3.5 3.2.7 1.7.2 3.6-1.4 4.5-1.6.9-3.6.4-4.5-1.2-.4-.7-.5-1.4-.5-2.1-.7.4-1.5.6-2.3.6-2.4 0-4.4-2-4.4-4.4 0-2.4 2-4.4 4.4-4.4z"
                fill="url(#copilot-grad)"
                transform="translate(-2 -3)"
                opacity="0.95"
            />
        </svg>
    );
}

// ─── Inbox: header ───────────────────────────────────────────────────────────

function InboxHeader() {
    return (
        <div style={{ background: TOK.bgHeader, paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ height: 56, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Avatar */}
                <div
                    style={{
                        width: 32, height: 32, borderRadius: 999,
                        background: 'linear-gradient(135deg, #FBE4D2 0%, #1F2937 75%)',
                        flexShrink: 0,
                    }}
                />
                <h1 style={{ margin: 0, flex: 1, fontSize: 22, fontWeight: 700, color: TOK.textPrimary }}>Inbox</h1>
                <Bell size={22} color={TOK.textPrimary} strokeWidth={1.7} />
                <Search size={22} color={TOK.textPrimary} strokeWidth={1.7} />
            </div>

            {/* Focused / Other tabs + Filter */}
            <div style={{ height: 52, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        height: 36, padding: '0 18px', borderRadius: 999, background: TOK.bgPillSelected,
                        display: 'inline-flex', alignItems: 'center', fontSize: 14, color: TOK.textPrimary, fontWeight: 600,
                    }}
                >
                    Focused
                </div>
                <div
                    style={{
                        height: 36, padding: '0 22px', borderRadius: 999, background: 'transparent',
                        display: 'inline-flex', alignItems: 'center', fontSize: 14, color: TOK.textSecondary, fontWeight: 500,
                    }}
                >
                    Other
                </div>
                <span style={{ flex: 1 }} />
                <div
                    style={{
                        height: 36, padding: '0 22px', borderRadius: 999, background: TOK.bgPillUnselected,
                        display: 'inline-flex', alignItems: 'center', fontSize: 14, color: TOK.textPrimary, fontWeight: 500,
                    }}
                >
                    Filter
                </div>
            </div>
        </div>
    );
}

// ─── Inbox: rows ─────────────────────────────────────────────────────────────

function OtherEmailsBundle() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: `0.5px solid ${TOK.rowDivider}` }}>
            <div
                style={{
                    width: 44, height: 44, borderRadius: 999, background: '#2A2A2C',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
            >
                <MailIcon size={20} color={TOK.textSecondary} strokeWidth={1.7} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: TOK.textSecondary }}>Other emails</div>
                <div
                    style={{
                        fontSize: 14, color: TOK.textPrimary, marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    JioHome Premiere, Team BankBazaar, Akshay, GOG.CO…
                </div>
            </div>
            <div
                style={{
                    minWidth: 26, height: 22, borderRadius: 4, background: TOK.badgeBlueBg, color: '#FFFFFF',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    paddingLeft: 6, paddingRight: 6,
                }}
            >
                15
            </div>
        </div>
    );
}

function SectionHeader({ label }: { label: string }) {
    return (
        <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 4, fontSize: 12, color: TOK.textSecondary }}>
            {label}
        </div>
    );
}

function MessageRow({
    avatar,
    avatarBg,
    avatarFg,
    sender,
    subject,
    preview,
    date,
    dateBlue = false,
    highlight = false,
}: {
    avatar: string;
    avatarBg: string;
    avatarFg: string;
    sender: string;
    subject: string;
    preview: string;
    date: string;
    dateBlue?: boolean;
    highlight?: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex', gap: 14, padding: '14px 16px 16px',
                borderBottom: `0.5px solid ${TOK.rowDivider}`,
                background: highlight ? 'rgba(63, 160, 255, 0.06)' : 'transparent',
            }}
        >
            <div
                style={{
                    width: 44, height: 44, borderRadius: 999, background: avatarBg,
                    color: avatarFg, fontSize: 14, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
            >
                {avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TOK.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sender}
                    </span>
                    <span style={{ fontSize: 13, color: dateBlue ? TOK.outlookBlue : TOK.textSecondary, fontWeight: 500, flexShrink: 0 }}>
                        {date}
                    </span>
                </div>
                <div
                    style={{
                        fontSize: 14, color: TOK.textPrimary, marginTop: 3, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {subject || <span style={{ fontStyle: 'italic', color: TOK.textSecondary }}>(no subject)</span>}
                </div>
                <div
                    style={{
                        fontSize: 13, color: TOK.textSecondary, marginTop: 3, lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {preview}
                </div>
            </div>
        </div>
    );
}

// ─── Inbox: floating actions + bottom nav + sign-in toast ────────────────────

function InboxFloatingActions() {
    return (
        <div style={{ position: 'absolute', right: 16, bottom: 100, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
                style={{
                    width: 52, height: 52, borderRadius: 14, background: '#2A2A2C',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
            >
                <PenSquare size={22} color={TOK.outlookBlue} strokeWidth={1.7} />
            </div>
            <div
                style={{
                    width: 52, height: 52, borderRadius: 999, padding: 3, background: 'transparent',
                    boxShadow: '0 4px 14px rgba(123, 91, 241, 0.4)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <CopilotIcon size={48} />
            </div>
        </div>
    );
}

function SignInToast() {
    return (
        <div
            style={{
                position: 'absolute', left: 16, right: 16, bottom: 90,
                background: '#262626', borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}
        >
            <span style={{ fontSize: 13, color: TOK.textPrimary, lineHeight: 1.4 }}>
                Please sign in to richardson.simon@zycus.com (Microsoft 365).
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: TOK.outlookBlue, flexShrink: 0 }}>Sign in</span>
        </div>
    );
}

function BottomNav() {
    return (
        <div
            style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                background: TOK.bgScreen, borderTop: `0.5px solid ${TOK.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 18,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <MailIcon size={22} color={TOK.outlookBlue} strokeWidth={2.2} fill={TOK.outlookBlue} />
                <span style={{ fontSize: 11, color: TOK.outlookBlue, fontWeight: 600 }}>Mail</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 22, height: 22, border: `2px solid ${TOK.textSecondary}`, borderRadius: 4, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: TOK.textSecondary }}>
                    25
                </div>
                <span style={{ fontSize: 11, color: TOK.textSecondary, fontWeight: 500 }}>Calendar</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <LayoutGrid size={22} color={TOK.textSecondary} strokeWidth={2} />
                <span style={{ fontSize: 11, color: TOK.textSecondary, fontWeight: 500 }}>Apps</span>
            </div>
        </div>
    );
}

// ─── Inbox: composition ──────────────────────────────────────────────────────

const NEIGHBORS_TODAY = [
    { sender: 'Federal Bank', subject: 'Important Update Regarding Fi App Services', preview: 'Dear RICHARDSON, Greetings from Federal Bank!! Thank you for…', date: '15:51', dateBlue: true, avatar: 'FB', avatarBg: '#00A47C', avatarFg: '#FFFFFF' },
];
const NEIGHBORS_YESTERDAY = [
    { sender: 'PayPal Communications', subject: "We're making some changes to our PayPal legal agreements", preview: 'Richardson Eugin Simon, you can view the changes on our websi…', date: 'Yesterday', dateBlue: true, avatar: 'PC', avatarBg: '#A862F0', avatarFg: '#FFFFFF' },
];
const NEIGHBORS_WEEK = [
    { sender: 'Federal Bank', subject: 'Important Update Regarding Fi App Services', preview: 'Dear RICHARDSON, Greetings from Federal Bank!! Thank you for…', date: 'Wed', dateBlue: true, avatar: 'FB', avatarBg: '#00A47C', avatarFg: '#FFFFFF' },
    { sender: 'BlaBlaCar', subject: 'Change your password', preview: 'You can now change your password. Just click below. Change m…', date: 'Tue', dateBlue: false, avatar: 'B', avatarBg: '#A0A0A0', avatarFg: '#FFFFFF' },
    { sender: 'NSDL Helpdesk', subject: 'Policy Updation', preview: 'Dear RICHARDSON EUGIN SIMON, The details of the policy havin…', date: 'Mon', dateBlue: true, avatar: 'NH', avatarBg: '#C8967A', avatarFg: '#FFFFFF' },
];
const NEIGHBORS_LASTWEEK = [
    { sender: 'NSDL NIR', subject: 'Your Statement of Insurance Policies (SoIP) as on 31st Mar…', preview: 'Thanks for holding your e-Insurance Account with NSDL Nationa…', date: '15 Apr', dateBlue: true, avatar: 'NN', avatarBg: '#F0C946', avatarFg: '#1A1A1A' },
];

function OutlookMobileInbox({
    subject,
    senderName,
    senderEmail,
    preview,
}: {
    subject: string;
    senderName: string;
    senderEmail: string;
    preview: string;
}) {
    const av = avatarFor(senderName || senderEmail);
    return (
        <div style={{ position: 'relative', flex: 1, background: TOK.bgScreen, overflow: 'hidden' }}>
            <InboxHeader />
            <div style={{ overflowY: 'auto', height: 'calc(100% - 168px - 80px)', paddingBottom: 110 }}>
                <OtherEmailsBundle />
                {/* User's email pinned at the top of "Today" (no header per the screenshot) */}
                <MessageRow
                    sender={senderName || senderEmail || 'Sender'}
                    subject={subject || '(no subject)'}
                    preview={preview || ''}
                    date={timeHHMM()}
                    dateBlue
                    avatar={av.letters}
                    avatarBg={av.bg}
                    avatarFg={av.fg}
                    highlight
                />
                {NEIGHBORS_TODAY.map((n, i) => (
                    <MessageRow key={`t${i}`} {...n} />
                ))}

                <SectionHeader label="Yesterday" />
                {NEIGHBORS_YESTERDAY.map((n, i) => <MessageRow key={`y${i}`} {...n} />)}

                <SectionHeader label="This week" />
                {NEIGHBORS_WEEK.map((n, i) => <MessageRow key={`w${i}`} {...n} />)}

                <SectionHeader label="Last week" />
                {NEIGHBORS_LASTWEEK.map((n, i) => <MessageRow key={`l${i}`} {...n} />)}
            </div>
            <SignInToast />
            <InboxFloatingActions />
            <BottomNav />
        </div>
    );
}

// ─── Opened view ─────────────────────────────────────────────────────────────

function OpenedTopBar() {
    return (
        <div
            style={{
                background: TOK.bgHeader, height: 64, display: 'flex', alignItems: 'center',
                paddingLeft: 12, paddingRight: 12,
            }}
        >
            <div style={{ width: 48, height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={24} color={TOK.textPrimary} strokeWidth={1.8} />
            </div>
        </div>
    );
}

function ActionToolbar() {
    const ic = (i: React.ReactNode) => (
        <div style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {i}
        </div>
    );
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 12 }}>
            {ic(<CornerUpLeft size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
            {ic(<ChevronDown size={14} color={TOK.textPrimary} strokeWidth={2} />)}
            <span style={{ fontSize: 14, color: TOK.textPrimary, fontWeight: 500, marginLeft: 4 }}>Reply</span>
            <span style={{ flex: 1 }} />
            {ic(
                <div style={{ position: 'relative', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MailIcon size={20} color={TOK.textPrimary} strokeWidth={1.8} />
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: 999, background: '#FFFFFF' }} />
                </div>,
            )}
            {ic(<Trash2 size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
            {ic(<ListPlus size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
            {ic(<MoreHorizontal size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
        </div>
    );
}

function OpenedSubject({ subject }: { subject: string }) {
    return (
        <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 0, paddingBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: TOK.textPrimary, lineHeight: 1.25, letterSpacing: -0.2 }}>
                {subject || '(no subject)'}
            </h1>
        </div>
    );
}

function OpenedSenderRow({ senderName, senderEmail }: { senderName: string; senderEmail: string }) {
    const av = avatarFor(senderName || senderEmail);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px 16px' }}>
            <div
                style={{
                    width: 44, height: 44, borderRadius: 999, background: av.bg, color: av.fg,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700,
                }}
            >
                {av.letters}
            </div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: TOK.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {senderName || senderEmail || 'Sender'}
            </span>
            <span style={{ fontSize: 14, color: TOK.outlookBlue, fontWeight: 500 }}>{(() => {
                const d = new Date();
                return d.toLocaleString('en-US', { day: 'numeric', month: 'short' });
            })()}</span>
            <MoreVertical size={18} color={TOK.textSecondary} strokeWidth={1.8} />
        </div>
    );
}

function OpenedBottomBar() {
    const ic = (i: React.ReactNode) => (
        <div style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i}</div>
    );
    return (
        <div
            style={{
                position: 'absolute', bottom: 16, left: 16, right: 16,
                background: '#1F1F1F', borderRadius: 999, padding: '8px 8px 8px 12px',
                display: 'flex', alignItems: 'center', gap: 4,
                border: `1px solid ${TOK.border}`,
            }}
        >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CornerUpLeft size={20} color={TOK.textPrimary} strokeWidth={1.8} />
                <ChevronDown size={14} color={TOK.textPrimary} strokeWidth={2} />
                <span style={{ fontSize: 14, color: TOK.textPrimary, fontWeight: 500, marginLeft: 4 }}>Reply</span>
            </div>
            <span style={{ flex: 1 }} />
            {ic(
                <div style={{ position: 'relative', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MailIcon size={20} color={TOK.textPrimary} strokeWidth={1.8} />
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: 999, background: '#FFFFFF' }} />
                </div>,
            )}
            {ic(<Trash2 size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
            {ic(<ListPlus size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
            {ic(<MoreHorizontal size={20} color={TOK.textPrimary} strokeWidth={1.8} />)}
            <div
                style={{
                    width: 38, height: 38, borderRadius: 999, marginLeft: 4,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <CopilotIcon size={36} />
            </div>
        </div>
    );
}

function OutlookMobileOpened({
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
    return (
        <div style={{ position: 'relative', flex: 1, background: TOK.bgScreen, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <OpenedTopBar />
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
                <div style={{ paddingTop: 14 }}>
                    <OpenedSubject subject={subject} />
                </div>
                <ActionToolbar />
                <OpenedSenderRow senderName={senderName} senderEmail={senderEmail} />

                {aiSummary && (
                    <div
                        style={{
                            margin: '0 16px 12px', padding: '10px 14px', borderRadius: 12,
                            background: 'rgba(63, 160, 255, 0.10)', border: '1px solid rgba(63, 160, 255, 0.22)',
                            fontSize: 13, color: TOK.textPrimary,
                        }}
                    >
                        <div style={{ fontSize: 10, color: TOK.outlookBlue, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                            Copilot Summary
                        </div>
                        {aiSummary}
                    </div>
                )}

                <div
                    className="prose prose-sm max-w-none"
                    style={{ color: TOK.textPrimary, fontSize: 16, lineHeight: 1.6, padding: '8px 16px 24px' }}
                    dangerouslySetInnerHTML={{ __html: bodyHtml || '<p style="color:#9CA3AF;font-style:italic">(empty body)</p>' }}
                />
            </div>
            <OpenedBottomBar />
        </div>
    );
}

// ─── Samsung Galaxy chrome + scaling ─────────────────────────────────────────

const VIRTUAL_W = 393;
const VIRTUAL_H = 852;

export default function SamsungOutlookPreview({
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
            const target = VIRTUAL_W + 32;
            setScale(Math.min(1, w / target));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const bezel = 10;
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
                    {/* Galaxy bezel — slimmer, more rectangular than iPhone */}
                    <div
                        style={{
                            width: deviceW, height: deviceH, borderRadius: 48,
                            background: 'linear-gradient(180deg, #1A1A1D 0%, #0A0A0C 100%)',
                            padding: bezel, boxSizing: 'border-box',
                            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.3)',
                            position: 'relative',
                        }}
                    >
                        {/* Side buttons (Samsung has volume on left, power on right) */}
                        <div style={{ position: 'absolute', left: -2, top: 130, width: 4, height: 80, background: '#0A0A0C', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', left: -2, top: 220, width: 4, height: 50, background: '#0A0A0C', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', right: -2, top: 170, width: 4, height: 70, background: '#0A0A0C', borderRadius: 2 }} />

                        {/* Screen */}
                        <div
                            style={{
                                width: screenW, height: screenH, background: TOK.bgScreen, borderRadius: 38,
                                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
                            }}
                        >
                            {/* Center punch-hole camera */}
                            <div
                                style={{
                                    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                                    width: 12, height: 12, borderRadius: 999, background: '#000', zIndex: 10,
                                    boxShadow: '0 0 0 1.5px #1F1F1F',
                                }}
                            />

                            <StatusBar />

                            {view === 'inbox' ? (
                                <OutlookMobileInbox
                                    subject={subject}
                                    senderName={senderName}
                                    senderEmail={senderEmail}
                                    preview={inboxPreview || ''}
                                />
                            ) : (
                                <OutlookMobileOpened
                                    subject={subject}
                                    senderName={senderName}
                                    senderEmail={senderEmail}
                                    bodyHtml={bodyHtml}
                                    aiSummary={aiSummary}
                                />
                            )}

                            {/* Android gesture bar */}
                            <div
                                style={{
                                    position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                                    width: 110, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.7)', zIndex: 20,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

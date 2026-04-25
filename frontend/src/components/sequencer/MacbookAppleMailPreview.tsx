'use client';

/**
 * MacbookAppleMailPreview
 *
 * Pixel-tuned replica of Apple Mail on macOS in dark mode, wrapped in a
 * MacBook Air 13" device chrome. Three-pane layout matching the calibration
 * screenshots: sidebar (Favorites + Smart Mailboxes + per-account folders) ·
 * message list (sender / time / subject / 3-line preview) · reading pane
 * (avatar + sender + subject + body).
 *
 * Two view modes:
 *   - 'inbox'  → reading pane shows "No Message Selected"; user's email is
 *                the highlighted top row in the message list with neighbor
 *                rows for visual context.
 *   - 'opened' → reading pane shows the user's email in full.
 *
 * Calibrated against macOS Mail 16 dark-mode screenshots (April 2026).
 */

import { useLayoutEffect, useRef, useState } from 'react';
import {
    PanelLeft,
    Filter,
    MoreHorizontal,
    PenSquare,
    CornerUpLeft,
    Forward,
    Archive,
    Trash2,
    AlertOctagon,
    FolderInput,
    Flag,
    ChevronDown,
    Search,
    Folder,
    AlertTriangle,
    ChevronRight,
    Send,
    File as FileIcon,
    Mailbox,
    Inbox as InboxIcon,
} from 'lucide-react';

interface Props {
    subject: string;
    bodyHtml: string;
    senderName: string;
    senderEmail: string;
    inboxPreview?: string;
    /** Predicted Apple Intelligence summary, if available. */
    aiSummary?: string;
    view: 'inbox' | 'opened';
}

// ─── Tokens (dark mode) ──────────────────────────────────────────────────────

const TOK = {
    bgDeep: '#1C1C1E',
    bgPanel: '#252526',
    bgSidebar: '#2A2A2C',
    bgList: '#1C1C1E',
    bgReading: '#1C1C1E',
    border: '#2D2D2F',
    borderSoft: '#252526',
    textPrimary: '#FFFFFF',
    textSecondary: '#9E9E9E',
    textTertiary: '#6F6F73',
    textLabel: '#A4A4A8',
    sidebarSelectedBg: '#1F4FB6',
    sidebarSelectedFg: '#FFFFFF',
    listSelectedBg: '#2A6BD6',
    listSelectedFg: '#FFFFFF',
    unreadDot: '#5AC8FA',
    flag: '#FF9500',
    folderBlue: '#5E9DF6',
    warningAmber: '#FFB800',
    avatarPalette: ['#7AB7E5', '#F4B400', '#0F9D58', '#DB4437', '#AB47BC', '#26A69A', '#FF7043', '#5C6BC0'],
};

// ─── Utils ───────────────────────────────────────────────────────────────────

function avatarFor(name: string): { bg: string; letters: string } {
    const safe = (name || '?').trim();
    const letters = safe
        .split(/\s+/)
        .map((p) => p.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2) || '?';
    let hash = 0;
    for (let i = 0; i < safe.length; i++) hash = (hash * 31 + safe.charCodeAt(i)) | 0;
    const palette = TOK.avatarPalette;
    return { bg: palette[Math.abs(hash) % palette.length], letters };
}

function timeShort(): string {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function dateLong(): string {
    const d = new Date();
    return d.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

// Realistic message-list neighbors so the user sees their email in real context.
const NEIGHBORS: { sender: string; subject: string; preview: string; time: string; unread?: boolean }[] = [
    { sender: 'Crunchyroll', subject: 'Please Confirm Your Account', preview: 'Please Confirm Your Account Confirm Your Cr…', time: '4/11/26' },
    { sender: 'Razorpay Support', subject: 'Reset your Razorpay password', preview: 'Password Reset To reset your password, click her…', time: '3/23/26' },
    { sender: 'Supabase', subject: 'Welcome to Supabase', preview: 'Hey there, Welcome to Supabase, the Postgres…', time: '11/8/25', unread: true },
    { sender: 'Supabase', subject: 'Confirm your email and start building', preview: 'Confirm your email address to start building…', time: '11/8/25' },
    { sender: 'noreply@validator', subject: 'richsamven12 has requested', preview: 'Document Request Hello, richsamven12 has reques…', time: '10/20/25' },
    { sender: 'Shop101 Support', subject: 'GST report | September 2025', preview: 'Dear Shop6621847, Please find attached the GST re…', time: '10/10/25' },
    { sender: 'Shopify Partners', subject: 'Request for Seller Permissions', preview: 'We are updating our records and noticed that…', time: '9/16/25' },
];

// ─── Window traffic lights ───────────────────────────────────────────────────

function TrafficLights() {
    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: '#FF5F57', border: '0.5px solid rgba(0,0,0,0.2)' }} />
            <span style={{ width: 12, height: 12, borderRadius: 999, background: '#FEBC2E', border: '0.5px solid rgba(0,0,0,0.2)' }} />
            <span style={{ width: 12, height: 12, borderRadius: 999, background: '#28C840', border: '0.5px solid rgba(0,0,0,0.2)' }} />
        </div>
    );
}

// ─── Top toolbar ─────────────────────────────────────────────────────────────

function ToolbarButton({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                width: 32, height: 28, borderRadius: 6,
                background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: TOK.textSecondary,
            }}
        >
            {children}
        </div>
    );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                background: '#2D2D2F', borderRadius: 7, padding: '2px 4px',
            }}
        >
            {children}
        </div>
    );
}

function AppleMailToolbar({ folderName, totals, view }: { folderName: string; totals: string; view: 'inbox' | 'opened' }) {
    return (
        <div
            style={{
                height: 88, paddingLeft: 12, paddingRight: 12, display: 'flex', alignItems: 'center', gap: 8,
                background: TOK.bgPanel, borderBottom: `1px solid ${TOK.border}`,
            }}
        >
            {/* Traffic lights */}
            <div style={{ width: 78, paddingLeft: 6 }}>
                <TrafficLights />
            </div>

            {/* Sidebar toggle */}
            <ToolbarButton>
                <PanelLeft size={16} strokeWidth={1.6} />
            </ToolbarButton>

            <span style={{ width: 8 }} />

            {/* Folder title block */}
            <div style={{ width: 232, paddingLeft: 8, paddingRight: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TOK.textPrimary, lineHeight: 1.1 }}>{folderName}</div>
                <div style={{ fontSize: 11, color: TOK.textSecondary, marginTop: 2 }}>{totals}</div>
            </div>

            {/* List actions */}
            <ToolbarGroup>
                <ToolbarButton><Filter size={14} strokeWidth={1.7} /></ToolbarButton>
                <span style={{ width: 1, height: 16, background: TOK.border }} />
                <ToolbarButton><MoreHorizontal size={14} strokeWidth={1.7} /></ToolbarButton>
            </ToolbarGroup>

            <span style={{ width: 8 }} />

            {/* Compose */}
            <ToolbarButton><PenSquare size={16} strokeWidth={1.6} /></ToolbarButton>

            <span style={{ flex: 1 }} />

            {/* Reply group */}
            <ToolbarGroup>
                <ToolbarButton><CornerUpLeft size={14} strokeWidth={1.7} /></ToolbarButton>
                <span style={{ width: 1, height: 16, background: TOK.border }} />
                <ToolbarButton>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
                    </svg>
                </ToolbarButton>
                <span style={{ width: 1, height: 16, background: TOK.border }} />
                <ToolbarButton><Forward size={14} strokeWidth={1.7} /></ToolbarButton>
            </ToolbarGroup>

            <span style={{ width: 8 }} />

            {/* Archive group */}
            <ToolbarGroup>
                <ToolbarButton><Archive size={14} strokeWidth={1.7} /></ToolbarButton>
                <span style={{ width: 1, height: 16, background: TOK.border }} />
                <ToolbarButton><Trash2 size={14} strokeWidth={1.7} /></ToolbarButton>
                <span style={{ width: 1, height: 16, background: TOK.border }} />
                <ToolbarButton><AlertOctagon size={14} strokeWidth={1.7} /></ToolbarButton>
            </ToolbarGroup>

            <span style={{ width: 8 }} />

            <ToolbarButton><FolderInput size={14} strokeWidth={1.7} /></ToolbarButton>

            <span style={{ width: 8 }} />

            {/* Flag group */}
            <ToolbarGroup>
                <div style={{ width: 32, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flag size={14} strokeWidth={1.7} fill={TOK.flag} color={TOK.flag} />
                </div>
                <span style={{ width: 1, height: 16, background: TOK.border }} />
                <ToolbarButton><ChevronDown size={12} strokeWidth={1.7} /></ToolbarButton>
            </ToolbarGroup>

            <span style={{ width: 16 }} />

            {/* Search */}
            <div
                style={{
                    width: 320, height: 28, borderRadius: 7,
                    background: '#2D2D2F', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 10,
                }}
            >
                <Search size={13} color={TOK.textSecondary} strokeWidth={1.7} />
                <span style={{ fontSize: 12, color: TOK.textSecondary }}>Search</span>
            </div>
        </div>
    );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: TOK.textTertiary, paddingLeft: 14, paddingBottom: 6, letterSpacing: 0.2 }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function SidebarRow({
    icon,
    label,
    count,
    selected,
    expandable,
    expanded,
    warning,
    indent = 0,
}: {
    icon: React.ReactNode;
    label: string;
    count?: number;
    selected?: boolean;
    expandable?: boolean;
    expanded?: boolean;
    warning?: boolean;
    indent?: number;
}) {
    return (
        <div
            style={{
                height: 28, paddingLeft: 14 + indent, paddingRight: 12, display: 'flex', alignItems: 'center', gap: 6,
                background: selected ? TOK.sidebarSelectedBg : 'transparent',
                color: selected ? TOK.sidebarSelectedFg : TOK.textPrimary,
                fontSize: 13, fontWeight: 400, marginRight: 8, marginLeft: 8, borderRadius: 6,
            }}
        >
            {expandable && (
                <span style={{ width: 12, color: TOK.textSecondary }}>
                    {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </span>
            )}
            <span style={{ width: 18, color: selected ? TOK.sidebarSelectedFg : TOK.folderBlue, display: 'inline-flex' }}>{icon}</span>
            <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{label}</span>
            {warning && <AlertTriangle size={11} color={TOK.warningAmber} />}
            {count !== undefined && (
                <span style={{ fontSize: 12, color: selected ? '#D1E0FF' : TOK.textSecondary, marginLeft: 4 }}>
                    {count}
                </span>
            )}
        </div>
    );
}

function AppleMailSidebar() {
    return (
        <div
            style={{
                width: 264, background: TOK.bgSidebar, paddingTop: 24, paddingBottom: 24,
                overflowY: 'auto', borderRight: `1px solid ${TOK.border}`,
                pointerEvents: 'none',
            }}
        >
            <SidebarSection title="Favorites">
                <SidebarRow icon={<Folder size={14} fill={TOK.folderBlue} color={TOK.folderBlue} />} label="A" count={507} expandable warning />
                <SidebarRow icon={<FileIcon size={14} />} label="All Drafts" count={1} expandable />
                <SidebarRow icon={<Send size={14} />} label="Sent" />
            </SidebarSection>

            <SidebarSection title="Smart Mailboxes">
                <SidebarRow icon={<Mailbox size={14} />} label="iCloud" />
            </SidebarSection>

            <SidebarSection title="Google">
                <SidebarRow icon={<InboxIcon size={14} />} label="Inbox" warning />
            </SidebarSection>

            <SidebarSection title="kesutowannabe…">
                <SidebarRow icon={<Folder size={14} fill={TOK.folderBlue} color={TOK.folderBlue} />} label="Important" count={32} selected />
                <SidebarRow icon={<InboxIcon size={14} />} label="Inbox" count={507} />
                <SidebarRow icon={<FileIcon size={14} />} label="Drafts" count={1} />
                <SidebarRow icon={<Send size={14} />} label="Sent" />
                <SidebarRow icon={<Archive size={14} />} label="Junk" count={3} />
                <SidebarRow icon={<Trash2 size={14} />} label="Trash" />
                <SidebarRow icon={<Archive size={14} />} label="Archive" count={507} />
            </SidebarSection>
        </div>
    );
}

// ─── Message list ────────────────────────────────────────────────────────────

function MessageRow({
    sender,
    subject,
    preview,
    time,
    unread = false,
    selected = false,
    highlight = false,
}: {
    sender: string;
    subject: string;
    preview: string;
    time: string;
    unread?: boolean;
    selected?: boolean;
    highlight?: boolean;
}) {
    const titleColor = selected ? '#FFFFFF' : highlight ? '#FFFFFF' : TOK.textPrimary;
    const senderColor = selected ? '#FFFFFF' : TOK.textPrimary;
    const previewColor = selected ? 'rgba(255,255,255,0.85)' : TOK.textSecondary;
    const timeColor = selected ? 'rgba(255,255,255,0.85)' : TOK.textSecondary;
    const bg = selected ? TOK.listSelectedBg : 'transparent';
    return (
        <div
            style={{
                padding: '10px 12px 12px 12px', borderBottom: `0.5px solid ${TOK.border}`,
                background: bg, display: 'flex', gap: 8,
            }}
        >
            {/* Unread dot */}
            <div style={{ width: 8, paddingTop: 6 }}>
                {unread && <div style={{ width: 7, height: 7, borderRadius: 999, background: TOK.unreadDot }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: senderColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sender}
                    </span>
                    <span style={{ fontSize: 12, color: timeColor, flexShrink: 0 }}>{time}</span>
                </div>
                <div
                    style={{
                        fontSize: 13, color: titleColor, marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: unread ? 500 : 400,
                    }}
                >
                    {subject || <span style={{ fontStyle: 'italic', color: previewColor }}>(no subject)</span>}
                </div>
                <div
                    style={{
                        fontSize: 12, color: previewColor, marginTop: 2, lineHeight: 1.35,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {preview || ' '}
                </div>
            </div>
        </div>
    );
}

function MessageList({
    subject,
    sender,
    preview,
    selected,
}: {
    subject: string;
    sender: string;
    preview: string;
    selected: boolean;
}) {
    return (
        <div
            style={{
                width: 352, background: TOK.bgList, borderRight: `1px solid ${TOK.border}`, overflowY: 'auto',
                pointerEvents: 'none',
            }}
        >
            <MessageRow
                sender={sender || 'Sender'}
                subject={subject || '(no subject)'}
                preview={preview}
                time={timeShort()}
                unread
                selected={selected}
                highlight={!selected}
            />
            {NEIGHBORS.map((n, i) => (
                <MessageRow
                    key={i}
                    sender={n.sender}
                    subject={n.subject}
                    preview={n.preview}
                    time={n.time}
                    unread={n.unread}
                />
            ))}
        </div>
    );
}

// ─── Reading pane ────────────────────────────────────────────────────────────

function ReadingPaneEmpty() {
    return (
        <div
            style={{
                flex: 1, background: TOK.bgReading, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#5C5C60', fontSize: 28, fontWeight: 300, letterSpacing: -0.2,
            }}
        >
            No Message Selected
        </div>
    );
}

function ReadingPane({
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
        <div style={{ flex: 1, background: TOK.bgReading, overflowY: 'auto' }}>
            <div style={{ padding: '20px 32px 24px 28px' }}>
                {/* Top row: avatar + sender meta — date + Important pill aligned right */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div
                        style={{
                            width: 36, height: 36, borderRadius: 999, background: '#3A3A3C',
                            color: TOK.textPrimary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 600, flexShrink: 0,
                        }}
                    >
                        {av.letters}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: TOK.textPrimary }}>{senderName || senderEmail || 'Sender'}</div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: TOK.textPrimary, marginTop: 2, letterSpacing: -0.2, lineHeight: 1.2 }}>
                                    {subject || '(no subject)'}
                                </div>
                                <div style={{ fontSize: 13, color: TOK.textSecondary, marginTop: 6 }}>
                                    To:{' '}
                                    <span style={{ color: TOK.textSecondary }}>kesutowannabe@gmail.com</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: TOK.textSecondary }}>
                                    <Folder size={12} fill={TOK.folderBlue} color={TOK.folderBlue} />
                                    Important
                                </div>
                                <div style={{ fontSize: 12, color: TOK.textSecondary }}>{dateLong()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apple Intelligence summary (if any) */}
                {aiSummary && (
                    <div
                        style={{
                            marginTop: 20, marginLeft: 52, padding: '10px 14px', borderRadius: 10,
                            background: 'rgba(94, 157, 246, 0.12)', border: '1px solid rgba(94, 157, 246, 0.25)',
                            fontSize: 13, color: TOK.textPrimary,
                        }}
                    >
                        <div style={{ fontSize: 10, color: TOK.folderBlue, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                            Apple Intelligence
                        </div>
                        {aiSummary}
                    </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: TOK.border, marginTop: 20, marginBottom: 20 }} />

                {/* Body */}
                <div
                    className="prose prose-sm max-w-none"
                    style={{ color: TOK.textPrimary, fontSize: 14, lineHeight: 1.7, paddingLeft: 4 }}
                    dangerouslySetInnerHTML={{ __html: bodyHtml || '<p style="color:#9CA3AF;font-style:italic">(empty body)</p>' }}
                />
            </div>
        </div>
    );
}

// ─── MacBook chrome + scaling ────────────────────────────────────────────────

const VIRTUAL_W = 1280;
const VIRTUAL_H = 800;

export default function MacbookAppleMailPreview({
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
            setScale(Math.min(1, w / VIRTUAL_W));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const bezel = 16;
    const screenW = VIRTUAL_W;
    const screenH = VIRTUAL_H;
    const deviceW = screenW + bezel * 2;
    const deviceH = screenH + bezel * 2 + 28;

    // Inbox view = no message selected; opened view = email shown.
    const folderName = view === 'opened' ? 'Important — kesuto…' : 'Inbox — kesutowan…';
    const totals = view === 'opened' ? '275 messages, 32 unread' : '930 messages, 513 unread';

    return (
        <div ref={wrapRef} style={{ width: '100%' }}>
            <div style={{ height: deviceH * scale, position: 'relative' }}>
                <div
                    style={{
                        width: deviceW, height: deviceH, transform: `scale(${scale})`, transformOrigin: 'top left',
                        position: 'absolute', top: 0, left: 0,
                    }}
                >
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
                        <div
                            style={{
                                width: screenW, height: screenH, background: TOK.bgDeep, borderRadius: 4,
                                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            }}
                        >
                            <AppleMailToolbar folderName={folderName} totals={totals} view={view} />
                            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                <AppleMailSidebar />
                                <MessageList
                                    subject={subject}
                                    sender={senderName || senderEmail || 'Sender'}
                                    preview={inboxPreview || ''}
                                    selected={view === 'opened'}
                                />
                                {view === 'opened' ? (
                                    <ReadingPane
                                        subject={subject}
                                        senderName={senderName}
                                        senderEmail={senderEmail}
                                        bodyHtml={bodyHtml}
                                        aiSummary={aiSummary}
                                    />
                                ) : (
                                    <ReadingPaneEmpty />
                                )}
                            </div>
                        </div>

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

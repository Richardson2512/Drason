'use client';

/**
 * IphoneAppleMailPreview
 *
 * Pixel-tuned replica of Apple Mail on iOS 18 dark mode, wrapped in an
 * iPhone 6.1" device chrome. Two view modes:
 *
 *   - 'inbox'  → large "Inbox" title, search bar, message rows with
 *                building-block avatars, bottom "Checking for Mail…" status
 *                bar with filter + compose icons.
 *   - 'opened' → top nav with up/down arrows, mailing-list banner with
 *                Unsubscribe link, sender block (To/Reply To rows), subject,
 *                body in a dark card, bottom action toolbar.
 *
 * Calibrated against iPhone 6.1" screenshots provided April 2026.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    MoreHorizontal,
    Search,
    Mic,
    SlidersHorizontal,
    PenSquare,
    Archive,
    Folder,
    CornerUpLeft,
    HelpCircle,
    X,
    Building2,
} from 'lucide-react';

interface Props {
    subject: string;
    bodyHtml: string;
    senderName: string;
    senderEmail: string;
    inboxPreview?: string;
    /** Predicted Apple Intelligence summary, if any. */
    aiSummary?: string;
    view: 'inbox' | 'opened';
}

// ─── Tokens (iOS dark mode) ──────────────────────────────────────────────────

const TOK = {
    bgScreen: '#000000',
    bgPanel: '#1C1C1E',
    bgSearch: '#1C1C1E',
    bgRow: 'transparent',
    bgBodyCard: '#161618',
    bgBottomBar: '#1C1C1E',
    border: '#1F1F1F',
    rowDivider: '#1F1F1F',
    textPrimary: '#FFFFFF',
    textSecondary: '#9A9A9D',
    textTertiary: '#6F6F73',
    iosBlue: '#0A84FF',
    unreadDot: '#0A84FF',
    avatarBlueBg: '#7BA8E8',
    avatarPurpleBg: '#8E59E5',
    avatarYellowBg: '#DAA63B',
    avatarGrayBg: '#48484A',
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function timeShort(): string {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes();
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')}`;
}

function dateDDMMYY(): string {
    const d = new Date();
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yy = (d.getFullYear() % 100).toString().padStart(2, '0');
    return `${dd}/${mm}/${yy}`;
}

// ─── Status bar ──────────────────────────────────────────────────────────────

function StatusBar() {
    return (
        <div
            style={{
                height: 54, paddingLeft: 24, paddingRight: 24, display: 'flex',
                alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 8,
                color: '#FFFFFF', fontSize: 16, fontWeight: 600,
            }}
        >
            <span>{timeShort()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="18" height="11" viewBox="0 0 18 11">
                    {[3, 5, 7, 9].map((h, i) => (
                        <rect key={i} x={i * 4} y={11 - h} width="3" height={h} rx={0.5} fill="#FFFFFF" />
                    ))}
                </svg>
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <path d="M8 9.5l-1.5-1.5a2 2 0 0 1 3 0L8 9.5z" fill="#FFFFFF" />
                    <path d="M3.5 5a6 6 0 0 1 9 0" stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                    <path d="M1 2.5a10 10 0 0 1 14 0" stroke="#FFFFFF" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </svg>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <div style={{ width: 24, height: 12, border: '1.2px solid #FFFFFF', borderRadius: 3, padding: 1, position: 'relative' }}>
                        <div style={{ width: '40%', height: '100%', background: '#FFFFFF', borderRadius: 1 }} />
                        <span style={{ position: 'absolute', top: -1, left: 2, fontSize: 8, fontWeight: 700, color: '#000', letterSpacing: -0.5 }}>2</span>
                    </div>
                    <div style={{ width: 1.5, height: 4, background: '#FFFFFF', borderRadius: 1 }} />
                </div>
            </div>
        </div>
    );
}

// ─── Inbox: toolbar ──────────────────────────────────────────────────────────

function InboxNavBar() {
    return (
        <div
            style={{
                height: 44, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', color: TOK.iosBlue, fontSize: 17,
            }}
        >
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ChevronLeft size={22} strokeWidth={2.5} />
                <span style={{ fontSize: 17, fontWeight: 500, marginLeft: -2 }}>Mailboxes</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        height: 30, padding: '0 14px', borderRadius: 999, background: '#2A2A2C',
                        display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 500, color: TOK.iosBlue,
                    }}
                >
                    Select
                </div>
                <div
                    style={{
                        width: 30, height: 30, borderRadius: 999, background: '#2A2A2C',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <MoreHorizontal size={16} color={TOK.iosBlue} strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
}

function InboxLargeTitle() {
    return (
        <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 4, paddingBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, color: TOK.textPrimary, letterSpacing: -0.4 }}>Inbox</h1>
        </div>
    );
}

function InboxSearchBar() {
    return (
        <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 14 }}>
            <div
                style={{
                    height: 36, borderRadius: 10, background: TOK.bgSearch, display: 'flex',
                    alignItems: 'center', paddingLeft: 12, paddingRight: 10, gap: 8,
                }}
            >
                <Search size={15} color={TOK.textSecondary} strokeWidth={2.2} />
                <span style={{ flex: 1, fontSize: 16, color: TOK.textSecondary }}>Search</span>
                <Mic size={15} color={TOK.textSecondary} strokeWidth={2} />
            </div>
        </div>
    );
}

// ─── Inbox: rows ─────────────────────────────────────────────────────────────

function BuildingAvatar({ bg }: { bg: string }) {
    return (
        <div
            style={{
                width: 40, height: 40, borderRadius: 10, background: bg,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
        >
            <Building2 size={22} color="#FFFFFF" strokeWidth={1.7} />
        </div>
    );
}

function MessageRow({
    sender,
    subject,
    preview,
    date,
    unread = true,
    avatarBg,
    highlight = false,
}: {
    sender: string;
    subject: string;
    preview: string;
    date: string;
    unread?: boolean;
    avatarBg: string;
    highlight?: boolean;
}) {
    return (
        <div style={{ paddingLeft: 6, paddingRight: 16, paddingTop: 10, paddingBottom: 12, display: 'flex', gap: 8 }}>
            {/* Unread dot column */}
            <div style={{ width: 16, paddingTop: 18, display: 'flex', justifyContent: 'center' }}>
                {unread && <div style={{ width: 8, height: 8, borderRadius: 999, background: TOK.unreadDot }} />}
            </div>
            <BuildingAvatar bg={avatarBg} />
            <div
                style={{
                    flex: 1, minWidth: 0, paddingBottom: 12,
                    borderBottom: `0.5px solid ${TOK.rowDivider}`,
                    background: highlight ? 'rgba(10, 132, 255, 0.06)' : 'transparent',
                    marginRight: -16, paddingRight: 16,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: TOK.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sender}
                    </span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: TOK.textSecondary, flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }}>{date}</span>
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 15, color: TOK.textPrimary, marginTop: 2, fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {subject || <span style={{ fontStyle: 'italic', color: TOK.textSecondary }}>(no subject)</span>}
                </div>
                <div
                    style={{
                        fontSize: 14, color: TOK.textSecondary, marginTop: 2, lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}
                >
                    {preview}
                </div>
            </div>
        </div>
    );
}

function InboxBottomBar() {
    return (
        <>
            {/* Status bar (Checking for Mail…) */}
            <div
                style={{
                    position: 'absolute', bottom: 56, left: 0, right: 0, height: 56,
                    background: TOK.bgBottomBar,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16,
                    borderTop: `0.5px solid ${TOK.border}`,
                }}
            >
                <div style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SlidersHorizontal size={20} color={TOK.iosBlue} strokeWidth={2} />
                </div>
                <span style={{ fontSize: 13, color: TOK.textSecondary }}>Checking for Mail…</span>
                <div style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PenSquare size={20} color={TOK.iosBlue} strokeWidth={2} />
                </div>
            </div>
            {/* "Forwarded:" hint at the very bottom */}
            <div
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
                    background: TOK.bgScreen, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: TOK.textPrimary, fontSize: 17, fontWeight: 500,
                }}
            >
                Fwd: print out
            </div>
        </>
    );
}

const NEIGHBORS = [
    { sender: 'Ideabrowser', subject: 'Idea of the Day: Learn to Draw with AI', preview: 'AI catches the mistakes your YouTube tutorial never sees', date: '26/03/26', avatarBg: TOK.avatarBlueBg, unread: true },
    { sender: 'Stake Team', subject: 'Spot properties up to 15% below-market val…', preview: "The right deals are out there. Here's how we find them! …", date: '26/03/26', avatarBg: TOK.avatarPurpleBg, unread: true },
    { sender: 'Shruthi', subject: 'Software Engineer 2 at Turing is hiring', preview: 'Hi There, 🚀 New Job Alert: Turing is hiring Software Engineer 2 for their Bengaluru loca…', date: '26/03/26', avatarBg: TOK.avatarBlueBg, unread: true },
    { sender: 'Goutham Jay', subject: "i saw AI reviews. didn't make the purchase", preview: 'Every review I read last week was written by AI. I wasn\'t looking for them. I was just trying…', date: '26/03/26', avatarBg: TOK.avatarBlueBg, unread: true },
    { sender: 'Myntra', subject: 'Sunshine State Style, Curated! 😎☀️', preview: 'Get Summer-Ready With Myntra House of Brands 🤩 *T&C Apply. Offers on Myntra ma…', date: '26/03/26', avatarBg: TOK.avatarYellowBg, unread: true },
    { sender: 'upGrad', subject: '📣 New Launch: IIT Kharagpur\'s Applied AI…', preview: 'Explore what this new launch brings with it 👇', date: '26/03/26', avatarBg: TOK.avatarBlueBg, unread: true },
];

function AppleMailMobileInbox({
    subject,
    sender,
    preview,
}: {
    subject: string;
    sender: string;
    preview: string;
}) {
    return (
        <div style={{ position: 'relative', flex: 1, background: TOK.bgScreen, overflow: 'hidden' }}>
            <InboxNavBar />
            <InboxLargeTitle />
            <InboxSearchBar />
            <div style={{ overflowY: 'auto', height: 'calc(100% - 230px)', paddingBottom: 8 }}>
                <MessageRow
                    sender={sender || 'Sender'}
                    subject={subject || '(no subject)'}
                    preview={preview || ''}
                    date={dateDDMMYY()}
                    unread
                    avatarBg={TOK.avatarBlueBg}
                    highlight
                />
                {NEIGHBORS.map((n, i) => (
                    <MessageRow
                        key={i}
                        sender={n.sender}
                        subject={n.subject}
                        preview={n.preview}
                        date={n.date}
                        unread={n.unread}
                        avatarBg={n.avatarBg}
                    />
                ))}
            </div>
            <InboxBottomBar />
        </div>
    );
}

// ─── Opened view ─────────────────────────────────────────────────────────────

function OpenedNavBar() {
    return (
        <div
            style={{
                height: 44, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', color: TOK.iosBlue, fontSize: 17,
            }}
        >
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ChevronLeft size={22} strokeWidth={2.5} />
                <span style={{ fontSize: 17, fontWeight: 500, marginLeft: -2 }}>Inbox</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 24 }}>
                <ChevronUp size={22} strokeWidth={2.5} />
                <ChevronDown size={22} strokeWidth={2.5} />
            </div>
        </div>
    );
}

function MailingListBanner() {
    return (
        <div
            style={{
                background: TOK.bgPanel, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 8,
                borderTop: `0.5px solid ${TOK.border}`, borderBottom: `0.5px solid ${TOK.border}`,
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: TOK.textPrimary }}>
                    This message is from a mailing list.
                </div>
                <div style={{ fontSize: 14, color: TOK.iosBlue, marginTop: 2 }}>Unsubscribe</div>
            </div>
            <div style={{ paddingTop: 2 }}>
                <X size={18} color={TOK.textSecondary} strokeWidth={2} />
            </div>
        </div>
    );
}

function SenderBlock({ senderName, senderEmail }: { senderName: string; senderEmail: string }) {
    const display = senderName || senderEmail || 'Sender';
    return (
        <div style={{ padding: '14px 16px 16px', borderBottom: `0.5px solid ${TOK.border}` }}>
            <div style={{ display: 'flex', gap: 12 }}>
                <BuildingAvatar bg={TOK.avatarBlueBg} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: TOK.textPrimary }}>{display}</span>
                        <span style={{ fontSize: 14, color: TOK.textSecondary }}>{dateDDMMYY()}</span>
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, color: TOK.textSecondary, fontSize: 14 }}>
                        <span style={{ color: TOK.textPrimary, fontWeight: 600 }}>To:</span>
                        <span style={{ color: TOK.textPrimary }}>Richardson Eugin simon</span>
                        <ChevronRight size={12} strokeWidth={2.5} />
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, color: TOK.textSecondary, fontSize: 14 }}>
                        <span style={{ color: TOK.textSecondary, fontWeight: 600 }}>Reply To:</span>
                        <span style={{ color: TOK.textSecondary }}>{display}</span>
                        <HelpCircle size={12} color={TOK.textTertiary} strokeWidth={2} />
                        <ChevronRight size={12} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpenedBottomBar() {
    const ic = (i: React.ReactNode) => (
        <div style={{ width: 56, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i}</div>
    );
    return (
        <>
            <div
                style={{
                    position: 'absolute', bottom: 56, left: 0, right: 0, height: 56,
                    background: TOK.bgBottomBar, display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                    borderTop: `0.5px solid ${TOK.border}`,
                }}
            >
                {ic(<Archive size={22} color={TOK.iosBlue} strokeWidth={1.8} />)}
                {ic(<Folder size={22} color={TOK.iosBlue} strokeWidth={1.8} />)}
                {ic(<CornerUpLeft size={22} color={TOK.iosBlue} strokeWidth={1.8} />)}
                {ic(<PenSquare size={22} color={TOK.iosBlue} strokeWidth={1.8} />)}
            </div>
            <div
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
                    background: TOK.bgScreen, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: TOK.textPrimary, fontSize: 17, fontWeight: 500,
                }}
            >
                Fwd: print out
            </div>
        </>
    );
}

function AppleMailMobileOpened({
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
            <OpenedNavBar />
            <MailingListBanner />
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 130 }}>
                <SenderBlock senderName={senderName} senderEmail={senderEmail} />

                {/* Subject */}
                <div style={{ padding: '20px 16px 4px' }}>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: TOK.textPrimary, lineHeight: 1.25, letterSpacing: -0.2 }}>
                        {subject || '(no subject)'}
                    </h1>
                </div>

                {/* Optional Apple Intelligence summary */}
                {aiSummary && (
                    <div
                        style={{
                            margin: '12px 16px 0', padding: '10px 14px', borderRadius: 12,
                            background: 'rgba(10, 132, 255, 0.10)', border: '1px solid rgba(10, 132, 255, 0.22)',
                            fontSize: 13, color: TOK.textPrimary,
                        }}
                    >
                        <div style={{ fontSize: 10, color: TOK.iosBlue, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                            Apple Intelligence
                        </div>
                        {aiSummary}
                    </div>
                )}

                {/* Body card */}
                <div style={{ margin: '16px 16px 0', padding: '16px 18px', borderRadius: 12, background: TOK.bgBodyCard }}>
                    <div
                        className="prose prose-sm max-w-none"
                        style={{ color: TOK.textPrimary, fontSize: 15, lineHeight: 1.55 }}
                        dangerouslySetInnerHTML={{ __html: bodyHtml || '<p style="color:#9CA3AF;font-style:italic">(empty body)</p>' }}
                    />
                </div>
            </div>
            <OpenedBottomBar />
        </div>
    );
}

// ─── iPhone chrome + scaling ─────────────────────────────────────────────────

const VIRTUAL_W = 393;
const VIRTUAL_H = 852;

export default function IphoneAppleMailPreview({
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
                    <div
                        style={{
                            width: deviceW, height: deviceH, borderRadius: 56,
                            background: 'linear-gradient(180deg, #1A1A1D 0%, #0E0E10 100%)',
                            padding: bezel, boxSizing: 'border-box',
                            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45), 0 6px 16px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                        }}
                    >
                        <div style={{ position: 'absolute', left: -2, top: 110, width: 4, height: 32, background: '#0E0E10', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', left: -2, top: 160, width: 4, height: 60, background: '#0E0E10', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', left: -2, top: 230, width: 4, height: 60, background: '#0E0E10', borderRadius: 2 }} />
                        <div style={{ position: 'absolute', right: -2, top: 180, width: 4, height: 92, background: '#0E0E10', borderRadius: 2 }} />

                        <div
                            style={{
                                width: screenW, height: screenH, background: TOK.bgScreen, borderRadius: 44,
                                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
                                    width: 122, height: 36, borderRadius: 20, background: '#000', zIndex: 10,
                                }}
                            />

                            <StatusBar />

                            {view === 'inbox' ? (
                                <AppleMailMobileInbox
                                    subject={subject}
                                    sender={senderName || senderEmail || 'Sender'}
                                    preview={inboxPreview || ''}
                                />
                            ) : (
                                <AppleMailMobileOpened
                                    subject={subject}
                                    senderName={senderName}
                                    senderEmail={senderEmail}
                                    bodyHtml={bodyHtml}
                                    aiSummary={aiSummary}
                                />
                            )}

                            <div
                                style={{
                                    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                                    width: 134, height: 5, borderRadius: 999, background: '#FFFFFF', zIndex: 20,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

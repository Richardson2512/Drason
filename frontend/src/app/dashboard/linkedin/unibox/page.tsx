'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Inbox, Send, Mail, RefreshCw, Linkedin, Building2, Tag, CheckSquare, Square } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { useDashboard } from '@/contexts/DashboardContext';

// ============================================================================
// TYPES - server response shapes from /api/linkedin/unibox/*
// ============================================================================

interface UniboxThread {
    id: string;
    linkedin_account_id: string;
    sender_display_name: string;
    counterparty_name: string;
    counterparty_headline: string | null;
    counterparty_public_identifier: string | null;
    counterparty_picture_url: string | null;
    auto_tag: 'Interested' | 'Not Interested' | 'Generic' | null;
    preview: string;
    last_message_at: string | null;
    /** Direction of the most recent message - drives the Inbox/Sent/All
     *  tab filtering. NULL when Unipile didn't provide it (older API
     *  payload); UI treats null as "unknown" and includes the thread in
     *  every view rather than guessing. */
    last_message_direction: 'INBOUND' | 'OUTBOUND' | null;
    unread_count: number;
}

interface AccountError {
    account_id: string;
    display_name: string;
    error: string;
}

interface ThreadsResponse {
    success: boolean;
    data: UniboxThread[];
    account_errors?: AccountError[];
}

interface UniboxMessage {
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    text: string;
    sent_at: string;
    sender_name: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTime(iso: string | null): string {
    if (!iso) return '';
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 60_000) return 'now';
    if (ms < 60 * 60_000) return `${Math.floor(ms / 60_000)}m`;
    if (ms < 24 * 60 * 60_000) return `${Math.floor(ms / (60 * 60_000))}h`;
    return `${Math.floor(ms / (24 * 60 * 60_000))}d`;
}

// ============================================================================
// PAGE
// ============================================================================

export default function LinkedInUniboxPage() {
    const { hasCapability } = useDashboard();
    const canReply = hasCapability('reply_to_messages');

    const [threads, setThreads] = useState<UniboxThread[]>([]);
    const [accountErrors, setAccountErrors] = useState<AccountError[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedThread, setSelectedThread] = useState<UniboxThread | null>(null);
    const [messages, setMessages] = useState<UniboxMessage[]>([]);
    const [threadLoading, setThreadLoading] = useState(false);

    // Filters - mirror the sequencer's view/filter split.
    const [view, setView] = useState<'inbox' | 'sent' | 'all'>('inbox');
    // 'replied' was removed - direction filtering lives on the view
    // tabs now (Inbox/Sent/All driven by last_message_direction).
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Reply composer
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [showReply, setShowReply] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const fetchThreads = useCallback(async () => {
        try {
            // Push filters server-side where supported. `auto_tags` is
            // now a backend-supported query param - saves us fetching
            // every thread just to filter to 5 "Interested" rows
            // client-side.
            const qs = new URLSearchParams();
            if (filter === 'unread') qs.set('unread_only', '1');
            if (tagFilter.size > 0) qs.set('auto_tags', Array.from(tagFilter).join(','));
            const resp = await apiClient<ThreadsResponse | UniboxThread[]>(
                `/api/linkedin/unibox/threads${qs.toString() ? `?${qs.toString()}` : ''}`,
            );
            // Tolerate both legacy and new envelope shapes.
            const list: UniboxThread[] = Array.isArray(resp) ? resp : ((resp as any)?.data ?? []);
            const errs: AccountError[] = Array.isArray(resp) ? [] : ((resp as any)?.account_errors ?? []);
            setThreads(list);
            setAccountErrors(errs);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load threads');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, tagFilter]);

    useEffect(() => { fetchThreads(); }, [fetchThreads]);

    const fetchThread = useCallback(async (id: string, opts: { silent?: boolean } = {}) => {
        if (!opts.silent) {
            setThreadLoading(true);
            const t = threads.find(x => x.id === id) || null;
            setSelectedThread(t);
        }
        try {
            const d = await apiClient<{ messages: UniboxMessage[] }>(`/api/linkedin/unibox/threads/${encodeURIComponent(id)}`);
            setMessages(d?.messages || []);
        } catch {
            if (!opts.silent) setMessages([]);
        } finally {
            if (!opts.silent) {
                setThreadLoading(false);
                // Scroll to latest on next paint
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                });
            }
        }
    }, [threads]);

    // Poll the open thread every 12s for new inbound messages. Stops
    // when the operator navigates away from the thread (selectedThread
    // is null) or the tab loses focus (visibilitychange). Stops
    // refetching on send because sendReply does its own refresh.
    useEffect(() => {
        if (!selectedThread) return;
        let active = true;
        const tick = () => {
            if (!active) return;
            if (document.visibilityState !== 'visible') return;
            void fetchThread(selectedThread.id, { silent: true });
        };
        const interval = setInterval(tick, 12_000);
        const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            active = false;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [selectedThread, fetchThread]);

    // Refetch the thread list on tab focus - catches new threads
    // arrived while the operator was elsewhere. Cheaper than polling
    // on a fixed interval and matches the pattern we used for
    // Campaigns / Contacts / Accounts.
    useEffect(() => {
        const onFocus = () => { void fetchThreads(); };
        const onVisible = () => { if (document.visibilityState === 'visible') void fetchThreads(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [fetchThreads]);

    const sendReply = async () => {
        if (!selectedThread || !replyText.trim()) return;
        setSending(true);
        try {
            const resp = await apiClient<{ data: { suppression?: { decision: string; paused_enrollments: number; mode: string } | null } }>(
                `/api/linkedin/unibox/threads/${encodeURIComponent(selectedThread.id)}/reply`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        text: replyText,
                        // Send the counterparty slug so the backend can
                        // resolve the lead and trigger cross-channel
                        // suppression without an extra Unipile call.
                        counterparty_public_identifier: selectedThread.counterparty_public_identifier,
                    }),
                },
            );
            setReplyText('');
            setShowReply(false);
            // Re-fetch messages for this thread
            const d = await apiClient<{ messages: UniboxMessage[] }>(
                `/api/linkedin/unibox/threads/${encodeURIComponent(selectedThread.id)}`,
            );
            setMessages(d?.messages || []);
            // Surface the cross-channel suppression outcome inline so
            // the operator knows whether their email campaigns just
            // paused. Silent when no parallel enrollment exists.
            const suppression = resp?.data?.suppression;
            if (suppression && suppression.decision === 'paused' && suppression.paused_enrollments > 0) {
                toast.success(
                    `Reply sent · paused ${suppression.paused_enrollments} email enrollment${suppression.paused_enrollments === 1 ? '' : 's'} for this lead`,
                );
            } else {
                toast.success('Reply sent');
            }
        } catch (err: any) {
            // The backend now returns 429 specifically for cap_reached.
            // apiClient throws a generic Error with the server message;
            // we surface the cap copy distinctly.
            const msg = err?.message || 'Failed to send reply';
            if (/cap reached|max.*messages/i.test(msg)) {
                toast.error(msg, { duration: 6000 });
            } else {
                toast.error(msg);
            }
        } finally {
            setSending(false);
        }
    };

    // Most filtering is server-side now. The only client-side filter
    // left is `searchQuery` (free-text over counterparty + preview)
    // and the view tab - both of which need client-side filtering
    // because they operate on the rendered row state, not stable
    // queryable fields.
    const filtered = threads.filter(t => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!t.counterparty_name.toLowerCase().includes(q) && !t.preview.toLowerCase().includes(q)) return false;
        }
        // View filter is now grounded in `last_message_direction` (real
        // data from Unipile). Threads where direction is unknown (null)
        // appear in every view - that's safer than dropping them based
        // on a guess. The legacy `filter === 'replied'` reading
        // unread_count is preserved but is essentially a no-op now -
        // operators should use the view tabs for direction filtering.
        if (view === 'inbox' && t.last_message_direction === 'OUTBOUND') return false;
        if (view === 'sent' && t.last_message_direction === 'INBOUND') return false;
        return true;
    });

    const unreadCount = threads.reduce((s, t) => s + (t.unread_count > 0 ? 1 : 0), 0);

    const TAG_TINT: Record<NonNullable<UniboxThread['auto_tag']>, string> = {
        'Interested': '#10B981',
        'Not Interested': '#DC2626',
        'Generic': '#6B7280',
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
            {/* Account-error banner - one of the org's LinkedIn accounts
                returned an error during the Unipile merge. Threads from
                other accounts are still visible; this surfaces the gap
                so the operator knows their inbox is incomplete. */}
            {accountErrors.length > 0 && (
                <div className="shrink-0 px-5 py-2 text-[0.7rem] bg-amber-50 text-amber-900 border-b border-amber-200 flex items-start gap-2">
                    <span className="font-semibold">Inbox is incomplete:</span>
                    <span>
                        {accountErrors.length === 1
                            ? `Couldn't load threads from ${accountErrors[0].display_name}. Other accounts loaded normally.`
                            : `Couldn't load threads from ${accountErrors.length} accounts. Other accounts loaded normally.`}
                    </span>
                </div>
            )}

            {/* ==================== TOP TOOLBAR ==================== */}
            <div className="shrink-0 flex items-center gap-4 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #D1CBC5' }}>
                <div className="flex items-center gap-2 shrink-0">
                    <Linkedin size={16} strokeWidth={1.75} className="text-blue-600" />
                    <h1 className="text-sm font-semibold text-gray-900">Unibox</h1>
                    {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                </div>

                <div className="h-5 w-px bg-gray-200 shrink-0" />

                {/* Primary view tabs */}
                <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-xl shrink-0" role="tablist">
                    {(['inbox', 'sent', 'all'] as const).map(v => {
                        const Icon = v === 'inbox' ? Inbox : v === 'sent' ? Send : Mail;
                        const isActive = view === v;
                        return (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                role="tab"
                                aria-selected={isActive}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-colors"
                                style={{
                                    background: isActive ? '#FFFFFF' : 'transparent',
                                    color: isActive ? '#111827' : '#6B7280',
                                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                }}
                            >
                                <Icon size={13} strokeWidth={1.75} />
                                {v === 'inbox' ? 'Inbox' : v === 'sent' ? 'Sent' : 'All'}
                            </button>
                        );
                    })}
                </div>

                {/* Auto-tag filter - multi-select pill dropdown */}
                <div className="w-[180px] shrink-0">
                    <MultiSelectDropdown
                        placeholder="Auto-tag"
                        selected={Array.from(tagFilter)}
                        onChange={(arr) => setTagFilter(new Set(arr))}
                        options={[
                            { value: 'Interested',     label: 'Interested',     icon: <span className="w-2 h-2 rounded-full" style={{ background: TAG_TINT.Interested, display: 'inline-block' }} /> },
                            { value: 'Not Interested', label: 'Not Interested', icon: <span className="w-2 h-2 rounded-full" style={{ background: TAG_TINT['Not Interested'], display: 'inline-block' }} /> },
                            { value: 'Generic',        label: 'Generic',        icon: <span className="w-2 h-2 rounded-full" style={{ background: TAG_TINT.Generic, display: 'inline-block' }} /> },
                        ]}
                    />
                </div>

                <div className="flex-1" />

                <div className="relative shrink-0">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-[260px] pl-8 pr-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>

                <div className="w-36 shrink-0">
                    <CustomSelect
                        value={filter}
                        onChange={(v) => setFilter(v as typeof filter)}
                        options={[
                            { value: 'all',     label: 'All threads' },
                            { value: 'unread',  label: 'Unread' },
                        ]}
                    />
                </div>

                <button
                    onClick={() => { setRefreshing(true); fetchThreads(); }}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
                    style={{ border: '1px solid #D1CBC5' }}
                    title="Refresh"
                >
                    <RefreshCw size={13} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* ==================== BODY (3 columns) ==================== */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* LEFT: Thread list */}
                <div className="w-[320px] shrink-0 flex flex-col bg-white" style={{ borderRight: '1px solid #D1CBC5' }}>
                    <div className="px-3 py-2 flex items-center justify-between shrink-0 gap-2" style={{ borderBottom: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                        <div className="flex items-center gap-2 min-w-0">
                            <Square size={12} className="text-gray-400" />
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                {view === 'inbox' ? 'Replies' : view === 'sent' ? 'Sent' : 'All threads'}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-400">{filtered.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {loading ? (
                            <div className="p-6 text-center text-xs text-gray-400">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center">
                                {view === 'sent' ? <Send size={28} className="mx-auto text-gray-300 mb-3" /> : <Inbox size={28} className="mx-auto text-gray-300 mb-3" />}
                                <p className="text-xs text-gray-400 font-medium">
                                    {filter === 'unread' ? 'No unread conversations'
                                     : view === 'sent' ? 'No outbound threads yet'
                                     : view === 'inbox' ? 'No replies received yet'
                                     : 'No conversations yet'}
                                </p>
                                <p className="text-[10px] text-gray-300 mt-1">
                                    {view === 'sent'
                                        ? 'DMs you send through campaigns will appear here.'
                                        : 'Replies to your LinkedIn outreach will appear here, auto-tagged by the classifier.'}
                                </p>
                            </div>
                        ) : (
                            filtered.map(thread => {
                                const isRead = thread.unread_count === 0;
                                const isSelected = selectedThread?.id === thread.id;
                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => fetchThread(thread.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter') fetchThread(thread.id); }}
                                        className="w-full text-left p-3 cursor-pointer transition-colors hover:bg-[#F5F1EA]"
                                        style={{ borderBottom: '1px solid #F0EBE3', background: isSelected ? '#F5F1EA' : isRead ? 'transparent' : '#FAFAF5' }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <Square size={12} className="text-gray-400 shrink-0 mt-1" />
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ background: isRead ? '#9CA3AF' : '#111827' }}>
                                                {(thread.counterparty_name || '?')[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs truncate" style={{ fontWeight: isRead ? 400 : 600 }}>{thread.counterparty_name}</span>
                                                    <span className="text-[9px] text-gray-400 shrink-0">{formatTime(thread.last_message_at)}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-700 truncate" style={{ fontWeight: isRead ? 400 : 600 }}>{thread.counterparty_headline || ''}</div>
                                                <div className="text-[10px] text-gray-400 truncate mt-0.5">{thread.preview || 'No preview'}</div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {thread.auto_tag && (
                                                        <span className="text-[8px] px-1.5 py-0.5 rounded font-semibold" style={{ background: '#F3F4F6', color: TAG_TINT[thread.auto_tag] }}>{thread.auto_tag}</span>
                                                    )}
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 truncate max-w-[100px]">{thread.sender_display_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* CENTER: Conversation */}
                <div className="flex-1 flex flex-col bg-[#FAFAF8] min-w-0 min-h-0">
                    {!selectedThread ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Mail size={32} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm text-gray-400">Select a conversation</p>
                                <p className="text-[10px] text-gray-300 mt-1">Click a thread on the left to view messages</p>
                            </div>
                        </div>
                    ) : threadLoading ? (
                        <div className="flex-1 flex items-center justify-center"><p className="text-xs text-gray-400">Loading…</p></div>
                    ) : (
                        <>
                            <div className="p-3 flex items-center justify-between shrink-0 bg-white" style={{ borderBottom: '1px solid #D1CBC5' }}>
                                <div className="min-w-0">
                                    <h2 className="text-xs font-bold text-gray-900 truncate">{selectedThread.counterparty_name}</h2>
                                    <div className="text-[10px] text-gray-500">
                                        {selectedThread.counterparty_headline || ''} &middot; {messages.length} message{messages.length !== 1 ? 's' : ''}
                                        &middot; via {selectedThread.sender_display_name}
                                    </div>
                                </div>
                                {selectedThread.auto_tag && (
                                    <span className="text-[10px] px-2 py-1 rounded-full font-semibold shrink-0" style={{ background: '#F3F4F6', color: TAG_TINT[selectedThread.auto_tag] }}>
                                        Auto-tag: {selectedThread.auto_tag}
                                    </span>
                                )}
                            </div>

                            <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
                                {messages.length === 0 ? (
                                    <div className="text-center text-xs text-gray-400">No messages</div>
                                ) : messages.map(msg => (
                                    <div key={msg.id} className={`max-w-[80%] ${msg.direction === 'OUTBOUND' ? 'ml-auto' : 'mr-auto'}`}>
                                        <div className="p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap" style={{
                                            background: msg.direction === 'OUTBOUND' ? '#111827' : '#FFFFFF',
                                            color: msg.direction === 'OUTBOUND' ? '#FFFFFF' : '#374151',
                                            border: msg.direction === 'INBOUND' ? '1px solid #D1CBC5' : 'none',
                                        }}>
                                            <div className="text-[10px] mb-1.5" style={{ color: msg.direction === 'OUTBOUND' ? '#9CA3AF' : '#6B7280' }}>
                                                {msg.sender_name} &middot; {new Date(msg.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="shrink-0 bg-white" style={{ borderTop: '1px solid #D1CBC5' }}>
                                {!canReply ? (
                                    <div className="w-full p-3 text-[11px] text-gray-400 italic">
                                        You don&apos;t have permission to reply on this workspace.
                                    </div>
                                ) : !showReply ? (
                                    <button onClick={() => setShowReply(true)} className="w-full p-3 text-left text-xs text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors font-medium">
                                        Click to reply to {selectedThread.counterparty_name}…
                                    </button>
                                ) : (
                                    <div className="p-3 flex flex-col gap-2">
                                        <div className="text-[10px] text-gray-400">
                                            Replying as <strong className="text-gray-600">{selectedThread.sender_display_name}</strong>
                                        </div>
                                        <textarea
                                            rows={4}
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder={`Write your reply to ${selectedThread.counterparty_name}…`}
                                            className="w-full text-xs px-3 py-2 rounded-lg outline-none resize-none"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        />
                                        <div className="flex items-center justify-between">
                                            <button onClick={() => { setShowReply(false); setReplyText(''); }} className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
                                            <button onClick={sendReply} disabled={!replyText.trim() || sending} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30">
                                                <Send size={11} /> {sending ? 'Sending…' : 'Send'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT: Contact context */}
                {selectedThread && (
                    <div className="w-[240px] shrink-0 bg-white overflow-y-auto scrollbar-hide" style={{ borderLeft: '1px solid #D1CBC5' }}>
                        <div className="p-3" style={{ borderBottom: '1px solid #E8E3DC' }}>
                            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
                        </div>
                        <div className="p-3 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white bg-gray-900">
                                    {(selectedThread.counterparty_name || '?')[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 truncate">{selectedThread.counterparty_name}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{selectedThread.counterparty_headline || ''}</div>
                                </div>
                            </div>

                            {selectedThread.counterparty_public_identifier && (
                                <a
                                    href={`https://linkedin.com/in/${selectedThread.counterparty_public_identifier}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] text-blue-600 hover:text-blue-800 no-underline"
                                >
                                    <Linkedin size={10} /> View on LinkedIn
                                </a>
                            )}

                            <div className="border-t border-[#E8E3DC] pt-3 flex flex-col gap-1.5 text-[10px] text-gray-700">
                                <div className="flex items-center gap-1.5"><Tag size={10} className="text-gray-400" /> via {selectedThread.sender_display_name}</div>
                                {selectedThread.auto_tag && (
                                    <div className="flex items-center gap-1.5">
                                        <Building2 size={10} className="text-gray-400" /> Auto-tag: {selectedThread.auto_tag}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

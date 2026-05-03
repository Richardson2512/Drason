'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { Search, Star, Archive, Mail, MailOpen, Send, RefreshCw, Inbox, User, Building2, Globe, Tag, BarChart3, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const RichTextEditor = dynamic(() => import('@/components/sequencer/RichTextEditor'), { ssr: false });

// ============================================================================
// TYPES
// ============================================================================

interface EmailThread {
    id: string;
    contact_email: string;
    contact_name: string | null;
    subject: string;
    campaign_name: string | null;
    campaign_id: string | null;
    status: string;
    is_read: boolean;
    is_starred: boolean;
    last_message_at: string;
    message_count: number;
    snippet: string | null;
    account: { email: string; display_name: string | null; provider: string };
}

interface EmailMessage {
    id: string;
    direction: string;
    from_email: string;
    from_name: string | null;
    to_email: string;
    to_name: string | null;
    subject: string;
    body_html: string;
    sent_at: string;
}

interface LeadContext {
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    title: string | null;
    status: string;
    current_step: number;
    esp_bucket: string | null;
    validation_status: string | null;
    opened_count: number;
    clicked_count: number;
    replied_at: string | null;
    // Canonical Lead.id from the org-wide Lead table. Null if the contact
    // exists in a CampaignLead but isn't (yet) materialized as a Lead row —
    // in that case the right-panel renders as text instead of a link.
    lead_id?: string | null;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function UniboxPage() {
    const [threads, setThreads] = useState<EmailThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<(EmailThread & { messages: EmailMessage[] }) | null>(null);
    const [leadContext, setLeadContext] = useState<LeadContext | null>(null);
    const [loading, setLoading] = useState(true);
    const [threadLoading, setThreadLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Filters
    //   `view` selects inbox (replies received) vs sent (everything we dispatched
    //   from sequencer campaigns, including steps that haven't been replied to yet)
    //   vs all (both merged). Backend enforces campaign-only threads across all views,
    //   so warmup + random inbound never show up regardless of which view is active.
    const [view, setView] = useState<'inbox' | 'sent' | 'all'>('inbox');
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Reply
    const [replyHtml, setReplyHtml] = useState('');
    const [sending, setSending] = useState(false);
    const [showReply, setShowReply] = useState(false);

    // Templates + signatures for the reply composer
    interface Signature { id: string; name: string; html_content: string; is_default: boolean }
    interface Template { id: string; name: string; subject: string; body_html: string; category: string }
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const templatePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        apiClient<any>('/api/sequencer/signatures')
            .then(r => setSignatures(Array.isArray(r) ? r : (r?.signatures || r?.data || [])))
            .catch(() => setSignatures([]));
        apiClient<any>('/api/sequencer/templates')
            .then(r => setTemplates(Array.isArray(r) ? r : (r?.templates || r?.data || [])))
            .catch(() => setTemplates([]));
    }, []);

    useEffect(() => {
        if (!showTemplatePicker) return;
        const handler = (e: MouseEvent) => {
            if (templatePickerRef.current && !templatePickerRef.current.contains(e.target as Node)) {
                setShowTemplatePicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showTemplatePicker]);

    const insertTemplate = (tpl: Template) => {
        // Append template body to existing reply content (or replace if empty)
        setReplyHtml(prev => prev.trim() ? `${prev}<br/><br/>${tpl.body_html}` : tpl.body_html);
        setShowTemplatePicker(false);
    };

    // ========== FETCH ==========

    const fetchThreads = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: '50', view });
            if (filter === 'unread') params.set('unread', 'true');
            if (filter === 'starred') params.set('starred', 'true');
            if (searchQuery.trim()) params.set('search', searchQuery.trim());

            // apiClient auto-unwraps the `data` key, so when the response is
            // `{success, data: [...], meta: {...}}` it returns the array directly
            // (and meta is lost). Handle both shapes defensively and grab unreadCount
            // from the dedicated endpoint as a fallback.
            const res = await apiClient<any>(`/api/unibox/threads?${params}`);
            const list: EmailThread[] = Array.isArray(res) ? res : (res?.data ?? res?.threads ?? []);
            setThreads(list);
            const meta = Array.isArray(res) ? null : res?.meta;
            if (meta?.unreadCount !== undefined) setUnreadCount(meta.unreadCount);
        } catch { /* graceful */ }
        setLoading(false);
        setRefreshing(false);
    }, [view, filter, searchQuery]);

    const fetchThread = useCallback(async (threadId: string) => {
        setThreadLoading(true);
        try {
            const res = await apiClient<any>(`/api/unibox/threads/${threadId}`);
            // apiClient unwraps the backend's `data` key, so res IS the thread object
            // (with messages + nested leadContext).
            const thread = res?.messages !== undefined ? res : (res?.data || null);
            setSelectedThread(thread);
            setLeadContext(thread?.leadContext || null);
            setShowReply(false);
            setReplyHtml('');
            setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_read: true } : t));
        } catch { /* graceful */ }
        setThreadLoading(false);
    }, []);

    useEffect(() => { fetchThreads(); }, [fetchThreads]);

    // Poll every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchThreads(), 30000);
        return () => clearInterval(interval);
    }, [fetchThreads]);

    // Auto-scroll the message pane to the latest message.
    //
    // Why this is hard: the messages render `dangerouslySetInnerHTML` of the
    // email bodies. Embedded images, remote CSS, and multi-line quoted-reply
    // blocks all cause layout shifts AFTER React reports the commit. A single
    // rAF + timeout isn't enough — the element grows over several frames.
    //
    // Strategy: useLayoutEffect to capture pre-paint, then a ResizeObserver
    // attached to the container that keeps pinning scrollTop to scrollHeight
    // as long as the thread is considered "at bottom." The observer is torn
    // down when the thread changes.
    useLayoutEffect(() => {
        if (!selectedThread?.messages?.length) return;
        const el = messagesContainerRef.current;
        if (!el) return;

        const scrollToEnd = () => { el.scrollTop = el.scrollHeight; };

        // Fire immediately, plus a few deferred attempts for async layout
        scrollToEnd();
        requestAnimationFrame(scrollToEnd);
        const t1 = setTimeout(scrollToEnd, 50);
        const t2 = setTimeout(scrollToEnd, 200);
        const t3 = setTimeout(scrollToEnd, 500);

        // Keep pinning to bottom as content grows (images loading, etc.)
        const ro = new ResizeObserver(() => {
            scrollToEnd();
        });
        ro.observe(el);
        // Also observe children for image-driven height changes
        Array.from(el.children).forEach(child => ro.observe(child as Element));

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            ro.disconnect();
        };
    }, [selectedThread?.id, selectedThread?.messages?.length, showReply, threadLoading]);

    // ========== ACTIONS ==========

    const toggleStar = async (threadId: string, currentStarred: boolean) => {
        await apiClient(`/api/unibox/threads/${threadId}`, { method: 'PATCH', body: JSON.stringify({ is_starred: !currentStarred }) });
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_starred: !currentStarred } : t));
        if (selectedThread?.id === threadId) setSelectedThread(prev => prev ? { ...prev, is_starred: !currentStarred } : null);
    };

    const archiveThread = async (threadId: string) => {
        await apiClient(`/api/unibox/threads/${threadId}`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) });
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (selectedThread?.id === threadId) { setSelectedThread(null); setLeadContext(null); }
    };

    const markUnread = async (threadId: string) => {
        await apiClient(`/api/unibox/threads/${threadId}`, { method: 'PATCH', body: JSON.stringify({ is_read: false }) });
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_read: false } : t));
    };

    const sendReplyAction = async () => {
        if (!selectedThread || !replyHtml.trim()) return;
        setSending(true);
        try {
            await apiClient(`/api/unibox/threads/${selectedThread.id}/reply`, {
                method: 'POST',
                body: JSON.stringify({ bodyHtml: replyHtml, bodyText: replyHtml.replace(/<[^>]*>/g, '') }),
            });
            await fetchThread(selectedThread.id);
            setReplyHtml('');
            setShowReply(false);
        } catch { /* graceful */ }
        setSending(false);
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // ========== RENDER ==========

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
            {/* ==================== TOP TOOLBAR (dashboard-style, full width) ==================== */}
            <div className="shrink-0 flex items-center gap-4 px-5 py-3 bg-white" style={{ borderBottom: '1px solid #D1CBC5' }}>
                {/* Title */}
                <div className="flex items-center gap-2 shrink-0">
                    <Inbox size={16} strokeWidth={1.75} className="text-gray-700" />
                    <h1 className="text-sm font-semibold text-gray-900">Unibox</h1>
                    {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                </div>

                <div className="h-5 w-px bg-gray-200 shrink-0" />

                {/* Primary view tabs: Inbox / Sent / All */}
                <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-xl shrink-0" role="tablist" aria-label="Unibox view">
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

                {/* Grow spacer */}
                <div className="flex-1" />

                {/* Search */}
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

                {/* Filter chips: All / Unread / Starred */}
                <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Filter threads">
                    {(['all', 'unread', 'starred'] as const).map(f => {
                        const isActive = filter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                style={{
                                    background: isActive ? '#111827' : '#F3F4F6',
                                    color: isActive ? '#FFFFFF' : '#4B5563',
                                    border: '1px solid',
                                    borderColor: isActive ? '#111827' : '#E5E7EB',
                                }}
                            >
                                {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Starred'}
                            </button>
                        );
                    })}
                </div>

                {/* Refresh */}
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
                {/* ==================== LEFT: Thread List ==================== */}
                <div className="w-[320px] shrink-0 flex flex-col bg-white" style={{ borderRight: '1px solid #D1CBC5' }}>
                    {/* Column header — compact label + count */}
                    <div className="px-3 py-2 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            {view === 'inbox' ? 'Replies' : view === 'sent' ? 'Sent' : 'All threads'}
                        </span>
                        <span className="text-[10px] text-gray-400">{threads.length}</span>
                    </div>

                {/* Thread list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {loading ? (
                        <div className="p-6 text-center text-xs text-gray-400">Loading...</div>
                    ) : threads.length === 0 ? (
                        <div className="p-8 text-center">
                            {view === 'sent' ? <Send size={28} className="mx-auto text-gray-300 mb-3" /> : <Inbox size={28} className="mx-auto text-gray-300 mb-3" />}
                            <p className="text-xs text-gray-400 font-medium">
                                {filter === 'unread' ? 'No unread conversations' :
                                 filter === 'starred' ? 'No starred conversations' :
                                 view === 'sent' ? 'No sent emails yet' :
                                 view === 'inbox' ? 'No replies received yet' :
                                 'No conversations yet'}
                            </p>
                            <p className="text-[10px] text-gray-300 mt-1">
                                {view === 'sent'
                                    ? 'Emails dispatched from your campaigns will appear here'
                                    : 'Replies to your campaigns will appear here'}
                            </p>
                        </div>
                    ) : (
                        threads.map(thread => (
                            <button key={thread.id} onClick={() => fetchThread(thread.id)} className="w-full text-left p-3 cursor-pointer transition-colors hover:bg-[#F5F1EA]" style={{ borderBottom: '1px solid #F0EBE3', background: selectedThread?.id === thread.id ? '#F5F1EA' : thread.is_read ? 'transparent' : '#FAFAF5' }}>
                                <div className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ background: thread.is_read ? '#9CA3AF' : '#111827' }}>
                                        {(thread.contact_name || thread.contact_email)[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs truncate" style={{ fontWeight: thread.is_read ? 400 : 600 }}>{thread.contact_name || thread.contact_email.split('@')[0]}</span>
                                            <span className="text-[9px] text-gray-400 shrink-0">{formatTime(thread.last_message_at)}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-700 truncate" style={{ fontWeight: thread.is_read ? 400 : 600 }}>{thread.subject}</div>
                                        <div className="text-[10px] text-gray-400 truncate mt-0.5">{thread.snippet || 'No preview'}</div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {thread.is_starred && <Star size={9} className="text-amber-500 fill-amber-500" />}
                                            {thread.campaign_name && <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 truncate max-w-[100px]">{thread.campaign_name}</span>}
                                            {thread.message_count > 1 && <span className="text-[8px] text-gray-400">{thread.message_count}</span>}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ==================== CENTER: Conversation ==================== */}
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
                    <div className="flex-1 flex items-center justify-center"><p className="text-xs text-gray-400">Loading...</p></div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-3 flex items-center justify-between shrink-0 bg-white" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <div className="min-w-0">
                                <h2 className="text-xs font-bold text-gray-900 truncate">{selectedThread.subject}</h2>
                                <div className="text-[10px] text-gray-500">
                                    {selectedThread.contact_name || selectedThread.contact_email} &middot; {selectedThread.message_count} message{selectedThread.message_count !== 1 ? 's' : ''}
                                    {selectedThread.campaign_name && <span> &middot; {selectedThread.campaign_name}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                                <button onClick={() => toggleStar(selectedThread.id, selectedThread.is_starred)} className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
                                    <Star size={13} className={selectedThread.is_starred ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
                                </button>
                                <button onClick={() => markUnread(selectedThread.id)} className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer" title="Mark unread">
                                    <MailOpen size={13} className="text-gray-400" />
                                </button>
                                <button onClick={() => archiveThread(selectedThread.id)} className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer" title="Archive">
                                    <Archive size={13} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
                            {selectedThread.messages?.map(msg => (
                                <div key={msg.id} className={`max-w-[80%] ${msg.direction === 'outbound' ? 'ml-auto' : 'mr-auto'}`}>
                                    <div className="p-3 rounded-xl text-xs leading-relaxed" style={{
                                        background: msg.direction === 'outbound' ? '#111827' : '#FFFFFF',
                                        color: msg.direction === 'outbound' ? '#FFFFFF' : '#374151',
                                        border: msg.direction === 'inbound' ? '1px solid #D1CBC5' : 'none',
                                    }}>
                                        <div className="text-[10px] mb-1.5" style={{ color: msg.direction === 'outbound' ? '#9CA3AF' : '#6B7280' }}>
                                            {msg.from_name || msg.from_email} &middot; {new Date(msg.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: msg.body_html }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply */}
                        <div className="shrink-0 bg-white" style={{ borderTop: '1px solid #D1CBC5' }}>
                            {!showReply ? (
                                <button onClick={() => setShowReply(true)} className="w-full p-3 text-left text-xs text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors font-medium">
                                    Click to reply to {selectedThread.contact_name || selectedThread.contact_email}...
                                </button>
                            ) : (
                                <div className="p-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] text-gray-400">
                                            Replying as <strong className="text-gray-600">{selectedThread.account?.email}</strong>
                                        </div>
                                        <div ref={templatePickerRef} className="relative">
                                            <button
                                                onClick={() => setShowTemplatePicker(v => !v)}
                                                className="flex items-center gap-1 text-[10px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none"
                                            >
                                                <FileText size={11} /> Load from Template
                                            </button>
                                            {showTemplatePicker && (
                                                <div
                                                    className="absolute top-full right-0 mt-1 bg-white overflow-y-auto max-h-[280px] z-50"
                                                    style={{ border: '1px solid #D1CBC5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '260px' }}
                                                >
                                                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400" style={{ borderBottom: '1px solid #F0EBE3', background: '#FAFAF8' }}>
                                                        {templates.length > 0 ? `Choose template (${templates.length})` : 'No templates yet'}
                                                    </div>
                                                    {templates.length > 0 ? (
                                                        templates.map(t => (
                                                            <button
                                                                key={t.id}
                                                                onClick={() => insertTemplate(t)}
                                                                className="w-full text-left px-3 py-2 cursor-pointer transition-colors hover:bg-[#F5F1EA] bg-transparent border-none"
                                                                style={{ borderBottom: '1px solid #F0EBE3' }}
                                                            >
                                                                <div className="text-xs font-semibold text-gray-900 truncate">{t.name}</div>
                                                                <div className="text-[10px] text-gray-500 truncate mt-0.5">{t.subject || '(no subject)'}</div>
                                                                {t.category && (
                                                                    <span className="text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{t.category}</span>
                                                                )}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-3 py-3">
                                                            <p className="text-[10px] text-gray-500 mb-2">Save frequent replies as templates in the Templates page to reuse them here.</p>
                                                            <a href="/dashboard/sequencer/templates" target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline">Create your first template →</a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <RichTextEditor content={replyHtml} onChange={setReplyHtml} placeholder="Write your reply..." personalizationTokens={[]} signatures={signatures} />
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => { setShowReply(false); setReplyHtml(''); }} className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
                                        <button onClick={sendReplyAction} disabled={!replyHtml.trim() || sending} className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30">
                                            <Send size={11} /> {sending ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ==================== RIGHT: Lead Context ==================== */}
            {selectedThread && (
                <div className="w-[240px] shrink-0 bg-white overflow-y-auto scrollbar-hide" style={{ borderLeft: '1px solid #D1CBC5' }}>
                    <div className="p-3" style={{ borderBottom: '1px solid #E8E3DC' }}>
                        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
                    </div>
                    <div className="p-3 flex flex-col gap-3">
                        {leadContext?.lead_id ? (
                            <Link
                                href={`/dashboard/sequencer/contacts/${leadContext.lead_id}`}
                                className="flex items-center gap-2.5 -mx-1 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
                                title="Open contact details"
                            >
                                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-900 text-white text-sm font-bold shrink-0">
                                    {(selectedThread.contact_name || selectedThread.contact_email)[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-700 group-hover:underline">{selectedThread.contact_name || selectedThread.contact_email.split('@')[0]}</div>
                                    <div className="text-[10px] text-gray-500 truncate group-hover:text-blue-600">{selectedThread.contact_email}</div>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-900 text-white text-sm font-bold shrink-0">
                                    {(selectedThread.contact_name || selectedThread.contact_email)[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold text-gray-900 truncate">{selectedThread.contact_name || selectedThread.contact_email.split('@')[0]}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{selectedThread.contact_email}</div>
                                </div>
                            </div>
                        )}

                        {leadContext ? (
                            <div className="flex flex-col gap-2">
                                <div className="h-px" style={{ background: '#E8E3DC' }} />
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Details</h4>
                                <div className="flex flex-col gap-1.5">
                                    {leadContext.company && <div className="flex items-center gap-2"><Building2 size={10} className="text-gray-400 shrink-0" /><span className="text-[10px] text-gray-700">{leadContext.company}</span></div>}
                                    {leadContext.title && <div className="flex items-center gap-2"><User size={10} className="text-gray-400 shrink-0" /><span className="text-[10px] text-gray-700">{leadContext.title}</span></div>}
                                    {leadContext.esp_bucket && <div className="flex items-center gap-2"><Globe size={10} className="text-gray-400 shrink-0" /><span className="text-[10px] text-gray-700 capitalize">{leadContext.esp_bucket}</span></div>}
                                </div>

                                <div className="h-px" style={{ background: '#E8E3DC' }} />
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Campaign</h4>
                                <div className="flex flex-col gap-1.5">
                                    {selectedThread.campaign_name && <div className="flex items-center gap-2"><Tag size={10} className="text-gray-400 shrink-0" /><span className="text-[10px] text-gray-700">{selectedThread.campaign_name}</span></div>}
                                    <div className="flex items-center gap-2"><BarChart3 size={10} className="text-gray-400 shrink-0" /><span className="text-[10px] text-gray-700">Step {leadContext.current_step} &middot; {leadContext.status}</span></div>
                                </div>

                                <div className="h-px" style={{ background: '#E8E3DC' }} />
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Engagement</h4>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <div className="text-center p-1.5 rounded-lg" style={{ background: '#F7F2EB' }}>
                                        <div className="text-sm font-bold text-gray-900">{leadContext.opened_count}</div>
                                        <div className="text-[8px] text-gray-400">Opens</div>
                                    </div>
                                    <div className="text-center p-1.5 rounded-lg" style={{ background: '#F7F2EB' }}>
                                        <div className="text-sm font-bold text-gray-900">{leadContext.clicked_count}</div>
                                        <div className="text-[8px] text-gray-400">Clicks</div>
                                    </div>
                                    <div className="text-center p-1.5 rounded-lg" style={{ background: '#F7F2EB' }}>
                                        <div className="text-sm font-bold text-gray-900">{leadContext.replied_at ? '1' : '0'}</div>
                                        <div className="text-[8px] text-gray-400">Replies</div>
                                    </div>
                                </div>

                                {leadContext.validation_status && (
                                    <>
                                        <div className="h-px" style={{ background: '#E8E3DC' }} />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400">Validation</span>
                                            <span className="text-[10px] font-semibold capitalize" style={{ color: leadContext.validation_status === 'valid' ? '#059669' : leadContext.validation_status === 'risky' ? '#D97706' : '#DC2626' }}>{leadContext.validation_status}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-[10px] text-gray-400 text-center py-4">No campaign data linked</div>
                        )}

                        <div className="h-px" style={{ background: '#E8E3DC' }} />
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sent From</h4>
                        <div className="flex items-center gap-2">
                            <Mail size={10} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                                <div className="text-[10px] text-gray-700 truncate">{selectedThread.account?.email}</div>
                                <div className="text-[9px] text-gray-400 capitalize">{selectedThread.account?.provider}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

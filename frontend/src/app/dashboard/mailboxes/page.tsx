'use client';
import { useEffect, useState, useCallback } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import MailboxesEmptyState from '@/components/dashboard/MailboxesEmptyState';
import FindingsCard from '@/components/dashboard/FindingsCard';
import { apiClient } from '@/lib/api';
import type { Mailbox, Campaign, Domain, PaginatedResponse } from '@/types/api';
import { getStatusColors } from '@/lib/statusColors';
import { PlatformBadge, getPlatformLabel } from '@/components/ui/PlatformBadge';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import BounceAnalytics from '@/components/dashboard/BounceAnalytics';
import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import { usePagination } from '@/hooks/usePagination';
import { useCampaignList } from '@/hooks/useCampaignList';

// Map raw connection errors to user-friendly resolution guidance (platform-aware)
function getConnectionResolution(error: string | null | undefined, platform?: string): { cause: string; resolution: string } {
    const name = getPlatformLabel(platform);
    if (!error) return { cause: 'Unknown connection issue', resolution: `Check email account settings in ${name}.` };
    const e = error.toLowerCase();
    if (e.includes('invalid_grant') || e.includes('refresh') && e.includes('token')) {
        return {
            cause: 'Google OAuth token expired or revoked',
            resolution: `Re-authorize this email account in ${name}. The Google account password may have changed or access was revoked.`
        };
    }
    if (e.includes('authentication') || e.includes('auth') && e.includes('fail')) {
        return {
            cause: 'Email authentication failed',
            resolution: `Check the email password in ${name}. If using an app password, regenerate it.`
        };
    }
    if (e.includes('connection refused') || e.includes('econnrefused')) {
        return {
            cause: 'SMTP/IMAP server unreachable',
            resolution: 'The mail server is refusing connections. Check DNS settings, firewall rules, or contact your email provider.'
        };
    }
    if (e.includes('timeout') || e.includes('timed out')) {
        return {
            cause: 'Connection timed out',
            resolution: `The mail server is not responding. This may be a temporary outage — try reconnecting in ${name} later.`
        };
    }
    if (e.includes('certificate') || e.includes('ssl') || e.includes('tls')) {
        return {
            cause: 'SSL/TLS certificate error',
            resolution: `The mail server\'s SSL certificate is invalid or expired. Check SMTP/IMAP port and encryption settings in ${name}.`
        };
    }
    return {
        cause: error,
        resolution: `Check this email account\'s settings in ${name} and try reconnecting.`
    };
}

export default function MailboxesPage() {
    const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
    const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const { campaigns } = useCampaignList();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Sorting & Filtering (delegated to useSortFilterModal hook)
    const sortFilter = useSortFilterModal({
        sortBy: 'email_asc',
        domainId: 'all',
        warmupStatus: 'all',
        minEngagement: '',
        maxEngagement: '',
    });

    // Pagination & Selection (delegated to usePagination hook)
    const { meta, setMeta, toggleSelection, toggleSelectAll, isSelected, isAllSelected } = usePagination();

    const fetchMailboxes = useCallback(async () => {
        const { sortBy, domainId, warmupStatus, minEngagement, maxEngagement } = sortFilter.values;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: meta.page.toString(),
                limit: meta.limit.toString()
            });

            // Add filters
            if (selectedCampaign !== 'all') params.append('campaignId', selectedCampaign);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            // Add sort & filter parameters
            params.append('sortBy', sortBy);
            if (domainId !== 'all') params.append('domainId', domainId);
            if (warmupStatus !== 'all') params.append('warmupStatus', warmupStatus);
            if (minEngagement) params.append('minEngagement', minEngagement);
            if (maxEngagement) params.append('maxEngagement', maxEngagement);

            const data = await apiClient<PaginatedResponse<Mailbox>>(`/api/dashboard/mailboxes?${params}`);
            if (data?.data) {
                setMailboxes(data.data);
                setMeta(data.meta);
                if (data.data.length > 0 && !selectedMailbox) {
                    setSelectedMailbox(data.data[0]);
                }
            } else {
                setMailboxes(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch mailboxes:', err);
            setMailboxes([]);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, selectedCampaign, selectedStatus, searchQuery, sortFilter.values, selectedMailbox]);

    useEffect(() => {
        fetchMailboxes();
    }, [fetchMailboxes]);

    // Auto-refresh when infrastructure assessment completes
    useEffect(() => {
        const handler = () => fetchMailboxes();
        window.addEventListener('assessment-complete', handler);
        return () => window.removeEventListener('assessment-complete', handler);
    }, [fetchMailboxes]);

    // Fetch domains for filter dropdown
    useEffect(() => {
        apiClient<{ data: Domain[] }>('/api/dashboard/domains?limit=1000')
            .then(data => {
                if (data?.data) {
                    setDomains(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch domains:', err));
    }, []);

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleApplySortFilter = () => {
        sortFilter.apply();
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        sortFilter.clear();
        setMeta(prev => ({ ...prev, page: 1 }));
    };

    if (loading && mailboxes.length === 0) {
        return <div className="p-8"><LoadingSkeleton type="table" rows={8} /></div>;
    }

    if (!loading && (!mailboxes || mailboxes.length === 0)) {
        return <MailboxesEmptyState />;
    }

    return (
        <div className="flex h-full gap-8">
            {/* Left: List */}
            <div className="premium-card w-[420px] flex flex-col p-6 h-full overflow-hidden rounded-3xl">
                <h2 className="text-2xl font-bold mb-4 shrink-0 text-gray-900">Mailboxes</h2>

                {/* Filters */}
                <div className="mb-4 flex flex-col gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full px-4 py-[0.625rem] rounded-xl border border-gray-200 bg-white text-sm outline-none"
                    />

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full px-4 py-[0.625rem] rounded-xl border border-gray-200 bg-white text-sm cursor-pointer outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="healthy">Healthy</option>
                        <option value="warning">Warning</option>
                        <option value="paused">Paused</option>
                    </select>

                    {/* Campaign Filter */}
                    <select
                        value={selectedCampaign}
                        onChange={(e) => {
                            setSelectedCampaign(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        className="w-full px-4 py-[0.625rem] rounded-xl border border-gray-200 bg-white text-sm cursor-pointer outline-none"
                    >
                        <option value="all">All Campaigns</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Sort & Filter Button */}
                    <button
                        onClick={sortFilter.open}
                        className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-50 hover:border-blue-300"
                    >
                        <span className="text-base">⚙️</span>
                        Sort & Filter
                        {sortFilter.hasActiveFilters && (
                            <span className="bg-blue-500 text-white text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold">
                                Active
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-3 px-2 pb-3 border-b border-gray-100 mb-3">
                    <input
                        type="checkbox"
                        checked={isAllSelected(mailboxes)}
                        onChange={() => toggleSelectAll(mailboxes)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: '#2563EB' }}
                    />
                    <span className="text-[0.8rem] text-gray-500 font-medium">Select All ({mailboxes.length})</span>
                </div>

                <div className="scrollbar-hide overflow-y-auto flex-1 flex flex-col gap-3 pr-2">
                    {mailboxes.map(mb => (
                        <div
                            key={mb.id}
                            onClick={() => setSelectedMailbox(mb)}
                            className="p-4 rounded-2xl cursor-pointer border shrink-0 flex items-center gap-3 hover:shadow-md"
                            style={{
                                background: selectedMailbox?.id === mb.id ? '#EFF6FF' : '#FFFFFF',
                                borderColor: selectedMailbox?.id === mb.id ? '#BFDBFE' : '#F3F4F6',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected(mb.id)}
                                onClick={(e) => toggleSelection(e, mb.id)}
                                onChange={() => { }}
                                className="w-4 h-4 cursor-pointer"
                                style={{ accentColor: '#2563EB' }}
                            />
                            {/* Status dot */}
                            <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{
                                background: mb.status === 'healthy' ? '#22C55E' : mb.status === 'warning' ? '#F59E0B' : '#EF4444',
                                boxShadow: mb.status === 'healthy' ? '0 0 6px rgba(34,197,94,0.4)' : mb.status === 'paused' ? '0 0 6px rgba(239,68,68,0.4)' : 'none'
                            }} title={mb.status === 'healthy' ? 'Connected' : mb.status === 'paused' ? 'Disconnected' : mb.status} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold break-all text-slate-800 text-[0.9rem]">{mb.email}</span>
                                    {mb.source_platform && <PlatformBadge platform={mb.source_platform} />}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="opacity-70">Domain:</span>
                                    <span className="font-medium">{mb.domain?.domain}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {mailboxes.length === 0 && <div className="text-gray-400 text-center p-8 italic">No mailboxes found.</div>}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {selectedMailbox ? (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <h1 className="text-4xl font-extrabold mb-2 text-gray-900" style={{ letterSpacing: '-0.025em' }}>{selectedMailbox.email}</h1>
                            <div className="text-gray-500 text-[1.1rem]">Mailbox Health & Usage</div>
                        </div>

                        {/* Pause Reason Banner — shown when Drason's automation paused the mailbox */}
                        {selectedMailbox.status === 'paused' && selectedMailbox.paused_reason && (
                            <div className="mb-8 rounded-2xl border border-yellow-300" style={{
                                padding: '1.25rem 1.5rem',
                                background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                            }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">⏸</span>
                                    <h3 className="text-[1.1rem] font-bold m-0" style={{ color: '#92400E' }}>Paused by Drason</h3>
                                </div>
                                <div className="grid gap-2 text-[0.9rem]">
                                    <div className="leading-normal" style={{ color: '#78350F' }}>{selectedMailbox.paused_reason}</div>
                                    {selectedMailbox.paused_at && (
                                        <div className="text-[0.8rem]" style={{ color: '#92400E' }}>
                                            Paused: {new Date(selectedMailbox.paused_at).toLocaleString()}
                                            {selectedMailbox.paused_by && ` · By: ${selectedMailbox.paused_by}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Connection Diagnostic Card — shown when mailbox is disconnected */}
                        {selectedMailbox.status === 'paused' && (selectedMailbox.smtp_status === false || selectedMailbox.imap_status === false) && (() => {
                            const { cause, resolution } = getConnectionResolution(selectedMailbox.connection_error, selectedMailbox.source_platform);
                            return (
                                <div className="mb-8 rounded-2xl" style={{
                                    padding: '1.25rem 1.5rem',
                                    background: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
                                    border: '1px solid #FECACA',
                                }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">⚠️</span>
                                        <h3 className="text-[1.1rem] font-bold m-0" style={{ color: '#991B1B' }}>Connection Failed</h3>
                                    </div>

                                    <div className="grid gap-3 text-[0.9rem]">
                                        {/* What happened */}
                                        <div>
                                            <div className="font-semibold mb-1" style={{ color: '#7F1D1D' }}>
                                                {!selectedMailbox.smtp_status && !selectedMailbox.imap_status ? 'SMTP & IMAP failed' :
                                                    !selectedMailbox.smtp_status ? 'SMTP connection failed' : 'IMAP connection failed'}
                                            </div>
                                            <div style={{ color: '#991B1B' }}>{cause}</div>
                                        </div>

                                        {/* Impact */}
                                        <div className="p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                            <div className="font-semibold mb-1" style={{ color: '#92400E' }}>📋 Impact</div>
                                            <div className="leading-normal" style={{ color: '#78350F' }}>
                                                This mailbox is paused inside its campaigns. Leads assigned to this mailbox are being rotated to other active mailboxes in the campaign.
                                            </div>
                                        </div>

                                        {/* How to fix */}
                                        <div className="p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                            <div className="font-semibold mb-2" style={{ color: '#166534' }}>✅ Quick Fix</div>
                                            <div className="leading-normal mb-3" style={{ color: '#14532D' }}>
                                                Reconnect this email account in {getPlatformLabel(selectedMailbox.source_platform)}, then trigger a Manual Sync in Drason.
                                            </div>
                                            <a
                                                href={`/docs/help/connection-errors${selectedMailbox.connection_error?.includes('invalid_grant') || selectedMailbox.connection_error?.includes('refresh') ? '#google-oauth' :
                                                        selectedMailbox.connection_error?.includes('Authentication') || selectedMailbox.connection_error?.includes('credentials') ? '#auth-failed' :
                                                            selectedMailbox.connection_error?.includes('refused') || selectedMailbox.connection_error?.includes('ECONNREFUSED') ? '#connection-refused' :
                                                                selectedMailbox.connection_error?.includes('timeout') || selectedMailbox.connection_error?.includes('ETIMEDOUT') ? '#timeout' :
                                                                    selectedMailbox.connection_error?.includes('SSL') || selectedMailbox.connection_error?.includes('certificate') ? '#ssl-tls' :
                                                                        '#error-types'
                                                    }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-semibold no-underline rounded-[10px] transition-all duration-200"
                                                style={{
                                                    padding: '0.625rem 1.25rem',
                                                    background: 'linear-gradient(135deg, #166534, #15803D)',
                                                    color: '#FFFFFF',
                                                    boxShadow: '0 2px 8px rgba(22, 101, 52, 0.3)',
                                                }}
                                            >
                                                How to Fix →
                                            </a>
                                        </div>

                                        {/* Affected campaigns */}
                                        {selectedMailbox.campaigns && selectedMailbox.campaigns.length > 0 && (
                                            <div className="p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.6)' }}>
                                                <div className="font-semibold mb-2" style={{ color: '#1E40AF' }}>🎯 Affected Campaigns</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedMailbox.campaigns.map((c: Pick<Campaign, 'id' | 'name' | 'status'>) => (
                                                        <span key={c.id} className="py-1 px-3 rounded-full text-[0.8rem] font-medium" style={{
                                                            background: '#EFF6FF',
                                                            color: '#1E40AF',
                                                            border: '1px solid #BFDBFE'
                                                        }}>{c.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="premium-card">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Associated Domain</h3>
                                <div className="text-2xl font-bold text-slate-800 mb-2">{selectedMailbox.domain?.domain}</div>
                                <div className="flex gap-2 flex-wrap">
                                    {/* Domain status badge */}
                                    <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full text-[0.8rem] font-semibold" style={{
                                        ...getStatusColors(selectedMailbox.domain?.status || 'unknown')
                                    }}>
                                        <span className="w-2 h-2 rounded-full" style={{ background: 'currentColor' }}></span>
                                        Domain: {selectedMailbox.domain?.status?.toUpperCase()}
                                    </div>
                                    {/* Mailbox connection status badge */}
                                    <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full text-[0.8rem] font-semibold" style={{
                                        ...getStatusColors(selectedMailbox.status || 'unknown')
                                    }}>
                                        <span className="w-2 h-2 rounded-full" style={{ background: 'currentColor' }}></span>
                                        {selectedMailbox.status === 'healthy' ? 'CONNECTED' : 'DISCONNECTED'}
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">Activity Stats</h3>
                                <div className="grid gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Total Sent</span>
                                        <span className="font-semibold text-slate-800">{(selectedMailbox.total_sent_count || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Sent (Window)</span>
                                        <span className="font-semibold text-slate-800">{selectedMailbox.window_sent_count ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Bounces</span>
                                        <span className="font-semibold text-red-500">{selectedMailbox.hard_bounce_count ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Failures</span>
                                        <span className="font-semibold text-amber-500">{selectedMailbox.delivery_failure_count ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                        <span className="text-slate-500">Bounce Rate</span>
                                        <span style={{
                                            fontWeight: 700,
                                            color: (selectedMailbox.total_sent_count || 0) > 0 && ((selectedMailbox.hard_bounce_count || 0) / (selectedMailbox.total_sent_count || 1)) < 0.02 ? '#16A34A' :
                                                (selectedMailbox.total_sent_count || 0) > 0 && ((selectedMailbox.hard_bounce_count || 0) / (selectedMailbox.total_sent_count || 1)) < 0.03 ? '#F59E0B' : '#EF4444',
                                        }}>
                                            {(selectedMailbox.total_sent_count || 0) > 0
                                                ? (((selectedMailbox.hard_bounce_count || 0) / (selectedMailbox.total_sent_count || 1)) * 100).toFixed(1)
                                                : '0.0'}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Metrics Section (SOFT SIGNALS - informational only) */}
                        <div className="premium-card mb-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Engagement Metrics
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Lifetime engagement from emails sent via this mailbox (informational only)
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Opens */}
                                <div className="p-4 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#1E40AF' }}>
                                        Total Opens
                                    </div>
                                    <div className="text-[1.75rem] font-bold" style={{ color: '#1E3A8A' }}>
                                        {selectedMailbox.open_count_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Clicks */}
                                <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#166534' }}>
                                        Total Clicks
                                    </div>
                                    <div className="text-[1.75rem] font-bold" style={{ color: '#15803D' }}>
                                        {selectedMailbox.click_count_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Replies */}
                                <div className="p-4 rounded-xl" style={{ background: '#FDF4FF', border: '1px solid #F0ABFC' }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#86198F' }}>
                                        Total Replies
                                    </div>
                                    <div className="text-[1.75rem] font-bold" style={{ color: '#A21CAF' }}>
                                        {selectedMailbox.reply_count_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>
                            </div>

                            {/* Spam & Warmup Row */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {/* Spam Count */}
                                <div className="p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#991B1B' }}>
                                        Spam Reports
                                    </div>
                                    <div className="text-[1.75rem] font-bold" style={{ color: '#DC2626' }}>
                                        {selectedMailbox.spam_count?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Warmup Status */}
                                <div className="p-4 rounded-xl border border-gray-200" style={{ background: '#F9FAFB' }}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-gray-500">
                                        Warmup Status
                                    </div>
                                    <div className="text-base font-semibold text-gray-900 mb-1">
                                        {selectedMailbox.warmup_status || 'Not configured'}
                                    </div>
                                    {selectedMailbox.warmup_reputation && (
                                        <div className="text-xs text-gray-500">
                                            Reputation: {selectedMailbox.warmup_reputation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recovery Status */}
                        {selectedMailbox.recovery_phase && selectedMailbox.recovery_phase !== 'healthy' && (
                            <div className="premium-card mb-8">
                                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                                    🔄 Recovery Status
                                    <span className="py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wide border" style={{
                                        background: selectedMailbox.recovery_phase === 'paused' ? '#FEF2F2' :
                                            selectedMailbox.recovery_phase === 'quarantine' ? '#FEF2F2' :
                                                selectedMailbox.recovery_phase === 'restricted_send' ? '#FFF7ED' :
                                                    '#ECFDF5',
                                        color: selectedMailbox.recovery_phase === 'paused' ? '#DC2626' :
                                            selectedMailbox.recovery_phase === 'quarantine' ? '#DC2626' :
                                                selectedMailbox.recovery_phase === 'restricted_send' ? '#F59E0B' :
                                                    '#16A34A',
                                        borderColor: selectedMailbox.recovery_phase === 'paused' ? '#FEE2E2' :
                                            selectedMailbox.recovery_phase === 'quarantine' ? '#FEE2E2' :
                                                selectedMailbox.recovery_phase === 'restricted_send' ? '#FED7AA' :
                                                    '#BBF7D0',
                                    }}>
                                        {selectedMailbox.recovery_phase.replace('_', ' ')}
                                    </span>
                                </h2>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {/* Resilience Score */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase">Resilience</div>
                                        <div className="text-[1.75rem] font-extrabold" style={{
                                            color: (selectedMailbox.resilience_score || 0) >= 70 ? '#16A34A' :
                                                (selectedMailbox.resilience_score || 0) >= 30 ? '#F59E0B' : '#EF4444',
                                        }}>
                                            {selectedMailbox.resilience_score || 0}
                                        </div>
                                    </div>

                                    {/* Bounce Rate */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase">Bounce Rate</div>
                                        <div className="text-[1.75rem] font-extrabold" style={{
                                            color: (selectedMailbox.total_sent_count || 0) > 0 && ((selectedMailbox.hard_bounce_count || 0) / (selectedMailbox.total_sent_count || 1)) < 0.02 ? '#16A34A' :
                                                (selectedMailbox.total_sent_count || 0) > 0 && ((selectedMailbox.hard_bounce_count || 0) / (selectedMailbox.total_sent_count || 1)) < 0.03 ? '#F59E0B' : '#EF4444',
                                        }}>
                                            {(selectedMailbox.total_sent_count || 0) > 0
                                                ? (((selectedMailbox.hard_bounce_count || 0) / (selectedMailbox.total_sent_count || 1)) * 100).toFixed(1)
                                                : '0.0'}%
                                        </div>
                                    </div>

                                    {/* Clean Sends / Graduation Progress */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase">
                                            {selectedMailbox.recovery_phase === 'restricted_send' || selectedMailbox.recovery_phase === 'warm_recovery' ? 'Graduation Progress' : 'Clean Sends'}
                                        </div>
                                        <div className="text-[1.75rem] font-extrabold text-slate-800">
                                            {selectedMailbox.clean_sends_since_phase || 0}
                                            {selectedMailbox.recovery_phase === 'restricted_send' && `/${(selectedMailbox.consecutive_pauses || 0) > 1 ? 25 : 15}`}
                                            {selectedMailbox.recovery_phase === 'warm_recovery' && `/50`}
                                        </div>
                                    </div>

                                    {/* Relapse Count */}
                                    {(selectedMailbox.relapse_count || 0) > 0 && (
                                        <div className="p-4 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                                            <div className="text-xs mb-2 font-semibold uppercase" style={{ color: '#DC2626' }}>Relapses</div>
                                            <div className="text-[1.75rem] font-extrabold" style={{ color: '#DC2626' }}>
                                                {selectedMailbox.relapse_count}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Automated Warmup Banner */}
                                {(selectedMailbox.recovery_phase === 'restricted_send' || selectedMailbox.recovery_phase === 'warm_recovery') && (
                                    <div className="rounded-xl mb-4" style={{
                                        padding: '0.875rem 1rem',
                                        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                                        border: '1px solid #7DD3FC',
                                    }}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl">🤖</span>
                                            <div>
                                                <div className="text-sm font-semibold mb-1" style={{ color: '#0369A1' }}>
                                                    Automated Warmup Active
                                                </div>
                                                <div className="text-xs leading-normal" style={{ color: '#075985' }}>
                                                    {selectedMailbox.recovery_phase === 'restricted_send' &&
                                                        `${getPlatformLabel(selectedMailbox.source_platform)} is sending 10 warmup emails/day. System will auto-graduate after 15-25 clean sends (zero bounces).`}
                                                    {selectedMailbox.recovery_phase === 'warm_recovery' &&
                                                        `${getPlatformLabel(selectedMailbox.source_platform)} is sending 50 warmup emails/day (+5/day rampup). System will auto-graduate after 50 clean sends over 3+ days.`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Next Phase Preview */}
                                {selectedMailbox.recovery_phase !== 'healthy' && (
                                    <div className="rounded-xl flex items-center gap-2" style={{
                                        padding: '0.875rem 1rem',
                                        background: '#EFF6FF',
                                        border: '1px solid #BFDBFE',
                                    }}>
                                        <span className="text-base opacity-70">→</span>
                                        <div className="text-[0.85rem] font-semibold" style={{ color: '#1E40AF' }}>
                                            {selectedMailbox.recovery_phase === 'paused' && 'Next: Quarantine (after cooldown)'}
                                            {selectedMailbox.recovery_phase === 'quarantine' && 'Next: Restricted Send (DNS check required)'}
                                            {selectedMailbox.recovery_phase === 'restricted_send' && `Next: Warm Recovery (need ${Math.max(0, ((selectedMailbox.consecutive_pauses || 0) > 1 ? 25 : 15) - (selectedMailbox.clean_sends_since_phase || 0))} more clean sends)`}
                                            {selectedMailbox.recovery_phase === 'warm_recovery' && `Next: Healthy (need ${Math.max(0, 50 - (selectedMailbox.clean_sends_since_phase || 0))} more sends, 3+ days, <2% bounce)`}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="premium-card mb-8">
                            <h2 className="text-xl font-bold mb-6 text-gray-900">Active Campaigns</h2>
                            {selectedMailbox.campaigns && selectedMailbox.campaigns.length > 0 ? (
                                <div className="grid gap-2">
                                    {selectedMailbox.campaigns.map((c: Pick<Campaign, 'id' | 'name' | 'status'>) => (
                                        <div key={c.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50">
                                            <span className="font-semibold text-slate-800">{c.name}</span>
                                            <span className="text-gray-400 text-xs font-mono bg-white py-1 px-2 rounded border border-slate-200">ID: {c.id}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 italic rounded-xl" style={{ background: '#F9FAFB', border: '1px dashed #E5E7EB' }}>
                                    No campaigns assigned.
                                </div>
                            )}
                        </div>

                        {/* Bounce Event Details */}
                        <BounceAnalytics mailboxId={selectedMailbox.id} />

                        {/* Infrastructure Health Issues */}
                        <FindingsCard entityType="mailbox" entityId={selectedMailbox.id} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="text-5xl">👈</div>
                        <div className="text-xl font-medium">Select a mailbox to view details</div>
                    </div>
                )}
            </div>

            {/* Sort & Filter Modal */}
            {sortFilter.isOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
                    style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => sortFilter.close()}
                >
                    <div
                        className="bg-white rounded-3xl max-w-[500px] w-full max-h-[90vh] overflow-hidden flex flex-col"
                        style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 m-0">
                                ⚙️ Sort & Filter Mailboxes
                            </h2>
                            <button
                                onClick={() => sortFilter.close()}
                                className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-1 leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Sort By */}
                            <div className="mb-6">
                                <label htmlFor="modal-sort-by" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    id="modal-sort-by"
                                    value={sortFilter.temp.sortBy}
                                    onChange={(e) => sortFilter.setTempValue('sortBy', e.target.value)}
                                    className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm cursor-pointer outline-none"
                                >
                                    <option value="email_asc">Email (A-Z)</option>
                                    <option value="email_desc">Email (Z-A)</option>
                                    <option value="sent_desc">Sent (High to Low)</option>
                                    <option value="sent_asc">Sent (Low to High)</option>
                                    <option value="engagement_desc">Engagement (High to Low)</option>
                                    <option value="engagement_asc">Engagement (Low to High)</option>
                                    <option value="bounce_desc">Bounce (High to Low)</option>
                                    <option value="bounce_asc">Bounce (Low to High)</option>
                                </select>
                            </div>

                            {/* Domain Filter */}
                            <div className="mb-6">
                                <label htmlFor="modal-domain" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Domain
                                </label>
                                <select
                                    id="modal-domain"
                                    value={sortFilter.temp.domainId}
                                    onChange={(e) => sortFilter.setTempValue('domainId', e.target.value)}
                                    className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm cursor-pointer outline-none"
                                >
                                    <option value="all">All Domains</option>
                                    {domains.map(d => (
                                        <option key={d.id} value={d.id}>{d.domain}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Warmup Status Filter */}
                            <div className="mb-6">
                                <label htmlFor="modal-warmup" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Warmup Status
                                </label>
                                <select
                                    id="modal-warmup"
                                    value={sortFilter.temp.warmupStatus}
                                    onChange={(e) => sortFilter.setTempValue('warmupStatus', e.target.value)}
                                    className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm cursor-pointer outline-none"
                                >
                                    <option value="all">All Warmup Status</option>
                                    <option value="enabled">Enabled</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>

                            {/* Engagement Rate Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Engagement Rate Range (%)
                                </label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={sortFilter.temp.minEngagement}
                                        onChange={(e) => sortFilter.setTempValue('minEngagement', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                    />
                                    <span className="text-gray-500 text-base font-medium">→</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={sortFilter.temp.maxEngagement}
                                        onChange={(e) => sortFilter.setTempValue('maxEngagement', e.target.value)}
                                        min="0"
                                        max="100"
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={handleClearFilters}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApplySortFilter}
                                className="flex-1 py-3 px-4 rounded-xl border-none bg-blue-500 text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-600"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

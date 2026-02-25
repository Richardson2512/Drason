'use client';
import { useEffect, useState, useCallback } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import MailboxesEmptyState from '@/components/dashboard/MailboxesEmptyState';
import FindingsCard from '@/components/dashboard/FindingsCard';
import { apiClient } from '@/lib/api';
import { getStatusColors } from '@/lib/statusColors';

// Map raw Smartlead errors to user-friendly resolution guidance
function getConnectionResolution(error: string | null | undefined): { cause: string; resolution: string } {
    if (!error) return { cause: 'Unknown connection issue', resolution: 'Check email account settings in Smartlead.' };
    const e = error.toLowerCase();
    if (e.includes('invalid_grant') || e.includes('refresh') && e.includes('token')) {
        return {
            cause: 'Google OAuth token expired or revoked',
            resolution: 'Re-authorize this email account in Smartlead → Email Accounts → Reconnect. The Google account password may have changed or access was revoked.'
        };
    }
    if (e.includes('authentication') || e.includes('auth') && e.includes('fail')) {
        return {
            cause: 'Email authentication failed',
            resolution: 'Check the email password in Smartlead → Email Accounts. If using an app password, regenerate it.'
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
            resolution: 'The mail server is not responding. This may be a temporary outage — try reconnecting in Smartlead later.'
        };
    }
    if (e.includes('certificate') || e.includes('ssl') || e.includes('tls')) {
        return {
            cause: 'SSL/TLS certificate error',
            resolution: 'The mail server\'s SSL certificate is invalid or expired. Check SMTP/IMAP port and encryption settings in Smartlead.'
        };
    }
    return {
        cause: error,
        resolution: 'Check this email account\'s settings in Smartlead → Email Accounts and try reconnecting.'
    };
}

export default function MailboxesPage() {
    const [mailboxes, setMailboxes] = useState<any[]>([]);
    const [selectedMailbox, setSelectedMailbox] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [domains, setDomains] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Sorting & Filtering State
    const [sortBy, setSortBy] = useState('email_asc');
    const [domainId, setDomainId] = useState<string>('all');
    const [warmupStatus, setWarmupStatus] = useState<string>('all');
    const [minEngagement, setMinEngagement] = useState<string>('');
    const [maxEngagement, setMaxEngagement] = useState<string>('');

    // Modal State
    const [showSortModal, setShowSortModal] = useState(false);
    const [tempSortBy, setTempSortBy] = useState(sortBy);
    const [tempDomainId, setTempDomainId] = useState(domainId);
    const [tempWarmupStatus, setTempWarmupStatus] = useState(warmupStatus);
    const [tempMinEngagement, setTempMinEngagement] = useState(minEngagement);
    const [tempMaxEngagement, setTempMaxEngagement] = useState(maxEngagement);

    // Pagination & Selection
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedMailboxIds, setSelectedMailboxIds] = useState<Set<string>>(new Set());

    const fetchMailboxes = useCallback(async () => {
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

            const data = await apiClient<any>(`/api/dashboard/mailboxes?${params}`);
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
    }, [meta.page, meta.limit, selectedCampaign, selectedStatus, searchQuery, sortBy, domainId, warmupStatus, minEngagement, maxEngagement, selectedMailbox]);

    useEffect(() => {
        fetchMailboxes();
    }, [fetchMailboxes]);

    // Fetch campaigns and domains for filter dropdowns
    useEffect(() => {
        apiClient<any>('/api/dashboard/campaigns?limit=1000')
            .then(data => {
                if (data?.data) {
                    setCampaigns(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch campaigns:', err));

        apiClient<any>('/api/dashboard/domains?limit=1000')
            .then(data => {
                if (data?.data) {
                    setDomains(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch domains:', err));
    }, []);

    // Selection Logic
    const toggleMailboxSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedMailboxIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedMailboxIds(newSet);
    };

    const toggleSelectAll = () => {
        const allPageIds = mailboxes.map(mb => mb.id);
        const allSelected = allPageIds.every(id => selectedMailboxIds.has(id));
        const newSet = new Set(selectedMailboxIds);
        if (allSelected) {
            allPageIds.forEach(id => newSet.delete(id));
        } else {
            allPageIds.forEach(id => newSet.add(id));
        }
        setSelectedMailboxIds(newSet);
    };

    const isAllSelected = mailboxes.length > 0 && mailboxes.every(mb => selectedMailboxIds.has(mb.id));

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    // Sort & Filter Modal Handlers
    const handleOpenSortModal = () => {
        setTempSortBy(sortBy);
        setTempDomainId(domainId);
        setTempWarmupStatus(warmupStatus);
        setTempMinEngagement(minEngagement);
        setTempMaxEngagement(maxEngagement);
        setShowSortModal(true);
    };

    const handleApplySortFilter = () => {
        setSortBy(tempSortBy);
        setDomainId(tempDomainId);
        setWarmupStatus(tempWarmupStatus);
        setMinEngagement(tempMinEngagement);
        setMaxEngagement(tempMaxEngagement);
        setMeta(prev => ({ ...prev, page: 1 }));
        setShowSortModal(false);
    };

    const handleClearFilters = () => {
        setTempSortBy('email_asc');
        setTempDomainId('all');
        setTempWarmupStatus('all');
        setTempMinEngagement('');
        setTempMaxEngagement('');
        setSortBy('email_asc');
        setDomainId('all');
        setWarmupStatus('all');
        setMinEngagement('');
        setMaxEngagement('');
        setMeta(prev => ({ ...prev, page: 1 }));
        setShowSortModal(false);
    };

    if (loading && mailboxes.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Loading Mailboxes...</div>;
    }

    if (!loading && (!mailboxes || mailboxes.length === 0)) {
        return <MailboxesEmptyState />;
    }

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: List */}
            <div className="premium-card" style={{ width: '420px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', flexShrink: 0, color: '#111827' }}>Mailboxes</h2>

                {/* Filters */}
                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setMeta(prev => ({ ...prev, page: 1 }));
                        }}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
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
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="all">All Campaigns</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Sort & Filter Button */}
                    <button
                        onClick={handleOpenSortModal}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            color: '#111827',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        className="hover:bg-gray-50 hover:border-blue-300"
                    >
                        <span style={{ fontSize: '1rem' }}>⚙️</span>
                        Sort & Filter
                        {(sortBy !== 'email_asc' || domainId !== 'all' || warmupStatus !== 'all' || minEngagement || maxEngagement) && (
                            <span style={{
                                background: '#3B82F6',
                                color: 'white',
                                fontSize: '0.65rem',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '999px',
                                fontWeight: 700
                            }}>
                                Active
                            </span>
                        )}
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid #F3F4F6', marginBottom: '0.75rem' }}>
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>Select All ({mailboxes.length})</span>
                </div>

                <div className="scrollbar-hide" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                    {mailboxes.map(mb => (
                        <div
                            key={mb.id}
                            onClick={() => setSelectedMailbox(mb)}
                            style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                background: selectedMailbox?.id === mb.id ? '#EFF6FF' : '#FFFFFF',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedMailbox?.id === mb.id ? '#BFDBFE' : '#F3F4F6',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            className="hover:shadow-md"
                        >
                            <input
                                type="checkbox"
                                checked={selectedMailboxIds.has(mb.id)}
                                onClick={(e) => toggleMailboxSelection(e, mb.id)}
                                onChange={() => { }}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                            />
                            {/* Status dot */}
                            <span style={{
                                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                                background: mb.status === 'healthy' ? '#22C55E' : mb.status === 'warning' ? '#F59E0B' : '#EF4444',
                                boxShadow: mb.status === 'healthy' ? '0 0 6px rgba(34,197,94,0.4)' : mb.status === 'paused' ? '0 0 6px rgba(239,68,68,0.4)' : 'none'
                            }} title={mb.status === 'healthy' ? 'Connected' : mb.status === 'paused' ? 'Disconnected' : mb.status} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', wordBreak: 'break-all', color: '#1E293B', fontSize: '0.9rem' }}>{mb.email}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ opacity: 0.7 }}>Domain:</span>
                                    <span style={{ fontWeight: 500 }}>{mb.domain?.domain}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {mailboxes.length === 0 && <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>No mailboxes found.</div>}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #F3F4F6', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
                {selectedMailbox ? (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>{selectedMailbox.email}</h1>
                            <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Mailbox Health & Usage</div>
                        </div>

                        {/* Pause Reason Banner — shown when Drason's automation paused the mailbox */}
                        {selectedMailbox.status === 'paused' && selectedMailbox.paused_reason && (
                            <div style={{
                                margin: '0 0 2rem 0',
                                padding: '1.25rem 1.5rem',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                                border: '1px solid #FCD34D',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⏸</span>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400E', margin: 0 }}>Paused by Drason</h3>
                                </div>
                                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <div style={{ color: '#78350F', lineHeight: 1.5 }}>{selectedMailbox.paused_reason}</div>
                                    {selectedMailbox.paused_at && (
                                        <div style={{ color: '#92400E', fontSize: '0.8rem' }}>
                                            Paused: {new Date(selectedMailbox.paused_at).toLocaleString()}
                                            {selectedMailbox.paused_by && ` · By: ${selectedMailbox.paused_by}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Connection Diagnostic Card — shown when mailbox is disconnected */}
                        {selectedMailbox.status === 'paused' && (selectedMailbox.smtp_status === false || selectedMailbox.imap_status === false) && (() => {
                            const { cause, resolution } = getConnectionResolution(selectedMailbox.connection_error);
                            return (
                                <div style={{
                                    margin: '0 0 2rem 0',
                                    padding: '1.25rem 1.5rem',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #FEF2F2, #FFF1F2)',
                                    border: '1px solid #FECACA',
                                }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B', margin: 0 }}>Connection Failed</h3>
                                    </div>

                                    <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        {/* What happened */}
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#7F1D1D', marginBottom: '0.25rem' }}>
                                                {!selectedMailbox.smtp_status && !selectedMailbox.imap_status ? 'SMTP & IMAP failed' :
                                                    !selectedMailbox.smtp_status ? 'SMTP connection failed' : 'IMAP connection failed'}
                                            </div>
                                            <div style={{ color: '#991B1B' }}>{cause}</div>
                                        </div>

                                        {/* Impact */}
                                        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.6)', borderRadius: '10px' }}>
                                            <div style={{ fontWeight: 600, color: '#92400E', marginBottom: '0.25rem' }}>📋 Impact</div>
                                            <div style={{ color: '#78350F', lineHeight: 1.5 }}>
                                                This mailbox is paused inside its campaigns. Leads assigned to this mailbox are being rotated to other active mailboxes in the campaign.
                                            </div>
                                        </div>

                                        {/* How to fix */}
                                        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.6)', borderRadius: '10px' }}>
                                            <div style={{ fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>✅ Quick Fix</div>
                                            <div style={{ color: '#14532D', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                                                Reconnect this email account in Smartlead, then trigger a Manual Sync in Superkabe.
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
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.625rem 1.25rem',
                                                    background: 'linear-gradient(135deg, #166534, #15803D)',
                                                    color: '#FFFFFF',
                                                    borderRadius: '10px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                    boxShadow: '0 2px 8px rgba(22, 101, 52, 0.3)',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                How to Fix →
                                            </a>
                                        </div>

                                        {/* Affected campaigns */}
                                        {selectedMailbox.campaigns && selectedMailbox.campaigns.length > 0 && (
                                            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.6)', borderRadius: '10px' }}>
                                                <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '0.5rem' }}>🎯 Affected Campaigns</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {selectedMailbox.campaigns.map((c: any) => (
                                                        <span key={c.id} style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '999px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
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

                        <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                            <div className="premium-card">
                                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Associated Domain</h3>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>{selectedMailbox.domain?.domain}</div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {/* Domain status badge */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        ...getStatusColors(selectedMailbox.domain?.status || 'unknown')
                                    }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                                        Domain: {selectedMailbox.domain?.status?.toUpperCase()}
                                    </div>
                                    {/* Mailbox connection status badge */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        ...getStatusColors(selectedMailbox.status || 'unknown')
                                    }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                                        {selectedMailbox.status === 'healthy' ? 'CONNECTED' : 'DISCONNECTED'}
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card">
                                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Activity Stats</h3>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748B' }}>Sent (Window)</span>
                                        <span style={{ fontWeight: '600', color: '#1E293B' }}>{selectedMailbox.window_sent_count}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748B' }}>Bounces</span>
                                        <span style={{ fontWeight: '600', color: '#EF4444' }}>{selectedMailbox.hard_bounce_count}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748B' }}>Failures</span>
                                        <span style={{ fontWeight: '600', color: '#F59E0B' }}>{selectedMailbox.delivery_failure_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Metrics Section (SOFT SIGNALS - informational only) */}
                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                                    Engagement Metrics
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    Lifetime engagement from emails sent via this mailbox (informational only)
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Opens */}
                                <div style={{ padding: '1rem', background: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                    <div style={{ color: '#1E40AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Total Opens
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E3A8A' }}>
                                        {selectedMailbox.open_count_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Clicks */}
                                <div style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                    <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Total Clicks
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803D' }}>
                                        {selectedMailbox.click_count_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Replies */}
                                <div style={{ padding: '1rem', background: '#FDF4FF', borderRadius: '12px', border: '1px solid #F0ABFC' }}>
                                    <div style={{ color: '#86198F', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Total Replies
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#A21CAF' }}>
                                        {selectedMailbox.reply_count_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>
                            </div>

                            {/* Spam & Warmup Row */}
                            <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
                                {/* Spam Count */}
                                <div style={{ padding: '1rem', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                                    <div style={{ color: '#991B1B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Spam Reports
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#DC2626' }}>
                                        {selectedMailbox.spam_count?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Warmup Status */}
                                <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Warmup Status
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                                        {selectedMailbox.warmup_status || 'Not configured'}
                                    </div>
                                    {selectedMailbox.warmup_reputation && (
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                            Reputation: {selectedMailbox.warmup_reputation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recovery Status */}
                        {selectedMailbox.recovery_phase && selectedMailbox.recovery_phase !== 'healthy' && (
                            <div className="premium-card" style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    🔄 Recovery Status
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        background: selectedMailbox.recovery_phase === 'paused' ? '#FEF2F2' :
                                            selectedMailbox.recovery_phase === 'quarantine' ? '#FEF2F2' :
                                                selectedMailbox.recovery_phase === 'restricted_send' ? '#FFF7ED' :
                                                    '#ECFDF5',
                                        color: selectedMailbox.recovery_phase === 'paused' ? '#DC2626' :
                                            selectedMailbox.recovery_phase === 'quarantine' ? '#DC2626' :
                                                selectedMailbox.recovery_phase === 'restricted_send' ? '#F59E0B' :
                                                    '#16A34A',
                                        border: '1px solid',
                                        borderColor: selectedMailbox.recovery_phase === 'paused' ? '#FEE2E2' :
                                            selectedMailbox.recovery_phase === 'quarantine' ? '#FEE2E2' :
                                                selectedMailbox.recovery_phase === 'restricted_send' ? '#FED7AA' :
                                                    '#BBF7D0',
                                    }}>
                                        {selectedMailbox.recovery_phase.replace('_', ' ')}
                                    </span>
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                    {/* Resilience Score */}
                                    <div style={{
                                        padding: '1rem',
                                        background: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '1px solid #F1F5F9',
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Resilience</div>
                                        <div style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 800,
                                            color: (selectedMailbox.resilience_score || 0) >= 70 ? '#16A34A' :
                                                (selectedMailbox.resilience_score || 0) >= 30 ? '#F59E0B' : '#EF4444',
                                        }}>
                                            {selectedMailbox.resilience_score || 0}
                                        </div>
                                    </div>

                                    {/* Bounce Rate */}
                                    <div style={{
                                        padding: '1rem',
                                        background: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '1px solid #F1F5F9',
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Bounce Rate</div>
                                        <div style={{
                                            fontSize: '1.75rem',
                                            fontWeight: 800,
                                            color: selectedMailbox.total_sent_count > 0 && (selectedMailbox.hard_bounce_count / selectedMailbox.total_sent_count) < 0.02 ? '#16A34A' :
                                                selectedMailbox.total_sent_count > 0 && (selectedMailbox.hard_bounce_count / selectedMailbox.total_sent_count) < 0.03 ? '#F59E0B' : '#EF4444',
                                        }}>
                                            {selectedMailbox.total_sent_count > 0
                                                ? ((selectedMailbox.hard_bounce_count / selectedMailbox.total_sent_count) * 100).toFixed(1)
                                                : '0.0'}%
                                        </div>
                                    </div>

                                    {/* Clean Sends / Graduation Progress */}
                                    <div style={{
                                        padding: '1rem',
                                        background: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '1px solid #F1F5F9',
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                            {selectedMailbox.recovery_phase === 'restricted_send' || selectedMailbox.recovery_phase === 'warm_recovery' ? 'Graduation Progress' : 'Clean Sends'}
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                                            {selectedMailbox.clean_sends_since_phase || 0}
                                            {selectedMailbox.recovery_phase === 'restricted_send' && `/${(selectedMailbox.consecutive_pauses || 0) > 1 ? 25 : 15}`}
                                            {selectedMailbox.recovery_phase === 'warm_recovery' && `/50`}
                                        </div>
                                    </div>

                                    {/* Relapse Count */}
                                    {(selectedMailbox.relapse_count || 0) > 0 && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#FEF2F2',
                                            borderRadius: '12px',
                                            border: '1px solid #FEE2E2',
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Relapses</div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626' }}>
                                                {selectedMailbox.relapse_count}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Automated Warmup Banner */}
                                {(selectedMailbox.recovery_phase === 'restricted_send' || selectedMailbox.recovery_phase === 'warm_recovery') && (
                                    <div style={{
                                        padding: '0.875rem 1rem',
                                        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid #7DD3FC',
                                        marginBottom: '1rem',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.25rem' }}>🤖</span>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369A1', marginBottom: '0.25rem' }}>
                                                    Automated Warmup Active
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#075985', lineHeight: '1.5' }}>
                                                    {selectedMailbox.recovery_phase === 'restricted_send' &&
                                                        'Smartlead is sending 10 warmup emails/day. System will auto-graduate after 15-25 clean sends (zero bounces).'}
                                                    {selectedMailbox.recovery_phase === 'warm_recovery' &&
                                                        'Smartlead is sending 50 warmup emails/day (+5/day rampup). System will auto-graduate after 50 clean sends over 3+ days.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Next Phase Preview */}
                                {selectedMailbox.recovery_phase !== 'healthy' && (
                                    <div style={{
                                        padding: '0.875rem 1rem',
                                        background: '#EFF6FF',
                                        borderRadius: '12px',
                                        border: '1px solid #BFDBFE',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}>
                                        <span style={{ fontSize: '1rem', opacity: 0.7 }}>→</span>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E40AF' }}>
                                            {selectedMailbox.recovery_phase === 'paused' && 'Next: Quarantine (after cooldown)'}
                                            {selectedMailbox.recovery_phase === 'quarantine' && 'Next: Restricted Send (DNS check required)'}
                                            {selectedMailbox.recovery_phase === 'restricted_send' && `Next: Warm Recovery (need ${Math.max(0, ((selectedMailbox.consecutive_pauses || 0) > 1 ? 25 : 15) - (selectedMailbox.clean_sends_since_phase || 0))} more clean sends)`}
                                            {selectedMailbox.recovery_phase === 'warm_recovery' && `Next: Healthy (need ${Math.max(0, 50 - (selectedMailbox.clean_sends_since_phase || 0))} more sends, 3+ days, <2% bounce)`}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Active Campaigns</h2>
                            {selectedMailbox.campaigns && selectedMailbox.campaigns.length > 0 ? (
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {selectedMailbox.campaigns.map((c: any) => (
                                        <div key={c.id} style={{
                                            padding: '1rem',
                                            border: '1px solid #F1F5F9',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: '#F8FAFC'
                                        }}>
                                            <span style={{ fontWeight: '600', color: '#1E293B' }}>{c.name}</span>
                                            <span style={{ color: '#9CA3AF', fontSize: '0.75rem', fontFamily: 'monospace', background: '#FFFFFF', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>ID: {c.id}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
                                    No campaigns assigned.
                                </div>
                            )}
                        </div>

                        {/* Infrastructure Health Issues */}
                        <FindingsCard entityType="mailbox" entityId={selectedMailbox.id} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>👈</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>Select a mailbox to view details</div>
                    </div>
                )}
            </div>

            {/* Sort & Filter Modal */}
            {showSortModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setShowSortModal(false)}
                >
                    <div
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '24px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                                ⚙️ Sort & Filter Mailboxes
                            </h2>
                            <button
                                onClick={() => setShowSortModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: '#9CA3AF',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{
                            padding: '1.5rem',
                            overflowY: 'auto',
                            flex: 1
                        }}>
                            {/* Sort By */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="modal-sort-by" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Sort By
                                </label>
                                <select
                                    id="modal-sort-by"
                                    value={tempSortBy}
                                    onChange={(e) => setTempSortBy(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #D1D5DB',
                                        background: '#FFFFFF',
                                        color: '#111827',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
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
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="modal-domain" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Domain
                                </label>
                                <select
                                    id="modal-domain"
                                    value={tempDomainId}
                                    onChange={(e) => setTempDomainId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #D1D5DB',
                                        background: '#FFFFFF',
                                        color: '#111827',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Domains</option>
                                    {domains.map(d => (
                                        <option key={d.id} value={d.id}>{d.domain}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Warmup Status Filter */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="modal-warmup" style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Warmup Status
                                </label>
                                <select
                                    id="modal-warmup"
                                    value={tempWarmupStatus}
                                    onChange={(e) => setTempWarmupStatus(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #D1D5DB',
                                        background: '#FFFFFF',
                                        color: '#111827',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Warmup Status</option>
                                    <option value="enabled">Enabled</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>

                            {/* Engagement Rate Range */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Engagement Rate Range (%)
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={tempMinEngagement}
                                        onChange={(e) => setTempMinEngagement(e.target.value)}
                                        min="0"
                                        max="100"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '1px solid #D1D5DB',
                                            background: '#FFFFFF',
                                            color: '#111827',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <span style={{ color: '#6B7280', fontSize: '1rem', fontWeight: 500 }}>→</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={tempMaxEngagement}
                                        onChange={(e) => setTempMaxEngagement(e.target.value)}
                                        min="0"
                                        max="100"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            border: '1px solid #D1D5DB',
                                            background: '#FFFFFF',
                                            color: '#111827',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '1.5rem',
                            borderTop: '1px solid #E5E7EB',
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                onClick={handleClearFilters}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #D1D5DB',
                                    background: '#FFFFFF',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="hover:bg-gray-50"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApplySortFilter}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#3B82F6',
                                    color: '#FFFFFF',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                className="hover:bg-blue-600"
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

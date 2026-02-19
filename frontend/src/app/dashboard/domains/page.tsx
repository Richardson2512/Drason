'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import FindingsCard from '@/components/dashboard/FindingsCard';
import { apiClient } from '@/lib/api';
import { getStatusColors } from '@/lib/statusColors';

export default function DomainsPage() {
    const [domains, setDomains] = useState<any[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pagination & Selection
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());

    const fetchDomains = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: meta.page.toString(),
                limit: meta.limit.toString()
            });

            // Add filters
            if (selectedStatus !== 'all') params.append('status', selectedStatus);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            const data = await apiClient<any>(`/api/dashboard/domains?${params}`);
            if (data?.data) {
                setDomains(data.data);
                setMeta(data.meta);
                if (data.data.length > 0 && !selectedDomain) {
                    setSelectedDomain(data.data[0]);
                }
            } else {
                setDomains([]);
            }
        } catch (err) {
            console.error('Failed to fetch domains:', err);
            setDomains([]);
        }
    }, [meta.page, meta.limit, selectedStatus, searchQuery, selectedDomain]);

    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    useEffect(() => {
        if (selectedDomain) {
            apiClient<any[]>(`/api/dashboard/audit-logs?entity=domain&entity_id=${selectedDomain.id}`)
                .then(setAuditLogs)
                .catch(err => {
                    console.error('Failed to fetch logs:', err);
                    setAuditLogs([]);
                });
        } else {
            setAuditLogs([]);
        }
    }, [selectedDomain]);

    // Selection Logic
    const toggleDomainSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedDomainIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedDomainIds(newSet);
    };

    const toggleSelectAll = () => {
        const allPageIds = domains.map(d => d.id);
        const allSelected = allPageIds.every(id => selectedDomainIds.has(id));
        const newSet = new Set(selectedDomainIds);
        if (allSelected) {
            allPageIds.forEach(id => newSet.delete(id));
        } else {
            allPageIds.forEach(id => newSet.add(id));
        }
        setSelectedDomainIds(newSet);
    };

    const isAllSelected = domains.length > 0 && domains.every(d => selectedDomainIds.has(d.id));

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: List */}
            <div className="premium-card" style={{ width: '420px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', flexShrink: 0, color: '#111827' }}>Domains</h2>

                {/* Filters */}
                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by domain name..."
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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid #F3F4F6', marginBottom: '0.75rem' }}>
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>Select All ({domains.length})</span>
                </div>

                <div className="scrollbar-hide" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                    {domains.map(d => (
                        <div
                            key={d.id}
                            onClick={() => setSelectedDomain(d)}
                            style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                background: selectedDomain?.id === d.id ? '#EFF6FF' : '#FFFFFF',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedDomain?.id === d.id ? '#BFDBFE' : '#F3F4F6',
                                borderLeft: d.status === 'paused' ? '4px solid #EF4444' : (selectedDomain?.id === d.id ? '1px solid #BFDBFE' : '1px solid #F3F4F6'),
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
                                checked={selectedDomainIds.has(d.id)}
                                onClick={(e) => toggleDomainSelection(e, d.id)}
                                onChange={() => { }}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#1E293B', fontSize: '0.9rem' }}>{d.domain}</div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    display: 'inline-block',
                                    ...getStatusColors(d.status)
                                }}>{d.status.toUpperCase()}</div>
                            </div>
                        </div>
                    ))}
                    {domains.length === 0 && <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>No domains.</div>}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #F3F4F6', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details (Unchanged mostly) */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
                {selectedDomain ? (
                    <DomainDetailsView selectedDomain={selectedDomain} auditLogs={auditLogs} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>👈</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>Select a domain to view details</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Memoized component for better Safari performance
function DomainDetailsView({ selectedDomain, auditLogs }: { selectedDomain: any; auditLogs: any[] }) {
    // Memoize engagement rate calculations to prevent re-calculation on every render
    const openRate = useMemo(() => {
        return selectedDomain.total_sent_lifetime > 0
            ? ((selectedDomain.total_opens / selectedDomain.total_sent_lifetime) * 100).toFixed(1)
            : '0';
    }, [selectedDomain.total_sent_lifetime, selectedDomain.total_opens]);

    const clickRate = useMemo(() => {
        return selectedDomain.total_sent_lifetime > 0
            ? ((selectedDomain.total_clicks / selectedDomain.total_sent_lifetime) * 100).toFixed(1)
            : '0';
    }, [selectedDomain.total_sent_lifetime, selectedDomain.total_clicks]);

    const replyRate = useMemo(() => {
        return selectedDomain.total_sent_lifetime > 0
            ? ((selectedDomain.total_replies / selectedDomain.total_sent_lifetime) * 100).toFixed(1)
            : '0';
    }, [selectedDomain.total_sent_lifetime, selectedDomain.total_replies]);

    return (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>{selectedDomain.domain}</h1>
                            <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Reputation & Usage</div>
                        </div>

                        {selectedDomain.status === 'paused' && (
                            <div className="premium-card" style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderLeft: '6px solid #EF4444',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                                    <h3 style={{ color: '#B91C1C', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.025em' }}>DOMAIN PAUSED</h3>
                                </div>
                                <p style={{ color: '#7F1D1D', fontSize: '1rem', lineHeight: '1.5' }}>{selectedDomain.paused_reason}</p>
                            </div>
                        )}

                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Bounce Analytics</h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Bounce Rate Trend</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: selectedDomain.aggregated_bounce_rate_trend > 2 ? '#EF4444' : '#16A34A' }}>
                                        {selectedDomain.aggregated_bounce_rate_trend.toFixed(2)}<span style={{ fontSize: '1.5rem' }}>%</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Rolling 7-day average</div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Warnings Triggered</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: selectedDomain.warning_count > 0 ? '#F59E0B' : '#1E293B' }}>{selectedDomain.warning_count}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Lifetime incidents</div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Metrics Section (SOFT SIGNALS - aggregated from all mailboxes) */}
                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                                    Domain-Wide Engagement
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    Aggregated metrics across all mailboxes on this domain (informational only)
                                </p>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {/* Total Sent */}
                                <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Total Sent
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
                                        {selectedDomain.total_sent_lifetime?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Opens */}
                                <div style={{ padding: '1rem', background: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                    <div style={{ color: '#1E40AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Opens
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E3A8A' }}>
                                        {selectedDomain.total_opens?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {openRate}% rate
                                    </div>
                                </div>

                                {/* Clicks */}
                                <div style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                    <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Clicks
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803D' }}>
                                        {selectedDomain.total_clicks?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#22C55E', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {clickRate}% rate
                                    </div>
                                </div>

                                {/* Replies */}
                                <div style={{ padding: '1rem', background: '#FDF4FF', borderRadius: '12px', border: '1px solid #F0ABFC' }}>
                                    <div style={{ color: '#86198F', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Replies
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#A21CAF' }}>
                                        {selectedDomain.total_replies?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#C026D3', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {replyRate}% rate
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recovery Status */}
                        {selectedDomain.recovery_phase && selectedDomain.recovery_phase !== 'healthy' && (
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
                                        background: selectedDomain.recovery_phase === 'paused' ? '#FEF2F2' :
                                            selectedDomain.recovery_phase === 'quarantine' ? '#FEF2F2' :
                                            selectedDomain.recovery_phase === 'restricted_send' ? '#FFF7ED' :
                                            '#ECFDF5',
                                        color: selectedDomain.recovery_phase === 'paused' ? '#DC2626' :
                                            selectedDomain.recovery_phase === 'quarantine' ? '#DC2626' :
                                            selectedDomain.recovery_phase === 'restricted_send' ? '#F59E0B' :
                                            '#16A34A',
                                        border: '1px solid',
                                        borderColor: selectedDomain.recovery_phase === 'paused' ? '#FEE2E2' :
                                            selectedDomain.recovery_phase === 'quarantine' ? '#FEE2E2' :
                                            selectedDomain.recovery_phase === 'restricted_send' ? '#FED7AA' :
                                            '#BBF7D0',
                                    }}>
                                        {selectedDomain.recovery_phase.replace('_', ' ')}
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
                                            color: (selectedDomain.resilience_score || 0) >= 70 ? '#16A34A' :
                                                (selectedDomain.resilience_score || 0) >= 30 ? '#F59E0B' : '#EF4444',
                                        }}>
                                            {selectedDomain.resilience_score || 0}
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
                                            {selectedDomain.recovery_phase === 'restricted_send' || selectedDomain.recovery_phase === 'warm_recovery' ? 'Graduation Progress' : 'Clean Sends'}
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                                            {selectedDomain.clean_sends_since_phase || 0}
                                            {selectedDomain.recovery_phase === 'restricted_send' && `/${(selectedDomain.consecutive_pauses || 0) > 1 ? 25 : 15}`}
                                            {selectedDomain.recovery_phase === 'warm_recovery' && `/50`}
                                        </div>
                                    </div>

                                    {/* Relapse Count */}
                                    {(selectedDomain.relapse_count || 0) > 0 && (
                                        <div style={{
                                            padding: '1rem',
                                            background: '#FEF2F2',
                                            borderRadius: '12px',
                                            border: '1px solid #FEE2E2',
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: '#DC2626', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Relapses</div>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626' }}>
                                                {selectedDomain.relapse_count}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Next Phase Preview */}
                                {selectedDomain.recovery_phase !== 'healthy' && (
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
                                            {selectedDomain.recovery_phase === 'paused' && 'Next: Quarantine (after cooldown)'}
                                            {selectedDomain.recovery_phase === 'quarantine' && 'Next: Restricted Send (DNS check required)'}
                                            {selectedDomain.recovery_phase === 'restricted_send' && `Next: Warm Recovery (need ${Math.max(0, ((selectedDomain.consecutive_pauses || 0) > 1 ? 25 : 15) - (selectedDomain.clean_sends_since_phase || 0))} more clean sends)`}
                                            {selectedDomain.recovery_phase === 'warm_recovery' && `Next: Healthy (need ${Math.max(0, 50 - (selectedDomain.clean_sends_since_phase || 0))} more sends, 3+ days, <2% bounce)`}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Domain Events Log</h2>
                            {auditLogs.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trigger</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map(log => (
                                            <tr key={log.id} style={{ transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#475569', whiteSpace: 'nowrap' }}>
                                                    {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem', fontWeight: '500', color: '#1E293B' }}>{log.trigger}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontWeight: 600, color: '#2563EB' }}>{log.action}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0', fontStyle: 'italic' }}>
                                    No events recorded.
                                </div>
                            )}
                        </div>

                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Child Mailboxes</h2>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaigns</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDomain.mailboxes && selectedDomain.mailboxes.map((mb: any) => (
                                        <tr key={mb.id} className="hover:bg-gray-50 transition-colors">
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#1E293B', fontWeight: 500 }}>{mb.email}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    ...getStatusColors(mb.status)
                                                }}>
                                                    {mb.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>
                                                {mb.campaigns?.map((c: any) => c.name).join(', ') || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!selectedDomain.mailboxes || selectedDomain.mailboxes.length === 0) && (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontStyle: 'italic' }}>No mailboxes found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Infrastructure Health Issues */}
                        <FindingsCard entityType="domain" entityId={selectedDomain.id} />
                    </div>
    );
}

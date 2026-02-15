'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import { apiClient } from '@/lib/api';

function LeadsPageContent() {
    const searchParams = useSearchParams();
    const [leads, setLeads] = useState<any[]>([]);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [leadTab, setLeadTab] = useState('all');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');

    // Pagination & Selection State
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

    // Read URL parameters on mount
    useEffect(() => {
        const campaignId = searchParams.get('campaignId');
        const status = searchParams.get('status');

        if (campaignId) {
            setSelectedCampaignFilter(campaignId);
        }
        if (status) {
            setLeadTab(status);
        }
    }, [searchParams]);

    const fetchLeads = useCallback(async () => {
        const queryParams: any = {
            page: meta.page.toString(),
            limit: meta.limit.toString(),
            status: leadTab
        };

        // Add campaign filter if not 'all'
        if (selectedCampaignFilter !== 'all') {
            queryParams.campaignId = selectedCampaignFilter;
        }

        const query = new URLSearchParams(queryParams);

        try {
            const data = await apiClient<any>(`/api/dashboard/leads?${query}`);
            if (data?.data) {
                setLeads(data.data);
                setMeta(data.meta);
                // Select first lead if none selected and leads exist
                if (data.data.length > 0 && !selectedLead) {
                    setSelectedLead(data.data[0]);
                }
            } else {
                // Fallback for old API response (should not happen after restart)
                if (Array.isArray(data)) {
                    setLeads(data);
                } else {
                    setLeads([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            setLeads([]);
        }
    }, [meta.page, meta.limit, leadTab, selectedCampaignFilter, selectedLead]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Fetch all campaigns for the filter dropdown
    useEffect(() => {
        apiClient<any>('/api/dashboard/campaigns?limit=1000')
            .then(data => {
                if (data?.data) {
                    setCampaigns(data.data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch campaigns:', err);
                setCampaigns([]);
            });
    }, []);

    // Fetch logs when a lead is selected
    useEffect(() => {
        if (selectedLead) {
            apiClient<any[]>(`/api/dashboard/audit-logs?entity=lead&entity_id=${selectedLead.id}`)
                .then(setAuditLogs)
                .catch(err => {
                    console.error('Failed to fetch logs:', err);
                    setAuditLogs([]);
                });
        } else {
            setAuditLogs([]);
        }
    }, [selectedLead]);

    // Selection Logic
    const toggleLeadSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedLeadIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedLeadIds(newSet);
    };

    const toggleSelectAll = () => {
        const allPageIds = leads.map(l => l.id);
        const allSelected = allPageIds.every(id => selectedLeadIds.has(id));

        const newSet = new Set(selectedLeadIds);
        if (allSelected) {
            allPageIds.forEach(id => newSet.delete(id));
        } else {
            allPageIds.forEach(id => newSet.add(id));
        }
        setSelectedLeadIds(newSet);
    };

    const isAllSelected = leads.length > 0 && leads.every(l => selectedLeadIds.has(l.id));

    // Page Change
    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleTabChange = (tab: string) => {
        setLeadTab(tab);
        setMeta(prev => ({ ...prev, page: 1 })); // Reset to page 1 on tab change
        setSelectedLead(null);
    };

    const handleCampaignFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCampaignFilter(e.target.value);
        setMeta(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
        setSelectedLead(null);
    };

    // Deterministic Status Explanation Logic (Based on PRD System States)
    const getSystemNotice = (lead: any) => {
        if (lead.status === 'paused') {
            return { type: 'danger', title: 'System Pause', msg: 'Lead processing has been halted. This typically occurs when the associated mailbox or domain triggers a "Warning" or "Paused" health state due to bounce rates exceeding 2%.' };
        }
        if (lead.status === 'held') {
            return { type: 'warning', title: 'Holding Pool', msg: 'Lead is currently in the Holding Pool. It is waiting for the "Execution Gate" to verify mailbox capacity and domain health before transitioning to Active.' };
        }
        if (lead.status === 'active') {
            return { type: 'success', title: 'Active Execution', msg: 'Lead has passed all health checks and routed to a campaign. It is currently available for outreach by the external sender (Smartlead).' };
        }
        return null;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: { bg: '#DCFCE7', color: '#166534', label: 'Active' },
            paused: { bg: '#FEE2E2', color: '#991B1B', label: 'Paused' },
            held: { bg: '#FEF3C7', color: '#92400E', label: 'Held' },
            blocked: { bg: '#FEE2E2', color: '#991B1B', label: 'Blocked' },
            completed: { bg: '#E0E7FF', color: '#3730A3', label: 'Completed' },
        };

        const style = styles[status as keyof typeof styles] || { bg: '#F3F4F6', color: '#374151', label: status };

        return (
            <span style={{
                background: style.bg,
                color: style.color,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '1rem' }}>
            {/* Left: Lead List */}
            <div className="premium-card" style={{ width: '420px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
                <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Leads</h2>
                        <div style={{ display: 'flex', background: '#F3F4F6', padding: '0.25rem', borderRadius: '12px' }}>
                            {['all', 'held', 'active', 'paused'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleTabChange(t)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: '8px',
                                        background: leadTab === t ? '#FFFFFF' : 'transparent',
                                        color: leadTab === t ? '#111827' : '#6B7280',
                                        boxShadow: leadTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Campaign Filter Dropdown */}
                    <div>
                        <label htmlFor="campaign-filter" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Filter by Campaign
                        </label>
                        <select
                            id="campaign-filter"
                            value={selectedCampaignFilter}
                            onChange={handleCampaignFilterChange}
                            style={{
                                width: '100%',
                                padding: '0.625rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                background: '#FFFFFF',
                                color: '#111827',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <option value="all">All Campaigns</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Selection Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid #F3F4F6', marginBottom: '0.75rem' }}>
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>Select All ({leads.length})</span>
                </div>

                <div className="scrollbar-hide" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                    {leads.map(l => (
                        <div
                            key={l.id}
                            onClick={() => setSelectedLead(l)}
                            style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                background: selectedLead?.id === l.id ? '#EFF6FF' : '#FFFFFF',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedLead?.id === l.id ? '#BFDBFE' : '#F3F4F6',
                                borderLeft: l.status === 'paused' ? '4px solid #EF4444' : (selectedLead?.id === l.id ? '1px solid #BFDBFE' : '1px solid #F3F4F6'),
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
                                checked={selectedLeadIds.has(l.id)}
                                onClick={(e) => toggleLeadSelection(e, l.id)}
                                onChange={() => { }} // Dummy handler to suppress generic warnings, handled by onClick
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem', color: '#1E293B' }}>{l.email}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span>Score:</span>
                                        <span style={{ fontWeight: 600, color: l.lead_score > 70 ? '#16A34A' : '#F59E0B' }}>{l.lead_score}</span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: l.status === 'active' ? '#166534' : (l.status === 'paused' || l.status === 'blocked' ? '#991B1B' : (l.status === 'held' ? '#92400E' : '#374151')),
                                        background: l.status === 'active' ? '#DCFCE7' : (l.status === 'paused' || l.status === 'blocked' ? '#FEE2E2' : (l.status === 'held' ? '#FEF3C7' : '#F3F4F6')),
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {l.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {leads.length === 0 && <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>No leads found.</div>}
                </div>

                {/* Pagination Controls */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #F3F4F6', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedLead ? (
                    <>
                        {/* Fixed Header */}
                        <div style={{ paddingRight: '1rem', paddingBottom: '0.5rem', flexShrink: 0 }}>
                            <div className="animate-fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>{selectedLead.email}</h1>
                                    <StatusBadge status={selectedLead.status} />
                                </div>
                                <div style={{ color: '#6B7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>ID: {selectedLead.id}</div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem', paddingBottom: '2rem' }}>
                            <div className="animate-fade-in">
                                {/* SYSTEM STATUS EXPLANATION (Deterministic) */}
                                {(() => {
                                    const notice = getSystemNotice(selectedLead);
                                    if (notice) return (
                                        <div className="premium-card" style={{
                                            borderLeft: `6px solid ${notice.type === 'danger' ? '#EF4444' : (notice.type === 'warning' ? '#EAB308' : '#3B82F6')}`,
                                            background: notice.type === 'danger' ? '#FEF2F2' : (notice.type === 'warning' ? '#FFFBEB' : '#EFF6FF'),
                                            marginBottom: '2rem'
                                        }}>
                                            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.1rem', color: notice.type === 'danger' ? '#B91C1C' : (notice.type === 'warning' ? '#B45309' : '#1E40AF') }}>
                                                {notice.title}
                                            </h3>
                                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: notice.type === 'danger' ? '#7F1D1D' : (notice.type === 'warning' ? '#78350F' : '#1E3A8A') }}>
                                                {notice.msg}
                                            </p>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                                    <div className="premium-card">
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Lead Profile</h3>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Persona</div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B' }}>{selectedLead.persona}</div>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Lead Score</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>{selectedLead.lead_score} <span style={{ fontSize: '0.875rem', color: '#9CA3AF', fontWeight: '400' }}>/ 100</span></div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Source</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1E293B' }}>{selectedLead.source}</div>
                                        </div>
                                    </div>
                                    <div className="premium-card">
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Execution Context</h3>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Assigned Campaign</div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2563EB' }}>
                                                {selectedLead.campaign?.name || 'Unassigned'}
                                            </div>
                                            {selectedLead.campaign && (
                                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                                                    ID: {selectedLead.campaign.id}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>Internal Health</div>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                background: selectedLead.health_state === 'healthy' ? '#DCFCE7' : '#FEE2E2',
                                                color: selectedLead.health_state === 'healthy' ? '#166534' : '#991B1B',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontWeight: '600',
                                                fontSize: '0.875rem'
                                            }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                                                {selectedLead.health_state.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-card">
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Activity Timeline</h2>
                                    {auditLogs.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Trigger</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Taken</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
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
                                                        <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#64748B' }}>{log.details}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                                            No activity recorded for this lead yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>👈</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>Select a lead to view full details</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280' }}>Loading leads...</div>}>
            <LeadsPageContent />
        </Suspense>
    );
}

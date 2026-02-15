'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import CampaignsEmptyState from '@/components/dashboard/CampaignsEmptyState';
import { apiClient } from '@/lib/api';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

    const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiClient<any>(`/api/dashboard/campaigns?page=${meta.page}&limit=${meta.limit}`);
            if (data?.data) {
                setCampaigns(data.data);
                setMeta(data.meta);
                if (data.data.length > 0 && !selectedCampaign) {
                    setSelectedCampaign(data.data[0]);
                }
            } else {
                setCampaigns(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, selectedCampaign]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    useEffect(() => {
        if (selectedCampaign) {
            apiClient<any>(`/api/dashboard/stats?campaignId=${selectedCampaign.id}`)
                .then(setStats)
                .catch(err => {
                    console.error('Failed to fetch stats:', err);
                    setStats(null);
                });
        } else {
            setStats(null);
        }
    }, [selectedCampaign]);

    // Selection Logic
    const toggleCampaignSelection = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSet = new Set(selectedCampaignIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedCampaignIds(newSet);
    };

    const toggleSelectAll = () => {
        const allPageIds = campaigns.map(c => c.id);
        const allSelected = allPageIds.every(id => selectedCampaignIds.has(id));
        const newSet = new Set(selectedCampaignIds);
        if (allSelected) {
            allPageIds.forEach(id => newSet.delete(id));
        } else {
            allPageIds.forEach(id => newSet.add(id));
        }
        setSelectedCampaignIds(newSet);
    };

    const isAllSelected = campaigns.length > 0 && campaigns.every(c => selectedCampaignIds.has(c.id));

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const navigateToLeads = (status?: string) => {
        if (!selectedCampaign) return;

        const params = new URLSearchParams({
            campaignId: selectedCampaign.id
        });

        if (status && status !== 'all') {
            params.append('status', status);
        }

        router.push(`/dashboard/leads?${params.toString()}`);
    };

    if (loading && campaigns.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Loading Campaigns...</div>;
    }

    if (!loading && (!campaigns || campaigns.length === 0)) {
        return <CampaignsEmptyState />;
    }

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: Campaign List */}
            <div className="premium-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', flexShrink: 0, color: '#111827' }}>Campaigns</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid #F3F4F6', marginBottom: '0.75rem' }}>
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>Select All ({campaigns.length})</span>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }} className="scrollbar-hide">
                    {campaigns.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedCampaign(c)}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '16px',
                                background: selectedCampaign?.id === c.id ? '#EFF6FF' : '#FFFFFF',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedCampaign?.id === c.id ? '#BFDBFE' : '#F3F4F6',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                boxShadow: selectedCampaign?.id === c.id ? '0 4px 6px -1px rgba(37, 99, 235, 0.1)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                            className="hover:shadow-md hover:border-blue-100"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCampaignIds.has(c.id)}
                                onClick={(e) => toggleCampaignSelection(e, c.id)}
                                onChange={() => { }}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#1E293B' }}>{c.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>ID: {c.id}</div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    marginTop: '0.75rem',
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    background: c.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                    color: c.status === 'active' ? '#166534' : '#991B1B',
                                    fontWeight: 600
                                }}>
                                    {c.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #F3F4F6', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>

            {/* Right: Details View */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
                {selectedCampaign ? (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>{selectedCampaign.name}</h1>
                            <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Campaign Performance Details</div>
                        </div>

                        {/* Top Stats - SPECIFIC TO CAMPAIGN (Clickable) */}
                        <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
                            <div
                                className="premium-card hover:shadow-lg"
                                onClick={() => navigateToLeads()}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: '1px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#BFDBFE';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Leads</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827' }}>{stats ? stats.total : '-'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem', fontWeight: 500 }}>Click to view all leads →</div>
                            </div>
                            <div
                                className="premium-card hover:shadow-lg"
                                onClick={() => navigateToLeads('active')}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: '1px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#BBF7D0';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Execution</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#16A34A' }}>{stats ? stats.active : '-'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem', fontWeight: 500 }}>Click to view active leads →</div>
                            </div>
                            <div
                                className="premium-card hover:shadow-lg"
                                onClick={() => navigateToLeads('paused')}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: '1px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#FECACA';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Paused</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#EF4444' }}>{stats ? stats.paused : '-'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem', fontWeight: 500 }}>Click to view paused leads →</div>
                            </div>
                        </div>

                        {/* Mailboxes Section */}
                        <div className="premium-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Connected Mailboxes & Domains</h2>
                                <div style={{ background: '#F3F4F6', color: '#4B5563', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {selectedCampaign.mailboxes?.length || 0} Connected
                                </div>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Mailbox Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Domain</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Win Sent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCampaign.mailboxes && selectedCampaign.mailboxes.map((mb: any) => (
                                        <tr key={mb.id} className="hover:bg-gray-50 transition-colors">
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#1E293B', fontWeight: 500 }}>{mb.email}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>
                                                {mb.domain?.domain}
                                                {mb.domain?.status === 'paused' && <span style={{ color: '#EF4444', marginLeft: '0.5rem', fontWeight: 600, fontSize: '0.75rem', background: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>PAUSED</span>}
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                                <span style={{
                                                    color: mb.status === 'active' ? '#166534' : '#991B1B',
                                                    background: mb.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {mb.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#475569', fontFamily: 'monospace' }}>{mb.window_sent_count}</td>
                                        </tr>
                                    ))}
                                    {(!selectedCampaign.mailboxes || selectedCampaign.mailboxes.length === 0) && (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontStyle: 'italic' }}>No mailboxes linked.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>👈</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>Select a campaign to view performance</div>
                    </div>
                )}
            </div>
        </div>
    );
}

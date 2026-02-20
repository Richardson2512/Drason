'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
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

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sorting & Filtering State
    const [sortBy, setSortBy] = useState('name_asc');
    const [minSent, setMinSent] = useState<string>('');
    const [maxSent, setMaxSent] = useState<string>('');
    const [minOpenRate, setMinOpenRate] = useState<string>('');
    const [maxOpenRate, setMaxOpenRate] = useState<string>('');

    // Modal State
    const [showSortModal, setShowSortModal] = useState(false);
    const [tempSortBy, setTempSortBy] = useState(sortBy);
    const [tempMinSent, setTempMinSent] = useState(minSent);
    const [tempMaxSent, setTempMaxSent] = useState(maxSent);
    const [tempMinOpenRate, setTempMinOpenRate] = useState(minOpenRate);
    const [tempMaxOpenRate, setTempMaxOpenRate] = useState(maxOpenRate);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: meta.page.toString(),
                limit: meta.limit.toString(),
                sortBy
            });

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }

            // Add filter parameters
            if (minSent) {
                params.append('minSent', minSent);
            }
            if (maxSent) {
                params.append('maxSent', maxSent);
            }
            if (minOpenRate) {
                params.append('minOpenRate', minOpenRate);
            }
            if (maxOpenRate) {
                params.append('maxOpenRate', maxOpenRate);
            }

            const data = await apiClient<any>(`/api/dashboard/campaigns?${params}`);
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
    }, [meta.page, meta.limit, statusFilter, searchQuery, sortBy, minSent, maxSent, minOpenRate, maxOpenRate, selectedCampaign]);

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

    // Sort & Filter Modal Handlers
    const handleOpenSortModal = () => {
        setTempSortBy(sortBy);
        setTempMinSent(minSent);
        setTempMaxSent(maxSent);
        setTempMinOpenRate(minOpenRate);
        setTempMaxOpenRate(maxOpenRate);
        setShowSortModal(true);
    };

    const handleApplySortFilter = () => {
        setSortBy(tempSortBy);
        setMinSent(tempMinSent);
        setMaxSent(tempMaxSent);
        setMinOpenRate(tempMinOpenRate);
        setMaxOpenRate(tempMaxOpenRate);
        setMeta(prev => ({ ...prev, page: 1 }));
        setShowSortModal(false);
    };

    const handleClearFilters = () => {
        setTempSortBy('name_asc');
        setTempMinSent('');
        setTempMaxSent('');
        setTempMinOpenRate('');
        setTempMaxOpenRate('');
        setSortBy('name_asc');
        setMinSent('');
        setMaxSent('');
        setMinOpenRate('');
        setMaxOpenRate('');
        setMeta(prev => ({ ...prev, page: 1 }));
        setShowSortModal(false);
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
                <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Campaigns</h2>

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="🔍 Search campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            marginBottom: '0.75rem'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            cursor: 'pointer',
                            background: 'white'
                        }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
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
                        {(sortBy !== 'name_asc' || minSent || maxSent || minOpenRate || maxOpenRate) && (
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
                                    background: c.status === 'active' ? '#DCFCE7' : (c.status === 'warning' ? '#FEF3C7' : '#FEE2E2'),
                                    color: c.status === 'active' ? '#166534' : (c.status === 'warning' ? '#B45309' : '#991B1B'),
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

                        {/* Engagement Metrics Section (SOFT SIGNALS - informational only) */}
                        <div className="premium-card" style={{ marginBottom: '2.5rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                                    Engagement Metrics
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    Campaign-level analytics (informational only, does not affect automated decisions)
                                </p>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {/* Total Sent */}
                                <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Total Sent
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
                                        {selectedCampaign.total_sent?.toLocaleString() || '0'}
                                    </div>
                                </div>

                                {/* Opens */}
                                <div style={{ padding: '1rem', background: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                    <div style={{ color: '#1E40AF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Opens
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E3A8A' }}>
                                        {selectedCampaign.open_count?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {selectedCampaign.open_rate ? `${selectedCampaign.open_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>

                                {/* Clicks */}
                                <div style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                    <div style={{ color: '#166534', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Clicks
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803D' }}>
                                        {selectedCampaign.click_count?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#22C55E', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {selectedCampaign.click_rate ? `${selectedCampaign.click_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>

                                {/* Replies */}
                                <div style={{ padding: '1rem', background: '#FDF4FF', borderRadius: '12px', border: '1px solid #F0ABFC' }}>
                                    <div style={{ color: '#86198F', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Replies
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#A21CAF' }}>
                                        {selectedCampaign.reply_count?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#C026D3', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {selectedCampaign.reply_rate ? `${selectedCampaign.reply_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>
                            </div>

                            {/* Bounce & Unsubscribe Row */}
                            <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
                                {/* Bounces */}
                                <div style={{ padding: '1rem', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                                    <div style={{ color: '#991B1B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Bounces (HARD SIGNAL)
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#DC2626' }}>
                                        {selectedCampaign.total_bounced?.toLocaleString() || '0'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {selectedCampaign.bounce_rate ? `${selectedCampaign.bounce_rate.toFixed(1)}%` : '0%'} rate
                                    </div>
                                </div>

                                {/* Unsubscribes */}
                                <div style={{ padding: '1rem', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                                    <div style={{ color: '#92400E', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        Unsubscribes
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#B45309' }}>
                                        {selectedCampaign.unsubscribed_count?.toLocaleString() || '0'}
                                    </div>
                                </div>
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
                                                    color: (mb.status === 'active' || mb.status === 'healthy') ? '#166534' : (mb.status === 'warning' ? '#B45309' : '#991B1B'),
                                                    background: (mb.status === 'active' || mb.status === 'healthy') ? '#DCFCE7' : (mb.status === 'warning' ? '#FEF3C7' : '#FEE2E2'),
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
                                ⚙️ Sort & Filter Campaigns
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
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="name_desc">Name (Z-A)</option>
                                    <option value="sent_desc">Sent (High to Low)</option>
                                    <option value="sent_asc">Sent (Low to High)</option>
                                    <option value="open_rate_desc">Open Rate (High to Low)</option>
                                    <option value="open_rate_asc">Open Rate (Low to High)</option>
                                    <option value="reply_rate_desc">Reply Rate (High to Low)</option>
                                    <option value="reply_rate_asc">Reply Rate (Low to High)</option>
                                    <option value="bounce_rate_desc">Bounce Rate (High to Low)</option>
                                    <option value="bounce_rate_asc">Bounce Rate (Low to High)</option>
                                </select>
                            </div>

                            {/* Total Sent Range */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Total Sent Range
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={tempMinSent}
                                        onChange={(e) => setTempMinSent(e.target.value)}
                                        min="0"
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
                                        value={tempMaxSent}
                                        onChange={(e) => setTempMaxSent(e.target.value)}
                                        min="0"
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

                            {/* Open Rate Range */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>
                                    Open Rate Range (%)
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={tempMinOpenRate}
                                        onChange={(e) => setTempMinOpenRate(e.target.value)}
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
                                        value={tempMaxOpenRate}
                                        onChange={(e) => setTempMaxOpenRate(e.target.value)}
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

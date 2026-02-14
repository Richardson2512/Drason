'use client';
import { useEffect, useState, useCallback } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import MailboxesEmptyState from '@/components/dashboard/MailboxesEmptyState';
import { apiClient } from '@/lib/api';

export default function MailboxesPage() {
    const [mailboxes, setMailboxes] = useState<any[]>([]);
    const [selectedMailbox, setSelectedMailbox] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Pagination & Selection
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedMailboxIds, setSelectedMailboxIds] = useState<Set<string>>(new Set());

    const fetchMailboxes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiClient<any>(`/api/dashboard/mailboxes?page=${meta.page}&limit=${meta.limit}`);
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
    }, [meta.page, meta.limit, selectedMailbox]);

    useEffect(() => {
        fetchMailboxes();
    }, [fetchMailboxes]);

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

    if (loading && mailboxes.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Loading Mailboxes...</div>;
    }

    if (!loading && (!mailboxes || mailboxes.length === 0)) {
        return <MailboxesEmptyState />;
    }

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: List */}
            <div className="premium-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', overflow: 'hidden', borderRadius: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', flexShrink: 0, color: '#111827' }}>Mailboxes</h2>

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

                        <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                            <div className="premium-card">
                                <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', marginBottom: '1rem' }}>Associated Domain</h3>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>{selectedMailbox.domain?.domain}</div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    background: selectedMailbox.domain?.status === 'healthy' ? '#DCFCE7' : '#FEE2E2',
                                    color: selectedMailbox.domain?.status === 'healthy' ? '#166534' : '#991B1B'
                                }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                                    {selectedMailbox.domain?.status.toUpperCase()}
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

                        <div className="premium-card">
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
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>👈</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>Select a mailbox to view details</div>
                    </div>
                )}
            </div>
        </div>
    );
}

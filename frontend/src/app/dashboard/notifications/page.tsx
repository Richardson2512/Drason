'use client';
import { useEffect, useState, useCallback } from 'react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

    const fetchNotifications = useCallback(() => {
        setLoading(true);
        const query = new URLSearchParams({
            page: meta.page.toString(),
            limit: meta.limit.toString(),
            filter
        });

        fetch(`/api/dashboard/notifications?${query}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setNotifications(data.data);
                    setMeta(data.meta);
                } else {
                    setNotifications([]);
                }
            })
            .catch(err => console.error('Failed to fetch notifications:', err))
            .finally(() => setLoading(false));
    }, [meta.page, meta.limit, filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch(`/api/dashboard/notifications/${id}/read`, { method: 'POST' });
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/dashboard/notifications/read-all', { method: 'POST' });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handlePageChange = (newPage: number) => {
        setMeta(prev => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (newLimit: number) => {
        setMeta(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ flexShrink: 0, marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>Notifications</h1>
                        <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>System alerts and updates</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', background: '#F3F4F6', padding: '0.25rem', borderRadius: '12px' }}>
                            <button
                                onClick={() => { setFilter('all'); setMeta(prev => ({ ...prev, page: 1 })); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: filter === 'all' ? '#FFFFFF' : 'transparent',
                                    color: filter === 'all' ? '#111827' : '#6B7280',
                                    boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            >
                                All
                            </button>
                            <button
                                onClick={() => { setFilter('unread'); setMeta(prev => ({ ...prev, page: 1 })); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: filter === 'unread' ? '#FFFFFF' : 'transparent',
                                    color: filter === 'unread' ? '#111827' : '#6B7280',
                                    boxShadow: filter === 'unread' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Unread Only
                            </button>
                        </div>
                        <button
                            onClick={markAllAsRead}
                            style={{
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.625rem 1.25rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Mark All Read
                        </button>
                    </div>
                </div>
            </div>

            <div className="premium-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0' }}>
                <div style={{ overflowY: 'auto', flex: 1 }} className="scrollbar-hide">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center p-8 text-gray-500">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        <div style={{ display: 'grid' }}>
                            {notifications.map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        padding: '1.5rem',
                                        borderBottom: '1px solid #F3F4F6',
                                        background: n.is_read ? '#FFFFFF' : '#F0F9FF',
                                        display: 'flex',
                                        gap: '1rem',
                                        transition: 'background 0.2s',
                                        alignItems: 'flex-start'
                                    }}
                                    className="hover:bg-gray-50"
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: n.type === 'ERROR' ? '#FEE2E2' : (n.type === 'WARNING' ? '#FEF3C7' : (n.type === 'SUCCESS' ? '#DCFCE7' : '#EFF6FF')),
                                        color: n.type === 'ERROR' ? '#991B1B' : (n.type === 'WARNING' ? '#92400E' : (n.type === 'SUCCESS' ? '#166534' : '#1E40AF')),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        flexShrink: 0
                                    }}>
                                        {n.type === 'ERROR' ? '🚨' : (n.type === 'WARNING' ? '⚠️' : (n.type === 'SUCCESS' ? '✅' : 'ℹ️'))}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{n.title}</h3>
                                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                {new Date(n.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ color: '#4B5563', lineHeight: '1.5', fontSize: '0.95rem' }}>{n.message}</p>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={(e) => markAsRead(n.id, e)}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                border: '1px solid #BFDBFE',
                                                background: '#FFFFFF',
                                                color: '#2563EB',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                            className="hover:bg-blue-50"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#9CA3AF' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>No notifications found</div>
                            {filter === 'unread' && <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>You're all caught up!</div>}
                        </div>
                    )}
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>
        </div>
    );
}

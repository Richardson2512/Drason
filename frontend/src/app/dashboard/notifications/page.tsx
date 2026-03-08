'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowLimitSelector } from '@/components/ui/RowLimitSelector';
import type { Notification, PaginatedResponse } from '@/types/api';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
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

        apiClient<PaginatedResponse<Notification>>(`/api/dashboard/notifications?${query}`)
            .then(data => {
                if (data?.data) {
                    setNotifications(data.data);
                    if (data.meta) setMeta(data.meta);
                } else if (Array.isArray(data)) {
                    setNotifications(data as Notification[]);
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
            await apiClient<{ success: boolean }>(`/api/dashboard/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient<{ success: boolean }>('/api/dashboard/notifications/read-all', { method: 'POST' });
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

    const iconMap: Record<string, { bg: string; color: string; emoji: string }> = {
        ERROR: { bg: 'bg-red-100', color: 'text-red-800', emoji: '🚨' },
        WARNING: { bg: 'bg-amber-100', color: 'text-amber-800', emoji: '⚠️' },
        SUCCESS: { bg: 'bg-green-100', color: 'text-green-800', emoji: '✅' },
        INFO: { bg: 'bg-blue-50', color: 'text-blue-800', emoji: 'ℹ️' },
    };

    const FilterButton = ({ value, label }: { value: 'all' | 'unread'; label: string }) => (
        <button
            onClick={() => { setFilter(value); setMeta(prev => ({ ...prev, page: 1 })); }}
            className={`px-4 py-2 rounded-lg border-none cursor-pointer font-semibold text-sm ${
                filter === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-transparent text-gray-500'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="page-header shrink-0 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Notifications</h1>
                        <div className="text-gray-500 text-lg">System alerts and updates</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <FilterButton value="all" label="All" />
                            <FilterButton value="unread" label="Unread Only" />
                        </div>
                        <button
                            onClick={markAllAsRead}
                            className="btn-hover-lift-sm border-none text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer text-white"
                            style={{
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                            }}
                        >
                            Mark All Read
                        </button>
                    </div>
                </div>
            </div>

            <div className="premium-card flex-1 overflow-hidden flex flex-col !p-0">
                <div className="overflow-y-auto flex-1 scrollbar-hide">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center p-8 text-gray-500">Loading notifications...</div>
                    ) : notifications.length > 0 ? (
                        <div className="grid">
                            {notifications.map(n => {
                                const icon = iconMap[n.type] || iconMap.INFO;
                                return (
                                    <div
                                        key={n.id}
                                        className={`p-6 border-b border-gray-100 flex gap-4 transition-colors items-start hover:bg-gray-50 ${
                                            n.is_read ? 'bg-white' : 'bg-sky-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${icon.bg} ${icon.color} flex items-center justify-center text-xl shrink-0`}>
                                            {icon.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h3 className="font-bold text-gray-900 text-base">{n.title}</h3>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-[0.95rem]">{n.message}</p>
                                        </div>
                                        {!n.is_read && (
                                            <button
                                                onClick={(e) => markAsRead(n.id, e)}
                                                className="px-3 py-1 rounded-full border border-blue-200 bg-white text-blue-600 text-xs font-semibold cursor-pointer whitespace-nowrap hover:bg-blue-50"
                                            >
                                                Mark Read
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-400">
                            <div className="text-5xl mb-4 opacity-50">📭</div>
                            <div className="text-lg font-medium">No notifications found</div>
                            {filter === 'unread' && <div className="text-sm mt-2">You're all caught up!</div>}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <RowLimitSelector limit={meta.limit} onLimitChange={handleLimitChange} />
                    <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
                </div>
            </div>
        </div>
    );
}

'use client';

/**
 * Slack notifications panel - surfaces every event_type the platform can fire
 * into Slack, lets the operator toggle each one, and optionally re-route a
 * given event to a different channel than the integration default.
 *
 * Renders inside SlackIntegrationCard only when the workspace is connected.
 * Has two tabs:
 *   - Settings - checkbox + channel override per event, grouped by area.
 *   - History  - recent feed of what was sent or suppressed.
 */

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import CustomSelect from '@/components/ui/CustomSelect';
import { Bell, History, Save, Loader2, CheckCircle2, MinusCircle } from 'lucide-react';

interface CatalogEvent {
    event_type: string;
    label: string;
    description: string;
    group: string;
    default_enabled: boolean;
    enabled: boolean;
    channel_id_override: string | null;
}

interface CatalogGroup { key: string; label: string; description: string; }

interface HistoryRow {
    id: string;
    event_type: string;
    label: string;
    title: string | null;
    message: string | null;
    severity: string | null;
    entity_id: string | null;
    channel_id: string | null;
    suppressed_by_pref: boolean;
    sent_at: string;
}

export default function SlackNotificationsPanel({ channels }: { channels: { id: string; name: string }[] }) {
    const [tab, setTab] = useState<'settings' | 'history'>('settings');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [groups, setGroups] = useState<CatalogGroup[]>([]);
    const [events, setEvents] = useState<CatalogEvent[]>([]);
    const [dirty, setDirty] = useState(false);

    const [history, setHistory] = useState<HistoryRow[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyTotal, setHistoryTotal] = useState(0);
    const HISTORY_LIMIT = 25;
    const [historyOffset, setHistoryOffset] = useState(0);

    const loadCatalog = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient<{ success: boolean; data: { groups: CatalogGroup[]; events: CatalogEvent[] } }>(
                '/api/slack/notifications/catalog',
            );
            setGroups(res.data.groups);
            setEvents(res.data.events);
            setDirty(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load notification settings');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async (offset: number) => {
        setHistoryLoading(true);
        try {
            const res = await apiClient<{ success: boolean; data: HistoryRow[]; meta: { total: number } }>(
                `/api/slack/notifications/history?limit=${HISTORY_LIMIT}&offset=${offset}`,
            );
            setHistory(res.data);
            setHistoryTotal(res.meta.total);
            setHistoryOffset(offset);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load notification history');
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => { loadCatalog(); }, [loadCatalog]);
    useEffect(() => {
        if (tab === 'history' && history.length === 0) loadHistory(0);
    }, [tab, history.length, loadHistory]);

    const toggleEvent = (eventType: string) => {
        setEvents(prev => prev.map(e => e.event_type === eventType ? { ...e, enabled: !e.enabled } : e));
        setDirty(true);
    };

    const setChannelOverride = (eventType: string, channelId: string) => {
        setEvents(prev => prev.map(e => e.event_type === eventType ? { ...e, channel_id_override: channelId || null } : e));
        setDirty(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            await apiClient('/api/slack/notifications/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences: events.map(e => ({
                        event_type: e.event_type,
                        enabled: e.enabled,
                        channel_id_override: e.channel_id_override,
                    })),
                }),
            });
            toast.success('Notification preferences saved');
            setDirty(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(historyTotal / HISTORY_LIMIT));
    const currentPage = Math.floor(historyOffset / HISTORY_LIMIT) + 1;

    return (
        <div className="mt-6 premium-card">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        <Bell size={13} /> Notifications
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        Pick exactly which events get posted to Slack and where they land.
                    </p>
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#FAFAF8', border: '1px solid #D1CBC5' }}>
                    <button
                        onClick={() => setTab('settings')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${tab === 'settings' ? 'bg-white text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                        style={tab === 'settings' ? { border: '1px solid #D1CBC5' } : undefined}
                    >
                        <Bell size={11} /> Settings
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${tab === 'history' ? 'bg-white text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                        style={tab === 'history' ? { border: '1px solid #D1CBC5' } : undefined}
                    >
                        <History size={11} /> History
                    </button>
                </div>
            </div>

            {tab === 'settings' && (
                <>
                    {loading ? (
                        <div className="text-xs text-gray-500 py-6 text-center">Loading…</div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-4">
                                {groups.map(g => {
                                    const groupEvents = events.filter(e => e.group === g.key);
                                    if (groupEvents.length === 0) return null;
                                    return (
                                        <div key={g.key}>
                                            <div className="mb-1.5">
                                                <h4 className="text-xs font-semibold text-gray-900">{g.label}</h4>
                                                <p className="text-[11px] text-gray-500">{g.description}</p>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                {groupEvents.map(ev => (
                                                    <div
                                                        key={ev.event_type}
                                                        className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-[#FAFAF8]"
                                                        style={{ border: '1px solid #E8E3DC' }}
                                                    >
                                                        <label className="col-span-7 flex items-start gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={ev.enabled}
                                                                onChange={() => toggleEvent(ev.event_type)}
                                                                className="mt-0.5 accent-gray-900 cursor-pointer"
                                                            />
                                                            <span className="min-w-0">
                                                                <span className="text-xs font-semibold text-gray-900">{ev.label}</span>
                                                                <span className="block text-[11px] text-gray-500 leading-relaxed">{ev.description}</span>
                                                            </span>
                                                        </label>
                                                        <div className="col-span-5">
                                                            <CustomSelect
                                                                value={ev.channel_id_override || ''}
                                                                onChange={(v) => setChannelOverride(ev.event_type, v)}
                                                                options={[
                                                                    { value: '', label: 'Default channel' },
                                                                    ...channels.map(c => ({ value: c.id, label: `#${c.name}` })),
                                                                ]}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #E8E3DC' }}>
                                <span className="text-[11px] text-gray-500">
                                    {events.filter(e => e.enabled).length} of {events.length} events enabled
                                </span>
                                <div className="flex items-center gap-2">
                                    {dirty && <span className="text-[11px] font-semibold text-amber-700">Unsaved changes</span>}
                                    <button
                                        onClick={save}
                                        disabled={!dirty || saving}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {tab === 'history' && (
                <>
                    {historyLoading ? (
                        <div className="text-xs text-gray-500 py-6 text-center">Loading…</div>
                    ) : history.length === 0 ? (
                        <div className="text-xs text-gray-500 py-8 text-center">
                            No notifications recorded yet. Once events fire, they&apos;ll show up here.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {history.map(h => (
                                <HistoryRow key={h.id} row={h} channels={channels} />
                            ))}
                        </div>
                    )}
                    {historyTotal > HISTORY_LIMIT && (
                        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #E8E3DC' }}>
                            <span className="text-[11px] text-gray-500">
                                Page {currentPage} / {totalPages} · {historyTotal} total
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => loadHistory(Math.max(0, historyOffset - HISTORY_LIMIT))}
                                    disabled={historyOffset <= 0 || historyLoading}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => loadHistory(historyOffset + HISTORY_LIMIT)}
                                    disabled={historyOffset + HISTORY_LIMIT >= historyTotal || historyLoading}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function HistoryRow({ row, channels }: { row: HistoryRow; channels: { id: string; name: string }[] }) {
    const channelName = row.channel_id ? channels.find(c => c.id === row.channel_id)?.name : null;
    const sevColor =
        row.severity === 'critical' ? { bg: '#FEF2F2', fg: '#B91C1C', dot: '#DC2626' } :
        row.severity === 'warn'     ? { bg: '#FFFBEB', fg: '#B45309', dot: '#F59E0B' } :
                                       { bg: '#F0FDF4', fg: '#15803D', dot: '#22C55E' };
    const when = new Date(row.sent_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    return (
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAFAF8]" style={{ border: '1px solid #E8E3DC' }}>
            <span className="mt-0.5 shrink-0">
                {row.suppressed_by_pref
                    ? <MinusCircle size={13} className="text-gray-400" />
                    : <CheckCircle2 size={13} style={{ color: sevColor.dot }} />}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-gray-900">{row.title || row.label}</span>
                    <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: sevColor.bg, color: sevColor.fg }}
                    >
                        {row.label}
                    </span>
                    {row.suppressed_by_pref && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                            Suppressed
                        </span>
                    )}
                </div>
                {row.message && (
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{row.message}</p>
                )}
                <div className="text-[10px] text-gray-400 mt-0.5">
                    {when}{channelName && ` · #${channelName}`}
                </div>
            </div>
        </div>
    );
}

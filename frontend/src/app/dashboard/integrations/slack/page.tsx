'use client';

/**
 * Slack integration detail page. Connect / disconnect flow + alerts
 * channel picker. Lives under /dashboard/integrations/slack so the
 * integrations grid links here directly instead of dumping the customer
 * onto the legacy "Settings & Configuration" page.
 *
 * Re-styled to match the integrations page theme (white cards,
 * #E2E8F0 borders, rounded-xl, subtle status pills) — the legacy
 * SlackIntegrationCard component used a heavier "premium-card" look
 * with rounded-3xl + bigger padding that didn't match the rest of
 * /dashboard/integrations.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import type { SettingEntry, SlackChannel } from '@/types/api';
import CustomSelect from '@/components/ui/CustomSelect';
import {
    ChevronLeft,
    AlertCircle,
} from 'lucide-react';

function SlackLogo({ size = 26 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 127 127" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.2 80a13.6 13.6 0 01-13.6 13.6A13.6 13.6 0 010 80a13.6 13.6 0 0113.6-13.6h13.6V80zm6.8 0a13.6 13.6 0 0113.6-13.6 13.6 13.6 0 0113.6 13.6v34a13.6 13.6 0 01-13.6 13.6A13.6 13.6 0 0134 114V80z" fill="#E01E5A" />
            <path d="M47.6 27.2A13.6 13.6 0 0134 13.6 13.6 13.6 0 0147.6 0a13.6 13.6 0 0113.6 13.6v13.6H47.6zm0 6.8a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6H13.6A13.6 13.6 0 010 47.6 13.6 13.6 0 0113.6 34h34z" fill="#36C5F0" />
            <path d="M99.6 47.6a13.6 13.6 0 0113.6-13.6 13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6H99.6V47.6zm-6.8 0a13.6 13.6 0 01-13.6 13.6 13.6 13.6 0 01-13.6-13.6V13.6A13.6 13.6 0 0179.2 0a13.6 13.6 0 0113.6 13.6v34z" fill="#2EB67D" />
            <path d="M79.2 99.6a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6 13.6 13.6 0 01-13.6-13.6V99.6h13.6zm0-6.8a13.6 13.6 0 01-13.6-13.6 13.6 13.6 0 0113.6-13.6h34a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6h-34z" fill="#ECB22E" />
        </svg>
    );
}

export default function SlackIntegrationPage() {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [alertsChannel, setAlertsChannel] = useState('');
    const [alertsStatus, setAlertsStatus] = useState('active');
    const [lastError, setLastError] = useState('');
    const [lastErrorAt, setLastErrorAt] = useState('');
    const [channels, setChannels] = useState<SlackChannel[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [savingChannel, setSavingChannel] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                const arr = Array.isArray(data) ? data : [];
                const isConnected = arr.find(s => s.key === 'SLACK_CONNECTED')?.value === 'true';
                setConnected(isConnected);
                if (isConnected) {
                    setAlertsChannel(arr.find(s => s.key === 'SLACK_ALERTS_CHANNEL')?.value || '');
                    setAlertsStatus(arr.find(s => s.key === 'SLACK_ALERTS_STATUS')?.value || 'active');
                    setLastError(arr.find(s => s.key === 'SLACK_ALERTS_LAST_ERROR')?.value || '');
                    setLastErrorAt(arr.find(s => s.key === 'SLACK_ALERTS_LAST_ERROR_AT')?.value || '');
                }
            })
            .catch(err => console.error('[SlackIntegrationPage] settings fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!connected) return;
        setLoadingChannels(true);
        apiClient<SlackChannel[] | { data?: SlackChannel[] }>('/api/slack/channels')
            .then(res => {
                const list: SlackChannel[] = Array.isArray(res) ? res : (res?.data || []);
                setChannels(list);
            })
            .catch(err => console.error('Failed to fetch slack channels', err))
            .finally(() => setLoadingChannels(false));
    }, [connected]);

    const handleSaveChannel = async (channelId: string) => {
        try {
            setSavingChannel(true);
            setMsg('');
            await apiClient<{ success: boolean }>('/api/slack/channel', {
                method: 'POST',
                body: JSON.stringify({ channel_id: channelId }),
            });
            setAlertsChannel(channelId);
            setAlertsStatus('active');
            setMsg('Channel updated. A test message was sent.');
        } catch (e: any) {
            setMsg(e?.message ? `Failed to update channel: ${e.message}` : 'Failed to update channel.');
        } finally {
            setSavingChannel(false);
        }
    };

    const handleConnect = () => {
        window.location.href = '/api/slack/install';
    };

    const handleDisconnect = async () => {
        try {
            setShowDisconnectConfirm(false);
            setDisconnecting(true);
            setMsg('');
            await apiClient<{ success: boolean }>('/api/user/settings/slack/disconnect', { method: 'POST' });
            setConnected(false);
            setAlertsChannel('');
            setAlertsStatus('revoked');
            setMsg('Slack disconnected.');
        } catch (e: any) {
            setMsg(e?.message ? `Failed to disconnect: ${e.message}` : 'Failed to disconnect.');
        } finally {
            setDisconnecting(false);
        }
    };

    const statusPill = (() => {
        if (!connected) {
            return { label: 'Not Connected', bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' };
        }
        if (alertsStatus === 'revoked') {
            return { label: 'Revoked', bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' };
        }
        return { label: 'Connected', bg: '#D1FAE5', text: '#065F46', dot: '#10B981' };
    })();

    return (
        <div className="p-6 max-w-4xl">
            <Link
                href="/dashboard/integrations"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-4 no-underline"
            >
                <ChevronLeft size={14} />
                All integrations
            </Link>

            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <SlackLogo />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 m-0">Slack</h1>
                        <p className="text-xs text-slate-500 m-0 mt-0.5">Real-time alerts for pauses, bounces, and infrastructure health issues</p>
                    </div>
                </div>
                <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ background: statusPill.bg, color: statusPill.text }}
                >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusPill.dot }} />
                    {statusPill.label}
                </span>
            </div>

            {msg && (
                <div
                    className="border rounded-xl px-4 py-3 mb-4 text-xs"
                    style={{
                        background: msg.startsWith('Failed') ? '#FEF2F2' : '#F0FDF4',
                        color: msg.startsWith('Failed') ? '#991B1B' : '#166534',
                        borderColor: msg.startsWith('Failed') ? '#FECACA' : '#BBF7D0',
                    }}
                >
                    {msg}
                </div>
            )}

            {loading ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-xs text-slate-400">Loading…</div>
            ) : !connected ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <h2 className="text-sm font-bold text-gray-900 m-0 mb-1">Connect your Slack workspace</h2>
                    <p className="text-xs text-slate-500 leading-relaxed m-0 mb-4">
                        We&apos;ll route operational alerts (mailbox paused, domain quarantined, campaign paused, healing transitions) to a channel of your choice. You can change the channel or disconnect any time.
                    </p>
                    <button
                        onClick={handleConnect}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold border-none cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                        <SlackLogo size={14} />
                        Connect Slack
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Alerts channel */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Alerts Channel</div>
                        <p className="text-[11px] text-slate-500 m-0 mb-3 leading-relaxed">
                            Where Superkabe will post operational alerts. Picking a channel sends a test message immediately.
                        </p>
                        <div style={{ opacity: loadingChannels || savingChannel ? 0.6 : 1, pointerEvents: loadingChannels || savingChannel ? 'none' : 'auto' }}>
                            <CustomSelect
                                value={alertsChannel}
                                onChange={handleSaveChannel}
                                placeholder={loadingChannels ? 'Loading channels…' : 'Select a channel…'}
                                searchable
                                options={channels.map(c => ({ value: c.id, label: `#${c.name}` }))}
                            />
                        </div>
                    </div>

                    {/* Last error (if any) */}
                    {lastError && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
                            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">Last delivery error</div>
                                <p className="text-xs text-amber-900 m-0 leading-relaxed">
                                    {lastError}
                                    {lastErrorAt && (
                                        <span className="text-amber-600 ml-1">({new Date(lastErrorAt).toLocaleString()})</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Disconnect */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Disconnect</div>
                        <p className="text-[11px] text-slate-500 m-0 mb-3 leading-relaxed">
                            Removes the OAuth grant from this org. Future alerts won&apos;t be delivered until you reconnect.
                        </p>
                        {showDisconnectConfirm ? (
                            <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-lg p-3">
                                <span className="text-xs font-semibold text-red-800">Disconnect Slack from this org?</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDisconnectConfirm(false)}
                                        disabled={disconnecting}
                                        className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDisconnect}
                                        disabled={disconnecting}
                                        className="px-3 py-1.5 rounded-md border-none bg-red-600 text-white text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                                    >
                                        {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDisconnectConfirm(true)}
                                className="px-3 py-1.5 rounded-md border border-red-200 bg-white text-[11px] font-semibold text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
                            >
                                Disconnect Slack
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

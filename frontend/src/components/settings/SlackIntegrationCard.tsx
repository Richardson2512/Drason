'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { SettingEntry, SlackChannel } from '@/types/api';
import CustomSelect from '@/components/ui/CustomSelect';
import PostmasterToolsCard from '@/components/settings/PostmasterToolsCard';

export default function SlackIntegrationCard({ settings: settingsProp }: { settings?: SettingEntry[] } = {}) {
    const [slackConnected, setSlackConnected] = useState(false);
    const [slackChannels, setSlackChannels] = useState<{ id: string, name: string }[]>([]);
    const [slackAlertsChannel, setSlackAlertsChannel] = useState('');
    const [slackAlertsStatus, setSlackAlertsStatus] = useState('active');
    const [slackAlertsLastError, setSlackAlertsLastError] = useState('');
    const [slackAlertsLastErrorAt, setSlackAlertsLastErrorAt] = useState('');
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [savingChannel, setSavingChannel] = useState(false);
    const [disconnectingSlack, setDisconnectingSlack] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const applySettings = (settingsData: SettingEntry[]) => {
            const slackSetting = settingsData.find(s => s.key === 'SLACK_CONNECTED');
            const isSlackConnected = slackSetting?.value === 'true';
            setSlackConnected(isSlackConnected);

            if (isSlackConnected) {
                const channelDef = settingsData.find(s => s.key === 'SLACK_ALERTS_CHANNEL');
                if (channelDef) setSlackAlertsChannel(channelDef.value);

                const statusDef = settingsData.find(s => s.key === 'SLACK_ALERTS_STATUS');
                if (statusDef) setSlackAlertsStatus(statusDef.value);

                const lastErrDef = settingsData.find(s => s.key === 'SLACK_ALERTS_LAST_ERROR');
                if (lastErrDef) setSlackAlertsLastError(lastErrDef.value);

                const lastErrAtDef = settingsData.find(s => s.key === 'SLACK_ALERTS_LAST_ERROR_AT');
                if (lastErrAtDef) setSlackAlertsLastErrorAt(lastErrAtDef.value);
            }
        };

        if (settingsProp) {
            applySettings(settingsProp);
            return;
        }
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                if (data) {
                    applySettings(Array.isArray(data) ? data : []);
                }
            })
            .catch(err => console.error('[SlackIntegrationCard] Failed to fetch settings', err));
    }, [settingsProp]);

    useEffect(() => {
        if (slackConnected) {
            setLoadingChannels(true);
            apiClient<any>('/api/slack/channels')
                .then(res => {
                    // apiClient unwraps `data`, so res is usually the array directly
                    const list: SlackChannel[] = Array.isArray(res) ? res : (res?.data || []);
                    setSlackChannels(list);
                })
                .catch(err => console.error('Failed to fetch slack channels', err))
                .finally(() => setLoadingChannels(false));
        }
    }, [slackConnected]);

    const handleSaveSlackChannel = async (channelId: string) => {
        try {
            setSavingChannel(true);
            setMsg('');
            const selectedChannel = slackChannels.find(c => c.id === channelId);

            await apiClient<{ success: boolean }>('/api/slack/channel', {
                method: 'POST',
                body: JSON.stringify({ channel_id: channelId }),
            });

            setSlackAlertsChannel(channelId);
            setSlackAlertsStatus('active');
            setMsg('Slack alerts channel updated successfully. Test message sent!');
        } catch (e: any) {
            setMsg('Failed to update Slack channel: ' + e.message);
        } finally {
            setSavingChannel(false);
        }
    };

    const handleDisconnectSlack = async () => {
        try {
            setShowDisconnectConfirm(false);
            setDisconnectingSlack(true);
            setMsg('');

            await apiClient<{ success: boolean }>('/api/user/settings/slack/disconnect', {
                method: 'POST'
            });

            setSlackConnected(false);
            setSlackAlertsChannel('');
            setSlackAlertsStatus('revoked');
            setMsg('Slack integration disconnected successfully.');
        } catch (e: any) {
            setMsg('Failed to disconnect Slack: ' + e.message);
        } finally {
            setDisconnectingSlack(false);
        }
    };

    const handleSlackConnect = async () => {
        window.location.href = '/api/slack/install';
    };

    return (
        <div className="bg-white rounded-3xl p-10 shadow-sm mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Slack Integration</h2>
            <p className="text-gray-500 text-[0.95rem] mb-8">Connect Slack to receive real-time alerts about domain pausing and infrastructure health.</p>

            {msg && (
                <div className="p-4 mb-8 rounded-xl text-[0.9rem]" style={{
                    background: msg.includes('Error') || msg.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
                    color: msg.includes('Error') || msg.includes('Failed') ? '#991B1B' : '#166534',
                    border: `1px solid ${msg.includes('Error') || msg.includes('Failed') ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg}
                </div>
            )}

            {!slackConnected ? (
                <button
                    onClick={handleSlackConnect}
                    className="py-3 px-8 rounded-full bg-gray-900 text-white font-semibold border-none cursor-pointer text-base transition-all duration-200 shadow-md flex items-center gap-3"
                >
                    <svg width="20" height="20" viewBox="0 0 127 127" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M27.2 80a13.6 13.6 0 01-13.6 13.6A13.6 13.6 0 010 80a13.6 13.6 0 0113.6-13.6h13.6V80zm6.8 0a13.6 13.6 0 0113.6-13.6 13.6 13.6 0 0113.6 13.6v34a13.6 13.6 0 01-13.6 13.6A13.6 13.6 0 0134 114V80z" fill="#E01E5A" />
                        <path d="M47.6 27.2A13.6 13.6 0 0134 13.6 13.6 13.6 0 0147.6 0a13.6 13.6 0 0113.6 13.6v13.6H47.6zm0 6.8a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6H13.6A13.6 13.6 0 010 47.6 13.6 13.6 0 0113.6 34h34z" fill="#36C5F0" />
                        <path d="M99.6 47.6a13.6 13.6 0 0113.6-13.6 13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6H99.6V47.6zm-6.8 0a13.6 13.6 0 01-13.6 13.6 13.6 13.6 0 01-13.6-13.6V13.6A13.6 13.6 0 0179.2 0a13.6 13.6 0 0113.6 13.6v34z" fill="#2EB67D" />
                        <path d="M79.2 99.6a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6 13.6 13.6 0 01-13.6-13.6V99.6h13.6zm0-6.8a13.6 13.6 0 01-13.6-13.6 13.6 13.6 0 0113.6-13.6h34a13.6 13.6 0 0113.6 13.6 13.6 13.6 0 01-13.6 13.6h-34z" fill="#ECB22E" />
                    </svg>
                    Connect Slack
                </button>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <span className="py-1 px-3 rounded-full text-[0.85rem] font-bold" style={{
                            background: slackAlertsStatus === 'active' ? '#DCFCE7' : '#FEF2F2',
                            color: slackAlertsStatus === 'active' ? '#166534' : '#991B1B'
                        }}>
                            {slackAlertsStatus === 'active' ? 'Active' : 'Offline'}
                        </span>
                        {slackAlertsLastError && (
                            <span className="text-[0.85rem] text-red-500">
                                Last error: {slackAlertsLastError} ({new Date(slackAlertsLastErrorAt).toLocaleString()})
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="block text-[0.9rem] font-semibold text-gray-700 mb-2">
                            Alerts Channel
                        </label>
                        <div style={{ opacity: loadingChannels || savingChannel ? 0.6 : 1, pointerEvents: loadingChannels || savingChannel ? 'none' : 'auto' }}>
                            <CustomSelect
                                value={slackAlertsChannel}
                                onChange={handleSaveSlackChannel}
                                placeholder={loadingChannels ? 'Loading channels...' : 'Select a channel...'}
                                searchable
                                options={slackChannels.map(c => ({ value: c.id, label: `#${c.name}` }))}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        {showDisconnectConfirm ? (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-between">
                                <span className="text-red-800 font-semibold">Are you sure you want to disconnect Slack?</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowDisconnectConfirm(false)} className="py-2 px-4 rounded-lg border border-gray-300 bg-white cursor-pointer font-semibold">Cancel</button>
                                    <button onClick={handleDisconnectSlack} disabled={disconnectingSlack} className="py-2 px-4 rounded-lg border-none bg-red-600 text-white font-semibold" style={{ cursor: disconnectingSlack ? 'not-allowed' : 'pointer' }}>{disconnectingSlack ? 'Disconnecting...' : 'Yes, Disconnect'}</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowDisconnectConfirm(true)} className="py-2 px-4 rounded-lg border border-red-200 bg-red-50 text-red-600 cursor-pointer font-semibold transition-all duration-200">
                                Disconnect Slack
                            </button>
                        )}
                    </div>
                </div>
            )}

            <PostmasterToolsCard embedded />
        </div>
    );
}

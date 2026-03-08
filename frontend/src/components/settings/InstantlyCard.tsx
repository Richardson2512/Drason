'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { SettingEntry } from '@/types/api';
import CopyButton from '@/components/CopyButton';

export default function InstantlyCard({
    webhookUrl,
    onTriggerSync,
    settings,
}: {
    webhookUrl?: string;
    onTriggerSync?: () => Promise<void>;
    settings?: SettingEntry[];
}) {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (settings) {
            const keySetting = settings.find(s => s.key === 'INSTANTLY_API_KEY');
            if (keySetting) setApiKey(keySetting.value);
            return;
        }
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                if (data) {
                    const arr = Array.isArray(data) ? data : [];
                    const keySetting = arr.find((s: SettingEntry) => s.key === 'INSTANTLY_API_KEY');
                    if (keySetting) setApiKey(keySetting.value);
                }
            })
            .catch(err => console.error('[InstantlyCard] Failed to fetch settings', err));
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ INSTANTLY_API_KEY: apiKey }),
            });
            setMsg('Instantly API key saved successfully.');
        } catch (err: any) {
            setMsg(err.message || 'Error saving Instantly settings.');
        } finally {
            setLoading(false);
        }
    };

    const isError = msg.includes('Error') || msg.includes('Failed');

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center shadow-sm border border-slate-100">
                    <img src="/instantly.png" alt="Instantly" width={24} height={24} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">
                        Instantly Integration
                    </h2>
                    <p className="text-sm text-slate-500">
                        Connect your Instantly account to sync campaigns, monitor deliverability, and auto-heal infrastructure.
                    </p>
                </div>
                <a
                    href="/docs/instantly-integration"
                    target="_blank"
                    title="View integration guide"
                    className="help-link-hover w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 no-underline shrink-0"
                >
                    <span className="text-base">❓</span>
                </a>
            </div>

            {/* Status message */}
            {msg && (
                <div className="p-4 mb-6 rounded-xl text-[0.9rem]" style={{
                    background: isError ? '#FEF2F2' : '#F0FDF4',
                    color: isError ? '#991B1B' : '#166534',
                    border: `1px solid ${isError ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg}
                </div>
            )}

            {/* API Key form */}
            <form onSubmit={handleSave} className="mb-8">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Instantly API V2 Key
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                        Generate at Instantly → Settings → API Keys. Requires Growth plan or above.
                    </p>
                    <input
                        type="password"
                        placeholder="Paste your V2 API key here..."
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className="premium-input w-full"
                    />
                </div>
                <button type="submit" className="premium-btn w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>

            {/* Webhook Endpoint */}
            <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">
                        Webhook Endpoint
                    </h3>
                    {webhookUrl && (
                        <CopyButton
                            text={webhookUrl}
                            label="Copy URL"
                            className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0"
                        />
                    )}
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 break-all font-mono text-[0.8rem] text-blue-600">
                    {webhookUrl || 'Loading...'}
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Paste this URL in Instantly → Settings → Integrations → Webhooks.
                    Select all events: email sent, opened, clicked, bounced, replied, unsubscribed.
                    Include the <code className="font-mono font-semibold">x-organization-id</code> header.
                </p>

                {/* Manual sync button */}
                {onTriggerSync && (
                    <button
                        onClick={async () => {
                            setSyncing(true);
                            try {
                                await onTriggerSync();
                            } finally {
                                setSyncing(false);
                            }
                        }}
                        disabled={loading || syncing}
                        className="premium-btn w-full mt-4 bg-white text-slate-800 border border-slate-200"
                    >
                        {syncing ? 'Syncing...' : 'Trigger Manual Sync'}
                    </button>
                )}

                {/* 24/7 monitoring info */}
                <div className="mt-6 p-4 rounded-[10px] border-2 border-blue-600" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-base shrink-0">
                            ⚡
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-sm font-extrabold text-blue-800 m-0">
                                    24/7 Auto-Sync Active
                                </h4>
                                <span className="py-0.5 px-2 bg-blue-600 text-white rounded-full text-[0.5rem] font-bold tracking-wide">
                                    LIVE
                                </span>
                            </div>
                            <p className="text-xs text-blue-700 m-0 leading-relaxed">
                                Your Instantly data syncs automatically every <strong>20 minutes</strong>.
                                Manual sync is available for immediate updates after changes.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

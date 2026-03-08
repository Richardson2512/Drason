'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import type { SettingEntry, SyncResponse } from '@/types/api';
import CopyButton from '@/components/CopyButton';

export default function SmartleadCard({
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
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (settings) {
            const keySetting = settings.find(s => s.key === 'SMARTLEAD_API_KEY');
            if (keySetting) setApiKey(keySetting.value);
            return;
        }
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                if (data) {
                    const arr = Array.isArray(data) ? data : [];
                    const keySetting = arr.find((s: SettingEntry) => s.key === 'SMARTLEAD_API_KEY');
                    if (keySetting) setApiKey(keySetting.value);
                }
            })
            .catch(err => console.error('[SmartleadCard] Failed to fetch settings', err));
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ SMARTLEAD_API_KEY: apiKey }),
            });
            setMsg('Settings saved successfully.');
        } catch (err: any) {
            setMsg(err.message || 'Error saving settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center shadow-sm border border-slate-100">
                    <Image src="/smartlead.webp" alt="Smartlead" width={24} height={24} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">Smartlead Integration</h2>
                    <p className="text-sm text-slate-500">Sync campaigns & monitor activity.</p>
                </div>
                <a
                    href="/docs/smartlead-integration"
                    target="_blank"
                    title="View integration guide"
                    className="help-link-hover w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 no-underline border border-slate-200"
                >
                    <span className="text-base">❓</span>
                </a>
            </div>

            <form onSubmit={handleSave} className="mb-8">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">API Key</label>
                    <p className="text-xs text-slate-400 mb-2">
                        Generate at Smartlead → Settings → API Key. Available on all paid plans.
                    </p>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className="premium-input w-full"
                        placeholder="sk_..."
                    />
                </div>
                <button type="submit" className="premium-btn w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Configuration'}
                </button>
                {msg && <div className={`text-center mt-4 text-sm font-medium ${msg.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>{msg}</div>}
            </form>

            <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Webhook Endpoint</h3>
                    {webhookUrl && (
                        <CopyButton text={webhookUrl} label="Copy URL" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />
                    )}
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 break-all font-mono text-[0.8rem] text-blue-600">
                    {webhookUrl || 'Loading...'}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Paste this URL in Smartlead → Settings → Webhooks.
                    Select all events: email sent, opened, clicked, bounced, replied, unsubscribed.
                    Include the <code className="font-mono font-semibold">x-organization-id</code> header.
                </p>
                {onTriggerSync && (
                    <button
                        onClick={async () => {
                            await onTriggerSync();
                        }}
                        disabled={loading}
                        className="premium-btn w-full mt-4 !bg-white !text-slate-800 !border !border-slate-200"
                    >
                        Trigger Manual Sync
                    </button>
                )}

                {/* 24/7 Monitoring Info */}
                <div className="mt-6 p-4 border-2 border-emerald-500 rounded-[10px] bg-[linear-gradient(135deg,#ECFDF5_0%,#D1FAE5_100%)]">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-base shrink-0">
                            ⚡
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-sm font-extrabold text-emerald-900 m-0">
                                    24/7 Auto-Sync Active
                                </h4>
                                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[0.5rem] font-bold tracking-wide">
                                    LIVE
                                </span>
                            </div>
                            <p className="text-xs text-emerald-700 m-0 leading-relaxed">
                                Your Smartlead data syncs automatically every <strong>20 minutes</strong>.
                                Manual sync is available for immediate updates after changes.
                            </p>
                            <a
                                href="/docs/help/24-7-monitoring"
                                target="_blank"
                                className="text-[0.6875rem] text-emerald-600 font-bold underline mt-2 inline-block"
                            >
                                Learn about 24/7 monitoring →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { SettingEntry } from '@/types/api';
import CopyButton from '@/components/CopyButton';

export default function EmailBisonCard({ webhookUrl, onTriggerSync, settings }: { webhookUrl?: string; onTriggerSync?: () => Promise<void>; settings?: SettingEntry[] }) {
    const [ebApiKey, setEbApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (settings) {
            const ebKeySetting = settings.find(s => s.key === 'EMAILBISON_API_KEY');
            if (ebKeySetting) setEbApiKey(ebKeySetting.value);
            return;
        }
        apiClient<SettingEntry[]>('/api/settings')
            .then(data => {
                if (data) {
                    const settingsData = Array.isArray(data) ? data : [];
                    const ebKeySetting = settingsData.find((s: SettingEntry) => s.key === 'EMAILBISON_API_KEY');
                    if (ebKeySetting) setEbApiKey(ebKeySetting.value);
                }
            })
            .catch(err => console.error('[EmailBisonCard] Failed to fetch settings', err));
    }, [settings]);

    const handleSaveEmailBison = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ EMAILBISON_API_KEY: ebApiKey })
            });
            setMsg('success:EmailBison API key saved successfully.');
        } catch (err: any) {
            setMsg('error:' + (err.message || 'Error saving EmailBison settings.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center shadow-sm border border-slate-100">
                    <img src="/emailbison.png" alt="EmailBison" width={24} height={24} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">EmailBison Integration</h2>
                    <p className="text-sm text-slate-500">Connect your EmailBison account to sync mailboxes and enable health tracking.</p>
                </div>
                <a
                    href="/docs/emailbison-integration"
                    target="_blank"
                    title="View integration guide"
                    className="help-link-hover w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 no-underline shrink-0"
                >
                    <span className="text-base">❓</span>
                </a>
            </div>

            {msg && (
                <div className="p-4 mb-6 rounded-xl text-[0.9rem]" style={{
                    background: msg.startsWith('error:') ? '#FEF2F2' : '#F0FDF4',
                    color: msg.startsWith('error:') ? '#991B1B' : '#166534',
                    border: `1px solid ${msg.startsWith('error:') ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg.replace(/^(success:|error:)/, '')}
                </div>
            )}

            <form onSubmit={handleSaveEmailBison} className="mb-8">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                        EmailBison API Key
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                        Generate at EmailBison → Settings → API Keys. Available on all paid plans.
                    </p>
                    <input
                        type="password"
                        placeholder="Paste your key here..."
                        value={ebApiKey}
                        onChange={e => setEbApiKey(e.target.value)}
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
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Webhook Endpoint</h3>
                    {webhookUrl && <CopyButton text={webhookUrl} label="Copy URL" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />}
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 break-all font-mono text-[0.8rem] text-blue-600">
                    {webhookUrl || 'Loading...'}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Paste this URL in EmailBison → Settings → Webhooks.
                    Select all events: email sent, opened, clicked, bounced, replied, unsubscribed.
                    Include the <code className="font-mono font-semibold">x-organization-id</code> header.
                </p>

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

                {/* 24/7 Monitoring Info */}
                <div className="mt-6 p-4 rounded-[10px] border-2 border-purple-600" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-base shrink-0">
                            ⚡
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-sm font-extrabold text-purple-900 m-0">
                                    24/7 Auto-Sync Active
                                </h4>
                                <span className="py-0.5 px-2 bg-purple-600 text-white rounded-full text-[0.5rem] font-bold tracking-wide">
                                    LIVE
                                </span>
                            </div>
                            <p className="text-xs text-purple-700 m-0 leading-relaxed">
                                Your EmailBison data syncs automatically every <strong>20 minutes</strong>.
                                Manual sync is available for immediate updates after changes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

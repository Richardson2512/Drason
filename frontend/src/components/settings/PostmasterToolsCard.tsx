'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface PostmasterStatus {
    connected: boolean;
    connectedAt: string | null;
    lastFetchAt: string | null;
    lastError: string | null;
}

export default function PostmasterToolsCard({ embedded = false }: { embedded?: boolean } = {}) {
    const [status, setStatus] = useState<PostmasterStatus | null>(null);
    const [busy, setBusy] = useState(false);

    const refresh = async () => {
        try {
            const r = await apiClient<{ success: boolean } & PostmasterStatus>('/api/postmaster/status');
            setStatus(r);
        } catch {
            // non-fatal — leave stale state
        }
    };

    useEffect(() => {
        refresh();
        // Re-poll on URL hint after OAuth round-trip
        const params = new URLSearchParams(window.location.search);
        if (params.get('postmaster') === 'connected') {
            toast.success('Postmaster Tools connected');
            // Clean the query so a refresh doesn't re-toast
            window.history.replaceState({}, '', window.location.pathname);
            refresh();
        } else if (params.get('postmaster') === 'error') {
            toast.error(`Postmaster connection failed: ${params.get('reason') || 'unknown'}`);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const connect = async () => {
        setBusy(true);
        try {
            const r = await apiClient<{ success: boolean; authorizeUrl: string }>('/api/postmaster/connect', { method: 'POST' });
            window.location.href = r.authorizeUrl;
        } catch (e: any) {
            toast.error(`Failed to start OAuth: ${e.message || 'unknown'}`);
        } finally {
            setBusy(false);
        }
    };

    const disconnect = async () => {
        if (!confirm('Disconnect Postmaster Tools? Daily reputation fetches will stop.')) return;
        setBusy(true);
        try {
            await apiClient('/api/postmaster/disconnect', { method: 'POST' });
            toast.success('Disconnected');
            refresh();
        } catch (e: any) {
            toast.error(`Failed to disconnect: ${e.message || 'unknown'}`);
        } finally {
            setBusy(false);
        }
    };

    const fetchNow = async () => {
        setBusy(true);
        try {
            const r = await apiClient<{ success: boolean; result: { domainsFound: number; rowsWritten: number; errors: number } }>(
                '/api/postmaster/fetch-now',
                { method: 'POST' },
            );
            toast.success(`Fetched ${r.result.rowsWritten} domain(s) from Postmaster`);
            refresh();
        } catch (e: any) {
            toast.error(`Fetch failed: ${e.message || 'unknown'}`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={embedded ? 'pt-8 mt-8 border-t border-gray-200' : 'premium-card'}>
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">Google Postmaster Tools</h2>
                    <p className="text-sm text-slate-500">Per-domain reputation, spam rate, DKIM/SPF/DMARC pass rate.</p>
                </div>
                {status?.connected ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">Connected</span>
                ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase">Not connected</span>
                )}
            </div>

            {!status?.connected ? (
                <div>
                    <p className="text-sm text-slate-600 mb-4">
                        Connect the Google account that owns your sending domains in Postmaster Tools. We pull reputation data daily for every verified domain — drives the Domain Reputation card and auto-pause thresholds.
                    </p>
                    <button onClick={connect} disabled={busy} className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50">
                        {busy ? 'Opening Google…' : 'Connect Postmaster Tools'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="text-xs text-slate-500 space-y-1">
                        <div>Connected: {status.connectedAt ? new Date(status.connectedAt).toLocaleString() : '—'}</div>
                        <div>Last fetch: {status.lastFetchAt ? new Date(status.lastFetchAt).toLocaleString() : '— (next 03:00 UTC)'}</div>
                        {status.lastError && <div className="text-rose-600">Last error: {status.lastError}</div>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchNow} disabled={busy} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 disabled:opacity-50">
                            {busy ? 'Fetching…' : 'Fetch now'}
                        </button>
                        <button onClick={disconnect} disabled={busy} className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-100 disabled:opacity-50 border border-rose-200">
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

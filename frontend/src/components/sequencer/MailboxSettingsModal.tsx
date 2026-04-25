'use client';

import { useEffect, useState } from 'react';
import { X, Globe, CheckCircle2, AlertTriangle, Loader2, RefreshCw, Copy } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Per-mailbox settings — currently scoped to the custom tracking domain
 * configuration. Designed as a slot-in panel: when more per-mailbox
 * settings are added later (signature, daily limit override per-mailbox,
 * IMAP polling cadence) they live here as additional sections.
 *
 * Tracking domain UX flow:
 *   1. User enters a hostname → backend validates format and saves
 *      it as `tracking_domain` with `tracking_domain_verified = false`.
 *   2. User configures DNS at their registrar (CNAME → our ingress) and
 *      clicks "Verify" → backend runs DNS + HTTPS health probe.
 *   3. On success the row is marked verified; sends from this mailbox
 *      will use the domain for tracking links.
 *   4. The user can re-verify at any time to repair drift; we show the
 *      last check timestamp and the last error so they can debug.
 */

interface MailboxSettings {
    id: string;
    email: string;
    tracking_domain?: string | null;
    tracking_domain_verified?: boolean;
    tracking_domain_verified_at?: string | null;
    tracking_domain_last_check_at?: string | null;
    tracking_domain_last_error?: string | null;
}

interface VerificationReport {
    ok: boolean;
    code: string;
    detail: string;
    cnameTarget?: string | null;
    aRecords?: string[];
    httpStatus?: number;
}

const TRACKING_INGRESS_HOST = 'tracking.superkabe.com';

export default function MailboxSettingsModal({ accountId, onClose }: { accountId: string; onClose: () => void }) {
    const [account, setAccount] = useState<MailboxSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [domainInput, setDomainInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [report, setReport] = useState<VerificationReport | null>(null);

    const refresh = async () => {
        try {
            const res = await apiClient<MailboxSettings>(`/api/sequencer/accounts?id=${accountId}`);
            // The accounts endpoint returns a list — find ours.
            const list = (Array.isArray(res) ? res : (res as unknown as { data?: MailboxSettings[] })?.data) as MailboxSettings[] | MailboxSettings | undefined;
            const arr: MailboxSettings[] = Array.isArray(list) ? list : list ? [list as MailboxSettings] : [];
            const found = arr.find(a => a.id === accountId) || null;
            setAccount(found);
            setDomainInput(found?.tracking_domain || '');
        } catch {
            setAccount(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accountId]);

    const saveDomain = async () => {
        const domain = domainInput.trim() || null;
        setSaving(true);
        try {
            await apiClient(`/api/sequencer/accounts/${accountId}/tracking-domain`, {
                method: 'POST',
                body: JSON.stringify({ domain }),
            });
            toast.success(domain ? 'Tracking domain saved — verify DNS to activate' : 'Tracking domain cleared');
            setReport(null);
            await refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Failed to save tracking domain');
        } finally {
            setSaving(false);
        }
    };

    const verify = async () => {
        setVerifying(true);
        try {
            const res = await apiClient<VerificationReport>(`/api/sequencer/accounts/${accountId}/tracking-domain/verify`, { method: 'POST' });
            setReport(res);
            if (res.ok) {
                toast.success('Tracking domain verified');
            } else {
                toast.error(`Verification failed: ${res.detail}`);
            }
            await refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const copyTarget = () => {
        navigator.clipboard.writeText(TRACKING_INGRESS_HOST);
        toast.success('Copied');
    };

    const isVerified = !!account?.tracking_domain_verified;
    const hasDomain = !!account?.tracking_domain;
    const lastChecked = account?.tracking_domain_last_check_at ? new Date(account.tracking_domain_last_check_at) : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden" style={{ border: '1px solid #D1CBC5' }}>
                <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #D1CBC5' }}>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-gray-900">Mailbox settings</h2>
                        {account?.email && <span className="text-xs text-gray-500">{account.email}</span>}
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 cursor-pointer text-gray-500" title="Close">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
                    {loading ? (
                        <div className="text-xs text-gray-400">Loading…</div>
                    ) : !account ? (
                        <div className="text-xs text-red-600">Mailbox not found</div>
                    ) : (
                        <>
                            {/* Tracking domain */}
                            <section className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} strokeWidth={1.75} className="text-gray-700" />
                                    <h3 className="text-sm font-semibold text-gray-900 m-0">Custom tracking domain</h3>
                                    {hasDomain && (
                                        isVerified
                                            ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"><CheckCircle2 size={11} /> Verified</span>
                                            : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"><AlertTriangle size={11} /> Unverified</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    By default, click and open tracking links route through <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">superkabe.com</code>. Set a custom hostname (e.g. <code className="text-[11px] bg-gray-100 px-1 py-0.5 rounded">links.yourdomain.com</code>) so tracking URLs look like they originate from your own infrastructure — better deliverability, white-label appearance.
                                </p>

                                {/* Hostname input */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Tracking hostname
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="links.yourdomain.com"
                                            value={domainInput}
                                            onChange={(e) => setDomainInput(e.target.value)}
                                            className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        />
                                        <button
                                            onClick={saveDomain}
                                            disabled={saving || domainInput.trim() === (account.tracking_domain || '')}
                                            className="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                                        >
                                            {saving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                {/* DNS instructions */}
                                {hasDomain && !isVerified && (
                                    <div className="rounded-lg p-3 bg-amber-50 border border-amber-200 flex flex-col gap-2">
                                        <div className="text-xs font-semibold text-amber-900">Action required: configure DNS</div>
                                        <div className="text-[11px] text-amber-900 leading-relaxed">
                                            At your DNS registrar, create a <strong>CNAME</strong> record on{' '}
                                            <code className="text-[11px] bg-white border border-amber-200 px-1 py-0.5 rounded">{account.tracking_domain}</code>{' '}
                                            pointing to:
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-[11px] bg-white border border-amber-200 px-2 py-1 rounded">{TRACKING_INGRESS_HOST}</code>
                                            <button onClick={copyTarget} className="p-1.5 rounded-md hover:bg-amber-100 cursor-pointer" title="Copy">
                                                <Copy size={11} className="text-amber-900" />
                                            </button>
                                        </div>
                                        <div className="text-[11px] text-amber-900">
                                            DNS propagation typically takes 5–30 minutes. Click Verify after.
                                        </div>
                                    </div>
                                )}

                                {/* Verify button + report */}
                                {hasDomain && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={verify}
                                            disabled={verifying}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50 disabled:opacity-30"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            {verifying ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                                            {verifying ? 'Checking DNS…' : 'Verify'}
                                        </button>
                                        {lastChecked && (
                                            <span className="text-[11px] text-gray-400">
                                                Last checked {lastChecked.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {report && !report.ok && (
                                    <div className="rounded-lg p-3 bg-red-50 border border-red-200 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={12} className="text-red-600" />
                                            <span className="text-xs font-semibold text-red-900">{verificationCodeLabel(report.code)}</span>
                                        </div>
                                        <div className="text-[11px] text-red-900">{report.detail}</div>
                                        {report.cnameTarget && (
                                            <div className="text-[11px] text-red-700">
                                                Detected CNAME: <code className="bg-white border border-red-200 px-1 py-0.5 rounded">{report.cnameTarget}</code>
                                            </div>
                                        )}
                                        {report.aRecords && report.aRecords.length > 0 && (
                                            <div className="text-[11px] text-red-700">
                                                Detected A records: <code className="bg-white border border-red-200 px-1 py-0.5 rounded">{report.aRecords.join(', ')}</code>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {report && report.ok && (
                                    <div className="rounded-lg p-3 bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <span className="text-xs text-emerald-900">{report.detail}</span>
                                    </div>
                                )}

                                {!report && account.tracking_domain_last_error && !isVerified && (
                                    <div className="text-[11px] text-gray-500">
                                        Last error: {account.tracking_domain_last_error}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>

                <div className="px-5 py-3 flex items-center justify-end shrink-0 bg-gray-50" style={{ borderTop: '1px solid #D1CBC5' }}>
                    <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-white cursor-pointer" style={{ border: '1px solid #D1CBC5' }}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function verificationCodeLabel(code: string): string {
    switch (code) {
        case 'no_domain_set':              return 'No domain set';
        case 'dns_resolution_failed':      return 'DNS does not resolve';
        case 'dns_target_not_recognized':  return 'DNS does not point at Superkabe';
        case 'http_unreachable':           return 'HTTPS endpoint unreachable';
        case 'http_status_not_200':        return 'Endpoint returned wrong status';
        case 'http_header_missing':        return 'TLS/proxy not configured correctly';
        default:                            return 'Verification failed';
    }
}

'use client';

import { useEffect, useState } from 'react';
import { X, Globe, CheckCircle2, AlertTriangle, Loader2, RefreshCw, Copy, Gauge, Search } from 'lucide-react';
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
    daily_send_limit: number;
    sends_today: number;
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
    const [limitInput, setLimitInput] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [savingLimit, setSavingLimit] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [report, setReport] = useState<VerificationReport | null>(null);
    // Pre-flight DNS check state (runs against the input value WITHOUT saving).
    // Lets the user validate DNS configuration before committing the domain.
    const [precheckReport, setPrecheckReport] = useState<VerificationReport | null>(null);
    const [prechecking, setPrechecking] = useState(false);

    const refresh = async () => {
        try {
            const res = await apiClient<MailboxSettings>(`/api/sequencer/accounts?id=${accountId}`);
            // The accounts endpoint returns a list — find ours.
            const list = (Array.isArray(res) ? res : (res as unknown as { data?: MailboxSettings[] })?.data) as MailboxSettings[] | MailboxSettings | undefined;
            const arr: MailboxSettings[] = Array.isArray(list) ? list : list ? [list as MailboxSettings] : [];
            const found = arr.find(a => a.id === accountId) || null;
            setAccount(found);
            setDomainInput(found?.tracking_domain || '');
            setLimitInput(found ? String(found.daily_send_limit) : '');
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

    const saveLimit = async () => {
        const parsed = parseInt(limitInput, 10);
        if (!Number.isFinite(parsed) || parsed < 1) {
            toast.error('Enter a number ≥ 1');
            return;
        }
        if (parsed > 2000) {
            toast.error('Max 2000/day per mailbox. Higher limits risk reputation damage.');
            return;
        }
        setSavingLimit(true);
        try {
            await apiClient(`/api/sequencer/accounts/${accountId}`, {
                method: 'PATCH',
                body: JSON.stringify({ dailySendLimit: parsed }),
            });
            toast.success('Daily limit updated');
            await refresh();
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Failed to update limit');
        } finally {
            setSavingLimit(false);
        }
    };

    // Pre-flight: validate DNS for whatever the user has typed, without
    // touching the persisted account row. Useful BEFORE save so the user
    // doesn't commit a misconfigured domain.
    const precheckDomain = async () => {
        const domain = domainInput.trim();
        if (!domain) return;
        setPrechecking(true);
        setPrecheckReport(null);
        try {
            const res = await apiClient<VerificationReport>(
                `/api/sequencer/accounts/tracking-domain/check?domain=${encodeURIComponent(domain)}`
            );
            setPrecheckReport(res);
        } catch (err: unknown) {
            const e = err as { message?: string };
            toast.error(e?.message || 'Pre-flight DNS check failed');
        } finally {
            setPrechecking(false);
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
                            {/* Daily sending limit */}
                            <section className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Gauge size={14} strokeWidth={1.75} className="text-gray-700" />
                                    <h3 className="text-sm font-semibold text-gray-900 m-0">Daily sending limit</h3>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    The maximum number of emails this mailbox can send per day across <strong>all</strong> campaigns combined. Each campaign also has its own per-day cap; the dispatcher uses the smallest applicable limit. If this mailbox is in a recovery phase, the warmup limit may temporarily override this value until it graduates back to healthy.
                                </p>

                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                            Emails per day
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={2000}
                                            value={limitInput}
                                            onChange={(e) => setLimitInput(e.target.value)}
                                            className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        />
                                    </div>
                                    <button
                                        onClick={saveLimit}
                                        disabled={savingLimit || !limitInput || parseInt(limitInput, 10) === account.daily_send_limit}
                                        className="px-4 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800 disabled:opacity-30"
                                    >
                                        {savingLimit ? 'Saving…' : 'Save'}
                                    </button>
                                </div>

                                <div className="text-[11px] text-gray-500">
                                    Today: <span className="font-mono text-gray-700">{account.sends_today}</span> / <span className="font-mono text-gray-700">{account.daily_send_limit}</span> sent
                                </div>
                            </section>

                            <div style={{ borderTop: '1px solid #E8E3DC' }} />

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
                                            onChange={(e) => {
                                                setDomainInput(e.target.value);
                                                // Stale precheck result no longer applies to a different domain
                                                if (precheckReport) setPrecheckReport(null);
                                            }}
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

                                    {/* Pre-flight DNS check — validate the typed hostname before saving.
                                        Helps the user catch misconfigured CNAMEs without committing. */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={precheckDomain}
                                            disabled={prechecking || !domainInput.trim() || domainInput.trim() === (account.tracking_domain || '')}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{ border: '1px solid #D1CBC5' }}
                                            title="Run a DNS check on the typed hostname without saving"
                                        >
                                            {prechecking ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} strokeWidth={2} />}
                                            {prechecking ? 'Checking DNS…' : 'Check DNS first'}
                                        </button>
                                        <span className="text-[10px] text-gray-400">
                                            Optional — validate before save
                                        </span>
                                    </div>

                                    {/* Pre-flight result — success */}
                                    {precheckReport && precheckReport.ok && (
                                        <div className="mt-2 rounded-lg p-2.5 bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                                            <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                                            <div className="text-[11px] text-emerald-900 leading-relaxed">
                                                <span className="font-semibold">DNS configured correctly.</span> Safe to save — verification will pass instantly.
                                            </div>
                                        </div>
                                    )}

                                    {/* Pre-flight result — failure */}
                                    {precheckReport && !precheckReport.ok && (
                                        <div className="mt-2 rounded-lg p-2.5 bg-red-50 border border-red-200 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={12} className="text-red-600 shrink-0" />
                                                <span className="text-[11px] font-semibold text-red-900">{verificationCodeLabel(precheckReport.code)}</span>
                                            </div>
                                            <div className="text-[11px] text-red-900 leading-relaxed">{precheckReport.detail}</div>
                                            {precheckReport.cnameTarget && (
                                                <div className="text-[11px] text-red-700">
                                                    Detected CNAME: <code className="bg-white border border-red-200 px-1 py-0.5 rounded">{precheckReport.cnameTarget}</code>
                                                </div>
                                            )}
                                            {precheckReport.aRecords && precheckReport.aRecords.length > 0 && (
                                                <div className="text-[11px] text-red-700">
                                                    Detected A records: <code className="bg-white border border-red-200 px-1 py-0.5 rounded">{precheckReport.aRecords.join(', ')}</code>
                                                </div>
                                            )}
                                            <div className="text-[11px] text-red-700 mt-0.5">
                                                Fix DNS at your registrar, then re-run the check.
                                            </div>
                                        </div>
                                    )}
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

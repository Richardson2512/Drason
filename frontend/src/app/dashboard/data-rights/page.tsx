'use client';

/**
 * Data Rights — customer-facing UI for GDPR / CCPA / DPDP / PDPA rights:
 *
 *   • Right of Access — download a JSON export of everything we hold.
 *   • Consent Audit Trail — see every consent record we've kept on you.
 *   • Right to Withdraw — revoke revocable consents (cookies, marketing, OAuth, import-key).
 *   • Right to Erasure — initiate a 30-day soft-delete with a cancellation token.
 */

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface ConsentRow {
    id: string;
    consent_type: string;
    document_version: string;
    accepted_at: string;
    channel: string;
    ip_address: string | null;
    user_agent: string | null;
    withdrawn_at: string | null;
    withdrawn_reason: string | null;
    metadata: Record<string, unknown> | null;
}

interface DeletionStatus {
    pending: boolean;
    requested_at?: string;
    executes_after?: string;
}

const REVOCABLE_TYPES = new Set([
    'marketing',
    'cookies_analytics',
    'cookies_functional',
    'oauth_gmail',
    'oauth_microsoft',
    'oauth_postmaster',
    'import_key',
]);

const TYPE_LABELS: Record<string, string> = {
    tos: 'Terms of Service',
    privacy: 'Privacy Policy',
    marketing: 'Marketing emails',
    cookies_analytics: 'Analytics cookies',
    cookies_functional: 'Functional cookies',
    oauth_gmail: 'Gmail OAuth',
    oauth_microsoft: 'Microsoft 365 OAuth',
    oauth_postmaster: 'Google Postmaster Tools OAuth',
    import_key: 'Smartlead import-key authorization',
    dpa: 'Data Processing Agreement',
};

export default function DataRightsPage() {
    const [consents, setConsents] = useState<ConsentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const refreshConsents = useCallback(async () => {
        setLoading(true);
        try {
            const r = await apiClient<{ consents: ConsentRow[] }>('/api/consent/mine');
            setConsents(r.consents || []);
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load consent records');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshDeletionStatus = useCallback(async () => {
        try {
            const r = await apiClient<DeletionStatus>('/api/account/delete-request');
            setDeletionStatus(r);
        } catch { /* non-fatal */ }
    }, []);

    useEffect(() => {
        refreshConsents();
        refreshDeletionStatus();
    }, [refreshConsents, refreshDeletionStatus]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const data = await apiClient('/api/account/my-data');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `superkabe-data-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data export downloaded');
        } catch (e: any) {
            toast.error(e?.message || 'Failed to download export');
        } finally {
            setDownloading(false);
        }
    };

    const handleWithdraw = async (consentId: string, consentType: string) => {
        if (!confirm('Withdraw this consent? The record stays in your audit trail with a withdrawal timestamp.')) return;
        try {
            await apiClient('/api/consent/withdraw', {
                method: 'POST',
                body: JSON.stringify({ consentId }),
            });

            // For cookie-category withdrawals, also flip the local Consent Mode v2
            // signal and rewrite localStorage so the next pageview honors the
            // withdrawal without waiting for a refresh.
            if (consentType === 'cookies_analytics' || consentType === 'cookies_functional') {
                try {
                    const raw = localStorage.getItem('sk-cookie-consent-v1');
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (consentType === 'cookies_analytics') parsed.analytics = false;
                        if (consentType === 'cookies_functional') parsed.functional = false;
                        localStorage.setItem('sk-cookie-consent-v1', JSON.stringify(parsed));
                    }
                } catch { /* localStorage unavailable — gtag update below still applies */ }

                if (typeof (window as any).gtag === 'function') {
                    const update: Record<string, string> = {};
                    if (consentType === 'cookies_analytics') {
                        update.analytics_storage = 'denied';
                    }
                    if (consentType === 'cookies_functional') {
                        update.functionality_storage = 'denied';
                        update.personalization_storage = 'denied';
                    }
                    (window as any).gtag('consent', 'update', update);
                }
            }

            toast.success('Consent withdrawn');
            await refreshConsents();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to withdraw');
        }
    };

    const handleRequestDelete = async () => {
        if (confirmText !== 'DELETE MY ACCOUNT') {
            toast.error('Confirmation phrase did not match');
            return;
        }
        try {
            const r = await apiClient<{ executes_after: string; cancellation_token: string }>(
                '/api/account/delete-request',
                { method: 'POST', body: JSON.stringify({ reason: 'user_request' }) },
            );
            toast.success(`Deletion scheduled for ${new Date(r.executes_after).toLocaleDateString()}`);
            setShowDeleteModal(false);
            setConfirmText('');
            await refreshDeletionStatus();
        } catch (e: any) {
            toast.error(e?.message || 'Failed to request deletion');
        }
    };

    return (
        <div className="px-6 py-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Your Data Rights</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Exercise your rights under GDPR, CCPA, DPDP, PDPA, and equivalent data-protection
                    laws. Questions? <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a>
                </p>
            </header>

            {/* Right of Access */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Right of Access</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Download a JSON archive of every personal-data artifact we hold for your account, including consent records,
                    organization details, and rolling 30-day usage counters.
                </p>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50"
                >
                    {downloading ? 'Preparing export…' : 'Download my data (JSON)'}
                </button>
            </section>

            {/* Consent audit trail */}
            <section className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Consent Audit Trail</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Every consent grant or withdrawal is recorded with a timestamp, IP address, and the document version you
                    saw. This is the audit-grade record we maintain to comply with GDPR Art. 7(1), DPDP § 6, and the PDPA
                    Consent Obligation.
                </p>
                {loading ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : consents.length === 0 ? (
                    <p className="text-sm text-gray-500">No consent records yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                        {consents.map(c => (
                            <li key={c.id} className="p-4 flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {TYPE_LABELS[c.consent_type] || c.consent_type}
                                        {c.withdrawn_at && (
                                            <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                                Withdrawn
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 space-x-2">
                                        <span>Version: <span className="font-mono">{c.document_version}</span></span>
                                        <span>·</span>
                                        <span>Channel: {c.channel}</span>
                                        <span>·</span>
                                        <span>Accepted: {new Date(c.accepted_at).toLocaleString()}</span>
                                    </div>
                                    {c.ip_address && (
                                        <div className="text-xs text-gray-400 mt-1 font-mono">IP: {c.ip_address}</div>
                                    )}
                                    {c.withdrawn_at && (
                                        <div className="text-xs text-rose-600 mt-1">
                                            Withdrawn: {new Date(c.withdrawn_at).toLocaleString()}
                                            {c.withdrawn_reason && ` — ${c.withdrawn_reason}`}
                                        </div>
                                    )}
                                </div>
                                {!c.withdrawn_at && REVOCABLE_TYPES.has(c.consent_type) && (
                                    <button
                                        onClick={() => handleWithdraw(c.id, c.consent_type)}
                                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 shrink-0"
                                    >
                                        Withdraw
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Right of Erasure */}
            <section className="bg-white rounded-2xl p-6 border border-rose-200 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Right of Erasure (Account Deletion)</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Permanently delete your Superkabe account and all associated data after a 30-day grace period.
                    During the grace period you can cancel the request. After the grace period, deletion is irreversible.
                </p>
                {deletionStatus?.pending ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
                        <div className="font-semibold mb-1">Deletion pending</div>
                        <div>Requested at: {new Date(deletionStatus.requested_at!).toLocaleString()}</div>
                        <div>Executes after: {new Date(deletionStatus.executes_after!).toLocaleString()}</div>
                        <div className="mt-2 text-xs">
                            To cancel, contact <a href="mailto:privacy@superkabe.com" className="underline">privacy@superkabe.com</a> with your cancellation token (returned at request time).
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700"
                    >
                        Request account deletion
                    </button>
                )}
            </section>

            {/* Confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm account deletion</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This schedules deletion of your account and all associated data. You have a 30-day grace period
                            during which you can cancel the request. After the grace period, all data is permanently removed
                            from production systems and propagates through backups within 30 additional days.
                        </p>
                        <p className="text-sm text-gray-600 mb-2">Type <code className="px-1 py-0.5 bg-gray-100 rounded text-rose-700 font-mono">DELETE MY ACCOUNT</code> to confirm:</p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm font-mono mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setConfirmText(''); }}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestDelete}
                                disabled={confirmText !== 'DELETE MY ACCOUNT'}
                                className="px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm deletion request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

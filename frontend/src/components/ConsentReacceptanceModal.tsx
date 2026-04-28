'use client';

/**
 * Consent Re-Acceptance Modal
 *
 * Listens for the global `consent-required` event dispatched by the apiClient
 * 412 interceptor. When the backend reports the user's ToS or Privacy consent
 * is stale relative to the current document version, this modal renders as a
 * blocking overlay until the user accepts.
 *
 * Required for GDPR Art. 7(3) — version bumps reset consent; we never imply
 * acceptance of a new version from acceptance of an old one.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface ConsentRequiredDetail {
    missing: ('tos' | 'privacy')[];
    currentVersions: { tos?: string; privacy?: string };
    message?: string;
}

export default function ConsentReacceptanceModal() {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<ConsentRequiredDetail | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const ce = e as CustomEvent<ConsentRequiredDetail>;
            setDetail(ce.detail);
            setOpen(true);
            setAccepted(false);
            setError(null);
        };
        window.addEventListener('consent-required', handler);
        return () => window.removeEventListener('consent-required', handler);
    }, []);

    const handleAccept = useCallback(async () => {
        if (!detail) return;
        if (!accepted) {
            setError('Please confirm acceptance to continue.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const body: Record<string, string> = {};
            if (detail.missing.includes('tos') && detail.currentVersions.tos) {
                body.acceptedTosVersion = detail.currentVersions.tos;
            }
            if (detail.missing.includes('privacy') && detail.currentVersions.privacy) {
                body.acceptedPrivacyVersion = detail.currentVersions.privacy;
            }
            await apiClient('/api/auth/accept-current-terms', {
                method: 'POST',
                body: JSON.stringify(body),
            });
            setOpen(false);
            // Refresh the page so the in-flight 412 doesn't leave any UI in
            // a broken state — simplest, most robust resolution.
            window.location.reload();
        } catch (e: any) {
            setError(e?.message || 'Failed to record acceptance. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [accepted, detail]);

    if (!open || !detail) return null;

    const tosBumped = detail.missing.includes('tos');
    const privacyBumped = detail.missing.includes('privacy');

    let docCopy = '';
    if (tosBumped && privacyBumped) docCopy = 'Terms of Service and Privacy Policy';
    else if (tosBumped) docCopy = 'Terms of Service';
    else if (privacyBumped) docCopy = 'Privacy Policy';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">We&apos;ve updated our {docCopy}</h2>
                <p className="text-sm text-gray-600 mb-6">
                    To keep using Superkabe, please review and accept the latest version. This is required so we can
                    demonstrate your consent under GDPR, DPDP, PDPA, and other applicable data-protection laws.
                </p>

                <div className="space-y-3 mb-6">
                    {tosBumped && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Terms of Service</div>
                                <div className="text-xs text-gray-500">Updated version: {detail.currentVersions.tos}</div>
                            </div>
                            <Link
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                Read →
                            </Link>
                        </div>
                    )}
                    {privacyBumped && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Privacy Policy</div>
                                <div className="text-xs text-gray-500">Updated version: {detail.currentVersions.privacy}</div>
                            </div>
                            <Link
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                Read →
                            </Link>
                        </div>
                    )}
                </div>

                <label className="flex items-start gap-2 cursor-pointer mb-4">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                        I have reviewed and accept the updated {docCopy}.
                    </span>
                </label>

                {error && (
                    <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleAccept}
                        disabled={!accepted || submitting}
                        className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Recording acceptance…' : 'Accept and continue'}
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-4 text-center">
                    Need help? <a href="mailto:legal@superkabe.com" className="underline hover:text-gray-600">legal@superkabe.com</a>
                </p>
            </div>
        </div>
    );
}

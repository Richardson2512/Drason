'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/api';

interface ConsentDetails {
    client: {
        name: string;
        client_uri?: string | null;
        logo_uri?: string | null;
    };
    scopes: string[];
    supported_scopes: string[];
}

const SCOPE_DESCRIPTIONS: Record<string, string> = {
    'account:read': 'Read your plan, usage, and tier limits',
    'leads:read': 'List and view leads',
    'leads:write': 'Import and update leads',
    'campaigns:read': 'List and view campaigns and reports',
    'campaigns:write': 'Create, update, launch, and pause campaigns',
    'mailboxes:read': 'View mailbox health and warmup status',
    'domains:read': 'View domain health and reputation',
    'replies:read': 'Read inbound replies',
    'replies:send': 'Send replies on your behalf',
    'validation:read': 'View email validation results',
    'validation:trigger': 'Trigger email validation',
    'reports:read': 'View campaign performance reports',
};

export default function ConsentPage() {
    const router = useRouter();
    const params = useSearchParams();
    const session = params.get('session');

    const [details, setDetails] = useState<ConsentDetails | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<'approve' | 'deny' | null>(null);

    useEffect(() => {
        if (!session) {
            setError('Missing consent session. Restart the connection from your MCP client.');
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const resp = await apiClient<{ data: ConsentDetails }>(
                    `/api/oauth/consent/details?session=${encodeURIComponent(session)}`,
                );
                setDetails(resp.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load consent details');
            } finally {
                setLoading(false);
            }
        })();
    }, [session]);

    const handleApprove = async () => {
        if (!session) return;
        setSubmitting('approve');
        setError('');
        try {
            const resp = await apiClient<{ data: { redirect_to: string } }>(
                '/api/oauth/consent/approve',
                { method: 'POST', body: JSON.stringify({ session }) },
            );
            window.location.href = resp.data.redirect_to;
        } catch (err: any) {
            const msg = err.message || 'Failed to approve';
            if (/login|auth|unauthor/i.test(msg)) {
                const here = `/oauth/consent?session=${encodeURIComponent(session)}`;
                router.push(`/login?redirect=${encodeURIComponent(here)}`);
                return;
            }
            setError(msg);
            setSubmitting(null);
        }
    };

    const handleDeny = async () => {
        if (!session) return;
        setSubmitting('deny');
        try {
            const resp = await apiClient<{ data: { redirect_to: string } }>(
                '/api/oauth/consent/deny',
                { method: 'POST', body: JSON.stringify({ session }) },
            );
            window.location.href = resp.data.redirect_to;
        } catch (err: any) {
            setError(err.message || 'Failed to deny');
            setSubmitting(null);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F2EB] font-sans px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
                <div className="flex flex-col items-center mb-6">
                    <Image src="/image/logo-v2.png" alt="Superkabe" width={36} height={36} />
                    <span className="mt-2 font-bold text-lg text-[#171923]">Superkabe</span>
                </div>

                {loading && (
                    <p className="text-center text-sm text-gray-500 py-8">Loading…</p>
                )}

                {!loading && error && (
                    <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm mb-4">
                        {error}
                    </div>
                )}

                {!loading && details && (
                    <>
                        <h1 className="text-xl font-bold text-[#171923] text-center mb-1">
                            Authorize {details.client.name}
                        </h1>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            wants to access your Superkabe account
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">This will let it</p>
                            <ul className="space-y-2">
                                {details.scopes.map(scope => (
                                    <li key={scope} className="flex items-start gap-2 text-sm text-gray-800">
                                        <span className="text-emerald-600 mt-0.5">✓</span>
                                        <span>{SCOPE_DESCRIPTIONS[scope] || scope}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={!!submitting}
                                className="w-full bg-[#1C4532] text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                            >
                                {submitting === 'approve' ? 'Approving…' : `Authorize ${details.client.name}`}
                            </button>
                            <button
                                onClick={handleDeny}
                                disabled={!!submitting}
                                className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60"
                            >
                                {submitting === 'deny' ? 'Cancelling…' : 'Cancel'}
                            </button>
                        </div>

                        <p className="text-[11px] text-gray-400 text-center mt-6 leading-relaxed">
                            You&apos;ll be redirected back to {details.client.name} once you authorize. You can revoke access at any time from your Superkabe dashboard.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

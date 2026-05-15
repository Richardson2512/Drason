'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient, startTokenRefresh } from '@/lib/api';

/**
 * Email-verification landing. The link in the signup email points here with
 * ?token=... There is no user input - the link IS the action: we POST the
 * token, which (server-side) verifies the address, sets the httpOnly session
 * cookie, and returns the user. We then start token refresh and route to the
 * dashboard. Mirrors the reset-password page's structure/styling.
 */
function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token') || '';

    const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMsg, setErrorMsg] = useState('');
    const started = useRef(false);

    useEffect(() => {
        // Guard against React's double-effect (dev / strict mode) so we POST
        // the single-use token exactly once.
        if (started.current) return;
        started.current = true;

        if (!token) {
            setState('error');
            setErrorMsg('This verification link is missing its token. Sign up again to get a new one.');
            return;
        }

        (async () => {
            try {
                // Server burns the token, marks the email verified, and sets
                // the session cookie via Set-Cookie. Idempotent: a second
                // click just re-establishes the session.
                await apiClient('/api/auth/verify-email', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                });
                startTokenRefresh();
                setState('success');
            } catch (err: any) {
                setState('error');
                setErrorMsg(err?.message || 'This verification link is invalid or has expired.');
            }
        })();
    }, [token]);

    // Route to the dashboard shortly after a successful verify - the session
    // cookie is already set by the server.
    useEffect(() => {
        if (state !== 'success') return;
        const t = setTimeout(() => router.push('/dashboard'), 1800);
        return () => clearTimeout(t);
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F7F2EB]">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#D1CBC5] p-8 shadow-sm text-center">
                {state === 'verifying' && (
                    <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 size={22} className="text-gray-400 animate-spin mb-3" />
                        <p className="text-sm text-gray-600">Verifying your email and signing you in…</p>
                    </div>
                )}

                {state === 'success' && (
                    <>
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 size={22} className="text-emerald-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Email verified</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            Your account is active. Taking you to your dashboard…
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-block px-5 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg no-underline hover:bg-green-900"
                        >
                            Go to dashboard
                        </Link>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                            <AlertCircle size={22} className="text-rose-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h1>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">{errorMsg}</p>
                        <Link
                            href="/signup"
                            className="inline-block px-5 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg no-underline hover:bg-green-900"
                        >
                            Sign up again
                        </Link>
                        <div className="mt-4">
                            <Link href="/login" className="text-xs text-gray-600 hover:text-gray-900 underline">
                                Back to sign in
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F7F2EB]">
                <Loader2 size={20} className="text-gray-400 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

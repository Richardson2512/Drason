'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, startTokenRefresh } from '@/lib/api';
import { marketingUrl } from '@/lib/urls';

type Stage = 'verifying' | 'success' | 'expired' | 'invalid' | 'missing';

function VerifyEmailContent() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');
    const emailParam = params.get('email');

    const [stage, setStage] = useState<Stage>(token ? 'verifying' : 'missing');
    const [resendEmail, setResendEmail] = useState(emailParam || '');
    const [resendMsg, setResendMsg] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) {
            setStage('missing');
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                await apiClient<{ success: boolean; token?: string }>('/api/auth/verify-email', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                });
                if (cancelled) return;
                // Server set the auth cookie - start refresh and head to the app.
                startTokenRefresh();
                setStage('success');
                setTimeout(() => router.push('/dashboard'), 1200);
            } catch (err: any) {
                if (cancelled) return;
                const msg = (err?.message || '').toLowerCase();
                if (msg.includes('expired')) setStage('expired');
                else setStage('invalid');
            }
        })();
        return () => { cancelled = true; };
    }, [token, router]);

    const handleResend = async () => {
        if (!resendEmail.trim()) {
            setResendMsg('Enter the email you signed up with.');
            return;
        }
        setResending(true);
        setResendMsg('');
        try {
            await apiClient('/api/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email: resendEmail.trim() }),
            });
            setResendMsg('If an unverified account exists for that email, a new link is on its way.');
        } catch {
            setResendMsg('Could not resend right now. Please try again shortly.');
        } finally {
            setResending(false);
        }
    };

    const showResend = stage === 'expired' || stage === 'invalid' || stage === 'missing';

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F7F2EB] relative overflow-hidden font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="auth-blob auth-blob-purple"></div>
                <div className="auth-blob auth-blob-orange"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 md:p-8 text-center">
                <a href={marketingUrl('/')} className="flex items-center gap-2 mb-6 w-fit mx-auto no-underline">
                    <Image src="/image/logo-v2.png" alt="Superkabe - back to home" width={26} height={26} />
                    <span className="font-bold text-base text-[#171923]">Superkabe</span>
                </a>

                {stage === 'verifying' && (
                    <>
                        <div className="mx-auto mb-5 w-10 h-10 border-2 border-[#1C4532] border-t-transparent rounded-full animate-spin" />
                        <h1 className="text-xl font-bold text-[#171923] mb-2">Verifying your email...</h1>
                        <p className="text-[#718096] text-sm">One moment while we confirm your address.</p>
                    </>
                )}

                {stage === 'success' && (
                    <>
                        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                        <h1 className="text-xl font-bold text-[#171923] mb-2">Email verified</h1>
                        <p className="text-[#718096] text-sm">Your account is active. Taking you to your dashboard...</p>
                    </>
                )}

                {showResend && (
                    <>
                        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        </div>
                        <h1 className="text-xl font-bold text-[#171923] mb-2">
                            {stage === 'expired' ? 'Link expired' : stage === 'missing' ? 'No verification token' : 'Link invalid'}
                        </h1>
                        <p className="text-[#718096] text-sm mb-6">
                            {stage === 'expired'
                                ? 'That verification link has expired. Enter your email to get a fresh one.'
                                : stage === 'missing'
                                    ? 'This page needs a verification link. Enter your email to get a new one sent.'
                                    : 'That link is invalid or has already been used. If you have not verified yet, request a new link.'}
                        </p>
                        <input
                            type="email"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm text-sm mb-3"
                        />
                        {resendMsg && <div className="text-xs text-[#1C4532] mb-3">{resendMsg}</div>}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="w-full bg-[#1C4532] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#1C4532]/20 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-60"
                        >
                            {resending ? 'Sending...' : 'Send a new verification link'}
                        </button>
                        <div className="mt-5 text-xs text-[#718096]">
                            <Link href="/login" className="text-[#1C4532] font-semibold underline hover:text-green-800">Back to sign in</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailContent />
        </Suspense>
    );
}

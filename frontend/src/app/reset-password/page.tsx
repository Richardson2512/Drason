'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token') || '';

    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenReason, setTokenReason] = useState<'invalid' | 'expired' | null>(null);
    const [emailMasked, setEmailMasked] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setVerifying(false);
            setTokenValid(false);
            setTokenReason('invalid');
            return;
        }
        let alive = true;
        (async () => {
            try {
                const res = await apiClient<{ valid: boolean; reason?: 'invalid' | 'expired'; email_masked?: string }>(
                    `/api/auth/reset-password/verify?token=${encodeURIComponent(token)}`,
                );
                if (!alive) return;
                setTokenValid(Boolean(res?.valid));
                setTokenReason(res?.valid ? null : (res?.reason ?? 'invalid'));
                setEmailMasked(res?.email_masked ?? null);
            } catch {
                if (!alive) return;
                setTokenValid(false);
                setTokenReason('invalid');
            } finally {
                if (alive) setVerifying(false);
            }
        })();
        return () => { alive = false; };
    }, [token]);

    // Redirect to /login a few seconds after a successful reset so the user
    // doesn't have to think about the next step.
    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => router.push('/login?reset=1'), 2500);
        return () => clearTimeout(t);
    }, [success, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await apiClient('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword: password }),
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || 'Failed to reset password. Try requesting a new link.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F7F2EB]">
            <div className="w-full max-w-md bg-white rounded-2xl border border-[#D1CBC5] p-8 shadow-sm">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={12} /> Back to sign in
                </Link>

                {verifying ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 size={20} className="text-gray-400 animate-spin mb-3" />
                        <p className="text-xs text-gray-500">Verifying reset link…</p>
                    </div>
                ) : !tokenValid ? (
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                            <AlertCircle size={22} className="text-rose-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            {tokenReason === 'expired' ? 'This link has expired' : 'Invalid reset link'}
                        </h1>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            {tokenReason === 'expired'
                                ? 'Reset links expire after 1 hour for security. Request a new one to continue.'
                                : 'This link is no longer valid. It may have already been used or never existed.'}
                        </p>
                        <Link
                            href="/forgot-password"
                            className="inline-block px-5 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg no-underline hover:bg-green-900"
                        >
                            Request a new link
                        </Link>
                    </div>
                ) : success ? (
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 size={22} className="text-emerald-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Password reset</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            You can now sign in with your new password. Redirecting…
                        </p>
                        <Link
                            href="/login"
                            className="inline-block px-5 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg no-underline hover:bg-green-900"
                        >
                            Go to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">Choose a new password</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            {emailMasked ? <>Resetting password for <strong>{emailMasked}</strong>.</> : 'Set a new password for your account.'}
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">New password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoFocus
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 8 characters"
                                        className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-[#D1CBC5] outline-none focus:border-[#1C4532] bg-white"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D1CBC5] outline-none focus:border-[#1C4532] bg-white"
                                />
                            </div>
                            {error && <p className="text-xs text-red-600 m-0">{error}</p>}
                            <button
                                type="submit"
                                disabled={submitting || !password || !confirm}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                {submitting ? 'Resetting…' : 'Reset password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F7F2EB]">
                <Loader2 size={20} className="text-gray-400 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

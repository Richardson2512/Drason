'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !trimmed.includes('@')) {
            setError('Enter a valid email address');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await apiClient<{ success: boolean; message: string }>('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: trimmed }),
            });
            setSubmitted(true);
        } catch (err: any) {
            // Backend always returns success to avoid email enumeration; this
            // catch is for true network/5xx failures.
            setError(err?.message || 'Something went wrong. Try again in a moment.');
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

                {submitted ? (
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <CheckCircle2 size={22} className="text-emerald-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                            The link expires in 1 hour.
                        </p>
                        <p className="text-xs text-gray-500 mb-6">
                            Didn&apos;t get the email? Check your spam folder, or{' '}
                            <button
                                type="button"
                                onClick={() => { setSubmitted(false); setError(''); }}
                                className="text-[#1C4532] font-semibold underline hover:text-green-800 bg-transparent border-none p-0 cursor-pointer"
                            >
                                try a different address
                            </button>.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block px-5 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg no-underline hover:bg-green-900"
                        >
                            Return to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
                        <p className="text-sm text-gray-600 mb-6">
                            Enter the email associated with your Superkabe account and we&apos;ll send you a reset link.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    autoFocus
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D1CBC5] outline-none focus:border-[#1C4532] bg-white"
                                />
                            </div>
                            {error && (
                                <p className="text-xs text-red-600 m-0">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={submitting || !email.trim()}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C4532] text-white text-sm font-semibold rounded-lg hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                {submitting ? 'Sending…' : 'Send reset link'}
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 mt-6 text-center">
                            Remembered it? <Link href="/login" className="text-[#1C4532] font-semibold underline hover:text-green-800">Sign in</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

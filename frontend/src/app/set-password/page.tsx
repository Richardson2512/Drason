'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Check, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';

interface InviteContext {
    email: string;
    displayName: string | null;
    workspaceName: string;
    workspaceSlug: string;
    expiresAt: string;
}

/**
 * Magic-link landing for newly-invited workspace clients.
 *
 * Backend follow-up will replace the localStorage lookup with:
 *   GET  /api/auth/invite?token=XYZ        → returns { email, workspace_name } or 410 expired
 *   POST /api/auth/invite/complete         → sets password, returns { redirect: '/login' }
 * The UI flow stays identical - client sets password, lands on /login, signs in.
 */
function SetPasswordInner() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get('token');

    const [stage, setStage] = useState<'loading' | 'invalid' | 'expired' | 'form' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [pw1, setPw1] = useState('');
    const [pw2, setPw2] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [invite, setInvite] = useState<InviteContext | null>(null);

    // Validate the magic-link token via GET /api/auth/invite?token=…
    useEffect(() => {
        if (!token) { setStage('invalid'); return; }
        let cancelled = false;
        (async () => {
            try {
                const resp = await fetch(`/api/auth/invite?token=${encodeURIComponent(token)}`);
                if (cancelled) return;
                if (resp.status === 410) {
                    setStage('expired');
                    return;
                }
                if (!resp.ok) {
                    setStage('invalid');
                    return;
                }
                const body = await resp.json();
                if (!body.success) { setStage('invalid'); return; }
                setInvite(body.data as InviteContext);
                setStage('form');
            } catch {
                if (!cancelled) setStage('invalid');
            }
        })();
        return () => { cancelled = true; };
    }, [token]);

    const validate = (): string | null => {
        if (pw1.length < 12) return 'Password must be at least 12 characters.';
        if (!/[A-Z]/.test(pw1) || !/[a-z]/.test(pw1) || !/\d/.test(pw1)) return 'Password must include uppercase, lowercase, and a number.';
        if (pw1 !== pw2) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !invite) return;
        const err = validate();
        if (err) { setErrorMsg(err); return; }
        setErrorMsg('');
        setSubmitting(true);
        try {
            const resp = await fetch('/api/auth/invite/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: pw1 }),
            });
            const body = await resp.json();
            setSubmitting(false);
            if (!resp.ok || !body.success) {
                setErrorMsg(body.error || 'Could not set password. The link may have already been used.');
                return;
            }
            setStage('success');
            // Pre-fill the client login form on /login by passing query params.
            const slug = body.data?.workspaceSlug ?? invite.workspaceSlug;
            const email = body.data?.email ?? invite.email;
            setTimeout(() => {
                router.push(`/login?mode=client&workspace=${encodeURIComponent(slug)}&email=${encodeURIComponent(email)}`);
            }, 2500);
        } catch {
            setSubmitting(false);
            setErrorMsg('Network error - please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Brand bar */}
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/image/logo-v2.png" alt="Superkabe" width={28} height={28} className="block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="text-base font-bold text-gray-900">Superkabe</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    {stage === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 size={28} className="text-gray-400 animate-spin mb-3" />
                            <p className="text-sm text-gray-500">Verifying your invite link…</p>
                        </div>
                    )}

                    {stage === 'invalid' && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle size={22} className="text-red-700" />
                            </div>
                            <h1 className="text-lg font-bold text-gray-900 mb-2">Invalid invite link</h1>
                            <p className="text-xs text-gray-600 leading-relaxed mb-5">
                                This link is missing, malformed, or has already been used. Ask your agency to send you a fresh invite.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                                Go to sign-in
                            </Link>
                        </div>
                    )}

                    {stage === 'expired' && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle size={22} className="text-amber-700" />
                            </div>
                            <h1 className="text-lg font-bold text-gray-900 mb-2">This link has expired</h1>
                            <p className="text-xs text-gray-600 leading-relaxed mb-5">
                                Your invite expired on{' '}
                                {invite?.expiresAt && new Date(invite.expiresAt).toLocaleString()}.
                                Ask your agency to resend the invite.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                                Go to sign-in
                            </Link>
                        </div>
                    )}

                    {stage === 'form' && invite && (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-3">
                                    <KeyRound size={20} className="text-white" />
                                </div>
                                <h1 className="text-lg font-bold text-gray-900 mb-1">Set your password</h1>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Welcome{invite.displayName ? `, ${invite.displayName}` : ''}.
                                    You're being invited to <span className="font-semibold">{invite.workspaceName}</span> as <span className="font-semibold">{invite.email}</span>.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">New password</label>
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            value={pw1}
                                            onChange={(e) => setPw1(e.target.value)}
                                            placeholder="At least 12 characters, mixed case + a number"
                                            className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                                            tabIndex={-1}
                                        >
                                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Confirm password</label>
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={pw2}
                                        onChange={(e) => setPw2(e.target.value)}
                                        placeholder="Re-enter the same password"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                    />
                                </div>

                                {errorMsg && (
                                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-50 border border-red-200 text-[11px] text-red-800">
                                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting || !pw1 || !pw2}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? (
                                        <><Loader2 size={12} className="animate-spin" /> Setting password…</>
                                    ) : (
                                        <>Set password &amp; continue</>
                                    )}
                                </button>

                                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                                    By continuing you agree to your agency's terms. Your account is hard-locked to this workspace -
                                    you won't see anything else on Superkabe.
                                </p>
                            </form>
                        </>
                    )}

                    {stage === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                <Check size={22} className="text-emerald-700" />
                            </div>
                            <h1 className="text-lg font-bold text-gray-900 mb-2">Password set</h1>
                            <p className="text-xs text-gray-600 leading-relaxed mb-5">
                                Redirecting you to sign in…
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                                Go to sign-in
                            </Link>
                        </div>
                    )}
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-4">
                    Need help? Reach out to your agency contact.
                </p>
            </div>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="text-gray-400 animate-spin" /></div>}>
            <SetPasswordInner />
        </Suspense>
    );
}

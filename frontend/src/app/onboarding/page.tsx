'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, startTokenRefresh } from '@/lib/api';

export default function OnboardingPage() {
    const router = useRouter();
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (orgName.trim().length < 2) {
            setError('Organization name must be at least 2 characters.');
            return;
        }

        setLoading(true);

        try {
            await apiClient<{ success: boolean }>('/api/auth/onboarding/complete', {
                method: 'POST',
                body: JSON.stringify({ organizationName: orgName.trim() }),
            });

            // Onboarding complete — server set the JWT cookie.
            startTokenRefresh();
            router.push('/dashboard');
        } catch (err: any) {
            if (err.message?.includes('expired') || err.message?.includes('pending')) {
                setError('Your session has expired. Please sign up again.');
                // Redirect to signup after a short delay
                setTimeout(() => router.push('/signup'), 2500);
            } else {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden font-sans">

            {/* LEFT SIDE - FORM */}
            <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-8 lg:p-12 xl:p-16 bg-[#F5F8FF]">

                {/* Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="auth-blob auth-blob-purple"></div>
                    <div className="auth-blob auth-blob-orange"></div>
                </div>

                {/* Content Card */}
                <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10">
                    <Link href="/" className="flex items-center gap-2 mb-8 w-fit mx-auto">
                        <Image src="/image/logo-v2.png" alt="Superkabe" width={32} height={32} />
                        <span className="font-bold text-xl text-[#171923]">Superkabe</span>
                    </Link>

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-[#171923] mb-2">One Last Step</h1>
                        <p className="text-[#718096] text-sm">
                            What's your organization called? We'll use this to set up your workspace.
                        </p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 mb-6">{error}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[#718096] font-medium text-xs uppercase tracking-wide">Organization Name</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Acme Corp"
                                required
                                autoFocus
                            />
                            <p className="text-[#A0AEC0] text-xs mt-1">This will be the name of your Superkabe workspace.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#1C4532] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1C4532]/20 hover:shadow-[#1C4532]/30 hover:-translate-y-0.5 transition-all text-base mt-2"
                            disabled={loading}
                        >
                            {loading ? 'Setting up your workspace...' : 'Complete Setup'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <span className="text-[#718096] text-sm">Having trouble? </span>
                        <Link href="/signup" className="text-[#1C4532] font-semibold underline hover:text-green-800 text-sm">Start over</Link>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - BRANDING */}
            <div className="hidden lg:flex w-1/2 bg-[#1C4532] relative flex-col justify-center items-center overflow-hidden p-12 transition-all duration-500">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>

                <div className="relative z-10 text-center max-w-md">
                    {/* Shield Icon */}
                    <div className="mx-auto mb-8 w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>
                    </div>

                    <h2 className="text-white text-3xl font-bold mb-4">You're Almost There</h2>
                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        Your Google account is verified. Just name your organization and your Superkabe workspace will be ready to protect your email infrastructure.
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">14</div>
                            <div className="text-white/50 text-xs mt-1">Day Trial</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">24/7</div>
                            <div className="text-white/50 text-xs mt-1">Monitoring</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">0</div>
                            <div className="text-white/50 text-xs mt-1">Setup Fee</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { apiClient, startTokenRefresh } from '@/lib/api';

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    // Pinned at the moment the page loaded so the value submitted with the
    // form matches exactly what the user saw and clicked. Backend rejects on
    // version drift between page-render and submit.
    const [legalVersions, setLegalVersions] = useState<{ tos: string; privacy: string } | null>(null);

    // Get backend URL for Google OAuth redirect
    const getBackendUrl = () => {
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return `${protocol}//localhost:3001`;
            }
            return `${protocol}//${hostname}`;
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    // Capture plan parameter and OAuth errors from URL
    useEffect(() => {
        const plan = searchParams.get('plan');
        if (plan && ['starter', 'growth', 'scale'].includes(plan)) {
            setSelectedPlan(plan);
        }
        const oauthError = searchParams.get('error');
        if (oauthError) {
            setError(oauthError);
        }
    }, [searchParams]);

    // Fetch current TOS / Privacy versions so the form pins them at submit.
    useEffect(() => {
        apiClient<{ tos: string; privacy: string }>('/api/auth/legal-versions')
            .then(res => setLegalVersions({ tos: res.tos, privacy: res.privacy }))
            .catch(() => { /* keep null; submit will fail with a clear error */ });
    }, []);

    const handleGoogleSignup = () => {
        const backendUrl = getBackendUrl();
        const params = new URLSearchParams({ source: 'signup' });
        if (selectedPlan) params.set('plan', selectedPlan);
        window.location.href = `${backendUrl}/api/auth/google?${params.toString()}`;
    };

    const slides = [
        {
            title: "Real-time\nHealth Monitoring",
            desc: "Track every bounce and block event as it happens. We integrate directly with your sending tools.",
            cardTitle: "System Status",
            cardNum: "99.9%",
            stats: { label: "Uptime", value: "100%" },
            link: "/docs/monitoring"
        },
        {
            title: "Automated\nInfrastructure Healing",
            desc: "Automatically pause burnt mailboxes and reroute traffic to healthy ones without lifting a finger.",
            cardTitle: "Mailboxes",
            cardNum: "Protected",
            stats: { label: "Recovered", value: "12" },
            link: "/docs/platform-rules"
        },
        {
            title: "Scale without\nFear",
            desc: "Add unlimited mailboxes and domains. Our execution gate checks health before every single email.",
            cardTitle: "Domains",
            cardNum: "150+",
            stats: { label: "Active", value: "142" },
            link: "/docs/execution-gate"
        }
    ];

    // Auto-advance carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptedTerms) {
            setError('You must accept the Terms of Service and Privacy Policy to create an account.');
            return;
        }
        if (!legalVersions) {
            setError('Could not load the current Terms / Privacy Policy versions. Please refresh and try again.');
            return;
        }

        setLoading(true);

        try {
            await apiClient<{ token?: string }>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    organizationName: orgName,
                    tier: selectedPlan,
                    acceptedTosVersion: legalVersions.tos,
                    acceptedPrivacyVersion: legalVersions.privacy,
                }),
            });

            // Server sets httpOnly cookie automatically via Set-Cookie header.
            // Start periodic token refresh to keep session alive.
            startTokenRefresh();

            // Redirect to dashboard - user gets immediate trial access
            // No payment required for 14-day trial
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden font-sans">

            {/* LEFT SIDE - FORM */}
            <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-4 lg:p-6 xl:p-8 bg-[#F7F2EB]">

                {/* Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="auth-blob auth-blob-purple"></div>
                    <div className="auth-blob auth-blob-orange"></div>
                </div>

                {/* Content Container - compact card */}
                <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-5 md:p-6">
                    <Link href="/" className="flex items-center gap-2 mb-4 w-fit mx-auto">
                        <Image src="/image/logo-v2.png" alt="Superkabe" width={26} height={26} />
                        <span className="font-bold text-base text-[#171923]">Superkabe</span>
                    </Link>

                    <div className="mb-4 text-center">
                        <h1 className="text-xl font-bold text-[#171923] mb-0.5">Get Started</h1>
                        <p className="text-[#718096] text-xs">
                            Create your Superkabe account
                        </p>
                        {selectedPlan && (
                            <div className="mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-blue-700 text-xs font-semibold">
                                    Selected: {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                                </p>
                                <p className="text-blue-600 text-[10px] mt-0.5">14-day free trial • No credit card required</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                        <div className="space-y-1">
                            <label className="text-[#718096] font-medium text-[11px] uppercase tracking-wide">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[#718096] font-medium text-[11px] uppercase tracking-wide">Organization Name</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm text-sm"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Acme Corp"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[#718096] font-medium text-[11px] uppercase tracking-wide">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[#718096] font-medium text-[11px] uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm text-sm pr-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#718096] p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Required ToS + Privacy consent — captured per GDPR Art. 7(1) */}
                        <label className="flex items-start gap-1.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-0.5 shrink-0"
                                required
                            />
                            <span className="text-[11px] text-[#4A5568] leading-snug">
                                I agree to the{' '}
                                <Link href="/terms" target="_blank" className="text-[#1C4532] font-semibold underline hover:text-green-800">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link href="/privacy" target="_blank" className="text-[#1C4532] font-semibold underline hover:text-green-800">
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>

                        <button
                            type="submit"
                            className="w-full bg-[#1C4532] text-white font-bold py-2.5 rounded-xl shadow-lg shadow-[#1C4532]/20 hover:shadow-[#1C4532]/30 hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            disabled={loading || !acceptedTerms || !legalVersions}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="h-px bg-[#E2E8F0] flex-1"></div>
                            <span className="text-[#A0AEC0] text-[10px] font-medium uppercase tracking-wider">OR CONTINUE WITH</span>
                            <div className="h-px bg-[#E2E8F0] flex-1"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full bg-white border border-[#E2E8F0] text-[#718096] font-medium py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <div className="w-4 h-4 relative">
                                <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" fill />
                            </div>
                            <span className="text-xs">Sign up with Google</span>
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <span className="text-[#718096] text-xs">Already have an account? </span>
                        <Link href="/login" className="text-[#1C4532] font-semibold underline hover:text-green-800 text-xs">Sign in</Link>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - CAROUSEL (Duplicated from Login) */}
            <div className="hidden lg:flex w-1/2 bg-[#1C4532] relative flex-col justify-center items-center overflow-hidden p-12 transition-all duration-500">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>

                {/* Top Right Support */}
                <div className="absolute top-8 right-8 flex items-center gap-2 text-white/80 hover:text-white cursor-pointer transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                    <span className="font-medium">Support</span>
                </div>

                {/* Carousel Content */}
                <div className="relative z-10 w-full max-w-md h-[550px] flex flex-col justify-center">

                    {/* Slides */}
                    <div className="relative h-[400px]">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-500 transform ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}
                            >
                                <div className="bg-white rounded-[32px] p-8 pb-0 shadow-2xl overflow-hidden relative h-full flex flex-col">
                                    {/* Floating Stats — anchored to the card's top-right corner,
                                        permanently out of the way of the title (top-left), the
                                        "Learn more" CTA (mid-left), and the rotated mockup cards
                                        (bottom-right). Zero overlap regardless of how long the
                                        description wraps. */}
                                    <div className="absolute top-6 right-6 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 flex items-center gap-3 z-20">
                                        <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center shrink-0">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-medium">{slide.stats.label}</div>
                                            <div className="text-lg font-bold text-[#1C4532] leading-none">{slide.stats.value}</div>
                                        </div>
                                    </div>

                                    {/* Title reserves right-side margin so long titles can't
                                        collide with the stats box anchored at top-right. */}
                                    <h2 className="text-3xl font-bold text-[#1C4532] mb-3 leading-tight whitespace-pre-line pr-32">{slide.title}</h2>
                                    <p className="text-[#64748B] text-sm mb-6 max-w-xs">{slide.desc}</p>

                                    <Link
                                        href={slide.link}
                                        target="_blank"
                                        className="relative z-30 bg-[#1C4532] text-white px-6 py-2.5 rounded-full text-sm font-medium mb-8 hover:bg-[#143325] transition-colors w-fit flex items-center gap-2"
                                    >
                                        Learn more
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </Link>

                                    <div className="relative h-48 mt-auto">
                                        {/* Card Mockup - Domain Health Widget */}
                                        <div className="absolute right-[-20px] top-4 w-60 h-auto rounded-xl bg-white border border-gray-100 p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transform rotate-[-6deg] z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-800">{slide.cardTitle}</div>
                                                    <div className="text-[10px] text-gray-500">Last checked: Just now</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#1C4532] w-[92%] rounded-full"></div>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-medium">
                                                    <span className="text-gray-500">Health Score</span>
                                                    <span className="text-[#1C4532]">{slide.cardNum}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Background Decor Card for depth */}
                                        <div className="absolute right-[-40px] top-12 w-60 h-32 rounded-xl bg-gray-50 border border-gray-100 transform rotate-[4deg] z-0"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Content & Indicators */}
                    <div className="mt-12 text-center max-w-md">
                        <h3 className="text-white text-3xl font-bold mb-4">Send Cold Email. Land in the Inbox.</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            The AI cold email platform with native deliverability protection. Draft AI sequences, send across unlimited mailboxes, and let Superkabe auto-heal your senders in the background.
                        </p>

                        <div className="flex justify-center gap-2 mt-8">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-4' : 'bg-white/20'}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F7F2EB',
                color: '#9CA3AF'
            }}>
                Loading...
            </div>
        }>
            <SignupContent />
        </Suspense>
    );
}

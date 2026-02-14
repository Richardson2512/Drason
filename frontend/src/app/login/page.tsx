'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { apiClient, startTokenRefresh } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

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
    useState(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiClient<any>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // Server sets httpOnly cookie automatically via Set-Cookie header.
            // Start periodic token refresh to keep session alive.
            startTokenRefresh();

            // Successful login
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden font-sans">

            {/* LEFT SIDE - LOGIN FORM */}
            <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-8 lg:p-12 xl:p-16 bg-[#F5F8FF]">

                {/* Background Blobs (moved from module css to global) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="auth-blob auth-blob-purple"></div>
                    <div className="auth-blob auth-blob-orange"></div>
                </div>

                {/* Content Container - NOW IN A CARD */}
                <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 mb-8 w-fit mx-auto">
                        <Image src="/image/logo-v2.png" alt="Superkabe" width={32} height={32} />
                        <span className="font-bold text-xl text-[#171923]">Superkabe</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-[#171923] mb-2">Sign in</h1>
                        <p className="text-[#718096] text-sm">
                            Don't have an account? <Link href="/signup" className="text-[#1C4532] font-semibold underline hover:text-green-800">Create now</Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[#718096] font-medium text-xs uppercase tracking-wide">E-mail</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#2D3748] placeholder:text-gray-400 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm"
                                placeholder="Email ID"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[#718096] font-medium text-xs uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#1C4532]/20 focus:border-[#1C4532] transition-all shadow-sm pr-12"
                                    placeholder="@#*%"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#718096] p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${rememberMe ? 'bg-[#1C4532] border-[#1C4532]' : 'border-[#CBD5E0] bg-white'}`}>
                                    {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                </div>
                                <span className="text-sm text-[#718096]">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-xs font-bold text-[#1C4532] hover:underline opacity-80 hover:opacity-100">
                                FORGOT PASSWORD?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1C4532] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1C4532]/20 hover:shadow-[#1C4532]/30 hover:-translate-y-0.5 transition-all text-base mt-2"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px bg-[#E2E8F0] flex-1"></div>
                            <span className="text-[#A0AEC0] text-xs font-medium uppercase">OR CONTINUE WITH</span>
                            <div className="h-px bg-[#E2E8F0] flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="w-full bg-white border border-[#E2E8F0] text-[#718096] font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                                <div className="w-5 h-5 relative">
                                    <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" fill />
                                </div>
                                <span className="text-sm">Google</span>
                            </button>
                            <button type="button" className="w-full bg-white border border-[#E2E8F0] text-[#718096] font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                                <div className="w-5 h-5 relative">
                                    <Image src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" fill />
                                </div>
                                <span className="text-sm">Facebook</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* RIGHT SIDE - CAROUSEL */}
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
                                    <h2 className="text-3xl font-bold text-[#1C4532] mb-3 leading-tight whitespace-pre-line">{slide.title}</h2>
                                    <p className="text-[#64748B] text-sm mb-6 max-w-xs">{slide.desc}</p>

                                    <Link
                                        href={slide.link}
                                        target="_blank"
                                        className="bg-[#1C4532] text-white px-6 py-2.5 rounded-full text-sm font-medium mb-8 hover:bg-[#143325] transition-colors w-fit flex items-center gap-2"
                                    >
                                        Learn more
                                        <ArrowRight size={16} />
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

                                    {/* Floating Stats */}
                                    <div className="absolute bottom-6 left-6 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex items-center gap-3 pr-8 z-20">
                                        <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-medium">{slide.stats.label}</div>
                                            <div className="text-lg font-bold text-[#1C4532]">{slide.stats.value}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Content & Indicators */}
                    <div className="mt-12 text-center max-w-md">
                        <h3 className="text-white text-3xl font-bold mb-4">Protect Your Infrastructure</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Stop burning domains. Superkabe monitors your health, blocks risks, and auto-heals your infrastructure so you can scale with confidence.
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

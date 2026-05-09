'use client';

import { useState } from 'react';
import { Zap, Shield, TrendingUp, CheckCircle2, ExternalLink, Server, Lock, BarChart3, AlertCircle } from 'lucide-react';

/**
 * Super Sender — dedicated IP product page.
 *
 * Polar checkout integration: paste the customer-facing Polar checkout
 * URL into POLAR_CHECKOUT_URL below. Until that's set, the Buy button
 * stays disabled with a "Coming soon" label so we never send a customer
 * to a broken checkout.
 *
 * The product is one Polar SKU charged at $39/month per IP. If you ship
 * tiered IP bundles later (e.g., 3-IP / 5-IP packs), add additional
 * Polar URLs and a quantity picker.
 */

// ────────────────────────────────────────────────────────────────────
// Polar checkout — replace the placeholder when the product is created.
// Pattern: keep the constant explicit so a single edit enables purchases
// across the whole page. No env-var indirection because this is a public
// URL the customer is meant to see in DevTools anyway.
// ────────────────────────────────────────────────────────────────────

const POLAR_CHECKOUT_URL = ''; // TODO: paste Polar checkout URL — leaves Buy disabled until set.
const PRICE_PER_IP_USD = 39;

export default function SuperSenderPage() {
    const checkoutEnabled = POLAR_CHECKOUT_URL.startsWith('https://');
    const [redirecting, setRedirecting] = useState(false);

    const handleBuy = () => {
        if (!checkoutEnabled) return;
        setRedirecting(true);
        window.location.href = POLAR_CHECKOUT_URL;
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            {/* ── Hero ─────────────────────────────────────────────── */}
            <div
                className="rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
                }}
            >
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                        >
                            <Zap size={20} strokeWidth={2} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200">Super Sender</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight m-0">
                        Dedicated IPs for your workspace
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-2xl m-0">
                        Take full ownership of your sender reputation. A dedicated IP is yours alone — no neighbours, no shared blacklist exposure, no surprise dips because someone else on a shared pool got reported. Powered by Amazon SES infrastructure.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Server size={11} /> Amazon SES backbone
                        </span>
                        <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Shield size={11} /> Auto-warmed
                        </span>
                        <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Lock size={11} /> Yours alone
                        </span>
                    </div>
                </div>

                {/* Decorative — large translucent zap icon for the corner */}
                <div className="absolute -right-12 -bottom-12 opacity-10 hidden md:block">
                    <Zap size={280} strokeWidth={1} className="text-white" />
                </div>
            </div>

            {/* ── Why a dedicated IP ───────────────────────────────── */}
            <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Why dedicated IP?</h2>
                <p className="text-sm text-gray-500 mb-5">
                    Most platforms send your campaigns from a shared pool. That works for low volume — but every other tenant&apos;s mistakes affect your inbox placement. A dedicated IP gives you a clean, isolated sender identity that responds only to your sending pattern.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FeatureCard
                        icon={<TrendingUp size={18} className="text-blue-600" />}
                        title="Better inbox placement"
                        body="Your reputation is built only on emails you send. ISPs (Gmail, Microsoft, Yahoo) score the IP by your behaviour — clean unsubscribe handling, low bounce rates, real engagement — not the noisy average of a shared pool."
                    />
                    <FeatureCard
                        icon={<Shield size={18} className="text-emerald-600" />}
                        title="Isolated from blacklist incidents"
                        body="On a shared pool, one bad actor on your IP gets you listed on Spamhaus / SORBS / SBL. With a dedicated IP, the only path to a listing is your own sending — which Superkabe&apos;s deliverability protection layer already monitors and pauses before it spikes."
                    />
                    <FeatureCard
                        icon={<BarChart3 size={18} className="text-violet-600" />}
                        title="Predictable, attributable performance"
                        body="Every metric — open rate by ISP, complaint rate, hard bounce velocity — is yours, attributable, and trended on a stable IP. No more ‘why did open rates drop, was it me?’"
                    />
                </div>
            </section>

            {/* ── How it works ─────────────────────────────────────── */}
            <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">How it works</h2>
                <p className="text-sm text-gray-500 mb-5">
                    Super Sender is fully managed. You don&apos;t touch SES consoles, IP allocations, or warmup curves.
                </p>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <ol className="space-y-4 m-0 p-0 list-none">
                        <Step
                            n={1}
                            title="Provision"
                            body="One click. We allocate a fresh dedicated IP from Amazon SES under your workspace, set up reverse DNS, and configure SPF + DKIM signing for your sending domains."
                        />
                        <Step
                            n={2}
                            title="Warmup"
                            body="Superkabe auto-ramps the IP from cold to ~10K sends/day over 28 days using your real campaign traffic. The protection layer watches bounce / complaint rates throughout — if anything trends bad it pauses sends and re-warms automatically."
                        />
                        <Step
                            n={3}
                            title="Send"
                            body="Once warmed, every campaign you launch in Superkabe routes through your dedicated IP. Existing mailboxes (Google / Microsoft / SMTP) keep working — Super Sender is an additional outbound path the dispatcher can choose, not a replacement."
                        />
                        <Step
                            n={4}
                            title="Monitor"
                            body="Per-IP deliverability dashboard. SMTP code distribution, ISP-by-ISP placement (Postmaster Tools), blacklist watch, complaint rate. Same view you get for your existing mailboxes today."
                        />
                    </ol>
                </div>
            </section>

            {/* ── What's included ──────────────────────────────────── */}
            <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">What&apos;s included</h2>
                <p className="text-sm text-gray-500 mb-5">
                    Per dedicated IP per month — no metered overages, no setup fees.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Included text="One reserved Amazon SES IPv4 address with reverse DNS" />
                    <Included text="Auto-warmup over 28 days (manual override available)" />
                    <Included text="SPF + DKIM auto-configuration for your domains" />
                    <Included text="Per-IP deliverability monitoring + alerts" />
                    <Included text="Auto-pause on bounce-rate or complaint-rate spike" />
                    <Included text="Postmaster Tools (Google / Microsoft) signal integration" />
                    <Included text="Cancel anytime — IP released back to the pool at month end" />
                    <Included text="Up to 50K sends/day at full warmup (tier-dependent)" />
                </div>
            </section>

            {/* ── Pricing card ─────────────────────────────────────── */}
            <section className="mb-8">
                <div
                    className="rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center"
                    style={{
                        background: 'linear-gradient(135deg, #FAFAFA 0%, #F0F4FF 100%)',
                        border: '1px solid #C7D2FE',
                    }}
                >
                    <div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl md:text-5xl font-bold text-gray-900">${PRICE_PER_IP_USD}</span>
                            <span className="text-sm text-gray-600">/ IP / month</span>
                        </div>
                        <p className="text-sm text-gray-700 m-0 mb-1">
                            Add as many dedicated IPs as you need. Volume customers (5+ IPs) — <a href="mailto:support@superkabe.com" className="text-blue-700 underline font-semibold">talk to us</a> for tiered pricing.
                        </p>
                        <p className="text-[11px] text-gray-500 m-0">
                            Billed monthly via Polar. Stripe / Polar receipts available. Cancel anytime.
                        </p>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end gap-2 shrink-0">
                        <button
                            onClick={handleBuy}
                            disabled={!checkoutEnabled || redirecting}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-white inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: checkoutEnabled
                                    ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                                    : '#9CA3AF',
                            }}
                        >
                            {redirecting ? 'Redirecting…' : checkoutEnabled ? <>Buy Super Sender <ExternalLink size={13} /></> : 'Coming soon'}
                        </button>
                        {!checkoutEnabled && (
                            <span className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                                <AlertCircle size={10} />
                                Checkout link will be enabled once configured
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ── FAQ-ish ──────────────────────────────────────────── */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Common questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FAQ
                        q="Is this required, or can I keep using my Gmail / Microsoft mailboxes?"
                        a="Optional. Most workspaces start on Gmail / Microsoft / SMTP and add a dedicated IP once volume justifies it (typically ~5K+ daily sends, or once you&apos;re seeing shared-pool placement issues). Your existing mailboxes keep working alongside."
                    />
                    <FAQ
                        q="Why $39 — what does that pay for?"
                        a="Amazon SES dedicated IP base cost + our warmup automation, monitoring infrastructure, blacklist watch, and SES-side TLS / reverse DNS setup. We don&apos;t mark the SES cost up — most of the $39 is the operational layer around it."
                    />
                    <FAQ
                        q="What if my IP gets blacklisted?"
                        a="Our protection layer auto-pauses sending the moment bounce rate or complaint rate crosses a threshold — usually before a blacklist would even register. If a listing does happen, we file the delisting on your behalf. Repeat listings within 30 days come with a free IP swap."
                    />
                    <FAQ
                        q="Can I cancel anytime?"
                        a="Yes. Cancel from billing settings; the IP keeps sending through the end of the current billing period and is then released back to the pool. No long-term contracts."
                    />
                </div>
            </section>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponents — local to this page; not extracted because they're
// only used here and inlining keeps the file readable end-to-end.
// ────────────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center mb-3">{icon}</div>
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-1.5">{title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed m-0">{body}</p>
        </div>
    );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
    return (
        <li className="flex gap-3">
            <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white mt-0.5"
                style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
            >
                {n}
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900 m-0 mb-0.5">{title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed m-0">{body}</p>
            </div>
        </li>
    );
}

function Included({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{text}</span>
        </div>
    );
}

function FAQ({ q, a }: { q: string; a: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-900 m-0 mb-1.5">{q}</h4>
            <p className="text-xs text-gray-600 leading-relaxed m-0">{a}</p>
        </div>
    );
}

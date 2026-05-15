'use client';

/**
 * Post-connect onboarding modal - fires once after a fresh LinkedIn
 * account connection (the URL carries `?connected=1` on return from the
 * Unipile hosted-auth redirect).
 *
 * Tells the user what they just signed up for ("all content posted on
 * this account will be monitored for signals") and gives them four deep
 * links to the next steps that turn the connection into actual outbound
 * value:
 *
 *   1. Define your ICP            → /dashboard/linkedin/icp
 *   2. Add enrichment providers   → /dashboard/integrations
 *   3. Build an email sequence    → /dashboard/sequencer/campaigns/new
 *   4. Start a cold-call list     → /dashboard/cold-call-list
 *
 * Dismiss state is persisted in localStorage so a returning user who has
 * already seen the onboarding doesn't get nagged on every reconnect.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
    Target, Plug, Send, PhoneCall, X, Radar, ArrowRight,
    CheckCircle2,
} from 'lucide-react';

const DISMISSED_KEY = 'linkedin.postConnectOnboarding.dismissed.v1';

interface PostConnectOnboardingModalProps {
    /** Set `true` after we detect `?connected=1` in the URL. */
    open: boolean;
    /** Called when the user closes the modal. We also persist a
     *  "dismissed" flag so future connects don't re-fire this. */
    onClose: () => void;
}

const STEPS: Array<{
    href: string;
    icon: React.ReactNode;
    title: string;
    body: string;
    cta: string;
    accent: string;
}> = [
    {
        href: '/dashboard/linkedin/icp',
        icon: <Target className="w-4 h-4" />,
        title: 'Define your ICP',
        body: 'Set titles, industries, company sizes, and geos so the signal monitoring agent knows which engaging profiles to route into your campaigns.',
        cta: 'Set up ICP',
        accent: '#2563EB',
    },
    {
        href: '/dashboard/integrations',
        icon: <Plug className="w-4 h-4" />,
        title: 'Add enrichment providers',
        body: 'Connect Apollo, Clay, Surfe, Lusha, Hunter, or ZoomInfo. Engaging profiles get email + phone enriched automatically so you can run cold email and cold call alongside LinkedIn.',
        cta: 'Open integrations',
        accent: '#16A34A',
    },
    {
        href: '/dashboard/sequencer/campaigns/new',
        icon: <Send className="w-4 h-4" />,
        title: 'Build an email sequence',
        body: 'Once a LinkedIn engager is enriched, push them into a multi-step email cadence. Email replies pause LinkedIn automatically (and vice versa).',
        cta: 'Create a campaign',
        accent: '#8B5CF6',
    },
    {
        href: '/dashboard/cold-call-list',
        icon: <PhoneCall className="w-4 h-4" />,
        title: 'Start a cold-call list',
        body: 'Send ICP-matched enriched leads straight to a cold-call list for your SDR team. Phone numbers come from the enrichment waterfall.',
        cta: 'Open cold-call list',
        accent: '#F59E0B',
    },
];

export function isOnboardingDismissed(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        return window.localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
        return false;
    }
}

export function markOnboardingDismissed(): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
        // localStorage can be unavailable in incognito with storage disabled.
        // Silently no-op - modal will re-fire next session, which is fine.
    }
}

export default function PostConnectOnboardingModal({ open, onClose }: PostConnectOnboardingModalProps) {
    const [neverShowAgain, setNeverShowAgain] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleClose = () => {
        if (neverShowAgain) markOnboardingDismissed();
        onClose();
    };

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden"
                style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)', maxHeight: '92vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div
                    className="px-6 py-5 flex items-start justify-between gap-3"
                    style={{ borderBottom: '1px solid #D1CBC5', background: 'linear-gradient(135deg, #EFF6FF 0%, #FAF7F1 100%)' }}
                >
                    <div className="flex items-start gap-3 min-w-0">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: '#0A66C2', color: '#FFFFFF' }}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-gray-900">LinkedIn account connected</h2>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                <Radar className="w-3 h-3 inline-block mr-1 -mt-0.5 text-[#0A66C2]" />
                                Every post, article, and thought-leadership update on this account is now monitored for engagement signals.
                                Set up the four pieces below so engaging profiles flow straight into your outbound - email, cold call, and follow-up sequences.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-md hover:bg-white/60 text-gray-500 cursor-pointer shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">
                    <ol className="flex flex-col gap-3">
                        {STEPS.map((step, idx) => (
                            <li key={step.href}>
                                <Link
                                    href={step.href}
                                    onClick={handleClose}
                                    className="block rounded-xl px-4 py-3 hover:bg-[#FAFAF8] transition-colors cursor-pointer no-underline"
                                    style={{ border: '1px solid #E8E3DC' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: `${step.accent}15`, color: step.accent }}
                                        >
                                            {step.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-semibold text-gray-400">Step {idx + 1}</span>
                                                <h3 className="text-sm font-semibold text-gray-900 truncate">{step.title}</h3>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{step.body}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0" style={{ color: step.accent }}>
                                            {step.cta}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>

                <div
                    className="px-6 py-3 flex items-center justify-between gap-3"
                    style={{ borderTop: '1px solid #D1CBC5', background: '#FAF7F1' }}
                >
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={neverShowAgain}
                            onChange={e => setNeverShowAgain(e.target.checked)}
                            className="rounded"
                        />
                        Don&apos;t show this again
                    </label>
                    <button
                        onClick={handleClose}
                        className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

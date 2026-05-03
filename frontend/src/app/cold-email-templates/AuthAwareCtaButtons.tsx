'use client';

import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { useIsAuthenticated } from '@/lib/auth-client';

interface AuthAwareCtaButtonsProps {
    /** Path to round-trip back to after signup (relative). */
    from: string;
    /** Optional intent flag (e.g., "ai-customize"). */
    intent?: string;
    /** Secondary button — same content for authed and guest. */
    secondary: { href: string; label: string };
}

/**
 * Bottom-of-page CTA buttons used on /cold-email-templates/* pages.
 *
 * - Guest: "Start free trial" (with ?from=... + ?intent=...) + secondary
 * - Authed: "Open dashboard" + secondary (no signup nag, no trial talk)
 *
 * SSR renders the guest variant to match the most common visitor; flips to
 * the authed variant after the cookie is read.
 */
export default function AuthAwareCtaButtons({ from, intent, secondary }: AuthAwareCtaButtonsProps) {
    const { ready, isAuthenticated } = useIsAuthenticated();

    if (ready && isAuthenticated) {
        return (
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#1E1E2F] text-sm font-semibold hover:bg-[#F7F2EB] transition"
                >
                    <LayoutDashboard size={14} strokeWidth={2} />
                    Open dashboard
                </Link>
                <Link
                    href={secondary.href}
                    className="px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition"
                >
                    {secondary.label}
                </Link>
            </div>
        );
    }

    const params = new URLSearchParams({ from });
    if (intent) params.set('intent', intent);

    return (
        <div className="flex flex-wrap gap-3">
            <Link
                href={`/signup?${params.toString()}`}
                className="px-5 py-2.5 rounded-lg bg-white text-[#1E1E2F] text-sm font-semibold hover:bg-[#F7F2EB] transition"
            >
                Start free trial
            </Link>
            <Link
                href={secondary.href}
                className="px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition"
            >
                {secondary.label}
            </Link>
        </div>
    );
}

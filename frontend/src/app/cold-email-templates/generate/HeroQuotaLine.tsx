'use client';

import Link from 'next/link';
import { useIsAuthenticated } from '@/lib/auth-client';

/**
 * Tiny client component for the hero subtitle line on
 * /cold-email-templates/generate. Shows the guest-quota note for visitors
 * and an "unlimited" affirmation for signed-in users. SSR renders the guest
 * note (matches majority of traffic and avoids hydration mismatch).
 */
export default function HeroQuotaLine({ from }: { from: string }) {
    const { ready, isAuthenticated } = useIsAuthenticated();

    if (ready && isAuthenticated) {
        return (
            <p className="text-sm text-[#6B5E4F]">
                Unlimited generations on your account. Saved templates show up in your library.
            </p>
        );
    }

    return (
        <p className="text-sm text-[#6B5E4F]">
            3 free generations a day.{' '}
            <Link
                href={`/signup?from=${encodeURIComponent(from)}&intent=ai-customize`}
                className="underline hover:text-[#1E1E2F]"
            >
                Sign up
            </Link>
            {' '}for unlimited.
        </p>
    );
}

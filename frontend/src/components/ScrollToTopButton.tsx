'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

/**
 * Floating "scroll to top" button. Mounted globally in app/layout.tsx, but
 * self-hides on app / auth / onboarding routes so it only shows on the
 * public marketing site.
 *
 * Behavior:
 *   - Hidden until the user has scrolled SHOW_THRESHOLD_PX past the top
 *   - Smooth scroll-to-top on click
 *   - Fixed position bottom-right, sized for mobile tap target (44px)
 *   - Subtle fade + slide-in animation when becoming visible
 *
 * Accessibility:
 *   - <button> with aria-label
 *   - Hidden from tab focus when offscreen via tabIndex={-1}
 *   - Respects prefers-reduced-motion via behavior: 'auto' fallback
 */

const SHOW_THRESHOLD_PX = 320;

const HIDDEN_PATH_PREFIXES = [
    '/dashboard',
    '/admin',
    '/login',
    '/signup',
    '/onboarding',
    '/oauth',
];

export default function ScrollToTopButton() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > SHOW_THRESHOLD_PX);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Don't render on app / auth / onboarding routes — only the marketing site.
    const onAppPage = HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p));
    if (onAppPage) return null;

    const handleClick = () => {
        const reducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Scroll to top"
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            className={`fixed bottom-5 right-5 md:bottom-7 md:right-7 z-40 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#1E1E2F] text-white shadow-lg shadow-black/20 hover:bg-[#2A2A3F] hover:scale-105 active:scale-95 transition-all duration-200 ${
                visible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
        >
            <ArrowUp size={18} strokeWidth={2.25} />
        </button>
    );
}

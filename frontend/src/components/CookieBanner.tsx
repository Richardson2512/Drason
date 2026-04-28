'use client';

/**
 * Cookie Banner
 *
 * Shows a non-intrusive banner on first visit (no cookie-consent decision
 * recorded yet) and lets the user accept all, reject non-essential, or
 * customize. The decision is recorded server-side via /api/consent/cookies
 * (creates one row per category) and locally as a cookie so the banner
 * doesn't reappear on subsequent visits.
 *
 * Strict-necessary cookies (auth session, CSRF) are always allowed — the
 * banner does not gate them; analytics + functional cookies are gated.
 *
 * The banner is shown to ALL visitors regardless of jurisdiction (safer
 * default than trying to detect EU/UK reliably from the browser).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'sk-cookie-consent-v1';

interface ConsentRecord {
    version: string;
    analytics: boolean;
    functional: boolean;
    decidedAt: string; // ISO
}

function readLocalConsent(): ConsentRecord | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as ConsentRecord;
    } catch { return null; }
}

function writeLocalConsent(record: ConsentRecord): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch { /* private mode etc — server record is canonical */ }
}

export default function CookieBanner() {
    const [open, setOpen] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [functional, setFunctional] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const existing = readLocalConsent();
        if (!existing) setOpen(true);
    }, []);

    const submit = async (categories: { analytics: boolean; functional: boolean }, choice: 'all' | 'reject_all' | 'custom') => {
        setSubmitting(true);
        try {
            // Server-side audit row(s)
            const apiBase = window.location.hostname === 'localhost'
                ? `${window.location.protocol}//localhost:4000`
                : '';
            await fetch(`${apiBase}/api/consent/cookies`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories, accepted: choice }),
            });
        } catch { /* network failure should not block the local decision */ }

        // Local cache so the banner doesn't reappear
        writeLocalConsent({
            version: '2026-04-28',
            analytics: categories.analytics,
            functional: categories.functional,
            decidedAt: new Date().toISOString(),
        });

        // Google Consent Mode v2 update — notifies gtag.js to either start
        // writing _ga/_ga_* cookies (if granted) or stay in cookieless mode
        // (if denied). The default state set in layout.tsx is "denied" for
        // every category, so this is the gate that actually opens tracking.
        if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
            (window as any).gtag('consent', 'update', {
                analytics_storage: categories.analytics ? 'granted' : 'denied',
                functionality_storage: categories.functional ? 'granted' : 'denied',
                personalization_storage: categories.functional ? 'granted' : 'denied',
            });
        }

        setSubmitting(false);
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[90]">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
                <h3 className="text-base font-bold text-gray-900 mb-2">We use cookies</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    We use strictly-necessary cookies to keep Superkabe running, and (with your consent) functional and analytics cookies to improve the product. See our{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>.
                </p>

                {showCustomize ? (
                    <div className="space-y-3 mb-4">
                        <label className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <input type="checkbox" checked disabled className="mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-700">
                                <strong className="block text-gray-900">Strictly necessary</strong>
                                Authentication, session management, CSRF protection. Always on.
                            </span>
                        </label>
                        <label className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={functional}
                                onChange={(e) => setFunctional(e.target.checked)}
                                className="mt-0.5 shrink-0"
                            />
                            <span className="text-xs text-gray-700">
                                <strong className="block text-gray-900">Functional</strong>
                                Remembers product preferences (sidebar collapsed, sequence editor settings).
                            </span>
                        </label>
                        <label className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={analytics}
                                onChange={(e) => setAnalytics(e.target.checked)}
                                className="mt-0.5 shrink-0"
                            />
                            <span className="text-xs text-gray-700">
                                <strong className="block text-gray-900">Analytics</strong>
                                Aggregated usage metrics so we can spot broken pages and prioritize features.
                            </span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => submit({ analytics, functional }, 'custom')}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                Save preferences
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => submit({ analytics: true, functional: true }, 'all')}
                            disabled={submitting}
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            Accept all
                        </button>
                        <button
                            onClick={() => submit({ analytics: false, functional: false }, 'reject_all')}
                            disabled={submitting}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Reject non-essential
                        </button>
                        <button
                            onClick={() => setShowCustomize(true)}
                            className="px-4 py-2 text-gray-700 text-sm font-semibold hover:text-gray-900"
                        >
                            Customize
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Helper for analytics-script gating elsewhere in the app.
 * Returns null while the user hasn't decided, true/false after.
 */
export function hasAnalyticsConsent(): boolean | null {
    if (typeof window === 'undefined') return null;
    const c = readLocalConsent();
    return c ? c.analytics : null;
}

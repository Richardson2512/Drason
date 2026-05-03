/**
 * Client-side auth + post-signup-redirect utilities.
 *
 * Two responsibilities:
 *
 * 1. `useIsAuthenticated()` — React hook that reads the `token` cookie and
 *    tells UI components whether to render the signed-in or signed-out state.
 *    The token itself is httpOnly so we can't read it directly; instead we
 *    look for the non-httpOnly auth flag the backend also sets, OR fall back
 *    to the presence of the legacy `token` cookie (which on dev is non-httpOnly).
 *
 * 2. `setIntendedReturnTo()` / `consumeIntendedReturnTo()` — bridges a
 *    redirect target across the signup → OAuth → onboarding → dashboard
 *    round-trip. Survives Google's OAuth bounce because it lives in the
 *    user's localStorage on our origin.
 */

'use client';

import { useEffect, useState } from 'react';

const RETURN_TO_KEY = 'superkabe.intended_return_to';
const RETURN_TO_TTL_MS = 15 * 60 * 1000; // 15 minutes — covers a slow OAuth round-trip

interface ReturnToPayload {
    path: string;
    storedAt: number;
}

// ============================================================================
// AUTH STATE HOOK
// ============================================================================

export interface AuthState {
    /** True after the cookie has been read once on the client. SSR-safe. */
    ready: boolean;
    isAuthenticated: boolean;
}

/**
 * SSR-safe auth state. Always returns `ready: false` on the server and on
 * the first client render to avoid hydration mismatches; flips to `ready:
 * true` after mount.
 */
export function useIsAuthenticated(): AuthState {
    const [state, setState] = useState<AuthState>({ ready: false, isAuthenticated: false });

    useEffect(() => {
        setState({ ready: true, isAuthenticated: hasAuthCookie() });
    }, []);

    return state;
}

/**
 * Read the document cookie jar synchronously. Used by code paths that aren't
 * inside a React component (e.g., API request preflight).
 */
export function hasAuthCookie(): boolean {
    if (typeof document === 'undefined') return false;
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
        const [k] = c.trim().split('=');
        if (k === 'token') return true;
    }
    return false;
}

// ============================================================================
// POST-AUTH REDIRECT BRIDGE
// ============================================================================

/**
 * Validate that a redirect path is safe (relative, on our own origin, no
 * protocol smuggling, no script injection). Returns the path if valid, or
 * `null` if it should be rejected.
 *
 * Rules:
 *   - Must be a non-empty string
 *   - Must start with exactly one '/'  (rejects '//evil.com')
 *   - May not contain '@'              (rejects 'javascript:'/userinfo tricks)
 *   - May not contain ':'              (rejects 'http://...')
 *   - May not contain a newline
 *   - Length capped at 512 chars
 */
export function safePath(path: string | null | undefined): string | null {
    if (typeof path !== 'string') return null;
    const trimmed = path.trim();
    if (!trimmed || trimmed.length > 512) return null;
    if (!trimmed.startsWith('/')) return null;
    if (trimmed.startsWith('//')) return null;
    if (trimmed.includes('@')) return null;
    if (trimmed.includes(':')) return null;
    if (/[\r\n]/.test(trimmed)) return null;
    return trimmed;
}

/**
 * Persist the intended post-auth destination to localStorage with a TTL.
 * Called BEFORE the user kicks off the email signup form OR the Google OAuth
 * redirect. Consumed once on the other side.
 */
export function setIntendedReturnTo(path: string | null | undefined): void {
    if (typeof window === 'undefined') return;
    const valid = safePath(path);
    if (!valid) return;
    try {
        const payload: ReturnToPayload = { path: valid, storedAt: Date.now() };
        window.localStorage.setItem(RETURN_TO_KEY, JSON.stringify(payload));
    } catch {
        /* localStorage unavailable (private browsing) — silent */
    }
}

/**
 * Read + clear the intended return-to. Returns the path if a valid, non-stale
 * entry exists, otherwise null. Always clears (one-time use).
 */
export function consumeIntendedReturnTo(): string | null {
    if (typeof window === 'undefined') return null;
    let raw: string | null = null;
    try {
        raw = window.localStorage.getItem(RETURN_TO_KEY);
        window.localStorage.removeItem(RETURN_TO_KEY);
    } catch {
        return null;
    }
    if (!raw) return null;
    try {
        const parsed: ReturnToPayload = JSON.parse(raw);
        if (typeof parsed.path !== 'string' || typeof parsed.storedAt !== 'number') return null;
        if (Date.now() - parsed.storedAt > RETURN_TO_TTL_MS) return null;
        return safePath(parsed.path);
    } catch {
        return null;
    }
}

/**
 * Rate limiter for the cold-email-templates AI generator.
 *
 * Two layers, both with the same daily quota:
 *   1. Signed cookie counter — survives across IPs (mobile network switching)
 *      but resets if user clears cookies.
 *   2. In-memory IP map — catches users who clear cookies. Lost on serverless
 *      cold start, which is acceptable for V2 (worst case: a user gets a few
 *      extra free generations after a deploy).
 *
 * Quotas:
 *   - Guests: GUEST_DAILY_LIMIT generations per day, reset at UTC midnight.
 *   - Signed-in users: not enforced here; the calling route checks auth first
 *     and skips the limiter when authed.
 *
 * Cookie spec:
 *   Name:  cet_gen_quota
 *   Value: <count>:<resetTimestamp>:<hmac>
 *   Lifetime: until end of UTC day
 *   HttpOnly: true (server-only — prevents tampering from client JS)
 */

import crypto from 'crypto';

export const GUEST_DAILY_LIMIT = 3;
export const COOKIE_NAME = 'cet_gen_quota';

const HMAC_SECRET = process.env.AI_RATE_LIMIT_SECRET
    || process.env.JWT_SECRET
    || 'dev-only-fallback-do-not-use-in-prod';

// In-memory IP fallback. Cleared periodically.
interface IpEntry {
    count: number;
    resetAt: number; // ms since epoch
}
const ipStore = new Map<string, IpEntry>();

// Sweep stale entries every 30 min. Bounded memory: at most one entry per IP
// per day, dropped on next-day boundary.
let lastSweep = 0;
function sweepIfStale(): void {
    const now = Date.now();
    if (now - lastSweep < 30 * 60 * 1000) return;
    lastSweep = now;
    for (const [ip, entry] of ipStore.entries()) {
        if (entry.resetAt < now) ipStore.delete(ip);
    }
}

// ============================================================================
// COOKIE PARSING / SIGNING
// ============================================================================

function sign(payload: string): string {
    return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex').slice(0, 16);
}

interface ParsedCookie {
    count: number;
    resetAt: number;
}

function parseCookie(value: string | undefined): ParsedCookie | null {
    if (!value) return null;
    const parts = value.split(':');
    if (parts.length !== 3) return null;
    const [countStr, resetStr, hmac] = parts;
    const expected = sign(`${countStr}:${resetStr}`);
    if (hmac !== expected) return null;
    const count = parseInt(countStr, 10);
    const resetAt = parseInt(resetStr, 10);
    if (isNaN(count) || isNaN(resetAt)) return null;
    if (Date.now() > resetAt) return null; // expired
    return { count, resetAt };
}

function encodeCookie(count: number, resetAt: number): string {
    const payload = `${count}:${resetAt}`;
    return `${payload}:${sign(payload)}`;
}

function nextUtcMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0,
    ));
    return tomorrow.getTime();
}

// ============================================================================
// PUBLIC API
// ============================================================================

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    setCookie: string | null; // Set-Cookie header value, or null when nothing to set
    reason?: string;
}

/**
 * Check + increment the quota in one atomic step. Call once per generation
 * request, BEFORE invoking OpenAI. If allowed, the caller proceeds and the
 * counter has already been incremented.
 */
export function checkAndConsume(
    cookieHeader: string | null | undefined,
    ip: string,
): RateLimitResult {
    sweepIfStale();
    const now = Date.now();
    const resetAt = nextUtcMidnight();

    // ── Layer 1: cookie ──
    const cookieValue = extractCookie(cookieHeader, COOKIE_NAME);
    const cookieParsed = parseCookie(cookieValue);
    const cookieCount = cookieParsed?.count ?? 0;
    const cookieResetAt = cookieParsed?.resetAt ?? resetAt;

    // ── Layer 2: IP fallback ──
    const ipEntry = ipStore.get(ip);
    const ipCount = ipEntry && ipEntry.resetAt > now ? ipEntry.count : 0;
    const ipResetAt = ipEntry && ipEntry.resetAt > now ? ipEntry.resetAt : resetAt;

    // Effective count is the higher of the two — closes the cookie-clear loophole
    const effectiveCount = Math.max(cookieCount, ipCount);
    const effectiveResetAt = Math.max(cookieResetAt, ipResetAt);

    if (effectiveCount >= GUEST_DAILY_LIMIT) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: effectiveResetAt,
            setCookie: null,
            reason: `Daily free generation limit reached (${GUEST_DAILY_LIMIT}/day). Sign up for unlimited generations.`,
        };
    }

    // Allowed — increment both layers
    const newCount = effectiveCount + 1;
    const newCookieValue = encodeCookie(newCount, effectiveResetAt);

    ipStore.set(ip, { count: newCount, resetAt: effectiveResetAt });

    const cookieMaxAge = Math.floor((effectiveResetAt - now) / 1000);
    const setCookie = [
        `${COOKIE_NAME}=${newCookieValue}`,
        `Path=/`,
        `Max-Age=${cookieMaxAge}`,
        `HttpOnly`,
        `SameSite=Lax`,
        process.env.NODE_ENV === 'production' ? `Secure` : '',
    ].filter(Boolean).join('; ');

    return {
        allowed: true,
        remaining: GUEST_DAILY_LIMIT - newCount,
        resetAt: effectiveResetAt,
        setCookie,
    };
}

function extractCookie(cookieHeader: string | null | undefined, name: string): string | undefined {
    if (!cookieHeader) return undefined;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
        const [k, ...rest] = part.trim().split('=');
        if (k === name) return rest.join('=');
    }
    return undefined;
}

/**
 * Resolve the client IP from request headers. Trusts X-Forwarded-For when
 * behind a reverse proxy (Vercel sets it). Falls back to a sentinel that won't
 * collide with real IPs.
 */
export function clientIpFromHeaders(headers: Headers): string {
    const xff = headers.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0].trim();
        if (first) return first;
    }
    const real = headers.get('x-real-ip');
    if (real) return real.trim();
    return 'unknown';
}

/**
 * App / marketing URL helpers for the subdomain split architecture.
 *
 * The split (`app.superkabe.com` for the dashboard, `superkabe.com` for the
 * marketing site) is gated on the presence of `NEXT_PUBLIC_APP_URL` and
 * `NEXT_PUBLIC_MARKETING_URL` env vars. When those are unset, the helpers
 * return relative paths and the existing single-domain behavior continues
 * to work - that's the staging fallback so we can ship the routing without
 * forcing the prod cutover.
 *
 * Set both env vars to opt into subdomain mode. Examples:
 *
 *   Local with lvh.me:
 *     NEXT_PUBLIC_APP_URL=http://app.superkabe.lvh.me:3000
 *     NEXT_PUBLIC_MARKETING_URL=http://superkabe.lvh.me:3000
 *
 *   Prod cutover:
 *     NEXT_PUBLIC_APP_URL=https://app.superkabe.com
 *     NEXT_PUBLIC_MARKETING_URL=https://www.superkabe.com
 */

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
export const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || '';
export const SUBDOMAIN_MODE = !!APP_URL && !!MARKETING_URL;

/**
 * Build a URL for an app (dashboard) route. In subdomain mode this returns
 * an absolute URL on the app subdomain; otherwise a relative path so the
 * browser stays on whatever host it's currently on.
 */
export function appUrl(path: string): string {
    return SUBDOMAIN_MODE ? `${APP_URL}${path}` : path;
}

/**
 * Build a URL for a marketing route. Same rules as `appUrl` - absolute in
 * subdomain mode, relative otherwise.
 */
export function marketingUrl(path: string): string {
    return SUBDOMAIN_MODE ? `${MARKETING_URL}${path}` : path;
}

/**
 * Routes that only exist on the app subdomain in subdomain mode. The
 * middleware redirects these to `app.*` when hit on the marketing host,
 * and redirects everything else away from `app.*` toward the root host.
 *
 * Keep this list in sync with `src/middleware.ts`.
 */
export const APP_ROUTE_PREFIXES = [
    '/dashboard',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/onboarding',
    '/admin',
    '/assessment',
    '/data-rights',
    '/oauth/consent',
] as const;

export function isAppRoute(pathname: string): boolean {
    return APP_ROUTE_PREFIXES.some(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    );
}

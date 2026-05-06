import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Decode JWT payload without verification (middleware can't use jsonwebtoken).
 * We only need the role claim for routing — actual auth is verified by the backend.
 */
function decodeJwtPayload(token: string): { role?: string } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        return payload;
    } catch {
        return null;
    }
}

// Subdomain-split mode: when NEXT_PUBLIC_APP_URL + NEXT_PUBLIC_MARKETING_URL
// are configured, the dashboard lives on `app.<domain>` and marketing lives
// on the root. Without those env vars we fall back to single-domain mode
// (the original behavior), so this code is safe to ship before any DNS or
// Vercel cutover. Match strings stripped to host-only — env vars may be
// `https://app.superkabe.com` or `http://app.superkabe.lvh.me:3000`.
const APP_URL_ENV = process.env.NEXT_PUBLIC_APP_URL || '';
const MARKETING_URL_ENV = process.env.NEXT_PUBLIC_MARKETING_URL || '';
const SUBDOMAIN_MODE = !!APP_URL_ENV && !!MARKETING_URL_ENV;

const APP_HOST = (() => {
    if (!APP_URL_ENV) return '';
    try { return new URL(APP_URL_ENV).host; } catch { return ''; }
})();
const MARKETING_HOST = (() => {
    if (!MARKETING_URL_ENV) return '';
    try { return new URL(MARKETING_URL_ENV).host; } catch { return ''; }
})();

// Routes that must live on the app subdomain. Keep in sync with
// APP_ROUTE_PREFIXES in src/lib/urls.ts.
const APP_ROUTE_PREFIXES = [
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
];

function isAppRoute(pathname: string): boolean {
    return APP_ROUTE_PREFIXES.some(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    );
}

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';

    // 0. Redirect non-www to www (301 permanent) — only in non-subdomain
    // mode. In subdomain mode the marketing host is configured explicitly
    // by NEXT_PUBLIC_MARKETING_URL, so this rewrite would conflict.
    if (!SUBDOMAIN_MODE && host === 'superkabe.com') {
        const url = request.nextUrl.clone();
        url.host = 'www.superkabe.com';
        url.protocol = 'https';
        return NextResponse.redirect(url, 301);
    }

    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Define Static and Public assets
    const isStaticFile = pathname.includes('.') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml';

    if (isStaticFile) return NextResponse.next();

    // 1b. Subdomain-mode host routing — bounce mismatches to the right
    // subdomain BEFORE any auth/role checks below. This way a user who
    // bookmarks `superkabe.com/dashboard` ends up on `app.superkabe.com/
    // dashboard`, and someone who navigates to `app.superkabe.com/blog`
    // ends up back on the marketing site.
    if (SUBDOMAIN_MODE) {
        const onApp = host === APP_HOST;
        const onMarketing = host === MARKETING_HOST;
        const wantsApp = isAppRoute(pathname);

        if (wantsApp && !onApp) {
            return NextResponse.redirect(`${APP_URL_ENV}${pathname}${request.nextUrl.search}`);
        }
        if (!wantsApp && onApp) {
            // Bare `/` on the app subdomain: prefer the user's session
            // landing (dashboard if logged in, login otherwise) over a
            // round-trip to the marketing home. Anything else under the
            // app host is a marketing-only page that doesn't belong here.
            if (pathname === '/') {
                const target = token ? '/dashboard' : '/login';
                return NextResponse.redirect(new URL(target, request.url));
            }
            return NextResponse.redirect(`${MARKETING_URL_ENV}${pathname}${request.nextUrl.search}`);
        }
        // In subdomain mode but on the right host — fall through to the
        // existing auth-aware logic below. We deliberately don't gate the
        // single-domain redirects (steps 3-6 below) on host: if you're on
        // app.* hitting /login, the existing rules still apply.
        if (!onApp && !onMarketing) {
            // Host doesn't match either configured URL — likely a preview
            // domain or an alias. Best-effort: don't redirect. Let the
            // current host serve everything (single-domain behavior).
        }
    }

    // 2. Define Public Pages
    const isPublicPage =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/onboarding' ||
        pathname === '/oauth/consent' ||
        pathname === '/pricing' ||
        pathname.startsWith('/blog') ||
        pathname === '/privacy' ||
        pathname === '/terms' ||
        pathname.startsWith('/docs') ||
        pathname.startsWith('/product') ||
        pathname === '/infrastructure-playbook' ||
        pathname === '/open-source' ||
        pathname === '/contact' ||
        pathname === '/testimonials' ||
        pathname.startsWith('/release-notes') ||
        pathname.startsWith('/guides') ||
        pathname.startsWith('/tools') ||
        pathname.startsWith('/cold-email-templates');

    // Decode role from JWT (without verification — backend handles real auth)
    const jwtPayload = token ? decodeJwtPayload(token) : null;
    const isSuperAdmin = jwtPayload?.role === 'super_admin';

    // 3. Authenticated users trying to access login/signup -> Redirect
    if (token && (pathname === '/login' || pathname === '/signup')) {
        // Super admin always goes to /admin, regular users go to /dashboard
        return NextResponse.redirect(new URL(isSuperAdmin ? '/admin' : '/dashboard', request.url));
    }

    // 4. Super admin trying to access /dashboard -> Redirect to /admin
    if (token && isSuperAdmin && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 5. Regular user trying to access /admin -> Redirect to /dashboard
    if (token && !isSuperAdmin && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 6. Unauthenticated users trying to access restricted areas -> Redirect to Landing (/)
    if (!token && !isPublicPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

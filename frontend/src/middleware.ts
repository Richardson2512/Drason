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

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';

    // 0. Redirect non-www to www (301 permanent)
    if (host === 'superkabe.com') {
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

    // 2. Define Public Pages
    const isPublicPage =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/pricing' ||
        pathname.startsWith('/blog') ||
        pathname === '/privacy' ||
        pathname === '/terms' ||
        pathname.startsWith('/docs') ||
        pathname.startsWith('/product') ||
        pathname === '/infrastructure-playbook' ||
        pathname === '/open-source' ||
        pathname === '/contact' ||
        pathname.startsWith('/release-notes') ||
        pathname.startsWith('/guides') ||
        pathname.startsWith('/tools');

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

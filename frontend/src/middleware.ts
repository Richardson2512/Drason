import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
        pathname.startsWith('/product');

    // 3. Authenticated users trying to access login/signup -> Redirect to Dashboard
    if (token && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 4. Unauthenticated users trying to access restricted areas (like /dashboard) -> Redirect to Landing (/)
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

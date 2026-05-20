/**
 * Internal link checker - regression-proofs against the kind of 404s
 * Ahrefs surfaced in the 14-may-2026 crawl (the 7 internal 404s that
 * were linked from real blog pages and pointed at slugs that did not
 * exist on disk).
 *
 * The check is small on purpose: it does NOT try to be a full link
 * checker (lychee, broken-link-checker, etc. are better for that). It
 * answers one specific question - do every internal `/path` referenced
 * from the App-Router tree resolve to a real route?
 *
 * Run via `pnpm tsx scripts/check-internal-links.ts` (no build step
 * needed). Exits 0 when clean, 1 with a list of broken links otherwise.
 * Wire it into the CI workflow (.github/workflows/ci.yml) so a stale
 * cross-link in a blog post fails the PR before merge.
 */

import fs from 'node:fs';
import path from 'node:path';
import { productPages } from '../src/data/productPages';

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'src', 'app');

/**
 * Routes that exist because of dynamic [slug] segments + data-driven
 * static-generation. We resolve them from the same source the
 * sitemap uses so they stay in sync with the actual rendered routes.
 */
function dynamicRoutes(): Set<string> {
    const set = new Set<string>();
    // Product pages - sourced from productPages.ts to mirror the
    // sitemap generator's behavior.
    for (const slug of Object.keys(productPages)) {
        set.add(`/product/${slug}`);
    }
    return set;
}

/**
 * Walk src/app and collect every page-bearing route. The convention:
 * a directory contains `page.tsx` => the directory path (relative to
 * src/app) is the route. Route groups in parens like `(home)` are
 * stripped per Next.js conventions.
 */
function staticRoutes(): Set<string> {
    const routes = new Set<string>();
    routes.add('/'); // home

    function walk(dir: string, urlSegments: string[]) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        if (entries.some((e) => e.isFile() && e.name === 'page.tsx')) {
            // Build the URL by skipping route groups and dynamic [slug]
            // segments (dynamic ones are handled by dynamicRoutes()).
            const cleaned = urlSegments
                .filter((s) => !s.startsWith('(') && !s.startsWith('['))
                .join('/');
            routes.add('/' + cleaned);
        }
        for (const e of entries) {
            if (e.isDirectory()) {
                walk(path.join(dir, e.name), [...urlSegments, e.name]);
            }
        }
    }

    walk(APP_DIR, []);
    return routes;
}

/**
 * Collect every internal /path string referenced via href="/..." or
 * href={`/...`} or Link href="/..." inside the source tree. False
 * positives are fine - the validator just checks each path exists.
 */
function referencedPaths(): Map<string, string[]> {
    const refs = new Map<string, string[]>();

    function walk(dir: string) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (e.name === 'node_modules' || e.name === '.next') continue;
                walk(full);
            } else if (e.isFile() && /\.(tsx?|mdx?)$/.test(e.name)) {
                const src = fs.readFileSync(full, 'utf8');
                // Match href="/..." and href={"/..."} - skip
                // protocol-relative and absolute URLs.
                const re = /href=(?:"|\{["'`])(\/[^"'`?#}\s]*)["'`]?/g;
                let m: RegExpExecArray | null;
                while ((m = re.exec(src))) {
                    const p = m[1];
                    if (p === '/') continue;
                    if (!refs.has(p)) refs.set(p, []);
                    refs.get(p)!.push(path.relative(ROOT, full));
                }
            }
        }
    }

    walk(path.join(ROOT, 'src'));
    return refs;
}

/**
 * Routes outside src/app (API handlers, redirects via next.config) that
 * the validator should treat as existing without inspecting them.
 */
const ALLOWLIST = new Set<string>([
    '/api/auth', // any /api/* endpoint - validator does not crawl API handlers
    '/signup',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/set-password',
    '/verify-email',
    '/oauth',
    '/admin',
    '/dashboard',
    '/onboarding',
]);

function isAllowlisted(p: string): boolean {
    if (ALLOWLIST.has(p)) return true;
    // /api/* and /dashboard/* deep links are accepted - the validator
    // does not own knowledge of the dashboard route tree.
    if (p.startsWith('/api/')) return true;
    if (p.startsWith('/dashboard/')) return true;
    if (p.startsWith('/onboarding/')) return true;
    if (p.startsWith('/admin/')) return true;
    return false;
}

function main(): number {
    const known = new Set<string>([...staticRoutes(), ...dynamicRoutes()]);
    const refs = referencedPaths();

    const broken: { route: string; sources: string[] }[] = [];
    for (const [route, sources] of refs) {
        if (isAllowlisted(route)) continue;
        if (known.has(route)) continue;
        // Trailing-slash tolerance
        if (known.has(route.replace(/\/$/, ''))) continue;
        broken.push({ route, sources: [...new Set(sources)] });
    }

    if (broken.length === 0) {
        console.log(`OK - ${refs.size} internal references checked, ${known.size} known routes.`);
        return 0;
    }

    console.error(`FAIL - ${broken.length} internal link${broken.length === 1 ? '' : 's'} point at routes that do not exist:\n`);
    for (const b of broken.sort((a, b) => a.route.localeCompare(b.route))) {
        console.error(`  ${b.route}`);
        for (const s of b.sources.slice(0, 5)) {
            console.error(`    - ${s}`);
        }
        if (b.sources.length > 5) {
            console.error(`    ... and ${b.sources.length - 5} more`);
        }
    }
    console.error(`\nFix: either create the missing page or update the source links to point at an existing route.`);
    return 1;
}

process.exit(main());

import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { releaseNotes } from '@/data/releaseNotes';
import { TEMPLATES as COLD_EMAIL_TEMPLATES } from '@/data/coldEmailTemplates';

const BASE_URL = 'https://www.superkabe.com';

/**
 * Get the last modified time of a page file.
 * Falls back to current date if the file doesn't exist.
 */
function getPageMtime(routePath: string): Date {
    // Map route path to file system path
    // e.g. '/' → 'src/app/(home)/page.tsx', '/pricing' → 'src/app/pricing/page.tsx'
    const routeMap: Record<string, string> = {
        '/': '(home)',
        '/pricing': 'pricing',
        '/privacy': 'privacy',
        '/terms': 'terms',
        '/open-source': 'open-source',
        '/infrastructure-playbook': 'infrastructure-playbook',
        '/product': 'product',
        '/contact': 'contact',
        '/release-notes': 'release-notes',
    };

    const dir = routeMap[routePath];
    if (!dir) return new Date();

    const pagePath = path.join(process.cwd(), 'src', 'app', dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        return fs.statSync(pagePath).mtime;
    }
    return new Date();
}

/**
 * Dynamically scans a directory under src/app for page.tsx files
 * and returns sitemap entries for each discovered route.
 */
function discoverRoutes(
    directory: string,
    basePath: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number
): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = [];
    const appDir = path.join(process.cwd(), 'src', 'app', directory);

    if (!fs.existsSync(appDir)) return entries;

    function scanDir(dir: string, urlPrefix: string, depth: number) {
        // Check if this directory has a page.tsx
        const pagePath = path.join(dir, 'page.tsx');
        if (fs.existsSync(pagePath)) {
            const stats = fs.statSync(pagePath);
            entries.push({
                url: `${BASE_URL}${urlPrefix}`,
                lastModified: stats.mtime,
                changeFrequency,
                priority: Math.round(Math.max(priority - depth * 0.1, 0.5) * 10) / 10,
            });
        }

        // Recursively scan subdirectories
        const subdirs = fs.readdirSync(dir, { withFileTypes: true });
        for (const dirent of subdirs) {
            if (dirent.isDirectory()) {
                scanDir(
                    path.join(dir, dirent.name),
                    `${urlPrefix}/${dirent.name}`,
                    depth + 1
                );
            }
        }
    }

    scanDir(appDir, `/${directory}`, 0);
    return entries;
}

/**
 * Get the last modified time for a product/[slug] page.
 * Uses the dynamic page template file and the product data source.
 */
function getProductPageMtime(): Date {
    const templatePath = path.join(process.cwd(), 'src', 'app', 'product', '[slug]', 'page.tsx');
    const dataPath = path.join(process.cwd(), 'src', 'data', 'productPages.ts');

    // Use the more recently modified of the template or data file
    let latest = new Date(0);
    for (const p of [templatePath, dataPath]) {
        if (fs.existsSync(p)) {
            const mtime = fs.statSync(p).mtime;
            if (mtime > latest) latest = mtime;
        }
    }
    return latest > new Date(0) ? latest : new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
    const productMtime = getProductPageMtime();

    return [
        // ─── Core Pages ───────────────────────────────
        {
            url: BASE_URL,
            lastModified: getPageMtime('/'),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: getPageMtime('/pricing'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },

        // ─── Contact & Release Notes ────────────────────
        {
            url: `${BASE_URL}/contact`,
            lastModified: getPageMtime('/contact'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/release-notes`,
            lastModified: getPageMtime('/release-notes'),
            changeFrequency: 'weekly',
            priority: 0.6,
        },

        // ─── Individual Release Notes (auto-generated from data) ──
        ...releaseNotes.map(note => ({
            url: `${BASE_URL}/release-notes/${note.slug}`,
            lastModified: new Date(note.isoDate),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        })),

        // ─── Legal ────────────────────────────────────
        {
            url: `${BASE_URL}/privacy`,
            lastModified: getPageMtime('/privacy'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: getPageMtime('/terms'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },

        // ─── Cold Email Templates (hub) ──────────────
        {
            url: `${BASE_URL}/cold-email-templates`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },

        // ─── Cold Email Templates (AI generator) ─────
        {
            url: `${BASE_URL}/cold-email-templates/generate`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        },

        // ─── Cold Email Templates (individual, data-driven) ─
        ...COLD_EMAIL_TEMPLATES.map((t) => ({
            url: `${BASE_URL}/cold-email-templates/${t.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),

        // ─── Free Tools (auto-discovered) ────────────
        ...discoverRoutes('tools', '/tools', 'weekly', 0.8),

        // ─── Documentation (auto-discovered) ──────────
        ...discoverRoutes('docs', '/docs', 'weekly', 0.8),

        // ─── Blog (auto-discovered) ───────────────────
        ...discoverRoutes('blog', '/blog', 'weekly', 0.7),

        // ─── Authority Guides (auto-discovered) ──────────
        ...discoverRoutes('guides', '/guides', 'weekly', 0.9),

        // ─── Manifestos & Playbooks ───────────────────
        {
            url: `${BASE_URL}/open-source`,
            lastModified: getPageMtime('/open-source'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/infrastructure-playbook`,
            lastModified: getPageMtime('/infrastructure-playbook'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/product`,
            lastModified: getPageMtime('/product'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },

        // ─── Auto-Generated SEO & Case Study Pages ────
        ...[
            'email-deliverability-protection',
            'what-is-email-deliverability-protection',
            'sender-reputation-protection-tool',
            'how-to-protect-sender-reputation',
            'b2b-sender-reputation-management',
            'domain-burnout-prevention-tool',
            'how-to-prevent-domain-burnout',
            'automated-domain-healing',
            'outbound-domain-protection',
            'email-infrastructure-protection',
            'cold-email-infrastructure-protection',
            'outbound-email-infrastructure-monitoring',
            'email-infrastructure-health-check',
            'bounce-rate-protection-system',
            'sender-reputation-monitoring',
            'automated-bounce-management',
            'smartlead-infrastructure-protection',
            'smartlead-deliverability-protection',
            'instantly-infrastructure-protection',
            'reply-io-deliverability-protection',
            'emailbison-infrastructure-protection',
            'multi-platform-outbound-protection',
            'case-study-domain-recovery',
            'case-study-bounce-reduction',
            'case-study-infrastructure-protection',
            'email-validation-infrastructure-protection',
            'multi-platform-email-validation',
            // ─── Sequencer Capability Pages (2026-04-24) ─────────
            'ai-cold-email-sequences',
            'esp-aware-sending-health-gate',
            'unlimited-multi-mailbox-sending',
            'cold-email-sending-analytics',
        ].map(slug => ({
            url: `${BASE_URL}/product/${slug}`,
            lastModified: productMtime,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        })),
    ];
}

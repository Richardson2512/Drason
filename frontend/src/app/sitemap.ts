import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.superkabe.com';

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

    // Check if the directory itself has a page.tsx (index page)
    const indexPage = path.join(appDir, 'page.tsx');
    if (fs.existsSync(indexPage)) {
        const stats = fs.statSync(indexPage);
        entries.push({
            url: `${BASE_URL}/${directory}`,
            lastModified: stats.mtime,
            changeFrequency,
            priority,
        });
    }

    // Scan subdirectories for page.tsx
    const subdirs = fs.readdirSync(appDir, { withFileTypes: true });
    for (const dirent of subdirs) {
        if (dirent.isDirectory()) {
            const subPagePath = path.join(appDir, dirent.name, 'page.tsx');
            if (fs.existsSync(subPagePath)) {
                const stats = fs.statSync(subPagePath);
                entries.push({
                    url: `${BASE_URL}/${directory}/${dirent.name}`,
                    lastModified: stats.mtime,
                    changeFrequency,
                    priority: Math.max(priority - 0.1, 0.5),
                });
            }
        }
    }

    return entries;
}

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        // ─── Core Pages ───────────────────────────────
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },

        // ─── Legal ────────────────────────────────────
        {
            url: `${BASE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },

        // ─── Documentation (auto-discovered) ──────────
        ...discoverRoutes('docs', '/docs', 'weekly', 0.8),

        // ─── Blog (auto-discovered) ───────────────────
        ...discoverRoutes('blog', '/blog', 'weekly', 0.7),

        // ─── Manifestos & Playbooks ───────────────────
        {
            url: `${BASE_URL}/open-source`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/infrastructure-playbook`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/product`,
            lastModified: new Date(),
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
        ].map(slug => ({
            url: `${BASE_URL}/product/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        })),
    ];
}

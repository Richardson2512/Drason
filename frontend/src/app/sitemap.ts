import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.drason.com';

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
    ];
}

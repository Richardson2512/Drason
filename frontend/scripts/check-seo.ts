/**
 * SEO metadata + link-rot checker - companion to check-internal-links.ts.
 *
 * Catches three classes of regression Ahrefs flagged in the 14-may-2026
 * crawl that internal-link validation cannot:
 *
 * 1. Overlong <title> tags (>60 chars). Google truncates beyond ~60ch
 *    on desktop SERPs; the meta still ranks but the display loses
 *    its qualifier.
 * 2. Overlong <meta description> (>160 chars). Same display-truncation
 *    behavior - text past the limit is not shown.
 * 3. External link rot. A small denylist of URLs we have already
 *    cleaned up; the check guarantees they never come back via
 *    copy-paste from an older doc or a recently-merged PR.
 *
 * Run: `pnpm tsx scripts/check-seo.ts`
 * Exit 0 = clean. Exit 1 = at least one regression.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'src', 'app');
const SRC_DIR = path.join(ROOT, 'src');

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

/**
 * URLs we have already migrated away from. Each one used to live in the
 * codebase and pointed at a 3xx redirect, a 4xx error, or a defunct host.
 * Adding a new entry here makes the next PR that re-introduces it fail
 * the CI gate.
 */
const ROTTEN_URLS: { needle: string; reason: string; replacement: string }[] = [
    {
        needle: 'https://www.spamhaus.org/lookup/',
        reason: '301-redirects to check.spamhaus.org',
        replacement: 'https://check.spamhaus.org/',
    },
    {
        needle: 'https://www.emailbison.com',
        reason: '301-redirects to apex emailbison.com',
        replacement: 'https://emailbison.com',
    },
    {
        needle: "'https://neverbounce.com'",
        reason: '301-redirects to www.neverbounce.com/',
        replacement: "'https://www.neverbounce.com/'",
    },
    {
        needle: '"https://neverbounce.com"',
        reason: '301-redirects to www.neverbounce.com/',
        replacement: '"https://www.neverbounce.com/"',
    },
];

interface MetaIssue {
    file: string;
    kind: 'title' | 'description';
    length: number;
    text: string;
}

interface RotIssue {
    file: string;
    needle: string;
    reason: string;
    replacement: string;
}

function extractMetadata(content: string): { title?: string; description?: string } {
    const idx = content.indexOf('export const metadata');
    if (idx < 0) return {};
    const slice = content.slice(idx, idx + 3000);
    const out: { title?: string; description?: string } = {};
    // Quoted with either ' or " - stop at the closing quote that is
    // followed by a comma (the canonical metadata-export shape).
    const titleMatch = slice.match(/^\s*title:\s*(['"])(.*?)\1,/m);
    if (titleMatch) out.title = titleMatch[2];
    const descMatch = slice.match(/^\s*description:\s*(['"])(.*?)\1,/m);
    if (descMatch) out.description = descMatch[2];
    return out;
}

function walkPageTsx(): string[] {
    const files: string[] = [];
    function walk(dir: string) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) walk(full);
            else if (e.isFile() && e.name === 'page.tsx') files.push(full);
        }
    }
    walk(APP_DIR);
    return files;
}

function walkAllSource(): string[] {
    const files: string[] = [];
    function walk(dir: string) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (e.name === 'node_modules' || e.name === '.next') continue;
                walk(full);
            } else if (e.isFile() && /\.(tsx?|mdx?|json)$/.test(e.name)) {
                // Skip the checker file itself - it intentionally
                // contains the rotten URLs in its denylist.
                if (full.includes(path.join('scripts', 'check-seo'))) continue;
                files.push(full);
            }
        }
    }
    walk(SRC_DIR);
    return files;
}

function main(): number {
    const metaIssues: MetaIssue[] = [];
    for (const file of walkPageTsx()) {
        const content = fs.readFileSync(file, 'utf8');
        const meta = extractMetadata(content);
        const rel = path.relative(ROOT, file);
        if (meta.title && meta.title.length > TITLE_LIMIT) {
            metaIssues.push({ file: rel, kind: 'title', length: meta.title.length, text: meta.title });
        }
        if (meta.description && meta.description.length > DESCRIPTION_LIMIT) {
            metaIssues.push({ file: rel, kind: 'description', length: meta.description.length, text: meta.description });
        }
    }

    const rotIssues: RotIssue[] = [];
    for (const file of walkAllSource()) {
        const content = fs.readFileSync(file, 'utf8');
        for (const r of ROTTEN_URLS) {
            if (content.includes(r.needle)) {
                rotIssues.push({ file: path.relative(ROOT, file), needle: r.needle, reason: r.reason, replacement: r.replacement });
            }
        }
    }

    if (metaIssues.length === 0 && rotIssues.length === 0) {
        console.log(`OK - all titles <=${TITLE_LIMIT}ch, descriptions <=${DESCRIPTION_LIMIT}ch, no rotten URLs.`);
        return 0;
    }

    if (metaIssues.length > 0) {
        console.error(`\nFAIL - ${metaIssues.length} metadata violation${metaIssues.length === 1 ? '' : 's'}:\n`);
        for (const i of metaIssues.sort((a, b) => b.length - a.length)) {
            console.error(`  [${i.kind}] ${i.length}ch  ${i.file}`);
            console.error(`    "${i.text.slice(0, 100)}${i.text.length > 100 ? '...' : ''}"`);
        }
        console.error(`\nFix: shorten title to <=${TITLE_LIMIT}ch and description to <=${DESCRIPTION_LIMIT}ch in the metadata export.`);
    }

    if (rotIssues.length > 0) {
        console.error(`\nFAIL - ${rotIssues.length} rotten URL reference${rotIssues.length === 1 ? '' : 's'}:\n`);
        for (const i of rotIssues) {
            console.error(`  ${i.file}`);
            console.error(`    found:    ${i.needle}`);
            console.error(`    reason:   ${i.reason}`);
            console.error(`    fix:      ${i.replacement}`);
        }
        console.error(`\nFix: replace each rotten URL with its canonical replacement (or update the ROTTEN_URLS denylist in scripts/check-seo.ts if the URL is intentional).`);
    }

    return 1;
}

process.exit(main());

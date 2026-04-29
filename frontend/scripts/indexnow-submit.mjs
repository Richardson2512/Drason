#!/usr/bin/env node
/**
 * IndexNow Submission Script — bulk sitemap push
 *
 * Submits every URL from the live sitemap to IndexNow, which fans out to Bing,
 * Yandex, Seznam, and Naver. Use after a deploy that adds/changes pages.
 *
 * Usage:
 *   npm run indexnow:submit
 *   # or directly:
 *   node scripts/indexnow-submit.mjs
 *
 * For ad-hoc single-URL pushes (e.g., a new blog post), use indexnow-ping.mjs
 * instead — it accepts URLs as CLI args.
 *
 * Verify in Bing Webmaster Tools → Reports & Data → IndexNow.
 *
 * Docs: https://www.indexnow.org/documentation
 */

// Canonical key — matches scripts/indexnow-ping.mjs. Both keys (78bc... and
// 8511...) are hosted at /public so either works; we use one consistently
// to avoid validation churn at Bing's end.
const INDEXNOW_KEY = '78bc8bebb2ef3ad68585dae3efab5578';
const SITE_HOST = 'www.superkabe.com';
const SITEMAP_URL = `https://${SITE_HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
// IndexNow protocol limit per request
const BATCH_SIZE = 10000;

async function fetchSitemapUrls() {
    const response = await fetch(SITEMAP_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: HTTP ${response.status} ${response.statusText}`);
    }
    const xml = await response.text();
    const urls = [];
    const regex = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        urls.push(match[1].trim());
    }
    return urls;
}

async function submitToIndexNow(urls) {
    let totalOk = 0;
    let totalFailed = 0;

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        console.log(`Submitting batch ${batchNum}: ${batch.length} URLs`);

        const payload = {
            host: SITE_HOST,
            key: INDEXNOW_KEY,
            keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
            urlList: batch,
        };

        try {
            const response = await fetch(INDEXNOW_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(payload),
            });

            if (response.status === 200) {
                console.log(`  ✓ Submitted (${batch.length} URLs)`);
                totalOk += batch.length;
            } else if (response.status === 202) {
                console.log(`  ✓ Accepted, validation pending (${batch.length} URLs)`);
                totalOk += batch.length;
            } else {
                const body = await response.text().catch(() => '');
                console.error(`  ✗ HTTP ${response.status} ${response.statusText}${body ? ` — ${body}` : ''}`);
                totalFailed += batch.length;
            }
        } catch (error) {
            console.error(`  ✗ Network error: ${error.message}`);
            totalFailed += batch.length;
        }
    }

    return { totalOk, totalFailed };
}

async function main() {
    console.log('IndexNow bulk sitemap submission');
    console.log(`  Host: ${SITE_HOST}`);
    console.log(`  Key:  ${INDEXNOW_KEY}`);
    console.log(`  Sitemap: ${SITEMAP_URL}`);
    console.log('');

    console.log('Fetching sitemap…');
    const urls = await fetchSitemapUrls();
    console.log(`Found ${urls.length} URLs\n`);

    if (urls.length === 0) {
        console.log('Nothing to submit.');
        return;
    }

    const { totalOk, totalFailed } = await submitToIndexNow(urls);

    console.log('');
    console.log(`Done. Submitted ${totalOk} OK, ${totalFailed} failed.`);
    console.log('Bing / Yandex / Seznam / Naver will be notified.');
    console.log('Check Bing Webmaster → Reports & Data → IndexNow for status.');

    if (totalFailed > 0) process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

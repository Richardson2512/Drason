/**
 * IndexNow Submission Script
 *
 * Submits all URLs from the sitemap to IndexNow (Bing, Yandex, Seznam, Naver).
 * Run after deployment: npx ts-node scripts/indexnow-submit.ts
 *
 * IndexNow protocol: when you submit to one participating search engine,
 * it shares the submission with all others. Submitting to api.indexnow.org
 * is the recommended single endpoint.
 *
 * Docs: https://www.indexnow.org/documentation
 */

const INDEXNOW_KEY = '8511765b705243d49565a9547294797c';
const SITE_HOST = 'www.superkabe.com';
const SITEMAP_URL = `https://${SITE_HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function fetchSitemapUrls(): Promise<string[]> {
    const response = await fetch(SITEMAP_URL);
    const xml = await response.text();

    // Extract URLs from <loc> tags
    const urls: string[] = [];
    const regex = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        urls.push(match[1]);
    }
    return urls;
}

async function submitToIndexNow(urls: string[]): Promise<void> {
    // IndexNow allows up to 10,000 URLs per request
    const batchSize = 10000;

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);

        console.log(`Submitting batch ${Math.floor(i / batchSize) + 1}: ${batch.length} URLs`);

        const payload = {
            host: SITE_HOST,
            key: INDEXNOW_KEY,
            keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
            urlList: batch,
        };

        try {
            const response = await fetch(INDEXNOW_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(payload),
            });

            const status = response.status;
            const statusText = response.statusText;

            if (status === 200) {
                console.log(`  ✓ Submitted successfully (${batch.length} URLs)`);
            } else if (status === 202) {
                console.log(`  ✓ Accepted, validation pending (${batch.length} URLs)`);
            } else {
                const body = await response.text().catch(() => '');
                console.error(`  ✗ Failed: HTTP ${status} ${statusText}`, body);
            }
        } catch (error: any) {
            console.error(`  ✗ Network error:`, error.message);
        }
    }
}

async function main() {
    console.log('IndexNow Submission');
    console.log(`Key: ${INDEXNOW_KEY}`);
    console.log(`Host: ${SITE_HOST}`);
    console.log('');

    // Fetch sitemap URLs
    console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
    const urls = await fetchSitemapUrls();
    console.log(`Found ${urls.length} URLs in sitemap\n`);

    if (urls.length === 0) {
        console.log('No URLs to submit.');
        return;
    }

    // Submit to IndexNow
    await submitToIndexNow(urls);

    console.log('\nDone. Bing, Yandex, Seznam, and Naver will be notified.');
    console.log('Check status at: https://www.bing.com/webmasters → Reports & Data → IndexNow');
}

main().catch(console.error);

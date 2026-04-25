#!/usr/bin/env node
/**
 * IndexNow submission for Bing / Yandex / Seznam / Naver.
 *
 * Key file lives at /public/78bc8bebb2ef3ad68585dae3efab5578.txt and is
 * served at https://www.superkabe.com/78bc8bebb2ef3ad68585dae3efab5578.txt
 *
 * Usage:
 *   node scripts/indexnow-ping.mjs <url1> <url2> ...
 *   node scripts/indexnow-ping.mjs --new-product-pages     # submit the 4 new pages
 *   node scripts/indexnow-ping.mjs --all-product-pages     # submit every product page
 */
const KEY = '78bc8bebb2ef3ad68585dae3efab5578';
const HOST = 'www.superkabe.com';
const BASE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const NEW_PRODUCT_SLUGS = [
    'ai-cold-email-sequences',
    'esp-aware-sending-health-gate',
    'unlimited-multi-mailbox-sending',
    'cold-email-sending-analytics',
];

function resolveUrls(args) {
    if (args.includes('--new-product-pages')) {
        return NEW_PRODUCT_SLUGS.map((s) => `${BASE}/product/${s}`);
    }
    if (args.includes('--all-product-pages')) {
        // Read sitemap.ts slug list inline — cheap duplication to avoid
        // pulling in the Next.js build.
        return [
            'email-deliverability-protection', 'what-is-email-deliverability-protection',
            'sender-reputation-protection-tool', 'how-to-protect-sender-reputation',
            'b2b-sender-reputation-management', 'domain-burnout-prevention-tool',
            'how-to-prevent-domain-burnout', 'automated-domain-healing',
            'outbound-domain-protection', 'email-infrastructure-protection',
            'cold-email-infrastructure-protection', 'outbound-email-infrastructure-monitoring',
            'email-infrastructure-health-check', 'bounce-rate-protection-system',
            'sender-reputation-monitoring', 'automated-bounce-management',
            'smartlead-infrastructure-protection', 'smartlead-deliverability-protection',
            'instantly-infrastructure-protection', 'reply-io-deliverability-protection',
            'emailbison-infrastructure-protection', 'multi-platform-outbound-protection',
            'case-study-domain-recovery', 'case-study-bounce-reduction',
            'case-study-infrastructure-protection', 'email-validation-infrastructure-protection',
            'multi-platform-email-validation',
            ...NEW_PRODUCT_SLUGS,
        ].map((s) => `${BASE}/product/${s}`);
    }
    return args.filter((a) => a.startsWith('http'));
}

async function main() {
    const urls = resolveUrls(process.argv.slice(2));
    if (urls.length === 0) {
        console.error('Usage: node scripts/indexnow-ping.mjs <url1> <url2> ... | --new-product-pages | --all-product-pages');
        process.exit(1);
    }

    const body = {
        host: HOST,
        key: KEY,
        keyLocation: `${BASE}/${KEY}.txt`,
        urlList: urls,
    };

    console.log(`→ Submitting ${urls.length} URLs to IndexNow…`);
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => '');
    console.log(`← ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
    if (!res.ok && res.status !== 202 && res.status !== 200) process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

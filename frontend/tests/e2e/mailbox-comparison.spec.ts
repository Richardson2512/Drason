/**
 * Mailbox comparison — E2E coverage for the protection analytics endpoint
 * powering the side-by-side mailbox UI. Returns both per-mailbox and
 * provider-bucket rollups in a single payload.
 */

import { test, expect, type Page } from '@playwright/test';

async function login(page: Page) {
    // globalSetup pre-authenticates via storageState; skip if cookie present.
    const cookies = await page.context().cookies();
    if (cookies.some(c => c.name === 'token')) return;
    const res = await page.request.post('/api/auth/login', {
        data: { email: 'demo@superkabe.com', password: 'demo1234' },
    });
    expect(res.status()).toBe(200);
}

test.describe('analytics — mailbox comparison', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('returns mailboxes + providers shape', async ({ page }) => {
        const res = await page.request.get('/api/analytics/mailbox-comparison?timeRange=30d');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data?.mailboxes)).toBe(true);
        expect(Array.isArray(json.data?.providers)).toBe(true);
        expect(json.data?.window).toBeTruthy();
    });

    test('per-mailbox rows carry health_score + rates', async ({ page }) => {
        const res = await page.request.get('/api/analytics/mailbox-comparison?timeRange=30d');
        const json = await res.json();
        for (const m of json.data.mailboxes) {
            expect(typeof m.health_score).toBe('number');
            expect(m.health_score >= 0 && m.health_score <= 100).toBe(true);
            expect(typeof m.reply_rate).toBe('number');
            expect(typeof m.bounce_rate).toBe('number');
            expect(typeof m.delivery_rate).toBe('number');
            expect(['google', 'microsoft', 'smtp']).toContain(m.provider);
        }
    });

    test('mailboxes sorted by health_score desc', async ({ page }) => {
        const res = await page.request.get('/api/analytics/mailbox-comparison?timeRange=30d');
        const json = await res.json();
        const scores = json.data.mailboxes.map((m: { health_score: number }) => m.health_score);
        for (let i = 1; i < scores.length; i++) {
            expect(scores[i] <= scores[i - 1]).toBe(true);
        }
    });

    test('provider rollup mailbox_count sums to total', async ({ page }) => {
        const res = await page.request.get('/api/analytics/mailbox-comparison?timeRange=30d');
        const json = await res.json();
        const providerSum = json.data.providers.reduce(
            (acc: number, p: { mailbox_count: number }) => acc + p.mailbox_count,
            0,
        );
        expect(providerSum).toBe(json.data.mailboxes.length);
    });

    test('provider rates equal sums-over-sums (volume-weighted, not avg of rates)', async ({ page }) => {
        const res = await page.request.get('/api/analytics/mailbox-comparison?timeRange=30d');
        const json = await res.json();
        for (const p of json.data.providers) {
            const expected = p.total_sent > 0
                ? parseFloat(((p.total_bounced / p.total_sent) * 100).toFixed(2))
                : 0;
            expect(p.bounce_rate).toBe(expected);
        }
    });

    test('start_date+end_date params accepted', async ({ page }) => {
        const res = await page.request.get('/api/analytics/mailbox-comparison?start_date=2026-04-01&end_date=2026-05-12');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
    });
});

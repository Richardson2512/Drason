/**
 * Mailbox performance analytics — E2E coverage for the new endpoint.
 *
 * Per-mailbox aggregates over the requested time range. Mirrors the
 * shape + behaviour of `/analytics/campaigns` so the FE consumer pattern
 * is identical.
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

test.describe('analytics — mailbox performance', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('GET /analytics/mailboxes returns array shape', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/analytics/mailboxes?timeRange=30d');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    test('every row carries the expected per-mailbox fields', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/analytics/mailboxes?timeRange=30d');
        const json = await res.json();
        for (const m of json.data) {
            expect(typeof m.id).toBe('string');
            expect(typeof m.email).toBe('string');
            expect(['google', 'microsoft', 'smtp']).toContain(m.provider);
            expect(typeof m.total_sent).toBe('number');
            expect(typeof m.reply_rate).toBe('number');
            expect(typeof m.bounce_rate).toBe('number');
            expect(typeof m.utilization_pct).toBe('number');
            expect(typeof m.daily_send_limit).toBe('number');
        }
    });

    test('rows are sorted by send volume desc', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/analytics/mailboxes?timeRange=30d');
        const json = await res.json();
        const counts = json.data.map((m: { total_sent: number }) => m.total_sent);
        for (let i = 1; i < counts.length; i++) {
            // Tie-breaking by email is allowed; never strict-greater violations.
            expect(counts[i] <= counts[i - 1]).toBe(true);
        }
    });

    test('custom date range params are accepted', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/analytics/mailboxes?from=2026-04-01&to=2026-05-12');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });
});

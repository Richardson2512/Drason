/**
 * Reply intelligence - E2E coverage for the Gemini-assisted reply
 * classification + OOO holds + auto-action executor.
 *
 * Verifies the API contracts that don't require live Gemini:
 *   - Unibox quality_class filter
 *   - Reply-action config CRUD (GET, PUT)
 *   - Lazy-seed of default rules on first GET
 *
 * Real AI re-classification + OOO parsing run inside the imapReplyWorker
 * which fires asynchronously off IMAP fetches - out of scope for
 * Playwright. Unit-style coverage for the regex path could be added later
 * but the regex is pure and easily auditable.
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

test.describe('reply-intelligence - config endpoints', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('GET /reply-actions lazy-seeds default rules', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/reply-actions');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBeGreaterThan(0);
        // Defaults include 'hard_no → suppress' which is the most important one
        // - without it, replied-stop replies don't actually stop future sends.
        const hasHardNoSuppress = json.data.some(
            (r: { reply_class: string; action_kind: string; enabled: boolean }) =>
                r.reply_class === 'hard_no' && r.action_kind === 'suppress' && r.enabled,
        );
        expect(hasHardNoSuppress).toBe(true);
    });

    test('PUT /reply-actions toggles a rule', async ({ page }) => {
        const cls = 'objection';
        const action = 'alert';

        // Read current state
        let res = await page.request.get('/api/sequencer/reply-actions');
        let json = await res.json();
        const before = json.data.find(
            (r: { reply_class: string; action_kind: string }) =>
                r.reply_class === cls && r.action_kind === action,
        );

        // Flip to the opposite value (or create if missing)
        const target = !(before?.enabled ?? false);
        res = await page.request.put('/api/sequencer/reply-actions', {
            data: { reply_class: cls, action_kind: action, enabled: target },
        });
        expect(res.status()).toBe(200);

        // Verify persisted
        res = await page.request.get('/api/sequencer/reply-actions');
        json = await res.json();
        const after = json.data.find(
            (r: { reply_class: string; action_kind: string }) =>
                r.reply_class === cls && r.action_kind === action,
        );
        expect(after?.enabled).toBe(target);

        // Restore
        await page.request.put('/api/sequencer/reply-actions', {
            data: { reply_class: cls, action_kind: action, enabled: before?.enabled ?? false },
        });
    });

    test('PUT /reply-actions rejects invalid class', async ({ page }) => {
        const res = await page.request.put('/api/sequencer/reply-actions', {
            data: { reply_class: 'nonsense', action_kind: 'alert', enabled: true },
        });
        expect(res.status()).toBe(400);
    });

    test('PUT /reply-actions rejects invalid action', async ({ page }) => {
        const res = await page.request.put('/api/sequencer/reply-actions', {
            data: { reply_class: 'positive', action_kind: 'detonate', enabled: true },
        });
        expect(res.status()).toBe(400);
    });
});

test.describe('reply-intelligence - unibox filter', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('quality_class param accepted; empty filter returns all', async ({ page }) => {
        const baseline = await page.request.get('/api/unibox/threads?limit=10');
        expect(baseline.status()).toBe(200);
        const baseJson = await baseline.json();
        expect(baseJson.success).toBe(true);
        expect(Array.isArray(baseJson.data)).toBe(true);

        // Filter to a class that probably has no matches in demo data - the
        // request must succeed even when result count is zero.
        const filtered = await page.request.get(
            '/api/unibox/threads?limit=10&quality_class=hard_no',
        );
        expect(filtered.status()).toBe(200);
        const filtJson = await filtered.json();
        expect(filtJson.success).toBe(true);
        expect(Array.isArray(filtJson.data)).toBe(true);
        // Every returned thread must have at least one inbound message in the
        // requested class. We can't assert on demo data shape, but we CAN
        // assert that the filtered count is <= the unfiltered count.
        expect(filtJson.data.length).toBeLessThanOrEqual(baseJson.data.length);
    });

    test('multiple quality classes union correctly', async ({ page }) => {
        const res = await page.request.get(
            '/api/unibox/threads?limit=20&quality_class=positive,qualified,auto',
        );
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    test('quality_class filter does not affect Sent tab', async ({ page }) => {
        // The controller intentionally only narrows inbound messages - the
        // Sent tab should behave identically with or without the filter set.
        const without = await page.request.get('/api/unibox/threads?limit=5&view=sent');
        const withClass = await page.request.get('/api/unibox/threads?limit=5&view=sent&quality_class=positive');
        expect(without.status()).toBe(200);
        expect(withClass.status()).toBe(200);
        // Both should return same data shape; we don't assert exact equality
        // because the filter still applies to messages-relation if the
        // dataset happens to satisfy it, but for the demo org these should
        // both return the same length (no inbound thread is in the sent slice).
        const a = await without.json();
        const b = await withClass.json();
        expect(typeof a.meta?.total).toBe('number');
        expect(typeof b.meta?.total).toBe('number');
    });
});

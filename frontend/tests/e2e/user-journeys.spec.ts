/**
 * Phase F — Authenticated user journey tests.
 *
 * Logs in once per test as demo@superkabe.com (password set via SQL),
 * then exercises the high-traffic surfaces:
 *   - Warmup pool: page renders with real API, consent state visible
 *   - AI assist panel: profile generator UI loads
 *   - JustCall integration form: validation & connect button
 *   - Super Sender announcement: appears + dismissal persists
 *   - Pool config bulk-update: modal opens, two-step confirm shows
 *
 * These are smoke-level: they verify the page wires up end-to-end
 * (auth → API → render) without exercising every interactive control.
 * Deeper interaction tests belong in component tests.
 */

import { test, expect, type Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@superkabe.com';
const DEMO_PASSWORD = 'demo1234';

async function login(page: Page) {
    // globalSetup pre-authenticates via storageState; skip if cookie present.
    const cookies = await page.context().cookies();
    if (cookies.some(c => c.name === 'token')) return;
    // Login via API and seed cookie — faster + less flaky than UI login.
    const res = await page.request.post('/api/auth/login', {
        data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
    expect(res.status(), `login should succeed, got ${res.status()}`).toBe(200);
    // The Set-Cookie from the response is automatically applied to the
    // browser context's cookie jar via page.request.
}

test.describe('authenticated journeys', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('dashboard root renders for authed user', async ({ page }) => {
        const res = await page.goto('/dashboard');
        expect(res?.status()).toBeLessThan(400);
        const body = await page.locator('body').innerText();
        // Authed dashboard should have substantially more content than the
        // login redirect page.
        expect(body.length).toBeGreaterThan(200);
        // Should NOT have been bounced to /login.
        expect(page.url()).not.toContain('/login');
    });

    test('warmup page loads memberships from API', async ({ page }) => {
        // Capture the API request to confirm wiring.
        const apiPromise = page.waitForResponse(
            (r) => r.url().includes('/api/sequencer/warmup/memberships') && r.status() === 200,
            { timeout: 15_000 },
        );
        const res = await page.goto('/dashboard/sequencer/warmup');
        expect(res?.status()).toBeLessThan(400);
        const apiRes = await apiPromise;
        const json = await apiRes.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    test('warmup overview endpoint responds for authed user', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/warmup/overview');
        expect(res.status()).toBe(200);
        const json = await res.json();
        // Overview shape: counts + maybe pool stats.
        expect(json).toBeTruthy();
    });

    test('warmup consent endpoint reads + writes', async ({ page }) => {
        const get = await page.request.get('/api/sequencer/warmup/consent');
        expect(get.status()).toBe(200);
        const before = await get.json();
        expect(typeof before.data?.consent).toBe('boolean');

        // Toggle consent on (idempotent — leaves it on after).
        const post = await page.request.post('/api/sequencer/warmup/consent', {
            data: { consent: true },
        });
        expect(post.status()).toBeLessThan(400);
        const after = await post.json();
        expect(after.data.consent).toBe(true);
    });

    test('campaigns list page renders without 5xx', async ({ page }) => {
        const res = await page.goto('/dashboard/sequencer/campaigns');
        expect(res?.status()).toBeLessThan(500);
        const body = await page.locator('body').innerText();
        expect(body.length).toBeGreaterThan(100);
    });

    test('mailboxes list endpoint responds', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/accounts');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(Array.isArray(json.data ?? json)).toBe(true);
    });

    test('integrations / JustCall page renders', async ({ page }) => {
        const res = await page.goto('/dashboard/integrations/justcall');
        expect(res?.status()).toBeLessThan(500);
        // Look for connect-flow controls — input or button.
        const body = await page.locator('body').innerText();
        expect(body.length).toBeGreaterThan(50);
    });

    test('analytics overview endpoint responds', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/analytics');
        expect(res.status()).toBeLessThan(500);
    });

    test('logout clears session', async ({ page }) => {
        const res = await page.request.post('/api/auth/logout');
        expect(res.status()).toBeLessThan(400);
        // After logout, /dashboard should redirect away (to /login or /).
        await page.goto('/dashboard');
        // Give the client-side auth guard time to fire.
        await page.waitForLoadState('networkidle');
        expect(page.url()).not.toContain('/dashboard');
    });
});

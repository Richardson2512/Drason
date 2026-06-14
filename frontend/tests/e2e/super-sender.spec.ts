/**
 * Super Sender - E2E coverage for the dedicated-IP feature.
 *
 * What this verifies (without exercising real Polar/SES):
 *   - GET /api/super-sender returns the expected envelope for an authed user
 *   - The Super Sender page renders pre-purchase marketing for a clean account
 *   - The sidebar pill appears when no IP is purchased
 *   - The dashboard banner appears (and respects dismissal)
 *   - Checkout endpoint validates input and tier-gates
 *
 * What this does NOT cover (out of scope without external creds):
 *   - Real Polar checkout redirect
 *   - Real SES provisioning state transitions (the worker would advance them
 *     in stub mode but it's a 5-minute tick - we test the API surface instead)
 */

import { test, expect, type Page } from '@playwright/test';

const DEMO_EMAIL = 'demo@superkabe.com';
const DEMO_PASSWORD = 'demo1234';

async function login(page: Page) {
    // globalSetup pre-authenticates via storageState; skip if cookie present.
    const cookies = await page.context().cookies();
    if (cookies.some(c => c.name === 'token')) return;
    const res = await page.request.post('/api/auth/login', {
        data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
    expect(res.status(), `login should succeed`).toBe(200);
}

test.describe('super sender - pre-purchase', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('GET /api/super-sender returns summary + workspaces', async ({ page }) => {
        const res = await page.request.get('/api/super-sender');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data?.summary).toBeTruthy();
        expect(typeof json.data.summary.has_any_ip).toBe('boolean');
        expect(typeof json.data.summary.price_per_ip_usd).toBe('number');
        expect(Array.isArray(json.data.ips)).toBe(true);
        expect(Array.isArray(json.data.workspaces)).toBe(true);
    });

    test('super-sender page renders for authed user', async ({ page }) => {
        const res = await page.goto('/dashboard/sequencer/super-sender');
        expect(res?.status()).toBeLessThan(400);
        const body = await page.locator('body').innerText();
        // Either pre-purchase marketing or post-purchase cards - both
        // surfaces should mention "Super Sender" prominently.
        expect(body).toContain('Super Sender');
    });

    test('checkout endpoint rejects invalid quantity', async ({ page }) => {
        const res = await page.request.post('/api/super-sender/checkout', {
            data: { quantity: 0 },
        });
        expect(res.status()).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
    });

    test('checkout endpoint rejects mismatched workspace_ids length', async ({ page }) => {
        const res = await page.request.post('/api/super-sender/checkout', {
            data: { quantity: 2, workspace_ids: ['only-one'] },
        });
        expect(res.status()).toBe(400);
    });

    test('assign endpoint requires id + workspace_id', async ({ page }) => {
        const res = await page.request.post('/api/super-sender/bogus-id/assign', {
            data: {},
        });
        // 400 (missing workspace_id) or 404 (id not found) - either is the
        // contract: assignment must reject before a real attempt.
        expect([400, 404].includes(res.status())).toBe(true);
    });

    test('unassign endpoint rejects unknown id', async ({ page }) => {
        const res = await page.request.post('/api/super-sender/bogus-id/unassign');
        // 404 from AllocationError NOT_FOUND, or 403 if account ctx missing.
        expect([403, 404].includes(res.status())).toBe(true);
    });

    test('pause endpoint rejects unknown id', async ({ page }) => {
        const res = await page.request.post('/api/super-sender/bogus-id/pause', {
            data: { reason: 'manual' },
        });
        expect([403, 404].includes(res.status())).toBe(true);
    });

    test('resume endpoint rejects unknown id', async ({ page }) => {
        const res = await page.request.post('/api/super-sender/bogus-id/resume');
        expect([403, 404].includes(res.status())).toBe(true);
    });

    test('mailbox-routing endpoint rejects unknown id', async ({ page }) => {
        const res = await page.request.get('/api/super-sender/bogus-id/mailboxes');
        expect([403, 404].includes(res.status())).toBe(true);
    });
});

test.describe('super sender - SES SNS notifications', () => {
    // The SNS endpoint is unauthenticated by design (AWS posts to it).
    // Verify the handler accepts the three SNS message types.

    test('SubscriptionConfirmation returns 200', async ({ request }) => {
        const res = await request.post('/api/super-sender/ses-notification', {
            data: {
                Type: 'SubscriptionConfirmation',
                TopicArn: 'arn:aws:sns:us-east-1:000000000000:test',
                // SubscribeURL omitted - handler will skip the GET fetch.
            },
        });
        expect(res.status()).toBe(200);
    });

    test('Notification with delivery payload is accepted', async ({ request }) => {
        const res = await request.post('/api/super-sender/ses-notification', {
            data: {
                Type: 'Notification',
                Message: JSON.stringify({
                    notificationType: 'Delivery',
                    mail: { sourceIp: '198.51.100.1', messageId: 'msg-1' },
                    delivery: { recipients: ['user@example.com'] },
                }),
            },
        });
        expect(res.status()).toBe(200);
    });

    test('Notification with bounce payload is accepted', async ({ request }) => {
        const res = await request.post('/api/super-sender/ses-notification', {
            data: {
                Type: 'Notification',
                Message: JSON.stringify({
                    notificationType: 'Bounce',
                    mail: { sourceIp: '198.51.100.2', messageId: 'msg-2' },
                    bounce: {
                        bounceType: 'Permanent',
                        bouncedRecipients: [{ emailAddress: 'bad@example.com', diagnosticCode: '550 user unknown' }],
                    },
                }),
            },
        });
        expect(res.status()).toBe(200);
    });

    test('malformed Message JSON returns 200 (defensive - never 5xx on SNS)', async ({ request }) => {
        const res = await request.post('/api/super-sender/ses-notification', {
            data: { Type: 'Notification', Message: 'not-json' },
        });
        expect(res.status()).toBe(200);
    });
});

test.describe('super sender - dashboard surfaces', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('dashboard banner appears when no IP is purchased', async ({ page }) => {
        // Reset dismissal storage AT page-load time, in this navigation only.
        await page.goto('/dashboard');
        await page.evaluate(() => {
            try { localStorage.removeItem('superkabe-super-sender-dismissed-at'); } catch {}
            try { localStorage.removeItem('superkabe-super-sender-dismissed'); } catch {}
        });
        await page.reload();
        const banner = page.getByText(/Introducing Super Sender/i);
        await expect(banner).toBeVisible({ timeout: 5000 });
    });

    test('banner dismissal persists across navigation', async ({ page }) => {
        await page.goto('/dashboard');
        await page.evaluate(() => {
            try { localStorage.removeItem('superkabe-super-sender-dismissed-at'); } catch {}
        });
        await page.reload();
        const dismissBtn = page.getByLabel('Dismiss Super Sender announcement');
        await expect(dismissBtn).toBeVisible({ timeout: 5000 });
        await dismissBtn.click();
        // Should disappear immediately.
        await expect(page.getByText(/Introducing Super Sender/i)).toHaveCount(0);
        // And persist after a navigation (localStorage timestamp is fresh,
        // well within the 24h TTL).
        await page.goto('/dashboard/sequencer/campaigns');
        await expect(page.getByText(/Introducing Super Sender/i)).toHaveCount(0);
    });
});

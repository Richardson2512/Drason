/**
 * Preheader (inbox preview text) — E2E coverage.
 *
 * Verifies:
 *   - Preview service uses preheader as the inbox snippet when present
 *   - Falls back to body-derived snippet when preheader is empty
 *   - Template create/update accepts + persists preheader
 *
 * Send-time MIME injection is unit-level work that doesn't surface in
 * Playwright (no real outbound). The preview-service contract is the
 * authoritative test that the data round-trips correctly.
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
    expect(res.status()).toBe(200);
}

test.describe('preheader — preview service', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('preheader overrides body-derived snippet when present', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/recipient-preview', {
            data: {
                subject: 'Quick question',
                preheader: 'Just 2 minutes of your time',
                bodyHtml: '<p>Long body text that would otherwise be the snippet.</p>',
                senderName: 'Test',
                senderEmail: 't@example.com',
                clients: ['gmail_mobile'],
            },
        });
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.clients[0].inbox.preview).toBe('Just 2 minutes of your time');
    });

    test('empty preheader falls back to body-derived snippet', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/recipient-preview', {
            data: {
                subject: 'Quick question',
                preheader: '',
                bodyHtml: '<p>Body content here.</p>',
                senderName: 'Test',
                senderEmail: 't@example.com',
                clients: ['gmail_mobile'],
            },
        });
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.clients[0].inbox.preview).toContain('Body content here');
    });

    test('missing preheader field is treated as empty (backwards compat)', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/recipient-preview', {
            data: {
                subject: 'Hello',
                bodyHtml: '<p>From the body</p>',
                senderName: 'Test',
                senderEmail: 't@example.com',
                clients: ['gmail_mobile'],
            },
        });
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.clients[0].inbox.preview).toContain('From the body');
    });
});

test.describe('preheader — template CRUD', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('template create persists preheader; update changes it', async ({ page }) => {
        // Create
        const createRes = await page.request.post('/api/sequencer/templates', {
            data: {
                name: `e2e-preheader-${Date.now()}`,
                subject: 'Test subject',
                preheader: 'Inbox preview line',
                bodyHtml: '<p>Body</p>',
                category: 'general',
            },
        });
        expect(createRes.status()).toBe(201);
        const created = await createRes.json();
        expect(created.success).toBe(true);
        expect(created.data.preheader).toBe('Inbox preview line');
        const id = created.data.id;

        // Update
        const updateRes = await page.request.patch(`/api/sequencer/templates/${id}`, {
            data: { preheader: 'Updated preview line' },
        });
        expect(updateRes.status()).toBe(200);
        const updated = await updateRes.json();
        expect(updated.data.preheader).toBe('Updated preview line');

        // Read back via list
        const listRes = await page.request.get('/api/sequencer/templates');
        expect(listRes.status()).toBe(200);
        const list = await listRes.json();
        const row = (list.data || list.templates || []).find((t: { id: string }) => t.id === id);
        expect(row?.preheader).toBe('Updated preview line');

        // Cleanup
        await page.request.delete(`/api/sequencer/templates/${id}`);
    });
});

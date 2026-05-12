/**
 * Saved sequences — E2E coverage for the CRUD endpoints + the AI generator
 * gate. Real AI generation needs GEMINI_API_KEY so we only assert the
 * endpoint exists + rejects invalid input; the happy path is exercised
 * manually + via unit tests on the prompt + sanitization helpers.
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

test.describe('saved sequences — CRUD', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('list returns array shape', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/sequences');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
    });

    test('create + read + update + delete round-trip', async ({ page }) => {
        // Create
        const created = await page.request.post('/api/sequencer/sequences', {
            data: {
                name: `e2e-seq-${Date.now()}`,
                description: 'created by E2E',
                category: 'follow-up',
                steps: [
                    { step_number: 1, delay_days: 0, subject: 'Hello', preheader: 'Quick question', body_html: '<p>Hi</p>' },
                    { step_number: 2, delay_days: 3, subject: 'Following up', body_html: '<p>Bumping</p>' },
                ],
            },
        });
        expect(created.status()).toBe(201);
        const createdJson = await created.json();
        expect(createdJson.success).toBe(true);
        const id = createdJson.data.id;
        expect(createdJson.data.step_count).toBe(2);
        expect(createdJson.data.steps?.[0].preheader).toBe('Quick question');

        // Read full
        const get = await page.request.get(`/api/sequencer/sequences/${id}`);
        expect(get.status()).toBe(200);
        const getJson = await get.json();
        expect(getJson.data.name).toBe(createdJson.data.name);
        expect(getJson.data.steps).toHaveLength(2);

        // Update — replace steps + rename
        const patch = await page.request.patch(`/api/sequencer/sequences/${id}`, {
            data: {
                name: `${createdJson.data.name} (renamed)`,
                steps: [
                    { step_number: 1, delay_days: 0, subject: 'Replaced', body_html: '<p>X</p>' },
                ],
            },
        });
        expect(patch.status()).toBe(200);
        const patched = await patch.json();
        expect(patched.data.step_count).toBe(1);
        expect(patched.data.name).toContain('(renamed)');

        // Duplicate
        const dup = await page.request.post(`/api/sequencer/sequences/${id}/duplicate`);
        expect(dup.status()).toBe(201);
        const dupJson = await dup.json();
        expect(dupJson.data.name).toContain('(copy)');
        expect(dupJson.data.step_count).toBe(1);

        // Cleanup
        await page.request.delete(`/api/sequencer/sequences/${id}`);
        await page.request.delete(`/api/sequencer/sequences/${dupJson.data.id}`);
    });

    test('create rejects missing name', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/sequences', {
            data: { steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>x</p>' }] },
        });
        expect(res.status()).toBe(400);
    });

    test('create rejects empty steps', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/sequences', {
            data: { name: 'empty', steps: [] },
        });
        expect(res.status()).toBe(400);
    });

    test('get returns 404 for cross-tenant id', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/sequences/00000000-0000-0000-0000-000000000000');
        expect(res.status()).toBe(404);
    });
});

test.describe('saved sequences — AI generator', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('generate rejects empty URL list', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/sequences/generate', {
            data: { urls: [], stepCount: 3 },
        });
        expect(res.status()).toBe(400);
    });

    test('generate rejects more than 5 URLs', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/sequences/generate', {
            data: {
                urls: Array.from({ length: 6 }, (_, i) => `https://example${i}.com`),
                stepCount: 3,
            },
        });
        expect(res.status()).toBe(400);
    });
});

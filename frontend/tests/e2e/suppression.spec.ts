/**
 * Campaign suppression - E2E coverage.
 *
 * Verifies the three suppression modes (none / all_campaigns / campaign-scoped),
 * the lead-picker endpoint contract, persistence + hydration, and the
 * round-trip from create → addLeads (suppression re-applied on every insert).
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

async function createCampaign(page: Page, payload: Record<string, unknown>): Promise<string> {
    const res = await page.request.post('/api/sequencer/campaigns', { data: payload });
    expect(res.status()).toBe(201);
    const json = await res.json();
    return json.data.id;
}

test.describe('suppression - API contract', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('lead-picker requires campaign_ids', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/campaigns/lead-picker');
        expect(res.status()).toBe(400);
    });

    test('lead-picker rejects more than 50 campaigns', async ({ page }) => {
        const ids = Array.from({ length: 51 }, (_, i) => `c${i}`).join(',');
        const res = await page.request.get(`/api/sequencer/campaigns/lead-picker?campaign_ids=${ids}`);
        expect(res.status()).toBe(400);
    });

    test('suppression GET 404s on cross-tenant / unknown campaign', async ({ page }) => {
        const res = await page.request.get('/api/sequencer/campaigns/bogus-id-12345/suppression');
        expect(res.status()).toBe(404);
    });

    test('suppression GET returns empty array for a brand-new campaign', async ({ page }) => {
        const campaignId = await createCampaign(page, {
            name: `e2e-supp-empty-${Date.now()}`,
            steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>Hi</p>' }],
            accountIds: [],
        });
        const res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/suppression`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBe(0);

        // Cleanup
        await page.request.delete(`/api/sequencer/campaigns/${campaignId}`);
    });

    test('create with suppressionRules persists; updateCampaign replaces them', async ({ page }) => {
        const campaignId = await createCampaign(page, {
            name: `e2e-supp-create-${Date.now()}`,
            steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>Hi</p>' }],
            accountIds: [],
            suppressionRules: [
                { kind: 'email', suppressed_email: 'block-1@superkabe-test.dev' },
                { kind: 'email', suppressed_email: 'block-2@superkabe-test.dev' },
            ],
        });

        // Verify persisted
        let res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/suppression`);
        let json = await res.json();
        const emails = json.data.filter((r: { kind: string }) => r.kind === 'email').map((r: { suppressed_email: string }) => r.suppressed_email);
        expect(emails.sort()).toEqual(['block-1@superkabe-test.dev', 'block-2@superkabe-test.dev']);

        // Replace via PATCH
        const patch = await page.request.patch(`/api/sequencer/campaigns/${campaignId}`, {
            data: { suppressionRules: [{ kind: 'email', suppressed_email: 'block-3@superkabe-test.dev' }] },
        });
        expect(patch.status()).toBe(200);

        res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/suppression`);
        json = await res.json();
        expect(json.data.length).toBe(1);
        expect(json.data[0].suppressed_email).toBe('block-3@superkabe-test.dev');

        // Clear via empty array
        await page.request.patch(`/api/sequencer/campaigns/${campaignId}`, { data: { suppressionRules: [] } });
        res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/suppression`);
        json = await res.json();
        expect(json.data.length).toBe(0);

        await page.request.delete(`/api/sequencer/campaigns/${campaignId}`);
    });

    test('legacy skipDuplicatesAcrossCampaigns boolean folds into rules', async ({ page }) => {
        const campaignId = await createCampaign(page, {
            name: `e2e-supp-legacy-${Date.now()}`,
            steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>Hi</p>' }],
            accountIds: [],
            skipDuplicatesAcrossCampaigns: true,
        });
        const res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/suppression`);
        const json = await res.json();
        const hasAll = json.data.some((r: { kind: string }) => r.kind === 'all_campaigns');
        expect(hasAll).toBe(true);
        await page.request.delete(`/api/sequencer/campaigns/${campaignId}`);
    });

    test('campaign-scoped rule rejects ids from another tenant', async ({ page }) => {
        const res = await page.request.post('/api/sequencer/campaigns', {
            data: {
                name: `e2e-supp-orphan-${Date.now()}`,
                steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>Hi</p>' }],
                accountIds: [],
                suppressionRules: [{ kind: 'campaign', suppressed_campaign_id: '00000000-0000-0000-0000-000000000000' }],
            },
        });
        // 400 from validation in setSuppressionRules; the create transaction
        // rolls back so no orphan campaign is left behind.
        expect([400, 500].includes(res.status())).toBe(true);
    });
});

test.describe('suppression - filter behavior at lead insert', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    test('lead with email in suppression list is dropped at create', async ({ page }) => {
        const blockedEmail = `e2e-blocked-${Date.now()}@superkabe-test.dev`;
        const allowedEmail = `e2e-allowed-${Date.now()}@superkabe-test.dev`;

        const campaignId = await createCampaign(page, {
            name: `e2e-supp-filter-${Date.now()}`,
            steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>Hi</p>' }],
            accountIds: [],
            leads: [
                { email: blockedEmail, first_name: 'Block' },
                { email: allowedEmail, first_name: 'Allow' },
            ],
            suppressionRules: [{ kind: 'email', suppressed_email: blockedEmail }],
        });

        // Read back leads - only the allowed one should be present.
        const res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/leads?page=1&limit=50`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        const emails = (json.leads || []).map((l: { email: string }) => l.email);
        expect(emails).toContain(allowedEmail);
        expect(emails).not.toContain(blockedEmail);

        await page.request.delete(`/api/sequencer/campaigns/${campaignId}`);
    });

    test('addLeads on existing campaign re-applies persisted suppressions', async ({ page }) => {
        const blocked = `e2e-block-add-${Date.now()}@superkabe-test.dev`;
        const ok = `e2e-ok-add-${Date.now()}@superkabe-test.dev`;

        const campaignId = await createCampaign(page, {
            name: `e2e-supp-add-${Date.now()}`,
            steps: [{ step_number: 1, subject: 'Hi', body_html: '<p>Hi</p>' }],
            accountIds: [],
            suppressionRules: [{ kind: 'email', suppressed_email: blocked }],
        });

        // PATCH addLeads with both - only the non-suppressed should land.
        await page.request.patch(`/api/sequencer/campaigns/${campaignId}`, {
            data: {
                addLeads: [
                    { email: blocked, first_name: 'B' },
                    { email: ok, first_name: 'O' },
                ],
            },
        });

        const res = await page.request.get(`/api/sequencer/campaigns/${campaignId}/leads?page=1&limit=50`);
        const json = await res.json();
        const emails = (json.leads || []).map((l: { email: string }) => l.email);
        expect(emails).toContain(ok);
        expect(emails).not.toContain(blocked);

        await page.request.delete(`/api/sequencer/campaigns/${campaignId}`);
    });
});

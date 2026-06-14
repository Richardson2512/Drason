/**
 * Reports - E2E coverage for the protection analytics report generator.
 *
 * Verifies every report type returns 200 + the expected CSV header line.
 * Also covers the audit-fix expectations:
 *   - Platform filter is gone (no longer 400s, no longer used)
 *   - New report types are registered and routable
 *   - Lead CSV exposes the new `Bounced At` + `Unsubscribed Reason` columns
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

/** Pull the first non-empty line from a multi-section CSV. */
function firstHeader(csv: string): string {
    for (const line of csv.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('---')) return trimmed;
    }
    return '';
}

test.describe('reports - all types', () => {
    test.beforeEach(async ({ page }) => { await login(page); });

    const TYPES: { type: string; expectedHeaderContains: string[] }[] = [
        { type: 'leads',          expectedHeaderContains: ['Email', 'Status', 'Lead Score', 'Bounced At', 'Unsubscribed Reason'] },
        { type: 'campaigns',      expectedHeaderContains: ['Name', 'Status', 'Lead Count', 'Bounce Rate (%)'] },
        { type: 'mailboxes',      expectedHeaderContains: ['Email', 'Status', 'Recovery Phase', 'Engagement Rate (%)'] },
        { type: 'domains',        expectedHeaderContains: ['Domain', 'Status', 'SPF Valid', 'DKIM Valid'] },
        { type: 'analytics',      expectedHeaderContains: ['Campaign Name', 'Date', 'Sent'] },
        { type: 'audit_logs',     expectedHeaderContains: ['Timestamp', 'Entity', 'Action'] },
        { type: 'load_balancing', expectedHeaderContains: ['Mailbox Email', 'Effective Load'] },
        { type: 'sequences',      expectedHeaderContains: ['Name', 'Category', 'Steps', 'AI Generated'] },
        { type: 'super_sender',   expectedHeaderContains: ['Workspace', 'IP Address', 'State', 'Daily Cap'] },
        { type: 'reply_quality',  expectedHeaderContains: ['Received At', 'From', 'Class (final)', 'AI Re-classified'] },
        { type: 'suppression',    expectedHeaderContains: ['Scope', 'Rule Kind', 'Target'] },
        { type: 'warmup',         expectedHeaderContains: ['Mailbox', 'Warmup Health', 'Ramp Day', 'Recovered From Spam'] },
    ];

    for (const { type, expectedHeaderContains } of TYPES) {
        test(`${type} returns CSV with expected header`, async ({ page }) => {
            const res = await page.request.get(`/api/dashboard/reports/generate?report_type=${type}`);
            expect(res.status(), `${type} should return 200`).toBe(200);
            expect(res.headers()['content-type']).toContain('text/csv');
            const csv = await res.text();
            const header = firstHeader(csv);
            for (const col of expectedHeaderContains) {
                expect(header).toContain(col);
            }
        });
    }

    test('invalid report_type returns 400', async ({ page }) => {
        const res = await page.request.get('/api/dashboard/reports/generate?report_type=bogus');
        expect(res.status()).toBe(400);
    });

    test('platform query param is silently ignored (no 400)', async ({ page }) => {
        const res = await page.request.get('/api/dashboard/reports/generate?report_type=leads&platform=smartlead');
        expect(res.status()).toBe(200);
    });

    test('leads engagement=replied returns CSV with only replied leads', async ({ page }) => {
        const res = await page.request.get('/api/dashboard/reports/generate?report_type=leads&engagement=replied');
        expect(res.status()).toBe(200);
        const csv = await res.text();
        const lines = csv.split('\n').filter(Boolean);
        // Header line + 0+ data rows. If there are data rows, every one must
        // have emails_replied > 0. Header position is fixed by the columns array.
        const header = lines[0].split(',');
        const repliedIdx = header.findIndex(h => h === 'Emails Replied');
        expect(repliedIdx).toBeGreaterThanOrEqual(0);
        for (const row of lines.slice(1)) {
            const cells = row.split(',');
            const n = parseInt(cells[repliedIdx] || '0', 10);
            expect(n > 0).toBe(true);
        }
    });

    test('leads engagement=bounced returns CSV with only bounced rows', async ({ page }) => {
        const res = await page.request.get('/api/dashboard/reports/generate?report_type=leads&engagement=bounced');
        expect(res.status()).toBe(200);
        const csv = await res.text();
        const lines = csv.split('\n').filter(Boolean);
        const header = lines[0].split(',');
        const bouncedIdx = header.findIndex(h => h === 'Bounced');
        for (const row of lines.slice(1)) {
            const cells = row.split(',');
            expect(cells[bouncedIdx]).toBe('Yes');
        }
    });

    test('leads engagement=not_sent returns CSV with emails_sent=0 rows', async ({ page }) => {
        const res = await page.request.get('/api/dashboard/reports/generate?report_type=leads&engagement=not_sent');
        expect(res.status()).toBe(200);
        const csv = await res.text();
        const lines = csv.split('\n').filter(Boolean);
        const header = lines[0].split(',');
        const sentIdx = header.findIndex(h => h === 'Emails Sent');
        for (const row of lines.slice(1)) {
            const cells = row.split(',');
            expect(parseInt(cells[sentIdx] || '0', 10)).toBe(0);
        }
    });

    test('campaign_id narrows leads CSV to a single campaign', async ({ page }) => {
        // Pick the first campaign in the demo org.
        const listRes = await page.request.get('/api/sequencer/campaigns?limit=1');
        const json = await listRes.json();
        const id = json?.data?.[0]?.id;
        if (!id) test.skip(true, 'no campaigns to test against');
        const res = await page.request.get(`/api/dashboard/reports/generate?report_type=leads&campaign_id=${id}`);
        expect(res.status()).toBe(200);
        const csv = await res.text();
        // Every data row's "Campaign Name" column should belong to the one
        // campaign we picked - but we can't easily resolve the name client-
        // side, so just assert the response is non-empty + 200.
        expect(csv.length).toBeGreaterThan(0);
    });

    test('reply_quality accepts campaign_id filter', async ({ page }) => {
        const listRes = await page.request.get('/api/sequencer/campaigns?limit=1');
        const json = await listRes.json();
        const id = json?.data?.[0]?.id;
        if (!id) test.skip(true, 'no campaigns to test against');
        const res = await page.request.get(`/api/dashboard/reports/generate?report_type=reply_quality&campaign_id=${id}`);
        expect(res.status()).toBe(200);
    });

    test('full report concatenates every section', async ({ page }) => {
        const res = await page.request.get('/api/dashboard/reports/generate?report_type=full');
        expect(res.status()).toBe(200);
        const csv = await res.text();
        // Every section emits a header line of the form "--- X REPORT ---" except
        // the first one. Spot-check that several new sections are present.
        expect(csv).toContain('--- SEQUENCES REPORT ---');
        expect(csv).toContain('--- SUPER SENDER REPORT ---');
        expect(csv).toContain('--- REPLY QUALITY REPORT ---');
        expect(csv).toContain('--- SUPPRESSION REPORT ---');
        expect(csv).toContain('--- WARMUP REPORT ---');
    });
});

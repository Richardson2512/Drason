/**
 * Playwright config for end-to-end smoke + journey tests.
 *
 * Assumes the local dev stack is already running:
 *   - Frontend: http://localhost:3000
 *   - Backend:  http://localhost:4000
 *   - Postgres: localhost:5433 (Docker)
 *   - Redis:    localhost:6379 (Docker)
 *
 * Run: `npx playwright test`
 * Headed:  `npx playwright test --headed`
 * UI:      `npx playwright test --ui`
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const STORAGE_STATE_PATH = path.resolve(__dirname, 'tests/e2e/.auth-state.json');

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    fullyParallel: false, // serial — shared local DB state
    retries: 0,
    workers: 1,
    reporter: [['list']],
    // Authenticate once before the run and persist cookies to a state file;
    // every test inherits the cookie via `use.storageState` below. Avoids
    // the per-test login storm that was hitting /auth/login's 60/min cap.
    globalSetup: require.resolve('./tests/e2e/global-setup'),
    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        // Headless by default; --headed flag overrides.
        headless: true,
        storageState: STORAGE_STATE_PATH,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});

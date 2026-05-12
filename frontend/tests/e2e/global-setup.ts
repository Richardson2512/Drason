/**
 * Playwright global setup — log in once and persist the auth cookie to
 * disk so every spec starts already-authenticated.
 *
 * Without this, each spec's `login` helper called POST /api/auth/login in
 * beforeEach. The login endpoint is rate-limited to 60/min; once the test
 * suite grew past ~130 tests the tail of every run was failing on 429s.
 *
 * The resulting storage-state file is wired up in playwright.config.ts
 * via `use.storageState` so all test contexts inherit the cookie jar
 * automatically.
 */

import { request as playwrightRequest, type FullConfig } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE_PATH = path.resolve(__dirname, '.auth-state.json');

const DEMO_EMAIL = 'demo@superkabe.com';
const DEMO_PASSWORD = 'demo1234';

export default async function globalSetup(config: FullConfig) {
    const baseURL = config.projects[0]?.use?.baseURL || process.env.E2E_BASE_URL || 'http://localhost:3000';
    const context = await playwrightRequest.newContext({ baseURL });
    try {
        const res = await context.post('/api/auth/login', {
            data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
        });
        if (!res.ok()) {
            throw new Error(`Login failed in globalSetup: HTTP ${res.status()}`);
        }
        await context.storageState({ path: STORAGE_STATE_PATH });
    } finally {
        await context.dispose();
    }
}

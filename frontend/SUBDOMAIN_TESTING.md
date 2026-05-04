# Subdomain split — local testing guide

This documents how to test the `app.superkabe.com` / `superkabe.com` split
locally before pushing it to prod. We use `lvh.me` (a public DNS record
that resolves all `*.lvh.me` hostnames to `127.0.0.1`) so no hosts file
or DNS setup is required.

## What you'll be testing

After setup:

| URL                                     | Serves                              |
|-----------------------------------------|-------------------------------------|
| `http://superkabe.lvh.me:3000`          | Marketing site (landing, blog, ...) |
| `http://app.superkabe.lvh.me:3000`      | Dashboard, login, signup            |
| `http://api.superkabe.lvh.me:4000`      | Backend API                         |

The frontend middleware (`src/middleware.ts`) automatically redirects
mismatches:

- `http://superkabe.lvh.me:3000/dashboard` → bounces to `app.superkabe.lvh.me:3000/dashboard`
- `http://app.superkabe.lvh.me:3000/blog`  → bounces to `superkabe.lvh.me:3000/blog`
- `http://app.superkabe.lvh.me:3000/`      → bounces to `/dashboard` (logged in) or `/login`

## Setup

### 1. Frontend env

Create or edit `Drason-staging/frontend/.env.local`:

```env
# Backend the Next.js rewrite proxies /api/* to. Use the lvh.me hostname
# so the cookie origin matches the app subdomain (the rewrite preserves
# the browser-visible host, which is app.superkabe.lvh.me).
NEXT_PUBLIC_API_URL=http://api.superkabe.lvh.me:4000

# Subdomain-split mode flips ON when both of these are set. Without them
# the frontend falls back to single-domain behavior, so this file is the
# only thing standing between staging and the new architecture.
NEXT_PUBLIC_APP_URL=http://app.superkabe.lvh.me:3000
NEXT_PUBLIC_MARKETING_URL=http://superkabe.lvh.me:3000
```

### 2. Backend env

`Drason-backend-staging/.env` should have:

```env
NODE_ENV=development
PORT=4000
# Frontend origin for CORS (dev mode allows everything anyway, but set this
# correctly so the same .env works if you flip NODE_ENV=production for a
# production-mode CORS test).
FRONTEND_URL=http://app.superkabe.lvh.me:3000
BACKEND_URL=http://api.superkabe.lvh.me:4000
# ... your existing DB_URL, JWT_SECRET, POLAR_*, GOOGLE_*, etc.
```

### 3. Start both servers

```powershell
# Terminal 1 — backend
cd C:\Users\AMD\Drason-backend-staging
npm run dev   # listens on 0.0.0.0:4000

# Terminal 2 — frontend
cd C:\Users\AMD\Drason-staging\frontend
npm run dev   # listens on 0.0.0.0:3000
```

Both `next dev` and the Express backend bind to `0.0.0.0` by default, so
`*.lvh.me:3000` and `api.superkabe.lvh.me:4000` will resolve and connect
without any extra config.

### 4. Open the right URL

Start at:

```
http://superkabe.lvh.me:3000
```

You should see the marketing landing. Click "Sign in" or navigate to
`/dashboard` — you'll be redirected to `app.superkabe.lvh.me:3000/login`.
Sign in. The cookie is set on `app.superkabe.lvh.me` (host-only), so
the marketing site never sees it. Navigate around — every cross-subdomain
attempt redirects to the correct host.

## Test checklist

Run through these to validate the architecture:

- [ ] **Marketing-only access**: `http://superkabe.lvh.me:3000/` loads the landing page.
- [ ] **Marketing routes stay on root**: `/blog`, `/pricing`, `/docs/*` stay on `superkabe.lvh.me`.
- [ ] **Dashboard route bounces to app**: `http://superkabe.lvh.me:3000/dashboard` redirects to `http://app.superkabe.lvh.me:3000/dashboard`.
- [ ] **App subdomain `/` fallback**: `http://app.superkabe.lvh.me:3000/` redirects to `/login` (unauth) or `/dashboard` (authed).
- [ ] **Marketing route on app bounces back**: `http://app.superkabe.lvh.me:3000/blog` redirects to `http://superkabe.lvh.me:3000/blog`.
- [ ] **Sign up flow**: complete signup on app subdomain, get redirected to dashboard, JWT cookie scoped to `app.superkabe.lvh.me`.
- [ ] **Cookie isolation**: in DevTools Application → Cookies, the `token` cookie is listed under `app.superkabe.lvh.me`, NOT `superkabe.lvh.me`.
- [ ] **API calls work from app**: dashboard fetches `/api/*` successfully (Next.js rewrite handles the proxy).
- [ ] **Logout**: from dashboard, click logout. Cookie cleared. Redirected to `/login` on app subdomain.
- [ ] **Google OAuth (mailbox)**: click Connect Google Workspace. Redirects to Google → comes back to dashboard with mailbox connected. The OAuth state nonce carries the org context so no cookie required on the backend callback.

## Reverting

To go back to single-domain behavior, delete (or comment out) these two
lines from `frontend/.env.local`:

```env
# NEXT_PUBLIC_APP_URL=...
# NEXT_PUBLIC_MARKETING_URL=...
```

Restart `npm run dev`. Middleware falls back to the original logic.

## Going to production

Once the local test passes, the prod cutover is:

1. **DNS**: add `app.superkabe.com` (CNAME or A) pointing at Vercel.
2. **Vercel**: add `app.superkabe.com` as a domain on the project; keep
   `superkabe.com` and `www.superkabe.com` too.
3. **Vercel env (Production)**: add
   - `NEXT_PUBLIC_APP_URL=https://app.superkabe.com`
   - `NEXT_PUBLIC_MARKETING_URL=https://www.superkabe.com`
4. **Backend env (Railway)**: ensure `FRONTEND_URL=https://app.superkabe.com`
   so CORS still matches. CORS already has `https://app.superkabe.com` in
   the allowlist alongside `superkabe.com` and `www.superkabe.com`, so
   both work transitionally.
5. **Optional 301 redirects**: in `superkabe.com`'s middleware (or
   `vercel.json`), 301 `/dashboard/*`, `/login`, `/signup` to
   `https://app.superkabe.com/...` so existing bookmarks still work.

The middleware change is already shipped (gated on the env vars), so
the cutover is *just* a config change in step 3 — no code redeploy.

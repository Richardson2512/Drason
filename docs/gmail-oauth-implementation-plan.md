# Gmail OAuth 2.0 Implementation Plan

## Overview
This document outlines the complete implementation plan for integrating Google OAuth 2.0 authentication into Drason, replacing the current email/password login with secure Google Sign-In.

---

## Phase 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. **Project Name**: `Drason` or `Superkabe`
4. Click "Create"

### 1.2 Enable Google+ API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click "Enable"

### 1.3 Configure OAuth Consent Screen
1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public access)
3. Fill in required fields:
   - **App name**: `Superkabe`
   - **User support email**: Your support email
   - **App logo**: Upload Superkabe logo (optional but recommended)
   - **Application home page**: `https://superkabe.com` (your production domain)
   - **Application privacy policy link**: `https://superkabe.com/privacy` (create if needed)
   - **Application terms of service link**: `https://superkabe.com/terms` (create if needed)
   - **Authorized domains**:
     - `superkabe.com` (production)
     - `railway.app` (if using Railway subdomain)
4. **Scopes**: Add the following scopes:
   - `openid`
   - `email`
   - `profile`
5. **Test users** (for development):
   - Add your Gmail address
   - Add any team member emails
6. Click "Save and Continue"

### 1.4 Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth 2.0 Client ID**
3. **Application type**: Web application
4. **Name**: `Superkabe Web Client`
5. **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://superkabe.com` (your actual domain)
   - Railway: `https://your-app.railway.app`
6. **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://superkabe.com/api/auth/google/callback`
   - Railway: `https://your-app.railway.app/api/auth/google/callback`
7. Click **"Create"**
8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately

---

## Phase 2: Backend Implementation

### 2.1 Environment Variables
Add to Railway environment variables (and `.env.local` for development):

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback

# For development
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**⚠️ WHEN TO REQUEST FROM USER:**
I will need the **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET** after you complete step 1.4 above (creating OAuth credentials in Google Cloud Console).

### 2.2 Install Dependencies
```bash
cd backend
npm install googleapis@^118.0.0
```

```bash
cd frontend
npm install next-auth@^4.24.5
```

### 2.3 Backend API Routes Structure

**Create these files:**

#### `/backend/src/routes/auth.ts`
- `GET /api/auth/google` - Initiates OAuth flow
- `GET /api/auth/google/callback` - Handles OAuth redirect
- `POST /api/auth/logout` - Clears session

#### `/backend/src/services/googleOAuthService.ts`
- `generateAuthUrl()` - Creates Google OAuth URL with state parameter
- `exchangeCodeForTokens(code)` - Exchanges authorization code for access/refresh tokens
- `getUserInfo(accessToken)` - Fetches user profile from Google
- `refreshAccessToken(refreshToken)` - Refreshes expired access token

#### `/backend/src/controllers/googleAuthController.ts`
- `initiateGoogleAuth()` - Redirects user to Google consent screen
- `handleGoogleCallback()` - Processes OAuth callback, creates/updates user, sets session cookie

### 2.4 Database Schema Updates

**Add to `prisma/schema.prisma`:**

```prisma
model User {
  id              String       @id @default(uuid())
  email           String       @unique
  password_hash   String?      // Make optional for OAuth users
  name            String?
  role            String       @default("viewer")
  organization_id String
  last_login_at   DateTime?
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt

  // OAuth fields
  google_id       String?      @unique  // Google user ID
  google_access_token  String?         // Encrypted access token
  google_refresh_token String?         // Encrypted refresh token
  google_token_expires_at DateTime?    // Token expiry timestamp
  avatar_url      String?              // Google profile picture

  organization    Organization @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([email])
  @@index([google_id])
}
```

**Migration:**
```bash
cd backend
npx prisma migrate dev --name add_google_oauth_fields
npx prisma generate
```

---

## Phase 3: Frontend Implementation

### 3.1 Update Login Page (`/frontend/src/app/login/page.tsx`)

**Add Google OAuth handler:**

```typescript
const handleGoogleLogin = () => {
    // Redirect to backend OAuth initiation endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
};
```

**Update Google button:**

```typescript
<button
    type="button"
    onClick={handleGoogleLogin}
    className="w-full bg-white border border-[#E2E8F0] text-[#718096] font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
>
    <div className="w-5 h-5 relative">
        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" fill />
    </div>
    <span className="text-sm">Sign in with Google</span>
</button>
```

### 3.2 OAuth Callback Page

**Create `/frontend/src/app/auth/google/callback/page.tsx`:**

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        if (error) {
            // Show error message and redirect to login
            console.error('OAuth error:', error);
            router.push('/login?error=' + encodeURIComponent(error));
        } else if (success === 'true') {
            // Successful authentication - redirect to dashboard
            router.push('/dashboard');
        } else {
            // Invalid state - redirect to login
            router.push('/login');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C4532] mx-auto mb-4"></div>
                <p className="text-[#718096]">Completing sign in...</p>
            </div>
        </div>
    );
}
```

---

## Phase 4: Security Implementation

### 4.1 State Parameter Validation
- Generate random state parameter before OAuth redirect
- Store in Redis with 5-minute TTL
- Validate on callback to prevent CSRF attacks

### 4.2 Token Encryption
- Encrypt access/refresh tokens before storing in database
- Use existing encryption service (`backend/src/services/encryptionService.ts`)
- Decrypt only when needed for API calls

### 4.3 Token Refresh Strategy
- Check token expiry before API calls
- Automatically refresh if expired using refresh token
- Update database with new tokens

### 4.4 Session Management
- Keep existing JWT session cookie approach
- Include Google user ID in JWT payload
- Set httpOnly, secure, sameSite flags

---

## Phase 5: User Flow

### 5.1 New User Registration via Google
1. User clicks "Sign in with Google" on `/login`
2. Redirected to Google consent screen
3. User grants permissions
4. Google redirects to `/api/auth/google/callback?code=...&state=...`
5. Backend exchanges code for tokens
6. Backend fetches user profile from Google
7. Check if user exists by `google_id` or `email`
8. If new user:
   - Create new User record
   - Create new Organization (use Google display name)
   - Store encrypted tokens
9. Set JWT session cookie
10. Redirect to `/dashboard`

### 5.2 Existing User Login via Google
1. Same flow as new user (steps 1-7)
2. User found by `google_id` or `email`
3. Update `google_access_token`, `google_refresh_token`, `google_token_expires_at`
4. Update `last_login_at`
5. Set JWT session cookie
6. Redirect to `/dashboard`

### 5.3 Hybrid Users (Email + Google)
- User registers with email/password
- Later links Google account
- Both `password_hash` and `google_id` populated
- Can log in with either method

---

## Phase 6: Migration Strategy

### 6.1 Existing Users
- Keep email/password login working alongside Google OAuth
- Add "Link Google Account" button in user settings
- Encourage users to link Google for easier access

### 6.2 Future: Force Google OAuth
- After 90% adoption, consider deprecating email/password
- Send email notifications 30 days before deprecation
- Provide migration guide

---

## Phase 7: Testing Checklist

### Local Development Testing
- [ ] New user can sign up with Google
- [ ] Existing user can log in with Google
- [ ] User profile data synced correctly (name, email, avatar)
- [ ] Session persists after Google login
- [ ] Token refresh works when expired
- [ ] Logout clears session and redirects
- [ ] Error handling works (user denies permission, invalid state)

### Production Testing
- [ ] OAuth flow works on Railway domain
- [ ] Redirect URIs match Google Cloud Console config
- [ ] HTTPS enforced for all OAuth requests
- [ ] Tokens encrypted in database
- [ ] No sensitive data in logs

---

## Phase 8: Deployment

### 8.1 Backend Deployment (Railway)
1. Add environment variables to Railway:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
2. Run Prisma migration on production database:
   ```bash
   npx prisma migrate deploy
   ```
3. Push backend changes to Git (Railway auto-deploys)

### 8.2 Frontend Deployment
1. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to environment variables
2. Push frontend changes to Git
3. Verify OAuth callback URLs in Google Cloud Console

---

## Implementation Order

### Week 1: Core OAuth Flow
1. ✅ Remove Facebook auth button (COMPLETED)
2. Set up Google Cloud Console (Steps 1.1-1.4) → **REQUEST CLIENT_ID/SECRET FROM USER**
3. Add environment variables to Railway
4. Run database migration (`add_google_oauth_fields`)
5. Implement `googleOAuthService.ts`
6. Implement `googleAuthController.ts`
7. Add OAuth routes to backend

### Week 2: Frontend Integration
1. Add Google login handler to login page
2. Create OAuth callback page
3. Test new user registration flow
4. Test existing user login flow
5. Implement error handling

### Week 3: Security & Polish
1. Implement state parameter validation
2. Add token encryption
3. Add token refresh logic
4. Add "Link Google Account" to user settings (optional)
5. End-to-end testing

### Week 4: Production Deployment
1. Deploy to Railway
2. Update Google Cloud Console with production URLs
3. Test on live environment
4. Monitor for errors
5. Document for users

---

## Required Information from User

### NOW (Before Implementation Starts):
Nothing yet - user needs to complete Google Cloud Console setup first (Phase 1)

### AFTER Google Cloud Console Setup:
Once you complete **Phase 1, Step 1.4** (Create OAuth 2.0 Credentials), I will need:

1. **GOOGLE_CLIENT_ID** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
2. **GOOGLE_CLIENT_SECRET** (looks like: `GOCSPX-abc123xyz...`)

**How to find these:**
- Go to Google Cloud Console → APIs & Services → Credentials
- Click on the OAuth 2.0 Client ID you created
- Copy **Client ID** and **Client secret**

---

## Files to Create

### Backend
1. `/backend/src/routes/auth.ts` (or update existing)
2. `/backend/src/services/googleOAuthService.ts`
3. `/backend/src/controllers/googleAuthController.ts`
4. `/backend/prisma/migrations/XXXXXX_add_google_oauth_fields/migration.sql`

### Frontend
1. `/frontend/src/app/auth/google/callback/page.tsx`

### Modified Files
1. ✅ `/frontend/src/app/login/page.tsx` (Facebook removed)
2. `/frontend/src/app/login/page.tsx` (add Google handler)
3. `/backend/prisma/schema.prisma` (add OAuth fields)
4. `/backend/src/index.ts` (register OAuth routes)

---

## Cost Considerations
- **Google OAuth**: FREE for standard sign-in
- **API Quotas**: 10,000 requests/day (sufficient for typical usage)
- **No additional costs** for implementing Google Sign-In

---

## Support Resources
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Server-side Apps](https://developers.google.com/identity/sign-in/web/server-side-flow)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

---

## Next Steps

**For User:**
1. Complete **Phase 1** (Google Cloud Console setup)
2. Create OAuth credentials (Step 1.4)
3. Provide **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET** to me

**For Implementation:**
Once credentials received, I will:
1. Add environment variables
2. Run database migration
3. Implement backend OAuth service
4. Update frontend login page
5. Create OAuth callback handler
6. Test end-to-end flow
7. Deploy to Railway

---

**STATUS**: ✅ Facebook auth removed, awaiting Google Cloud Console setup

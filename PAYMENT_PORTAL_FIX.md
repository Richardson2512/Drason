# Payment Portal Error - Diagnosis & Fix

**Date**: February 20, 2026
**Status**: ✅ **UX BUGS FIXED** | ⚠️ **Environment Variables Needed**

---

## 🔍 Root Cause Analysis

### Issue #1: Missing Polar Environment Variables (Most Likely)
**Severity**: ⚠️ **CRITICAL** - Blocks all checkout attempts

The Polar API integration requires **6 environment variables** to be set on Railway:

```bash
# Required for Polar API Integration
POLAR_ACCESS_TOKEN=polar_your_access_token_here
POLAR_STARTER_PRODUCT_ID=prod_starter_id_from_polar
POLAR_GROWTH_PRODUCT_ID=prod_growth_id_from_polar
POLAR_SCALE_PRODUCT_ID=prod_scale_id_from_polar
POLAR_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=https://your-frontend.vercel.app
```

**Without these variables**:
- Line 126 of `polarClient.ts` throws: `Invalid tier or missing product ID: ${tier}`
- Checkout creation fails silently
- User sees generic "Failed to create checkout" error

---

### Issue #2: Active Subscription Blocking Upgrades
**Severity**: 🚫 **HIGH** - Bad UX, blocks legitimate upgrades

**Original Logic** (backend/src/controllers/billingController.ts:90-92):
```typescript
if (org.subscription_status === 'active') {
    return res.status(400).json({
        error: 'Already have an active subscription. Cancel first to change tiers.'
    });
}
```

**Problem**:
- Blocked ALL tier changes for active subscriptions
- Users with active "Starter" plan couldn't upgrade to "Growth"
- Forced users to cancel → lose access → resubscribe (terrible UX)

**✅ FIXED** - New Logic:
```typescript
// Allow upgrades for active subscriptions, but block downgrades and lateral moves
if (org.subscription_status === 'active') {
    const tierOrder: Record<string, number> = {
        'trial': 0,
        'starter': 1,
        'growth': 2,
        'scale': 3,
        'enterprise': 4
    };

    const currentTierRank = tierOrder[org.subscription_tier || 'trial'] || 0;
    const requestedTierRank = tierOrder[tier] || 0;

    // Block downgrades and lateral moves
    if (requestedTierRank <= currentTierRank) {
        return res.status(400).json({
            error: `Cannot downgrade or switch to same tier. Current tier: ${org.subscription_tier}. To change to ${tier}, please cancel your subscription first.`
        });
    }

    // Allow upgrade - proceed to create checkout
}
```

**Now Allows**:
- ✅ Starter → Growth (upgrade)
- ✅ Starter → Scale (upgrade)
- ✅ Growth → Scale (upgrade)

**Blocks**:
- ❌ Growth → Starter (downgrade - must cancel first)
- ❌ Starter → Starter (lateral move - already on this plan)

---

### Issue #3: Frontend Hides Upgrade Buttons for Active Users
**Severity**: 🎨 **MEDIUM** - Confusing UX, hides legitimate upgrade options

**Original Logic** (frontend/src/app/dashboard/billing/page.tsx:373):
```typescript
{currentTier !== 'scale' && currentTier !== 'enterprise' &&
 data?.subscription.status !== 'canceled' &&
 data?.subscription.status !== 'active' && (  // ← This blocked active users
```

**Problem**:
- Completely hid upgrade section for users with active subscriptions
- Active users couldn't see upgrade options

**✅ FIXED** - New Logic:
```typescript
// Removed the 'status !== active' condition
{currentTier !== 'scale' && currentTier !== 'enterprise' &&
 data?.subscription.status !== 'canceled' && (
```

**Plus smart filtering**:
```typescript
// Skip lower tiers for active subscriptions
if (data?.subscription.status === 'active' && isLowerTier) {
    return null;
}
```

**Now Shows**:
- ✅ Only higher tiers when user has active subscription
- ✅ "Upgrade to Growth" button for Starter users
- ✅ "Current Plan" (disabled) for current tier
- ✅ Hides lower tiers (no downgrades shown)

---

## 📁 Files Modified

### Backend
1. **backend/src/controllers/billingController.ts** (lines 88-107)
   - Changed subscription blocking logic to allow upgrades
   - Added tier ranking system
   - Clear error messages for downgrades

### Frontend
2. **frontend/src/app/dashboard/billing/page.tsx** (lines 372-442)
   - Removed `status !== 'active'` condition
   - Added tier ranking logic
   - Filter out lower tiers for active users
   - Dynamic button text: "Upgrade to" vs "Subscribe to" vs "Current Plan"
   - Disable current plan button for active users

---

## 🚀 Deployment Steps

### 1. Configure Railway Environment Variables ⚠️ CRITICAL

**Login to Railway Dashboard**:
1. Go to https://railway.app
2. Select your Drason backend project
3. Click "Variables" tab
4. Add the following variables:

```bash
POLAR_ACCESS_TOKEN=polar_your_access_token_here
POLAR_STARTER_PRODUCT_ID=prod_starter_id_from_polar
POLAR_GROWTH_PRODUCT_ID=prod_growth_id_from_polar
POLAR_SCALE_PRODUCT_ID=prod_scale_id_from_polar
POLAR_WEBHOOK_SECRET=whsec_your_webhook_secret_here
FRONTEND_URL=https://drason.vercel.app  # Replace with your Vercel URL
```

**Where to Get These Values**:
- Go to Polar.sh dashboard: https://polar.sh
- Navigate to **Products** → Create 3 products (Starter, Growth, Scale)
- Copy each product ID
- Navigate to **Settings** → **API Keys** → Create access token
- Navigate to **Webhooks** → Create webhook → Copy webhook secret

**Save** → Railway will auto-redeploy

---

### 2. Deploy Code Changes

**Push to Git** (Railway auto-deploys):
```bash
cd backend
git add src/controllers/billingController.ts
git commit -m "fix: allow upgrades for active subscriptions, block downgrades"
git push origin main
```

**Frontend** (already auto-deploys to Vercel):
```bash
cd frontend
git add src/app/dashboard/billing/page.tsx
git commit -m "fix: show upgrade options for active subscriptions"
git push origin main
```

**Monitor Deployment**:
- Railway: https://railway.app → Check deployment logs (2-5 mins)
- Vercel: https://vercel.com → Check deployment status (1-2 mins)

---

## ✅ Testing the Fix

### Test Scenario 1: Trial User Upgrading
**Steps**:
1. Login as trial user
2. Navigate to `/dashboard/billing`
3. Should see 3 plans: Starter, Growth, Scale
4. Click "Continue with Starter" (or any plan)
5. Should redirect to Polar checkout
6. Complete payment
7. Should return to dashboard with active subscription

**Expected Behavior**: ✅ Works (after env vars configured)

---

### Test Scenario 2: Active Starter User Upgrading
**Steps**:
1. Login as user with active Starter plan
2. Navigate to `/dashboard/billing`
3. Should see:
   - "Upgrade Your Plan" heading
   - Current Plan: Starter (disabled "Current Plan" button)
   - Growth plan (enabled "Upgrade to Growth" button)
   - Scale plan (enabled "Upgrade to Scale" button)
4. Click "Upgrade to Growth"
5. Should redirect to Polar checkout
6. Complete payment
7. Should be upgraded to Growth

**Expected Behavior**: ✅ Works (after fix deployed)

---

### Test Scenario 3: Active Growth User Trying to Downgrade
**Steps**:
1. Login as user with active Growth plan
2. Navigate to `/dashboard/billing`
3. Should see:
   - "Upgrade Your Plan" heading
   - Growth plan (disabled "Current Plan" button)
   - Scale plan (enabled "Upgrade to Scale" button)
   - Starter plan NOT shown (downgrade hidden)
4. User can only upgrade to Scale or stay on Growth

**Expected Behavior**: ✅ Works (after fix deployed)

---

## 🔧 Error Messages

### Before Fix
```
Error: Already have an active subscription. Cancel first to change tiers.
```

### After Fix
**Upgrade (allowed)**:
```
✅ Redirects to Polar checkout
```

**Downgrade (blocked)**:
```
Error: Cannot downgrade or switch to same tier. Current tier: growth.
To change to starter, please cancel your subscription first.
```

**Missing Env Vars (still possible)**:
```
Error: Failed to create checkout session
```
→ Check Railway environment variables

---

## 📊 Summary

| Issue | Status | Impact |
|-------|--------|--------|
| Missing Environment Variables | ⚠️ **NEEDS CONFIGURATION** | Blocks all checkouts |
| Active Subscription Blocking | ✅ **FIXED** | Now allows upgrades |
| Frontend Hiding Upgrade Buttons | ✅ **FIXED** | Now shows upgrades |

---

## 🎯 Next Steps

1. **CRITICAL**: Configure Polar environment variables on Railway
2. Deploy backend changes (auto-deploy via git push)
3. Deploy frontend changes (auto-deploy via git push)
4. Test upgrade flow with trial account
5. Test upgrade flow with active Starter account
6. Monitor Polar webhooks for successful payments

---

## 📞 Support

If you still see errors after deploying:

1. **Check Railway Logs**:
   ```bash
   railway logs --tail
   ```
   Look for: "Missing POLAR_*" or "Failed to create customer"

2. **Check Browser Console**:
   - Open DevTools → Console tab
   - Look for API error responses

3. **Check Polar Dashboard**:
   - Verify products are created
   - Verify webhook is configured
   - Check for failed API calls

---

**Date**: February 20, 2026
**Fixed by**: Richardson (Claude Code)
**Status**: ✅ **Code Fixed** | ⚠️ **Env Vars Needed**

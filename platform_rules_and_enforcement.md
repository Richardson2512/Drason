# 🛡️ Drason Platform Rules & Enforcement Guide

> **Purpose**: Comprehensive guide to all automated rules, thresholds, and enforcement mechanisms before deploying to production.

---

## 📊 **System Overview**

Drason operates in **3 modes** that control enforcement behavior:

| Mode | Behavior | Use Case |
|------|----------|----------|
| **OBSERVE** | Logs all events, no automated actions | Testing, learning baseline metrics |
| **SUGGEST** | Provides recommendations, no blocking | Review suggestions before automation |
| **ENFORCE** | Fully automated pausing and blocking | Production-ready automated protection |

> **Current Setting**: Your organization is in **ENFORCE** mode (set during seed script).

---

## 🎯 **Mailbox-Level Rules**

### **Rule 1: Bounce Rate Monitoring**

**Threshold**: `5 bounces` within a sliding window

**Window Size**: `100 sent emails`

**Action**: Automatic pause

**Enforcement Flow**:
```
Email Sent → Counter +1 → Check: Bounces ≥ 5?
    ├─ YES → PAUSE mailbox + Calculate cooldown
    └─ NO  → Continue monitoring
```

**Example**:
- Mailbox sends 50 emails, gets 3 bounces → ✅ Healthy
- Sends 10 more, gets 2 more bounces (total: 5) → ⚠️ **PAUSED**

---

### **Rule 2: Window Reset (Healing Mechanism)**

**Trigger**: After `100 clean sends`

**Action**: Reset bounce/send counters

**Purpose**: Allow mailboxes to recover after temporary issues

**Flow**:
```
Sent Count reaches 100 → Reset window → Bounces = 0, Sends = 0
    └─ If status = "recovering" AND bounces = 0 → Transition to "healthy"
```

---

### **Rule 3: Exponential Cooldown**

**Formula**: `Cooldown = 1 hour × 2^(consecutive_pauses - 1)`

**Progression**:
| Pause # | Cooldown Duration | Notes |
|---------|-------------------|-------|
| 1st | 1 hour | Initial warning |
| 2nd | 2 hours | Pattern emerging |
| 3rd | 4 hours | Serious issue |
| 4th | 8 hours | Critical problem |
| 5th | 16 hours | Maximum penalty |
| 6+  | 16 hours (capped) | Stays at max |

**Reset Condition**: Cooldown resets to 0 when mailbox transitions back to "healthy"

---

## 🌐 **Domain-Level Rules**

### **Rule 4: Domain Aggregation**

**Threshold**: `2 or more unhealthy mailboxes` on the same domain

**Unhealthy States**: `paused`, `warning`, `recovering`, or any status except `healthy`/`active`

**Action**: 
1. Pause the entire domain
2. **Cascade pause** to all remaining active mailboxes on that domain
3. Apply exponential cooldown (same formula as mailboxes)

**Example**:
```
Domain: sales.company.com
├─ Mailbox A (healthy)
├─ Mailbox B (paused)     ← Unhealthy #1
└─ Mailbox C (recovering) ← Unhealthy #2

Result: Domain PAUSED + Mailbox A also paused
```

---

## 🚪 **Execution Gate (Lead Processing)**

The execution gate runs **5 critical checks** before allowing a lead to be pushed to Smartlead:

### **Check 1: Campaign Active**
- ❌ Fail if campaign doesn't exist or is not "active"
- ✅ Pass if campaign status = "active"

### **Check 2: Domain Healthy**
- ❌ Fail if domain is paused/recovering
- ✅ Pass if domain status = "healthy"

### **Check 3: Mailbox Available**
- ❌ Fail if:
  - No mailboxes synced
  - All mailboxes are paused
  - All mailboxes are in cooldown
- ✅ Pass if at least 1 mailbox is:
  - Status = "healthy"
  - Cooldown expired or NULL
  - Domain is healthy

### **Check 4: Below Capacity**
- ✅ Always passes (future: add rate limiting)

### **Check 5: Risk Acceptable**
- **Threshold**: Average risk score < `75`
- Calculated from all healthy mailboxes
- ❌ Fail if average risk ≥ 75
- ✅ Pass if average risk < 75

---

## 🎭 **Mode-Based Behavior**

### **OBSERVE Mode**
```javascript
All checks run → Results logged → Lead ALLOWED regardless
```
- No blocking
- No pausing
- Pure data collection

### **SUGGEST Mode**
```javascript
All checks run → Recommendations generated → Lead ALLOWED
```
- Warnings shown in UI
- No automated actions
- Manual review encouraged

### **ENFORCE Mode**
```javascript
All checks run → ANY fail → Lead BLOCKED
                 → All pass → Lead ALLOWED
```
- Strict enforcement
- Automated pausing
- Zero tolerance for threshold breaches

---

## 📈 **Risk Score Calculation**

Risk score is calculated per-mailbox using these components:

### **Components**:
1. **Bounce Ratio** (0-40 points)
   - `(bounces / sends) × 40`
   
2. **Failure Ratio** (0-30 points)
   - `(delivery_failures / sends) × 30`
   
3. **Velocity Factor** (0-20 points)
   - Based on send rate acceleration
   
4. **Escalation Factor** (0-10 points)
   - `consecutive_pauses × 2` (capped at 10)

### **Score Ranges**:
| Score | State | Action |
|-------|-------|--------|
| 0-49  | Healthy | Normal operation |
| 50-74 | Warning | Monitoring closely |
| 75-100 | Critical | Automatic pause |

---

## 🔄 **State Machine**

### **Mailbox States**:
```
healthy → warning → paused → recovering → healthy
   ↓         ↓                    ↓
   └─────────┴────────────────────┘
```

**Valid Transitions**:
- `healthy` → `warning`, `paused`
- `warning` → `healthy`, `paused`
- `paused` → `recovering` (only)
- `recovering` → `healthy`, `warning`

**Invalid**: Any transition not listed above will be rejected

### **Domain States**:
Same as mailbox states (healthy → warning → paused → recovering)

### **Lead States**:
```
held → active ⟷ paused → completed
```

---

## ⚙️ **Configuration Summary**

### **Hardcoded Thresholds** (in `types/index.ts`):
```typescript
MAILBOX_BOUNCE_THRESHOLD: 5      // Bounces before pause
MAILBOX_WINDOW_SIZE: 100         // Sends before window reset
DOMAIN_WARNING_THRESHOLD: 2      // Unhealthy mailboxes before domain pause
RISK_SCORE_WARNING: 50           // Enter warning state
RISK_SCORE_CRITICAL: 75          // Trigger pause
COOLDOWN_MINIMUM_MS: 3600000     // 1 hour (in ms)
COOLDOWN_MULTIPLIER: 2           // Exponential backoff factor
```

### **To Change Thresholds**:
1. Edit `/Users/richardson/Documents/Drason/backend/src/types/index.ts`
2. Modify `MONITORING_THRESHOLDS` object
3. Restart backend server
4. Monitor effects in OBSERVE mode first

---

## 🚨 **Production Readiness Checklist**

Before deploying to production:

- [ ] **Set System Mode**: Choose OBSERVE → SUGGEST → ENFORCE progression
- [ ] **Baseline Metrics**: Run in OBSERVE for 24-48 hours to collect baseline data
- [ ] **Review Thresholds**: Ensure bounce threshold (5) and domain threshold (2) fit your use case
- [ ] **Webhook Security**: Set `smartlead_webhook_secret` in organization settings
- [ ] **Monitor Logs**: Watch audit logs for patterns before enabling ENFORCE
- [ ] **Test Recovery**: Manually pause/resume a mailbox to verify cooldown logic
- [ ] **Alert Integration**: Set up monitoring for critical events (domain pauses, high risk scores)

---

## 📚 **Related Files**

- [monitoringService.ts](file:///Users/richardson/Documents/Drason/backend/src/services/monitoringService.ts) - Bounce tracking, pause logic
- [executionGateService.ts](file:///Users/richardson/Documents/Drason/backend/src/services/executionGateService.ts) - Lead execution gating
- [types/index.ts](file:///Users/richardson/Documents/Drason/backend/src/types/index.ts) - All thresholds and enums
- [metricsService.ts](file:///Users/richardson/Documents/Drason/backend/src/services/metricsService.ts) - Risk score calculation

---

## 💡 **Key Takeaway**

> **In ENFORCE mode**, Drason will **automatically pause** mailboxes that hit 5 bounces within 100 sends, pause domains with 2+ unhealthy mailboxes, and **block lead execution** if any health check fails. Make sure you're comfortable with this level of automation before enabling it in production.

# Drason Lead Management & Email Health Systems — Deep Dive

## 1. Lead Ingestion & Health Classification

When a lead is ingested via `leadController.ts` → `leadService.ts`, it goes through:

1. **Creation** — Lead is created in `HELD` state with source `clay`
2. **Routing** — Immediately resolved via `routingService.resolveCampaignForLead()`
3. **Pre-Send Health Gate** — Classification via `leadHealthService.ts`

### Lead Health Scoring (0–100)

Starts at 100, penalties subtracted:

| Check | Penalty | Result |
|---|---|---|
| **Disposable domain** (mailinator, tempmail, etc.) | **−100** | Instant RED |
| **Role-based email** (info@, admin@, sales@, etc.) | −30 | Major penalty |
| **Suspicious TLD** (.xyz, .tk, .ml, etc.) | −25 | Moderate penalty |
| **Catch-all domain** | −20 | Moderate penalty |
| **New domain** (<90 days) | −15 | Minor penalty |

### Classification Thresholds

| Score Range | Classification | Action |
|---|---|---|
| ≥ 80 | 🟢 GREEN | Proceed to campaign |
| 50–79 | 🟡 YELLOW | Proceed with caution |
| < 50 | 🔴 RED | **Blocked** — lead will not enter campaign |

> **IMPORTANT:** RED leads are blocked by the Execution Gate and logged to the audit trail. They never reach Smartlead.

---

## 2. Lead Routing

`routingService.ts` uses **deterministic rule-based routing**:

- Rules are per-organization, evaluated in **priority order** (highest first)
- Each rule matches on **persona** (case-insensitive) + **minimum lead score**
- First match wins → lead assigned to `target_campaign_id`
- No match → lead stays in **holding pool** (no campaign assigned)

```
Rule evaluation: persona match (case-insensitive) AND lead_score >= min_score
```

---

## 3. Mailbox: Pause Criteria (Negative Signals)

`monitoringService.ts` implements **tiered threshold-based** mailbox pausing:

### Tiered Thresholds

| Level | Condition | Action |
|---|---|---|
| ⚠️ **WARNING** | 3 bounces within 60 sends (5%) | Transition to `warning` state |
| 🛑 **PAUSE** | 5 bounces within 100 sends (5%) | Transition to `paused` state + cooldown |

### Additional Pause Triggers (via metricsWorker)

The `metricsWorker.ts` runs every 60 seconds and can also pause mailboxes based on the **ExecutionRiskScore** (0–100):

| Risk Score | Level | Action |
|---|---|---|
| < 25 | Low | No action |
| 25–49 | Medium | Monitor |
| ≥ 50 | High → WARNING | Transition to `warning` |
| ≥ 75 | Critical → PAUSE | Transition to `paused` |

Risk score is composed of:
- **Bounce ratio** (0–40 pts) — 1h bounce rate weighted 2× + 24h rate
- **Failure ratio** (0–30 pts) — delivery failure rates
- **Velocity** (0–20 pts) — rate of change (1h vs 24h deterioration)
- **Escalation** (0–10 pts) — +3 per consecutive pause

---

## 4. Mailbox: Healing Criteria (Resume/Recovery)

Recovery is a **multi-step process** with enforced cooldown:

### Step 1: Cooldown Must Expire

When paused, a mailbox enters a cooldown period with **exponential backoff**:

| Consecutive Pauses | Cooldown Duration |
|---|---|
| 1st pause | 1 hour |
| 2nd pause | 2 hours |
| 3rd pause | 4 hours |
| 4th pause | 8 hours |
| 5th+ pause | 16 hours (max) |

### Step 2: Transition to RECOVERING

Once cooldown expires, the metricsWorker automatically transitions the mailbox: `paused` → `recovering`

### Step 3: Health Verification

During `recovering` state, the mailbox is monitored:
- Uses a **sliding window** (not hard reset) — keeps 50% of previous stats to preserve volatility patterns
- If bounce rate drops below **3%** after a window slide → transition to `healthy`
- If risk score drops below **50** → transition to `healthy`
- If risk score re-exceeds **75** → back to `warning` (recovery failed)

### Step 4: Full Recovery

On transition to `healthy`:
- Cooldown is cleared
- Consecutive pause counter resets to 0
- Mailbox is available for sending again

---

## 5. Domain: Pause & Recovery

`monitoringService.ts` aggregates mailbox health to domain level:

### Domain Pause Criteria

**For large domains (≥ 3 mailboxes)** — ratio-based:

| Condition | Action |
|---|---|
| 30% mailboxes unhealthy | ⚠️ Domain WARNING |
| 50% mailboxes unhealthy | 🛑 Domain PAUSED |

**For small domains (< 3 mailboxes)** — hybrid absolute:

| Condition | Action |
|---|---|
| 1 unhealthy (of 1–2 total) | ⚠️ Domain WARNING |
| 2+ unhealthy | 🛑 Domain PAUSED |

### Domain Pause Consequences

When a domain is paused:
- **All remaining active/healthy mailboxes are cascade-paused**
- Domain enters cooldown with same exponential backoff as mailboxes

### Domain Recovery

Same cooldown + recovery flow as mailboxes — cooldown expires → `recovering` → health verification → `healthy`

---

## 6. Campaign Pause & Recovery

`campaignHealthService.ts` monitors **campaign-level** health:

### Campaign Pause Criteria

| Condition | Action |
|---|---|
| Bounce rate ≥ 5% (min 20 sends) | ⚠️ Campaign WARNING |
| Bounce rate ≥ 10% (min 20 sends) | 🛑 Campaign PAUSED |
| **Poisoning detected** (bounces on 3+ mailboxes AND >5 total bounces) | 🛑 Campaign PAUSED |

### Campaign Resume

Manual only — operator explicitly resumes. Warning count resets on resume.

---

## 7. Execution Gate

`executionGateService.ts` is the final pre-execution check. A lead can only be pushed to a campaign if **ALL** conditions pass:

| Check | What it verifies |
|---|---|
| `campaignActive` | Campaign status is `active` |
| `domainHealthy` | At least one domain is `healthy` |
| `mailboxAvailable` | At least one mailbox is `healthy` and not in cooldown |
| `riskAcceptable` | Hard risk score < 60 (bounce-based) |

### System Modes

Behavior is controlled by organization-level mode:

| Mode | Behavior |
|---|---|
| **OBSERVE** | All checks pass regardless — only logging |
| **SUGGEST** | All checks pass — returns recommendations |
| **ENFORCE** | Checks actively block execution |

### Risk Signal Separation

| Signal Type | Sources | Can Block? |
|---|---|---|
| **Hard signals** | Bounce rate, delivery failures | ✅ Yes (threshold: 60) |
| **Soft signals** | Velocity, escalation history | ❌ Never (log only) |

---

## 8. State Machine

All entities follow strict state machines defined in `types/index.ts`:

### Mailbox / Domain States

```
healthy ──→ warning ──→ paused ──→ recovering ──→ healthy
   │                       ↑            │
   └───────────────────────┘            └──→ warning
```

- `healthy` → can go to `warning` or `paused`
- `warning` → can go back to `healthy` or escalate to `paused`
- `paused` → can only go to `recovering` (after cooldown)
- `recovering` → can go to `healthy` (success) or `warning` (relapse)

### Lead States

```
held ──→ active ──→ completed
  │         │
  └──→ paused ──→ active / completed
```

- `held` → awaiting execution gate clearance
- `active` → pushed to campaign
- `paused` → halted due to system health
- `completed` → terminal state (replied, converted)
- `blocked` → blocked by health gate (RED classification)

---

## 9. What is NOT Currently Monitored

> **CAUTION: The following campaign performance metrics are NOT implemented:**

| Metric | Status |
|---|---|
| **Reply rate** | ❌ Not tracked |
| **Open rate** | ❌ Not tracked |
| **Response rate** | ❌ Not tracked |
| **Click rate** | ❌ Not tracked |
| **ICP configuration** | ❌ No ICP model exists |

The system currently monitors **only**:
- ✅ **Bounce rate** (hard bounces)
- ✅ **Delivery failure rate**
- ✅ **Velocity** (rate of change in bounce/failure rates)
- ✅ **Consecutive pause history** (for escalation scoring)

There is no ICP (Ideal Customer Profile) configuration system. Lead quality is determined solely by the email-level health checks (disposable domains, role-based emails, suspicious TLDs) — not by firmographic or demographic ICP matching.

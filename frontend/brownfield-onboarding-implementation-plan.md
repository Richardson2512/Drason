# Brownfield Onboarding & Infrastructure Health Assessment — Implementation Plan (v2)

> **v2 changelog**: Incorporated 7 hardening suggestions — DNSBL tri-state, assessment score scoping, campaign-infra health invariant, DNS manual recovery, report versioning, strict gate ordering, onboarding audit event.

## Executive Summary

Today, Drason initialises every domain and mailbox as `healthy` at the moment of Smartlead sync and begins monitoring only from that point forward. This means a customer who connects an email infrastructure that is **already damaged** — blacklisted domains, high-bounce mailboxes, degraded sender reputation — will have Drason immediately route leads through those unhealthy channels, causing further damage before the monitoring engine even has time to detect a problem.

This implementation introduces **Infrastructure Diagnosis at Onboarding** — the ability to assess the true health of an email infrastructure at the moment of connection, inherit the reality of its current state, and begin healing degraded components before any new leads are pushed through them.

---

## The Current Product (Before)

### What Happens Today When a User Connects Smartlead

1. User enters their Smartlead API key in the dashboard.
2. Drason calls the Smartlead API and fetches all campaigns and email accounts.
3. **Every domain is created with `status: 'healthy'`** — regardless of its actual reputation.
4. **Every active mailbox is created with `status: 'healthy'`** — regardless of its actual bounce history.
5. All counters start at zero: `hard_bounce_count: 0`, `total_sent_count: 0`, `window_bounce_count: 0`.
6. Monitoring begins from this point — but with no historical context.

### The Consequences

This greenfield assumption creates five critical blind spots:

**Blind Spot 1: Already-Damaged Mailboxes Are Used Immediately**
A mailbox that has a 15% bounce rate in Smartlead is treated as perfectly healthy in Drason. Leads are routed through it. More emails bounce. The damage compounds before Drason's monitoring even triggers a warning — because it takes 3 bounces within 60 sends to reach the WARNING threshold, and those 3 bounces are counted fresh, ignoring the hundreds of bounces already recorded in Smartlead.

**Blind Spot 2: Blacklisted Domains Are Not Detected**
If a domain is on Spamhaus, Barracuda, or other DNS blacklists, Drason has no way of knowing. It marks the domain as `healthy` and allows all its mailboxes to send. The emails land in spam or are rejected entirely, but Drason only sees the bounce events — it never understands the underlying cause (blacklisting) or recommends the correct remedy (blacklist removal, DNS fixes).

**Blind Spot 3: No Awareness of Existing Campaign Performance**
Smartlead tracks reply rates, open rates, and response rates for each campaign. Drason does not import any of this. A campaign with a 0.1% reply rate and a 25% bounce rate is treated identically to a campaign with a 30% reply rate and zero bounces — both start as `active` with `total_sent: 0`.

**Blind Spot 4: DNS Configuration Is Unchecked**
SPF, DKIM, and DMARC records are the foundation of email deliverability. If any of these are misconfigured — or missing entirely — emails are far more likely to be rejected or flagged as spam. Drason does not check any of these. A domain with no SPF record is treated the same as one with a perfect `p=reject` DMARC policy.

**Blind Spot 5: No Onboarding Assessment Report**
When a user connects their email infrastructure, they receive a simple success message: "Synced X campaigns, Y mailboxes." There is no diagnosis, no report card, no actionable insight into what is healthy and what needs attention. Users are flying blind until Drason's monitoring catches problems organically — which could take hours or days, and only after damage has already been done.

---

## The Post-Implementation Product (After)

### What Will Happen When a User Connects Smartlead

1. User enters their Smartlead API key in the dashboard.
2. Drason syncs campaigns and mailboxes (same as today).
3. **The Execution Gate is LOCKED** — no leads can be pushed until assessment completes. This is enforced by a new `assessment_completed` flag on the Organization model that the gate checks before allowing any execution. There is zero tolerance for a race condition here.
4. **Initial Health Assessment begins automatically.**
5. For each campaign, Drason imports historical performance data from Smartlead (bounce rate, total sent, total bounced).
6. For each mailbox, Drason fetches historical bounce and send counts from Smartlead and sets the initial state accordingly — not blindly as `healthy`, but based on actual performance.
7. For each domain, Drason performs DNS reputation checks: SPF presence, DKIM validity, DMARC policy, and blacklist lookups against major DNS blocklists. Each blacklist result is classified as `CONFIRMED` (positive hit), `NOT_LISTED` (clean), or `UNREACHABLE` (lookup failed). **A lookup failure is never treated as clean** — it results in `UNKNOWN` status and the domain enters `warning` state.
8. Each entity is classified into a health tier based on the assessment, with a hard invariant: **a campaign can never be healthier than its underlying domains or mailboxes.** Campaign health is additive — it can add warnings or pauses, but never compensate for infrastructure problems.
9. **An Infrastructure Health Report is generated** with an `assessment_version` tag for safe schema evolution, and presented to the user in the dashboard — a visual breakdown of every domain, mailbox, and campaign, showing what is healthy, what is at risk, and what is already damaged, with specific remediation advice.
10. **A one-time onboarding audit event is logged** summarising: number of entities paused, warned, and healthy — for production debugging.
11. Entities that are assessed as degraded enter the existing healing pipeline immediately — cooldown, recovery, and health verification — without waiting for new damage to accumulate.
12. **Only after assessment completes is the Execution Gate unlocked** — `assessment_completed` is set to `true`.

### The Five Blind Spots, Resolved

**Resolution 1: Historical Performance Import**
Mailboxes that already have high bounce rates in Smartlead are imported with their actual counters pre-populated. A mailbox with 15% historical bounce rate is immediately classified as `paused` and enters the cooldown → recovery pipeline. No new leads are sent through it until it heals.

**Resolution 2: Domain Reputation Diagnosis**
Every domain is checked against DNS blacklists (Spamhaus ZEN, Barracuda, SORBS, SpamCop). Each check returns one of three states: `CONFIRMED` (listed), `NOT_LISTED` (clean), or `UNREACHABLE` (lookup failed). A blacklisted domain is immediately set to `paused` with a clear explanation of which blacklists it appears on and how to delist. A domain where any blacklist check is `UNREACHABLE` is set to `warning` — because we do not trust what we cannot verify. DNS authentication records (SPF, DKIM, DMARC) are validated and any missing or misconfigured records are flagged with specific remediation steps.

**Resolution 3: Campaign Performance Awareness**
Historical campaign metrics from Smartlead (total sent, total bounced, bounce rate) are imported and used to set the initial campaign health state. Campaigns with bounce rates already above 10% are immediately paused. Campaigns with 5–10% bounce rates enter warning state. Critically, a campaign can never be set to a healthier state than its underlying infrastructure — if its domain is `paused`, the campaign is `paused` too, regardless of its own bounce rate.

**Resolution 4: DNS Authentication Validation**
SPF, DKIM, and DMARC records are checked for each domain. The health report tells the user exactly what is missing or misconfigured, with specific DNS records to add. Domains with all three properly configured receive a "fully authenticated" badge. **DNS-based recovery requires a manual re-assessment trigger** — Drason will never auto-resume a domain just because DNS looks fixed, because DNS propagation lies. The user must explicitly trigger a re-check via the `/api/assessment/:orgId/run` endpoint.

**Resolution 5: Infrastructure Health Report**
The user receives a comprehensive, visual health report upon first sync. The report includes a domain-by-domain breakdown with traffic-light colour coding (green/yellow/red), specific issues found, and step-by-step remediation advice. Each report carries an `assessment_version` tag so that as the report format evolves, older reports remain interpretable. This transforms the onboarding experience from "hope for the best" to "know exactly where you stand."

---

## Current vs Post-Implementation Comparison

| Capability | Current Product | Post-Implementation |
|---|---|---|
| **Mailbox initial state** | Always `healthy` | Based on historical bounce rate from Smartlead |
| **Domain initial state** | Always `healthy` | Based on DNS reputation + mailbox aggregate |
| **Campaign initial state** | Always `active` with 0 counters | Historical counters imported, state set by bounce rate |
| **Campaign-infra invariant** | None — campaign can be `active` while all mailboxes are `paused` | Enforced — campaign ≤ worst infra state |
| **Blacklist detection** | ❌ None | ✅ Checks Spamhaus, Barracuda, SORBS, SpamCop with tri-state results |
| **Blacklist lookup failure** | N/A | Treated as `UNREACHABLE` → domain `warning` (never false-green) |
| **SPF validation** | ❌ None | ✅ Checks presence and validity |
| **DKIM validation** | ❌ None | ✅ Checks for DKIM record presence |
| **DMARC validation** | ❌ None | ✅ Checks policy strength |
| **DNS-based recovery** | N/A | Manual re-assessment only — no auto-resume |
| **Historical bounce import** | ❌ Counters start at 0 | ✅ Pre-populated from Smartlead data |
| **Onboarding health report** | ❌ Just "synced X, Y" | ✅ Full visual diagnosis with remediation advice |
| **Report versioning** | N/A | ✅ `assessment_version` tag on every report |
| **Gate safety during onboarding** | ❌ Gate open immediately after sync | ✅ Gate locked until assessment completes |
| **Time to detect problems** | Hours to days (organic monitoring) | Immediate (at sync time) |
| **Degraded entity handling** | Sends through them until monitoring catches up | Immediately enters healing pipeline |
| **Onboarding audit event** | ❌ None | ✅ Summary event: X paused, Y warned, Z healthy |
| **User situational awareness** | None at onboarding | Complete infrastructure overview with remediation advice |

---

## Product Quality Assessment Post-Implementation

### Reliability

The product will no longer inadvertently damage a customer's email infrastructure during the onboarding period. Today, there is a window — potentially lasting hours or days — where Drason actively makes things worse by sending through damaged channels. After this implementation, that window is eliminated entirely. The strict sync → assessment → gate ordering means there is not even a 30-second race condition window. Degraded entities are identified and quarantined before a single new email is sent through them.

### Trust

When a user connects their email infrastructure to Drason, they will immediately see that the platform understands the reality of their situation. A health report that shows "3 of your 7 mailboxes have elevated bounce rates, we've paused them and they'll recover after a cooldown period" is fundamentally more trust-building than a generic "synced 7 mailboxes" message. The tri-state blacklist results (CONFIRMED/NOT_LISTED/UNREACHABLE) reinforce this honesty — Drason tells you when it is certain, when it is clear, and when it cannot verify. It never pretends certainty it does not have.

### Operational Safety

The single most dangerous moment in the lifecycle of a Drason deployment is the initial sync — the moment where Drason takes over management of an email infrastructure it knows nothing about. After this implementation, that moment becomes the safest, because it is preceded by comprehensive diagnosis and the execution gate remains locked until diagnosis completes. The system adopts a "do no harm first" posture: assess, report, quarantine if necessary, and only then begin operations. DNS-based recovery requiring manual re-assessment further eliminates the risk of premature confidence from unreliable DNS propagation.

### Data Integrity

The `assessment_version` tag on every `InfrastructureReport` ensures that as the assessment logic evolves — new blacklists added, scoring algorithms refined, new checks introduced — older reports remain correctly interpretable. The `initial_assessment_score` is explicitly scoped as report-only and never referenced in execution logic, preventing stale one-time snapshot data from contaminating real-time decisions.

### Competitive Differentiation

Most email orchestration platforms assume a greenfield setup. They provide warming, monitoring, and rotation — but for infrastructure that is being built from scratch. The ability to connect to an existing, potentially degraded infrastructure and immediately diagnose and begin healing it is a significant differentiator. The hard invariant that a campaign can never be healthier than its infrastructure, combined with the honest tri-state blacklist reporting, positions Drason as a deliverability firewall that understands legacy damage — not just another monitoring layer.

### What This Implementation Does NOT Include

- **Reply rate / open rate / response rate monitoring**: These require deeper Smartlead integration (campaign analytics endpoints) and represent a separate body of work. They are essential for understanding campaign effectiveness beyond deliverability and should be prioritised as a follow-up.
- **Ongoing domain reputation monitoring**: The DNS/blacklist checks are performed at onboarding and on manual re-assessment. A future enhancement should add periodic re-checks (daily or weekly) to detect reputation degradation proactively.
- **ICP (Ideal Customer Profile) configuration**: This is a fundamentally different feature — lead quality scoring based on firmographic and demographic attributes — and is out of scope.

---

## Proposed Changes

### Schema Changes

#### [MODIFY] [schema.prisma](file:///Users/richardson/Documents/Drason/backend/prisma/schema.prisma)

**Organization model** — add assessment gate flag:
```diff
 model Organization {
+  assessment_completed  Boolean  @default(false)
 }
```

**Domain model** — add DNS reputation fields:
```diff
 model Domain {
+  spf_valid              Boolean?
+  dkim_valid             Boolean?
+  dmarc_policy           String?      // 'none' | 'quarantine' | 'reject'
+  blacklist_results      Json?        // { spamhaus: 'CONFIRMED'|'NOT_LISTED'|'UNREACHABLE', ... }
+  dns_checked_at         DateTime?
+  initial_assessment_score Float?     // REPORT-ONLY. Never use in execution gate logic.
 }
```

**Mailbox model** — add historical import tracking:
```diff
 model Mailbox {
+  initial_bounce_rate    Float?
+  initial_assessment_at  DateTime?
 }
```

**New model** — InfrastructureReport:
```prisma
model InfrastructureReport {
  id                 String       @id @default(uuid())
  organization_id    String
  report_type        String       // 'onboarding' | 'manual_reassessment'
  assessment_version String       @default("1.0")
  overall_score      Float        // 0-100, REPORT-ONLY
  summary            Json         // { domains, mailboxes, campaigns, totals }
  findings           Json         // [{ severity, entity, message, remediation }]
  recommendations    Json         // [{ priority, action, details }]
  created_at         DateTime     @default(now())
  organization       Organization @relation(...)

  @@index([organization_id, created_at])
}
```

---

### New Service: Infrastructure Assessment

#### [NEW] [infrastructureAssessmentService.ts](file:///Users/richardson/Documents/Drason/backend/src/services/infrastructureAssessmentService.ts)

**Core orchestrator** with the following functions:

**`assessInfrastructure(organizationId)`** — main entry point
- Sets `organization.assessment_completed = false` (locks gate)
- Runs domain, mailbox, and campaign assessments in parallel
- Enforces campaign-infra invariant: campaign state ≤ worst domain/mailbox state
- Generates and persists `InfrastructureReport`
- Logs onboarding audit summary event (X paused, Y warned, Z healthy)
- Sets `organization.assessment_completed = true` (unlocks gate)

**`assessDomainDNS(domainName)`** — DNS reputation checks
- SPF: `dns.resolveTxt()` for `v=spf1` records
- DKIM: `dns.resolveTxt()` for common DKIM selectors (`default._domainkey`, `google._domainkey`, `selector1._domainkey`)
- DMARC: `dns.resolveTxt()` for `_dmarc.domain`
- Blacklists: reverse DNS lookup against Spamhaus ZEN, Barracuda, SORBS, SpamCop
- **Each blacklist result is tri-state:**
  - `CONFIRMED` — positive DNSBL hit (domain IS listed)
  - `NOT_LISTED` — negative result (domain is clean)
  - `UNREACHABLE` — lookup failed (DNS/network issue)
- **Rule: `UNREACHABLE` → domain status = `warning`, never `healthy`**

**`importMailboxHistory(organizationId, mailboxId)`** — Smartlead stats import
- Fetches historical bounce/send counts from Smartlead API
- Populates `hard_bounce_count`, `total_sent_count`, `initial_bounce_rate`
- Classification: >10% → `paused`, 5–10% → `warning`, <5% → `healthy`

**`importCampaignHistory(organizationId, campaignId)`** — Smartlead campaign import
- Imports `total_sent`, `total_bounced`, calculates bounce rate
- Classification: >10% → `paused`, 5–10% → `warning`, <5% → `active`
- **Hard invariant enforced**: campaign state capped at worst underlying domain/mailbox state

**`classifyInitialState()`** — state determination rules:

| Entity | Condition | Initial State |
|---|---|---|
| Mailbox | >10% historical bounce rate | `paused` |
| Mailbox | 5–10% historical bounce rate | `warning` |
| Mailbox | <5% historical bounce rate | `healthy` |
| Domain | Any blacklist = `CONFIRMED` | `paused` |
| Domain | Any blacklist = `UNREACHABLE` | `warning` |
| Domain | Missing SPF or DKIM | `warning` |
| Domain | All clean + full DNS auth | `healthy` |
| Campaign | >10% bounce rate | `paused` |
| Campaign | 5–10% bounce rate | `warning` |
| Campaign | **BUT** underlying domain is `paused` | `paused` (invariant) |
| Campaign | **BUT** all mailboxes are `warning` | at best `warning` (invariant) |

**Code comment on `initial_assessment_score`:**
```typescript
/**
 * initial_assessment_score: Float (0-100)
 * 
 * REPORT-ONLY. This score is derived from one-time assessment rules and
 * is used exclusively for the Infrastructure Health Report display.
 * 
 * HARD RULE: This score MUST NEVER be referenced in:
 * - executionGateService.ts
 * - monitoringService.ts  
 * - metricsWorker.ts
 * - Any real-time execution or state transition logic
 * 
 * Real-time decisions use live metrics from metricsService + monitoringService.
 */
```

---

### Modify Existing Services

#### [MODIFY] [smartleadClient.ts](file:///Users/richardson/Documents/Drason/backend/src/services/smartleadClient.ts)

- After sync completes, automatically trigger `infrastructureAssessmentService.assessInfrastructure()`
- **Gate is locked before assessment starts, unlocked only after it completes**
- Add `getMailboxStats(apiKey, mailboxId)` — fetch per-mailbox stats from Smartlead
- Add `getCampaignStats(apiKey, campaignId)` — fetch per-campaign stats from Smartlead

#### [MODIFY] [executionGateService.ts](file:///Users/richardson/Documents/Drason/backend/src/services/executionGateService.ts)

- Add check at the top of `canExecuteLead()`:
```typescript
// INVARIANT: No execution before infrastructure assessment completes
const org = await prisma.organization.findUnique({ where: { id: organizationId } });
if (!org?.assessment_completed) {
  return {
    allowed: false,
    reason: 'Infrastructure assessment in progress — gate locked',
    failureType: FailureType.SYNC_ISSUE,
    retryable: false,
    deferrable: true
  };
}
```

#### [MODIFY] [campaignHealthService.ts](file:///Users/richardson/Documents/Drason/backend/src/services/campaignHealthService.ts)

- Add campaign-infra invariant check in `checkCampaignHealth()`:
```typescript
// INVARIANT: Campaign can NEVER be healthier than its infrastructure.
// Campaign pause is additive, never compensatory.
const worstDomainState = await getWorstDomainStateForCampaign(campaignId);
if (worstDomainState === 'paused') status = 'paused';
else if (worstDomainState === 'warning' && status === 'active') status = 'warning';
```

---

### New Controller & Route

#### [NEW] [assessmentController.ts](file:///Users/richardson/Documents/Drason/backend/src/controllers/assessmentController.ts)

- `GET /api/assessment/:orgId/report` — fetch the most recent infrastructure report
- `POST /api/assessment/:orgId/run` — trigger a manual re-assessment (for DNS recovery verification)
- `GET /api/assessment/:orgId/domain/:domainId/dns` — fetch DNS details for a specific domain

#### [NEW] [assessment.ts](file:///Users/richardson/Documents/Drason/backend/src/routes/assessment.ts)

Route definitions for the assessment controller.

---

### Hardened Rules Summary

These are the non-negotiable invariants this implementation introduces:

| # | Rule | Rationale |
|---|---|---|
| 1 | DNSBL `UNREACHABLE` → domain `warning`, never `healthy` | Do not trust what you cannot verify |
| 2 | `initial_assessment_score` is REPORT-ONLY, never in gate logic | One-time snapshot must not drive real-time decisions |
| 3 | Campaign state ≤ worst infrastructure state | Campaigns cannot compensate for broken infra |
| 4 | DNS-based recovery requires manual `/run` trigger | DNS propagation lies; no auto-resume |
| 5 | Execution gate locked until `assessment_completed = true` | Zero-tolerance race condition on onboarding |
| 6 | Onboarding audit event logged with paused/warned/healthy counts | Production debugging for real-world installs |
| 7 | Every report tagged with `assessment_version` | Safe report evolution and backward compatibility |

---

## Verification Plan

### Manual Verification

1. **Sync + Assessment + Gate Lock Flow**: Connect Smartlead and verify:
   - `assessment_completed` is `false` during assessment
   - Execution gate rejects all leads during assessment with `deferrable: true`
   - `assessment_completed` becomes `true` only after full assessment
   - Gate opens for healthy entities after flag is set

2. **Blacklist Tri-State**: Test with a clean domain, a blacklisted domain, and a domain where DNS is unreachable:
   - Clean domain → all blacklists `NOT_LISTED` → domain `healthy`
   - Listed domain → at least one `CONFIRMED` → domain `paused`
   - Unreachable DNS → at least one `UNREACHABLE` → domain `warning`

3. **Campaign-Infra Invariant**: Create a campaign whose domain is `paused` and verify:
   - Campaign cannot be set to `active`
   - Campaign health check enforces ceiling from domain state

4. **DNS Manual Recovery**: After fixing DNS issues on a domain:
   - Verify domain does NOT auto-resume
   - Trigger `POST /api/assessment/:orgId/run`
   - Verify domain transitions based on new DNS results

5. **Historical Import**: Connect Smartlead with known bounce data and verify:
   - Mailbox counters are pre-populated (not zeroed)
   - High-bounce mailboxes start in `paused` state
   - Campaign counters reflect historical data

6. **Onboarding Audit Event**: After assessment completes, verify:
   - Audit log contains summary event with entity counts
   - Event is queryable via existing audit log API

7. **Report Versioning**: Verify reports contain `assessment_version: "1.0"` and are retrievable via API

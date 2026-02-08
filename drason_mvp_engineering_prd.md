# Drason MVP – Engineering Product Requirements Document (PRD)

## 1. Objective

Build the first production-ready version of **Drason**, a rule-based outbound execution control layer that:
- Receives enriched, qualified leads
- Gates when those leads are allowed to enter email campaigns
- Monitors early risk signals (bounces, failures, degradation trends)
- Conservatively pauses execution to prevent irreversible deliverability damage
- Explains every automated action clearly to users

**Success is defined by trust, not volume.**

---

## 2. Non-Goals (Explicitly Out of Scope)

The MVP will NOT:
- Detect spam or inbox placement
- Use AI/ML for decision-making
- Optimize campaign performance
- Perform email warm-up orchestration
- Switch channels automatically (email → LinkedIn → calls)
- Support multiple email senders
- Support CSV / Sheets ingestion

Any PR implementing the above must be rejected.

---

## 3. Supported Integrations (MVP Only)

### Inbound
- **Clay** (Webhook-based lead ingestion)

### Outbound
- **Smartlead** (Primary email sender for MVP)

No other tools are supported in v1.

---

## 4. Core Concepts & Ownership Model

| Responsibility | Owner |
|----------------|-------|
| Lead enrichment & scoring | Clay / Customer |
| ICP definition | Customer |
| Campaign creation & copy | Email Sender |
| Routing rules (ICP → Campaign) | Drason |
| Execution timing & safety | Drason |
| Sending emails | Email Sender |

Drason acts as a **control plane**, not an execution engine.

---

## 5. Data Model

### 5.1 Lead
- id (UUID)
- email (string, required)
- persona / ICP (string, required)
- lead_score (integer, required)
- source = "clay"
- status: held | active | paused | completed
- health_state: healthy | warning | paused
- assigned_campaign_id (nullable)
- created_at

---

### 5.2 Campaign (Reference Only)
- campaign_id (from Smartlead)
- name
- channel = email
- status (active / paused)

---

### 5.3 Mailbox
- mailbox_id
- email
- domain
- status: active | paused
- hard_bounce_count
- delivery_failure_count
- last_activity_at

---

### 5.4 Domain
- domain
- status: healthy | warning | paused
- aggregated_bounce_rate_trend
- paused_reason

---

## 6. Lead Ingestion Flow (Clay → Drason)

### 6.1 Clay Webhook Requirements
Clay must POST enriched leads with:
- email
- persona
- lead_score
- workable = true

If any required field is missing → **reject lead**.

### 6.2 Ingestion Behavior
1. Validate payload
2. Create Lead with status = `held`
3. Set health_state = `healthy`
4. Do NOT push lead to any campaign yet

---

## 7. Routing Rules Engine

### 7.1 Configuration
Users define routing rules ONCE in Drason:

Example:
- IF persona = CTO AND lead_score >= 80 → Campaign A
- IF persona = CIO → Campaign B

Rules are:
- Deterministic
- Ordered (first match wins)
- Explicit

### 7.2 Runtime Resolution
On lead ingest:
1. Match lead against routing rules
2. Resolve intended campaign_id
3. If no rule matches → keep lead `held` and surface error

Drason never guesses campaigns.

---

## 8. Execution Gate (Core Feature)

Before pushing a lead into a campaign, Drason must validate:
- Campaign is active
- Domain is not paused
- At least one mailbox is available

### Outcomes
- If safe → push lead via Smartlead API → status = `active`
- If unsafe → keep lead `held` and log reason

---

## 9. Monitoring System

### 9.1 Signals Monitored (MVP)

Primary:
- Hard bounce events

Secondary:
- Delivery failures (SMTP errors, deferrals)

Supporting (never standalone triggers):
- Reply rate trend (same campaign, same ICP)

Open rates are display-only and never used for decisions.

---

## 10. Pause & Escalation Logic

### 10.1 Mailbox-Level
- Trigger: sustained hard bounces or repeated delivery failures
- Action: pause mailbox (if API allows)

### 10.2 Campaign-Level
- Trigger: multiple mailboxes degraded within campaign
- Action: pause campaign

### 10.3 Domain-Level (Last Resort)
- Trigger: sustained degradation across campaigns/mailboxes
- Action: pause all associated campaigns

All pauses must be reversible and logged.

---

## 11. Lead State Transitions

```
HELD → ACTIVE → PAUSED → ACTIVE
                ↓
            COMPLETED
```

- Leads are never deleted
- Leads are paused when execution becomes unsafe

---

## 12. Audit Log & Explainability (Mandatory)

Every automated or manual action must log:
- Entity affected (lead / mailbox / campaign / domain)
- Triggering signal(s)
- Threshold crossed
- Action taken
- Timestamp

Logs must be human-readable.

---

## 13. User Interface (Minimal)

### Required Screens
1. Overview
   - Active leads
   - Held leads
   - Paused domains

2. Routing Configuration
   - ICP → Campaign mapping

3. Domain & Mailbox Status
   - Health state
   - Pause reasons

4. Audit Log
   - Timeline of actions

No advanced analytics in MVP.

---

## 14. Security & Permissions

- API key–based authentication for Smartlead
- Least-privilege access
- No access to email content
- All API actions logged

---

## 15. Success Criteria (Engineering)

MVP is successful if:
- Leads cannot enter campaigns without passing execution gate
- Pauses occur before sustained domain damage
- Every pause is explainable
- Users can trust that Drason never acts silently

---

## 16. Guiding Principle (Final)

> Drason exists to prevent irreversible outbound damage through conservative, explainable, rule-based control — not to maximize send volume.


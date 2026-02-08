# Drason

**Drason** is a rule-based outbound execution control layer that manages the lifecycle of leads entering email campaigns. It acts as a **control plane** between your lead enrichment sources (like Clay) and your email senders (like Smartlead), ensuring leads only enter campaigns when it's safe to do so.

> **Guiding Principle**: Drason exists to prevent irreversible outbound damage through conservative, explainable, rule-based control — not to maximize send volume.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [API Reference](#api-reference)
8. [Core Features](#core-features)
9. [Getting Started](#getting-started)
10. [Environment Variables](#environment-variables)

---

## Overview

### What Drason Does

1. **Receives enriched leads** from Clay via webhook
2. **Routes leads** to appropriate campaigns based on configurable rules (persona + lead score)
3. **Gates execution** by validating campaign health, domain status, and mailbox availability before pushing leads
4. **Monitors risk signals** (hard bounces, delivery failures) in real-time
5. **Pauses execution** when thresholds are exceeded to prevent deliverability damage
6. **Explains every action** through comprehensive audit logging

### What Drason Does NOT Do (By Design)

- Detect spam or inbox placement
- Use AI/ML for decision-making
- Optimize campaign performance
- Perform email warm-up orchestration
- Switch channels automatically
- Support multiple email senders beyond Smartlead
- Support CSV/Sheets ingestion

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐     Webhook      ┌──────────────────┐                 │
│  │   Clay   │ ───────────────► │  Drason Backend  │                 │
│  │  (Leads) │                  │   (Control Plane)│                 │
│  └──────────┘                  └────────┬─────────┘                 │
│                                         │                           │
│                                         │ API Calls                 │
│                                         ▼                           │
│                                ┌──────────────────┐                 │
│                                │    Smartlead     │                 │
│                                │ (Email Campaigns)│                 │
│                                └────────┬─────────┘                 │
│                                         │                           │
│                                         │ Webhooks                  │
│                                         ▼                           │
│                                ┌──────────────────┐                 │
│                                │ Monitoring System│                 │
│                                │ (Bounce Tracking)│                 │
│                                └──────────────────┘                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Lead Ingestion**: Clay sends enriched leads via POST to `/api/ingest/clay`
2. **Routing**: System matches lead against routing rules (persona + min_score) → assigns campaign
3. **Execution Gate**: Before pushing to Smartlead, validates:
   - Campaign is active
   - Domain is not paused
   - At least one mailbox is healthy
4. **Monitoring**: Smartlead sends bounce/sent events via webhook → system tracks metrics
5. **Pause Logic**: When bounce thresholds are exceeded, mailboxes/domains are paused automatically

---

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (via Prisma ORM)
- **HTTP Client**: Axios (for Smartlead API)

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript + React
- **Styling**: CSS (dark theme)
- **Charts**: Recharts (PieChart, BarChart)

---

## Database Schema

The database consists of 7 core models, managed via Prisma:

### 1. Lead
Represents an individual lead in the system.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `email` | String | Unique email address |
| `persona` | String | ICP category (e.g., "CEO", "CTO") |
| `lead_score` | Integer | Qualification score (0-100) |
| `source` | String | Origin ("clay" or "api") |
| `status` | String | `held` → `active` → `paused` → `completed` |
| `health_state` | String | `healthy` or `warning` |
| `assigned_campaign_id` | String? | Linked campaign ID |
| `created_at` | DateTime | Timestamp |

**State Transitions:**
```
HELD → ACTIVE → PAUSED → ACTIVE
                  ↓
              COMPLETED
```

### 2. Campaign
Reference model synced from Smartlead.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Smartlead campaign ID |
| `name` | String | Campaign name |
| `channel` | String | Always "email" for MVP |
| `status` | String | `active` or `paused` |
| `last_updated` | DateTime | Sync timestamp |
| `mailboxes` | Mailbox[] | Related mailboxes |

### 3. Mailbox
Sender email accounts linked to campaigns.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Smartlead email account ID |
| `email` | String | Sender email address |
| `domain_id` | String | Foreign key to Domain |
| `status` | String | `active`, `paused`, or `warning` |
| `hard_bounce_count` | Integer | Lifetime bounce count |
| `delivery_failure_count` | Integer | Lifetime delivery failures |
| `window_sent_count` | Integer | Sends in current monitoring window |
| `window_bounce_count` | Integer | Bounces in current window |
| `window_start_at` | DateTime | Start of current window |
| `last_activity_at` | DateTime | Last activity timestamp |

### 4. Domain
Aggregated health status for email domains.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `domain` | String | Unique domain name (e.g., "company.com") |
| `status` | String | `healthy`, `warning`, or `paused` |
| `warning_count` | Integer | Times domain entered warning state |
| `aggregated_bounce_rate_trend` | Float | Rolling bounce rate percentage |
| `paused_reason` | String? | Explanation if paused |

### 5. AuditLog
Immutable record of all system actions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `entity` | String | `lead`, `mailbox`, `campaign`, or `domain` |
| `entity_id` | String? | Related entity ID |
| `trigger` | String | What initiated the action |
| `action` | String | What action was taken |
| `details` | String? | Human-readable explanation |
| `timestamp` | DateTime | When it occurred |

### 6. RoutingRule
Deterministic rules for lead → campaign assignment.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `persona` | String | Target ICP persona |
| `min_score` | Integer | Minimum lead score required |
| `target_campaign_id` | String | Destination campaign |
| `priority` | Integer | Higher = evaluated first |
| `created_at` | DateTime | Timestamp |

### 7. SystemSetting
Key-value store for app configuration.

| Field | Type | Description |
|-------|------|-------------|
| `key` | String | Setting key (e.g., "SMARTLEAD_API_KEY") |
| `value` | String | Setting value |

---

## Backend Implementation

### Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── dev.db                 # SQLite database file
│   └── migrations/            # Database migrations
├── src/
│   ├── index.ts               # Express server entry point
│   ├── controllers/
│   │   ├── dashboardController.ts   # Dashboard data endpoints
│   │   ├── ingestionController.ts   # Lead ingestion logic
│   │   ├── leadController.ts        # Lead CRUD operations
│   │   ├── monitoringController.ts  # Bounce/sent event handling
│   │   └── settingsController.ts    # System settings management
│   ├── services/
│   │   ├── auditLogService.ts       # Logging all actions
│   │   ├── executionGateService.ts  # Pre-execution validation
│   │   ├── leadService.ts           # Lead business logic
│   │   ├── monitoringService.ts     # Bounce tracking & pausing
│   │   ├── routingService.ts        # Lead → campaign matching
│   │   └── smartleadClient.ts       # Smartlead API integration
│   └── routes/
│       ├── dashboard.ts             # Dashboard API routes
│       ├── leads.ts                 # Lead management routes
│       ├── settings.ts              # Settings routes
│       └── sync.ts                  # Smartlead sync routes
└── package.json
```

### Core Services Explained

#### 1. Ingestion Controller (`ingestionController.ts`)

Handles incoming leads from two sources:

**Direct API Ingestion** (`POST /api/ingest`):
```json
{
  "email": "john@company.com",
  "persona": "CEO",
  "lead_score": 85,
  "source": "api"
}
```

**Clay Webhook** (`POST /api/ingest/clay`):
- Accepts Clay's flexible payload format
- Auto-normalizes field names (case-insensitive lookup)
- Fallback values: persona defaults to "General", score defaults to 50
- Uses upsert to handle duplicate leads gracefully

**Ingestion Flow:**
1. Validate required fields (email is mandatory)
2. Create/upsert lead with `status: 'held'` and `health_state: 'healthy'`
3. Resolve campaign via routing rules
4. Update lead with `assigned_campaign_id` if matched
5. Log action to audit log

#### 2. Routing Service (`routingService.ts`)

Implements deterministic, priority-based campaign assignment:

```typescript
// Rules are evaluated in priority order (highest first)
// First match wins
for (const rule of rules) {
  if (
    rule.persona.toLowerCase() === lead.persona.toLowerCase() &&
    lead.lead_score >= rule.min_score
  ) {
    return rule.target_campaign_id;
  }
}
return null; // No match = lead stays in holding pool
```

**Example Rules:**
| Persona | Min Score | Target Campaign | Priority |
|---------|-----------|-----------------|----------|
| CEO | 80 | camp_enterprise | 10 |
| CTO | 70 | camp_tech | 8 |
| General | 50 | camp_default | 1 |

#### 3. Execution Gate Service (`executionGateService.ts`)

Validates system health before pushing leads to campaigns:

```typescript
async function canExecuteLead(campaignId, leadId): Promise<boolean> {
  // 1. Campaign must exist and be active
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== 'active') return false;

  // 2. At least one healthy mailbox must be available
  const healthyMailboxes = await prisma.mailbox.findMany({
    where: {
      status: 'active',
      domain: { status: 'healthy' }
    }
  });
  if (healthyMailboxes.length === 0) return false;

  return true;
}
```

Every gate check is logged with detailed reasoning.

#### 4. Monitoring Service (`monitoringService.ts`)

Implements window-based bounce tracking with automatic escalation:

**Constants (Configurable):**
- `MAILBOX_BOUNCE_THRESHOLD`: 5 bounces → pause mailbox
- `MAILBOX_WINDOW_SIZE`: 100 sends → reset window
- `DOMAIN_WARNING_THRESHOLD`: 2 unhealthy mailboxes → pause domain

**Bounce Recording Flow:**
```
recordBounce(mailboxId)
    │
    ├── Increment window_bounce_count and hard_bounce_count
    │
    ├── If window_bounce_count >= THRESHOLD:
    │       └── pauseMailbox()
    │               │
    │               └── checkDomainHealth()
    │                       │
    │                       └── If unhealthy_mailboxes >= THRESHOLD:
    │                               ├── Pause domain
    │                               └── Cascade pause to all mailboxes
```

**Window Reset (Healing) Logic:**
- When `window_sent_count > WINDOW_SIZE` and mailbox is healthy:
  - Reset `window_sent_count` to 0
  - Reset `window_bounce_count` to 0
  - Update `window_start_at`

#### 5. Smartlead Client (`smartleadClient.ts`)

Handles two-way integration with Smartlead:

**Sync (`syncSmartlead()`)**:
1. Fetch all campaigns from Smartlead API
2. Upsert campaigns in local database
3. For each campaign, fetch associated email accounts (mailboxes)
4. Infer domains from mailbox email addresses
5. Create/update domains, mailboxes, and campaign-mailbox relationships

**Push Lead (`addLeadToCampaign()`)**:
```typescript
await axios.post(`/campaigns/${campaignId}/leads`, {
  api_key: apiKey,
  lead_list: [{
    email: lead.email,
    custom_fields: {
      persona: lead.persona,
      score: lead.lead_score
    }
  }]
});
```

#### 6. Audit Log Service (`auditLogService.ts`)

Records every system action for full explainability:

```typescript
await logAction(
  'lead',                    // entity type
  'lead-uuid-123',          // entity ID
  'ingestion_routing',      // trigger
  'route_matched',          // action
  'Matched rule X → Campaign Y'  // human-readable details
);
```

**Logged Actions Include:**
- Lead ingestion and routing decisions
- Gate checks (passed/failed with reasons)
- Bounce events and stat updates
- Mailbox/domain pauses and cascades
- Window resets

---

## Frontend Implementation

### Directory Structure

```
frontend/
├── src/
│   └── app/
│       ├── page.tsx              # Overview Dashboard
│       ├── layout.tsx            # Navigation sidebar
│       ├── globals.css           # Dark theme styles
│       ├── leads/page.tsx        # Lead management with detail view
│       ├── campaigns/page.tsx    # Campaign list
│       ├── mailboxes/page.tsx    # Mailbox monitoring
│       ├── domains/page.tsx      # Domain health monitoring
│       ├── configuration/page.tsx # Routing rules configuration
│       ├── status/page.tsx       # System status
│       ├── audit/page.tsx        # Audit log viewer
│       └── settings/page.tsx     # Integration settings
└── package.json
```

### Pages Explained

#### 1. Overview Dashboard (`/`)

The main control center showing system health at a glance:

**Critical Alerts Section:**
- Displays paused domains with red border
- Shows warning domains with yellow border
- Includes pause reason for investigation

**Charts:**
- **Lead Status Distribution**: Donut chart showing Active/Held/Paused counts
- **Domain Health**: Donut chart showing Healthy/Warning/Paused domains
- **Leads per Campaign**: Bar chart showing lead distribution

**Monitoring Tables:**
- **Leads**: Filterable by status (held/active/paused/all), shows email, persona, score, status, campaign, health
- **Mailboxes**: Filterable by status, shows bounce/failure counts and window stats
- **Domains**: Filterable by status, shows bounce trend and alert reasons

#### 2. Leads Page (`/leads`)

Master-detail view for individual lead management:

**Left Panel (Lead List):**
- Filterable list of all leads
- Visual indicator for paused leads (red left border)
- Shows email, score, and status

**Right Panel (Lead Details):**
- Full lead profile (persona, score, source)
- Execution context (assigned campaign, health state)
- **System Status Explanation**: Plain-language explanation of why lead is in current state
- **Activity Log**: Full audit trail for this specific lead

**System Status Messages:**
| Status | Explanation |
|--------|-------------|
| Paused | "Lead processing halted. Associated mailbox/domain triggered Warning/Paused state due to bounce rates exceeding 2%." |
| Held | "Lead in Holding Pool. Waiting for Execution Gate to verify mailbox capacity and domain health." |
| Active | "Lead passed all health checks and routed to campaign. Available for outreach by Smartlead." |

#### 3. Routing Configuration (`/configuration`)

Interface for creating and viewing routing rules:

**Form Fields:**
- ICP Persona (e.g., "CEO")
- Min Lead Score (0-100)
- Target Campaign ID
- Priority (higher = evaluated first)

**Active Rules Display:**
- Shows all rules ordered by priority
- Format: `{Persona} (Score ≥ {MinScore}) → {CampaignID}`

#### 4. Audit Log (`/audit`)

Immutable system log with filtering:

**Filter Tabs:**
- All events
- Lead events only
- Mailbox events only
- Domain events only

**Log Entry Fields:**
- Timestamp
- Entity (type + ID)
- Trigger (what initiated)
- Action (what happened)
- Details (human-readable)

#### 5. Settings (`/settings`)

Integration configuration:

**Smartlead Integration:**
- API Key input (stored securely in database)
- Manual Sync button to force campaign/mailbox refresh

**Clay Integration:**
- Displays webhook URL to configure in Clay
- Format: `{host}:3001/api/ingest/clay`

---

## API Reference

### Lead Ingestion

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Direct API lead ingestion |
| POST | `/api/ingest/clay` | Clay webhook receiver |

### Dashboard Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Lead counts by status |
| GET | `/api/dashboard/leads` | All leads (latest 100) |
| GET | `/api/dashboard/campaigns` | All campaigns with mailboxes |
| GET | `/api/dashboard/domains` | All domains with mailboxes |
| GET | `/api/dashboard/mailboxes` | All mailboxes with domain/campaign info |
| GET | `/api/dashboard/audit-logs` | System audit logs (filterable) |
| GET | `/api/dashboard/routing-rules` | All routing rules |
| POST | `/api/dashboard/routing-rules` | Create new routing rule |

### Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/monitor/event` | Manual bounce/sent event trigger |
| POST | `/api/monitor/smartlead-webhook` | Smartlead event receiver |

### Settings & Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all system settings |
| POST | `/api/settings` | Update system settings |
| POST | `/api/sync` | Trigger Smartlead sync |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

---

## Core Features

### 1. Conservative Execution Philosophy

Drason prioritizes **safety over volume**. Every decision defaults to caution:

- Leads start in `held` status, never auto-pushed
- Execution gate must explicitly pass before any action
- Thresholds are low (5 bounces = pause)
- Cascade pauses affect entire domains when needed

### 2. Complete Explainability

Every automated action is:
- Logged with timestamp
- Tagged with triggering signal
- Explained in human-readable format
- Viewable in audit log

### 3. Hierarchical Health Monitoring

```
Mailbox Level
    └── Sustained bounces → Pause mailbox
            │
            └── Triggers domain check
                    │
Campaign Level          │
    └── Multiple degraded mailboxes → Pause campaign
                                │
Domain Level ◄──────────────────┘
    └── Sustained degradation → Pause ALL associated campaigns/mailboxes
```

### 4. Window-Based Healing

The system allows natural recovery:
- After 100 safe sends, the bounce window resets
- Mailboxes can return to `active` status
- Domain status can heal when mailboxes recover

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Richardson2512/Drason.git
cd Drason
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend** (runs on port 3001)
```bash
cd backend
npm run dev
```

2. **Start the frontend** (runs on port 3000)
```bash
cd frontend
npm run dev
```

3. **Access the application**
```
http://localhost:3000
```

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="file:./dev.db"

# Port (optional, defaults to 3001)
PORT=3001
```

### System Settings (via UI)

Configure these in the Settings page:

| Key | Description |
|-----|-------------|
| `SMARTLEAD_API_KEY` | Your Smartlead API key for sync and lead push |

---

## Integrations Setup

### Smartlead

1. Go to Settings page in Drason
2. Enter your Smartlead API Key
3. Click "Save API Key"
4. Click "Sync Now" to import campaigns and mailboxes

### Clay

1. Go to Settings page in Drason
2. Copy the displayed webhook URL
3. In Clay, add an "HTTP API" column
4. Configure it to POST to the webhook URL
5. Map your Clay columns to: `email`, `persona`, `lead_score`

---

## Version

**v1.0.0 (MVP)**

---

## Success Criteria

The MVP is successful when:

- ✅ Leads cannot enter campaigns without passing execution gate
- ✅ Pauses occur before sustained domain damage
- ✅ Every pause is explainable via audit log
- ✅ Users can trust that Drason never acts silently

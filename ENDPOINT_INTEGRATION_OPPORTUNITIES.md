# Endpoint Integration Opportunities

Analysis of where unused/questionable endpoints could be integrated into the UI for better functionality.

---

## 1. `/api/monitor/event` - Manual Event Trigger

### **What It Does:**
Manually triggers monitoring events (bounce/sent) for testing and admin purposes.

**Controller:** `backend/src/controllers/monitoringController.ts` lines 69-90
**Current Usage:** Not called from frontend (backend-only testing tool)

### **Request:**
```typescript
POST /api/monitor/event
{
  eventType: 'bounce' | 'sent',
  mailboxId: string,
  campaignId?: string
}
```

### **Response:**
```typescript
{
  success: true,
  message: 'Bounce recorded' | 'Send recorded',
  mailboxId: string
}
```

---

### **Integration Opportunity #1: Settings Page Admin Tools Section**

**Location:** [frontend/src/app/dashboard/settings/page.tsx](frontend/src/app/dashboard/settings/page.tsx) - Add after System Mode section

**UI Design:**
```tsx
<div className="premium-card">
  <h2>🛠️ Admin Tools</h2>
  <p>Testing and debugging utilities</p>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
    <button onClick={handleTestBounce}>
      🚨 Simulate Bounce Event
    </button>
    <button onClick={handleTestSent}>
      ✅ Simulate Sent Event
    </button>
  </div>

  {/* Mailbox selector dropdown */}
  <select onChange={(e) => setTestMailboxId(e.target.value)}>
    <option>Select mailbox...</option>
    {mailboxes.map(mb => <option value={mb.id}>{mb.email}</option>)}
  </select>
</div>
```

**Implementation:**
```typescript
const handleTestBounce = async () => {
  if (!testMailboxId) {
    setMsg('Please select a mailbox first');
    return;
  }

  try {
    await apiClient('/api/monitor/event', {
      method: 'POST',
      body: JSON.stringify({
        eventType: 'bounce',
        mailboxId: testMailboxId
      })
    });
    setMsg('✅ Bounce event simulated successfully');
  } catch (error) {
    setMsg('Failed to simulate bounce');
  }
};
```

**Benefits:**
- Test bounce rate thresholds without real emails
- Verify health monitoring triggers correctly
- Debug infrastructure health system

**Priority:** 🟡 Medium - Useful for development/testing

---

### **Integration Opportunity #2: Mailboxes Page Quick Actions**

**Location:** `frontend/src/app/dashboard/mailboxes/page.tsx` - Add action buttons in mailbox detail view

**UI Design:**
```tsx
{/* In mailbox detail panel */}
<div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
  <button
    onClick={() => handleSimulateEvent(selectedMailbox.id, 'bounce')}
    className="text-xs"
  >
    🧪 Test Bounce
  </button>
  <button
    onClick={() => handleSimulateEvent(selectedMailbox.id, 'sent')}
    className="text-xs"
  >
    🧪 Test Send
  </button>
</div>
```

**Benefits:**
- Quick testing per mailbox
- Verify health monitoring works
- Contextual to selected mailbox

**Priority:** 🟢 Low - Nice to have for debugging

---

## 2. `/api/leads/scoring/sync` - Manual Lead Score Refresh

### **What It Does:**
Manually recalculates lead scores for all leads in the organization.

**Controller:** `backend/src/controllers/leadScoringController.ts` lines 17-40
**Current Usage:** Not called from frontend

### **Request:**
```typescript
POST /api/leads/scoring/sync
```

### **Response:**
```typescript
{
  success: true,
  message: 'Updated 150 lead scores',
  data: {
    updated: 150,
    topLeads: Lead[] // Top 10 leads after scoring
  }
}
```

---

### **Integration Opportunity #1: Leads Page Toolbar Action ⭐ RECOMMENDED**

**Location:** [frontend/src/app/dashboard/leads/page.tsx](frontend/src/app/dashboard/leads/page.tsx) - Add to page header

**UI Design:**
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h1>Leads</h1>
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    {/* Existing filters */}

    <button
      onClick={handleRefreshScores}
      disabled={scoringInProgress}
      style={{
        padding: '0.5rem 1rem',
        background: scoringInProgress ? '#E5E7EB' : '#3B82F6',
        color: 'white',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {scoringInProgress ? (
        <>
          <span className="animate-spin">⏳</span>
          Scoring...
        </>
      ) : (
        <>
          🎯 Refresh Lead Scores
        </>
      )}
    </button>
  </div>
</div>

{/* Show result banner */}
{scoreResult && (
  <div style={{
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  }}>
    ✅ Updated {scoreResult.updated} lead scores
  </div>
)}
```

**Implementation:**
```typescript
const [scoringInProgress, setScoringInProgress] = useState(false);
const [scoreResult, setScoreResult] = useState<any>(null);

const handleRefreshScores = async () => {
  setScoringInProgress(true);
  setScoreResult(null);

  try {
    const result = await apiClient('/api/leads/scoring/sync', {
      method: 'POST',
      timeout: 60000 // 1 minute timeout for scoring
    });

    setScoreResult(result.data);

    // Auto-dismiss after 5 seconds
    setTimeout(() => setScoreResult(null), 5000);

    // Refresh leads to show updated scores
    await fetchLeads();
  } catch (error) {
    setMsg('Failed to refresh scores');
  } finally {
    setScoringInProgress(false);
  }
};
```

**Benefits:**
- Manual refresh after importing new engagement data
- Immediate score recalculation without waiting for cron
- Shows top leads after scoring completes

**Priority:** 🔴 HIGH - Provides immediate value to users

**User Story:**
> "As a user, after importing engagement data from Smartlead, I want to manually refresh lead scores to see updated rankings immediately, so I can prioritize high-value leads without waiting for the automated daily sync."

---

### **Integration Opportunity #2: Settings Page Maintenance Section**

**Location:** [frontend/src/app/dashboard/settings/page.tsx](frontend/src/app/dashboard/settings/page.tsx)

**UI Design:**
```tsx
<div className="premium-card">
  <h2>🔧 Maintenance Tools</h2>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div>
      <h3>Recalculate Lead Scores</h3>
      <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
        Manually trigger lead scoring for all leads. This updates engagement scores based on latest Smartlead data.
      </p>
      <button onClick={handleRefreshAllScores}>
        🎯 Refresh All Lead Scores
      </button>
    </div>

    <div>
      <h3>Trigger Manual Sync</h3>
      <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
        Sync campaigns, mailboxes, and leads from Smartlead.
      </p>
      <button onClick={handleManualSync}>
        🔄 Trigger Manual Sync
      </button>
    </div>
  </div>
</div>
```

**Priority:** 🟡 Medium - Good for admin/maintenance workflows

---

## 3. `/api/leads/:leadId/score-breakdown` - Lead Score Details

### **What It Does:**
Returns detailed breakdown of how a lead's score was calculated (engagement factors, recency, frequency).

**Controller:** `backend/src/controllers/leadScoringController.ts` lines 70-94
**Current Usage:** Not called from frontend

### **Request:**
```typescript
GET /api/leads/:leadId/score-breakdown
```

### **Response:**
```typescript
{
  success: true,
  data: {
    leadId: string,
    totalScore: 85,
    breakdown: {
      engagement: 40,     // Email opens, clicks, replies
      recency: 25,        // How recent the activity
      frequency: 20       // How often they engage
    },
    factors: {
      lastEngagement: '2025-02-15T10:30:00Z',
      totalOpens: 15,
      totalClicks: 8,
      totalReplies: 3
    }
  }
}
```

---

### **Integration Opportunity #1: Leads Page Detail View ⭐ RECOMMENDED**

**Location:** [frontend/src/app/dashboard/leads/page.tsx](frontend/src/app/dashboard/leads/page.tsx) - In the lead detail panel (right side)

**UI Design:**
```tsx
{selectedLead && (
  <div className="premium-card">
    <h2>Lead Details: {selectedLead.email}</h2>

    {/* Existing details */}

    {/* NEW: Score Breakdown Section */}
    <div style={{ marginTop: '2rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>📊 Score Breakdown</h3>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(selectedLead.score) }}>
          {selectedLead.score || '-'}
        </div>
      </div>

      {scoreBreakdown ? (
        <>
          {/* Visual breakdown bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ScoreBar label="Engagement" value={scoreBreakdown.breakdown.engagement} max={50} />
            <ScoreBar label="Recency" value={scoreBreakdown.breakdown.recency} max={30} />
            <ScoreBar label="Frequency" value={scoreBreakdown.breakdown.frequency} max={20} />
          </div>

          {/* Engagement factors */}
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <StatBadge icon="👁️" label="Opens" value={scoreBreakdown.factors.totalOpens} />
            <StatBadge icon="🖱️" label="Clicks" value={scoreBreakdown.factors.totalClicks} />
            <StatBadge icon="💬" label="Replies" value={scoreBreakdown.factors.totalReplies} />
            <StatBadge icon="🕐" label="Last Active" value={formatRelativeTime(scoreBreakdown.factors.lastEngagement)} />
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>
          <button onClick={handleLoadScoreBreakdown}>
            View Score Breakdown →
          </button>
        </div>
      )}
    </div>
  </div>
)}
```

**Components to Create:**
```tsx
// ScoreBar.tsx
function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{value}/{max}</span>
      </div>
      <div style={{ background: '#E2E8F0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
          width: `${percentage}%`,
          height: '100%',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

// StatBadge.tsx
function StatBadge({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}
```

**Implementation:**
```typescript
const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);

const handleLoadScoreBreakdown = async () => {
  if (!selectedLead) return;

  try {
    const result = await apiClient(`/api/leads/${selectedLead.id}/score-breakdown`);
    setScoreBreakdown(result.data);
  } catch (error) {
    console.error('Failed to load score breakdown:', error);
  }
};

// Auto-load when lead is selected
useEffect(() => {
  if (selectedLead?.id) {
    handleLoadScoreBreakdown();
  }
}, [selectedLead?.id]);
```

**Benefits:**
- Transparency into lead scoring algorithm
- Helps users understand why leads are prioritized
- Identifies engagement patterns
- Guides strategy (e.g., "this lead hasn't engaged recently")

**Priority:** 🔴 HIGH - Provides immediate transparency and actionable insights

**User Story:**
> "As a user, when viewing a lead, I want to see how their score was calculated so I can understand what factors make them high or low priority, and adjust my outreach strategy accordingly."

---

### **Integration Opportunity #2: Leads Page Table - Score Column Tooltip**

**Location:** Leads table score column - show tooltip on hover

**UI Design:**
```tsx
<td
  style={{ padding: '1rem', cursor: 'help' }}
  title="Click to see score breakdown"
  onClick={() => handleShowScoreBreakdown(lead.id)}
>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <span style={{ fontWeight: 700, color: getScoreColor(lead.score) }}>
      {lead.score || '-'}
    </span>
    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ℹ️</span>
  </div>
</td>
```

**Implementation:** Opens modal with score breakdown

**Priority:** 🟡 Medium - Nice UX enhancement

---

## 4. `/api/dashboard/campaign-health-stats` - Campaign Health Overview

### **What It Does:**
Returns aggregate campaign health statistics (total, active, paused, warning counts + bounce rates).

**Controller:** `backend/src/controllers/dashboardController.ts` (grep result shows it exists)
**Current Usage:** Not called from frontend

### **Request:**
```typescript
GET /api/dashboard/campaign-health-stats
```

### **Response:**
```typescript
{
  success: true,
  data: {
    total: 25,
    active: 18,
    paused: 5,
    warning: 2,
    campaigns: [
      {
        id: string,
        name: string,
        status: 'active' | 'paused' | 'warning',
        bounce_rate: 0.03,
        total_sent: 1500,
        total_bounced: 45
      }
    ]
  }
}
```

---

### **Analysis: Duplicate Endpoint**

**Finding:** This endpoint is **DUPLICATE/REDUNDANT** with existing functionality:

1. **Campaigns Page Already Has This:**
   - `GET /api/dashboard/campaigns` returns full campaign list with all fields
   - Campaigns page calculates totals client-side

2. **Infrastructure Page Has Better Alternative:**
   - `GET /api/infrastructure/report` returns comprehensive health including campaigns
   - Shows domain/mailbox/campaign health together

**Recommendation:** 🗑️ **DELETE THIS ENDPOINT**

**Reasoning:**
- Redundant with `/api/dashboard/campaigns`
- Client-side filtering is fast enough for campaign counts
- Infrastructure report provides better holistic view
- Reduces API surface area and maintenance burden

---

## Summary & Recommendations

| Endpoint | Integration Priority | Recommended Action |
|----------|---------------------|-------------------|
| `/api/monitor/event` | 🟡 Medium | Integrate into **Settings page** as admin testing tool |
| `/api/leads/scoring/sync` | 🔴 HIGH | Integrate into **Leads page** toolbar - Manual refresh button |
| `/api/leads/:leadId/score-breakdown` | 🔴 HIGH | Integrate into **Leads page** detail view - Score breakdown section |
| `/api/dashboard/campaign-health-stats` | ❌ DELETE | Redundant with `/api/dashboard/campaigns` |

---

## Implementation Priority

### Phase 1: High-Value Integrations (Week 1)
1. ✅ **Lead Score Breakdown in Leads Detail View**
   - Files: `frontend/src/app/dashboard/leads/page.tsx`
   - Components: Create `ScoreBar.tsx`, `StatBadge.tsx`
   - Effort: 3-4 hours
   - Impact: HIGH - User transparency and insights

2. ✅ **Refresh Lead Scores Button in Leads Page**
   - Files: `frontend/src/app/dashboard/leads/page.tsx`
   - Effort: 1-2 hours
   - Impact: HIGH - Immediate user control

### Phase 2: Admin Tools (Week 2)
3. 🟡 **Admin Event Testing in Settings**
   - Files: `frontend/src/app/dashboard/settings/page.tsx`
   - Effort: 2-3 hours
   - Impact: MEDIUM - Development/testing utility

### Phase 3: Cleanup
4. 🗑️ **Delete `/api/dashboard/campaign-health-stats`**
   - Files: `backend/src/controllers/dashboardController.ts`, `backend/src/routes/dashboard.ts`
   - Effort: 10 minutes
   - Impact: Code cleanliness

---

## User Value Statements

**Before Integration:**
- ❌ Users don't know why lead scores are what they are
- ❌ Users wait for daily cron to update scores
- ❌ No way to test health monitoring without real emails

**After Integration:**
- ✅ Users see transparent score breakdown (engagement, recency, frequency)
- ✅ Users manually refresh scores after importing data
- ✅ Admins can test bounce triggers in development

---

## Technical Notes

### Lead Score Breakdown - Data Contract
```typescript
interface LeadScoreBreakdown {
  leadId: string;
  totalScore: number;
  breakdown: {
    engagement: number;   // Max 50 points
    recency: number;      // Max 30 points
    frequency: number;    // Max 20 points
  };
  factors: {
    lastEngagement: string | null;
    totalOpens: number;
    totalClicks: number;
    totalReplies: number;
  };
}
```

### API Client Retry Config
```typescript
// For scoring sync (long-running operation)
await apiClient('/api/leads/scoring/sync', {
  method: 'POST',
  timeout: 60000,  // 1 minute
  retries: 0       // Don't retry long operations
});
```

---

**Next Step:** Review and approve high-priority integrations (Phase 1) for implementation.

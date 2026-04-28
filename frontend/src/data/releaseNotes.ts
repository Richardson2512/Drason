export interface ReleaseNote {
    version: string;
    date: string;           // Display date
    isoDate: string;        // ISO date for schema
    label: string | null;   // e.g. 'Latest', 'Initial Release'
    slug: string;           // URL slug
    headline: string;       // Short headline for the release
    summary: string;        // 2-3 sentence summary
    features: string[];     // Bullet point features (for index page)
    sections: {
        title: string;
        description: string;
        items: { title: string; detail: string }[];
    }[];
}

export const releaseNotes: ReleaseNote[] = [
    {
        version: '1.6.0',
        date: 'April 2026',
        isoDate: '2026-04-18',
        label: 'Latest',
        slug: 'v1.6.0',
        headline: 'Lead Control Plane and ESP-Aware Routing',
        summary: 'Superkabe becomes the primary lead entry point. Upload CSVs directly, validate every email, classify recipients by ESP, and route to the best-performing mailboxes automatically.',
        features: [
            'Lead Control Plane — CSV upload with validation, ESP classification, and campaign routing',
            'ESP-Aware Mailbox Scoring — route leads to mailboxes with the lowest bounce rate for the recipient ESP',
            'SendEvent + ReplyEvent tracking — every email sent and replied is recorded per mailbox per ESP',
            'ESP Performance Matrix dashboard — per-mailbox bounce rates broken down by Gmail, Microsoft, Yahoo',
            'Validation credits with monthly tier limits and enforcement',
            'Cross-batch duplicate detection — prevents double-processing across uploads',
            'Rejection reason tracking — disposable, no MX, syntax, SMTP fail, catch-all breakdown',
            'Analytics deep-dive — invalid rate by source, rejection reasons chart, 30-day trend',
        ],
        sections: [
            {
                title: 'Lead Control Plane',
                description: 'Every lead now enters through Superkabe — whether from a CSV upload, Clay webhook, or API call. Superkabe validates, classifies, and routes before anything reaches your sending platform.',
                items: [
                    { title: 'CSV upload with auto-mapping', detail: 'Drag and drop a CSV file. Superkabe auto-detects column headers (email, first name, last name, company, title, score) and lets you confirm or override the mapping before processing.' },
                    { title: 'Bulk validation pipeline', detail: 'Every lead runs through the full hybrid validation pipeline: syntax check, MX lookup, disposable detection, catch-all detection, and conditional MillionVerifier API probe. Results are cached for 30 days.' },
                    { title: 'ESP classification', detail: 'During validation, Superkabe resolves the recipient domain MX records and classifies the ESP: Gmail, Microsoft 365, Yahoo, or Other. This classification drives the ESP-aware routing downstream.' },
                    { title: 'Post-validation routing', detail: 'After validation, select leads from the results table and route them to any campaign across Smartlead, Instantly, or EmailBison. Or pre-select a campaign before upload for automatic routing.' },
                    { title: 'Export clean lists', detail: 'Download validated leads as CSV — export only valid leads (clean list) or full results with status, score, and ESP classification columns.' },
                ],
            },
            {
                title: 'ESP-Aware Mailbox Scoring',
                description: 'When routing a lead, Superkabe scores each mailbox in the campaign against the recipient ESP using 30-day rolling performance data — not just naive ESP matching.',
                items: [
                    { title: 'SendEvent + ReplyEvent capture', detail: 'Every EMAIL_SENT and EMAIL_REPLIED webhook from Smartlead now creates a tracking event with the recipient ESP classification. This builds the per-mailbox performance dataset over time.' },
                    { title: 'Performance aggregation worker', detail: 'Every 6 hours, Superkabe aggregates send, bounce, and reply events from the last 30 days, grouped by mailbox and recipient ESP. The result is a performance score per cell in the mailbox-ESP matrix.' },
                    { title: 'Mailbox scoring at route time', detail: 'When pushing a lead to Smartlead, Superkabe scores candidate mailboxes by their 30-day bounce rate to the recipient ESP. Top 3 mailboxes are pinned via assigned_email_accounts. Smartlead sends from only those mailboxes.' },
                    { title: 'Warming up fallback', detail: 'When a mailbox-ESP cell has fewer than 30 sends, Superkabe skips ESP scoring and lets the platform pick — preventing routing decisions based on noise.' },
                ],
            },
            {
                title: 'Validation Analytics',
                description: 'The Email Validation dashboard now shows comprehensive analytics for every upload and across your entire validation history.',
                items: [
                    { title: 'Rejection reasons breakdown', detail: 'See exactly why leads failed: disposable email, no MX records, syntax error, SMTP unreachable, catch-all domain, or low confidence score. Displayed as a percentage bar chart.' },
                    { title: 'Invalid rate by source', detail: 'Compare lead quality across sources: Clay leads at 2.1% invalid vs CSV uploads at 8.7%. Know which source needs cleanup.' },
                    { title: '30-day trend chart', detail: 'Stacked bar chart showing daily valid, risky, and invalid validation counts. Spot quality degradation trends early.' },
                    { title: 'ESP Performance Matrix', detail: 'Color-coded table showing each mailbox bounce rate per recipient ESP (Gmail, Microsoft, Yahoo, Other). Green under 1%, yellow 1-2%, red above 2%. Cells with insufficient data show warming up.' },
                ],
            },
            {
                title: 'Validation Credits and Enforcement',
                description: 'Validation credits are now enforced per tier with monthly limits.',
                items: [
                    { title: 'Tier-based credit limits', detail: 'Trial and Starter: 10,000 credits/month. Growth: 60,000. Scale: 100,000. Enterprise: unlimited. One credit equals one email validated.' },
                    { title: 'Monthly enforcement', detail: 'When credits are exhausted mid-batch, remaining leads are flagged with a credit limit message instead of being validated. Duplicates do not consume credits.' },
                    { title: 'Usage tracking on billing page', detail: 'The Emails Validated stat card on the billing page shows lifetime validation count. The analytics dashboard shows monthly usage by source.' },
                ],
            },
        ],
    },
    {
        version: '1.5.0',
        date: 'March 2026',
        isoDate: '2026-03-15',
        label: null,
        slug: 'v1.5.0',
        headline: 'Hybrid Email Validation and Load Balancing',
        summary: 'This release introduces a hybrid email validation layer that checks every incoming lead before it reaches your sending platform. We also added multi-select filters across all dashboard pages and completely redesigned the load balancing system.',
        features: [
            'Hybrid email validation layer (syntax, MX, disposable, catch-all + MillionVerifier API)',
            'Real-time validation activity feed on leads page',
            'Multi-select filters across all dashboard pages',
            'Confirmation modals for pause/resume actions',
            'Load balancing redesign with effective load metric',
        ],
        sections: [
            {
                title: 'Hybrid Email Validation Layer',
                description: 'Every incoming lead now passes through a validation pipeline before reaching your sending platform. Invalid emails are blocked automatically, protecting your mailbox reputation.',
                items: [
                    { title: 'Internal validation checks', detail: 'Syntax validation (RFC 5322), MX record lookup, disposable domain detection against 30,000+ known providers, and catch-all domain detection.' },
                    { title: 'MillionVerifier API integration', detail: 'For leads that pass basic checks but score below the confidence threshold, the system calls MillionVerifier API for SMTP-level verification. Tier-gated: Starter gets internal only, Growth triggers API for risky leads, Scale triggers for medium risk.' },
                    { title: 'DomainInsight caching', detail: 'When a domain is checked, the result is cached in a DomainInsight table. If bigcorp.com is a catch-all domain, we check once and skip API calls for every subsequent lead at that domain. This reduces API costs by 30-40%.' },
                    { title: 'Validation activity feed', detail: 'The leads page now shows a real-time validation activity panel with 24-hour summary stats and a live feed of recently validated leads.' },
                    { title: 'Dashboard-wide validation banner', detail: 'When new leads are being validated, a notification banner appears across all dashboard pages showing progress and results.' },
                ],
            },
            {
                title: 'Multi-Select Filters',
                description: 'All dashboard pages now support multi-value filtering. Select multiple statuses, campaigns, platforms, or domains simultaneously.',
                items: [
                    { title: 'Multi-select dropdowns', detail: 'New reusable MultiSelectDropdown component replaces single-value selects across leads, campaigns, mailboxes, and domains pages.' },
                    { title: 'Comma-separated backend support', detail: 'All dashboard API endpoints now accept comma-separated filter values for status, platform, campaign_id, and domain_id parameters.' },
                ],
            },
            {
                title: 'Load Balancing Redesign',
                description: 'The load balancing system now uses effective load share instead of raw campaign count. A mailbox in 5 campaigns with 20 mailboxes each is not overloaded.',
                items: [
                    { title: 'Effective load metric', detail: 'Load is now calculated as the sum of 1/mailboxes-per-campaign for each campaign the mailbox is in. A mailbox that is the sole sender in 3 campaigns has effective load 3.0. A mailbox in 3 campaigns with 10 mailboxes each has load 0.3.' },
                    { title: 'Optimization suggestions page', detail: 'New dedicated page with detailed What/Why/How breakdown for each rebalancing suggestion.' },
                    { title: 'Sort and filter controls', detail: 'Mailbox distribution table now supports sorting by total sent, effective load, and campaign count, plus filtering by status and domain.' },
                ],
            },
            {
                title: 'Other Improvements',
                description: 'Quality of life improvements across the platform.',
                items: [
                    { title: 'Confirmation modals', detail: 'All pause/resume actions now show a warning modal with the pause reason and consequences before executing. Prevents accidental actions on infrastructure.' },
                    { title: 'Bulk action bars', detail: 'Select multiple leads, campaigns, mailboxes, or domains and perform bulk CSV export. Leads page also supports bulk campaign recommendations.' },
                    { title: 'Reports page', detail: 'New reports section in the System menu with 8 report types (leads, campaigns, mailboxes, domains, analytics, audit logs, load balancing, full) with customizable filters and CSV download.' },
                ],
            },
        ],
    },
    {
        version: '1.4.0',
        date: 'February 2026',
        isoDate: '2026-02-15',
        label: null,
        slug: 'v1.4.0',
        headline: '5-Phase Healing Pipeline and State Machine Migration',
        summary: 'The biggest architectural change since launch. All status transitions now go through a centralized state machine, and the healing pipeline graduates mailboxes through 5 controlled phases instead of binary pause/resume.',
        features: [
            '5-phase healing pipeline (paused → quarantine → restricted → warm → healthy)',
            'State machine migration — single authority for all status changes',
            'Mailbox rotation with standby mailboxes',
            'Correlation engine for cross-entity failure detection',
        ],
        sections: [
            {
                title: '5-Phase Healing Pipeline',
                description: 'When a mailbox gets paused, it no longer sits in limbo. It enters a graduated recovery with explicit criteria at each phase.',
                items: [
                    { title: 'Phase 0: Paused', detail: 'Cooldown timer with exponential backoff (24h first offense, 72h second, 7 days third+). Mailbox removed from all campaigns on the sending platform.' },
                    { title: 'Phase 1: Quarantine', detail: 'Cooldown expired. System checks domain DNS health — SPF, DKIM, blacklists. If the domain is broken, the mailbox stays here. No point warming up on a poisoned domain.' },
                    { title: 'Phase 2: Restricted Send', detail: 'DNS passed. Warmup re-enabled at 10 emails/day. Must complete 15 clean sends with zero bounces. Repeat offenders need 25.' },
                    { title: 'Phase 3: Warm Recovery', detail: 'Volume increases to 50/day with +5/day ramp. Must sustain 3+ days with bounce rate under 2%.' },
                    { title: 'Phase 4: Healthy', detail: 'Full recovery. Re-added to all campaigns. Maintenance warmup continues. Resilience score gets +10 bonus.' },
                ],
            },
            {
                title: 'State Machine Migration',
                description: 'All 24+ direct status writes across the codebase were migrated to entityStateService — the single authority for status changes.',
                items: [
                    { title: 'Centralized state transitions', detail: 'entityStateService.ts validates every transition before execution. Invalid transitions (e.g., healthy → warm_recovery) are rejected. Full audit trail for every state change.' },
                    { title: 'Cooldown and locking', detail: 'Cooldown timers with exponential backoff. Optimistic locking on phase transitions prevents race conditions between workers.' },
                    { title: 'Key rule enforced', detail: 'Campaigns NEVER pause on bounce rate alone — only when ALL mailboxes are paused or removed.' },
                ],
            },
            {
                title: 'Mailbox Rotation and Correlation',
                description: 'Smart infrastructure response that goes beyond simple pausing.',
                items: [
                    { title: 'Standby rotation', detail: 'When a mailbox is paused, the system checks for standby mailboxes on the same domain and swaps them into affected campaigns automatically.' },
                    { title: 'Correlation engine', detail: 'Before pausing a mailbox, the system checks if the root cause is actually at the domain level (multiple mailboxes failing) or campaign level (bad lead list). Pauses the right entity.' },
                ],
            },
        ],
    },
    {
        version: '1.3.0',
        date: 'January 2026',
        isoDate: '2026-01-15',
        label: null,
        slug: 'v1.3.0',
        headline: 'Multi-Platform Support and Risk-Aware Routing',
        summary: 'Superkabe now works with Smartlead, Instantly, and EmailBison simultaneously. The platform adapter pattern means adding a new sender takes implementing 4 methods. Lead routing is now risk-aware with GREEN/YELLOW/RED classification.',
        features: [
            'Multi-platform support (Smartlead + Instantly + EmailBison)',
            'Platform adapter pattern',
            'Risk-aware lead routing (GREEN/YELLOW/RED)',
            'Slack real-time alerts',
        ],
        sections: [
            {
                title: 'Multi-Platform Support',
                description: 'Three sending platforms supported through a unified adapter interface.',
                items: [
                    { title: 'Platform adapter pattern', detail: 'PlatformAdapter interface with 4 methods: pauseCampaign, resumeCampaign, addMailboxToCampaign, removeMailboxFromCampaign. All monitoring, healing, and alerting works identically regardless of platform.' },
                    { title: 'Instantly integration', detail: 'Full sync, pause/resume, mailbox management via Instantly API v2 with Bearer token auth and cursor-based pagination.' },
                    { title: 'EmailBison integration', detail: 'Campaign sync, sender-email management, warmup control, and lead operations via EmailBison REST API.' },
                ],
            },
            {
                title: 'Risk-Aware Lead Routing',
                description: 'Leads are now classified by risk before being routed to campaigns.',
                items: [
                    { title: 'Health gate classification', detail: 'Every lead gets a GREEN (safe), YELLOW (controlled), or RED (blocked) classification based on validation score, engagement signals, and infrastructure health.' },
                    { title: 'Per-mailbox risk caps', detail: 'For every 60 emails a mailbox sends, max 2 can be YELLOW/risky leads. This distributes risk so no single mailbox eats a disproportionate number of bounces.' },
                    { title: 'Routing rules', detail: 'Configurable rules match leads to campaigns based on persona and minimum score. Rules are evaluated in priority order with catch-all fallback support.' },
                ],
            },
            {
                title: 'Slack Integration',
                description: 'Real-time infrastructure alerts delivered to your Slack workspace.',
                items: [
                    { title: 'Alert types', detail: 'Mailbox paused, domain blacklisted, bounce rate spike, campaign auto-stopped, healing pipeline updates, lead validation failures.' },
                    { title: 'Actionable context', detail: 'Every alert includes which entity, what happened, what the system already did about it, and what action to take.' },
                ],
            },
        ],
    },
    {
        version: '1.2.0',
        date: 'December 2025',
        isoDate: '2025-12-15',
        label: null,
        slug: 'v1.2.0',
        headline: 'Infrastructure Assessment and DNS Health',
        summary: 'New onboarding flow that assesses your infrastructure health before you start sending. DNS checks verify SPF, DKIM, and DMARC configuration. The analytics dashboard shows engagement trends over time.',
        features: [
            'Infrastructure assessment on onboarding',
            'DNS health checks (SPF, DKIM, DMARC)',
            'Bounce classification (hard/soft/transient)',
            'Analytics dashboard',
        ],
        sections: [
            {
                title: 'Infrastructure Assessment',
                description: 'Automated health check that runs when you connect your sending platform.',
                items: [
                    { title: 'DNS validation', detail: 'Checks SPF, DKIM, and DMARC records for every domain. Flags misconfigurations that would silently degrade deliverability.' },
                    { title: 'Bounce rate analysis', detail: 'Calculates current bounce rates across all mailboxes and flags those exceeding safe thresholds.' },
                    { title: 'Connection verification', detail: 'Validates SMTP and IMAP connectivity for every mailbox. Identifies disconnected or suspended accounts.' },
                ],
            },
            {
                title: 'Bounce Classification',
                description: 'Not all bounces are equal. The system now classifies each bounce for accurate risk assessment.',
                items: [
                    { title: 'Hard bounces', detail: 'Permanent failures (invalid address, blocked sender). Directly damage reputation. Counted toward pause thresholds.' },
                    { title: 'Soft bounces', detail: 'Temporary failures (full mailbox, server downtime). Only impact reputation if persistent.' },
                    { title: 'Transient bounces', detail: 'Network-level failures that resolve on retry. Not counted toward reputation scoring.' },
                ],
            },
            {
                title: 'Analytics Dashboard',
                description: 'Campaign performance visualization with daily trend data.',
                items: [
                    { title: 'Daily metrics', detail: 'Sent, opens, clicks, replies, bounces charted over time per campaign.' },
                    { title: 'Date range filtering', detail: 'Select custom date ranges to analyze specific periods.' },
                    { title: 'Summary stats', detail: 'Total sent, average open rate, average reply rate, and total bounces for the selected period.' },
                ],
            },
        ],
    },
    {
        version: '1.1.0',
        date: 'November 2025',
        isoDate: '2025-11-15',
        label: null,
        slug: 'v1.1.0',
        headline: 'Automated Bounce Management and Campaign Protection',
        summary: 'The core protection loop is now automated. Mailboxes that exceed bounce thresholds are auto-paused, and campaigns that lose all healthy mailboxes are stopped automatically.',
        features: [
            'Automated bounce management',
            'Campaign auto-pause when all mailboxes unhealthy',
            'Audit logging',
            'Notification system',
        ],
        sections: [
            {
                title: 'Automated Bounce Management',
                description: 'The monitoring worker checks every mailbox every 60 seconds and takes action when thresholds are breached.',
                items: [
                    { title: 'Configurable thresholds', detail: 'Set maximum bounce rates per mailbox. Default: 5 bounces triggers auto-pause.' },
                    { title: 'Rolling window monitoring', detail: 'Bounce rates calculated over 1-hour, 24-hour, and 7-day rolling windows for trend detection.' },
                    { title: 'Platform sync', detail: 'When a mailbox is paused, it is immediately removed from all campaigns on the sending platform via API.' },
                ],
            },
            {
                title: 'Campaign Protection',
                description: 'Campaigns are protected from sending through degraded infrastructure.',
                items: [
                    { title: 'Auto-pause', detail: 'When all mailboxes assigned to a campaign are paused or removed, the campaign itself is auto-paused to prevent stalled sends.' },
                    { title: 'Stalled campaign detection', detail: 'Dashboard shows stalled campaigns with a resolution modal explaining why and what to do.' },
                ],
            },
            {
                title: 'Audit and Notifications',
                description: 'Full visibility into system actions.',
                items: [
                    { title: 'Audit logging', detail: 'Every automated action (pause, resume, rotation, heal) is recorded with timestamp, trigger, entity, and details.' },
                    { title: 'Notification center', detail: 'In-app notifications with severity levels (info, warning, error, critical) for infrastructure events.' },
                ],
            },
        ],
    },
    {
        version: '1.0.0',
        date: 'October 2025',
        isoDate: '2025-10-15',
        label: 'Initial Release',
        slug: 'v1.0.0',
        headline: 'Real-Time Email Infrastructure Monitoring',
        summary: 'The first version of Superkabe. Connects to Smartlead, syncs your campaigns, mailboxes, and leads, and provides real-time bounce monitoring with manual intervention tools.',
        features: [
            'Initial release',
            'Smartlead integration',
            'Real-time monitoring',
            'Basic bounce tracking',
        ],
        sections: [
            {
                title: 'Smartlead Integration',
                description: 'Connect your Smartlead account and Superkabe syncs everything.',
                items: [
                    { title: 'Campaign sync', detail: 'All campaigns imported with status, mailbox assignments, and lead counts.' },
                    { title: 'Mailbox sync', detail: 'Every email account synced with connection status, warmup data, and send volumes.' },
                    { title: 'Lead sync', detail: 'Lead data synced with engagement metrics (opens, clicks, replies) from Smartlead CSV export.' },
                ],
            },
            {
                title: 'Real-Time Monitoring',
                description: 'Infrastructure health monitored continuously.',
                items: [
                    { title: '60-second cycle', detail: 'Metrics worker runs every 60 seconds checking bounce rates, connection status, and send volumes for every active mailbox.' },
                    { title: 'Infrastructure score', detail: 'Composite health score (0-100) calculated from DNS, bounce rates, engagement, and connectivity signals.' },
                    { title: 'Dashboard overview', detail: 'Single-page view of all domains, mailboxes, campaigns, and leads with health indicators.' },
                ],
            },
        ],
    },
];

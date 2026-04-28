import type { FaqItem } from '@/components/seo/FaqSection';

/**
 * Per-docs-page SEO enrichment: visible TL;DR blocks and FAQPage schema.
 *
 * Keyed by pathname (must match what `usePathname()` returns for the route).
 * Layout injects the TL;DR above {children} and the FAQ + FAQPage JSON-LD
 * below {children} when an entry exists for the current pathname.
 *
 * Add entries incrementally — any docs page without an entry continues to
 * render exactly as before (no regression).
 */
export interface DocsPageSeo {
    tldr?: string;
    faq?: FaqItem[];
}

export const docsPageSeo: Record<string, DocsPageSeo> = {
    '/docs/getting-started': {
        tldr: "Superkabe protects your outbound email infrastructure in minutes. Connect Google Workspace, Microsoft 365, or SMTP mailboxes — or wrap the protection layer around Smartlead / Instantly / EmailBison / Reply.io. Every lead flows through validation → health gate → ESP-aware routing → post-send monitoring → 5-phase auto-healing.",
        faq: [
            {
                q: "How long does Superkabe take to set up?",
                a: "Most teams are sending or protected within 15 minutes. Connect your sending platform (Gmail OAuth, Microsoft OAuth, SMTP credentials, or a Smartlead/Instantly/EmailBison API key), upload a lead list or wire up a Clay webhook, and the protection layer is active on the first send.",
            },
            {
                q: "Do I need to change my existing Smartlead/Instantly setup?",
                a: "No. Superkabe runs in Protection Mode by connecting via API and webhook — your existing campaigns, mailboxes, and sequences stay exactly where they are. Superkabe observes every send and can pause/reroute via the platform's API when thresholds are breached.",
            },
            {
                q: "Can I send natively from Superkabe instead?",
                a: "Yes. Connect Google Workspace, Microsoft 365, or custom SMTP mailboxes directly, and Superkabe runs your campaigns end-to-end — AI sequence generation, variant testing, ESP-aware routing, and the same protection layer on top.",
            },
            {
                q: "What happens when a mailbox exceeds the bounce threshold?",
                a: "It auto-pauses and enters the 5-phase recovery pipeline: Pause → Quarantine (DNS verification) → Restricted Send (15 clean sends) → Warm Recovery (50 sends over 3 days) → Healthy. Each phase has deterministic graduation criteria, not timers.",
            },
        ],
    },
    // Smartlead/Instantly/EmailBison sync integrations were removed on 2026-04-26.
    // Superkabe is the AI cold email platform now — sending + protection are one
    // product. The only Smartlead-related entry point is the one-time import wizard
    // at /dashboard/migration/from-smartlead, documented in the Clay-integration
    // and getting-started guides.
    '/docs/clay-integration': {
        tldr: "Wire Clay's HTTP webhook to Superkabe's ingest endpoint to route every enriched lead through validation, health-gate scoring, and ESP-aware routing before it reaches your sending platform. Invalid or RED-scored leads are blocked at Superkabe; GREEN and YELLOW leads are pushed to the right campaign automatically.",
        faq: [
            {
                q: "Does Superkabe charge for leads Clay already validated?",
                a: "Superkabe runs its own validation pipeline (syntax, MX, disposable, catch-all, optional MillionVerifier) because Clay's enrichment does not include deliverability-grade validation. Validation consumes credits from your Superkabe plan (Starter: 10K/mo, Growth: 60K/mo, Scale: 100K/mo).",
            },
            {
                q: "Can a single Clay webhook route to multiple campaigns?",
                a: "Yes. Superkabe's routing rules match each incoming lead against priority-ordered (persona + min_score) rules, with a wildcard catch-all. One Clay table can feed many campaigns simultaneously.",
            },
            {
                q: "What happens to leads Clay sends that Superkabe marks invalid?",
                a: "They are held with a rejection reason code (no MX, disposable, catch-all, syntax error, SMTP unreachable). You can view them in the Lead Control Plane and optionally re-process once the domain recovers or the pattern changes.",
            },
        ],
    },
    '/docs/slack-integration': {
        tldr: "Connect Slack to Superkabe via OAuth to receive real-time alerts on infrastructure events: mailbox pauses, domain reputation drops, bounce spikes, DNSBL hits, and 5-phase recovery transitions. Alert routing is configurable per channel and per severity.",
        faq: [
            {
                q: "Which events fire Slack alerts?",
                a: "Mailbox pauses, mailbox resumes, domain pauses, DNSBL critical/major hits, SMTP/IMAP connection failures, bounce rate threshold breaches, and 5-phase recovery transitions. Configurable per channel so you can route critical events to an oncall channel and informational events elsewhere.",
            },
            {
                q: "Are alerts rate-limited to prevent channel spam?",
                a: "Yes. Superkabe de-duplicates alerts within a rolling window and groups related events (e.g. a mailbox pause + campaign pause triggered by the same correlation) into a single Slack message.",
            },
        ],
    },
    '/docs/platform-rules': {
        tldr: "Superkabe's platform rules are the mathematical thresholds that govern every automatic decision: bounce rate caps, deferral rate thresholds, mailbox warning/pause triggers, campaign degradation ratios, and rotation bounds. All thresholds are configurable per workspace; defaults are tuned to ISP-safe margins.",
        faq: [
            {
                q: "What's the default mailbox pause bounce rate?",
                a: "3% bounce rate with a minimum of 60 sends before the rate is evaluated (prevents flapping on low-volume mailboxes). Warning-level threshold fires at 2%. Both are configurable per workspace.",
            },
            {
                q: "How are domain-wide thresholds different from mailbox-level?",
                a: "Domain-wide thresholds aggregate across every mailbox on the domain and fire only when multiple mailboxes are drifting together — that's the signal that the issue is domain reputation, not a single bad sender. Mailbox-level thresholds fire on individual senders.",
            },
        ],
    },
    '/docs/monitoring': {
        tldr: "Superkabe monitors every mailbox, domain, and campaign every 60 seconds — bounce rates, DNS authentication, SMTP/IMAP connection health, and 410 DNSBL lists. Drift detection uses sliding-window risk tracking and predictive variance analysis, not static alerts.",
        faq: [
            {
                q: "What DNSBL lists does Superkabe check?",
                a: "410 DNSBL lists tiered by severity (critical, major, minor). Critical hits fire alerts and can trigger automatic domain pause; major hits surface in the domain health view; minor hits are logged but don't action automatically.",
            },
            {
                q: "Can monitoring cadence be tuned?",
                a: "The core 60-second cadence is fixed because it matches ISP bounce-event propagation timing. DNSBL checks run on a separate 15-minute cadence. Both are designed to catch issues before they cascade into fleet-wide damage.",
            },
        ],
    },
    '/docs/execution-gate': {
        tldr: "The execution gate classifies every outbound lead as GREEN (safe to send), YELLOW (send with caution, per-mailbox risk caps apply), or RED (block). Classification uses validation score, recipient domain health, and ESP-aware mailbox match.",
        faq: [
            {
                q: "What does a YELLOW classification cap?",
                a: "No more than 2 YELLOW leads per 60 sends per mailbox. This bounds risk while still letting slightly-risky leads through when the sender is strong.",
            },
            {
                q: "Can I override a RED classification?",
                a: "No. RED means validation or health signals indicate the send would damage reputation. Manual override would bypass the core protection guarantee. If a RED is a false positive, resolve the underlying signal (re-validate the lead, recover the mailbox) and the lead will reclassify.",
            },
        ],
    },
    '/docs/state-machine': {
        tldr: "Entities (leads, mailboxes, domains, campaigns) each carry a state and transition through it via deterministic triggers. Mailbox states: healthy → warning → paused → quarantine → restricted_send → warm_recovery → healthy. Each transition has graduation criteria enforced by code, not timers.",
        faq: [
            {
                q: "Why separate quarantine, restricted_send, and warm_recovery?",
                a: "Each phase has a different purpose: quarantine verifies DNS auth recovery, restricted_send proves the mailbox can produce clean sends at low volume, warm_recovery ramps back to full volume. Skipping any phase would risk reopening the original damage.",
            },
            {
                q: "Who can force a state transition manually?",
                a: "Admins can force graduations via the Mailboxes dashboard, but the action is logged and requires a reason. Transitions that bypass safety checks warn explicitly.",
            },
        ],
    },
    '/docs/api-integration': {
        tldr: "Superkabe's webhook API lets external systems push leads and receive real-time status changes. POST leads to /api/v1/leads/ingest with your API key; receive webhooks for status transitions (GREEN/YELLOW/RED), pause events, and bounce events. All endpoints are HMAC-signed.",
        faq: [
            { q: "Where do I find my API key?", a: "Dashboard → Settings → API Keys. Keys are workspace-scoped. Rotate them at any time; old keys invalidate immediately." },
            { q: "Are webhook payloads signed?", a: "Yes — every outgoing webhook carries an X-Superkabe-Signature header (HMAC-SHA256 over the raw body, keyed with your webhook secret). Verify before trusting the payload." },
            { q: "What are the rate limits?", a: "Default: 600 requests/minute per workspace. Enterprise workspaces can request higher limits. 429 responses carry a Retry-After header." },
        ],
    },
    '/docs/api-documentation': {
        tldr: "Complete REST API documentation for Superkabe v1 — endpoints for leads, campaigns, mailboxes, domains, validation, and webhooks. Authentication is via Bearer API key; all payloads are JSON; all timestamps are ISO 8601 UTC.",
        faq: [
            { q: "Is there an OpenAPI spec?", a: "Yes — /api/v1/openapi.json returns the full OpenAPI 3.1 document, which you can import into Postman, Insomnia, or any SDK generator." },
            { q: "How are errors formatted?", a: "All error responses follow { error: { code, message, details? } } with conventional HTTP status codes. 4xx means client-fixable; 5xx means server-side and retryable with backoff." },
            { q: "Is there a sandbox environment?", a: "Yes — api-sandbox.superkabe.com mirrors production endpoints with test credentials and simulated bounce/reply events for integration testing." },
        ],
    },
    '/docs/mcp-server': {
        tldr: "Superkabe's MCP (Model Context Protocol) server exposes 16 tools over stdio so Claude, Cursor, and other MCP-aware agents can query campaign state, pause mailboxes, and inspect validation results directly. Authenticates via a workspace API key in the connection config.",
        faq: [
            { q: "Which agents support the Superkabe MCP server?", a: "Any MCP-compatible client: Claude Desktop, Claude Code, Cursor, Zed, Continue, and the Anthropic MCP SDK. The server speaks standard MCP over stdio — no special client-side code required." },
            { q: "Can the agent modify sending state?", a: "Yes. Tools are scoped by API key permissions — read-only keys expose only inspection tools; write-capable keys additionally expose pause, resume, and rotation controls." },
            { q: "How do I install it?", a: "npm install -g @superkabe/mcp-server, then add a server entry to your MCP client's config pointing at `superkabe-mcp` with SUPERKABE_API_KEY in env." },
        ],
    },
    '/docs/multi-platform-sync': {
        tldr: "Superkabe synchronizes lead, campaign, and mailbox state across Smartlead, Instantly, EmailBison, and Reply.io simultaneously — one source of truth with per-platform fan-out. Changes in any platform propagate to Superkabe within 60 seconds via webhook or scheduled pull.",
        faq: [
            { q: "What gets synced?", a: "Leads, campaign membership, mailbox status, bounce events, reply events, and unsubscribe events. Not synced: sequence content or platform-specific templates." },
            { q: "What if two platforms disagree about a lead's state?", a: "Superkabe treats the most recent event as authoritative and reconciles the stale platform via its API. Conflicts are logged in the Audit Log for review." },
        ],
    },
    '/docs/data-sync-coverage': {
        tldr: "Data sync coverage matrix: which fields sync bidirectionally, which are one-way, and which are platform-specific. Lead email + status: bidirectional. Bounce events: inbound only from the platform. Mailbox pause state: Superkabe → platform only (we are the authority).",
        faq: [
            { q: "Are reply events enriched with lead context?", a: "Yes. Every synced reply is matched back to the originating campaign lead, sending mailbox, and sequence step. The enriched reply event is exposed via webhook and shown in Unibox." },
            { q: "What happens if a sync fails?", a: "Failures enter a retry queue with exponential backoff up to 5 attempts. After exhaustion, the event is logged to the Audit Log with reason and surfaced in the Platform Status view." },
        ],
    },
    '/docs/configuration': {
        tldr: "Superkabe configuration lives at the workspace level. Configure bounce thresholds (default 3% pause / 2% warning), send rate caps, routing rule priority, validation strictness, and alert destinations. Changes take effect on the next monitoring tick (within 60s).",
        faq: [
            { q: "Can configuration differ per domain?", a: "Yes. Global defaults apply unless a domain-level override is set. Common override: tighter bounce threshold (1.5%) for high-value primary domains." },
            { q: "Are configuration changes versioned?", a: "Yes. Every change is recorded in the Audit Log with user, timestamp, and before/after values. Rollback is one click." },
        ],
    },
    '/docs/deployment': {
        tldr: "Superkabe is a fully managed SaaS — no deployment required for most teams. Enterprise customers can run the entire platform in a dedicated VPC with self-managed Redis, Postgres, and worker pods via a provided Helm chart.",
        faq: [
            { q: "Do you offer on-prem deployment?", a: "Single-tenant cloud and VPC-dedicated deployments are available on Enterprise plans. Fully on-prem (customer-managed Kubernetes) is available with a commercial agreement." },
            { q: "What are the minimum infrastructure requirements for self-hosted?", a: "Postgres 15+, Redis 7+, and a Kubernetes cluster with 4 vCPU / 16 GB RAM headroom per 10K sends/day. The Helm chart includes recommended HorizontalPodAutoscaler definitions." },
        ],
    },
    '/docs/infrastructure-assessment': {
        tldr: "The Infrastructure Assessment scans every sending domain you operate and produces a single health grade across SPF/DKIM/DMARC configuration, reputation signals (Postmaster, SNDS), DNSBL hits, and recent bounce trends. Run it before launching new campaigns to catch silent degradation.",
        faq: [
            { q: "How long does an assessment take?", a: "30–90 seconds per domain. Large fleets (50+ domains) run in parallel with no additional wait." },
            { q: "Can assessments be scheduled?", a: "Yes. Schedule weekly or daily automated assessments via Settings → Scheduled Tasks. Reports are delivered via email and posted to the configured Slack channel." },
        ],
    },
    '/docs/warmup-recovery': {
        tldr: "Warmup Recovery is the 5-phase pipeline a damaged mailbox traverses before returning to active sending: Paused → Quarantine (DNS verification) → Restricted Send (15 clean sends required) → Warm Recovery (50 sends over 3 days) → Healthy. Each phase has deterministic graduation criteria enforced in code.",
        faq: [
            { q: "How long does the full recovery pipeline take?", a: "Minimum 4–6 days, depending on how quickly the mailbox produces the required clean sends. There is no timer — graduation is based on behavior, not elapsed time." },
            { q: "Can a mailbox fail and drop back to an earlier phase?", a: "Yes. Any bounce during Restricted Send or Warm Recovery resets progress and returns the mailbox to the prior phase (or back to Paused for repeated failures)." },
        ],
    },
    '/docs/risk-scoring': {
        tldr: "Superkabe's multi-signal risk scoring combines validation score, domain health, ESP-aware mailbox performance, and engagement history into a single 0–100 score per (lead, mailbox) pair. Used by the execution gate to decide GREEN / YELLOW / RED — and by the routing engine to pick the right sender.",
        faq: [
            { q: "What signals dominate the score?", a: "Validation score and mailbox-vs-ESP historical performance carry the largest weight. Domain health acts as a modifier — a healthy mailbox on a degrading domain still scores cautiously." },
            { q: "Can I inspect a score's derivation?", a: "Yes. Every scoring event is logged with per-signal contributions. The Lead detail view exposes the breakdown alongside the final classification." },
        ],
    },
    '/docs/technical-architecture': {
        tldr: "Superkabe is an Express 5 + TypeScript + Prisma (Postgres) + BullMQ/Redis stack on the backend, Next.js 16 + React 19 on the frontend. 14 dedicated workers handle monitoring, healing, send queue, reply ingestion, validation, and integration sync. 60-second control loop cadence.",
        faq: [
            { q: "Why 60-second monitoring cadence?", a: "It matches ISP bounce-event propagation timing — slow enough to avoid API thrashing, fast enough to catch compromised mailboxes before fleet-wide cascades." },
            { q: "How are worker jobs retried?", a: "BullMQ with exponential backoff. Transient failures retry up to 5 times; permanent failures move to a dead-letter queue and surface in the Audit Log." },
        ],
    },
    '/docs/help/email-validation': {
        tldr: "Email validation runs every lead through syntax → MX lookup → disposable domain check → catch-all detection, then (for leads classified as risky) the MillionVerifier API for deep verification. Invalid leads are blocked before reaching any sender.",
        faq: [
            { q: "Why does a lead show status 'unknown'?", a: "MX lookup succeeded and the domain isn't catch-all, but SMTP-level verification was inconclusive. Unknown leads are held unless explicitly allowed." },
            { q: "Can I re-validate an old lead?", a: "Yes — select the lead in the Lead Control Plane and click Re-validate. Validation state is time-bounded; addresses can become invalid after the original check." },
        ],
    },
    '/docs/help/csv-upload': {
        tldr: "Upload leads via CSV in the Lead Control Plane. Required column: `email`. Additional columns become lead attributes usable in routing rules and sequence merge fields. Up to 500K rows per upload; duplicates are detected cross-batch.",
        faq: [
            { q: "What delimiters are supported?", a: "Comma, semicolon, and tab are auto-detected. UTF-8 encoding required — non-UTF-8 files are rejected with an encoding error." },
            { q: "Can I re-upload a file to add new leads without re-processing existing ones?", a: "Yes. Duplicate detection skips existing leads silently; new leads proceed through the validation and routing pipeline." },
        ],
    },
    '/docs/help/esp-routing': {
        tldr: "ESP-aware routing scores each mailbox's 30-day performance per recipient ESP (Gmail, Microsoft 365, Yahoo, Other) and assigns the top 3 mailboxes to each lead based on the recipient's ESP. Requires 30+ sends per (mailbox, ESP) cell before scoring activates.",
        faq: [
            { q: "What happens for brand-new mailboxes with no history?",a: "They participate in the warming-up fallback distribution — round-robin across campaigns until enough history accumulates for scoring." },
            { q: "Can I see the ESP performance matrix?", a: "Yes. Analytics → ESP Performance Matrix shows per-mailbox bounce rates broken down by recipient ESP, updated every 60 seconds." },
        ],
    },
    '/docs/help/validation-credits': {
        tldr: "Validation credits meter MillionVerifier API probes for risky leads (syntax-only checks, MX lookups, and catch-all detection are free and uncounted). Starter: 10K/mo, Growth: 60K/mo, Scale: 100K/mo, Enterprise: unlimited. Credits reset on billing anniversary.",
        faq: [
            { q: "Do unused credits roll over?", a: "No. Credits reset monthly. Usage reports help plan an upgrade if you're consistently hitting the cap." },
            { q: "Which leads consume a credit?", a: "Only leads classified as risky by the internal validation pipeline — typically catch-all domains, temporary pattern-matched domains, or domains with ambiguous MX configurations." },
        ],
    },
    '/docs/help/auto-healing': {
        tldr: "Auto-healing is the 5-phase recovery pipeline for compromised mailboxes: Paused → Quarantine → Restricted Send → Warm Recovery → Healthy. Each phase is gated by deterministic health checks, not timers. Full recovery typically takes 4–6 days.",
        faq: [
            { q: "What triggers auto-healing?", a: "Any mailbox pause event — bounce threshold breach, DNSBL critical hit, SMTP/IMAP connection failure, or explicit admin pause." },
            { q: "Can I accelerate a mailbox through the pipeline?", a: "Admins can force phase graduations with a required reason; this is logged. Not recommended — skipping phases often reopens the original damage." },
        ],
    },
    '/docs/help/quarantine': {
        tldr: "Quarantine is the second phase of auto-healing, after a mailbox has been paused. During quarantine, Superkabe re-verifies SPF, DKIM, and DMARC records and confirms DNS propagation before allowing any sends. Typical duration: 6–24 hours.",
        faq: [
            { q: "Why DNS re-verification specifically?", a: "Most mailbox compromises correlate with DNS drift (expired SPF include, DKIM rotation gap, DMARC policy changes). Verifying auth records first catches root-cause issues before they re-trigger bounces." },
            { q: "What if DNS verification fails?", a: "The mailbox stays in quarantine and an alert fires with the specific failing check. Sending will not resume until DNS is corrected and re-verified." },
        ],
    },
    '/docs/help/mailbox-rotation': {
        tldr: "When a mailbox is paused, Superkabe automatically swaps in a healthy standby mailbox so the campaign keeps sending. Rotation respects ESP-aware scoring — the standby is chosen based on its performance against the campaign's recipient ESP distribution.",
        faq: [
            { q: "Do I need to pre-assign standbys?", a: "No. Any healthy mailbox in the workspace with capacity can be automatically selected. For fine-grained control, you can pin specific standbys per campaign in Settings." },
            { q: "What if no healthy mailbox is available?", a: "The campaign pauses with a 'No healthy mailbox' status and alerts fire. This is a signal that fleet size is below the safe operating floor for the current volume." },
        ],
    },
    '/docs/help/entity-statuses': {
        tldr: "Superkabe entities (leads, mailboxes, domains, campaigns) each carry a status label that drives UI coloring and automated behavior. Common statuses: ACTIVE, HELD, PAUSED, QUARANTINE, RESTRICTED_SEND, WARM_RECOVERY, COMPLETED, UNSUBSCRIBED, BOUNCED, REPLIED.",
        faq: [
            { q: "What's the difference between PAUSED and HELD?", a: "PAUSED applies to mailboxes/domains/campaigns that have been deactivated (often for healing). HELD applies to leads waiting for a dependency — failed push, unavailable campaign, queued for routing." },
            { q: "Can statuses be customized?", a: "The core lifecycle statuses are fixed because they drive automated behavior. Custom tags are separate and do not affect routing or healing." },
        ],
    },
    '/docs/help/status-colors': {
        tldr: "Status colors across Superkabe use a consistent palette: green = healthy/active, amber = warning/drifting, red = paused/blocked, blue = in-progress (warmup/recovery), gray = completed/inactive. Color is paired with an explicit status label — never relied on alone.",
        faq: [
            { q: "Are colors accessibility-safe?", a: "Yes. All status indicators pair color with either a label or icon, meeting WCAG AA contrast requirements and remaining distinguishable in deuteranopic / protanopic views." },
        ],
    },
    '/docs/help/dns-setup': {
        tldr: "Configure SPF, DKIM, and DMARC for every sending domain: SPF authorizes your sending sources (include Google / Microsoft / custom SMTP as appropriate), DKIM signs outbound messages (rotate keys periodically), and DMARC aligns the two with an enforcement policy (start at p=none, graduate to p=quarantine).",
        faq: [
            { q: "Why does SPF fail after I add a new sending source?", a: "SPF has a 10-DNS-lookup limit. Adding a new `include:` often pushes you over. Fix by flattening includes using a subdomain delegation or SPF flattening service, not by removing legitimate senders." },
            { q: "What's the right DMARC policy for cold outreach?", a: "Start at p=none with rua= reports pointed at a DMARC aggregator. After confirming alignment is clean for 2–4 weeks, graduate to p=quarantine. Most cold email teams do not need p=reject." },
        ],
    },
    '/docs/help/bounce-classification': {
        tldr: "Superkabe classifies bounces as hard (permanent delivery failure — address doesn't exist, domain invalid, mailbox disabled) or soft (temporary — mailbox full, server offline, greylisting). Only hard bounces count toward the pause threshold; soft bounces trigger deferral-rate monitoring separately.",
        faq: [
            { q: "What SMTP codes qualify as hard bounces?", a: "5.1.1, 5.1.2, 5.1.10, 5.2.1, 5.4.4, and related 5.x.x patterns. The full classification table is in the Audit Log per-event." },
            { q: "What about 4xx codes?", a: "4xx codes are soft bounces by spec. Persistent 4xx (same recipient failing for 48+ hours) is promoted to hard bounce to avoid a recipient stuck in perpetual retry." },
        ],
    },
    '/docs/help/load-balancing': {
        tldr: "Load balancing distributes campaign sends across the mailbox fleet based on three signals: remaining daily capacity, ESP-aware score against each lead's recipient ESP, and current health state. No single mailbox can be oversubscribed above its configured cap.",
        faq: [
            { q: "How is daily capacity determined?", a: "Based on mailbox age, warmup progress, and sending history. New mailboxes start at 15 sends/day; fully warmed mailboxes on healthy domains can go up to 200 sends/day depending on provider policy." },
            { q: "Can I manually prioritize one mailbox?", a: "Yes — configure a send-priority multiplier per mailbox in Settings. Used sparingly for high-value primary senders." },
        ],
    },
    '/docs/help/optimization-suggestions': {
        tldr: "Superkabe surfaces optimization suggestions when it detects actionable inefficiency: a mailbox with consistently low per-ESP score, a domain with DNS configuration drift, a campaign with an over-ambitious daily send cap relative to fleet health. Suggestions are never auto-applied.",
        faq: [
            { q: "Are suggestions scored or ranked?", a: "Each suggestion carries an impact tag (high/medium/low) and a category (deliverability/efficiency/cost). High-impact deliverability suggestions surface first." },
        ],
    },
    '/docs/help/campaign-paused': {
        tldr: "A campaign pauses automatically when (a) its assigned mailbox fleet breaches a bounce threshold collectively, (b) an explicit admin pause was issued, or (c) no healthy mailbox remains eligible for its assigned ESP distribution. Campaign-level pauses appear on the Campaigns page with a reason.",
        faq: [
            { q: "How do I resume a campaign?", a: "Once the trigger clears (mailbox recovers, ESP fleet recovers, admin re-activates), resume is one click. If auto-resume is enabled in Settings, it happens automatically." },
            { q: "Do leads accumulate while the campaign is paused?", a: "Yes — new leads route to the campaign and sit in its held queue. They release automatically when the campaign resumes, in the same order they arrived." },
        ],
    },
    '/docs/help/connection-errors': {
        tldr: "Connection errors (SMTP/IMAP failures, OAuth token expiry, TLS handshake failures) are detected within the 60-second monitoring cycle. Affected mailboxes are flagged and — if errors persist beyond 5 consecutive checks — paused until connection is restored.",
        faq: [
            { q: "What causes OAuth tokens to expire?", a: "Google and Microsoft rotate refresh tokens; user-revoked consent; password changes on the underlying account; Workspace admin policy changes. Re-authentication is usually single-click." },
            { q: "Do I get alerted before pause?", a: "Yes. An alert fires after the 3rd consecutive failure; pause fires after the 5th. This window lets admins intervene before downtime." },
        ],
    },
    '/docs/help/infrastructure-score-explained': {
        tldr: "The Infrastructure Score is a composite 0–100 grade per sending domain, rolling up DNS auth correctness, reputation signals, bounce trend, deferral pattern, and DNSBL status. 90+ is safe; 70–89 needs attention; below 70 indicates active damage.",
        faq: [
            { q: "What single change moves the score fastest?", a: "Fixing DNS authentication issues (SPF / DKIM / DMARC alignment) often moves the score 15–25 points within 24 hours. Bounce-rate improvements take longer because the score is a trailing metric." },
            { q: "Can I compare scores across domains?", a: "Yes. The Domains page shows all domains with their current and 30-day score trend. Useful for identifying drifting domains before they cross into active damage." },
        ],
    },
    '/docs/help/24-7-monitoring': {
        tldr: "Superkabe monitors your entire fleet continuously — 60-second mailbox health checks, 15-minute DNSBL scans, 6-hour DNS auth re-verification, and real-time bounce/reply event ingestion. Never sleeps, never takes breaks, never misses a window where damage can accrue.",
        faq: [
            { q: "Is monitoring affected by timezone or business hours?", a: "No. Workers run independently of workspace timezone. Alerts can be timezone-aware (notify during work hours) but monitoring and automated action never pause." },
        ],
    },
    '/docs/help/notifications': {
        tldr: "Notifications fire via Slack, email, and webhook on infrastructure events: mailbox pause/resume, domain pause, DNSBL hits, bounce threshold breaches, 5-phase recovery transitions. Severity-configurable per channel to avoid alert fatigue.",
        faq: [
            { q: "How do I avoid notification spam?", a: "Route critical events to an oncall channel and informational events elsewhere. Superkabe de-duplicates alerts within a rolling window and groups related events into a single message." },
            { q: "Can I send notifications to a custom destination?", a: "Yes — a generic webhook destination accepts JSON payloads. Use it to route into PagerDuty, Opsgenie, or an internal tool." },
        ],
    },
    '/docs/help/audit-logs': {
        tldr: "The Audit Log records every material event in the workspace: configuration changes, lead status transitions, mailbox pauses/resumes, admin actions, failed API calls, and automated interventions. Retention is 12 months; exportable as CSV.",
        faq: [
            { q: "Can I filter the log by entity?", a: "Yes. Filter by actor (user/system), entity type (lead, mailbox, domain, campaign), action, or time range. Useful for debugging a specific mailbox's behavior." },
            { q: "Are sensitive fields (API keys, OAuth tokens) logged?", a: "No. Secret values are masked at log-time; only the action and non-sensitive metadata are persisted." },
        ],
    },
    '/docs/help/analytics': {
        tldr: "Analytics surfaces capture send funnel (sends, opens, clicks, replies, bounces, unsubscribes), ESP performance matrix (per-mailbox × per-ESP bounce rates), domain health trends, and validation rejection reasons. Filter by campaign, mailbox, domain, and custom time range.",
        faq: [
            { q: "Can I export analytics to my BI tool?", a: "Yes. Scheduled CSV exports deliver to S3 or email; the REST API exposes raw event streams for direct ingestion into Looker, Metabase, or similar." },
            { q: "How is inbox placement measured?", a: "Inferred from engagement patterns (open velocity, reply timing, complaint rate). For teams that want dedicated seed testing, placement data can be pushed in via webhook." },
        ],
    },
    '/docs/help/billing': {
        tldr: "Billing is plan-tier based: Starter $19/mo, Growth $99/mo, Scale $299/mo, Enterprise custom. Plans include validation credits and mailbox/domain capacity; overages are billed monthly. Annual billing discounts are available.",
        faq: [
            { q: "Can I change plans mid-month?", a: "Yes. Upgrades take effect immediately; downgrades take effect at the end of the current billing cycle. Usage prorates automatically." },
            { q: "What happens if I exceed my validation credit budget?", a: "Overage credits bill at per-credit rate. You can cap the overage (hard stop at plan limit) in Billing Settings." },
        ],
    },
    '/docs/help/account-management': {
        tldr: "Account management covers workspace members, roles (Admin, Operator, Viewer), API keys, SSO (Google Workspace, Okta, Microsoft Entra), and workspace-level policy (default bounce thresholds, retention, alert routing).",
        faq: [
            { q: "How many workspaces can a company have?", a: "Unlimited on Scale and Enterprise plans. Useful for agencies that want per-client isolation — each client workspace carries its own mailboxes, policies, and audit trail." },
            { q: "Is SSO available on Starter?", a: "Google Workspace SSO is available on all plans. Okta and Microsoft Entra SSO are on Scale and Enterprise." },
        ],
    },
};

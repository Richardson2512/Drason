import type { FaqEntry, ProductComparisonTable } from './productPages';

/**
 * Supplementary SEO/AEO/GEO enrichment for product pages, keyed by slug.
 *
 * The product renderer merges this in on top of `productPages.ts` —
 * if `productPages[slug].tldr` / `.faq` / `.comparisonTable` are unset,
 * the renderer falls back to the entry here.
 *
 * Maintained separately so the core productPages.ts (already 1100+ lines)
 * stays focused on the narrative copy while AEO signals live alongside
 * each other for easy review and coverage audits.
 */
export interface ProductPageSeo {
    tldr?: string;
    faq?: FaqEntry[];
    comparisonTable?: ProductComparisonTable;
    dateModified?: string;
}

export const productPageSeo: Record<string, ProductPageSeo> = {
    "automated-bounce-management": {
        tldr: "Superkabe intercepts every SMTP 5xx hard bounce via webhook from your sending engine (Smartlead, Instantly, EmailBison, or native) and evaluates the originating domain's bounce rate in real time. The moment the rate approaches the 2% safety threshold, Superkabe issues an API command to pause the compromised mailbox — before ISPs apply reputation penalties.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What bounce rate threshold does Superkabe enforce?",
                a: "Default mailbox-pause threshold is 3% hard bounce rate with a 60-send minimum (prevents flapping). Warning fires at 2%. Both are configurable per workspace.",
            },
            {
                q: "Does bounce interception work with native sends and platform-connected sends?",
                a: "Yes. Native sends are monitored directly by the send pipeline; platform-connected sends (Smartlead, Instantly, EmailBison) use the platform's webhook to push bounce events into the same evaluation engine.",
            },
            {
                q: "How fast is the pause action after a bounce event?",
                a: "Sub-second. The webhook fires, the state machine evaluates the running bounce rate, and the pause API call is issued within milliseconds. No polling, no batched intervals.",
            },
        ],
    },
    "automated-domain-healing": {
        tldr: "Superkabe detects early domain fatigue — soft bounces, deferral increases, delivery drops — before any threshold is crossed, then autonomously pauses the domain, redistributes queued volume to healthy senders, and reintegrates the domain only after predictive recovery signals confirm safety. Zero manual intervention across hundreds of domains.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What are the 5 phases of automated healing?",
                a: "Paused → Quarantine (DNS verification) → Restricted Send (15 clean sends required) → Warm Recovery (50 sends over 3 days) → Healthy. Each transition is gated by deterministic health checks, not timers.",
            },
            {
                q: "Can I manually force a domain out of healing?",
                a: "Yes, admins can force transitions, but each override is logged with a required reason, and the UI warns that safety checks were bypassed. We recommend letting the state machine run unless debugging.",
            },
            {
                q: "How is 'healed' actually determined?",
                a: "Predictive variance analysis against 30-day baselines — bounce rate, deferral rate, and delivery success ratio must all remain within healthy bands for the full warm-recovery window before graduation to healthy.",
            },
        ],
    },
    "b2b-sender-reputation-management": {
        tldr: "Superkabe manages B2B sender reputation at the infrastructure level — intercepting hard bounces, spam complaints, and velocity anomalies in real time, then pausing compromised mailboxes before ISPs apply reputation penalties. Consolidates reputation telemetry across Smartlead, Instantly, and EmailBison into one governance engine.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "How long does recovery take once reputation is damaged?",
                a: "30–45 days of careful low-volume sending, during which the domain generates effectively zero revenue. Prevention via real-time governance is cheaper than repair — the core reason Superkabe operates at the interception layer rather than the reporting layer.",
            },
            {
                q: "Does this protect IP reputation or only domain reputation?",
                a: "Both. Modern ISP scoring weights domain reputation heavily, but IP reputation still matters for shared sending infrastructure. Superkabe's governance applies to whichever identity carries the send.",
            },
        ],
    },
    "bounce-rate-protection-system": {
        tldr: "Superkabe computes each domain's bounce rate continuously in real time (not daily batches). The moment the rate approaches the configured safety threshold (default 2%), direct REST API commands pause the compromised mailbox — millisecond latency between bounce event and protective action.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Why 2% and not a higher threshold?",
                a: "ISPs internally enforce bounce-rate penalties around 2–3%, and the consequences are retroactive and persistent. Crossing the line requires 30–45 days of careful rehab. The 2% default leaves safety margin.",
            },
            {
                q: "Can I tighten the threshold below 2%?",
                a: "Yes. Aggressive senders often configure 1.5% or even 1%. The guarantee remains mathematical: whatever threshold is set, mailboxes never breach it.",
            },
        ],
    },
    "case-study-bounce-reduction": {
        tldr: "An outbound agency using Superkabe reduced bounce rate from 6.8% to 0.1% across 120 mailboxes in 30 days. Method: real-time bounce interception + autonomous mailbox pausing + pre-send validation of every lead. No change to their Smartlead setup — Superkabe wrapped around it.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What was the starting bounce rate and why?",
                a: "6.8% average across the fleet, driven by stale Apollo lists and unvalidated catch-all domains. Three domains were already in active ISP throttling.",
            },
            {
                q: "How long before the first improvement was visible?",
                a: "Hours. Superkabe started pausing compromised mailboxes on day one, which dropped the instantaneous bounce rate immediately. The 30-day figure reflects full fleet stabilization and rehabilitation of previously damaged domains.",
            },
        ],
    },
    "case-study-domain-recovery": {
        tldr: "A cold email team recovered 40 burned domains in 14 days using Superkabe's 5-phase healing pipeline + automated quarantine + graduated warm recovery. Before Superkabe, the same domains had been in manual rehab for 6+ weeks with no measurable improvement.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Why was manual recovery failing?",
                a: "Human operators cannot consistently track micro-signals across 40 domains. They'd miss a 0.5% deferral rise on Domain #27 while investigating an obvious issue on Domain #12. By the time they returned, Domain #27 had burned further.",
            },
            {
                q: "What does 'recovered' mean in this case study?",
                a: "All 40 domains returned to the healthy state with sub-2% bounce rate and above-threshold delivery rate for 7 consecutive days. Warm recovery phase was the longest gate — a deliberate slow ramp that prevents reopening the original damage.",
            },
        ],
    },
    "case-study-infrastructure-protection": {
        tldr: "An outbound ops team scaled from 20K to 100K sends/day without a single domain burnout, using Superkabe's autonomous governance. Protection layer absorbed the bad-lead pressure that would have burned multiple domains under manual monitoring.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What specifically scaled: mailboxes, domains, or volume per mailbox?",
                a: "All three. Mailbox count grew 5×, domain count grew 3×, and per-mailbox daily volume increased 30%. Superkabe's per-mailbox isolation kept each sender safe independently.",
            },
            {
                q: "Would the team have hit this scale without Superkabe?",
                a: "Based on their prior burnout rate (2–3 domains per month at 20K volume), scaling to 100K without governance would have likely collapsed their infrastructure in 4–6 weeks. The protection layer made the growth curve safe.",
            },
        ],
    },
    "cold-email-infrastructure-protection": {
        tldr: "Superkabe provides autonomous infrastructure protection for high-volume cold email — per-mailbox bounce governance, per-domain reputation monitoring, and cross-fleet damage containment. Scale-critical operators who need deterministic safety guarantees, not probabilistic dashboards.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What's the difference between 'protection' and 'monitoring'?",
                a: "Monitoring tells you a domain burned yesterday. Protection prevents the burn from happening. Superkabe does both, but the prevention is the load-bearing feature — monitoring without intervention is just watching damage accrue.",
            },
            {
                q: "Does this work if my sending volume is under 5K/day?",
                a: "Yes, but the marginal value is smaller. Protection matters most when fleet size makes manual monitoring impossible. Under 5K/day, a skilled operator can sometimes keep up manually — though they shouldn't have to.",
            },
        ],
    },
    "domain-burnout-prevention-tool": {
        tldr: "Superkabe prevents domain burnout by intercepting the exact negative signals — hard bounces, spam complaints, elevated deferral rates — that cause ISPs to apply reputation penalties. Acts on these signals in real time rather than reporting them after the damage is done.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "How is burnout different from fatigue?",
                a: "Burnout is sudden (one bad lead list crosses the bounce threshold, ISPs apply penalties immediately). Fatigue is gradual (soft bounces and deferrals slowly erode reputation over weeks). Superkabe guards against both with different thresholds and cadences.",
            },
            {
                q: "Can a burned domain be recovered?",
                a: "Yes, but it takes 30–45 days of careful rehab during which the domain generates near-zero revenue. Prevention is an order of magnitude cheaper than recovery.",
            },
        ],
    },
    "email-deliverability-protection": {
        tldr: "Email Deliverability Protection is Superkabe's active middleware layer — it sits between your lead source and your sending engine (or replaces both in native mode), validating, scoring, routing, and monitoring every send against mathematical safety rules that cannot be manually overridden.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Is Deliverability Protection the same as a spam filter?",
                a: "No. Spam filters make inbox-placement decisions on the recipient side. Deliverability Protection operates on the sender side — ensuring the sender's infrastructure and behavior remain within ISP safety limits so inbox filters don't have to downrank it.",
            },
            {
                q: "Does it work alongside warmup tools?",
                a: "Yes. Superkabe governs active sending; warmup tools simulate engagement during ramp-up. They operate at different stages and are complementary.",
            },
        ],
    },
    "email-infrastructure-health-check": {
        tldr: "Superkabe performs continuous, automated email infrastructure health checks — SPF/DKIM/DMARC validation, DNSBL scanning (410 lists), bounce rate trend analysis, reputation drift detection — across your entire sending fleet. Anomalies trigger autonomous action, not just dashboard alerts.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "How often are health checks run?",
                a: "Core mailbox/domain health: every 60 seconds. DNSBL scanning: every 15 minutes. DNS authentication: on connection + every 6 hours.",
            },
            {
                q: "What happens when a DNSBL hit is detected?",
                a: "Critical hits (Spamhaus, Barracuda) trigger automatic domain pause and an alert. Major hits surface in the domain health view. Minor hits are logged without automatic action — they're informational signal.",
            },
        ],
    },
    "email-infrastructure-protection": {
        tldr: "Superkabe is the baseline protection system for outbound email infrastructure — ingress validation, real-time monitoring, autonomous pausing, and multi-phase recovery. Works with any supported sending platform (Smartlead, Instantly, EmailBison) or as the native sending engine itself.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What's the minimum infrastructure size to benefit?",
                a: "Two or more mailboxes on any single domain, or five or more mailboxes across domains. Below that, manual monitoring can keep up — though the labor cost still favors automation.",
            },
            {
                q: "Does protection require changing our sending stack?",
                a: "No. Protection Mode observes and controls your existing Smartlead / Instantly / EmailBison infrastructure via API and webhook. Native Mode is optional.",
            },
        ],
    },
    "email-validation-infrastructure-protection": {
        tldr: "Superkabe validates every lead pre-send: syntax, MX, disposable, catch-all, and conditional MillionVerifier API probing. Invalid leads are blocked at the ingestion layer — they never reach a sender. Cuts bounce rate by an order of magnitude versus unvalidated outbound.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Why not rely on the enrichment provider's validation?",
                a: "Most enrichment providers (Apollo, Clay, Ocean.io) don't validate for deliverability — they verify identity. The address may be a real person who left the company, has a full mailbox, or whose domain changed. Superkabe's validation layer catches deliverability-grade issues that identity-grade validation misses.",
            },
            {
                q: "How does catch-all detection work?",
                a: "MX lookup + pattern match against known catch-all SMTP behaviors. Catch-all domains are classified separately and routed with per-mailbox risk caps (≤2 catch-all leads per 60 sends per mailbox).",
            },
            {
                q: "Are MillionVerifier credits separate from plan credits?",
                a: "MillionVerifier probes are metered against the plan's monthly validation credit budget (Starter 10K, Growth 60K, Scale 100K, Enterprise unlimited). Only risky leads trigger the deep probe.",
            },
        ],
    },
    "esp-aware-routing": {
        tldr: "Superkabe scores every mailbox by 30-day per-ESP performance — bounce rate to Gmail, bounce rate to Microsoft, bounce rate to Yahoo, bounce rate to Other — and pins the top 3 mailboxes for each lead based on recipient ESP. An Outlook mailbox with 0.1% Gmail bounce rate outscores a Gmail mailbox with 2% Gmail bounce rate.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Why performance-based and not naive ESP-to-ESP matching?",
                a: "Because ESP alignment is a proxy, not a cause. What actually matters is the historical performance of the mailbox against the recipient's ESP — and that varies by mailbox, not by provider class. Performance-based scoring captures the signal directly.",
            },
            {
                q: "How many sends before ESP scoring activates?",
                a: "30 sends per (mailbox, ESP) cell. Below that, the sample is too small to score reliably — those cells are handled by the warming-up fallback distribution.",
            },
        ],
    },
    "how-to-prevent-domain-burnout": {
        tldr: "Prevent domain burnout by enforcing strict bounce-rate thresholds (sub-2%), validating every lead pre-send, monitoring every mailbox every 60 seconds, and auto-pausing compromised senders in real time. Manual monitoring cannot keep pace with ISP threshold enforcement.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What's the single biggest cause of domain burnout?",
                a: "Unvalidated lead lists. A 10% bounce rate from one bad upload destroys a domain in hours. Pre-send validation is the largest preventive lever.",
            },
            {
                q: "Does domain warmup prevent burnout?",
                a: "Warmup establishes initial reputation; it doesn't prevent damage from bad lead lists. A fully warmed domain can still burn in one day from a bad send. Warmup and governance solve different problems.",
            },
        ],
    },
    "how-to-protect-sender-reputation": {
        tldr: "Protect sender reputation with four layers in this order: DNS authentication (SPF, DKIM, DMARC aligned), pre-send validation (every lead), real-time infrastructure monitoring, and autonomous mailbox pausing when thresholds are breached. Each layer addresses a distinct damage vector.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Which layer matters most?",
                a: "Depends on volume. Under 5K sends/day, DNS + validation dominate. Above 20K sends/day, real-time monitoring + autonomous pausing become the largest lever because the surface area exceeds what manual ops can watch.",
            },
            {
                q: "How is reputation measured in practice?",
                a: "Via Google Postmaster (Google's view of your domain), Microsoft SNDS (Microsoft's view), DNSBL hit lists, and bounce / deferral / complaint ratios. Superkabe aggregates all four signal classes.",
            },
        ],
    },
    "lead-control-plane": {
        tldr: "The Lead Control Plane is Superkabe's ingestion layer: upload CSV, receive Clay webhooks, or push via API. Every lead is validated (syntax, MX, disposable, catch-all, optional MillionVerifier), classified by recipient ESP, scored by the health gate, and routed to the correct campaign with pinned top-3 mailboxes — all before any send.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What file formats does the CSV upload accept?",
                a: "Standard CSV with an `email` column (required) and any number of custom attribute columns. Auto-detects delimiter. Supports up to 500K rows per upload.",
            },
            {
                q: "How is duplicate detection handled across uploads?",
                a: "Cross-batch duplicate detection against organization-wide lead history. A lead uploaded twice into the same campaign is skipped on the second import; into a different campaign, it's treated as a new assignment.",
            },
        ],
    },
    "multi-platform-outbound-protection": {
        tldr: "Superkabe consolidates sending telemetry from Smartlead, Instantly, and EmailBison into a single autonomous governance engine. Instead of three independent dashboards and three independent safety policies, you get one — enforcing consistent bounce thresholds, rotation rules, and healing protocols across every platform.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Can Superkabe pause a campaign on one platform based on signals from another?",
                a: "Yes. If a domain degrades via Smartlead sends, Superkabe will also pause the same domain's mailboxes on Instantly or EmailBison — because the reputation damage is on the domain, not on the platform.",
            },
            {
                q: "Does the unified view include native Superkabe sends?",
                a: "Yes. Native sequencer sends appear alongside platform-connected sends in the analytics and governance views. One control plane for all outbound.",
            },
        ],
    },
    "outbound-domain-protection": {
        tldr: "Superkabe protects outbound sender domains through real-time bounce interception + DNS health monitoring + DNSBL scanning + autonomous recovery. When a domain shows early degradation signals, every mailbox on that domain is paused together — reputation damage is at the domain level, so protection must be too.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Why pause all mailboxes on a domain, not just the compromised one?",
                a: "Because ISP reputation is scored at the domain level. If three of your 20 mailboxes on example.com are producing bounces, the other 17 are riding the same reputation and will soon degrade unless the underlying cause is resolved.",
            },
            {
                q: "How does this interact with mailbox-level protection?",
                a: "Mailbox-level protection triggers first on localized issues (one sender behaving badly). Domain-level protection activates when multiple mailboxes on the same domain drift together — the signal that reputation damage is systemic.",
            },
        ],
    },
    "outbound-email-infrastructure-monitoring": {
        tldr: "Superkabe provides real-time outbound email infrastructure monitoring — 60-second polling of mailbox health, bounce patterns, DNS auth, and DNSBL status — that autonomously acts on critical findings. Goes beyond passive dashboards: every tracked signal is wired to an intervention path.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What separates monitoring from alerting?",
                a: "Monitoring tracks continuously. Alerting fires notifications. Superkabe does both, but the load-bearing feature is the autonomous action that follows the signal — not the notification itself.",
            },
            {
                q: "Can monitoring cadence be reduced to save cost?",
                a: "The 60-second cadence is fixed because it matches ISP bounce-event propagation timing. Slower cadence misses damage windows. Cost is not driven by polling frequency.",
            },
        ],
    },
    "sender-reputation-monitoring": {
        tldr: "Superkabe monitors live sender reputation from Google Postmaster, Microsoft SNDS, and 410 DNSBL lists, consolidated per-domain and per-IP. Reputation drift triggers automatic pause-and-recover rather than waiting for a human operator to notice.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "How fresh is Google Postmaster data?",
                a: "Postmaster publishes with 24–48 hour lag. Superkabe refreshes the pull every 6 hours and cross-references against real-time send telemetry so you're not reacting to stale data.",
            },
            {
                q: "What if Microsoft SNDS returns no data?",
                a: "SNDS requires enrollment and covers only IPs sending to Hotmail/Outlook in meaningful volume. For domains that don't qualify, Superkabe falls back to bounce-rate and deferral signals against Microsoft recipients.",
            },
        ],
    },
    "sender-reputation-protection-tool": {
        tldr: "Superkabe is a sender-reputation protection tool that actively enforces reputation safety rather than passively reporting reputation damage. Real-time bounce interception, autonomous mailbox pausing, and 5-phase recovery — every signal that damages reputation is intercepted before the damage is recorded by ISPs.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "How is this different from reputation monitoring tools?",
                a: "Monitoring tools report reputation after damage is done. Protection tools prevent the damage. Same signal, opposite workflows — Superkabe is primarily a protection tool with monitoring as a supporting surface.",
            },
        ],
    },
    "smartlead-deliverability-protection": {
        tldr: "Superkabe layers deliverability protection around Smartlead via API + webhook integration. Every bounce, reply, and delivery event from Smartlead is evaluated in real time; compromised mailboxes are paused directly through Smartlead's API, and ESP-aware routing influences lead assignment via `assigned_email_accounts`.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Does Superkabe modify my Smartlead sequences?",
                a: "No. Sequences, campaigns, and templates remain owned by Smartlead. Superkabe influences mailbox selection per lead and controls mailbox pause state — never sequence content.",
            },
            {
                q: "Does Superkabe work with Smartlead's sub-workspaces?",
                a: "Yes. Each Smartlead sub-workspace registers independently with its own API key and governance thresholds.",
            },
        ],
    },
    "smartlead-infrastructure-protection": {
        tldr: "Superkabe protects Smartlead sending infrastructure from cascading bans by enforcing cross-mailbox bounce governance and automatic mailbox pausing in real time. Smartlead's native bounce handling marks and removes recipients; Superkabe additionally protects senders.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "What cascading ban am I at risk of without Superkabe?",
                a: "When one bad lead list burns a single mailbox, uncontained bounces continue from the same infrastructure tier, spreading reputation damage across related mailboxes on the same domain or IP block. Superkabe contains that at the first compromised sender.",
            },
        ],
    },
    "what-is-email-deliverability-protection": {
        tldr: "Active email deliverability protection is a middleware category that sits between lead sources and sending engines, intercepting the signals that damage sender reputation (hard bounces, spam complaints, deferral spikes) in real time. Distinct from monitoring (passive reporting) and warmup (volume ramping) — active protection is the only layer that acts before damage is recorded.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Is deliverability protection the same as a sending platform?",
                a: "No. Sending platforms (Smartlead, Instantly, EmailBison) send email. Superkabe's protection engine wraps a sending platform (or replaces it in native mode) and governs what gets sent and when. Protection is orthogonal to the sending engine.",
            },
            {
                q: "Who needs active deliverability protection?",
                a: "Any team operating 10+ mailboxes, any agency with multi-client infrastructure, any B2B team scaling past 10K sends/day. Below that threshold, a skilled operator can sometimes keep up manually.",
            },
        ],
    },
    "multi-platform-email-validation": {
        tldr: "Superkabe validates leads across Smartlead, Instantly, and EmailBison with one unified layer — syntax, MX, disposable, catch-all, and optional MillionVerifier probing — before the lead reaches any sending platform. One validation budget, one source of truth, one API to verify.",
        dateModified: "2026-04-24",
        faq: [
            {
                q: "Can I validate without routing to a platform?",
                a: "Yes. Standalone validation mode lets you upload a CSV, validate every lead, and export a clean list — no routing, no send, just verification. Counts against your monthly validation credits.",
            },
            {
                q: "How are validation credits billed across platforms?",
                a: "A single shared budget per workspace. A lead validated once counts once, regardless of which platform it routes to afterward.",
            },
        ],
    },
};

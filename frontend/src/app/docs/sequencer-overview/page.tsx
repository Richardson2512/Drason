import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Sequencer Overview | Superkabe Docs',
    description: 'How Superkabe\'s native sequencer works end-to-end — campaigns, sequence steps, A/B variants, mailbox pool dispatch, ESP routing, reply tracking, and the handoff to the protection layer.',
    alternates: { canonical: '/docs/sequencer-overview' },
    openGraph: {
        title: 'Sequencer Overview | Superkabe Docs',
        description: 'How Superkabe\'s native sequencer works end-to-end — from campaign to dispatch to reply tracking, with the protection-layer handoff explained.',
        url: '/docs/sequencer-overview',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SequencerOverviewDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Sequencer Overview
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                The sending half of Superkabe — campaigns, sequences, dispatch, and how it hands off to the protection layer.
            </p>

            {/* ==================== TL;DR ==================== */}
            <div className="bg-indigo-50 border border-indigo-200 p-6 mb-12">
                <h3 className="font-bold text-indigo-900 text-lg mb-3">In one paragraph</h3>
                <p className="text-indigo-900 text-sm leading-relaxed">
                    A Superkabe <strong>Campaign</strong> owns a multi-step <strong>Sequence</strong>. Each step has one or more
                    <strong> Variants</strong> (A/B). Leads enrolled in the campaign become <strong>CampaignLeads</strong>. A 60-second
                    <strong> dispatcher</strong> finds CampaignLeads whose next-send time is due, picks a mailbox via ESP-aware routing,
                    and queues a batched <strong>send job</strong>. The send adapter dispatches via Gmail API / Microsoft Graph / SMTP
                    with HMAC-signed tracking pixels and List-Unsubscribe headers. Replies are detected by the IMAP poller and stop the
                    sequence. Bounces are detected by SMTP transcripts and DSN parsing, and trigger the <strong>protection layer</strong>
                    if rates cross thresholds.
                </p>
            </div>

            {/* ==================== Entity Model ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The Entity Model</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Six tables make up the sequencer&apos;s sending model. Most operations the dispatcher does are joins across
                these — knowing the model is the fastest way to predict what the system will do in any given situation.
            </p>

            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3 border-b border-gray-200 font-bold text-gray-900">Entity</th>
                            <th className="text-left p-3 border-b border-gray-200 font-bold text-gray-900">Represents</th>
                            <th className="text-left p-3 border-b border-gray-200 font-bold text-gray-900">Lifetime</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 font-mono text-indigo-700">Campaign</td>
                            <td className="p-3 text-gray-700">A named send program with a sequence, schedule, and a pool of mailboxes</td>
                            <td className="p-3 text-gray-500">Persistent — paused when finished</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 font-mono text-indigo-700">SequenceStep</td>
                            <td className="p-3 text-gray-700">One step in the campaign&apos;s sequence (subject + body + delay before next step)</td>
                            <td className="p-3 text-gray-500">Persistent</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 font-mono text-indigo-700">StepVariant</td>
                            <td className="p-3 text-gray-700">A/B variant of a step. Picked at send-time by weighted rotation</td>
                            <td className="p-3 text-gray-500">Persistent</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 font-mono text-indigo-700">CampaignLead</td>
                            <td className="p-3 text-gray-700">A lead enrolled in this campaign. Carries current_step, next_send_at, sticky mailbox, status</td>
                            <td className="p-3 text-gray-500">Per enrollment — terminal on reply / bounce / unsubscribe / completion</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 font-mono text-indigo-700">CampaignAccount</td>
                            <td className="p-3 text-gray-700">Junction row: which mailboxes the campaign can dispatch from. Optional per-mailbox override caps</td>
                            <td className="p-3 text-gray-500">Persistent</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-mono text-indigo-700">SendEvent</td>
                            <td className="p-3 text-gray-700">One row per email actually sent. Source of truth for analytics + bounce-rate windows</td>
                            <td className="p-3 text-gray-500">90-day retention</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">
                The protection layer adds <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Mailbox</code> and
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Domain</code> rows alongside ConnectedAccount —
                see the <Link href="/docs/state-machine" className="text-blue-600 hover:underline">State Machine</Link> doc for how
                those interact with the sequencer.
            </p>

            {/* ==================== Lifecycle ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">A Send&apos;s Lifecycle, Step by Step</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                A single email going from &quot;lead enrolled&quot; to &quot;reply received&quot; passes through ten distinct stages.
                Each is owned by a specific service so failures are debuggable in isolation.
            </p>

            <div className="space-y-3 mb-8">
                {[
                    { n: 1, t: 'Lead intake', d: 'Lead arrives via CSV upload, Clay webhook, manual create, REST API, or migration import. Lands in the org-wide Lead table.' },
                    { n: 2, t: 'Health gate classification', d: 'leadHealthService scores the lead GREEN / YELLOW / RED based on email validation + domain signals. RED is rejected at intake.' },
                    { n: 3, t: 'Campaign enrollment', d: 'A CampaignLead row is created in the chosen campaign. status=active, current_step=0, next_send_at=now (for the first step) or in the future (for follow-ups).' },
                    { n: 4, t: 'Dispatcher tick (every 60s)', d: 'sendQueueService scans active campaigns, finds CampaignLeads where next_send_at ≤ now, applies suppression filters (bounced / unsubscribed / paused).' },
                    { n: 5, t: 'Mailbox selection', d: 'For each due lead, ESP-aware routing scores each campaign mailbox: 0.6 × remaining_capacity + 0.4 × per-ESP performance. Highest score wins. Sticky pinning preserves the same mailbox for subsequent steps.' },
                    { n: 6, t: 'Variant pick + personalization', d: 'Weighted rotation picks a variant. Spintax + token replacement personalize the subject/body. CAN-SPAM postal-address footer + List-Unsubscribe URL are appended.' },
                    { n: 7, t: 'Send batch enqueue', d: 'Emails are batched per mailbox (one BullMQ job per mailbox per tick) so a single SMTP connection sends all of that mailbox\'s emails for the tick. Reduces connection churn and improves rate predictability.' },
                    { n: 8, t: 'Send adapter dispatch', d: 'gmailSendService / microsoftSendService / emailSendAdapters fire the actual API call. Tracking pixel and click-tracking link rewrites are injected here. SendEvent row written on success.' },
                    { n: 9, t: 'CampaignLead advance', d: 'On send success: current_step++, last_sent_at=now, next_send_at=now+step.delay. If this was the last step, status=completed.' },
                    { n: 10, t: 'Reply / bounce ingest', d: 'imapReplyWorker polls every 60s. A reply flips CampaignLead.status=replied and stops further sends. A hard bounce triggers the protection layer\'s suppression cascade.' },
                ].map(({ n, t, d }) => (
                    <div key={n} className="flex gap-4 p-4 bg-white border border-gray-200">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {n}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm mb-1">{t}</div>
                            <p className="text-gray-600 text-sm leading-relaxed">{d}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ==================== Sending Window + Caps ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Sending Window &amp; Daily Caps</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The dispatcher applies four independent caps before assigning sends. The <em>smallest</em> remaining capacity wins.
                If any one is exhausted, the lead is held until the next tick.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-100 p-5">
                    <div className="font-bold text-gray-900 text-sm mb-2">1. Mailbox global daily cap</div>
                    <p className="text-gray-600 text-sm">
                        <code className="px-1.5 py-0.5 bg-white border border-blue-200 text-blue-800 text-xs">ConnectedAccount.daily_send_limit</code>.
                        The absolute cap on what this mailbox sends per day across <em>all</em> campaigns combined.
                    </p>
                </div>
                <div className="bg-green-50 border border-green-100 p-5">
                    <div className="font-bold text-gray-900 text-sm mb-2">2. Campaign daily cap</div>
                    <p className="text-gray-600 text-sm">
                        <code className="px-1.5 py-0.5 bg-white border border-green-200 text-green-800 text-xs">Campaign.daily_limit</code>.
                        The cap on what this campaign sends per day, summed across all its assigned mailboxes.
                    </p>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-5">
                    <div className="font-bold text-gray-900 text-sm mb-2">3. Per-mailbox-per-campaign override</div>
                    <p className="text-gray-600 text-sm">
                        <code className="px-1.5 py-0.5 bg-white border border-purple-200 text-purple-800 text-xs">CampaignAccount.daily_limit_override</code>.
                        Caps how much one specific mailbox contributes to one specific campaign — used when a mailbox is shared across campaigns.
                    </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-5">
                    <div className="font-bold text-gray-900 text-sm mb-2">4. Recovery-phase warmup cap</div>
                    <p className="text-gray-600 text-sm">
                        <code className="px-1.5 py-0.5 bg-white border border-amber-200 text-amber-800 text-xs">Mailbox.warmup_limit</code>.
                        Active only when the mailbox is in QUARANTINE / RESTRICTED_SEND / WARM_RECOVERY. The protection layer owns this.
                    </p>
                </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Sending window:</strong> each campaign declares <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">schedule_timezone</code>,
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">schedule_start_time</code>,
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">schedule_end_time</code>, and a list of valid days
                (e.g. Mon–Fri). The dispatcher resolves &quot;is it in the sending window now?&quot; against the campaign&apos;s timezone, not UTC.
                Outside the window, due leads accumulate and dispatch resumes when the next valid hour begins.
            </p>

            <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Send gap:</strong> <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Campaign.send_gap_minutes</code>{' '}
                spaces sends from the same mailbox apart by at least N minutes (with a small random jitter). This makes the sending pattern
                look human and prevents tight bursts that ISPs flag as automation.
            </p>

            {/* ==================== Stop Conditions ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Stop Conditions</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                A CampaignLead is removed from the dispatch pool the moment any of these terminal events fires. Each maps to a
                distinct status; the dispatcher&apos;s pre-send filter checks them all.
            </p>

            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-3 border-b border-gray-200 font-bold text-gray-900">Event</th>
                            <th className="text-left p-3 border-b border-gray-200 font-bold text-gray-900">Detected by</th>
                            <th className="text-left p-3 border-b border-gray-200 font-bold text-gray-900">Resulting CampaignLead.status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 text-gray-700">Reply received</td>
                            <td className="p-3 text-gray-500">imapReplyWorker (60s polling)</td>
                            <td className="p-3 font-mono text-blue-700">replied</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 text-gray-700">Hard bounce</td>
                            <td className="p-3 text-gray-500">SMTP 5xx transcript / RFC 3464 DSN</td>
                            <td className="p-3 font-mono text-red-700">bounced</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 text-gray-700">Unsubscribe (footer click or List-Unsubscribe)</td>
                            <td className="p-3 text-gray-500">trackingController.processUnsubscribe</td>
                            <td className="p-3 font-mono text-rose-700">unsubscribed</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-3 text-gray-700">Sequence finished (last step sent)</td>
                            <td className="p-3 text-gray-500">sendQueueService.advanceStep</td>
                            <td className="p-3 font-mono text-gray-600">completed</td>
                        </tr>
                        <tr>
                            <td className="p-3 text-gray-700">Operator paused (UI / API)</td>
                            <td className="p-3 text-gray-500">campaignController2.pauseLead</td>
                            <td className="p-3 font-mono text-amber-700">paused</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Org-wide suppression:</strong> the dispatcher also runs a defense-in-depth check against the org-wide
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Lead.status</code> table. A lead marked
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">unsubscribed</code> or
                <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">bounced</code> at the org level is filtered out of every
                campaign — not just the one where the event happened. This is required for CAN-SPAM § 5(a)(4)(A), CASL § 11(3), and
                GDPR Art. 21 compliance.
            </p>

            {/* ==================== Handoff to Protection ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Handoff to the Protection Layer</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The sequencer is the <em>active</em> half of the platform — it dispatches mail. The protection layer is the
                <em> reactive</em> half — it watches what the sequencer just did and intervenes if the data goes bad. The handoff
                between them happens at three exact points:
            </p>

            <div className="space-y-4 mb-8">
                <div className="border-l-4 border-amber-500 pl-5 py-2">
                    <div className="font-bold text-gray-900 text-sm mb-1">1. Every send writes a SendEvent</div>
                    <p className="text-gray-600 text-sm">
                        monitoringService aggregates SendEvents into rolling windows to compute bounce rate per mailbox and per domain.
                        Threshold breach triggers <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">pauseMailbox</code> →
                        cooldown → quarantine → 5-phase healing.
                    </p>
                </div>
                <div className="border-l-4 border-red-500 pl-5 py-2">
                    <div className="font-bold text-gray-900 text-sm mb-1">2. Every bounce writes a BounceEvent + cascades suppression</div>
                    <p className="text-gray-600 text-sm">
                        A hard bounce flips <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Lead.status=bounced</code> AND
                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">CampaignLead.status=bounced</code> in one transaction.
                        The dispatcher won&apos;t pick that lead up on subsequent ticks.
                    </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-5 py-2">
                    <div className="font-bold text-gray-900 text-sm mb-1">3. The dispatcher honors recovery state</div>
                    <p className="text-gray-600 text-sm">
                        If a mailbox is <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">connection_status='disconnected'</code>{' '}
                        (e.g. paused, expired, recovering), the dispatcher skips it. If
                        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">recovery_phase</code> is in a constrained phase, the
                        warmup_limit cap kicks in. The sequencer never overrides protection — protection always wins.
                    </p>
                </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-4">
                For the full picture of how protection takes over once it&apos;s triggered, read{' '}
                <Link href="/docs/help/auto-healing" className="text-blue-600 hover:underline">Auto-Healing Pipeline</Link> and{' '}
                <Link href="/docs/state-machine" className="text-blue-600 hover:underline">State Machine</Link>.
            </p>

            {/* ==================== Compliance Surfaces ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Compliance Surfaces in the Sequencer</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Five regulatory surfaces are enforced inside the dispatcher itself, not as opt-in features. None can be disabled
                because deliverability + legal exposure both depend on them:
            </p>

            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>
                    <strong>CAN-SPAM § 5(a)(5)</strong> — every commercial email must carry a valid postal address. The dispatcher
                    refuses to send any campaign where <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Organization.mailing_address</code>{' '}
                    is null and fires a Slack alert until the operator configures one.
                </li>
                <li>
                    <strong>RFC 8058 / Gmail bulk-sender policy</strong> — every send carries
                    <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">List-Unsubscribe</code> +
                    <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">List-Unsubscribe-Post</code> headers. One-click
                    unsubscribe is mandatory above 5K sends/day.
                </li>
                <li>
                    <strong>GDPR Art. 21 / CASL § 11(3)</strong> — unsubscribes propagate org-wide via the Lead.status cascade. The
                    dispatcher checks it as defense-in-depth against partial transaction failures.
                </li>
                <li>
                    <strong>EU compliance mode</strong> — when <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">Campaign.eu_compliance_mode=true</code>,
                    the tracking pixel is suppressed (ePrivacy Art. 5(3) requires explicit consent for tracking cookies/pixels for
                    EU recipients).
                </li>
                <li>
                    <strong>RFC 3464 DSN parsing</strong> — async bounces (mailbox accepted then later rejected) are captured by the
                    IMAP poller and converted to BounceEvents so suppression can fire.
                </li>
            </ul>

            {/* ==================== What's NOT in the sequencer ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What&apos;s NOT in the Sequencer</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Worth being explicit about — these are protection-layer responsibilities and the sequencer never touches them:
            </p>

            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                <li>Pausing a mailbox — owned by <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">monitoringService.pauseMailbox</code></li>
                <li>The 5-phase healing pipeline — owned by <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">healingService</code></li>
                <li>DNSBL / IP blacklist checks — owned by <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">dnsblService</code> + <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">mailboxIpBlacklistWorker</code></li>
                <li>SPF / DKIM / DMARC validation — owned by <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">infrastructureAssessmentService</code></li>
                <li>Domain warming / cooldowns — owned by <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">warmupService</code> + <code className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-sm">warmupTrackingWorker</code></li>
            </ul>

            {/* ==================== Related Reading ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related Reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                <Link href="/docs/esp-aware-routing" className="block bg-white p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="font-bold text-gray-900 text-sm mb-1">ESP-Aware Routing</div>
                    <p className="text-gray-500 text-xs">How each send picks the optimal mailbox for the recipient&apos;s ESP</p>
                </Link>
                <Link href="/docs/email-validation" className="block bg-white p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="font-bold text-gray-900 text-sm mb-1">Email Validation</div>
                    <p className="text-gray-500 text-xs">The intake gate that runs before a lead can enroll</p>
                </Link>
                <Link href="/docs/state-machine" className="block bg-white p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="font-bold text-gray-900 text-sm mb-1">State Machine</div>
                    <p className="text-gray-500 text-xs">CampaignLead, Mailbox, and Domain status transitions</p>
                </Link>
                <Link href="/docs/help/auto-healing" className="block bg-white p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="font-bold text-gray-900 text-sm mb-1">Auto-Healing Pipeline</div>
                    <p className="text-gray-500 text-xs">What happens after the dispatcher hands off to protection</p>
                </Link>
                <Link href="/docs/api-documentation" className="block bg-white p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="font-bold text-gray-900 text-sm mb-1">REST API v1</div>
                    <p className="text-gray-500 text-xs">Programmatically create campaigns, enroll leads, fetch sends</p>
                </Link>
                <Link href="/docs/clay-integration" className="block bg-white p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="font-bold text-gray-900 text-sm mb-1">Clay Integration</div>
                    <p className="text-gray-500 text-xs">Push enriched leads from Clay directly into a campaign</p>
                </Link>
            </div>
        </div>
    );
}

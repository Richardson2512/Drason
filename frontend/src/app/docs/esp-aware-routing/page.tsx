import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ESP-Aware Routing | Superkabe Docs',
    description: 'How Superkabe routes outbound sends to the mailbox most likely to inbox each recipient — 60% capacity, 40% per-ESP performance, separate buckets for Gmail, Outlook, Mimecast, and generic SMTP.',
    alternates: { canonical: '/docs/esp-aware-routing' },
    openGraph: {
        title: 'ESP-Aware Routing | Superkabe Docs',
        description: 'How Superkabe routes outbound sends to the mailbox most likely to inbox each recipient — 60% capacity, 40% per-ESP performance, separate buckets for Gmail, Outlook, Mimecast, and generic SMTP.',
        url: '/docs/esp-aware-routing',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function EspAwareRoutingDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ESP-Aware Routing
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Pick the mailbox most likely to land in inbox for each recipient&apos;s email service provider
            </p>

            {/* ==================== What it is ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What ESP-Aware Routing Is</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe knows which Email Service Provider (ESP) the recipient uses — Gmail, Outlook/Microsoft,
                Mimecast, or a generic SMTP host — by classifying their MX records on first ingest and caching the result.
                When dispatching a sequence step, the sequencer doesn&apos;t pick a mailbox at random; it picks the
                mailbox most likely to inbox <em>for that specific ESP</em>, based on a weighted formula that combines
                remaining daily capacity with each mailbox&apos;s historical performance against that ESP.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                The result: a Gmail-strong mailbox gets fed Gmail recipients. An Outlook-strong mailbox gets fed
                Outlook recipients. Performance signals stop being averaged into mush.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">In one sentence</h3>
                <p className="text-blue-800 text-sm">
                    Score each candidate mailbox as <code className="px-2 py-1 bg-white text-blue-700 text-xs">0.6 × capacity + 0.4 × per-ESP performance</code>,
                    pick the highest, send.
                </p>
            </div>

            {/* ==================== Why it matters ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Why This Matters</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Different ESPs run different filters. Gmail&apos;s spam classifier weights different signals than
                Microsoft&apos;s SmartScreen. Mimecast looks at things neither of them care about. A mailbox with a
                stellar reputation against Gmail can be silently spam-foldered by Outlook — and you&apos;d never
                see it from a uniform pool average.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Single-pool routing — picking the &quot;next mailbox in rotation&quot; with no awareness of the recipient&apos;s
                ESP — wastes the strongest signal you have: which mailbox actually performs against which inbox provider.
                ESP-aware routing keeps that signal alive and acts on it every send.
            </p>

            {/* ==================== Supported ESPs ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Supported ESPs</h2>
            <p className="text-gray-600 mb-4">
                Every recipient domain falls into one of four buckets. Mailbox performance is tracked separately
                for each bucket.
            </p>

            <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Bucket</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Domains / Detection</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Gmail</td>
                            <td className="px-5 py-4 text-gray-600">gmail.com, googlemail.com + Google Workspace MX (<code className="px-2 py-1 bg-gray-50 text-xs">aspmx.l.google.com</code>)</td>
                            <td className="px-5 py-4 text-gray-600">Largest bucket for most B2B lists</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Microsoft</td>
                            <td className="px-5 py-4 text-gray-600">outlook.com, hotmail.com, live.com + Microsoft 365 MX (<code className="px-2 py-1 bg-gray-50 text-xs">*.protection.outlook.com</code>)</td>
                            <td className="px-5 py-4 text-gray-600">Strictest filtering; reputation-sensitive</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Mimecast</td>
                            <td className="px-5 py-4 text-gray-600">Detected via MX (<code className="px-2 py-1 bg-gray-50 text-xs">*.mimecast.com</code>)</td>
                            <td className="px-5 py-4 text-gray-600">Common in regulated industries</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Generic / Custom SMTP</td>
                            <td className="px-5 py-4 text-gray-600">Everything else — Proofpoint, Zoho, custom self-hosted, etc.</td>
                            <td className="px-5 py-4 text-gray-600">Catch-all bucket; broad but less predictable</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 mb-4">
                ESP classification happens once per recipient domain and is cached on the domain insight record.
                Re-classification fires on MX-record change.
            </p>

            {/* ==================== The 60/40 split ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The 60/40 Score</h2>
            <p className="text-gray-600 mb-4">
                For each candidate mailbox attached to the campaign, Superkabe computes a routing score:
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <code className="text-blue-700 text-base">
                    score = (0.6 × capacity) + (0.4 × esp_performance)
                </code>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Component</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Weight</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">What It Measures</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Capacity</td>
                            <td className="px-5 py-4 text-blue-600 font-mono">60%</td>
                            <td className="px-5 py-4 text-gray-600">Sends remaining today vs. daily cap, normalized 0-1. A mailbox with 200/250 remaining scores 0.80; a mailbox at its cap scores 0.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Per-ESP performance</td>
                            <td className="px-5 py-4 text-purple-600 font-mono">40%</td>
                            <td className="px-5 py-4 text-gray-600">Rolling 100-send window of bounce rate, reply rate, and engagement signals — for this mailbox, against this specific ESP only.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 mb-4">
                The mailbox with the highest combined score wins the next send. Capacity is weighted more heavily because
                pushing a mailbox over its cap is an immediate, unambiguous risk; performance is a slower-moving signal.
                The 40% performance weight is enough to consistently steer traffic toward the right mailbox-ESP pairings
                without letting a single bad day starve the queue.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-3">Worked example</h3>
                <p className="text-blue-800 text-sm mb-3">
                    Recipient is on Gmail. Three candidate mailboxes:
                </p>
                <ul className="space-y-1 text-blue-800 text-sm">
                    <li>– <strong>Mailbox A:</strong> 0.90 capacity, 0.95 Gmail performance → score = 0.54 + 0.38 = <strong>0.92</strong></li>
                    <li>– <strong>Mailbox B:</strong> 1.00 capacity, 0.60 Gmail performance → score = 0.60 + 0.24 = <strong>0.84</strong></li>
                    <li>– <strong>Mailbox C:</strong> 0.50 capacity, 0.95 Gmail performance → score = 0.30 + 0.38 = <strong>0.68</strong></li>
                </ul>
                <p className="text-blue-800 text-sm mt-3">
                    Mailbox A wins. B has more headroom but a worse Gmail track record; C is a Gmail star but nearly tapped out.
                </p>
            </div>

            {/* ==================== Bucket health ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Bucket Health</h2>
            <p className="text-gray-600 mb-4">
                A mailbox can be excellent at Gmail and terrible at Outlook. Superkabe doesn&apos;t want to lose a great
                Gmail sender just because Outlook is mad at it.
            </p>
            <p className="text-gray-600 mb-4">
                When a mailbox&apos;s per-ESP performance crosses an unhealthy threshold — for example, bounce rate
                above 2% within the last 100 sends to that ESP — Superkabe stops routing that ESP&apos;s traffic to
                that mailbox. The mailbox stays fully active for every <em>other</em> ESP it&apos;s healthy against.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="font-bold text-amber-700 mb-2">Per-ESP suspension, not full pause</h3>
                <p className="text-gray-700 text-sm">
                    This is different from the platform-rules state machine, which pauses an entire mailbox when global
                    bounce thresholds breach. Per-ESP suspension is finer-grained: one bad bucket doesn&apos;t kill the
                    whole mailbox. Global pauses still apply on top.
                </p>
            </div>

            {/* ==================== Bucket bypass ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Bucket Bypass / Override</h2>
            <p className="text-gray-600 mb-4">
                Most teams should leave routing on auto. But for specialist campaigns there&apos;s a campaign-level
                override that constrains which buckets a campaign&apos;s mailboxes can serve.
            </p>
            <p className="text-gray-600 mb-4">
                Example: a campaign tuned specifically for Outlook recipients can be set to <strong>only</strong> route
                Outlook traffic to a designated set of Outlook-strong mailboxes. Gmail or Mimecast recipients matched
                to that campaign will be routed elsewhere or held.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-4 mb-8">
                <code className="text-sm text-gray-700">
                    Campaign Settings → Advanced Routing → Restrict to ESP buckets: [Microsoft]
                </code>
            </div>

            {/* ==================== Empty bucket fallback ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">When a Bucket Has No Healthy Mailboxes</h2>
            <p className="text-gray-600 mb-4">
                If every mailbox on the campaign is suspended for the recipient&apos;s ESP — or simply doesn&apos;t
                have any with a healthy track record there yet — Superkabe falls back in this order:
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
                <ol className="space-y-3 text-gray-600 text-sm list-decimal list-inside">
                    <li>
                        <strong className="text-gray-900">Generic SMTP fallback:</strong> route to the next-best mailbox
                        in <em>any</em> bucket — typically a generic SMTP mailbox with broad cross-ESP performance — provided
                        capacity is available.
                    </li>
                    <li>
                        <strong className="text-gray-900">Hold + alert:</strong> if no healthy fallback exists, keep
                        the lead in <code className="px-2 py-1 bg-gray-100 text-xs">held</code> state and post a Slack
                        notification to the operator with the ESP, the campaign, and the suspended mailboxes.
                    </li>
                </ol>
            </div>

            <p className="text-gray-600 mb-4">
                The held lead is automatically retried on the next dispatcher tick. As soon as a mailbox comes back
                healthy for that ESP — or the operator attaches a new one — sending resumes without intervention.
            </p>

            {/* ==================== Visibility ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Visibility in the Dashboard</h2>
            <p className="text-gray-600 mb-4">
                Two pages surface the routing system:
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
                <ul className="space-y-3 text-gray-600 text-sm">
                    <li>
                        <code className="px-2 py-1 bg-gray-100 text-blue-700 text-xs">/dashboard/mailboxes</code> —
                        per-mailbox detail page shows a four-column ESP performance grid: bounce rate, reply rate,
                        engagement, and current health status (healthy / suspended) for Gmail, Microsoft, Mimecast,
                        and generic SMTP.
                    </li>
                    <li>
                        <code className="px-2 py-1 bg-gray-100 text-blue-700 text-xs">/dashboard/load-balancing</code> —
                        aggregate view: bucket health across the org, recent routing decisions with the chosen
                        mailbox and its score breakdown, and any bucket-bypass overrides currently active.
                    </li>
                </ul>
            </div>

            {/* ==================== Per-mailbox capacity ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Per-Mailbox Capacity</h2>
            <p className="text-gray-600 mb-4">
                Capacity is a separate concept from ESP performance. Every connected mailbox has a daily send cap
                configured at provider level:
            </p>

            <div className="bg-white border border-gray-200 overflow-hidden mb-6 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Provider</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Default Cap</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Gmail (free)</td>
                            <td className="px-5 py-4 text-gray-700 font-mono">250 / day</td>
                            <td className="px-5 py-4 text-gray-600">Hard provider limit</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Google Workspace</td>
                            <td className="px-5 py-4 text-gray-700 font-mono">500 / day</td>
                            <td className="px-5 py-4 text-gray-600">External recipient limit</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Microsoft 365</td>
                            <td className="px-5 py-4 text-gray-700 font-mono">300-2,000 / day</td>
                            <td className="px-5 py-4 text-gray-600">Tenant-dependent; conservative default 300</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">SMTP / custom</td>
                            <td className="px-5 py-4 text-gray-700 font-mono">configurable</td>
                            <td className="px-5 py-4 text-gray-600">Set by operator on connect</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 mb-4">
                Capacity available = daily cap − sends already dispatched today, with warmup ramps applied for new or
                recovering mailboxes. ESP routing operates strictly within capacity: a mailbox that&apos;s tapped out
                for the day is simply not a candidate, regardless of its per-ESP performance.
            </p>

            {/* ==================== Protection mode interaction ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Interaction with Protection Mode</h2>
            <p className="text-gray-600 mb-4">
                Superkabe runs in two modes for outbound:
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
                <ul className="space-y-3 text-gray-600 text-sm">
                    <li>
                        <strong className="text-gray-900">Native sequencer:</strong> Superkabe dispatches directly
                        through your connected Gmail, Microsoft 365, or SMTP mailboxes. ESP-aware routing runs in
                        the dispatcher itself — every send is scored and assigned in real time.
                    </li>
                    <li>
                        <strong className="text-gray-900">Protection mode (Smartlead, Instantly, EmailBison):</strong>
                        {' '}when a third-party platform owns the actual sending, Superkabe enforces ESP routing at
                        the protection layer instead. Superkabe selects the right mailbox per recipient and instructs
                        the platform to use it, rather than letting the platform&apos;s own (uniform) rotation pick.
                        The 60/40 logic is identical; only the dispatch transport changes.
                    </li>
                </ul>
            </div>

            <p className="text-gray-600 mb-4">
                Either way, mailbox-by-ESP performance keeps accumulating from delivery and engagement signals, so
                the routing model improves over time regardless of which transport you use.
            </p>

            {/* ==================== Next Steps ==================== */}
            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Platform Rules — thresholds and the 5-phase recovery state machine
                        </a>
                    </li>
                    <li>
                        <a href="/docs/risk-scoring" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Risk Scoring — how lead-side risk interacts with mailbox routing
                        </a>
                    </li>
                    <li>
                        <a href="/docs/help/load-balancing" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Load Balancing — operator guide to the load-balancing dashboard
                        </a>
                    </li>
                    <li>
                        <a href="/docs/help/mailbox-rotation" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Mailbox Rotation — how standby mailboxes swap in when one is paused
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

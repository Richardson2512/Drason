import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Webhooks | Superkabe Docs',
    description: 'Receive real-time POST callbacks for sending and protection events at Superkabe — HMAC-signed, retried with exponential backoff, replayable.',
    alternates: { canonical: '/docs/webhooks' },
    openGraph: {
        title: 'Webhooks | Superkabe Docs',
        description: 'Receive real-time POST callbacks for sending and protection events at Superkabe — HMAC-signed, retried with exponential backoff, replayable.',
        url: '/docs/webhooks',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function WebhooksDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Webhooks
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Receive real-time POST callbacks for every significant sending and protection event in your account
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Webhooks Are</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe webhooks are outbound HTTP POST callbacks fired from our infrastructure to a URL you control whenever something material happens in your account — a mailbox enters quarantine, a domain trips a DNSBL, a campaign launches, a lead replies, a bounce threshold is breached. Each event is delivered as a JSON envelope, signed with HMAC-SHA256 over the raw body, and retried on failure with exponential backoff.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Webhooks are the right primitive when you want to mirror Superkabe&apos;s state into another system in near-real-time: a CRM, a data warehouse, an internal alerting bus, or a Slack incoming webhook URL. For pull-based access, use the <a href="/docs/api-documentation" className="text-blue-600 hover:text-blue-800">REST API</a> instead.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Delivery Guarantees</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>At-least-once delivery</strong> — Idempotency on the (org, event_id) pair lets you safely dedupe</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>HMAC-SHA256 signing</strong> — Stripe-compatible scheme, timestamped to prevent replay</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>6-attempt retry schedule</strong> — Spans 24+ hours with exponential backoff</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Auto-disable on chronic failure</strong> — 5 consecutive dead-letters pauses the endpoint and emails the org</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Manual replay</strong> — Any past delivery can be re-fired from the dashboard</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Per-event subscriptions</strong> — Subscribe to specific events or all events on one endpoint</div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Event Types</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The full taxonomy of emittable events. Subscribe to specific events when you create an endpoint, or leave the events list empty to receive everything.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Lead Events</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-900 font-semibold border-b border-gray-300">
                        <tr><th className="py-2 pr-4">Event</th><th className="py-2">Fires when</th></tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">lead.created</code></td><td className="py-2">A new lead is ingested via Clay, API, or CSV upload</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">lead.validated</code></td><td className="py-2">Validation pipeline finishes (syntax, MX, disposable, MillionVerifier)</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">lead.health_changed</code></td><td className="py-2">A lead transitions between GREEN / YELLOW / RED classifications</td></tr>
                        <tr><td className="py-2 pr-4"><code className="text-blue-600">lead.replied</code></td><td className="py-2">A reply is detected and the lead is removed from sequence</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Campaign Events</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-900 font-semibold border-b border-gray-300">
                        <tr><th className="py-2 pr-4">Event</th><th className="py-2">Fires when</th></tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">campaign.launched</code></td><td className="py-2">A campaign transitions from DRAFT to ACTIVE</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">campaign.paused</code></td><td className="py-2">A campaign is paused — manually or by the protection layer</td></tr>
                        <tr><td className="py-2 pr-4"><code className="text-blue-600">campaign.completed</code></td><td className="py-2">All leads in the campaign have finished their sequence</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Mailbox / Healing Events</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-900 font-semibold border-b border-gray-300">
                        <tr><th className="py-2 pr-4">Event</th><th className="py-2">Fires when</th></tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">mailbox.paused</code></td><td className="py-2">A mailbox trips a bounce / connectivity / DNS threshold and is auto-paused</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">mailbox.entered_quarantine</code></td><td className="py-2">Healing phase 2 — DNS verification cycle begins</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">mailbox.entered_restricted_send</code></td><td className="py-2">Healing phase 3 — conservative warmup volume resumes</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">mailbox.entered_warm_recovery</code></td><td className="py-2">Healing phase 4 — graduated volume ramp</td></tr>
                        <tr><td className="py-2 pr-4"><code className="text-blue-600">mailbox.healed</code></td><td className="py-2">Healing phase 5 — mailbox returns to HEALTHY and is re-added to campaigns</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Domain Events</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-900 font-semibold border-b border-gray-300">
                        <tr><th className="py-2 pr-4">Event</th><th className="py-2">Fires when</th></tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">domain.dnsbl_listed</code></td><td className="py-2">The domain appears on one of the monitored DNS blocklists</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">domain.dnsbl_cleared</code></td><td className="py-2">A previously listed domain is no longer present on any blocklist</td></tr>
                        <tr><td className="py-2 pr-4"><code className="text-blue-600">domain.dns_failed</code></td><td className="py-2">SPF, DKIM, or DMARC verification fails for the sending domain</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Send / Engagement Events</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-900 font-semibold border-b border-gray-300">
                        <tr><th className="py-2 pr-4">Event</th><th className="py-2">Fires when</th></tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">email.sent</code></td><td className="py-2">A message is dispatched through the sequencer</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">email.bounced</code></td><td className="py-2">A hard or soft bounce is recorded against a sent message</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">email.opened</code></td><td className="py-2">An open is detected via the tracking pixel</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4"><code className="text-blue-600">email.clicked</code></td><td className="py-2">A tracked link in a sent message is clicked</td></tr>
                        <tr><td className="py-2 pr-4"><code className="text-blue-600">reply.received</code></td><td className="py-2">An inbound reply is matched to a sent thread</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Payload Schema</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every webhook ships the same envelope. The <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">data</code> field carries the event-specific body.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`{
  "id": "d1f4...",                        // delivery id (X-Superkabe-Delivery-Id)
  "event": "mailbox.paused",              // event type
  "event_id": "e7c2...",                  // dedupe key (X-Superkabe-Event-Id)
  "organization_id": "org_8f1a...",       // your org
  "timestamp": "2026-04-29T14:22:18.412Z",// ISO-8601 emit time
  "data": { /* event-specific */ }
}`}</code></pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Sample: <code className="text-blue-600">mailbox.paused</code></h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`{
  "id": "d1f4a8e0-...",
  "event": "mailbox.paused",
  "event_id": "e7c2b3d4-...",
  "organization_id": "org_8f1a...",
  "timestamp": "2026-04-29T14:22:18.412Z",
  "data": {
    "mailbox_id": "mb_2k9...",
    "email": "outreach@acme-sales.com",
    "domain": "acme-sales.com",
    "reason": "bounce_rate_breached",
    "bounce_rate_24h": 0.087,
    "threshold": 0.05,
    "previous_state": "HEALTHY",
    "new_state": "PAUSED",
    "correlated_root_cause": "mailbox"
  }
}`}</code></pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Sample: <code className="text-blue-600">lead.health_changed</code></h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`{
  "id": "d4ab...",
  "event": "lead.health_changed",
  "event_id": "ec1a...",
  "organization_id": "org_8f1a...",
  "timestamp": "2026-04-29T14:23:01.118Z",
  "data": {
    "lead_id": "ld_91f...",
    "email": "jane@prospect.io",
    "previous_health": "GREEN",
    "new_health": "YELLOW",
    "score": 62,
    "reason": "domain_health_degraded"
  }
}`}</code></pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Sample: <code className="text-blue-600">email.bounced</code></h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`{
  "id": "d92c...",
  "event": "email.bounced",
  "event_id": "ee44...",
  "organization_id": "org_8f1a...",
  "timestamp": "2026-04-29T14:25:44.002Z",
  "data": {
    "send_id": "snd_7a2...",
    "lead_id": "ld_91f...",
    "campaign_id": "cmp_4b1...",
    "mailbox_id": "mb_2k9...",
    "bounce_type": "hard",
    "smtp_code": "550",
    "smtp_message": "5.1.1 The email account that you tried to reach does not exist"
  }
}`}</code></pre>
            </div>

            <p className="text-gray-600 mb-4">
                Every request includes these headers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">X-Superkabe-Event</code> — event type, e.g. <code>mailbox.paused</code></li>
                <li><code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">X-Superkabe-Event-Id</code> — stable id for dedupe across retries</li>
                <li><code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">X-Superkabe-Delivery-Id</code> — unique per delivery attempt batch</li>
                <li><code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">X-Superkabe-Signature</code> — <code>t=&lt;ts&gt;,v1=&lt;hex&gt;</code> HMAC-SHA256</li>
                <li><code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">User-Agent</code> — <code>Superkabe-Webhooks/1.0</code></li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Signature Verification</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every webhook is signed with HMAC-SHA256 using the endpoint&apos;s signing secret. The <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">X-Superkabe-Signature</code> header takes the form:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <code className="text-blue-600">X-Superkabe-Signature: t=1714400538,v1=5257a869e7eccf...</code>
            </div>
            <p className="text-gray-600 mb-4">
                To verify: take the timestamp <code>t</code>, concatenate <code>{`${'t'}`}.&lt;raw_body&gt;</code>, compute HMAC-SHA256 with your signing secret, and timing-safe compare to <code>v1</code>. Reject any request where the timestamp is older than 5 minutes — that defeats replay attacks.
            </p>

            <div className="bg-red-50 border border-red-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-red-700 mb-2">Security Warning</h3>
                <p className="text-gray-700">
                    Signature verification is <strong>mandatory</strong> in production. Without it, anyone who learns your endpoint URL can forge events. Always verify against the <strong>raw request body</strong> — not a re-serialized JSON object — because any whitespace difference will break the HMAC.
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Node.js (Express)</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`import crypto from 'crypto';
import express from 'express';

const app = express();
const SECRET = process.env.SUPERKABE_WEBHOOK_SECRET!; // whsec_...

// IMPORTANT: capture the raw body, not the parsed JSON.
app.post(
    '/webhooks/superkabe',
    express.raw({ type: 'application/json' }),
    (req, res) => {
        const header = req.header('X-Superkabe-Signature') || '';
        const parts = Object.fromEntries(
            header.split(',').map(p => p.split('='))
        ) as { t?: string; v1?: string };

        if (!parts.t || !parts.v1) return res.status(400).send('bad signature');

        const ageSec = Math.floor(Date.now() / 1000) - Number(parts.t);
        if (ageSec > 300) return res.status(400).send('signature too old');

        const signed = \`\${parts.t}.\${req.body.toString('utf-8')}\`;
        const expected = crypto.createHmac('sha256', SECRET).update(signed).digest('hex');

        const ok = crypto.timingSafeEqual(
            Buffer.from(expected, 'hex'),
            Buffer.from(parts.v1, 'hex')
        );
        if (!ok) return res.status(401).send('invalid signature');

        const event = JSON.parse(req.body.toString('utf-8'));
        // ... handle event.event, event.data ...
        res.status(200).send('ok');
    }
);`}</code></pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Python (Flask)</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`import hmac, hashlib, os, time
from flask import Flask, request, abort

app = Flask(__name__)
SECRET = os.environ["SUPERKABE_WEBHOOK_SECRET"].encode()  # whsec_...

@app.post("/webhooks/superkabe")
def superkabe():
    header = request.headers.get("X-Superkabe-Signature", "")
    parts = dict(p.split("=", 1) for p in header.split(",") if "=" in p)
    t, v1 = parts.get("t"), parts.get("v1")
    if not t or not v1:
        abort(400)

    if time.time() - int(t) > 300:
        abort(400)  # too old

    raw = request.get_data()  # raw bytes — do NOT use request.json
    signed = f"{t}.".encode() + raw
    expected = hmac.new(SECRET, signed, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, v1):
        abort(401)

    event = request.get_json()
    # ... handle event["event"], event["data"] ...
    return "", 200`}</code></pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Go (net/http)</h3>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-sm text-gray-800 overflow-x-auto"><code>{`package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "io"
    "net/http"
    "os"
    "strconv"
    "strings"
    "time"
)

var secret = []byte(os.Getenv("SUPERKABE_WEBHOOK_SECRET")) // whsec_...

func handler(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)

    var t, v1 string
    for _, part := range strings.Split(r.Header.Get("X-Superkabe-Signature"), ",") {
        kv := strings.SplitN(part, "=", 2)
        if len(kv) != 2 { continue }
        switch kv[0] {
        case "t": t = kv[1]
        case "v1": v1 = kv[1]
        }
    }
    if t == "" || v1 == "" {
        http.Error(w, "bad signature", 400); return
    }

    ts, _ := strconv.ParseInt(t, 10, 64)
    if time.Now().Unix()-ts > 300 {
        http.Error(w, "signature too old", 400); return
    }

    mac := hmac.New(sha256.New, secret)
    mac.Write([]byte(t + "."))
    mac.Write(body)
    expected := hex.EncodeToString(mac.Sum(nil))

    if !hmac.Equal([]byte(expected), []byte(v1)) {
        http.Error(w, "invalid signature", 401); return
    }
    // ... json.Unmarshal(body, &event); handle ...
    w.WriteHeader(200)
}`}</code></pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Retry Behavior</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                A delivery attempt fails when your endpoint returns a non-2xx response, times out (15-second cap), or the connection drops. Failed deliveries are retried up to <strong>6 attempts</strong> total on the following exponential schedule, measured from the prior failure:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-900 font-semibold border-b border-gray-300">
                        <tr><th className="py-2 pr-4">Attempt</th><th className="py-2 pr-4">Delay after previous failure</th><th className="py-2">Cumulative time</th></tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4">1</td><td className="py-2 pr-4">immediate</td><td className="py-2">0s</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4">2</td><td className="py-2 pr-4">30 seconds</td><td className="py-2">~30s</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4">3</td><td className="py-2 pr-4">2 minutes</td><td className="py-2">~2.5m</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4">4</td><td className="py-2 pr-4">10 minutes</td><td className="py-2">~12.5m</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4">5</td><td className="py-2 pr-4">1 hour</td><td className="py-2">~1h 12m</td></tr>
                        <tr className="border-b border-gray-200"><td className="py-2 pr-4">6</td><td className="py-2 pr-4">6 hours</td><td className="py-2">~7h 12m</td></tr>
                        <tr><td className="py-2 pr-4">final</td><td className="py-2 pr-4">24 hours</td><td className="py-2">~31h 12m → dead-letter</td></tr>
                    </tbody>
                </table>
            </div>
            <p className="text-gray-600 mb-4">
                After the final attempt, the delivery is marked <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">dead_letter</code>. It is preserved in your delivery log and can be replayed manually at any time.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-amber-700 mb-2">Idempotency Tip</h3>
                <p className="text-gray-700">
                    Because retries can fire successfully after your endpoint already processed the first attempt (e.g. you returned 500 but actually persisted the event), you should dedupe on <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">event_id</code>. The same logical event keeps the same <code>event_id</code> across all retries.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Auto-Disable</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                If <strong>5 consecutive deliveries</strong> dead-letter, Superkabe automatically disables the endpoint. No further events are dispatched until you manually re-enable it. The consecutive-failure counter is reset to zero on any successful delivery, so a healthy endpoint will not trip this rule.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                When auto-disable fires, Superkabe sends two notifications:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>An <strong>in-app notification</strong> visible to every member of your organization</li>
                <li>A <strong>transactional email</strong> (sent via Resend) to every owner and admin on the org, with the endpoint name, URL, disable reason, and a one-click re-enable link</li>
            </ul>
            <p className="text-gray-600 mb-4">
                Re-enabling the endpoint resumes future deliveries. To re-fire events that arrived during the outage, replay them from the delivery log.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Replaying Deliveries</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every delivery — successful, failed, or dead-lettered — is preserved in the delivery log at <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/dashboard/integrations/webhooks</code>. Each row shows the event type, attempt count, response code, response body (truncated to 4 KB), duration, and timestamps.
            </p>
            <p className="text-gray-600 mb-4">
                Click <strong>Replay</strong> on any row to re-enqueue the delivery. The full 6-attempt schedule is reset, so a replay can itself retry on failure. Replays are useful for backfilling events your endpoint missed during planned downtime, debugging signature verification, or testing handler changes against a real payload.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Setting Up an Endpoint</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Create the endpoint in the dashboard</h3>
            <p className="text-gray-600 mb-4">
                Navigate to <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">Integrations → Webhooks</code> and click <strong>Add Endpoint</strong>.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <code className="text-blue-600">https://app.superkabe.com/dashboard/integrations/webhooks</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Configure</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>URL</strong> — public HTTPS URL that will receive POSTs (HTTP is rejected)</li>
                <li><strong>Name</strong> — human label for the delivery log and alert emails</li>
                <li><strong>Events</strong> — pick specific event types, or leave blank to subscribe to everything</li>
                <li><strong>Provider</strong> — <code>generic</code> for HMAC-signed JSON, or <code>slack</code> for a Slack incoming webhook URL (payload is reshaped into Slack&apos;s blocks format and the signature is omitted)</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Copy the signing secret</h3>
            <p className="text-gray-600 mb-4">
                On creation, Superkabe generates a 256-bit secret prefixed <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">whsec_</code>. The full value is shown <strong>once</strong>. Store it in your secrets manager — it is required to verify signatures.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <code className="text-green-600">whsec_REPLACE_WITH_YOUR_GENERATED_SECRET</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Verify with a test event</h3>
            <p className="text-gray-600 mb-4">
                The endpoint detail page has a <strong>Send test event</strong> button that fires a synthetic <code>email.sent</code> payload. Confirm it lands at your endpoint and that signature verification passes before you wire up production traffic.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Quick Reference</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li><strong>Method:</strong> POST</li>
                    <li><strong>Content-Type:</strong> application/json</li>
                    <li><strong>Timeout:</strong> 15 seconds per attempt</li>
                    <li><strong>Max attempts:</strong> 6</li>
                    <li><strong>Auto-disable threshold:</strong> 5 consecutive dead-letters</li>
                    <li><strong>Signature scheme:</strong> HMAC-SHA256, Stripe-compatible (<code>t=&lt;ts&gt;,v1=&lt;hex&gt;</code>)</li>
                    <li><strong>Replay window enforcement:</strong> reject signatures older than 5 minutes</li>
                </ul>
            </div>

            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <a href="/docs/api-documentation" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Browse the REST API for pull-based access
                        </a>
                    </li>
                    <li>
                        <a href="/docs/disconnecting" className="text-blue-600 hover:text-blue-700 font-medium">
                            → How to safely disconnect integrations
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/integrations/webhooks" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Open the Webhooks dashboard to add an endpoint
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

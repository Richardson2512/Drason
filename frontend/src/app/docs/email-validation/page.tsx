import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Email Validation | Superkabe Docs',
    description: 'How Superkabe validates every lead before sending — syntax, MX, disposable, catch-all, plus MillionVerifier for risky leads. Status meanings, tier limits, credit rules.',
    alternates: { canonical: '/docs/email-validation' },
    openGraph: {
        title: 'Email Validation | Superkabe Docs',
        description: 'How Superkabe validates every lead before sending — syntax, MX, disposable, catch-all, plus MillionVerifier for risky leads. Status meanings, tier limits, credit rules.',
        url: '/docs/email-validation',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function EmailValidationDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Validation
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Every lead is validated through a multi-stage pipeline before any send is allowed
            </p>

            {/* ============= Section 1: What Validation Does ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Superkabe Validation Does</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every lead that lands in Superkabe — from a Clay webhook, an API call, or a CSV upload — is run through the
                same validation pipeline before it can enter a campaign. Invalid, disposable, and high-risk addresses are
                blocked at the door so they never reach your sending mailboxes. This is the single biggest contributor to
                keeping bounce rates below the 3% threshold that triggers an auto-pause downstream.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Validation runs as a five-stage pipeline. Each stage is gated on the previous one — if a check rejects an
                address, the later stages are skipped. The first four stages are Superkabe-internal and free; the fifth
                stage (MillionVerifier API) is reserved for risky leads on Growth and Scale tiers.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Pipeline Stages</h3>
                <ol className="space-y-2 text-sm text-blue-900">
                    <li><strong>1. Syntax check</strong> — RFC-compliant address parsing. Rejects malformed addresses (missing @, invalid characters, bad TLD).</li>
                    <li><strong>2. MX record lookup</strong> — confirms the recipient domain has at least one mail server registered in DNS.</li>
                    <li><strong>3. Disposable domain detection</strong> — checks against the maintained list of throwaway providers (mailinator, guerrillamail, 10minutemail, etc.).</li>
                    <li><strong>4. Catch-all detection</strong> — probes the destination MX to determine whether the domain accepts every address. Catch-all domains are flagged as risky.</li>
                    <li><strong>5. MillionVerifier API</strong> — risky-only deep verification on Growth and Scale tiers. Returns a definitive deliverability status from a real-time external check.</li>
                </ol>
            </div>

            {/* ============= Section 2: Validation Status Meanings ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Validation Status Meanings</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every validated email returns one of five statuses. The status determines how the Health Gate routes the lead.
            </p>
            <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Status</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Meaning</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Health Gate Routing</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">What You Can Do</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold">valid</code></td>
                            <td className="px-5 py-4 text-gray-600">Address exists, accepts mail, low bounce risk.</td>
                            <td className="px-5 py-4 text-gray-600">GREEN — full send.</td>
                            <td className="px-5 py-4 text-gray-600">Nothing. Send normally.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold">risky</code></td>
                            <td className="px-5 py-4 text-gray-600">Catch-all domain, role-based address, or low engagement signals.</td>
                            <td className="px-5 py-4 text-gray-600">YELLOW — risk-capped send.</td>
                            <td className="px-5 py-4 text-gray-600">Send with caps, or remove from list if you want pristine deliverability.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold">invalid</code></td>
                            <td className="px-5 py-4 text-gray-600">Syntax failure, missing MX, or disposable provider.</td>
                            <td className="px-5 py-4 text-gray-600">RED — blocked.</td>
                            <td className="px-5 py-4 text-gray-600">Remove from your source list. This address will bounce 100%.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold">unknown</code></td>
                            <td className="px-5 py-4 text-gray-600">Verifier could not reach a definitive answer (greylisting, timeout).</td>
                            <td className="px-5 py-4 text-gray-600">YELLOW — treated as risky.</td>
                            <td className="px-5 py-4 text-gray-600">Re-validate manually after 24 hours. Often resolves to valid or invalid.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold">pending</code></td>
                            <td className="px-5 py-4 text-gray-600">Async validation in flight (MillionVerifier call queued).</td>
                            <td className="px-5 py-4 text-gray-600">HELD — waiting on result.</td>
                            <td className="px-5 py-4 text-gray-600">Poll <code className="px-1 bg-gray-100 text-xs">/api/v1/validation/results</code> — typical resolution in 2-5s.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ============= Section 3: Credit Consumption ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Credit Consumption Rules</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Stages 1 through 4 of the pipeline (syntax, MX, disposable, catch-all) are Superkabe-internal and consume
                no credits. Only the MillionVerifier call in stage 5 consumes credit, and only on Growth and Scale tiers.
                Each MillionVerifier call costs <strong>1 credit</strong>. Re-validating the same email within 30 days
                returns the cached result for free.
            </p>

            <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Tier</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Price</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Credits / month</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">MillionVerifier?</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">API Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Starter</td>
                            <td className="px-5 py-4 text-gray-600">$19/mo</td>
                            <td className="px-5 py-4 text-gray-600">3,000</td>
                            <td className="px-5 py-4 text-gray-500">No (stops at catch-all)</td>
                            <td className="px-5 py-4 text-gray-500">No</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Pro</td>
                            <td className="px-5 py-4 text-gray-600">Volume-tiered</td>
                            <td className="px-5 py-4 text-gray-600">10,000 – 50,000</td>
                            <td className="px-5 py-4 text-gray-500">No (stops at catch-all)</td>
                            <td className="px-5 py-4 text-gray-500">No</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Growth</td>
                            <td className="px-5 py-4 text-gray-600">$199/mo</td>
                            <td className="px-5 py-4 text-gray-600">60,000</td>
                            <td className="px-5 py-4 text-green-600 font-medium">Yes — risky leads only</td>
                            <td className="px-5 py-4 text-green-600 font-medium">Yes</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 font-semibold text-gray-900">Scale</td>
                            <td className="px-5 py-4 text-gray-600">$349/mo</td>
                            <td className="px-5 py-4 text-gray-600">100,000</td>
                            <td className="px-5 py-4 text-green-600 font-medium">Yes — risky leads only</td>
                            <td className="px-5 py-4 text-green-600 font-medium">Yes</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-green-50 border border-green-200 p-6 mb-8">
                <h3 className="font-bold text-green-800 text-lg mb-2">30-Day Cache</h3>
                <p className="text-gray-700 text-sm">
                    Validation results are cached per organization for 30 days. If the same email is submitted again
                    inside that window, Superkabe returns the cached result instantly and consumes <strong>zero credit</strong>.
                    Cache hits don&apos;t count against your monthly allotment, regardless of how many times you re-submit.
                </p>
            </div>

            {/* ============= Section 4: Tier Interaction ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Tier Interaction with the Pipeline</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Not every tier runs the full five stages. Starter and Pro tiers stop at stage 4 (catch-all detection).
                Growth and Scale extend the pipeline to stage 5, but only for leads that came out of stage 4 flagged as
                risky — clean valid leads never trigger an API call.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="font-bold text-amber-800 text-lg mb-2">Why MillionVerifier is risky-only</h3>
                <p className="text-gray-700 text-sm mb-2">
                    Calling MillionVerifier for every single lead would burn credits on addresses that are already
                    obviously valid or obviously invalid from the first four stages. Superkabe only spends a credit
                    when stages 1-4 have produced a <code className="px-1 bg-white text-xs">risky</code> classification —
                    typically catch-all domains or role-based addresses where the internal checks alone can&apos;t reach a
                    confident verdict.
                </p>
                <p className="text-gray-700 text-sm">
                    On a typical Clay export, this means roughly 15-25% of leads consume a credit; the rest are free.
                </p>
            </div>

            {/* ============= Section 5: Health Gate Routing ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Health Gate Routing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                After validation completes, the lead is handed to the Health Gate, which classifies it as GREEN, YELLOW,
                or RED based on the validation status plus domain-level engagement signals.
            </p>

            <div className="space-y-4 mb-8 not-prose">
                <div className="bg-green-50 border-2 border-green-300 p-5">
                    <h4 className="font-bold text-green-800 mb-1">GREEN — full send</h4>
                    <p className="text-gray-700 text-sm">
                        <code className="px-1 bg-white text-xs">valid</code> status + clean domain (no recent bounces, not catch-all). Routed straight into the matching campaign.
                    </p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-300 p-5">
                    <h4 className="font-bold text-amber-800 mb-1">YELLOW — risk-capped send</h4>
                    <p className="text-gray-700 text-sm">
                        <code className="px-1 bg-white text-xs">risky</code> or <code className="px-1 bg-white text-xs">unknown</code>, or a domain with low engagement history. Routed with per-mailbox risk caps:
                        <strong> at most 2 risky leads per 60 sends per mailbox</strong>. This keeps the bounce-rate impact bounded even if some YELLOWs do bounce.
                    </p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 p-5">
                    <h4 className="font-bold text-red-800 mb-1">RED — blocked from all campaigns</h4>
                    <p className="text-gray-700 text-sm">
                        <code className="px-1 bg-white text-xs">invalid</code>, disposable provider, or known-bad domain. The lead is marked
                        <code className="px-1 bg-white text-xs"> BLOCKED</code> and never reaches a mailbox.
                    </p>
                </div>
            </div>

            {/* ============= Section 6: Batch Behavior ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Batch Behavior</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The validation API accepts batches of up to <strong>5,000 emails per call</strong>. Batches are processed
                asynchronously — the POST returns immediately with a <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">batch_id</code>,
                and you poll the results endpoint to retrieve org-wide breakdowns by status.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-2">Latency expectations</h3>
                <ul className="space-y-1 text-sm text-blue-900">
                    <li>– <strong>Stages 1-4</strong> (syntax, MX, disposable, catch-all): ~50ms per lead.</li>
                    <li>– <strong>Stage 5</strong> (MillionVerifier): ~2-5s per lead. Only fires on risky leads on paid tiers.</li>
                    <li>– A 5,000-email batch typically resolves in 30-90 seconds end-to-end on Growth/Scale.</li>
                </ul>
            </div>

            {/* ============= Section 7: Re-validation ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Re-validation Rules</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe automatically re-validates leads whose last validation was more than 30 days ago when they are
                added to a new campaign. This prevents stale data from leaking into a fresh send. You can also trigger
                manual re-validation at any time by re-submitting the email through the API.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-8">
                <li><strong>Within 30 days:</strong> cached result returns instantly. No credit consumed.</li>
                <li><strong>Beyond 30 days:</strong> full pipeline re-runs. Stage 5 charges 1 credit if the lead is risky on Growth/Scale.</li>
                <li><strong>Manual re-validation:</strong> hit <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">POST /api/v1/leads/validate</code> with the same email — the cache is bypassed only when you set <code className="px-1 bg-white text-xs">force: true</code>.</li>
            </ul>

            {/* ============= Section 8: What Blocks Validation ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Blocks or Flags an Address</h2>
            <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100">
                <p className="text-gray-700 font-semibold mb-3">Hard blocks (status = invalid → RED):</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-5">
                    <li>Syntax failure — malformed address, invalid characters, bad TLD.</li>
                    <li>Missing MX records — recipient domain has no mail server in DNS.</li>
                    <li>Disposable email provider — mailinator, guerrillamail, 10minutemail, and ~3,000 others.</li>
                </ul>
                <p className="text-gray-700 font-semibold mb-3">Risky flags (status = risky → YELLOW):</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Catch-all domain — domain accepts every address; can&apos;t confirm specific mailbox exists.</li>
                    <li>Role-based addresses — <code className="px-1 bg-gray-100 text-xs">info@</code>, <code className="px-1 bg-gray-100 text-xs">support@</code>, <code className="px-1 bg-gray-100 text-xs">no-reply@</code>, <code className="px-1 bg-gray-100 text-xs">admin@</code>, <code className="px-1 bg-gray-100 text-xs">sales@</code>.</li>
                    <li>Low-engagement domains — historical bounce rate above org-level thresholds.</li>
                </ul>
            </div>

            {/* ============= Section 9: API Reference ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">API Reference</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Validation endpoints are available on Growth and Scale tiers. All requests require an
                <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 mx-1">Authorization</code> header carrying a live API key.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">POST /api/v1/leads/validate</h3>
            <p className="text-gray-600 mb-3">
                Submit up to 5,000 emails for validation. Returns a batch ID immediately.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <pre className="text-xs text-gray-800 overflow-x-auto">{`curl -X POST https://api.superkabe.com/api/v1/leads/validate \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "emails": [
      "alice@acme.com",
      "bob@example.io",
      "info@mailinator.com"
    ]
  }'`}</pre>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
                <pre className="text-xs text-gray-800 overflow-x-auto">{`{
  "batch_id": "batch_8f3c1a92",
  "submitted": 3,
  "cached": 1,
  "queued": 2,
  "status": "processing"
}`}</pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">GET /api/v1/validation/results</h3>
            <p className="text-gray-600 mb-3">
                Poll for completed results. Returns org-wide breakdown by status plus per-email detail.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <pre className="text-xs text-gray-800 overflow-x-auto">{`curl https://api.superkabe.com/api/v1/validation/results?batch_id=batch_8f3c1a92 \\
  -H "Authorization: Bearer sk_live_abc123..."`}</pre>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-8">
                <pre className="text-xs text-gray-800 overflow-x-auto">{`{
  "batch_id": "batch_8f3c1a92",
  "status": "complete",
  "summary": {
    "valid": 1,
    "risky": 1,
    "invalid": 1,
    "unknown": 0,
    "pending": 0
  },
  "results": [
    { "email": "alice@acme.com",      "status": "valid",   "health": "GREEN",  "credits_used": 0 },
    { "email": "bob@example.io",      "status": "risky",   "health": "YELLOW", "credits_used": 1 },
    { "email": "info@mailinator.com", "status": "invalid", "health": "RED",    "credits_used": 0 }
  ],
  "credits_remaining": 59997
}`}</pre>
            </div>

            {/* ============= Section 10: Auto-pause on Bounce ============= */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Validation as Bounce Defense</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Downstream of validation, every campaign is monitored for bounces. If a campaign exceeds a 3% bounce rate
                after 60+ sends, the bounce protection auto-pauses it and triggers the 5-phase recovery pipeline on the
                affected mailboxes. In a healthy Superkabe deployment, that pause should rarely fire on validation-related
                bounces — invalid emails shouldn&apos;t have shipped in the first place because the validator blocked them
                at ingestion.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="font-bold text-amber-700 text-lg mb-2">If you see bounce-driven pauses</h3>
                <p className="text-gray-700 text-sm">
                    It usually means leads were imported through a path that bypassed validation (e.g., a legacy direct
                    SMTP import). Re-run those leads through <code className="px-1 bg-white text-xs">/api/v1/leads/validate</code> before
                    re-enrolling them, or move the import to a path that validates on ingestion.
                </p>
            </div>

            {/* ============= Next Steps ============= */}
            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Platform rules: thresholds and the 5-phase recovery pipeline
                        </a>
                    </li>
                    <li>
                        <a href="/docs/risk-scoring" className="text-blue-600 hover:text-blue-700 font-medium">
                            → How risk scoring assigns GREEN / YELLOW / RED
                        </a>
                    </li>
                    <li>
                        <a href="/docs/api-documentation" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Full API reference
                        </a>
                    </li>
                    <li>
                        <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Pricing tiers and validation credit allotments
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

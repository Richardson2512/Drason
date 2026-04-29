import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Migrate from Instantly | Superkabe Docs',
    description:
        'One-time import of campaigns, sequences, leads, block list, and mailbox metadata from Instantly v2 into Superkabe. API key auto-discards after 24 hours. Mailboxes must be reconnected.',
    alternates: { canonical: '/docs/migration/from-instantly' },
    openGraph: {
        title: 'Migrate from Instantly | Superkabe Docs',
        description:
            'One-time import of campaigns, sequences, leads, block list, and mailbox metadata from Instantly v2 into Superkabe. API key auto-discards after 24 hours. Mailboxes must be reconnected.',
        url: '/docs/migration/from-instantly',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function MigrateFromInstantlyDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Migrate from Instantly
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                One-time import of campaigns, sequences, leads, block list, and mailbox metadata from your Instantly v2 workspace into Superkabe.
            </p>

            {/* What this tool does */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What This Tool Does</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The Instantly migration wizard performs a <strong>one-time, read-only copy</strong> of your Instantly v2
                workspace into Superkabe. It pulls campaigns and their sequences (steps + A/B variants), every lead with its
                custom fields, your full block list (email + domain entries), and mailbox metadata (from-address and from-name).
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                It does <strong>not</strong> pull mailbox authentication credentials — Instantly&apos;s v2 API treats OAuth tokens
                and SMTP/IMAP passwords as write-only, so they cannot leave the source platform. After the import completes you
                will reconnect each mailbox in Superkabe before any sending begins.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Quick facts</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>▸ <strong>Free</strong> for all Superkabe tiers — no validation credits consumed during import</li>
                    <li>▸ <strong>Idempotent</strong> — re-run with the same key (within 24 hours) to resume after a failure</li>
                    <li>▸ <strong>Safe by default</strong> — every imported campaign lands in DRAFT / paused state</li>
                    <li>▸ <strong>Wizard URL:</strong> <code className="px-2 py-0.5 bg-white text-blue-700 text-xs">/dashboard/migration/from-instantly</code></li>
                </ul>
            </div>

            {/* Imported / Not Imported comparison */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Gets Imported vs. What Doesn&apos;t</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 not-prose">
                <div className="bg-green-50 border-2 border-green-300 p-6">
                    <h3 className="font-bold text-green-800 text-lg mb-3">Imported</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>– <strong>Campaigns</strong> — name, status, schedule windows, daily limits</li>
                        <li>– <strong>Sequence steps</strong> — subject line, HTML body, plain-text body, delay days/hours</li>
                        <li>– <strong>A/B variants</strong> — every variant per step with its weight (no historical stats — variants restart fresh)</li>
                        <li>– <strong>Leads</strong> — email address plus custom fields, mapped to Superkabe&apos;s lead schema</li>
                        <li>– <strong>Block list</strong> — both exact-email and domain-level suppression entries</li>
                        <li>– <strong>Mailbox metadata</strong> — from-address and from-name only</li>
                    </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-300 p-6">
                    <h3 className="font-bold text-red-800 text-lg mb-3">Not Imported</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>– <strong>Mailbox OAuth tokens / SMTP credentials</strong> — security boundary (you reconnect in Superkabe)</li>
                        <li>– <strong>Send history &amp; engagement events</strong> from before migration</li>
                        <li>– <strong>Instantly v1 (legacy) data</strong> — only v2 is supported</li>
                        <li>– <strong>Inbox replies</strong> — Superkabe&apos;s inbox starts fresh</li>
                        <li>– <strong>Custom analytics dashboards</strong></li>
                        <li>– <strong>Workspace-level settings</strong> — contact support if you need these transferred</li>
                    </ul>
                </div>
            </div>

            {/* Security model */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Security Model</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Your Instantly v2 API key is required <strong>only during the migration window</strong>. While stored, it is
                encrypted at rest using a per-organization key. Superkabe automatically discards the key when one of the
                following happens first:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>The import job finishes successfully (or is manually cancelled)</li>
                <li>24 hours pass since you last submitted the key</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mb-4">
                You can also wipe the key on demand from the wizard via the <strong>Discard Key</strong> button. Every key
                lifecycle event (store, validate, discard) is recorded in the consent audit log alongside the workspace ID it
                authorised.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="text-lg font-bold text-amber-700 mb-2">What scopes does the key need?</h3>
                <p className="text-gray-700 text-sm">
                    The wizard validates the key by calling <code className="px-2 py-0.5 bg-white text-gray-800 text-xs">GET /api/v2/workspaces/current</code>.
                    For the import itself, the key needs read access to: workspaces, campaigns, leads, accounts (mailboxes),
                    blocklist, custom tags, and lead labels. A standard Instantly v2 workspace key already grants all of these.
                </p>
            </div>

            {/* Step-by-step */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step-by-Step Walkthrough</h2>
            <p className="text-gray-600 mb-6">
                The whole flow lives at <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">/dashboard/migration/from-instantly</code>.
                Plan on 10 minutes of hands-on time plus the background import (see the time estimates below).
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Generate an Instantly v2 API key</h3>
            <p className="text-gray-600 mb-3">
                In Instantly: <strong>Settings → API → Generate Key</strong>. Copy the key immediately — Instantly only shows
                it once. You must be on Instantly v2; legacy v1 workspaces are not supported (see Edge Cases below).
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Validate the key</h3>
            <p className="text-gray-600 mb-3">
                Paste the key into the wizard and click <strong>Validate Key</strong>. Superkabe pings Instantly&apos;s whoami
                endpoint to confirm the key works and surfaces your workspace name back to you. Common failure modes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4 text-sm">
                <li><strong>401 / 403</strong> — key is invalid or revoked</li>
                <li><strong>402</strong> — your Instantly workspace plan is inactive</li>
                <li><strong>503</strong> — Instantly is temporarily unreachable; retry shortly</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Preview what will be imported</h3>
            <p className="text-gray-600 mb-3">
                Before any writes happen, the wizard runs a read-only summary against your workspace and shows you exact counts
                for each entity type:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <code className="text-blue-600 text-sm">campaigns · leads · block list entries · mailboxes</code>
            </div>
            <p className="text-gray-600 mb-3">
                Lead counts are broken into five buckets — <em>never contacted</em>, <em>stale contact</em>, <em>recent contact</em>,
                <em> opted out</em>, <em>completed</em> — so you can see exactly what will land in Superkabe before you commit.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Start the import</h3>
            <p className="text-gray-600 mb-3">
                Click <strong>Start Import</strong>. The job runs in the background and the wizard switches to a progress view
                with phase indicators:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
                <code className="text-green-600 text-sm">campaigns → leads → block list → mailboxes</code>
            </div>
            <p className="text-gray-600 mb-3">
                You can leave the page — progress is persisted server-side. Re-open the wizard at any time to see the current
                phase, percentage complete, and per-entity counts.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">5. Reconnect your mailboxes</h3>
            <p className="text-gray-600 mb-3">
                Imported mailboxes land in a <strong>disconnected</strong> state. Open <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">/dashboard/sequencer/accounts</code>,
                find each mailbox, and click <strong>Reconnect</strong> to re-grant access via Gmail OAuth, Microsoft 365 OAuth,
                or SMTP credentials.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">6. Review imported campaigns</h3>
            <p className="text-gray-600 mb-3">
                Every imported campaign lands in <strong>DRAFT / paused</strong> state regardless of its source state in
                Instantly. This is intentional — it guarantees no double-sending during cutover. Open <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">/dashboard/campaigns</code>,
                review the sequences and schedules, attach your reconnected mailboxes, and launch when you&apos;re ready.
            </p>

            {/* Edge cases */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Edge Cases &amp; Known Limitations</h2>
            <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Scenario</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Behaviour</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Large workspaces (&gt;100K leads)</td>
                            <td className="px-5 py-4 text-gray-600">Typically 30–60 minutes. The wizard shows phase-by-phase progress, including a per-phase ETA.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Instantly v1 (legacy) workspaces</td>
                            <td className="px-5 py-4 text-gray-600">Not supported. You must be on Instantly v2 — the v1 API surface is incompatible.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Open / click event history</td>
                            <td className="px-5 py-4 text-gray-600">Open timestamps are imported as engagement signals where available. Per-event click history is not currently mapped — Instantly does not expose it via REST.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Subsequence / branching triggers</td>
                            <td className="px-5 py-4 text-gray-600">Basic linear sequences are imported as-is. Complex reply-based branching may need to be rebuilt manually in Superkabe.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Custom field types beyond text/number/date</td>
                            <td className="px-5 py-4 text-gray-600">Coerced to text in Superkabe. The original value is preserved, but downstream filters may need to be re-typed.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Bounced / unsubscribed leads</td>
                            <td className="px-5 py-4 text-gray-600">Skipped on import — they remain in your block list rather than being re-enrolled.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Time estimate */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Time Estimate</h2>
            <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100">
                <ul className="space-y-2 text-gray-600">
                    <li>– <strong>Up to 25K leads:</strong> 10–30 minutes</li>
                    <li>– <strong>25K–100K leads:</strong> 30–60 minutes</li>
                    <li>– <strong>100K+ leads:</strong> 60–90 minutes</li>
                </ul>
                <p className="text-gray-500 text-sm mt-4">
                    The wizard polls progress in real time, so you can leave the page open or come back later. Larger imports
                    are paced to respect Instantly&apos;s rate limits (notably the 20 req/min cap on email-related endpoints).
                </p>
            </div>

            {/* Resuming */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Resuming a Failed Migration</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The import is fully idempotent. Every imported entity carries an <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">import_external_id</code> from
                Instantly, and re-runs upsert on that ID — already-imported records are skipped, and only the missing tail is
                pulled.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Within the 24-hour key TTL, click <strong>Restart Import</strong> in the wizard to resume from where it stopped.</li>
                <li>After 24 hours, generate a fresh Instantly API key and start over — the import will skip everything that already came across.</li>
                <li>If the source-side throttles (HTTP 429), the job pauses with status <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">paused_source</code> and resumes automatically once the cooldown expires.</li>
            </ul>

            {/* Block list */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Block List Handling</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Your Instantly block list — both <strong>exact-email</strong> entries and <strong>domain-level</strong> entries —
                is imported into Superkabe&apos;s suppression list. From that moment on, any future lead whose address or domain
                matches an entry is blocked at validation time before it can enter a campaign.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                You can review and edit the suppression list in <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">/dashboard/leads/suppression</code> after the import completes.
            </p>

            {/* Cost */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Cost</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The migration tool is <strong>free for every Superkabe tier</strong>. No validation credits are consumed during
                the import — the leads enter Superkabe in their existing state and are only re-validated when they next move
                through the pipeline (typically when you launch a campaign).
            </p>

            {/* Why reconnect mailboxes */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Why You Have to Reconnect Mailboxes</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Mailbox auth (OAuth tokens for Gmail / Microsoft 365, SMTP &amp; IMAP credentials) is encrypted with
                provider-specific keys that are scoped to the platform that issued them. Those keys cannot be transferred between
                platforms — Instantly&apos;s v2 API treats them as write-only and never returns them.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                That&apos;s why every imported mailbox lands in a <strong>disconnected</strong> state. To re-grant access, open <code className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">/dashboard/sequencer/accounts</code>,
                find the mailbox, and click <strong>Reconnect</strong>. You&apos;ll go through the standard OAuth consent flow
                (Gmail / Microsoft 365) or paste fresh SMTP credentials — no different from connecting a brand-new mailbox.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mt-8">
                <h3 className="text-xl font-bold text-amber-700 mb-2">Pro Tip</h3>
                <p className="text-gray-700">
                    Reconnect your mailboxes <em>before</em> launching any imported campaign. Superkabe will not start sending
                    until at least one connected, healthy mailbox is attached to the campaign — but having every mailbox ready
                    avoids partial-send scenarios mid-cutover.
                </p>
            </div>

            {/* Next steps */}
            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard/migration/from-instantly" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Open the Instantly migration wizard
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs/migration/from-smartlead" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Read the Smartlead migration guide
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs/getting-started" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Getting Started — set up sending and routing after the import
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

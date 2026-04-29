import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Migrate from Smartlead | Superkabe Docs',
    description:
        'One-time import of campaigns, sequences, leads, and mailbox metadata from Smartlead into Superkabe. API key auto-discards after 24 hours. Mailboxes reconnect afterward.',
    alternates: { canonical: '/docs/migration/from-smartlead' },
    openGraph: {
        title: 'Migrate from Smartlead | Superkabe Docs',
        description:
            'One-time import of campaigns, sequences, leads, and mailbox metadata from Smartlead into Superkabe. API key auto-discards after 24 hours. Mailboxes reconnect afterward.',
        url: '/docs/migration/from-smartlead',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function MigrateFromSmartleadDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Migrate from Smartlead
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                One-time import of your Smartlead workspace into Superkabe — campaigns, sequences, leads, and mailbox metadata
            </p>

            {/* ==================== Section 1: What It Does ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What This Migration Tool Does</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The Smartlead migration is a <strong>one-time import</strong> from your existing Smartlead workspace into Superkabe.
                It pulls your campaign structure, sequence steps and A/B variants, lead lists with custom fields,
                mailbox metadata, and a 7-day warmup health snapshot used to seed conservative initial send caps.
                The wizard lives at <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/dashboard/migration/from-smartlead</code>.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                It does <strong>not</strong> pull mailbox authentication. OAuth tokens and SMTP passwords never leave Smartlead —
                you reconnect each mailbox natively in Superkabe via Google / Microsoft OAuth or encrypted SMTP credentials.
                That's an intentional security boundary, not a limitation we plan to remove.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">When to Run This</h3>
                <p className="text-blue-900 text-sm leading-relaxed">
                    Run the migration when you're ready to either fully decommission Smartlead (aggressive mode) or
                    let existing sequences finish there while starting new outreach in Superkabe (conservative mode).
                    All imported campaigns land <strong>paused</strong> — nothing sends until you launch them in Superkabe.
                </p>
            </div>

            {/* ==================== Section 2: Imports vs. Skips ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Gets Imported vs. What Doesn&apos;t</h2>
            <p className="text-gray-600 mb-4">
                Side-by-side reference so you know exactly what survives the move:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 not-prose">
                <div className="bg-white border border-emerald-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200">
                        <p className="font-bold text-emerald-800">Imported</p>
                    </div>
                    <ul className="divide-y divide-gray-100 text-sm">
                        <li className="px-5 py-3"><strong>Campaigns</strong> — name, schedule (timezone, hours, days), daily send limit, send-gap, track-opens / track-clicks, stop rules</li>
                        <li className="px-5 py-3"><strong>Sequence steps</strong> — subject, HTML body, delay-in-days between steps</li>
                        <li className="px-5 py-3"><strong>A/B variants</strong> — subject + body for each variant (the variants come over; per-variant statistics restart)</li>
                        <li className="px-5 py-3"><strong>Leads</strong> — email, first/last name, company, custom fields (stored on CampaignLead)</li>
                        <li className="px-5 py-3"><strong>Mailbox metadata</strong> — from-address, provider type, daily target, warmup reputation, 7-day warmup snapshot</li>
                        <li className="px-5 py-3"><strong>Campaign ↔ mailbox pool</strong> — which mailboxes were attached to which campaign</li>
                    </ul>
                </div>

                <div className="bg-white border border-rose-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-rose-50 border-b border-rose-200">
                        <p className="font-bold text-rose-800">Not imported</p>
                    </div>
                    <ul className="divide-y divide-gray-100 text-sm">
                        <li className="px-5 py-3"><strong>Mailbox auth</strong> — OAuth tokens, SMTP passwords. Security boundary; you re-auth in Superkabe.</li>
                        <li className="px-5 py-3"><strong>Send history</strong> — past opens, clicks, bounces, replies before the migration date.</li>
                        <li className="px-5 py-3"><strong>Inbox / replies</strong> — Superkabe starts with a clean unified inbox view.</li>
                        <li className="px-5 py-3"><strong>A/B variant statistics</strong> — variant content imports; performance counters reset to zero.</li>
                        <li className="px-5 py-3"><strong>Smartlead-only fields</strong> — keys without a Superkabe equivalent are stored as custom variables on the lead, not promoted to first-class fields.</li>
                        <li className="px-5 py-3"><strong>Snippets / templates</strong> — saved snippet libraries don&apos;t come over; recreate as needed.</li>
                        <li className="px-5 py-3"><strong>Webhook subscriptions</strong> — outbound webhooks must be reconfigured in Superkabe.</li>
                        <li className="px-5 py-3"><strong>Block list / suppression list</strong> — opt-outs are not pulled today; a separate one-time CSV import is the workaround.</li>
                    </ul>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="font-bold text-amber-800 text-lg mb-2">Opt-out leads (PAUSED / STOPPED in Smartlead)</h3>
                <p className="text-gray-700 text-sm">
                    Leads you explicitly halted in Smartlead are <strong>never imported</strong> regardless of mode. They&apos;re counted
                    in the preview but skipped at runtime — Superkabe will not contact someone you already stopped contacting.
                </p>
            </div>

            {/* ==================== Section 3: Security Model ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Security Model</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Your Smartlead admin API key is required <strong>only</strong> during the migration window. We hold it encrypted at
                rest while the import runs, and discard it on the earliest of:
            </p>
            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
                <ol className="space-y-2 text-gray-600 list-decimal list-inside text-sm">
                    <li><strong>24 hours after the import completes</strong> — TTL is shrunk on success</li>
                    <li><strong>72 hours after you paste the key</strong> — hard ceiling regardless of import state</li>
                    <li><strong>Immediately, on demand</strong> — &quot;Discard now&quot; button in the wizard</li>
                </ol>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
                Pasting the key is gated behind an <strong>explicit authorization checkbox</strong>. Submitting it records a
                <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 mx-1">Consent</code>
                row in our audit trail capturing the actions you authorized: read campaigns, read leads, read email-account
                metadata, and pause active campaigns at the start of the import.
            </p>
            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-2">Why we pause your Smartlead campaigns first</h3>
                <p className="text-gray-700 text-sm">
                    Before reading any leads, the importer pauses every <code className="px-2 py-0.5 bg-white text-blue-700 text-xs">ACTIVE</code> Smartlead
                    campaign. Without this step, Smartlead would keep sending while we&apos;re reading — and after you launch in Superkabe,
                    the same recipient could get a duplicate first-touch from both platforms. The wizard requires a checkbox confirming
                    this before it will start.
                </p>
            </div>

            {/* ==================== Section 4: Step by Step ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step-by-Step Walkthrough</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Generate a Smartlead admin API key</h3>
            <p className="text-gray-600 mb-3">
                In your Smartlead dashboard, open <strong>Settings → API Keys</strong> and create a new admin key. Copy it to your clipboard —
                you&apos;ll only paste it once.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Open the wizard and paste the key</h3>
            <p className="text-gray-600 mb-3">
                Navigate to{' '}
                <Link href="/dashboard/migration/from-smartlead" className="text-blue-600 hover:text-blue-800 underline">
                    /dashboard/migration/from-smartlead
                </Link>
                . Paste the key, tick the authorization checkbox, and click <strong>Validate &amp; continue</strong>.
                Superkabe pings Smartlead with the key — invalid keys return immediately with an error and are never persisted.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Review the preview</h3>
            <p className="text-gray-600 mb-3">
                The wizard does a read-only pass and shows totals: campaigns by status, mailboxes by provider, sequence-step count,
                and a five-bucket lead breakdown:
            </p>
            <div className="bg-white border border-gray-200 p-6 mb-4 shadow-sm">
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>– <strong>Never contacted</strong> — no email has gone out yet (always safe to import)</li>
                    <li>– <strong>Stale contact</strong> — last contacted &gt; 14 days ago</li>
                    <li>– <strong>Recent contact</strong> — last contacted within 14 days (highest re-touch risk)</li>
                    <li>– <strong>Completed</strong> — sequence finished without reply</li>
                    <li>– <strong>Opted out</strong> — PAUSED or STOPPED in Smartlead (never imported)</li>
                </ul>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Pick a migration mode</h3>
            <p className="text-gray-600 mb-3">
                The mode picker is the core decision. Both modes import campaigns, sequences, mailboxes, and never-contacted leads.
                They differ in how they handle in-flight leads:
            </p>
            <div className="space-y-3 mb-4">
                <div className="bg-blue-50 border-2 border-blue-300 p-5">
                    <h4 className="font-bold text-blue-800 mb-1">Aggressive (default)</h4>
                    <p className="text-gray-700 text-sm">
                        Import never-contacted, stale, and completed leads. Recent contacts are skipped by default but can be opted in
                        via a checkbox. Every imported lead restarts at <strong>step 1</strong> in Superkabe — threading on existing
                        Smartlead sequences is broken. Best for fully decommissioning Smartlead.
                    </p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-300 p-5">
                    <h4 className="font-bold text-gray-800 mb-1">Conservative</h4>
                    <p className="text-gray-700 text-sm">
                        Only import never-contacted leads. Mid-sequence leads stay in Smartlead and finish naturally with the original
                        sender, in the original thread. Best when you want to keep Smartlead running for 1–3 months while existing
                        sequences drain and start fresh leads in Superkabe.
                    </p>
                </div>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">5. Start the import</h3>
            <p className="text-gray-600 mb-3">
                Confirm the &quot;Smartlead campaigns will be paused&quot; checkbox and click <strong>Import</strong>. The job runs in the
                background. The wizard polls every 2.5 seconds and shows live counters: campaigns scanned, mailboxes imported,
                sequence steps imported, leads imported, and per-bucket skip counts. You can close the tab — the job continues
                server-side and resumes its display when you return.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">6. Reconnect mailboxes</h3>
            <p className="text-gray-600 mb-3">
                When the job finishes, the wizard shows the list of imported mailbox addresses with a per-row <strong>Connect</strong> link.
                Each goes to{' '}
                <Link href="/dashboard/sequencer/accounts" className="text-blue-600 hover:text-blue-800 underline">
                    /dashboard/sequencer/accounts
                </Link>
                {' '}where you authenticate via Google / Microsoft OAuth or paste SMTP credentials. Any mailbox you don&apos;t reconnect
                sits idle and its imported campaigns will not send through it.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">7. Launch your campaigns</h3>
            <p className="text-gray-600 mb-3">
                Imported campaigns land in <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">paused</code> with{' '}
                <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">paused_reason: imported_from_smartlead</code>.
                Review them at{' '}
                <Link href="/dashboard/campaigns" className="text-blue-600 hover:text-blue-800 underline">
                    /dashboard/campaigns
                </Link>
                {' '}— check the sequence body, attached mailboxes, and schedule, then click Launch when ready.
            </p>

            {/* ==================== Section 5: Edge Cases ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Edge Cases &amp; Known Limitations</h2>
            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
                <ul className="space-y-3 text-gray-600 text-sm">
                    <li>
                        – <strong>Large campaigns (50K+ leads)</strong> — split server-side and processed sequentially.
                        Expect noticeably longer runtimes; the wizard keeps showing progress, and the 72-hour key TTL is enough to cover
                        even very large workspaces.
                    </li>
                    <li>
                        – <strong>Spintax</strong> — Smartlead&apos;s <code className="px-2 py-0.5 bg-gray-100 text-xs">{'{a|b|c}'}</code> randomized variants are mapped to
                        Superkabe&apos;s <code className="px-2 py-0.5 bg-gray-100 text-xs">StepVariant</code> rows where possible. Complex nested spintax
                        comes over verbatim and may need manual cleanup.
                    </li>
                    <li>
                        – <strong>Tracking pixels / unsubscribe links</strong> — Smartlead-injected open-tracking pixels and unsubscribe
                        anchors pointing at <code className="px-2 py-0.5 bg-gray-100 text-xs">smartlead.ai</code> / <code className="px-2 py-0.5 bg-gray-100 text-xs">slmail.me</code>
                        are stripped from imported HTML. Your own custom links are preserved.
                    </li>
                    <li>
                        – <strong>Lead persona / tags</strong> — Smartlead doesn&apos;t carry a structured persona field. Imported leads default to{' '}
                        <code className="px-2 py-0.5 bg-gray-100 text-xs">persona: &quot;imported&quot;</code> and{' '}
                        <code className="px-2 py-0.5 bg-gray-100 text-xs">lead_score: 50</code>. Update routing rules accordingly, or re-enrich
                        these leads via Clay to get real personas before launching.
                    </li>
                    <li>
                        – <strong>Stop-on-open / stop-on-click</strong> — Smartlead supports stop-rules tied to opens and clicks; Superkabe&apos;s schema
                        currently only supports stop-on-reply and stop-on-bounce. Other stop conditions are surfaced in the import stats so you can
                        recreate them if needed.
                    </li>
                    <li>
                        – <strong>Warmup data</strong> — when a mailbox has no warmup history, the import logs it under
                        <code className="px-2 py-0.5 bg-gray-100 text-xs mx-1">warmupSnapshotsMissing</code>
                        and seeds the mailbox with the customer&apos;s configured daily target. With <code className="px-2 py-0.5 bg-gray-100 text-xs">USE_IMPORT_BASELINE=true</code>,
                        unhealthy baselines (warmup-blocked, &gt;5% spam, low reputation) cap the initial daily limit conservatively.
                    </li>
                    <li>
                        – <strong>Webhooks</strong> — outbound webhook subscriptions don&apos;t come over. Reconfigure in Superkabe&apos;s settings.
                    </li>
                </ul>
            </div>

            {/* ==================== Section 6: Time Estimate ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How Long It Takes</h2>
            <p className="text-gray-600 mb-4">
                Most workspaces complete in 5–15 minutes. Larger libraries take longer — the bulk of runtime is the lead-fetch loop, which
                is bounded by Smartlead&apos;s API rate limits, not by Superkabe.
            </p>
            <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Workspace size</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Typical runtime</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-5 py-3 text-gray-700">Up to 10K leads</td><td className="px-5 py-3 text-gray-600">5–15 minutes</td></tr>
                        <tr><td className="px-5 py-3 text-gray-700">10K – 50K leads</td><td className="px-5 py-3 text-gray-600">15–60 minutes</td></tr>
                        <tr><td className="px-5 py-3 text-gray-700">50K – 250K leads</td><td className="px-5 py-3 text-gray-600">1–4 hours</td></tr>
                        <tr><td className="px-5 py-3 text-gray-700">250K+ leads</td><td className="px-5 py-3 text-gray-600">Several hours — well within the 72h key window</td></tr>
                    </tbody>
                </table>
            </div>

            {/* ==================== Section 7: Failure / Resume ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">If It Fails Partway</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The import is <strong>idempotent</strong>. Every record (campaign, sequence step, variant, mailbox, lead, campaign-lead) carries
                an <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">import_external_id</code> from Smartlead, and the
                writer upserts on it. If the job fails midway, simply re-run the wizard — already-imported records are updated in place; only the
                missing ones get created.
            </p>
            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
                <ul className="space-y-3 text-gray-600 text-sm">
                    <li>– <strong>Within 72h of paste</strong> — the same key is still on file. The retry kicks in with no extra steps.</li>
                    <li>– <strong>After 72h</strong> — the key has been wiped. Paste it again and re-run; the importer continues to upsert on external IDs, so previously imported data is not duplicated.</li>
                    <li>– <strong>Failed leads</strong> — invalid emails and per-row errors are surfaced in the job&apos;s stats panel under <code className="px-2 py-0.5 bg-gray-100 text-xs">leadsSkippedInvalidEmail</code>.</li>
                    <li>– <strong>The job row itself</strong> — terminal failure stores the error message on <code className="px-2 py-0.5 bg-gray-100 text-xs">ImportJob.error</code> for the support team to inspect.</li>
                </ul>
            </div>

            {/* ==================== Section 8: Cost ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Cost</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The migration tool is <strong>free on every tier</strong>. Email-validation credits are <strong>not</strong> consumed during import — leads
                arrive with whatever validation status they had in Smartlead. If you want to refresh validation against Superkabe&apos;s pipeline
                (syntax / MX / disposable / catch-all + MillionVerifier on Growth and Scale), trigger a re-validation from the Leads page after the
                import completes; that <em>does</em> consume credits per your plan.
            </p>

            {/* ==================== Section 9: Roll-Back ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Roll-Back</h2>
            <div className="bg-red-50 border border-red-200 p-6 mb-8">
                <h3 className="font-bold text-red-800 mb-2">There is no automatic rollback.</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                    The migration only adds — it never deletes existing records. If you import into the wrong workspace or change your mind,
                    contact <a className="underline text-blue-700" href="mailto:support@superkabe.com">support@superkabe.com</a> with your organization ID
                    and the import job ID (visible in the wizard); the support team can scope a cleanup to records carrying the corresponding
                    <code className="px-2 py-0.5 bg-white text-xs mx-1">import_external_id</code>. Until that&apos;s done, your imported campaigns stay
                    paused and harmless — they will not send unless you explicitly launch them.
                </p>
            </div>

            {/* ==================== Next Steps ==================== */}
            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard/migration/from-smartlead" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Open the migration wizard
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs/migration/from-instantly" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Migrating from Instantly instead?
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs/getting-started" className="text-blue-600 hover:text-blue-700 font-medium">
                            → New to Superkabe — start with Getting Started
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

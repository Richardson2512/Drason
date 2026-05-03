import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Disconnecting Integrations | Superkabe Docs',
    description: 'How to revoke API keys, disconnect Claude / OAuth-MCP clients, remove mailboxes, unsubscribe from webhooks, and delete your Superkabe account.',
    alternates: { canonical: '/docs/disconnecting' },
    openGraph: {
        title: 'Disconnecting Integrations | Superkabe Docs',
        description: 'How to revoke API keys, disconnect Claude / OAuth-MCP clients, remove mailboxes, unsubscribe from webhooks, and delete your Superkabe account.',
        url: '/docs/disconnecting',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DisconnectingDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Disconnecting Integrations
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                How to revoke API keys, disconnect clients, remove mailboxes, and delete your account
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
                Every integration in Superkabe can be disconnected at any time. This page walks through every disconnect path —
                from the smallest (revoking a single API key) to the largest (full account deletion under GDPR right-to-erasure) —
                with the exact UI location, what happens server-side, and the user-visible behavior of any in-flight work.
                Sections are ordered from least destructive to most destructive.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Quick Reference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>API key</strong> — Dashboard → API & MCP → API Keys tab</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Claude / OAuth-MCP</strong> — Dashboard → Integrations → Claude</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Mailbox</strong> — Dashboard → Sequencer → Accounts</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Slack</strong> — Dashboard → Integrations → Slack</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Migration keys</strong> — Dashboard → Migration → from-Smartlead / from-Instantly</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Webhook endpoint</strong> — Dashboard → Integrations → Webhooks</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Team member</strong> — Dashboard → Settings → Team</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Pause account</strong> — /pricing → cancel subscription</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Delete account</strong> — Dashboard → Data Rights</div>
                </div>
            </div>

            {/* ==================== 1. API Key ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">1. Revoking a Superkabe API Key</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe API keys are issued from the dashboard and used by your scripts, your MCP server processes, or any
                third-party automation hitting <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">api.superkabe.com</code>.
                Each key is stored as a SHA-256 hash — Superkabe never holds the plaintext after issuance, which means a revoked key cannot be
                restored. If you need to rotate a key, issue a new one before revoking the old one.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to revoke:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>Dashboard → API &amp; MCP</strong></li>
                    <li><strong>2.</strong> Switch to the <strong>API Keys</strong> tab</li>
                    <li><strong>3.</strong> Click the trash icon next to the key you want to revoke</li>
                    <li><strong>4.</strong> Confirm in the modal — revocation is immediate</li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What happens after revocation</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Any in-flight HTTP request authenticated with the key returns <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">401 Unauthorized</code> on the next call</li>
                <li>Long-running processes that hold the key (e.g. an MCP server on your laptop) start failing — you&apos;ll need to issue a new key and update the process&apos;s environment</li>
                <li>The key&apos;s usage history (call counts, last-seen timestamps) is preserved for audit purposes</li>
            </ul>

            <div className="bg-red-50 border border-red-200 p-6 mb-12">
                <h3 className="text-lg font-bold text-red-700 mb-2">Irreversible</h3>
                <p className="text-gray-700 text-sm">
                    Keys are stored as SHA-256 hashes. Once revoked, the original token cannot be reconstructed —
                    even by Superkabe. Always issue and deploy the replacement key before revoking the old one.
                </p>
            </div>

            {/* ==================== 2. Claude / OAuth-MCP ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">2. Disconnecting Claude / OAuth-MCP Clients</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                When you connect Claude (or any OAuth-MCP client) to Superkabe, an OAuth grant is issued for that client and
                stored against your organization. Disconnecting revokes every access token <em>and</em> refresh token for the
                <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 mx-1">(org, client_id)</code>
                pair atomically — there is no half-state where access is gone but refresh still works.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to disconnect:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>Dashboard → Integrations</strong></li>
                    <li><strong>2.</strong> Find the <strong>Claude</strong> card and click <strong>Manage</strong></li>
                    <li><strong>3.</strong> Click <strong>Disconnect</strong></li>
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                    Behind the scenes this calls <code className="px-2 py-1 bg-white border border-gray-200 text-gray-700">POST /api/oauth/connections/revoke</code> with the client_id, which sets <code className="px-2 py-1 bg-white border border-gray-200 text-gray-700">revoked_at</code> on every token row in that grant.
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What happens to Claude</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-12">
                <li>Claude.ai will receive a <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">401</code> on its next call to the connector URL — both bare <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/mcp</code> and per-org <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/mcp/&lt;org-slug&gt;</code> tokens are revoked together (the revoke is keyed on <code>(org, client_id)</code>, not on URL).</li>
                <li>The user is prompted by Claude to re-authorize Superkabe — the standard OAuth consent flow</li>
                <li>Re-authorizing creates a fresh grant; the old grant remains in the audit log marked <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">revoked</code></li>
                <li>If the customer has multiple per-org connectors in Claude (e.g. an agency with several client orgs), disconnecting from one org&apos;s dashboard only revokes that org&apos;s grant — connectors for other orgs are unaffected.</li>
            </ul>

            {/* ==================== 3. Mailbox ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">3. Disconnecting a Gmail / Microsoft / SMTP Mailbox</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Disconnecting a mailbox removes the OAuth token (Gmail and Microsoft 365) or the encrypted SMTP credentials
                from the database. The mailbox is detached from any campaigns it was attached to, and the routing engine
                stops considering it for new sends.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to disconnect:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>Dashboard → Sequencer → Accounts</strong></li>
                    <li><strong>2.</strong> Click the mailbox you want to remove</li>
                    <li><strong>3.</strong> Click <strong>Disconnect</strong></li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What happens to active campaigns</h3>
            <div className="bg-blue-50 border border-blue-200 p-6 mb-6">
                <ul className="space-y-3 text-gray-700 text-sm">
                    <li>– <strong>If the campaign has other mailboxes attached:</strong> ESP-aware routing simply skips the disconnected mailbox and dispatches through the remaining ones. Sends that were already in-flight on the disconnected mailbox finish their batch before it stops accepting new work.</li>
                    <li>– <strong>If the disconnected mailbox was the only one in a campaign:</strong> the campaign auto-pauses with reason <code className="px-2 py-1 bg-white text-gray-700 text-xs">no available mailboxes</code> and an alert is sent to the operator&apos;s Slack channel.</li>
                </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-700 mb-2">Reconnecting later</h3>
                <p className="text-gray-700 text-sm">
                    Reconnecting a previously-disconnected mailbox is a fresh OAuth flow (Gmail/Microsoft) or a brand-new
                    set of SMTP credentials. There is no resumption of the old session — health history, warmup state,
                    and mailbox identity are reset from the moment the new connection is made.
                </p>
            </div>

            {/* ==================== 4. Slack ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">4. Disconnecting Slack</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Slack is used to broadcast every significant infrastructure event — auto-pauses, healings, threshold breaches,
                campaign pauses. Disconnecting it removes the encrypted bot token and clears the
                <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 mx-1">SLACK_CONNECTED</code>
                organization setting.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to disconnect:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>Dashboard → Integrations</strong></li>
                    <li><strong>2.</strong> Find the <strong>Slack</strong> card and click <strong>Manage</strong></li>
                    <li><strong>3.</strong> Click <strong>Disconnect Slack</strong></li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What happens to alerts</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-12">
                <li>Future alerts have no Slack channel to fire into</li>
                <li>Superkabe falls back to <strong>in-app notifications</strong> (visible in the dashboard nav)</li>
                <li>If <strong>Resend</strong> is configured for your org, alerts are also delivered by email</li>
                <li>Alert history continues to be recorded in the audit log regardless</li>
            </ul>

            {/* ==================== 5. Migration Keys ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">5. Revoking Smartlead / Instantly Migration Keys</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Migration keys are short-lived credentials you paste into Superkabe to import campaigns and mailbox metadata
                from Smartlead or Instantly. They are <strong>auto-discarded 24 hours after the last activity</strong>, but you
                can also clear them manually at any time.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to manually discard:</p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>– <strong>Dashboard → Migration → from-Smartlead</strong> → click <strong>Discard API key now</strong></li>
                    <li>– <strong>Dashboard → Migration → from-Instantly</strong> → click <strong>Discard API key now</strong></li>
                </ul>
            </div>

            <p className="text-gray-600 mb-12">
                After discard, the migration wizard reverts to the empty state. To run another import, paste a fresh key —
                the previous import&apos;s record (what was imported, when) is preserved in the migration log.
            </p>

            {/* ==================== 6. Webhook Endpoints ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">6. Revoking a Webhook Endpoint</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Webhook endpoints receive event payloads from Superkabe — campaign events, lead state changes, mailbox health
                transitions. Deleting an endpoint stops Superkabe from sending events to that URL immediately.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to delete:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>Dashboard → Integrations → Webhooks</strong></li>
                    <li><strong>2.</strong> Click the endpoint you want to remove</li>
                    <li><strong>3.</strong> Click <strong>Delete</strong></li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What happens after deletion</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-12">
                <li>No new events are dispatched to the endpoint URL</li>
                <li>Pending retries (queued for previously-failed deliveries) are <strong>cancelled</strong></li>
                <li>Past delivery records remain available in the <strong>audit log for 30 days</strong> for forensic review</li>
                <li>Events themselves still occur and are persisted internally — only the outbound HTTP delivery is stopped</li>
            </ul>

            {/* ==================== 7. Team member ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">7. Revoking Team-Member Access</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Org admins can remove team members from the team settings page. Removal is immediate and effective across every
                tab and device that member has open.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to revoke (admins only):</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>Dashboard → Settings → Team</strong></li>
                    <li><strong>2.</strong> Click <strong>Remove</strong> next to the member</li>
                    <li><strong>3.</strong> Confirm — their JWT is invalidated immediately</li>
                </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-700 mb-2">API keys are separate</h3>
                <p className="text-gray-700 text-sm">
                    Removing a team member invalidates their session but does <strong>not</strong> revoke any Superkabe API keys
                    they personally created. Those keys continue to work on behalf of the organization. If the departing member
                    had API keys, an admin must revoke each one separately on the API &amp; MCP page (see Section 1).
                </p>
            </div>

            {/* ==================== 8. Pause account ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">8. Pausing the Entire Account (No Deletion)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                If you want to stop sending without losing your data, cancel your subscription. Going to a <strong>trial-expired</strong>
                or <strong>canceled</strong> subscription state pauses sending across every campaign in the organization, but every row —
                campaigns, sequences, leads, mailbox connections, audit logs — stays in place.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to cancel:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Open <strong>/pricing</strong></li>
                    <li><strong>2.</strong> Click <strong>Cancel subscription</strong> on your current plan</li>
                </ol>
            </div>

            <p className="text-gray-600 mb-12">
                Resubscribing at any later date resumes sending from the same state. Mailbox tokens may need to be re-authorized
                if the provider rotated them during the pause window, but the rest of your configuration is restored as-is.
            </p>

            {/* ==================== 9. Account deletion ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">9. Full Account Deletion (GDPR Right to Erasure)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                For a complete erasure of your data, Superkabe provides a GDPR-compliant deletion flow. Before triggering deletion,
                you can export everything Superkabe holds about you via the same Data Rights page — this is a one-click JSON export
                covering organization, user, leads, campaigns, mailbox metadata, validation results, and a 30-day usage snapshot.
            </p>

            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
                <p className="font-semibold text-gray-700 mb-2">Where to delete:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> (Recommended) Open <strong>Dashboard → Data Rights</strong> and click <strong>Export my data</strong> first</li>
                    <li><strong>2.</strong> On the same page, click <strong>Delete my account</strong></li>
                    <li><strong>3.</strong> Confirm — a 30-day soft-delete window begins</li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">The 30-day soft-delete window</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Your account is immediately marked inaccessible — no logins, no API access, no incoming webhooks accepted</li>
                <li>Data is <strong>retained but locked</strong> for 30 days</li>
                <li>During this window, <Link href="/contact" className="text-blue-600 hover:text-blue-800">contact support</Link> to request restoration</li>
                <li>After 30 days, a sweep worker performs the irreversible hard purge</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">What gets erased at hard purge</h3>
            <div className="bg-white border border-gray-200 p-6 mb-6 shadow-lg shadow-gray-100">
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>– Organization rows and user rows</li>
                    <li>– Every lead, lead-history record, and validation result</li>
                    <li>– Every campaign, sequence, and step</li>
                    <li>– Mailbox connection rows and OAuth/SMTP credentials</li>
                    <li>– Webhook endpoints, API keys, OAuth grants, audit logs tied to the org</li>
                </ul>
                <p className="text-xs text-gray-500 mt-4">
                    Backups age out per the standard retention window (90 days). After the backup window passes, the data is
                    no longer recoverable from any source.
                </p>
            </div>

            <div className="bg-red-50 border border-red-200 p-6 mb-12">
                <h3 className="text-lg font-bold text-red-700 mb-2">Irreversible after 30 days</h3>
                <p className="text-gray-700 text-sm">
                    Once the soft-delete window closes and the sweep runs, no Superkabe operator can restore the data.
                    If you have any uncertainty, export your data first and use account pause (Section 8) instead of deletion.
                </p>
            </div>

            {/* ==================== 10. In-flight ops ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">10. What Happens to In-Flight Operations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Across every disconnect path, Superkabe makes the same guarantees about ongoing work:
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-12 shadow-lg shadow-gray-100">
                <ul className="space-y-3 text-gray-600 text-sm">
                    <li>
                        <strong className="text-gray-900">In-flight sends complete.</strong> When you disconnect a mailbox, the
                        send-queue dispatcher allows the current batch to finish before the mailbox stops accepting new work —
                        no half-sent messages, no orphaned SMTP transcripts.
                    </li>
                    <li>
                        <strong className="text-gray-900">Queued sends route around the disconnected resource.</strong> The
                        ESP-aware router reads the live state of every mailbox; the moment one is disconnected, queued items
                        are re-distributed across the remaining mailboxes that can carry them.
                    </li>
                    <li>
                        <strong className="text-gray-900">Webhooks for a deleted endpoint don&apos;t fire.</strong> Events still
                        occur and are persisted in the internal event log, but the outbound HTTP attempt is suppressed and any
                        queued retries are cancelled.
                    </li>
                    <li>
                        <strong className="text-gray-900">API calls return 401 instantly on a revoked key.</strong> There is no
                        grace period — the revocation is checked against the SHA-256 hash on every authenticated request.
                    </li>
                    <li>
                        <strong className="text-gray-900">A removed team member is logged out everywhere.</strong> JWT
                        invalidation is immediate; every browser tab they have open is bounced to the login screen on the next
                        action.
                    </li>
                </ul>
            </div>

            {/* ==================== Next Steps ==================== */}
            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li>
                        <Link href="/docs/api-documentation" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Read the API Documentation for key issuance + auth details
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs/mcp-server" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Learn how the MCP Server uses your API keys
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/data-rights" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Open the Data Rights page (export or delete)
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                            → Contact support (restore a soft-deleted account, or any other question)
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

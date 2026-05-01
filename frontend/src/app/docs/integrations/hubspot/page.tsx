import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'HubSpot Integration | Superkabe Docs',
    description: 'Connect HubSpot to Superkabe via OAuth — import contacts from any list, push every send/open/click/reply/bounce to the contact timeline, and sync the suppression list automatically.',
    alternates: { canonical: '/docs/integrations/hubspot' },
    openGraph: {
        title: 'HubSpot Integration | Superkabe Docs',
        description: 'Connect HubSpot to Superkabe via OAuth — import contacts from any list, push every send/open/click/reply/bounce to the contact timeline, and sync the suppression list automatically.',
        url: '/docs/integrations/hubspot',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function HubSpotIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HubSpot Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Two-way sync between HubSpot and Superkabe — import contacts, push activity to the timeline, mirror the suppression list.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Contact import.</strong> Pick any HubSpot list — Superkabe pulls every contact, applies your field mapping, and creates Superkabe leads.</li>
                <li><strong>Activity push.</strong> Every <code>email.sent</code>, <code>email.opened</code>, <code>email.clicked</code>, <code>email.replied</code>, and <code>email.bounced</code> event from Superkabe lands as a Note on the matching HubSpot contact&apos;s timeline.</li>
                <li><strong>Suppression sync.</strong> HubSpot contacts with <code>hs_email_optout=true</code> are pulled into Superkabe&apos;s block list — no risk of mailing someone who already opted out at the CRM level.</li>
                <li><strong>Idempotent.</strong> Activity pushes are deduped on <code>(connection, lead, event_type, timestamp)</code> so retries don&apos;t double-write.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">One-time setup (admin)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                You only need to do this once per Superkabe deployment. Superkabe&apos;s HubSpot Public App is created in your HubSpot Developer Account — every customer connects to that one app via OAuth.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Create the HubSpot Public App</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                <li>Sign in at <a href="https://developers.hubspot.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">developers.hubspot.com</a> with the developer account that should own the listing.</li>
                <li>Apps → Create app → Public app.</li>
                <li>Name it &quot;Superkabe&quot;. Add a logo + description.</li>
                <li>Auth tab → set <strong>Redirect URL</strong> to:
                    <div className="bg-gray-50 border border-gray-200 p-3 my-2"><code className="text-blue-600">https://api.superkabe.com/api/integrations/hubspot/callback</code></div>
                </li>
                <li>Add OAuth scopes:
                    <ul className="list-disc list-inside ml-4 mt-1 text-sm">
                        <li><code>oauth</code></li>
                        <li><code>crm.objects.contacts.read</code></li>
                        <li><code>crm.objects.contacts.write</code></li>
                        <li><code>crm.lists.read</code></li>
                        <li><code>crm.schemas.contacts.read</code></li>
                        <li><code>timeline</code></li>
                    </ul>
                </li>
                <li>Save → grab the <strong>Client ID</strong> and <strong>Client secret</strong> from the Auth tab.</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Set the env vars</h3>
            <p className="text-gray-600 mb-3">Add these to Railway (production) or your <code>.env</code> (local):</p>
            <div className="bg-gray-900 p-4 my-3 overflow-x-auto">
                <pre className="text-sm text-emerald-400 m-0 whitespace-pre">{`HUBSPOT_CLIENT_ID=…
HUBSPOT_CLIENT_SECRET=…
HUBSPOT_REDIRECT_URI=https://api.superkabe.com/api/integrations/hubspot/callback`}</pre>
            </div>
            <p className="text-gray-600">Restart the backend. On boot you should see <code>[CRM_REGISTRY] registered provider hubspot</code> in the logs — that confirms the env vars were picked up.</p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">User flow (per customer)</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                <li><strong>Connect.</strong> Dashboard → Integrations → CRM → Connect HubSpot. The user is bounced to HubSpot, picks a portal, approves the scopes, and lands back on Superkabe with a green &quot;Connected&quot; badge.</li>
                <li><strong>Import.</strong> Click Manage Import on the connected card. Pick a HubSpot list, map fields (defaults are auto-suggested for email/first_name/last_name/company/title/phone), click <strong>Start Import</strong>. The contact-import worker pulls 100 contacts per tick.</li>
                <li><strong>Activity flows automatically.</strong> Once a contact is linked, every send/open/click/reply/bounce on that contact&apos;s lead gets pushed to the HubSpot contact&apos;s timeline as a Note. No additional configuration.</li>
                <li><strong>Disconnect.</strong> Click Disconnect on the card. The OAuth tokens are wiped, pending pushes are cancelled, the contact links remain (so a future re-connect doesn&apos;t require re-importing).</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What gets pushed to the timeline</h2>
            <p className="text-gray-600 mb-3">Each event becomes a HubSpot Note attached to the contact. The Note body includes:</p>
            <div className="bg-gray-50 border border-gray-200 p-4 my-3">
                <pre className="text-sm text-gray-700 m-0">{`📤 Superkabe sent an email
Subject: Quick question about your hiring stack
[truncated body preview]
campaign_id: q2-outreach
mailbox: founder@yourdomain.com
via Superkabe · 2026-04-30T14:33:02.000Z`}</pre>
            </div>
            <p className="text-gray-600">Each event-type uses a distinct emoji + headline so they&apos;re scannable on the timeline.</p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Rate limits and retries</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>HubSpot returns <code>429</code> when daily/burst limits are hit. The Superkabe client honors <code>Retry-After</code> automatically (one in-process retry up to 30s).</li>
                <li>If a push fails with a retryable status (<code>429</code>, <code>5xx</code>), the activity-push worker retries with exponential backoff: 1m, 5m, 15m, 1h, 4h, 12h.</li>
                <li>After 6 failed attempts, the row is marked <code>failed</code> and surfaces in the dashboard&apos;s Failed counter.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Compliance &amp; data handling</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Data we read from HubSpot</h3>
            <p className="text-gray-600 mb-3">Only the contact-shaped fields needed to send and report:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4 text-sm">
                <li>Email, first name, last name, full name</li>
                <li>Company name, job title, phone number</li>
                <li>Email-opt-out flag (<code>hs_email_optout</code>)</li>
            </ul>
            <p className="text-gray-600 mb-4">We never read deals, opportunities, notes, conversations, custom objects, or files. The <code>crm.objects.contacts.read</code> + <code>crm.lists.read</code> + <code>timeline</code> scopes are the minimum surface needed for the integration to function.</p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Data we write to HubSpot</h3>
            <p className="text-gray-600 mb-4">One Note per Superkabe activity event, attached to the matching contact via the standard <code>note → contact</code> association. We do not modify contact properties, create/delete contacts, or touch any other object.</p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Webhook signature verification</h3>
            <p className="text-gray-600 mb-4">Every inbound HubSpot webhook is verified against an HMAC-SHA256 signature using your app&apos;s client secret as the key (per HubSpot&apos;s v3 signature spec). Requests with missing, invalid, or replayed signatures (older than 5 minutes) are rejected with <code>401</code>. The verifier uses constant-time comparison to prevent timing attacks.</p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">GDPR — right to erasure</h3>
            <p className="text-gray-600 mb-3">Superkabe subscribes to HubSpot&apos;s <code>contact.privacyDeletion</code> webhook. When a HubSpot user permanently deletes a contact for GDPR reasons, HubSpot fires that event to us, and within seconds we:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 mb-4 text-sm">
                <li>Locate every Superkabe lead linked to that HubSpot contact</li>
                <li>Cancel any pending activity-push items for those leads (so we never send another note about them to anyone)</li>
                <li>Block the lead from outbound sending across all campaigns</li>
                <li>Delete the contact-link row that maps Superkabe ↔ HubSpot</li>
                <li>Audit-log the deletion with timestamps + masked email fragment</li>
            </ol>
            <p className="text-gray-600 mb-4">The underlying Superkabe lead is retained but blocked, because the same person may exist in your account from another lawful processing basis (e.g., imported from Apollo separately). For full Lead-level erasure, point your customer at <a href="/dashboard/data-rights" className="text-blue-600 hover:underline">Data Rights</a> which handles GDPR Article 17 across all Superkabe data.</p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Token storage</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4 text-sm">
                <li>OAuth access tokens and refresh tokens are encrypted at rest with AES-256 (per the <code>ENCRYPTION_KEY</code> rotated independently from <code>JWT_SECRET</code>).</li>
                <li>Tokens are decrypted only when the per-org CRM client is instantiated for an actual API call; never written to logs.</li>
                <li>Disconnect wipes the encrypted blob immediately and cancels pending pushes.</li>
                <li>Refresh failure → connection marked <code>expired</code>; the user must re-authorize.</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Audit trail</h3>
            <p className="text-gray-600 mb-4">Connection events (connected, disconnected, expired, privacy-deleted) are written to the platform&apos;s audit log under organization scope. Customers on Growth+ tiers can export this via <a href="/dashboard/audit" className="text-blue-600 hover:underline">/dashboard/audit</a>.</p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Limitations</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>v1 ships activities as Notes. Phase 4 graduates to a registered timeline-event template for richer rendering.</li>
                <li>Custom Object support is on the roadmap — for now contacts only.</li>
                <li>Two-way contact creation (Superkabe → HubSpot) is not yet enabled — the integration is read-from / push-activity-to.</li>
            </ul>

            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li><a href="/dashboard/integrations/crm" className="text-blue-600 hover:text-blue-700 font-medium">→ Connect HubSpot now</a></li>
                    <li><a href="/docs/integrations/salesforce" className="text-blue-600 hover:text-blue-700 font-medium">→ Salesforce setup</a></li>
                    <li><a href="/docs/disconnecting" className="text-blue-600 hover:text-blue-700 font-medium">→ Revoke / disconnect</a></li>
                </ul>
            </div>
        </div>
    );
}

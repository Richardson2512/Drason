import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Onboarding & Account Setup | Superkabe Docs',
    description: 'How Superkabe sign-up works — email/password, Google Workspace OAuth, and personal Gmail flows. ToS acceptance, trial mechanics, first-time setup checklist.',
    alternates: { canonical: '/docs/onboarding' },
    openGraph: {
        title: 'Onboarding & Account Setup | Superkabe Docs',
        description: 'How Superkabe sign-up works — email/password, Google Workspace OAuth, and personal Gmail flows. ToS acceptance, trial mechanics, first-time setup checklist.',
        url: '/docs/onboarding',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function OnboardingDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Onboarding & Account Setup
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Everything that happens between &quot;Sign up&quot; and your first campaign send
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The Three Sign-Up Paths</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe supports three ways to create an account. The path you take depends on what kind of email
                address you sign up with — the backend branches on Google&apos;s <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">hd</code> (hosted-domain)
                claim to decide whether your organization can be auto-derived or whether we need to ask you to name it.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Path Selection at a Glance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Email + Password</strong> — direct form at /signup, email verification required</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Workspace OAuth</strong> — domain becomes org name, straight to /dashboard</div>
                    <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Gmail OAuth</strong> — pending record + /onboarding step to name your org</div>
                </div>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Email + Password</h3>
            <p className="text-gray-600 mb-4">
                The classic flow. Visit <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/signup</code> and submit
                three things: email, password, and an organization name. The backend creates a User and Organization
                row, hashes your password, sends a verification email via Resend, and sets your JWT cookie. You land on
                the dashboard immediately — verifying your email later is a soft requirement.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Google OAuth — Workspace Account</h3>
            <p className="text-gray-600 mb-4">
                If you sign in with Google and your account is on a custom domain managed by Google Workspace,
                Google returns an <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">hd</code> claim
                with your domain (e.g. <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">acme.com</code>).
                Superkabe treats that domain as the canonical organization identity: it derives an org name from the
                domain, creates the org and user, issues your JWT, and redirects to <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/dashboard</code>.
                No extra step.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Google OAuth — Personal Gmail</h3>
            <p className="text-gray-600 mb-4">
                If your Google account is a plain <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">@gmail.com</code> address,
                Google sends back <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">hd: undefined</code>.
                The backend creates a <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">PendingRegistration</code> record
                (encrypted tokens, 10-minute TTL) and bounces you to <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/onboarding</code>.
                That page asks for one thing: a name for your organization. Once submitted, the backend reads back the
                pending record, creates the User + Organization, issues your JWT, deletes the pending row, and lands
                you on <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/dashboard</code>.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Why Personal Gmail Goes Through /onboarding</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                A Workspace account has a verified domain, and that domain is what Superkabe uses as the organization&apos;s
                identity (it&apos;s also what we&apos;ll later attach mailboxes, DNS records, and team members to). A personal
                Gmail address has no such domain — every gmail.com user shares the same root domain, so we can&apos;t derive
                anything meaningful from it.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Without an explicit naming step, every gmail.com signup would either crash on a uniqueness constraint
                or default to a generic placeholder like &quot;Personal&quot; — both bad UX. The pending-registration handoff is
                the cleanest fix: we hold the verified Google identity for 10 minutes while you finish naming your org,
                then commit everything in a single transaction.
            </p>

            <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100 not-prose">
                <p className="font-bold text-gray-900 text-sm mb-4">OAuth Decision Flow</p>
                <pre className="text-xs text-gray-700 leading-relaxed overflow-x-auto">{`Google OAuth callback
        │
        ▼
  Inspect googleUser.hd
        │
   ┌────┴─────────────┐
   │                  │
   ▼                  ▼
hd = "acme.com"   hd = undefined
(Workspace)       (Personal Gmail)
   │                  │
   ▼                  ▼
Derive org name    Create PendingRegistration
from domain        (encrypted tokens, 10-min TTL)
   │                  │
   ▼                  ▼
Create User+Org    Redirect → /onboarding
Issue JWT                 │
   │                      ▼
   ▼               User submits org name
/dashboard                │
                          ▼
                   Read pending → create User+Org
                   Issue JWT, delete pending
                          │
                          ▼
                       /dashboard`}</pre>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Happens During Sign-Up</h2>
            <p className="text-gray-600 mb-4">
                Regardless of which path you take, the backend runs the same six steps inside a single transaction:
            </p>
            <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100">
                <ol className="space-y-4 text-gray-600 list-decimal list-inside">
                    <li><strong className="text-gray-900">Account creation:</strong> A User row and an Organization row are inserted into Postgres. The User is linked to the Organization with role <code className="px-1 py-0.5 bg-gray-100">admin</code>.</li>
                    <li><strong className="text-gray-900">Trial activation:</strong> <code className="px-1 py-0.5 bg-gray-100">subscription_tier=trial</code>, <code className="px-1 py-0.5 bg-gray-100">subscription_status=trialing</code>, <code className="px-1 py-0.5 bg-gray-100">trial_started_at=now()</code>, <code className="px-1 py-0.5 bg-gray-100">trial_ends_at=now() + 14 days</code>. No card required.</li>
                    <li><strong className="text-gray-900">Default Slack alert preferences:</strong> A row is seeded so that when you connect Slack later, the standard event types (pause, rotation, healing, threshold breach) are already enabled.</li>
                    <li><strong className="text-gray-900">Consent records:</strong> Two append-only rows are written to <code className="px-1 py-0.5 bg-gray-100">audit_consent</code> — one for ToS, one for Privacy — each tagged with version number, IP, and user-agent.</li>
                    <li><strong className="text-gray-900">Welcome email:</strong> Sent via Resend if <code className="px-1 py-0.5 bg-gray-100">RESEND_API_KEY</code> is configured. If not, the signup still succeeds — the email is best-effort.</li>
                    <li><strong className="text-gray-900">JWT cookie:</strong> Httponly, secure, SameSite=Lax. Browser is redirected to <code className="px-1 py-0.5 bg-gray-100">/dashboard</code>.</li>
                </ol>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Terms of Service & Privacy Acceptance</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Both signup paths require accepting the current ToS and Privacy versions before the account is created.
                The backend rejects any signup that doesn&apos;t carry the correct version numbers in its payload — the
                checkboxes on the form aren&apos;t cosmetic.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Acceptance is recorded as two rows in <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">audit_consent</code>,
                one per document, with the version number, document path, IP, user-agent, and timestamp. The table is
                append-only — we never mutate or delete consent records.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-amber-700 mb-2">Re-Acceptance on Version Bump</h3>
                <p className="text-gray-700">
                    If we publish a new ToS or Privacy version, the next time you log in the <code className="px-1 py-0.5 bg-amber-100">requireFreshConsent</code> middleware
                    detects the version mismatch and shows a re-acceptance modal before letting you into the dashboard.
                    Your old consent rows stay intact — a new row is appended for the new version.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">First-Time Setup Checklist</h2>
            <p className="text-gray-600 mb-4">
                Once you&apos;re on the dashboard, here&apos;s what to do in your first thirty minutes — in order:
            </p>
            <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100">
                <ol className="space-y-4 text-gray-600 list-decimal list-inside">
                    <li><strong className="text-gray-900">Connect at least one mailbox.</strong> Settings → Mailboxes → Connect Gmail / Outlook / SMTP. Without a connected mailbox, nothing else works.</li>
                    <li><strong className="text-gray-900">Verify DNS for your sending domain.</strong> SPF, DKIM, DMARC must all pass. See the <a href="/docs/help/dns-setup" className="text-blue-600 hover:text-blue-800">DNS setup guide</a>.</li>
                    <li><strong className="text-gray-900">Connect Slack for alerts.</strong> Strongly recommended — protection events are useless if nobody sees them. <a href="/docs/slack-integration" className="text-blue-600 hover:text-blue-800">Slack integration guide</a>.</li>
                    <li><strong className="text-gray-900">Bring in your leads.</strong> Pick one: a <a href="/docs/clay-integration" className="text-blue-600 hover:text-blue-800">Clay webhook</a>, a <a href="/docs/help/csv-upload" className="text-blue-600 hover:text-blue-800">CSV upload</a>, or the API.</li>
                    <li><strong className="text-gray-900">Choose a system mode.</strong> <code className="px-1 py-0.5 bg-gray-100">OBSERVE</code> (logs only, for testing), <code className="px-1 py-0.5 bg-gray-100">SUGGEST</code> (recommendations, no action), or <code className="px-1 py-0.5 bg-gray-100">ENFORCE</code> (full automated protection). Start in OBSERVE.</li>
                    <li><strong className="text-gray-900">Create your first campaign.</strong> Draft a sequence, attach a routing rule, and let leads flow in.</li>
                </ol>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Trial Mechanics</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every new account starts on a <strong className="text-gray-900">14-day trial</strong> with no credit card
                required. During the trial you have full access to the platform — connect mailboxes, run campaigns,
                use protection in ENFORCE mode, everything.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                When the trial ends and you haven&apos;t picked a plan, the account auto-downgrades to a
                <strong className="text-gray-900"> trial-expired</strong> state. <strong>Sending is blocked</strong> (the
                sequencer refuses to dispatch new emails) but reading is not — you can still log in, view dashboards,
                and download data. An upgrade prompt appears throughout the UI pointing to <a href="/pricing" className="text-blue-600 hover:text-blue-800">/pricing</a>.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-blue-900 text-lg mb-2">Trial State Reference</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li><code className="px-1 py-0.5 bg-blue-100">subscription_tier=trial</code> &nbsp;<code className="px-1 py-0.5 bg-blue-100">subscription_status=trialing</code> — active trial, full access</li>
                    <li><code className="px-1 py-0.5 bg-blue-100">subscription_status=trial_expired</code> — read-only, sending blocked</li>
                    <li><code className="px-1 py-0.5 bg-blue-100">subscription_status=active</code> — paid, full access</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Account Roles</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                When you sign up, you are the only user in your organization, with role <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">admin</code>.
                Add team members at <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">/dashboard/settings/team</code>.
            </p>
            <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100">
                <p className="font-bold text-gray-900 mb-3">Role Hierarchy</p>
                <ul className="space-y-3 text-gray-600">
                    <li>
                        <strong className="text-purple-600">super_admin</strong>
                        <span className="ml-2">— Superkabe staff only. Cross-org access for support. Never granted to customer accounts.</span>
                    </li>
                    <li>
                        <strong className="text-blue-600">admin</strong>
                        <span className="ml-2">— Full access to the org: billing, mailboxes, campaigns, team, settings. The signup user gets this by default.</span>
                    </li>
                    <li>
                        <strong className="text-green-600">member</strong>
                        <span className="ml-2">— View-only by default. Per-resource permissions (campaigns, mailboxes, leads) are configurable by an admin.</span>
                    </li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Troubleshooting Common Signup Issues</h2>

            <div className="bg-red-50 border border-red-200 p-6 mb-4">
                <p className="font-bold text-red-700 mb-2">&quot;OAuth callback redirected me to the landing page&quot;</p>
                <p className="text-gray-700 text-sm">
                    Known issue: <code className="px-1 py-0.5 bg-red-100">/onboarding</code> wasn&apos;t whitelisted in the
                    auth middleware, so personal-Gmail users were bounced back to <code className="px-1 py-0.5 bg-red-100">/</code>.
                    Fixed in commit <code className="px-1 py-0.5 bg-red-100">37a1a2e</code> on April 29, 2026. If you&apos;re
                    still seeing it, hard-refresh and retry — your <code className="px-1 py-0.5 bg-red-100">PendingRegistration</code> is
                    valid for 10 minutes.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-4">
                <p className="font-bold text-amber-700 mb-2">&quot;I clicked authorize but never got the welcome email&quot;</p>
                <p className="text-gray-700 text-sm">
                    Check your spam folder. If it&apos;s genuinely missing, sign back in at <code className="px-1 py-0.5 bg-amber-100">/login</code> with
                    the same Google account — the welcome email will resend on the next successful login if it failed
                    the first time.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 mb-4">
                <p className="font-bold text-amber-700 mb-2">&quot;Workspace signup created the wrong organization name&quot;</p>
                <p className="text-gray-700 text-sm">
                    The org name is derived from your Workspace domain (e.g. <code className="px-1 py-0.5 bg-amber-100">acme.com</code> →
                    &quot;Acme&quot;). Admins can rename at <code className="px-1 py-0.5 bg-amber-100">/dashboard/settings/general</code> at
                    any time — the rename is cosmetic and doesn&apos;t affect mailbox or DNS configuration.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
                <p className="font-bold text-blue-900 mb-2">&quot;I don&apos;t have a custom domain&quot;</p>
                <p className="text-gray-700 text-sm">
                    Personal Gmail works fine for signup — you&apos;ll just be prompted to name your organization at
                    <code className="px-1 py-0.5 bg-blue-100"> /onboarding</code>. You can connect any sending mailbox
                    (Gmail, Outlook, SMTP) afterwards, regardless of which Google account you used to sign up.
                </p>
            </div>

            <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
                <ul className="space-y-2">
                    <li><a href="/docs/getting-started" className="text-blue-600 hover:text-blue-700 font-medium">→ Getting Started — what Superkabe does and how it works</a></li>
                    <li><a href="/docs/help/dns-setup" className="text-blue-600 hover:text-blue-700 font-medium">→ DNS Setup — SPF, DKIM, DMARC for your sending domain</a></li>
                    <li><a href="/docs/slack-integration" className="text-blue-600 hover:text-blue-700 font-medium">→ Slack Integration — wire up alerts before going live</a></li>
                    <li><a href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">→ Pricing — pick a plan before your trial ends</a></li>
                </ul>
            </div>
        </div>
    );
}

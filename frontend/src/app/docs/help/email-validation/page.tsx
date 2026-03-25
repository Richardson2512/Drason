import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Does Email Validation Work? | Superkabe Help',
    description: 'Learn how Superkabe validates every incoming email using a hybrid validation layer with internal checks and MillionVerifier API integration.',
    alternates: { canonical: '/docs/help/email-validation' },
    openGraph: {
        title: 'How Does Email Validation Work? | Superkabe Help',
        description: 'Learn how Superkabe validates every incoming email using a hybrid validation layer with internal checks and MillionVerifier API integration.',
        url: '/docs/help/email-validation',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function EmailValidationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Does Email Validation Work?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding the hybrid validation layer that protects your sender reputation before a single email is sent
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800">
                    Superkabe validates every incoming email before it reaches your sending platform. Invalid emails are blocked automatically.
                    The system uses a <strong>hybrid approach</strong>: fast internal checks first, then external API verification for borderline cases &mdash;
                    saving you money while catching bad addresses before they bounce.
                </p>
            </div>

            {/* How the Hybrid Layer Works */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How the Hybrid Validation Layer Works</h2>
            <p className="text-gray-700 mb-6">
                Superkabe doesn't rely on a single validation method. Instead, it runs a two-stage pipeline that balances speed, accuracy, and cost.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-6">
                    <div className="text-3xl mb-3">1</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Stage 1: Internal Checks (Free)</h3>
                    <p className="text-gray-700 mb-4 text-sm">
                        Every email passes through these checks instantly, at zero cost. Most obviously invalid emails are caught here.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>&#x2022; <strong>Syntax validation</strong> &mdash; Catches typos like missing @ or double dots</li>
                        <li>&#x2022; <strong>MX record lookup</strong> &mdash; Confirms the domain can actually receive email</li>
                        <li>&#x2022; <strong>Disposable domain detection</strong> &mdash; Blocks throwaway addresses (mailinator, guerrillamail, etc.)</li>
                        <li>&#x2022; <strong>Catch-all detection</strong> &mdash; Flags domains that accept any address (risky for bounce rates)</li>
                    </ul>
                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-800 font-medium">Available on all plans. No API credits consumed.</p>
                    </div>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-2xl p-6">
                    <div className="text-3xl mb-3">2</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Stage 2: MillionVerifier API (Paid)</h3>
                    <p className="text-gray-700 mb-4 text-sm">
                        Emails that pass internal checks but are flagged as risky get sent to MillionVerifier for deep verification.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>&#x2022; <strong>SMTP handshake</strong> &mdash; Connects to the mail server to verify the mailbox exists</li>
                        <li>&#x2022; <strong>Inbox activity signals</strong> &mdash; Checks for signs of an active, real mailbox</li>
                        <li>&#x2022; <strong>Role-based detection</strong> &mdash; Identifies addresses like info@, support@, admin@</li>
                        <li>&#x2022; <strong>Spam trap detection</strong> &mdash; Catches known spam trap addresses</li>
                    </ul>
                    <div className="mt-4 bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-800 font-medium">Only called when needed. DomainInsight caching reduces API calls further.</p>
                    </div>
                </div>
            </div>

            {/* Validation Statuses */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Validation Statuses Explained</h2>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">Valid</span>
                        <div>
                            <p className="text-gray-700 text-sm">The email address is confirmed to exist and is safe to send to. No bounce risk.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">Risky</span>
                        <div>
                            <p className="text-gray-700 text-sm">The email might be deliverable but has risk factors (catch-all domain, role-based address, low activity). May be sent depending on your plan tier.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold">Invalid</span>
                        <div>
                            <p className="text-gray-700 text-sm">The email address does not exist, the domain has no mail server, or it failed SMTP verification. <strong>Blocked automatically &mdash; never sent.</strong></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">Unknown</span>
                        <div>
                            <p className="text-gray-700 text-sm">Verification was inconclusive (server timeout, greylisting). Treated as risky and may be retried later.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Leads Show as Invalid */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-red-900">Why Is My Lead Showing as &ldquo;Invalid&rdquo;?</h2>
                <p className="text-red-800 mb-4">
                    When a lead shows the <strong>Invalid</strong> status, it means Superkabe determined the email address cannot receive mail. Common reasons include:
                </p>
                <ul className="space-y-2 text-sm text-red-800">
                    <li>&#x2022; The mailbox doesn&rsquo;t exist on the recipient&rsquo;s server (e.g., the person left the company)</li>
                    <li>&#x2022; The domain has no MX records &mdash; it simply cannot receive email</li>
                    <li>&#x2022; The address uses a known disposable email provider</li>
                    <li>&#x2022; Syntax errors in the address (missing @, invalid characters)</li>
                </ul>
                <p className="text-red-700 text-sm mt-4">
                    <strong>What happens:</strong> Invalid leads are permanently blocked and will never be sent to your sending platform. This protects your bounce rate and sender reputation.
                </p>
            </div>

            {/* DomainInsight Caching */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">DomainInsight Caching: Saving API Costs</h2>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 mb-12">
                <p className="text-gray-700 mb-4">
                    Superkabe caches domain-level validation intelligence using <strong>DomainInsight</strong>. When the system validates an email, it stores
                    what it learned about the domain &mdash; MX records, catch-all status, disposable classification, and blacklist status.
                </p>
                <div className="bg-white rounded-xl p-6 mb-4 border border-green-200">
                    <h3 className="font-bold text-gray-900 mb-3">How It Saves Money</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                        <p>&#x2022; <strong>First email from a domain:</strong> Full validation runs (internal + API if needed). Domain data is cached.</p>
                        <p>&#x2022; <strong>Subsequent emails from the same domain:</strong> Internal checks reuse cached domain data. Many validations skip the API entirely.</p>
                        <p>&#x2022; <strong>Example:</strong> If you import 500 leads from 50 companies, only ~50 domain lookups are needed instead of 500.</p>
                    </div>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                    <p className="text-xs text-green-800 font-medium">DomainInsight cache refreshes periodically to stay accurate. Stale data is automatically invalidated.</p>
                </div>
            </div>

            {/* Tier-Based API Usage */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Validation by Plan Tier</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">Starter</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Internal Checks Only</h3>
                    <p className="text-gray-600 text-sm">
                        All four internal checks run on every lead (syntax, MX, disposable, catch-all). No external API calls.
                        Great for small volumes where most leads come from reliable sources like LinkedIn.
                    </p>
                </div>
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">Growth</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Internal + API for Risky Leads</h3>
                    <p className="text-gray-600 text-sm">
                        Internal checks run first. Leads flagged as <strong>risky</strong> (catch-all domains, role-based addresses) are sent to
                        MillionVerifier for deep verification. Valid and invalid leads skip the API. This is the sweet spot for most teams.
                    </p>
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">Scale</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Maximum API Coverage</h3>
                    <p className="text-gray-600 text-sm">
                        All leads that aren&rsquo;t obviously invalid get API verification. Even &ldquo;valid&rdquo; internal results are double-checked
                        externally. Best for high-volume senders where every bounce matters and the cost of a bounce exceeds the cost of verification.
                    </p>
                </div>
            </div>

            {/* Practical Example */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-amber-900">Example: What Happens When a Lead Is Ingested</h2>
                <div className="space-y-3 text-sm text-amber-900">
                    <p>1. Lead arrives via Clay webhook: <strong>john@acmecorp.com</strong></p>
                    <p>2. <strong>Syntax check:</strong> Pass (valid format)</p>
                    <p>3. <strong>MX lookup:</strong> Pass (acmecorp.com has MX records &mdash; cached from DomainInsight)</p>
                    <p>4. <strong>Disposable check:</strong> Pass (not a disposable domain)</p>
                    <p>5. <strong>Catch-all check:</strong> Flag &mdash; acmecorp.com is a catch-all domain (risky)</p>
                    <p>6. <strong>Result so far:</strong> Risky. On Growth/Scale tiers, the lead is sent to MillionVerifier.</p>
                    <p>7. <strong>API result:</strong> Valid &mdash; SMTP handshake confirmed the mailbox exists.</p>
                    <p>8. <strong>Final status:</strong> Valid. Lead proceeds to health gate and routing.</p>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/bounce-classification" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; How Does Bounce Classification Work?
                    </a>
                    <a href="/docs/help/entity-statuses" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Understanding Status Labels
                    </a>
                    <a href="/docs/help/billing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        &rarr; Billing &amp; Plan Details
                    </a>
                </div>
            </div>
        </div>
    );
}

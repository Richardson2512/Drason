import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DNS Setup Guide (SPF, DKIM, DMARC, MX) | Superkabe Help',
    description:
        'Step-by-step guide to setting up SPF, DKIM, DMARC and MX records for your sending domains so they pass the authentication checks Superkabe runs during infrastructure assessment.',
    alternates: { canonical: '/docs/help/dns-setup' },
    openGraph: {
        title: 'DNS Setup Guide (SPF, DKIM, DMARC, MX) | Superkabe Help',
        description: 'Step-by-step guide to setting up SPF, DKIM, DMARC and MX records for your sending domains.',
        url: '/docs/help/dns-setup',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DnsSetupPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">DNS Setup Guide</h1>
            <p className="text-xl text-gray-500 mb-12">
                How to configure SPF, DKIM, DMARC and MX records for your sending domains.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Every sending domain needs four DNS records to pass authentication and stay deliverable:{' '}
                    <strong>SPF</strong> (authorizes which servers can send),{' '}
                    <strong>DKIM</strong> (signs emails cryptographically),{' '}
                    <strong>DMARC</strong> (tells receivers what to do with unauthenticated mail), and{' '}
                    <strong>MX</strong> (lets your domain receive replies, bounces and unsubscribes).
                    Superkabe checks all four during infrastructure assessment and flags any that are
                    missing or misconfigured. The DNS Authentication card on each domain&apos;s detail
                    page also includes a <strong>Check now</strong> button that runs the same checks
                    on demand.
                </p>
                <p className="text-blue-700 text-sm">
                    Use our free tools:{' '}
                    <a href="/tools/spf-lookup" className="underline font-semibold">
                        SPF Lookup
                    </a>{' '}
                    |{' '}
                    <a href="/tools/dkim-lookup" className="underline font-semibold">
                        DKIM Lookup
                    </a>{' '}
                    |{' '}
                    <a href="/tools/dmarc-lookup" className="underline font-semibold">
                        DMARC Lookup
                    </a>
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 mb-12 rounded-lg">
                <h3 className="text-base font-bold text-amber-900 mb-2">Where do these records live?</h3>
                <p className="text-amber-800 text-sm mb-2">
                    All four records are configured at <strong>your DNS provider</strong> (the place
                    you registered or manage your domain — GoDaddy, Cloudflare, Namecheap, Route 53,
                    etc.) — <em>not</em> at Superkabe and <em>not</em> at any sequencing/sending tool.
                </p>
                <p className="text-amber-800 text-sm">
                    What goes <em>inside</em> each record depends on which mailbox provider you use
                    to actually send the email (Google Workspace, Microsoft 365, or a custom SMTP
                    provider). The examples below cover the common providers; pick the one that
                    matches your setup.
                </p>
            </div>

            {/* ─── SPF ───────────────────────────────────────────────────────── */}

            <h2 id="spf" className="text-3xl font-bold mb-6 text-gray-900">
                1. SPF (Sender Policy Framework)
            </h2>
            <p className="text-gray-600 mb-4">
                SPF tells receiving mail servers which IP addresses and services are authorized to
                send email on behalf of your domain. Missing or misconfigured SPF is one of the
                most common reasons cold email lands in spam.
            </p>
            <div className="bg-white border border-[#D1CBC5] p-6 mb-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">Where to add it</h3>
                <ol className="space-y-3 text-gray-600">
                    <li>
                        <strong>Open your DNS provider&apos;s admin panel</strong> for the sending
                        domain (the domain in your <code>From:</code> address).
                    </li>
                    <li>
                        <strong>Add a TXT record</strong> for the root domain (host{' '}
                        <code>@</code> or your bare domain — e.g. <code>yourdomain.com</code>).
                        There must be exactly one SPF record per domain.
                    </li>
                    <li>
                        <strong>Set the value</strong> to whichever record matches your sending
                        infrastructure (see below). End with <code>~all</code> while warming up
                        and only move to <code>-all</code> once your authentication is fully
                        stable across all sources.
                    </li>
                    <li>
                        <strong>Save the record</strong> and verify with the{' '}
                        <a href="/tools/spf-lookup" className="text-blue-600 underline">
                            SPF Lookup tool
                        </a>{' '}
                        or the <strong>Check now</strong> button on the domain detail page.
                    </li>
                </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-[#D1CBC5] p-5 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">Google Workspace</h4>
                    <div className="bg-gray-50 p-3 text-xs font-mono mb-2 rounded">
                        v=spf1 include:_spf.google.com ~all
                    </div>
                    <p className="text-xs text-gray-500">
                        Use this when your sending mailboxes are Google Workspace accounts (the
                        most common Superkabe setup).
                    </p>
                </div>
                <div className="bg-white border border-[#D1CBC5] p-5 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">Microsoft 365 / Outlook</h4>
                    <div className="bg-gray-50 p-3 text-xs font-mono mb-2 rounded">
                        v=spf1 include:spf.protection.outlook.com ~all
                    </div>
                    <p className="text-xs text-gray-500">
                        Use this when your sending mailboxes are Microsoft 365 / Outlook accounts.
                    </p>
                </div>
                <div className="bg-white border border-[#D1CBC5] p-5 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">Custom SMTP / dedicated IPs</h4>
                    <div className="bg-gray-50 p-3 text-xs font-mono mb-2 rounded">
                        v=spf1 ip4:&lt;your.smtp.ip&gt; ~all
                    </div>
                    <p className="text-xs text-gray-500">
                        Use this when you connect mailboxes via raw SMTP credentials and own the
                        sending IP (or a small pool of IPs).
                    </p>
                </div>
                <div className="bg-white border border-[#D1CBC5] p-5 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">Multiple sources</h4>
                    <div className="bg-gray-50 p-3 text-xs font-mono mb-2 rounded">
                        v=spf1 include:_spf.google.com include:spf.protection.outlook.com ~all
                    </div>
                    <p className="text-xs text-gray-500">
                        Combine includes when more than one infrastructure sends from this domain.
                        Stay under 10 DNS lookups total (each <code>include:</code> counts as one).
                    </p>
                </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Common Mistakes</h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                    <li>
                        <strong>Multiple SPF records</strong> &mdash; only one TXT record starting
                        with <code>v=spf1</code> is allowed per domain. If you need multiple
                        senders, merge them into a single record using extra{' '}
                        <code>include:</code> mechanisms.
                    </li>
                    <li>
                        <strong>Too many DNS lookups</strong> &mdash; SPF allows a maximum of 10
                        DNS lookups during evaluation. Each <code>include:</code> counts. Use{' '}
                        <code>ip4:</code> for static IPs to save lookups.
                    </li>
                    <li>
                        <strong>Using <code>-all</code> too early</strong> &mdash; a hard-fail can
                        cause legitimate emails to be rejected during warmup or while a new sender
                        is added. Stick with <code>~all</code> until your authentication is stable
                        across every source.
                    </li>
                </ul>
            </div>

            {/* ─── DKIM ──────────────────────────────────────────────────────── */}

            <h2 id="dkim" className="text-3xl font-bold mb-6 text-gray-900">
                2. DKIM (DomainKeys Identified Mail)
            </h2>
            <p className="text-gray-600 mb-4">
                DKIM adds a cryptographic signature to every outgoing email, proving the message
                was authorised by your domain and hasn&apos;t been modified in transit. Receivers
                use this signature to verify legitimacy.
            </p>
            <div className="bg-white border border-[#D1CBC5] p-6 mb-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">How to set it up</h3>
                <ol className="space-y-3 text-gray-600">
                    <li>
                        <strong>Generate the DKIM key pair</strong> at your mailbox provider:
                        <ul className="mt-2 ml-6 space-y-1 text-sm list-disc">
                            <li>
                                <strong>Google Workspace:</strong> Admin Console &rarr; Apps &rarr;
                                Google Workspace &rarr; Gmail &rarr; Authenticate Email. Select
                                the domain and click <em>Generate new record</em>.
                            </li>
                            <li>
                                <strong>Microsoft 365:</strong> Defender Portal &rarr; Email &amp;
                                collaboration &rarr; Policies &rarr; DKIM. Enable DKIM signing for
                                your domain and copy the two CNAME records that appear.
                            </li>
                            <li>
                                <strong>Custom SMTP / dedicated infrastructure:</strong> generate
                                a 2048-bit RSA key pair (<code>openssl genrsa</code>) and publish
                                the public key as a TXT record at the selector subdomain.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <strong>Add the TXT (or CNAME) record</strong> at your DNS provider with
                        the selector as a subdomain &mdash; e.g.{' '}
                        <code>google._domainkey.yourdomain.com</code> for Google,{' '}
                        <code>selector1._domainkey.yourdomain.com</code> for Microsoft 365.
                    </li>
                    <li>
                        <strong>Wait 10&ndash;30 minutes for DNS to propagate</strong>, then go
                        back to your mailbox provider and click the <em>Activate</em> /{' '}
                        <em>Start authentication</em> button.
                    </li>
                    <li>
                        <strong>Verify</strong> using the{' '}
                        <a href="/tools/dkim-lookup" className="text-blue-600 underline">
                            DKIM Lookup tool
                        </a>{' '}
                        with your selector. Superkabe&apos;s assessment also probes the common
                        selectors (<code>default</code>, <code>google</code>,{' '}
                        <code>selector1</code>, <code>selector2</code>) during the periodic sweep.
                    </li>
                </ol>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Common Mistakes</h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                    <li>
                        <strong>Wrong selector name</strong> &mdash; the selector you publish must
                        match exactly what the mailbox provider uses to sign outgoing mail. Copy
                        the exact name from the provider&apos;s setup screen.
                    </li>
                    <li>
                        <strong>Forgot to activate</strong> &mdash; Google Workspace and
                        Microsoft 365 both require an explicit <em>Activate</em> click after the
                        DNS record is published. Until then, signed mail will fail DKIM.
                    </li>
                    <li>
                        <strong>Single record split across lines</strong> &mdash; some DNS
                        providers wrap long TXT values. Make sure the value renders as one
                        contiguous string after publication.
                    </li>
                </ul>
            </div>

            {/* ─── DMARC ─────────────────────────────────────────────────────── */}

            <h2 id="dmarc" className="text-3xl font-bold mb-6 text-gray-900">
                3. DMARC (Domain-based Message Authentication)
            </h2>
            <p className="text-gray-600 mb-4">
                DMARC ties SPF and DKIM together and tells receiving servers what to do when
                authentication fails. It also enables aggregate reporting so you can see who is
                sending mail as your domain.
            </p>
            <div className="bg-white border border-[#D1CBC5] p-6 mb-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">Recommended record for cold email</h3>
                <p className="text-gray-600 text-sm mb-3">
                    Add a TXT record at <code>_dmarc.yourdomain.com</code> with this value:
                </p>
                <div className="bg-gray-50 p-3 text-sm font-mono mb-4 rounded">
                    v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; pct=100
                </div>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>
                        <strong>p=none</strong> &mdash; monitoring only. Recommended for new
                        domains. Move to <code>p=quarantine</code> after 30 days of clean reports
                        and to <code>p=reject</code> once you&apos;re fully confident in your
                        authentication.
                    </li>
                    <li>
                        <strong>rua=</strong> &mdash; email address to receive aggregate reports.
                        Use a dedicated address or sign up for a DMARC reporting service like
                        Postmark, dmarcian, or Easydmarc.
                    </li>
                    <li>
                        <strong>pct=100</strong> &mdash; apply the policy to 100% of messages.
                    </li>
                </ul>
            </div>
            <p className="text-gray-600 text-sm mb-12">
                Superkabe scores DMARC <strong>passing</strong> for{' '}
                <code>p=quarantine</code> or <code>p=reject</code>, and{' '}
                <strong>weak</strong> for <code>p=none</code> &mdash; the latter is monitoring
                only and doesn&apos;t actually protect against spoofing. A missing DMARC record
                scores as failing.
            </p>

            {/* ─── MX ────────────────────────────────────────────────────────── */}

            <h2 id="mx" className="text-3xl font-bold mb-6 text-gray-900">4. MX (Mail Exchange)</h2>
            <p className="text-gray-600 mb-4">
                MX records tell the rest of the internet where to deliver mail addressed to your
                domain. For sending domains, MX is what allows replies, bounce notifications and
                unsubscribe responses to reach you. A domain with no MX records can <em>send</em>{' '}
                mail but cannot receive any &mdash; which means you lose visibility into bounces
                and replies entirely.
            </p>
            <div className="bg-white border border-[#D1CBC5] p-6 mb-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">How to set it up</h3>
                <ol className="space-y-3 text-gray-600">
                    <li>
                        <strong>Find your mailbox provider&apos;s MX records.</strong> Each
                        provider publishes them publicly:
                        <ul className="mt-2 ml-6 space-y-1 text-sm list-disc">
                            <li>
                                <strong>Google Workspace:</strong> a single record{' '}
                                <code>smtp.google.com</code> at priority{' '}
                                <code>1</code> (modern setup), or the legacy 5-record set{' '}
                                <code>aspmx.l.google.com</code> + four ALT records.
                            </li>
                            <li>
                                <strong>Microsoft 365:</strong>{' '}
                                <code>&lt;tenant&gt;-com.mail.protection.outlook.com</code> at
                                priority <code>0</code>. Find the exact value in Microsoft 365
                                Admin &rarr; Domains.
                            </li>
                            <li>
                                <strong>Custom mail host:</strong> use whatever MX value your host
                                provides (e.g. <code>mx1.your-host.com</code> at priority{' '}
                                <code>10</code>).
                            </li>
                        </ul>
                    </li>
                    <li>
                        <strong>Add the MX record(s)</strong> at your DNS provider for the root
                        domain. Each record needs a priority (lower = preferred) and an exchange
                        hostname.
                    </li>
                    <li>
                        <strong>Verify</strong> with the <strong>Check now</strong> button on the
                        domain&apos;s detail page. Superkabe will list every published MX record
                        with its priority directly in the DNS Authentication card.
                    </li>
                </ol>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Common Mistakes</h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                    <li>
                        <strong>No MX records at all</strong> &mdash; common for &quot;sending-only&quot;
                        domains where the user assumed they didn&apos;t need to receive. Replies,
                        bounces and unsubscribes will silently disappear, breaking the entire
                        feedback loop Superkabe relies on for healing.
                    </li>
                    <li>
                        <strong>Wrong priority order</strong> &mdash; receiving mail servers try
                        the lowest priority first, then fall back. If you publish a placeholder MX
                        at priority 1 and your real provider at priority 10, mail will be lost.
                    </li>
                    <li>
                        <strong>Mixing providers</strong> &mdash; don&apos;t mix MX hosts from
                        Google Workspace and Microsoft 365 on the same domain. Pick one and route
                        everything to it.
                    </li>
                </ul>
            </div>

            {/* ─── What Superkabe checks ─────────────────────────────────────── */}

            <h2 id="superkabe-checks" className="text-3xl font-bold mb-6 text-gray-900">
                What Superkabe Checks
            </h2>
            <p className="text-gray-600 mb-4">
                During the periodic infrastructure assessment (and whenever you click{' '}
                <strong>Check now</strong> on a domain&apos;s detail page), Superkabe verifies all
                four records:
            </p>
            <div className="bg-white border border-[#D1CBC5] overflow-hidden mb-12 rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Check</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Pass criteria</th>
                            <th className="px-6 py-3 text-gray-700 font-semibold">Impact if missing</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">SPF</td>
                            <td className="px-6 py-4 text-gray-600">
                                Valid <code>v=spf1</code> TXT record with &le;10 lookups.
                            </td>
                            <td className="px-6 py-4 text-red-600">
                                Emails may land in spam or be rejected outright.
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">DKIM</td>
                            <td className="px-6 py-4 text-gray-600">
                                Valid public key at any common selector (<code>default</code>,{' '}
                                <code>google</code>, <code>selector1</code>,{' '}
                                <code>selector2</code>).
                            </td>
                            <td className="px-6 py-4 text-red-600">
                                Emails can be spoofed; reputation damage compounds over time.
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">DMARC</td>
                            <td className="px-6 py-4 text-gray-600">
                                Valid <code>v=DMARC1</code> TXT record at{' '}
                                <code>_dmarc.</code> subdomain. <code>p=quarantine</code> or{' '}
                                <code>p=reject</code> passes; <code>p=none</code> warns.
                            </td>
                            <td className="px-6 py-4 text-red-600">
                                No policy enforcement; phishing and spoofing protections off.
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">MX</td>
                            <td className="px-6 py-4 text-gray-600">
                                At least one MX record published at the root domain.
                            </td>
                            <td className="px-6 py-4 text-red-600">
                                Domain can&apos;t receive replies, bounces or unsubscribes &mdash;
                                breaks the feedback loop Superkabe needs to heal mailboxes.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a
                        href="/docs/help/infrastructure-score-explained"
                        className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium rounded"
                    >
                        &rarr; How is the Infrastructure Score Calculated?
                    </a>
                    <a
                        href="/docs/help/entity-statuses"
                        className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium rounded"
                    >
                        &rarr; Understanding Status Labels
                    </a>
                    <a
                        href="/tools"
                        className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium rounded"
                    >
                        &rarr; Free SPF, DKIM, DMARC Lookup Tools
                    </a>
                </div>
            </div>
        </div>
    );
}

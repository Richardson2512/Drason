import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Dedicated IP | Superkabe Docs',
    description:
        'How dedicated IPs work in Superkabe — 1 IP per workspace on AWS SES, automatic warm-up, full reputation control, $39/month per IP.',
    alternates: { canonical: '/docs/dedicated-ip' },
    openGraph: {
        title: 'Dedicated IP | Superkabe Docs',
        description:
            'Dedicated IP add-on for Superkabe: isolated AWS SES IP per workspace, auto warm-up, reputation monitoring, $39/month.',
        url: '/docs/dedicated-ip',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DedicatedIpDocsPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-semibold mb-6 text-gray-900">
                Dedicated IP
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Send through your own isolated IP address. One IP per workspace, automatically warmed, $39/month.
            </p>

            {/* What it is */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 p-8 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 mt-0">What is a dedicated IP?</h2>
                <p className="text-gray-700 mb-4 text-lg">
                    A dedicated IP is an internet address used exclusively by one workspace to send email.
                    No other Superkabe customer — and no other workspace inside your account — sends from
                    it. The IP&apos;s sender reputation is shaped only by your sending behavior.
                </p>
                <p className="text-gray-600 mb-0">
                    By default, Superkabe sends through the IPs of your connected mailbox provider
                    (Gmail, Outlook, or your custom SMTP). That&apos;s a shared pool — fast to set up and
                    free, but reputation is partly out of your hands. The dedicated IP add-on routes the
                    custom-SMTP send path through an isolated AWS SES IP that&apos;s yours alone.
                </p>
            </div>

            {/* How it works in Superkabe */}
            <h2 className="text-3xl font-bold mb-8 text-gray-900 mt-12">How it works in Superkabe</h2>

            <div className="space-y-6 mb-12">
                <div className="bg-white border-l-4 border-emerald-500 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-0">1 IP, 1 workspace</h3>
                    <p className="text-gray-600 mb-0">
                        Each dedicated IP you purchase is bound to exactly one workspace. If you run
                        multiple workspaces and want each on its own IP, you purchase one add-on per
                        workspace. This keeps reputation cleanly isolated and avoids cross-workspace
                        contamination.
                    </p>
                </div>

                <div className="bg-white border-l-4 border-blue-500 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-0">Provisioned on AWS SES</h3>
                    <p className="text-gray-600 mb-0">
                        We allocate your IP from Amazon Simple Email Service&apos;s dedicated IP pool. This
                        gives you industry-standard infrastructure, automatic DKIM signing, and access
                        to AWS&apos;s deliverability stack. From your perspective it&apos;s a single line item;
                        Superkabe handles the SES configuration set, IP binding, and bounce/complaint
                        feedback loop.
                    </p>
                </div>

                <div className="bg-white border-l-4 border-purple-500 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-0">Automatic warm-up</h3>
                    <p className="text-gray-600 mb-0">
                        A fresh IP has no sending history, so mailbox providers throttle it aggressively.
                        Superkabe applies a default 4–8 week warm-up curve — starting at 50–100 sends/day
                        and ramping up weekly. The throttle is enforced at the send queue, so you can
                        plan campaigns without worrying about overshooting.
                    </p>
                </div>

                <div className="bg-white border-l-4 border-amber-500 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-0">Editable throttle (with a warning)</h3>
                    <p className="text-gray-600 mb-0">
                        You can override the default warm-up schedule from the dashboard if you have a
                        specific campaign window. We surface a confirmation modal first because raising
                        volume too quickly is the most common cause of permanent reputation damage on
                        new IPs. If you accept the warning, the new schedule applies immediately.
                    </p>
                </div>

                <div className="bg-white border-l-4 border-rose-500 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-0">Reputation monitoring + healing</h3>
                    <p className="text-gray-600 mb-0">
                        The same monitoring stack that protects your shared-pool sends runs at the IP
                        level on your dedicated IP: DNSBL scans, Gmail Postmaster Tools, Outlook SNDS,
                        and ESP-aware routing. If the IP gets listed or the reputation slips, the IP
                        enters the 5-phase healing pipeline — and Superkabe pages you immediately.
                    </p>
                </div>
            </div>

            {/* Default warm-up curve */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Default warm-up curve</h2>
            <p className="text-gray-600 mb-6">
                Superkabe&apos;s default schedule mirrors the deliverability industry consensus and what
                AWS SES&apos;s built-in auto warm-up enforces during the first 45 days:
            </p>

            <div className="overflow-x-auto mb-12">
                <table className="w-full border border-[#D1CBC5] text-sm">
                    <thead>
                        <tr className="bg-[#F7F2EB]">
                            <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Week</th>
                            <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">Daily cap</th>
                            <th className="text-left p-3 font-semibold text-gray-700 border-b border-[#D1CBC5]">What you should do</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        <tr className="border-b border-gray-100"><td className="p-3 font-medium">1–2</td><td className="p-3">50–100/day</td><td className="p-3 text-gray-600">Send to your highest-engagement segments only. Watch bounce rate stay under 2%.</td></tr>
                        <tr className="border-b border-gray-100"><td className="p-3 font-medium">3–4</td><td className="p-3">1,000–5,000/day</td><td className="p-3 text-gray-600">Begin running your normal lead lists. Validate every list before sending.</td></tr>
                        <tr className="border-b border-gray-100"><td className="p-3 font-medium">5–6</td><td className="p-3">10,000–50,000/day</td><td className="p-3 text-gray-600">Full campaign cadence. Postmaster Tools data should now be populating.</td></tr>
                        <tr><td className="p-3 font-medium">7+</td><td className="p-3">Full volume</td><td className="p-3 text-gray-600">IP is fully warm. Throttle is removed; you send up to your plan limit.</td></tr>
                    </tbody>
                </table>
            </div>

            {/* When to choose dedicated */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">When to choose dedicated</h2>
            <div className="bg-white border border-[#D1CBC5] p-6 mb-12">
                <p className="text-gray-700 mb-4">
                    A dedicated IP is the right call when at least two of these are true:
                </p>
                <ul className="space-y-2 text-gray-600 mb-0">
                    <li className="flex items-start gap-2"><span className="text-[#1C4532] mt-1">▸</span><span>You consistently send <strong>50,000+ emails per month</strong> from one workspace.</span></li>
                    <li className="flex items-start gap-2"><span className="text-[#1C4532] mt-1">▸</span><span>You operate in a regulated industry (finance, healthcare, legal) where reputation isolation is contractual.</span></li>
                    <li className="flex items-start gap-2"><span className="text-[#1C4532] mt-1">▸</span><span>You want access to <strong>Gmail Postmaster Tools</strong> and <strong>Outlook SNDS</strong> data, which require an IP you control.</span></li>
                    <li className="flex items-start gap-2"><span className="text-[#1C4532] mt-1">▸</span><span>You&apos;ve been burned by a shared pool before and want a clean restart on infrastructure you fully own.</span></li>
                </ul>
            </div>

            <p className="text-gray-600 mb-12">
                If none of those apply, the default shared-pool send path is almost always better. Most
                teams sending under 50K/month see no deliverability gain from a dedicated IP and pay
                $39/month for psychological comfort. We&apos;ll happily tell you when you don&apos;t need it.
            </p>

            {/* Pricing */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Pricing</h2>
            <div className="bg-gradient-to-br from-[#1C4532] to-[#143325] text-white p-8 mb-12">
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-bold tracking-tight">$39</span>
                    <span className="text-emerald-100/75">/ month per IP</span>
                </div>
                <p className="text-emerald-50/85 mb-4">
                    Add-on, billed monthly. Stacks on top of any plan (Starter, Pro, Growth, Scale, or
                    Enterprise). No setup fee. Cancel anytime — the IP is reclaimed at the end of the
                    billing period.
                </p>
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-[#1C4532] text-sm font-semibold hover:bg-emerald-50 transition-colors no-underline"
                >
                    See pricing
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            {/* FAQ */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">FAQ</h2>

            <div className="space-y-4 mb-12">
                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">Does a dedicated IP work with Gmail / Outlook OAuth mailboxes?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        No. OAuth-connected Gmail and Microsoft mailboxes always send through Google&apos;s
                        and Microsoft&apos;s own IPs — that&apos;s a fundamental property of OAuth-based
                        sending and no platform can change it. Dedicated IPs only apply to the
                        custom-SMTP send path. If your workspace is OAuth-only, a dedicated IP is not
                        useful for you.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">How long does provisioning take?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        After purchase, the IP is allocated from AWS SES typically within 2–10 minutes.
                        It then enters the warm-up phase immediately. You&apos;ll see it in your dashboard
                        with status <strong>Warming</strong> and a real-time progress bar showing the
                        current daily cap.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">What happens if my IP gets blacklisted?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        The same way any other piece of your infrastructure is treated: the IP is moved
                        through the 5-phase healing pipeline. We pause sending, run DNS and reputation
                        checks, validate against major DNSBLs, then graduate the IP back to active state
                        once it&apos;s clean. You&apos;re notified at every transition.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">Can I assign one IP to multiple workspaces?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        No. The whole point of a dedicated IP is reputation isolation — sharing one
                        across workspaces defeats that. If you have three workspaces that each need
                        dedicated IPs, you purchase three add-ons.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">Can I edit the warm-up throttle?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        Yes, but you&apos;ll see a warning modal first. Raising the daily cap faster than
                        the recommended curve is the single most common cause of permanent IP burn —
                        we surface the warning so you confirm intent. If your campaign timing requires
                        a faster ramp, you can override.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">What if I cancel?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        Cancellation is effective at the end of the current billing period. The IP
                        is returned to AWS SES&apos;s pool and the workspace falls back to the shared
                        send path. Your sending history on that IP is gone — if you re-purchase later,
                        you&apos;ll get a fresh IP that needs warming again.
                    </p>
                </details>
            </div>

            {/* Related */}
            <div className="border-t border-[#D1CBC5] pt-8 mt-12">
                <p className="text-sm text-gray-500 mb-3">Related</p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/docs/help/dedicated-ip" className="text-sm font-semibold text-[#1C4532] hover:underline">Dedicated IP setup guide →</Link>
                    <Link href="/docs/warmup-recovery" className="text-sm font-semibold text-[#1C4532] hover:underline">Warmup &amp; recovery →</Link>
                    <Link href="/docs/help/auto-healing" className="text-sm font-semibold text-[#1C4532] hover:underline">5-phase healing pipeline →</Link>
                    <Link href="/blog/dedicated-ip-cold-email" className="text-sm font-semibold text-[#1C4532] hover:underline">Blog: Dedicated vs shared IP →</Link>
                </div>
            </div>
        </div>
    );
}

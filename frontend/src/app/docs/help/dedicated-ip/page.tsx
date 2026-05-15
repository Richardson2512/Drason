import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Dedicated IP Setup Guide | Superkabe Help',
    description:
        'Step-by-step guide to purchasing, assigning, warming, and managing a dedicated IP in Superkabe.',
    alternates: { canonical: '/docs/help/dedicated-ip' },
    openGraph: {
        title: 'Dedicated IP Setup Guide | Superkabe Help',
        description:
            'How to buy a dedicated IP, assign it to a workspace, manage the warm-up curve, and respond to reputation alerts.',
        url: '/docs/help/dedicated-ip',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DedicatedIpHelpPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Dedicated IP Setup Guide</h1>
            <p className="text-xl text-gray-500 mb-12">
                Buy, assign, warm, and manage a dedicated IP from the Superkabe dashboard.
            </p>

            {/* Before you start */}
            <div className="bg-amber-50 border-2 border-amber-200 p-6 mb-12">
                <h2 className="text-xl font-bold mb-3 text-amber-900 mt-0">Before you start</h2>
                <ul className="space-y-2 text-amber-900 mb-0">
                    <li className="flex items-start gap-2"><span className="text-amber-600 mt-1">▸</span><span>Dedicated IPs only apply to <strong>custom-SMTP sends</strong>. Gmail and Outlook OAuth mailboxes always send through the provider&apos;s own IPs.</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-600 mt-1">▸</span><span>You need an <strong>active subscription</strong> on any plan (Starter and up). The dedicated IP is an add-on, not a replacement.</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-600 mt-1">▸</span><span>The IP needs <strong>4–8 weeks of warm-up</strong> before it reaches full sending volume. Plan accordingly.</span></li>
                </ul>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Step 1 - Purchase the add-on</h2>
            <div className="space-y-4 mb-8">
                <div className="bg-white border border-[#D1CBC5] p-5">
                    <p className="text-gray-700 mb-3">Open the dashboard and navigate to:</p>
                    <code className="block bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 mb-3">
                        Settings → Billing → Add-ons
                    </code>
                    <p className="text-gray-600 mb-0">
                        Click <strong>Add a dedicated IP</strong>. You&apos;ll be redirected to the
                        billing portal to confirm the $39/month charge. After payment, the IP is
                        provisioned on AWS SES - typically within 2–10 minutes.
                    </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
                    <strong>Tip:</strong> Buying multiple IPs at once? Each IP is a separate
                    subscription line, so you can cancel one without affecting the others.
                </div>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Step 2 - Assign it to a workspace</h2>
            <p className="text-gray-700 mb-4">
                A dedicated IP isn&apos;t doing anything until you bind it to a workspace. The
                cardinality is strict: <strong>1 IP : 1 workspace</strong>.
            </p>
            <div className="space-y-4 mb-8">
                <div className="bg-white border border-[#D1CBC5] p-5">
                    <p className="text-gray-700 mb-3">From the dashboard:</p>
                    <ol className="space-y-2 text-gray-600 mb-0 list-decimal pl-5">
                        <li>Go to <strong>Settings → Dedicated IPs</strong>.</li>
                        <li>Find the IP with status <em>Available</em> (just-provisioned or unassigned).</li>
                        <li>Click <strong>Assign</strong> and pick the target workspace.</li>
                        <li>Confirm. The workspace&apos;s custom-SMTP sends are now routed through the IP.</li>
                    </ol>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                    <strong>Heads up:</strong> Reassigning an IP to a different workspace is allowed,
                    but the new workspace inherits the IP&apos;s warm-up state. The reputation history
                    travels with the IP, not the workspace.
                </div>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Step 3 - Warm up the IP</h2>
            <p className="text-gray-700 mb-4">
                Superkabe sets the throttle automatically. You don&apos;t have to do anything for the
                default schedule to run.
            </p>

            <div className="bg-white border border-[#D1CBC5] p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 mt-0">The default curve</h3>
                <ul className="space-y-2 text-gray-600 mb-0">
                    <li><strong>Week 1–2:</strong> 50–100 sends/day</li>
                    <li><strong>Week 3–4:</strong> 1,000–5,000 sends/day</li>
                    <li><strong>Week 5–6:</strong> 10,000–50,000 sends/day</li>
                    <li><strong>Week 7+:</strong> Full volume (up to your plan&apos;s monthly cap)</li>
                </ul>
            </div>

            <p className="text-gray-700 mb-4">
                The send queue enforces this cap automatically. If your campaigns try to send more
                than the daily limit, the excess is queued for the next day rather than blasting and
                burning the IP.
            </p>

            {/* Editing throttle */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 mt-10">Editing the throttle</h3>
            <p className="text-gray-700 mb-4">
                If your campaign timing requires a faster ramp, you can override the schedule:
            </p>
            <div className="bg-white border border-[#D1CBC5] p-5 mb-6">
                <ol className="space-y-2 text-gray-600 mb-0 list-decimal pl-5">
                    <li>Open the IP&apos;s detail page in <strong>Settings → Dedicated IPs</strong>.</li>
                    <li>Click <strong>Edit warm-up schedule</strong>.</li>
                    <li>Adjust the daily cap for any week.</li>
                    <li>Click <strong>Save</strong>. A warning modal appears.</li>
                    <li>Read the warning. Confirm only if you&apos;ve thought it through.</li>
                </ol>
            </div>
            <div className="bg-rose-50 border-2 border-rose-200 p-6 mb-12">
                <h4 className="text-base font-bold mb-2 text-rose-900 mt-0">Why the warning?</h4>
                <p className="text-rose-900 mb-0">
                    Aggressive ramps are the single most common cause of permanent IP burn. Mailbox
                    providers see &quot;new IP, sudden volume&quot; as a textbook spam signal and flag it
                    in days - and that flag can stick for months. The warning isn&apos;t bureaucratic;
                    it&apos;s the most expensive lesson in deliverability, given to you for free.
                </p>
            </div>

            {/* Step 4 */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Step 4 - Monitor reputation</h2>
            <p className="text-gray-700 mb-6">
                Once the IP is warming, monitoring runs automatically. You see the data in two
                places:
            </p>
            <div className="space-y-4 mb-12">
                <div className="bg-white border border-[#D1CBC5] p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 mt-0">In the dashboard</h3>
                    <ul className="space-y-1 text-gray-600 mb-0">
                        <li>• Current daily cap and how much of it&apos;s been used</li>
                        <li>• Bounce rate, complaint rate (24h, 7d)</li>
                        <li>• DNSBL status across the major lists</li>
                        <li>• Postmaster Tools / SNDS reputation tier (once data populates)</li>
                    </ul>
                </div>
                <div className="bg-white border border-[#D1CBC5] p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 mt-0">In your alerts inbox</h3>
                    <p className="text-gray-600 mb-0">
                        You&apos;re paged automatically (Slack, email, or webhook - whatever you&apos;ve
                        configured) when the IP is listed on a DNSBL, complaint rate breaches 0.1%,
                        bounce rate breaches 2%, or the IP enters the healing pipeline.
                    </p>
                </div>
            </div>

            {/* Step 5 */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Step 5 - Respond to alerts</h2>
            <p className="text-gray-700 mb-4">
                If the IP gets flagged, Superkabe takes the first action automatically: sends pause,
                the IP enters Phase 1 of healing. You then have two choices:
            </p>
            <div className="space-y-4 mb-12">
                <div className="bg-white border-l-4 border-emerald-500 p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 mt-0">Let auto-healing run</h3>
                    <p className="text-gray-600 mb-0">
                        Recommended for most cases. The 5-phase pipeline cools the IP, validates DNS,
                        re-tests reputation, and graduates it back to active when it&apos;s clean. No
                        manual work needed.
                    </p>
                </div>
                <div className="bg-white border-l-4 border-amber-500 p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 mt-0">Investigate manually</h3>
                    <p className="text-gray-600 mb-0">
                        If the cause is obvious (a bad list import, a misconfigured campaign), pause
                        the offending campaign first, then let healing finish. Removing the cause
                        speeds graduation.
                    </p>
                </div>
            </div>

            {/* Common situations */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Common situations</h2>

            <div className="space-y-4 mb-12">
                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">My IP is &quot;Warming&quot; but campaigns aren&apos;t sending fast enough.</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        That&apos;s the throttle working as intended. During warm-up, the daily cap is
                        below your full plan limit. The send queue holds excess sends for the next
                        day. If you genuinely need faster ramp, edit the schedule - but read the
                        warning first.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">I bought an IP but didn&apos;t assign a workspace yet. Am I being charged?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        Yes. The IP is provisioned and reserved as soon as you purchase, regardless
                        of assignment. If you don&apos;t plan to use it within a week, cancel and
                        re-purchase later - the warm-up state will reset anyway.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">Can I move my IP to a new workspace mid-warm-up?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        Yes. The warm-up state is tracked at the IP level, so reassigning doesn&apos;t
                        reset the curve - the new workspace continues from wherever the IP left off.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">I want a dedicated IP across all my workspaces. Cheapest path?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        One IP per workspace is the rule, so the cheapest answer is one $39/mo
                        subscription per workspace. If you have 5 workspaces and only 2 actually
                        need isolation, only buy 2 IPs - the other 3 use the shared pool.
                    </p>
                </details>

                <details className="bg-white border border-[#D1CBC5] p-5 group">
                    <summary className="font-semibold text-gray-900 cursor-pointer">My IP got blacklisted. What now?</summary>
                    <p className="text-gray-600 mt-3 mb-0">
                        Auto-healing runs on it. You&apos;ll see status transitions in the dashboard:
                        PAUSED → QUARANTINE → WARM_RECOVERY → ACTIVE. The pipeline includes a delist
                        request to the major DNSBLs. If the listing is severe (e.g., Spamhaus SBL),
                        we&apos;ll surface a manual remediation playbook.
                    </p>
                </details>
            </div>

            {/* Related */}
            <div className="border-t border-[#D1CBC5] pt-8 mt-12">
                <p className="text-sm text-gray-500 mb-3">Related</p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/docs/dedicated-ip" className="text-sm font-semibold text-[#1C4532] hover:underline">Dedicated IP - overview →</Link>
                    <Link href="/docs/help/auto-healing" className="text-sm font-semibold text-[#1C4532] hover:underline">5-phase healing pipeline →</Link>
                    <Link href="/docs/help/billing" className="text-sm font-semibold text-[#1C4532] hover:underline">Billing &amp; add-ons →</Link>
                    <Link href="/blog/dedicated-ip-cold-email" className="text-sm font-semibold text-[#1C4532] hover:underline">Blog: Dedicated vs shared →</Link>
                </div>
            </div>
        </div>
    );
}

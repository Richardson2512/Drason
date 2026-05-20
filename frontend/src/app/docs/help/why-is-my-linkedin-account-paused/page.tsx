import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { FaqJsonLd } from '@/components/seo/FaqSection';

const PAGE_URL = 'https://www.superkabe.com/docs/help/why-is-my-linkedin-account-paused';
const SUPER_LINKEDIN_ID = 'https://www.superkabe.com/#feature-super-linkedin';

const faqItems = [
    { q: 'Why did Super LinkedIn pause my LinkedIn account?',
      a: 'Five common reasons: (1) daily cap breach attempt blocked by the supervisor, (2) captcha challenge from LinkedIn requiring manual resolution, (3) Unipile session disconnected because the LinkedIn password rotated or MFA changed, (4) defensive friction from LinkedIn flagging the account for unusual activity, (5) operator-initiated pause from the dashboard. The Super LinkedIn dashboard shows the specific reason and the remediation step.' },
    { q: 'How do I resolve a captcha challenge?',
      a: 'Log into LinkedIn manually from your usual browser. Complete the captcha. Wait 30 minutes for LinkedIn to settle. In the Super LinkedIn dashboard, click Resume connection - Unipile reconnects the session. The supervisor then waits 24 hours before resuming outbound activity to avoid triggering a second captcha. Cap escalation timers do not reset, but the captcha-free counter for cap escalation does (see sending-caps article).' },
    { q: 'My Unipile session disconnected - what now?',
      a: 'Dashboard - Super LinkedIn - Connection - Reconnect. Re-authenticate via Unipile; if your LinkedIn password rotated, sign in with the new credentials. Existing campaign state, agent configuration, and ICP definition are preserved. Outbound resumes within minutes of reconnection. Disconnected events are logged - if they happen repeatedly, the dashboard surfaces a stability warning.' },
    { q: 'Is a pause the same as a LinkedIn account restriction?',
      a: 'No. A Super LinkedIn pause is a platform-side stop - the supervisor halts outbound activity but your LinkedIn account is fully operational. A LinkedIn account restriction is enforced by LinkedIn itself (temporary login lock, request-to-verify-identity, or in rare cases permanent restriction). LinkedIn restrictions are visible when you log into linkedin.com directly; Super LinkedIn pauses are visible only in the Super LinkedIn dashboard.' },
    { q: 'Can I resume outbound on a paused account?',
      a: 'Yes, once the underlying cause is resolved. Dashboard - Super LinkedIn - Resume. The supervisor performs a health check (Unipile session, recent captcha events, cap headroom) before resuming. If any blocker remains, the resume is blocked with the specific reason. Forced resume is available but not recommended - it usually leads to a second pause within 24 hours.' },
];

export const metadata: Metadata = {
    title: 'Why Is My LinkedIn Account Paused? | Superkabe Help',
    description: 'Reasons Super LinkedIn pauses a connected LinkedIn account - cap breaches, captcha challenges, login-disconnected, and how to resume safely.',
    alternates: { canonical: '/docs/help/why-is-my-linkedin-account-paused' },
    openGraph: {
        title: 'Why Is My LinkedIn Account Paused? | Superkabe Help',
        description: 'Common reasons Super LinkedIn pauses a LinkedIn account and how to resume safely.',
        url: '/docs/help/why-is-my-linkedin-account-paused',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function WhyIsMyLinkedInAccountPausedHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Why is my LinkedIn account paused?"
                description="Reasons Super LinkedIn pauses a connected LinkedIn account - cap breaches, captcha challenges, login-disconnected, and how to resume safely."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Beginner"
                mentions={[SUPER_LINKEDIN_ID]}
            />
            <FaqJsonLd items={faqItems} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Why is my LinkedIn account paused?</h1>
            <p className="text-xl text-gray-500 mb-12">
                Five common reasons Super LinkedIn pauses an account, and the resume path for each.
            </p>

            <QuickAnswer
                question="Why does Super LinkedIn pause a LinkedIn account?"
                answer="Five reasons: (1) daily-cap breach the supervisor blocked, (2) LinkedIn captcha challenge, (3) Unipile session disconnect (password rotation or MFA change), (4) LinkedIn defensive friction flagging unusual activity, (5) operator-initiated pause. The dashboard shows the specific reason; resume from the dashboard once the underlying cause is resolved."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The 5 pause reasons</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Daily cap breach</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                A campaign tried to send beyond the configured daily cap. The supervisor blocks the overage and pauses the campaign (not the account itself) until the next day. To increase the cap, see the <Link href="/docs/help/super-linkedin-sending-caps" className="text-blue-600 hover:underline">sending caps</Link> article. To rebalance capacity across multiple campaigns, adjust priority weights in Dashboard - Super LinkedIn - Campaigns.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Captcha challenge</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                LinkedIn served a captcha during an automated action. The supervisor pauses immediately to avoid further provocation. <strong>Resolution:</strong> log into linkedin.com from your usual browser, complete the captcha, wait 30 minutes, then click Resume in the Super LinkedIn dashboard. The cap-escalation captcha-free counter resets.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Unipile session disconnected</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Unipile lost the LinkedIn session - typically caused by a password rotation, MFA change, or LinkedIn forcing re-authentication. <strong>Resolution:</strong> Dashboard - Super LinkedIn - Connection - Reconnect. Re-authenticate via Unipile. Existing state is preserved.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. LinkedIn defensive friction</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                LinkedIn flagged the account for unusual activity (sudden volume spike, rapid IP changes, suspicious browser fingerprint). The supervisor pauses to prevent escalation to a full LinkedIn restriction. <strong>Resolution:</strong> wait 48 hours, then resume with reduced caps for the next 7 days. If the issue persists, contact <Link href="/contact" className="text-blue-600 hover:underline">support</Link> - we have remediation playbooks per friction class.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">5. Operator-initiated pause</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Someone in the workspace paused the account from the dashboard. <strong>Resolution:</strong> click Resume. The supervisor performs a health check before allowing outbound to restart.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Frequently asked questions</h2>
            <div className="space-y-4 mb-12">
                {faqItems.map((item, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><Link href="/docs/help/super-linkedin-sending-caps" className="text-blue-600 hover:underline">Daily sending caps</Link></li>
                <li><Link href="/docs/help/super-linkedin-agent-stack" className="text-blue-600 hover:underline">The 4-agent supervisor stack</Link></li>
                <li><Link href="/docs/integrations/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn setup guide</Link></li>
                <li><Link href="/docs/help/campaign-paused" className="text-blue-600 hover:underline">Email campaign paused (equivalent for the Sequencer)</Link></li>
            </ul>
        </div>
    );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { FaqJsonLd } from '@/components/seo/FaqSection';

const PAGE_URL = 'https://www.superkabe.com/docs/help/super-linkedin-sending-caps';
const SUPER_LINKEDIN_ID = 'https://www.superkabe.com/#feature-super-linkedin';

const faqItems = [
    { q: 'What are the default daily caps for a new LinkedIn account?',
      a: 'Connection requests: 30/day for the first 30 days, ramping to 100/day after. 1st-degree messages: 100/day for days 0-30, 200/day after. InMails (premium accounts only): 25/day for days 0-30, 50/day after. Profile views (signal warmup): 200/day initially, 500/day after the 30-day ramp. The supervisor enforces these caps at the planning layer so campaigns cannot accidentally overshoot.' },
    { q: 'Can I raise the caps faster than the 30-day default ramp?',
      a: 'Yes, for accounts with established LinkedIn history. Dashboard - Super LinkedIn - Settings - Sending caps - Custom ramp. The supervisor still enforces the configured cap; setting it too aggressively risks LinkedIn defensive friction (captcha challenges, temporary login restrictions). Recommended only if the account has 12+ months of clean activity and 500+ existing connections.' },
    { q: 'What triggers cap escalation from the day 0-30 tier to the day 30+ tier?',
      a: 'Three signals must all hold for 30 consecutive days: zero captcha challenges, zero login-disconnected events, and a reply rate above 8% on connection requests. If any signal trips during the ramp, the cap pauses at its current level until the signal clears for 7 days, then resumes the ramp. The supervisor surfaces a banner with the specific signal that paused the escalation.' },
    { q: 'How does the supervisor split capacity across multiple campaigns?',
      a: 'By priority weight. Each campaign has a weight 1-10 (default 5). The supervisor allocates daily capacity proportional to weight - a campaign with weight 10 gets twice the capacity of a campaign with weight 5. Within a priority tier, allocation is round-robin. The supervisor also reserves 10% headroom for reply-driven follow-ups so in-flight conversations always have budget.' },
    { q: 'What happens when daily capacity is exhausted?',
      a: 'Overflow rolls to the next day. The supervisor surfaces a "capacity-exhausted" event in the dashboard with the specific cap that ran out. If overflow happens 3+ days in a row, the supervisor flags the campaign as over-targeted and suggests narrowing the ICP definition or splitting into multiple campaigns.' },
];

export const metadata: Metadata = {
    title: 'Super LinkedIn Sending Caps | Superkabe Help',
    description: 'Daily caps for LinkedIn connections, 1st-degree messages, InMails, and profile views. The 0-30 day ramp, the 30+ day caps, and what triggers escalation.',
    alternates: { canonical: '/docs/help/super-linkedin-sending-caps' },
    openGraph: {
        title: 'Super LinkedIn Sending Caps | Superkabe Help',
        description: 'Daily caps for LinkedIn connections, messages, InMails, and profile views with the 0-30 day ramp.',
        url: '/docs/help/super-linkedin-sending-caps',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SuperLinkedInSendingCapsHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Super LinkedIn sending caps"
                description="Daily caps for LinkedIn connections, 1st-degree messages, InMails, and profile views. The 0-30 day ramp, the 30+ day caps, and what triggers escalation."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Beginner"
                mentions={[SUPER_LINKEDIN_ID]}
            />
            <FaqJsonLd items={faqItems} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Super LinkedIn sending caps</h1>
            <p className="text-xl text-gray-500 mb-12">
                The daily cap table, the 0-30 day ramp, and how the supervisor allocates capacity across campaigns.
            </p>

            <QuickAnswer
                question="What are the default Super LinkedIn daily caps?"
                answer="HeyReach-class. 30 connection requests/day in the first 30 days, ramping to 100/day after; 100-to-200 messages/day to 1st-degree connections; 25-to-50 InMails/day for premium accounts; 200-to-500 profile views/day. The supervisor enforces caps at the planning layer so campaigns cannot accidentally overshoot."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The cap table</h2>
            <div className="overflow-x-auto mb-8 not-prose">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Action</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Day 0-30</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Day 30+ (clean signal)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">Connection requests</td><td className="py-3 px-4 text-gray-600">30/day</td><td className="py-3 px-4 text-gray-600">100/day</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">1st-degree messages</td><td className="py-3 px-4 text-gray-600">100/day</td><td className="py-3 px-4 text-gray-600">200/day</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">InMails (premium accounts)</td><td className="py-3 px-4 text-gray-600">25/day</td><td className="py-3 px-4 text-gray-600">50/day</td></tr>
                        <tr><td className="py-3 px-4 font-semibold text-gray-800">Profile views (signal warmup)</td><td className="py-3 px-4 text-gray-600">200/day</td><td className="py-3 px-4 text-gray-600">500/day</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Three signals must hold for cap escalation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                The supervisor only escalates from day-0-30 caps to day-30+ caps when all three of these hold continuously for 30 days:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>Zero captcha challenges.</strong> Any captcha resets the 30-day counter.</li>
                <li><strong>Zero login-disconnected events.</strong> Unipile holding a stable session.</li>
                <li><strong>Reply rate &gt;8% on connection requests.</strong> Signals that targeting is well-calibrated.</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mb-6">
                If any signal trips during the ramp, the cap pauses at its current level until the signal clears for 7 days, then resumes. The supervisor surfaces a banner with the specific signal that paused the escalation.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Capacity allocation across campaigns</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                Each campaign has a priority weight 1-10 (default 5). The supervisor allocates daily capacity proportional to weight. A weight-10 campaign receives twice the capacity of a weight-5 campaign. Within a priority tier, allocation is round-robin. The supervisor reserves 10% headroom for reply-driven follow-ups so in-flight conversations always have budget.
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
                <li><Link href="/docs/help/super-linkedin-agent-stack" className="text-blue-600 hover:underline">The 4-agent supervisor stack</Link></li>
                <li><Link href="/docs/help/why-is-my-linkedin-account-paused" className="text-blue-600 hover:underline">Why is my LinkedIn account paused?</Link></li>
                <li><Link href="/docs/integrations/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn setup guide</Link></li>
            </ul>
        </div>
    );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { ItemListJsonLd } from '@/components/seo/ExtraSchema';

const PAGE_URL = 'https://www.superkabe.com/docs/help/dedicated-ip-warmup-curve';
const DEDICATED_IP_ID = 'https://www.superkabe.com/#feature-dedicated-ip';

export const metadata: Metadata = {
    title: 'Dedicated IP Warm-Up Curve | Superkabe Help',
    description: 'What the 4-8 week dedicated IP warm-up actually looks like, week by week. Daily volume ramp, what to send, and adaptive throttling on bounce signals.',
    alternates: { canonical: '/docs/help/dedicated-ip-warmup-curve' },
    openGraph: {
        title: 'Dedicated IP Warm-Up Curve | Superkabe Help',
        description: 'Week-by-week dedicated IP warm-up curve with daily volumes and adaptive throttling.',
        url: '/docs/help/dedicated-ip-warmup-curve',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function DedicatedIpWarmupCurveHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Dedicated IP warm-up curve"
                description="What the 4-8 week dedicated IP warm-up actually looks like, week by week. Daily volume ramp, what to send, and adaptive throttling on bounce signals."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Intermediate"
                mentions={[DEDICATED_IP_ID]}
            />
            <ItemListJsonLd data={{
                name: 'Dedicated IP warm-up phases',
                description: 'Week-by-week dedicated IP warm-up volume schedule from week 1 to week 8.',
                items: [
                    { name: 'Week 1: 50-100 sends/day to engaged recipients' },
                    { name: 'Week 2: 200-400 sends/day' },
                    { name: 'Week 3: 500-1,000 sends/day' },
                    { name: 'Week 4: 1,000-2,500 sends/day' },
                    { name: 'Weeks 5-6: 2,500-5,000 sends/day' },
                    { name: 'Weeks 7-8: 5,000-10,000+ sends/day (full capacity)' },
                ],
            }} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Dedicated IP warm-up curve</h1>
            <p className="text-xl text-gray-500 mb-12">
                The 4-8 week ramp, week by week. Volume targets, what to send, and how adaptive throttling works.
            </p>

            <QuickAnswer
                question="What does a dedicated IP warm-up curve look like?"
                answer="50-100 sends/day in week 1, ramping to 200-400 in week 2, 500-1,000 in week 3, 1,000-2,500 in week 4. Weeks 5-6 land at 2,500-5,000 sends/day. Full capacity (5,000-10,000+ sends/day) is reached at week 7-8. Throughout the curve, Superkabe enforces the cap at the send queue and adapts down if bounces or complaints exceed thresholds."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Why warm-up matters for a dedicated IP</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                A fresh dedicated IP has no sending history. Receiving mailbox providers (Gmail, Microsoft, Yahoo) throttle unknown IPs aggressively - small volume, frequent deferrals, occasional outright rejections. Sending full production volume on day 1 burns the IP before it can establish trust. The warm-up curve builds reputation gradually so the IP graduates into full capacity with a clean sending history.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Week-by-week schedule</h2>
            <div className="overflow-x-auto mb-8 not-prose">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Week</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Daily volume</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">What to prioritize</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">1</td><td className="py-3 px-4 text-gray-600">50-100/day</td><td className="py-3 px-4 text-gray-600">High-engagement segment (recent openers/clickers)</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">2</td><td className="py-3 px-4 text-gray-600">200-400/day</td><td className="py-3 px-4 text-gray-600">Expand to engaged + validated cold leads</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">3</td><td className="py-3 px-4 text-gray-600">500-1,000/day</td><td className="py-3 px-4 text-gray-600">Full validated cold lists, conservative on catch-all</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">4</td><td className="py-3 px-4 text-gray-600">1,000-2,500/day</td><td className="py-3 px-4 text-gray-600">Standard mix - validated cold + warm follow-ups</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-3 px-4 font-semibold text-gray-800">5-6</td><td className="py-3 px-4 text-gray-600">2,500-5,000/day</td><td className="py-3 px-4 text-gray-600">Full production volume on validated lists</td></tr>
                        <tr><td className="py-3 px-4 font-semibold text-gray-800">7-8</td><td className="py-3 px-4 text-gray-600">5,000-10,000+/day</td><td className="py-3 px-4 text-gray-600">Full capacity, cap configurable in dashboard</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Adaptive throttling</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                The curve is a default, not a fixed schedule. Superkabe&apos;s send queue monitors bounce rate, complaint rate, and deferral rate on the IP continuously. If signals exceed thresholds during a given week:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>Bounce rate over 2% on the IP&apos;s 24-hour window</strong> - the supervisor freezes the ramp at the current week&apos;s volume until bounce rate clears for 48 hours.</li>
                <li><strong>Complaint rate over 0.1% on the IP&apos;s 24-hour window</strong> - the supervisor reduces volume to the previous week&apos;s level and pages the operator.</li>
                <li><strong>Deferral rate spike &gt;3x baseline</strong> - the supervisor temporarily drops volume by 50% for 24 hours, then re-evaluates.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
                Conversely, if signals are clean ahead of schedule, the supervisor can accelerate the ramp by one week. The fastest documented dedicated IP warm-up under this regime was 28 days from allocation to full capacity.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What to send during warm-up</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
                <li><strong>Engaged segment first.</strong> Week 1 prioritizes recipients who have opened or clicked in the last 30 days. They are most likely to engage positively, building the IP&apos;s reputation fastest.</li>
                <li><strong>Validate every lead.</strong> Even one bounce-heavy day during week 1 can set the curve back. Run all leads through the validation gate before sending.</li>
                <li><strong>Skip catch-all leads until week 3.</strong> Catch-all addresses are unpredictable; saving them for after the IP has built initial reputation softens the blow if they bounce.</li>
                <li><strong>Mix transactional traffic if available.</strong> Transactional emails (receipts, confirmations) carry very high engagement and accelerate reputation building. Route some of this traffic through the dedicated IP during weeks 1-3 if you can.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><Link href="/product/dedicated-ip" className="text-blue-600 hover:underline">Dedicated IP product page</Link></li>
                <li><Link href="/docs/help/dedicated-ip" className="text-blue-600 hover:underline">Dedicated IP setup guide</Link></li>
                <li><Link href="/docs/help/when-do-i-need-a-dedicated-ip" className="text-blue-600 hover:underline">When do I need a dedicated IP?</Link></li>
                <li><Link href="/blog/dedicated-ip-cold-email" className="text-blue-600 hover:underline">Dedicated IP vs shared IP - decision framework</Link></li>
            </ul>
        </div>
    );
}

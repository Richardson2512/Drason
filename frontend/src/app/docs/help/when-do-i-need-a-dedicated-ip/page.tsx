import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { FaqJsonLd } from '@/components/seo/FaqSection';

const PAGE_URL = 'https://www.superkabe.com/docs/help/when-do-i-need-a-dedicated-ip';
const DEDICATED_IP_ID = 'https://www.superkabe.com/#feature-dedicated-ip';

const faqItems = [
    { q: 'At what sending volume does a dedicated IP make sense?',
      a: 'Around 50,000 emails per month from a single workspace is the practical inflection. Below that, the shared pool gives you cleaner reputation faster (because it amortizes warmup across the pool). Above that, the dedicated IP recovers faster from co-tenant incidents and produces predictable behavior at scale.' },
    { q: 'Does a dedicated IP guarantee better deliverability?',
      a: 'No. A dedicated IP gives you reputation control and isolation; whether the resulting reputation is good depends entirely on what you send. The protection layer (auto-pause, healing, ESP routing), a clean lead funnel, the warm-up curve, and continuous monitoring together produce good deliverability. The IP is one input among many.' },
    { q: 'Should regulated industries always use a dedicated IP?',
      a: 'Often yes. Healthcare, financial services, and legal frequently require audit-grade reputation isolation as a compliance requirement - the shared pool cannot guarantee that another tenant is not running content that could splash onto your sends. If your compliance team asks for isolation, a dedicated IP is the simplest answer.' },
    { q: 'Should agencies use one dedicated IP per client?',
      a: 'It depends on client expectations. For clients who explicitly request IP-level isolation (often as a contract term), yes - one IP per client workspace, billed back as a line item. For clients who do not specify, the shared pool is usually fine and avoids the warm-up overhead of provisioning a new IP for each onboarding.' },
    { q: 'What if I am already on the shared pool and want to switch?',
      a: 'Purchase the dedicated IP add-on; AWS SES provisions within hours. The custom-SMTP send path routes through the new IP automatically; existing campaigns continue without interruption. The dedicated IP enters the 4-8 week warm-up curve from day 1; during the curve, additional traffic stays on the shared pool. Once the IP graduates, all custom-SMTP traffic moves over.' },
];

export const metadata: Metadata = {
    title: 'When Do I Need a Dedicated IP? | Superkabe Help',
    description: 'A decision framework for adding a dedicated IP. Volume thresholds, regulated industries, agency multi-tenancy, and when shared pool is the right answer.',
    alternates: { canonical: '/docs/help/when-do-i-need-a-dedicated-ip' },
    openGraph: {
        title: 'When Do I Need a Dedicated IP? | Superkabe Help',
        description: 'Decision framework: volume, regulation, agency multi-tenancy, and when shared pool is right.',
        url: '/docs/help/when-do-i-need-a-dedicated-ip',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function WhenDoINeedADedicatedIpHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="When do I need a dedicated IP?"
                description="A decision framework for adding a dedicated IP. Volume thresholds, regulated industries, agency multi-tenancy, and when shared pool is the right answer."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Beginner"
                mentions={[DEDICATED_IP_ID]}
            />
            <FaqJsonLd items={faqItems} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">When do I need a dedicated IP?</h1>
            <p className="text-xl text-gray-500 mb-12">
                Four signals tell you to upgrade. Anything less and the shared pool is the right answer.
            </p>

            <QuickAnswer
                question="Should I get a dedicated IP?"
                answer="Yes if any of these apply: sending volume above ~50K emails/month from one workspace, regulated industry requiring audit-grade reputation isolation, agency client who contractually requires per-tenant IP separation, or recent burn from a co-tenant incident on the shared pool. Otherwise the shared pool is cleaner and cheaper."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The 4 signals</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Volume above ~50K/month</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
                At this scale, the dedicated IP&apos;s reputation curve recovers faster than the shared pool can isolate you from co-tenant noise. Below 50K/month, the shared pool amortizes warm-up across many senders and delivers cleaner reputation faster.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Regulated industry</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
                Healthcare (HIPAA-adjacent), financial services (FINRA, SOX-adjacent), and legal frequently require audit-grade reputation isolation. If your compliance team is asking for it, a dedicated IP is the cleanest answer - separate auditable artifact, separate reputation history, separate incident surface.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Agency client contract requirement</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
                Some agency clients explicitly require IP-level isolation as a contract term. Provision one dedicated IP per client workspace, bill back the $39/month as a line item. Audit trail: dashboard shows IP assignment per workspace; billing shows IP cost per workspace.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Recent burn from a co-tenant incident</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
                A shared pool gives every tenant the same upside (amortized reputation, faster warm-up) but also the same downside (a co-tenant&apos;s incident splashes onto your sends). If you have been bitten once and the operational cost of investigating + waiting it out exceeded $39/month, the dedicated IP pays for itself the day you provision it.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">When shared pool is still the right answer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>Under 25K sends/month.</strong> The shared pool produces cleaner reputation faster at low volume.</li>
                <li><strong>OAuth-only mailbox stack.</strong> Gmail / Microsoft 365 OAuth mailboxes always send through their provider&apos;s IPs - a dedicated AWS SES IP does not apply to them.</li>
                <li><strong>You have not exhausted the protection layer.</strong> Auto-pause, healing, ESP-aware routing already buy you most of the deliverability resilience a dedicated IP would add. Try those first.</li>
                <li><strong>Cost-sensitive bootstrap.</strong> The $39/month is small but real. If outbound is still pre-PMF, the shared pool keeps cost lean.</li>
            </ul>

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
                <li><Link href="/product/dedicated-ip" className="text-blue-600 hover:underline">Dedicated IP product page</Link></li>
                <li><Link href="/docs/help/dedicated-ip" className="text-blue-600 hover:underline">Dedicated IP setup guide</Link></li>
                <li><Link href="/docs/help/dedicated-ip-warmup-curve" className="text-blue-600 hover:underline">Dedicated IP warm-up curve</Link></li>
                <li><Link href="/blog/dedicated-ip-cold-email" className="text-blue-600 hover:underline">Dedicated IP vs shared IP - decision deep dive</Link></li>
            </ul>
        </div>
    );
}

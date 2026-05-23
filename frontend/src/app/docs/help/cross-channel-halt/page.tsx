import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { FaqJsonLd } from '@/components/seo/FaqSection';

const PAGE_URL = 'https://www.superkabe.com/docs/help/cross-channel-halt';
const SUPER_LINKEDIN_ID = 'https://www.superkabe.com/#feature-super-linkedin';

const faqItems = [
    { q: 'How does Superkabe match a reply to the right lead?',
      a: 'By canonical lead identity - the email address, the LinkedIn profile URL, or both. Leads are workspace-level entities, so a single record carries every channel touch. Threading does not affect identity: a reply to an old email thread still matches the lead by address and triggers the halt.' },
    { q: 'What are the halting policy options?',
      a: 'Three: "Any reply" (default - any reply on any channel halts the others, safest), "Positive replies only" (only interested/ask-for-info/schedule-call replies halt, so value-add follow-ups continue after a polite decline), and "Manual review" (every reply is flagged for operator approval before halting). The policy is set per workspace.' },
    { q: 'What happens if a reply matches more than one lead?',
      a: 'All matched leads are halted simultaneously. This covers the case where two campaigns target the same prospect - a single reply stops queued touches across every matching lead, not just one.' },
    { q: 'Can a halt be undone?',
      a: 'Yes. A halted lead can be manually resumed from its timeline if the operator decides the reply was unrelated. Resume restores the original touch schedule on every channel that was paused.' },
];

export const metadata: Metadata = {
    title: 'Cross-Channel Halt | Superkabe Help',
    description: 'Why a reply on LinkedIn halts the matching email touch (and vice versa). Lead identity, halting policy, and the cross-channel timeline.',
    alternates: { canonical: '/docs/help/cross-channel-halt' },
    openGraph: {
        title: 'Cross-Channel Halt | Superkabe Help',
        description: 'How replies on one channel halt outreach on the other.',
        url: '/docs/help/cross-channel-halt',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function CrossChannelHaltHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Cross-channel halt"
                description="Why a reply on LinkedIn halts the matching email touch (and vice versa). Lead identity, halting policy, and the cross-channel timeline."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Intermediate"
                mentions={[SUPER_LINKEDIN_ID]}
            />
            <FaqJsonLd items={faqItems} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Cross-channel halt</h1>
            <p className="text-xl text-gray-500 mb-12">
                A single reply stops outreach on both channels. Here is how it works and how to configure it.
            </p>

            <QuickAnswer
                question="What is cross-channel halt?"
                answer="When a prospect replies on one channel, Superkabe automatically pauses queued outreach on every other channel for that lead. Leads are workspace-level entities, so the same record carries both the LinkedIn touch and the email touch. A reply on either channel halts the other by canonical lead identity, which makes the classic multi-touch mistake - emailing someone who already replied on LinkedIn - impossible by construction."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What it is</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Leads in Superkabe are workspace-level entities, not channel-level. A single lead can have a LinkedIn touch in progress (via Super LinkedIn) and an email touch in progress (via the Sequencer or a connected sending platform) at the same time. When a reply arrives on either channel, the matching outreach on the other channel halts automatically. The result: the most common multi-touch failure - prospect replies on LinkedIn, sales has a conversation, scheduled email still fires two days later - is impossible by construction.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How the halt is triggered</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                <li>The reply event lands in Superkabe (via Unipile webhook for LinkedIn, or via the email reply detector).</li>
                <li>Superkabe identifies the matching lead by canonical identity (email, LinkedIn profile URL, or both).</li>
                <li>The supervisor agent classifies the reply intent: positive / neutral / negative / out-of-office.</li>
                <li>The workspace&apos;s halting policy is evaluated against the classification.</li>
                <li>If the policy matches, every queued touch on every other channel for this lead is paused. The lead timeline records the halt with the source channel, the reply snippet, and the classification.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Halting policy options</h2>
            <div className="space-y-4 mb-8">
                <div className="bg-white border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Any reply (default)</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Any reply on any channel halts the others. Safest default - never sends a follow-up to a prospect who has replied, even with an out-of-office or a polite decline. Recommended for most teams.
                    </p>
                </div>
                <div className="bg-white border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Positive replies only</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Only positive replies (interested, ask-for-info, schedule-call) halt the other channel. Out-of-office, neutral, and negative replies do not halt - which means subsequent touches still go out. Useful when your sequence has a long-tail of value-add follow-ups that should continue even after a polite decline.
                    </p>
                </div>
                <div className="bg-white border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">Manual review</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Every reply is flagged for operator review before halting. Slowest but highest control - useful for high-value account-based outbound where every reply deserves human attention.
                    </p>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Configuring the policy</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Dashboard - Super LinkedIn - Settings - Halting policy. The setting applies per workspace; agencies running multiple client workspaces configure each independently.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Reading the lead timeline</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Every lead has a chronological timeline showing every touch on every channel, every reply, and every halt event. Halt events are marked with a small icon plus the source channel and the classification. Click any timeline event to see the underlying message body and the metadata that drove the action.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Edge cases</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>Reply on the wrong thread.</strong> If a prospect replies to an old email thread (not the current sequence), Superkabe identifies the lead via address and applies the halt anyway. Threading does not affect lead identity.</li>
                <li><strong>Multiple matching leads.</strong> If a reply matches more than one lead in the workspace (e.g. two campaigns to the same prospect), all matched leads are halted simultaneously.</li>
                <li><strong>Halt-then-resume.</strong> A halted lead can be manually resumed from the timeline if the operator decides the reply was unrelated. Resume restores the original touch schedule.</li>
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
                <li><Link href="/product/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn product page</Link></li>
                <li><Link href="/docs/integrations/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn setup guide</Link></li>
                <li><Link href="/docs/help/24-7-monitoring" className="text-blue-600 hover:underline">24/7 monitoring</Link> - how cross-channel halt fits into the broader monitoring stack</li>
            </ul>
        </div>
    );
}

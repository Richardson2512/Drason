import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { FaqJsonLd } from '@/components/seo/FaqSection';

const PAGE_URL = 'https://www.superkabe.com/docs/help/super-linkedin-agent-stack';
const SUPER_LINKEDIN_ID = 'https://www.superkabe.com/#feature-super-linkedin';

const faqItems = [
    { q: 'What does each Super LinkedIn agent actually do?',
      a: 'The signal agent watches LinkedIn 24/7 for ICP-matching activity (job changes, funding announcements, hiring signals). The enrichment agent runs Clay-as-waterfall enrichment on each candidate. The ICP agent classifies fit (good/average/poor) against the workspace ICP definition. The icebreaker agent writes the opener from the enriched context. A supervisor coordinates all four and runs a quality gate before any send.' },
    { q: 'Can I disable individual agents?',
      a: 'Yes. Each agent can be toggled independently from Dashboard - Super LinkedIn - Agents. Common patterns: disable the signal agent when you bring your own lead list, disable the icebreaker agent when you write openers yourself, disable the enrichment agent when input data is already enriched, disable the ICP agent when candidates are pre-filtered upstream. The supervisor adapts the pipeline to whichever agents are enabled.' },
    { q: 'How does the supervisor allocate daily capacity?',
      a: 'The supervisor reads the daily cap (connections + messages + InMails) and distributes it across active campaigns by priority weight. Higher-priority campaigns get capacity first; overflow rolls to the next day. If multiple campaigns have the same priority, capacity splits evenly. The supervisor also reserves 10% headroom for in-flight follow-ups so reply-driven touches always have budget.' },
    { q: 'What is the icebreaker quality gate?',
      a: 'Before any agent-written opener sends, the supervisor scores it against four criteria: relevance to the enriched context (not generic), specific reference (a quote, a metric, a recent event), proper formatting (no AI tells like emoji density or hedging), and length budget (under 300 characters for connection requests, under 800 for messages). Openers below threshold are regenerated up to 3 times before falling back to a human-review queue.' },
    { q: 'Do the agents share data across workspaces?',
      a: 'No. Each workspace runs an isolated agent stack with its own ICP definition, signal weights, enrichment cache, and icebreaker history. Agency operators running multiple client workspaces configure each independently. No cross-workspace data leakage - the signal agent for Client A never sees Client B candidates.' },
];

export const metadata: Metadata = {
    title: 'Super LinkedIn Agent Stack | Superkabe Help',
    description: 'The 4 agents that run Super LinkedIn: signal, ICP, enrichment, and icebreaker. What each does, how to disable individually, and supervisor budgeting.',
    alternates: { canonical: '/docs/help/super-linkedin-agent-stack' },
    openGraph: {
        title: 'Super LinkedIn Agent Stack | Superkabe Help',
        description: 'What each of the 4 Super LinkedIn agents does and how the supervisor coordinates them.',
        url: '/docs/help/super-linkedin-agent-stack',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SuperLinkedInAgentStackHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Super LinkedIn agent stack"
                description="The 4 agents that run Super LinkedIn: signal, ICP, enrichment, and icebreaker. What each does, how to disable individually, and supervisor budgeting."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Intermediate"
                mentions={[SUPER_LINKEDIN_ID]}
            />
            <FaqJsonLd items={faqItems} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Super LinkedIn agent stack</h1>
            <p className="text-xl text-gray-500 mb-12">
                A supervisor plus four specialized agents. Here is what each one does and how they coordinate.
            </p>

            <QuickAnswer
                question="What is the Super LinkedIn agent stack?"
                answer="A supervisor agent plus four specialists - signal (24/7 ICP monitoring), enrichment (Clay-as-waterfall), ICP (fit classifier), and icebreaker (opener writer with a quality gate). The four work the LinkedIn outreach funnel continuously; the supervisor allocates daily capacity and runs the quality gate. Each agent can be disabled independently."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The four agents</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Signal agent</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Runs continuously. Watches LinkedIn for ICP-matching activity - job changes, funding announcements, hiring posts, product launches, public mentions of a pain you solve. Surfaces qualified candidates to the supervisor in real time, not in batched daily lists. With Sales Navigator connected, the signal agent uses Sales Nav search filters to drive much higher precision; basic LinkedIn also works at lower volume.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Enrichment agent</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Takes a candidate and runs the Clay-as-waterfall enrichment cascade: company firmographics, tech stack, recent funding round, decision-maker mapping. Returns one of three verdicts:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>Enriched.</strong> Full record - passes to the ICP agent.</li>
                <li><strong>Phone-only.</strong> Email and LinkedIn coverage too thin to outbound; surfaced to the cold-call queue.</li>
                <li><strong>Email-only.</strong> No LinkedIn surface to engage; handed to the Sequencer as a source signal.</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. ICP agent</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Classifies the enriched record against the workspace ICP definition into three buckets: good fit, average fit, poor fit. Good-fit records flow to the icebreaker agent. Average-fit records park in the operator review queue. Poor-fit records are discarded with the reason logged so the operator can refine the ICP definition over time.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Icebreaker agent</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                For good-fit records, writes a short, specific opener drawn from the enriched context. Connection-request openers stay under 300 characters; message openers stay under 800. Every opener passes through the supervisor&apos;s quality gate before send (see FAQ below).
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The supervisor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                The supervisor is the only agent operators configure directly. It reads the workspace ICP definition, allocates the daily capacity cap across active campaigns by priority weight, coordinates the four specialists, and runs the icebreaker quality gate. Everything else flows from supervisor configuration.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Disable agents individually</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                Dashboard - Super LinkedIn - Agents - toggle the specific agent off. The supervisor adapts the pipeline:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>No signal agent - you bring leads via CSV or Clay webhook.</li>
                <li>No enrichment agent - the platform assumes input data is already enriched.</li>
                <li>No ICP agent - every candidate is treated as good-fit (operator vetted upstream).</li>
                <li>No icebreaker agent - you supply opener templates with variables; the platform fills variables but does not write new copy.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
                With all four disabled, Super LinkedIn degrades gracefully into a HeyReach-class sender that follows your supplied playbook.
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
                <li><Link href="/product/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn product page</Link></li>
                <li><Link href="/docs/integrations/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn setup guide</Link></li>
                <li><Link href="/docs/help/super-linkedin-sending-caps" className="text-blue-600 hover:underline">Daily sending caps</Link></li>
                <li><Link href="/docs/help/super-linkedin-icp-config" className="text-blue-600 hover:underline">Configure the ICP definition</Link></li>
                <li><Link href="/docs/help/cross-channel-halt" className="text-blue-600 hover:underline">Cross-channel halt with email</Link></li>
            </ul>
        </div>
    );
}

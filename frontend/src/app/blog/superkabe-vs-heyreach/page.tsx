import Link from 'next/link';
import type { Metadata } from 'next';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

export const metadata: Metadata = {
    title: 'Superkabe vs HeyReach: Head-to-Head Comparison (2026)',
    description: 'Detailed Superkabe vs HeyReach comparison covering LinkedIn outreach depth, multi-channel coverage, the 4-agent supervisor stack, cross-channel halt, pricing, and where each tool actually fits in a modern outbound stack.',
    openGraph: {
        title: 'Superkabe vs HeyReach: Head-to-Head Comparison (2026)',
        description: 'HeyReach is LinkedIn-only. Super LinkedIn matches HeyReach sending and adds a 4-agent stack + email cross-channel halt. Side-by-side.',
        url: '/blog/superkabe-vs-heyreach',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-05-20',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Superkabe vs HeyReach: Head-to-Head Comparison (2026)',
        description: 'LinkedIn-only (HeyReach) vs LinkedIn + email + AI agents (Super LinkedIn). Side-by-side.',
        images: ['/image/og-image.png'],
    },
    alternates: { canonical: '/blog/superkabe-vs-heyreach' },
};

export default function SuperkabeVsHeyReachPage() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Superkabe vs HeyReach: Head-to-Head Comparison (2026)",
        "description": "Detailed Superkabe vs HeyReach comparison covering LinkedIn outreach depth, multi-channel coverage, the 4-agent supervisor stack, cross-channel halt, and pricing.",
        "datePublished": "2026-05-20",
        "dateModified": "2026-05-20",
        "image": { "@type": "ImageObject", "url": "https://www.superkabe.com/image/og-image.png", "width": 1200, "height": 630 },
        "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Deliverability Specialist", "url": "https://www.superkabe.com" },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "https://www.superkabe.com/blog/superkabe-vs-heyreach" }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            { "@type": "Question", "name": "Is Superkabe better than HeyReach?", "acceptedAnswer": { "@type": "Answer", "text": "Different scopes. HeyReach is a dedicated LinkedIn outreach platform - it does one thing very well. Super LinkedIn is the LinkedIn module of Superkabe; it matches HeyReach's sending layer (same daily caps, same connection-then-message cadence, same network-warmup integration) and adds: a 4-agent supervisor stack for ICP signal monitoring and icebreaker writing, cross-channel halt with email so a reply on either channel halts the other, and workspace-level lead identity. If LinkedIn is the only channel you run, HeyReach is excellent. If you run LinkedIn alongside email outreach, Super LinkedIn integrates the two." } },
            { "@type": "Question", "name": "Does Super LinkedIn use the same sending safety caps as HeyReach?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The defaults are HeyReach-class: 30 connection requests/day for new accounts ramping to 100/day after 30 days of clean signal, 50 InMails/day for premium accounts, 200 messages/day to existing 1st-degree connections. These caps are enforced at the supervisor level - campaigns cannot accidentally overshoot." } },
            { "@type": "Question", "name": "What is the 4-agent supervisor stack?", "acceptedAnswer": { "@type": "Answer", "text": "Four AI agents coordinated by a supervisor: (1) signal agent watches LinkedIn for ICP-matching activity in real time (job changes, funding announcements, hiring signals), (2) enrichment agent runs Clay-as-waterfall enrichment, (3) ICP agent classifies fit, (4) icebreaker agent writes the opener from enriched context. The supervisor allocates daily capacity, runs the quality gate, and coordinates between agents. HeyReach has no equivalent - signal, enrichment, and icebreaker are operator workflows in HeyReach." } },
            { "@type": "Question", "name": "What is cross-channel halt and why does it matter?", "acceptedAnswer": { "@type": "Answer", "text": "Leads in Super LinkedIn are workspace-level entities, not channel-level. A single lead can have a LinkedIn touch and an email touch in progress simultaneously. A reply on either channel halts the other automatically. This solves the most common multi-touch failure mode: prospect replies on LinkedIn, sales has a great conversation, and meanwhile a scheduled email still fires two days later. HeyReach plus a separate email tool cannot enforce this halt without manual operator intervention." } },
            { "@type": "Question", "name": "How does HeyReach pricing compare to Superkabe?", "acceptedAnswer": { "@type": "Answer", "text": "HeyReach charges per LinkedIn account per month - $79 for the Starter tier, scaling with seats. Superkabe is workspace-tier flat ($19 to $349/mo) and includes Super LinkedIn on every tier. For teams running LinkedIn + email outbound on more than 2-3 accounts, Superkabe is consistently cheaper. For LinkedIn-only operators running a small number of seats, HeyReach Starter remains competitive." } },
            { "@type": "Question", "name": "Can I use Super LinkedIn with my existing email outbound tool?", "acceptedAnswer": { "@type": "Answer", "text": "Super LinkedIn coordinates with the Superkabe Sequencer for cross-channel halt. If your email outbound runs on Smartlead or Instantly, those platforms connect to Superkabe's protection layer (see Multi-Platform Outbound Protection) which then enables cross-channel halt with Super LinkedIn. So yes - the integration works across the major external sending platforms." } }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog"}, {"@type": "ListItem", "position": 3, "name": "Superkabe vs HeyReach: Head-to-Head Comparison (2026)", "item": "https://www.superkabe.com/blog/superkabe-vs-heyreach"}]}) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <BlogHeader
                    tag="Comparison"
                    title="Superkabe vs HeyReach: head-to-head comparison (2026)"
                    dateModified="2026-05-20"
                    authorName="Robert Smith"
                    authorRole="Deliverability Specialist · Superkabe"
                />

                <FeaturedHero
                    badge="COMPARISON · 2026"
                    eyebrow="11 min read"
                    tagline="LinkedIn-only vs LinkedIn + email + agents"
                    sub="Agent stack · Cross-channel halt · Pricing"
                />

                <p className="text-lg text-gray-700 leading-relaxed mb-12">
                    HeyReach is one of the cleanest LinkedIn outreach platforms in the market. It is deep on the LinkedIn side - safe sending caps, mature warmup integration, multi-tenant for agencies. Super LinkedIn (the LinkedIn module of Superkabe) matches HeyReach&apos;s sending layer and extends in two directions: a 4-agent supervisor stack on the funnel side, and cross-channel halt with the Sequencer on the multi-channel side. Here is the head-to-head.
                </p>

                <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Both ship HeyReach-class LinkedIn sending: safe daily caps, network-warmup integration, connection-then-message cadence</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> HeyReach is LinkedIn-only; Super LinkedIn ships alongside the Superkabe Sequencer for unified multi-channel outbound</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Super LinkedIn adds a 4-agent supervisor stack (signal, ICP, enrichment, icebreaker) - HeyReach leaves these as operator workflows</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Cross-channel halt: reply on LinkedIn halts the matching email thread automatically, and vice versa</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> HeyReach is per-account pricing; Superkabe is workspace-tier flat including Super LinkedIn</li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <h2 id="overview" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Quick overview</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-50 border border-blue-200 p-6">
                            <h3 className="font-bold text-blue-900 mb-2">Superkabe (Super LinkedIn module)</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">LinkedIn outreach module inside the Superkabe platform. HeyReach-class sending via Unipile, 4-agent supervisor stack (signal, ICP, enrichment, icebreaker), workspace-level lead identity, cross-channel halt with the Sequencer. Runs alongside email outbound on the same platform.</p>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">HeyReach</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">Dedicated LinkedIn outreach platform. Safe sending caps, network-warmup integration, multi-tenant agency model, mature unified inbox for LinkedIn replies. LinkedIn-only - email outbound runs in a separate tool.</p>
                        </div>
                    </div>

                    <h2 id="superkabe-wins" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Where Super LinkedIn wins</h2>

                    <div className="bg-white border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">1. The 4-agent supervisor stack</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            HeyReach operators bring their own lead list, their own ICP doc, their own enrichment workflow (often Clay), and their own icebreaker spreadsheet. Super LinkedIn ships all four as first-class agents inside the platform. The signal agent watches LinkedIn for ICP-matching activity continuously (job changes, funding rounds, hiring signals). The enrichment agent runs Clay-as-waterfall enrichment on the candidate. The ICP agent classifies fit against the workspace ICP definition. The icebreaker agent writes the opener from enriched context, with the supervisor running a quality gate before send. The operator configures the supervisor once; the agents work the funnel 24/7.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">2. Cross-channel halt with email</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Leads are workspace-level. A single lead can have a LinkedIn touch and an email touch in progress at the same time, and a reply on either channel halts the other automatically. This solves the most common multi-touch failure: prospect replies on LinkedIn, sales has a great conversation, and meanwhile a scheduled email still fires two days later. HeyReach plus a separate email tool cannot enforce this halt without manual intervention.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">3. One platform for LinkedIn + email + protection</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            HeyReach owns LinkedIn; email outbound lives in Smartlead, Instantly, Lemlist, or Superkabe&apos;s Sequencer. Super LinkedIn lives next to the Sequencer inside Superkabe with one operator UI, one lead database, one reporting view. For teams running multi-channel outbound this collapses operational overhead substantially.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">4. Pricing model</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            HeyReach charges per LinkedIn account per month - the cost scales linearly with the number of LinkedIn seats. Superkabe is workspace-tier flat (Super LinkedIn is included on every tier from Starter up). For teams running 3+ LinkedIn seats alongside email outbound, the cost difference is significant.
                        </p>
                    </div>

                    <h2 id="heyreach-wins" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Where HeyReach wins</h2>

                    <div className="bg-white border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">1. LinkedIn-first product depth</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            HeyReach has been LinkedIn-focused since day one. The unified inbox for LinkedIn replies, the multi-tenant agency tooling, the deep LinkedIn-specific automations - everything is built around LinkedIn as the primary surface. Super LinkedIn matches HeyReach on the sending layer but Superkabe&apos;s LinkedIn UI is newer and less mature on some LinkedIn-specific workflows.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">2. Established LinkedIn-only operator community</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            HeyReach has a sizable community of LinkedIn-only outreach operators sharing playbooks, lead-source strategies, and InMail templates. For pure-LinkedIn operators the community knowledge is a meaningful value-add. Super LinkedIn&apos;s community is younger and more multi-channel-oriented.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">3. Simpler product if LinkedIn is your only channel</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            For teams that explicitly do not want a multi-channel platform - LinkedIn is the only motion, no email outbound, no need for cross-channel halt - HeyReach is a cleaner single-purpose product. Superkabe has email and protection layers attached; if you are not using them they are extra surface area to ignore.
                        </p>
                    </div>

                    <h2 id="comparison" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Side-by-side comparison</h2>
                    <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">Feature</th>
                                    <th className="py-4 px-4 font-bold text-blue-700 text-xs">Super LinkedIn</th>
                                    <th className="py-4 px-4 font-bold text-gray-700 text-xs">HeyReach</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Pricing model</td><td className="py-3 px-4 text-gray-600 text-xs">Workspace tier (flat)</td><td className="py-3 px-4 text-gray-600 text-xs">Per LinkedIn account/mo</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">LinkedIn sending caps</td><td className="py-3 px-4 text-green-600 text-xs">HeyReach-class</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Industry standard</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Connection auth</td><td className="py-3 px-4 text-gray-600 text-xs">Unipile</td><td className="py-3 px-4 text-gray-600 text-xs">Native + Unipile</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Multi-channel (email)</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Native Sequencer</td><td className="py-3 px-4 text-red-600 text-xs">LinkedIn only</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Cross-channel halt</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Workspace-level</td><td className="py-3 px-4 text-red-600 text-xs">N/A (single channel)</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Signal agent</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">24/7 ICP monitoring</td><td className="py-3 px-4 text-red-600 text-xs">Operator workflow</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Enrichment agent</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Clay-as-waterfall</td><td className="py-3 px-4 text-yellow-600 text-xs">External (Clay)</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">ICP classifier</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Native agent</td><td className="py-3 px-4 text-red-600 text-xs">Operator workflow</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">AI icebreaker writer</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Native agent w/ quality gate</td><td className="py-3 px-4 text-yellow-600 text-xs">Template-based</td></tr>
                                <tr className="border-b border-gray-100"><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Email deliverability protection</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Full Superkabe stack</td><td className="py-3 px-4 text-red-600 text-xs">N/A</td></tr>
                                <tr><td className="py-3 px-4 text-gray-700 text-xs font-semibold">Unified inbox (LinkedIn)</td><td className="py-3 px-4 text-yellow-600 text-xs">Solid</td><td className="py-3 px-4 text-green-600 text-xs font-semibold">Best-in-class</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 id="pick-superkabe" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Pick Super LinkedIn if&hellip;</h2>
                    <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> You run LinkedIn outreach alongside email - cross-channel halt is the largest single workflow win</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> You want the 24/7 signal + enrichment + ICP + icebreaker agent stack instead of building it from Clay + a spreadsheet</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> You operate at 3+ LinkedIn seats where HeyReach&apos;s per-account pricing compounds</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> You want one platform for the entire outbound stack (LinkedIn + email + protection + analytics)</li>
                        </ul>
                    </div>

                    <h2 id="pick-heyreach" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Pick HeyReach if&hellip;</h2>
                    <div className="bg-white border border-gray-100 p-6 mb-8 shadow-sm">
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> LinkedIn is your only outbound channel and you have no plans to add email</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> The unified LinkedIn inbox is your primary daily workspace and polish matters</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> You operate at 1-2 LinkedIn seats where per-account pricing is comfortable</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> You already have a working enrichment + ICP + icebreaker workflow you do not want to migrate</li>
                        </ul>
                    </div>
                </div>

                <BottomCtaStrip
                    headline="Run LinkedIn + email outbound on one platform"
                    body="Super LinkedIn matches HeyReach-class sending and adds the 4-agent supervisor stack and cross-channel halt with email. Workspace-tier flat pricing - Super LinkedIn is included on every plan."
                    primaryCta={{ label: 'Start free trial', href: '/signup' }}
                    secondaryCta={{ label: 'See Super LinkedIn', href: '/product/super-linkedin' }}
                />

                <h2 id="faqs" className="text-2xl font-bold text-gray-900 mt-16 mb-4">Frequently asked questions</h2>
                <div className="space-y-4 mb-12">
                    <div className="bg-white border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">Is Super LinkedIn better than HeyReach?</h3>
                        <p className="text-gray-600 text-sm">For multi-channel teams running LinkedIn alongside email, yes - cross-channel halt and the agent stack are large workflow wins. For LinkedIn-only operators, HeyReach&apos;s focused depth and unified inbox polish remain strong.</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">What does the 4-agent stack actually do?</h3>
                        <p className="text-gray-600 text-sm">Signal agent watches LinkedIn for ICP-matching activity 24/7. Enrichment agent runs Clay-as-waterfall enrichment. ICP agent classifies fit. Icebreaker agent writes the opener. The supervisor coordinates all four and runs a quality gate.</p>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">How does cross-channel halt work in practice?</h3>
                        <p className="text-gray-600 text-sm">Leads are workspace-level. A reply on LinkedIn halts the matching email thread; a reply on email halts the matching LinkedIn touch. The halting policy is operator-configurable (any reply vs positive reply only).</p>
                    </div>
                </div>
            </article>

            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/product/super-linkedin" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Super LinkedIn</h3>
                        <p className="text-gray-500 text-xs">Full product breakdown of Super LinkedIn</p>
                    </Link>
                    <Link href="/blog/superkabe-vs-instantly" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Superkabe vs Instantly</h3>
                        <p className="text-gray-500 text-xs">Email-side comparison with the closest category competitor</p>
                    </Link>
                    <Link href="/blog/superkabe-vs-lemlist" className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Superkabe vs Lemlist</h3>
                        <p className="text-gray-500 text-xs">The other major multi-channel email tool, head-to-head</p>
                    </Link>
                </div>
            </section>
        </>
    );
}

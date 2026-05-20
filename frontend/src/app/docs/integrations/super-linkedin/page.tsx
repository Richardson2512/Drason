import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema } from '@/components/seo/AeoGeoSchema';
import { ItemListJsonLd } from '@/components/seo/ExtraSchema';

const PAGE_URL = 'https://www.superkabe.com/docs/integrations/super-linkedin';
const SUPER_LINKEDIN_ID = 'https://www.superkabe.com/#feature-super-linkedin';

export const metadata: Metadata = {
    title: 'Super LinkedIn Integration | Superkabe Docs',
    description: 'Connect LinkedIn via Unipile - HeyReach-class sending, the 4-agent supervisor stack (signal, ICP, enrichment, icebreaker), cross-channel halt.',
    alternates: { canonical: '/docs/integrations/super-linkedin' },
    openGraph: {
        title: 'Super LinkedIn Integration | Superkabe Docs',
        description: 'Connect LinkedIn via Unipile and turn on the 4-agent supervisor stack for 24/7 outreach.',
        url: '/docs/integrations/super-linkedin',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SuperLinkedInIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Super LinkedIn integration setup"
                description="Connect LinkedIn via Unipile, configure the supervisor agent ICP, daily capacity caps, halting policy, and the 4-agent supervisor stack."
                url={PAGE_URL}
                datePublished="2026-05-20"
                dateModified="2026-05-21"
                proficiencyLevel="Beginner"
                mentions={[SUPER_LINKEDIN_ID]}
            />
            <ItemListJsonLd data={{
                name: 'Super LinkedIn connection setup',
                description: 'Four-step procedure for connecting LinkedIn to Super LinkedIn via Unipile and configuring the supervisor agent stack.',
                items: [
                    { name: 'Open the Super LinkedIn module' },
                    { name: 'Authenticate via Unipile' },
                    { name: 'Configure the supervisor agent' },
                    { name: 'Enable agents (optional)' },
                ],
            }} />
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Super LinkedIn Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Connect LinkedIn via Unipile, configure the supervisor agent&apos;s ICP, and let the four-agent stack work the funnel 24/7.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What this integration does</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Connection.</strong> Connect a LinkedIn account via Unipile - the connection survives password rotations, MFA, and most LinkedIn defensive friction.</li>
                <li><strong>HeyReach-class sending.</strong> Connection requests, follow-ups, InMails, and 1st-degree messages at HeyReach-class daily caps (30 connections/day ramping to 100/day after 30 days; 200 1st-degree messages/day).</li>
                <li><strong>4-agent supervisor stack.</strong> Signal (24/7 ICP monitoring), enrichment (Clay-as-waterfall), ICP (good/average/poor classifier), icebreaker (opener writer w/ quality gate).</li>
                <li><strong>Cross-channel halt.</strong> Reply on LinkedIn halts the matching email touch; reply on email halts the LinkedIn touch. Workspace-level lead identity makes this automatic.</li>
                <li><strong>Sales Navigator support.</strong> Sales Nav search filters feed the signal agent for higher-quality candidate generation. Basic LinkedIn also works (lower volume).</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Connection setup</h2>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Open the Super LinkedIn module</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Dashboard - Super LinkedIn - Connect Account. The first time you open this page Superkabe shows a one-time consent screen explaining how Unipile is used for the connection.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Authenticate via Unipile</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Click <strong>Connect via Unipile</strong>. A Unipile-hosted authentication window opens. Sign in to LinkedIn with the account you want to use for outreach. Approve the connection.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Unipile holds the LinkedIn session credentials and proxies API calls on behalf of Superkabe. Superkabe never sees your LinkedIn password.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Configure the supervisor agent</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Once connected, Superkabe prompts for the supervisor agent&apos;s configuration:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>ICP definition</strong> - a natural-language description of who you sell to (industry, company size, function, geography, signal triggers). The signal agent uses this to filter candidates.</li>
                <li><strong>Daily capacity</strong> - connection requests/day, messages/day, InMails/day. Defaults are HeyReach-class; raise gradually as the account warms.</li>
                <li><strong>Halting policy</strong> - any-reply (default) or positive-reply-only (uses the icebreaker agent to classify reply intent).</li>
                <li><strong>Icebreaker quality gate</strong> - on/off. When on, the supervisor reviews every agent-written opener before it is sent.</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Enable agents (optional, all on by default)</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
                Each of the four agents can be toggled independently. Most teams leave all four on. Common disable patterns:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Disable the <strong>signal agent</strong> if you bring your own lead list and just want the platform to send.</li>
                <li>Disable the <strong>icebreaker agent</strong> if you write your own openers and want full control.</li>
                <li>Disable the <strong>enrichment agent</strong> if your input data is already enriched and the Clay-as-waterfall layer would be redundant.</li>
                <li>Disable the <strong>ICP agent</strong> if you have already filtered candidates upstream.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Daily capacity caps</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Defaults applied per LinkedIn account:
            </p>
            <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Action</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Day 0-30</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-900">Day 30+ (clean signal)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">Connection requests</td>
                            <td className="py-3 px-4 text-gray-600">30/day</td>
                            <td className="py-3 px-4 text-gray-600">100/day</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">Messages (1st-degree)</td>
                            <td className="py-3 px-4 text-gray-600">100/day</td>
                            <td className="py-3 px-4 text-gray-600">200/day</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold text-gray-800">InMails (premium accounts)</td>
                            <td className="py-3 px-4 text-gray-600">25/day</td>
                            <td className="py-3 px-4 text-gray-600">50/day</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 font-semibold text-gray-800">Profile views (signal warmup)</td>
                            <td className="py-3 px-4 text-gray-600">200/day</td>
                            <td className="py-3 px-4 text-gray-600">500/day</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
                The supervisor enforces these caps at the planning layer - campaigns cannot accidentally overshoot. If a campaign requests volume beyond the cap, the supervisor schedules the overflow to the next day.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Cross-channel halt with the Sequencer</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Leads are workspace-level. A single lead can have a LinkedIn touch in progress and an email touch in progress simultaneously. The halting logic operates at the lead level:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                <li>Prospect replies to your LinkedIn message.</li>
                <li>The reply event lands in the workspace via Unipile webhook.</li>
                <li>The supervisor classifies the reply intent (positive / neutral / negative / out-of-office).</li>
                <li>If the halt policy is &quot;any reply&quot;, the matching email sequence is paused immediately. If &quot;positive only&quot;, only positive replies trigger the email halt.</li>
                <li>The lead timeline records the cross-channel halt; the operator sees one chronological view of all touches.</li>
            </ol>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Disconnecting</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Dashboard - Super LinkedIn - Settings - Disconnect. The Unipile session is revoked, in-flight campaigns are paused, and the LinkedIn touches stop firing. Lead history and the cross-channel halt audit trail remain. Reconnecting later resumes from where you left off without re-enriching leads.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><Link href="/product/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn product page</Link> - the full feature breakdown</li>
                <li><Link href="/blog/superkabe-vs-heyreach" className="text-blue-600 hover:underline">Superkabe vs HeyReach</Link> - head-to-head with HeyReach</li>
                <li><Link href="/docs/help/24-7-monitoring" className="text-blue-600 hover:underline">24/7 monitoring</Link> - how monitoring integrates with cross-channel halt</li>
            </ul>
        </div>
    );
}

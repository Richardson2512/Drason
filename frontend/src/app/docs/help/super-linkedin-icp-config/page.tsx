import type { Metadata } from 'next';
import Link from 'next/link';
import { TechArticleSchema, QuickAnswer } from '@/components/seo/AeoGeoSchema';
import { ItemListJsonLd } from '@/components/seo/ExtraSchema';

const PAGE_URL = 'https://www.superkabe.com/docs/help/super-linkedin-icp-config';
const SUPER_LINKEDIN_ID = 'https://www.superkabe.com/#feature-super-linkedin';

export const metadata: Metadata = {
    title: 'Configure ICP for Super LinkedIn | Superkabe Help',
    description: 'How to write an ICP definition the signal and ICP agents can use. Industry, function, geography, and signal triggers with worked examples.',
    alternates: { canonical: '/docs/help/super-linkedin-icp-config' },
    openGraph: {
        title: 'Configure ICP for Super LinkedIn | Superkabe Help',
        description: 'Write an ICP definition the signal and ICP agents can actually use.',
        url: '/docs/help/super-linkedin-icp-config',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function SuperLinkedInIcpConfigHelp() {
    return (
        <div className="prose prose-lg max-w-none">
            <TechArticleSchema
                headline="Configure ICP for Super LinkedIn"
                description="How to write an ICP definition the signal and ICP agents can use. Industry, function, geography, and signal triggers with worked examples."
                url={PAGE_URL}
                datePublished="2026-05-21"
                dateModified="2026-05-21"
                proficiencyLevel="Beginner"
                mentions={[SUPER_LINKEDIN_ID]}
            />
            <ItemListJsonLd data={{
                name: 'Steps to configure a Super LinkedIn ICP',
                description: 'Six-step procedure for writing a workspace ICP definition the signal and ICP agents can act on.',
                items: [
                    { name: 'Open Super LinkedIn settings' },
                    { name: 'Write the company filter' },
                    { name: 'Write the persona filter' },
                    { name: 'Add geography' },
                    { name: 'Add signal triggers' },
                    { name: 'Calibrate against existing customers' },
                ],
            }} />

            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Configure ICP for Super LinkedIn</h1>
            <p className="text-xl text-gray-500 mb-12">
                A 6-step procedure for writing an ICP definition the signal and ICP agents can act on.
            </p>

            <QuickAnswer
                question="What does a Super LinkedIn ICP need to include?"
                answer="Four required parts: a company filter (industry + size + maturity), a persona filter (function + seniority + tenure), geography, and signal triggers (the events that flag a candidate as actively relevant - job changes, funding rounds, hiring signals). Optional fifth part: a list of 5-10 existing customers the supervisor calibrates against."
            />

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1 - Open Super LinkedIn settings</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Dashboard - Super LinkedIn - Settings - ICP definition. The editor is a single natural-language field with structured prompts; you do not need to format anything as JSON.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2 - Write the company filter</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                Three dimensions: industry, size, maturity. Be specific. Vague filters (&quot;B2B SaaS&quot;) produce noise; specific filters (&quot;Series A-C B2B SaaS in vertical SaaS, sales-led, 50-500 employees&quot;) produce qualified candidates.
            </p>
            <div className="bg-gray-50 border-l-4 border-blue-500 p-5 mb-6 text-sm">
                <strong className="text-gray-900">Worked example:</strong>
                <p className="text-gray-700 mt-2 mb-0">
                    Series A-C B2B SaaS in vertical SaaS or marketplaces. 50-500 employees. Headquartered in US/CA/UK/EU. Sales-led GTM (not product-led). Annual revenue $5M-$50M.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 3 - Write the persona filter</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                Three dimensions: function, seniority, tenure. Tenure matters more than most operators expect - a brand-new VP of Sales is more likely to take outreach than a 5-year incumbent.
            </p>
            <div className="bg-gray-50 border-l-4 border-blue-500 p-5 mb-6 text-sm">
                <strong className="text-gray-900">Worked example:</strong>
                <p className="text-gray-700 mt-2 mb-0">
                    Function: Sales leadership (VP Sales, CRO, Head of Sales, Head of Growth). Seniority: Director and above. Tenure: under 18 months in current role (signals active mandate, more open to new tooling).
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 4 - Add geography</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Country-level minimum. Optionally narrow to specific cities or metro areas if your motion is local. The signal agent uses geography both for filtering and for time-zone-aware send timing.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 5 - Add signal triggers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
                Signal triggers are the events that flag a candidate as actively relevant right now. The signal agent watches LinkedIn for these continuously. Pick 3-5; more dilutes quality.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><strong>Job change in last 90 days</strong> - especially into a sales leadership role</li>
                <li><strong>Funding announcement</strong> - Series A or later, in last 180 days</li>
                <li><strong>Hiring signal</strong> - 3+ open sales roles in last 30 days</li>
                <li><strong>Public post about the pain you solve</strong> - high precision when relevant</li>
                <li><strong>Departed competitor</strong> - someone left a company that uses your competitor</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 6 - Calibrate against existing customers</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                Optional but worth the 10 minutes. Paste 5-10 LinkedIn URLs of contacts from existing customers who matched your ICP well. The supervisor uses these as positive anchors when classifying ambiguous candidates. The single highest-leverage tuning step.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Verification</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                After saving the ICP, click <strong>Preview matches</strong>. The signal agent runs a one-shot pass against the workspace queue and returns the top 20 candidates with the supervisor&apos;s fit classification. If you see obvious misses or false positives, tighten the company/persona filters and re-preview. Two or three iterations usually lands a usable ICP.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li><Link href="/docs/help/super-linkedin-agent-stack" className="text-blue-600 hover:underline">The 4-agent supervisor stack</Link></li>
                <li><Link href="/docs/integrations/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn setup guide</Link></li>
                <li><Link href="/product/super-linkedin" className="text-blue-600 hover:underline">Super LinkedIn product page</Link></li>
            </ul>
        </div>
    );
}

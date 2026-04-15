import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Complete Guide: Clay to Sender Platform via Superkabe',
    description: 'End-to-end guide covering the complete flow from Clay enrichment through Superkabe validation, health gate, and routing to Smartlead, Instantly, or EmailBison.',
    alternates: { canonical: '/docs/clay-integration' },
    openGraph: {
        title: 'Complete Guide: Clay to Sender Platform via Superkabe',
        description: 'End-to-end guide covering the complete flow from Clay enrichment through Superkabe validation, health gate, and routing to Smartlead, Instantly, or EmailBison.',
        url: '/docs/clay-integration',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function ClayIntegrationPage() {
    return (
        <div className="prose prose-lg max-w-none text-gray-700">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Complete Guide: Clay to Sender Platform via Superkabe
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                End-to-end walkthrough from lead enrichment to campaign delivery
            </p>

            {/* ==================== Section 1: What This Guide Covers ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What This Guide Covers</h2>
            <p className="text-gray-600 mb-8">
                This guide covers the complete journey of a lead from Clay enrichment through Superkabe's email validation,
                health gate classification, and rule-based routing to your sender platform — whether that is Smartlead, Instantly,
                or EmailBison. By the end, you will have a fully automated pipeline where enriched leads flow from Clay into your
                sender platform's campaigns with quality controls at every stage.
            </p>

            {/* ==================== Section 2: The Complete Flow (Visual) ==================== */}
            <h2 className="text-3xl font-bold mb-6 mt-16 text-gray-900">The Complete Flow</h2>
            <p className="text-gray-600 mb-6">
                Every lead passes through these stages before reaching your sender platform. Here is the full pipeline:
            </p>

            <div className="space-y-0 mb-12 not-prose">
                {/* Step 1: Clay */}
                <div className="border-2 border-gray-300 rounded-xl p-4 flex items-center gap-3 bg-gray-50">
                    <Image src="/clay.png" alt="Clay" width={24} height={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Clay — Lead Enrichment</p>
                        <p className="text-gray-500 text-xs">Enriched lead data sent via HTTP webhook to Superkabe</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-gray-300"></div>
                </div>

                {/* Step 2: Superkabe Webhook */}
                <div className="border-2 border-blue-400 rounded-xl p-4 flex items-center gap-3 bg-blue-50">
                    <Image src="/image/logo-v2.png" alt="Superkabe" width={24} height={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Superkabe Webhook — Ingestion</p>
                        <p className="text-gray-500 text-xs">Lead received, parsed, and deduplicated against existing records</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-blue-300"></div>
                </div>

                {/* Step 3: Email Validation */}
                <div className="border-2 border-blue-400 rounded-xl p-4 flex items-center gap-3 bg-blue-50">
                    <Image src="/image/logo-v2.png" alt="Superkabe" width={24} height={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Email Validation</p>
                        <p className="text-gray-500 text-xs">Syntax check, MX record lookup, disposable domain detection, catch-all detection, MillionVerifier API</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-blue-300"></div>
                </div>

                {/* Step 4: Health Gate */}
                <div className="border-2 border-blue-400 rounded-xl p-4 flex items-center gap-3 bg-blue-50">
                    <Image src="/image/logo-v2.png" alt="Superkabe" width={24} height={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Health Gate — Classification</p>
                        <p className="text-gray-500 text-xs">Lead scored and classified as GREEN, YELLOW, or RED</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-blue-300"></div>
                </div>

                {/* Branch: RED blocked */}
                <div className="flex gap-4">
                    <div className="flex-1 border-2 border-red-400 rounded-xl p-4 bg-red-50">
                        <p className="font-bold text-red-700 text-sm">RED — Blocked</p>
                        <p className="text-gray-500 text-xs">Invalid, disposable, or high-risk emails stopped here. Never reaches a sender platform.</p>
                    </div>
                    <div className="flex-1 border-2 border-green-400 rounded-xl p-4 bg-green-50">
                        <p className="font-bold text-green-700 text-sm">GREEN / YELLOW — Proceed</p>
                        <p className="text-gray-500 text-xs">Validated leads continue to the routing engine.</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-green-300 ml-[25%]"></div>
                </div>

                {/* Step 5: Routing */}
                <div className="border-2 border-blue-400 rounded-xl p-4 flex items-center gap-3 bg-blue-50">
                    <Image src="/image/logo-v2.png" alt="Superkabe" width={24} height={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Routing Engine</p>
                        <p className="text-gray-500 text-xs">Match lead to a campaign based on persona, min score, and rule priority</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-blue-300"></div>
                </div>

                {/* Step 6: Capacity Check */}
                <div className="border-2 border-blue-400 rounded-xl p-4 flex items-center gap-3 bg-blue-50">
                    <Image src="/image/logo-v2.png" alt="Superkabe" width={24} height={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Capacity Check</p>
                        <p className="text-gray-500 text-xs">Verify target campaign has available capacity and active mailboxes</p>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-green-300"></div>
                </div>

                {/* Step 7: Push to Platform */}
                <div className="flex gap-3">
                    <div className="flex-1 border-2 border-gray-300 rounded-xl p-3 bg-gray-50 flex items-center gap-2">
                        <Image src="/smartlead.webp" alt="Smartlead" width={24} height={24} className="flex-shrink-0" />
                        <div>
                            <p className="font-bold text-gray-900 text-xs">Smartlead</p>
                            <p className="text-gray-500 text-[10px]">Push to campaign</p>
                        </div>
                    </div>
                    <div className="flex-1 border-2 border-gray-300 rounded-xl p-3 bg-gray-50 flex items-center gap-2">
                        <Image src="/instantly.png" alt="Instantly" width={24} height={24} className="flex-shrink-0" />
                        <div>
                            <p className="font-bold text-gray-900 text-xs">Instantly</p>
                            <p className="text-gray-500 text-[10px]">Push to campaign</p>
                        </div>
                    </div>
                    <div className="flex-1 border-2 border-gray-300 rounded-xl p-3 bg-gray-50 flex items-center gap-2">
                        <Image src="/emailbison.png" alt="EmailBison" width={24} height={24} className="flex-shrink-0" />
                        <div>
                            <p className="font-bold text-gray-900 text-xs">EmailBison</p>
                            <p className="text-gray-500 text-[10px]">Push to campaign</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-green-300"></div>
                </div>

                {/* Step 8: Active */}
                <div className="border-2 border-green-400 rounded-xl p-4 flex items-center justify-center gap-2 bg-green-50">
                    <p className="font-bold text-green-700 text-sm">Lead marked ACTIVE — in campaign and ready to send</p>
                </div>
            </div>

            {/* ==================== Section 3: Prerequisites ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Prerequisites</h2>
            <p className="text-gray-600 mb-4">
                Before you begin, make sure every item below is in place:
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-12 shadow-sm not-prose">
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Active Superkabe account (<Link href="/signup" className="text-blue-600 hover:text-blue-800 underline">Sign up here</Link>)</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Clay account with enriched lead data (email, name, company, job title)</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>At least one sender platform connected — <Link href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800 underline">Smartlead</Link>, <Link href="/docs/instantly-integration" className="text-blue-600 hover:text-blue-800 underline">Instantly</Link>, or <Link href="/docs/emailbison-integration" className="text-blue-600 hover:text-blue-800 underline">EmailBison</Link></span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span>Platform API key configured in Superkabe Settings</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        <span>Platform synced — campaigns and mailboxes pulled into Superkabe</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">6</span>
                        <span>At least one active campaign with mailboxes in your sender platform</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">7</span>
                        <span>At least one routing rule configured in Superkabe (<Link href="/docs/configuration" className="text-blue-600 hover:text-blue-800 underline">Configuration guide</Link>)</span>
                    </li>
                </ol>
            </div>

            {/* ==================== Section 4: Connect Your Sender Platform ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Step 1 — Connect Your Sender Platform</h2>
            <p className="text-gray-600 mb-6">
                Superkabe supports three sender platforms. Connect at least one to start routing leads.
            </p>

            {/* Smartlead */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm not-prose">
                <div className="flex items-center gap-3 mb-4">
                    <Image src="/smartlead.webp" alt="Smartlead" width={32} height={32} />
                    <h3 className="text-xl font-bold text-gray-900">Smartlead</h3>
                </div>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Get your API key from the Smartlead dashboard (Settings → API Keys)</li>
                    <li><strong>2.</strong> In Superkabe: go to <strong>Settings → Smartlead</strong> → paste your API key → click <strong>Save</strong></li>
                    <li><strong>3.</strong> Click <strong>Sync</strong> to pull your campaigns and mailboxes into Superkabe</li>
                </ol>
                <div className="mt-3">
                    <Link href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        View detailed Smartlead setup guide →
                    </Link>
                </div>
            </div>

            {/* Instantly */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm not-prose">
                <div className="flex items-center gap-3 mb-4">
                    <Image src="/instantly.png" alt="Instantly" width={32} height={32} />
                    <h3 className="text-xl font-bold text-gray-900">Instantly</h3>
                </div>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Get your API key from the Instantly dashboard (Settings → Integrations → API)</li>
                    <li><strong>2.</strong> In Superkabe: go to <strong>Settings → Instantly</strong> → paste your API key → click <strong>Save</strong></li>
                    <li><strong>3.</strong> Click <strong>Sync</strong> to pull your campaigns and mailboxes into Superkabe</li>
                </ol>
                <div className="mt-3">
                    <Link href="/docs/instantly-integration" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        View detailed Instantly setup guide →
                    </Link>
                </div>
            </div>

            {/* EmailBison */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm not-prose">
                <div className="flex items-center gap-3 mb-4">
                    <Image src="/emailbison.png" alt="EmailBison" width={32} height={32} />
                    <h3 className="text-xl font-bold text-gray-900">EmailBison</h3>
                </div>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Get your API key from the EmailBison dashboard</li>
                    <li><strong>2.</strong> In Superkabe: go to <strong>Settings → EmailBison</strong> → paste your API key → click <strong>Save</strong></li>
                    <li><strong>3.</strong> Click <strong>Sync</strong> to pull your campaigns and mailboxes into Superkabe</li>
                </ol>
                <div className="mt-3">
                    <Link href="/docs/emailbison-integration" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        View detailed EmailBison setup guide →
                    </Link>
                </div>
            </div>

            {/* ==================== Section 5: Create Campaigns ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Step 2 — Create Campaigns in Your Sender Platform</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-amber-700 mb-2">Important: Superkabe Does Not Create Campaigns</h3>
                <p className="text-gray-600">
                    Superkabe is a routing and protection layer — it does <strong>not</strong> create campaigns. You must create your email
                    campaigns (with sequences, mailboxes, and sending settings) inside Smartlead, Instantly, or EmailBison first.
                    Then sync Superkabe so it can see those campaigns and route leads into them.
                </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-12">
                <p className="text-gray-700 font-semibold mb-3">After creating campaigns in your sender platform:</p>
                <ol className="space-y-2 text-gray-600 text-sm">
                    <li><strong>1.</strong> Go to Superkabe <strong>Settings</strong></li>
                    <li><strong>2.</strong> Click <strong>Sync</strong> for your platform (Smartlead, Instantly, or EmailBison)</li>
                    <li><strong>3.</strong> Your campaigns will appear in the routing rule target campaign dropdown</li>
                    <li><strong>4.</strong> If you add new campaigns later, run Sync again to pull them in</li>
                </ol>
            </div>

            {/* ==================== Section 6: Routing Rules ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Step 3 — Set Up Routing Rules</h2>
            <p className="text-gray-600 mb-4">
                Routing rules tell Superkabe which campaign to assign each lead to. Rules are matched by persona and minimum lead score,
                and checked in priority order (lowest number first).
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> Go to <strong>Dashboard → Configuration</strong></li>
                    <li><strong>2.</strong> Click <strong>Create Rule</strong></li>
                    <li>
                        <strong>3.</strong> Fill in the rule fields:
                        <ul className="mt-2 ml-4 space-y-1">
                            <li>- <strong>Persona</strong> — exact match against the lead&apos;s persona field, or <code className="px-2 py-1 bg-white rounded text-purple-600 text-xs">*</code> for a catch-all rule</li>
                            <li>- <strong>Min Score</strong> — minimum lead_score required (0-100)</li>
                            <li>- <strong>Priority</strong> — lower number = checked first</li>
                            <li>- <strong>Target Campaign</strong> — dropdown grouped by platform (Smartlead / Instantly / EmailBison)</li>
                        </ul>
                    </li>
                    <li><strong>4.</strong> Save the rule and repeat for each ICP segment</li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Example Routing Rules</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-gray-600 font-semibold">Priority</th>
                            <th className="px-4 py-3 text-gray-600 font-semibold">Persona</th>
                            <th className="px-4 py-3 text-gray-600 font-semibold">Min Score</th>
                            <th className="px-4 py-3 text-gray-600 font-semibold">Target Campaign</th>
                            <th className="px-4 py-3 text-gray-600 font-semibold">Platform</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-4 py-3 text-gray-700 font-mono">1</td>
                            <td className="px-4 py-3 text-purple-600 font-medium">VP Engineering</td>
                            <td className="px-4 py-3 text-gray-700">70</td>
                            <td className="px-4 py-3 text-gray-700">Enterprise Outreach</td>
                            <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Image src="/smartlead.webp" alt="Smartlead" width={16} height={16} /> Smartlead</span></td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-gray-700 font-mono">2</td>
                            <td className="px-4 py-3 text-purple-600 font-medium">CTO</td>
                            <td className="px-4 py-3 text-gray-700">60</td>
                            <td className="px-4 py-3 text-gray-700">Technical Leaders</td>
                            <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Image src="/instantly.png" alt="Instantly" width={16} height={16} /> Instantly</span></td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-gray-700 font-mono">3</td>
                            <td className="px-4 py-3 text-purple-600 font-medium">*</td>
                            <td className="px-4 py-3 text-gray-700">50</td>
                            <td className="px-4 py-3 text-gray-700">General Outbound</td>
                            <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Image src="/smartlead.webp" alt="Smartlead" width={16} height={16} /> Smartlead</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h3 className="text-lg font-bold text-blue-700 mb-2">How Priority Works</h3>
                <p className="text-gray-600 text-sm">
                    Priority 1 is checked first. If a lead with persona &quot;VP Engineering&quot; and score 85 arrives, it matches rule 1 and goes to
                    the Enterprise Outreach campaign on Smartlead. The <code className="px-2 py-1 bg-white rounded text-purple-600 text-xs">*</code> wildcard
                    at priority 3 catches all remaining leads that did not match a more specific rule above it.
                </p>
                <div className="mt-3">
                    <Link href="/docs/configuration" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        Advanced routing configuration →
                    </Link>
                </div>
            </div>

            {/* ==================== Section 7: Configure Clay Webhook ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Step 4 — Configure Clay Webhook</h2>
            <p className="text-gray-600 mb-6">
                This is where you connect Clay to Superkabe so enriched leads flow in automatically.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4a. Get Your Credentials</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-3 text-gray-600 text-sm">
                    <li><strong>1.</strong> Log in to your Superkabe dashboard</li>
                    <li><strong>2.</strong> Navigate to <strong>Settings → Clay Integration</strong></li>
                    <li><strong>3.</strong> Copy your <strong>Organization ID</strong> (UUID format) and the <strong>Webhook URL</strong></li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4b. Add HTTP API Enrichment in Clay</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-4 text-gray-600 text-sm">
                    <li>
                        <strong>1. Open your Clay table</strong>
                        <p className="text-gray-500 mt-1">Navigate to the table containing your enriched leads</p>
                    </li>
                    <li>
                        <strong>2. Add an Enrichment Column</strong>
                        <p className="text-gray-500 mt-1">Click <strong>+ Add Enrichment</strong> → search for &quot;HTTP API&quot; or &quot;Webhook&quot;</p>
                    </li>
                    <li>
                        <strong>3. Configure the HTTP API Integration</strong>
                        <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Method:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">POST</code>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">URL:</p>
                                <code className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">https://api.superkabe.com/api/ingest/clay</code>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700 mb-1">Headers:</p>
                                <pre className="text-gray-700 bg-gray-50 p-3 rounded text-xs mt-1">{`Content-Type: application/json
x-organization-id: YOUR_ORG_ID`}</pre>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>4. Map Your Fields to JSON Body</strong>
                        <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-gray-500 mb-2">Use Clay&apos;s column references to map fields:</p>
                            <pre className="text-gray-700 bg-gray-50 p-3 rounded text-xs overflow-x-auto">{`{
  "email": {{email}},
  "firstName": {{firstName}},
  "lastName": {{lastName}},
  "company": {{company}},
  "persona": {{jobTitle}},
  "lead_score": {{leadScore}}
}`}</pre>
                            <p className="text-xs text-gray-500 mt-2">
                                You do not need to specify a campaign ID. Routing is handled automatically by your routing rules.
                            </p>
                        </div>
                    </li>
                    <li>
                        <strong>5. Test on a few rows first</strong>
                        <p className="text-gray-500 mt-1">Run the enrichment on 2-3 test rows before enabling &quot;Run on all rows&quot;</p>
                    </li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4c. Field Mapping Reference</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Field</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Type</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Example</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">email</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">john@company.com</td>
                            <td className="px-6 py-4 text-green-600 font-medium">Yes</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">persona</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">VP Engineering</td>
                            <td className="px-6 py-4 text-gray-400">Recommended</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">lead_score</td>
                            <td className="px-6 py-4 text-gray-600">Number</td>
                            <td className="px-6 py-4 text-gray-600">85</td>
                            <td className="px-6 py-4 text-gray-400">Recommended</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">firstName</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">John</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">lastName</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">Doe</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">company</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">Acme Corp</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-blue-700 mb-2">Field Flexibility</h3>
                <p className="text-gray-600 mb-3 text-sm">
                    Superkabe&apos;s Clay webhook supports <strong>case-insensitive field matching</strong>. All of these work interchangeably:
                </p>
                <ul className="space-y-1 text-gray-600 text-sm">
                    <li>- <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">email</code> = <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">Email</code> = <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">work email</code></li>
                    <li>- <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">persona</code> = <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">job title</code> = <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">title</code></li>
                    <li>- <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">lead_score</code> = <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">score</code> = <code className="px-2 py-1 bg-white rounded text-gray-700 text-xs">Lead Score</code></li>
                </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-700 mb-2">HMAC Security (Optional but Recommended)</h3>
                <p className="text-gray-600 text-sm">
                    For additional security, you can enable HMAC signature verification. When enabled, Superkabe generates a signing secret
                    that you include in your Clay webhook headers. Superkabe then validates every incoming request to confirm it came from
                    your Clay table and was not tampered with. Configure this in <strong>Settings → Clay Integration → HMAC Signing</strong>.
                </p>
            </div>

            {/* ==================== Section 8: What Happens When a Lead Arrives ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">What Happens When a Lead Arrives</h2>
            <p className="text-gray-600 mb-6">
                Once Clay sends a lead to Superkabe, it passes through four stages before reaching your sender platform.
                Understanding each stage helps you diagnose issues and know exactly where any lead is in the pipeline.
            </p>

            {/* Stage 1: Email Validation */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3">Stage 1: Email Validation</h3>
                <p className="text-gray-700 mb-3">
                    Before anything else, Superkabe checks whether the email address is real and safe to send to. This prevents
                    bounces from ever reaching your sender infrastructure.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Internal checks (all plans):</strong></p>
                    <ul className="ml-4 space-y-1">
                        <li>- <strong>Syntax validation</strong> — rejects malformed addresses (missing @, invalid characters)</li>
                        <li>- <strong>MX record lookup</strong> — confirms the recipient domain has mail servers</li>
                        <li>- <strong>Disposable domain detection</strong> — blocks throwaway email providers (mailinator.com, guerrillamail.com, etc.)</li>
                        <li>- <strong>Catch-all domain detection</strong> — flags domains that accept all addresses (higher bounce risk)</li>
                    </ul>
                    <p className="mt-3"><strong>API verification (Growth/Scale plans):</strong></p>
                    <ul className="ml-4 space-y-1">
                        <li>- <strong>MillionVerifier</strong> — verifies risky emails against a real-time verification API for definitive deliverability status</li>
                    </ul>
                    <p className="mt-3"><strong>Result:</strong> A validation score from 0-100 is assigned to the lead.</p>
                    <p className="mt-2"><strong>Where to see it:</strong> Leads page → click any lead → Email Validation card</p>
                </div>
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-sm font-medium">
                        Invalid and disposable emails are BLOCKED immediately. They never reach your sender platform, protecting your domain reputation.
                    </p>
                </div>
            </div>

            {/* Stage 2: Health Gate */}
            <div className="mb-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Stage 2: Health Gate Classification</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    After validation, the lead receives a health classification that determines whether it proceeds to routing:
                </p>

                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5">
                    <h4 className="font-bold text-green-800 mb-1">GREEN (score 80+)</h4>
                    <p className="text-gray-600 text-sm">
                        Safe to send. The email passed all validation checks with high confidence. Routed normally to the matching campaign.
                    </p>
                </div>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
                    <h4 className="font-bold text-amber-800 mb-1">YELLOW (score 50-79)</h4>
                    <p className="text-gray-600 text-sm">
                        Proceed with caution. The email is likely valid but has some risk factors (catch-all domain, limited verification data).
                        Routed to campaigns with risk-aware distribution.
                    </p>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                    <h4 className="font-bold text-red-800 mb-1">RED (score below 50)</h4>
                    <p className="text-gray-600 text-sm">
                        Blocked. The email is invalid, disposable, or too risky. The lead is marked <code className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">BLOCKED</code> and
                        never reaches a sender platform. This is your deliverability protection working as intended.
                    </p>
                </div>

                <p className="text-gray-500 text-sm mt-2">
                    <strong>Where to see it:</strong> Leads page → lead detail → Health Classification badge
                </p>
            </div>

            {/* Stage 3: Routing */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Stage 3: Routing</h3>
                <p className="text-gray-700 mb-3">
                    GREEN and YELLOW leads enter the routing engine. Superkabe evaluates your routing rules in priority order
                    (lowest number first) to find the right campaign.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                    <ul className="space-y-2">
                        <li>- Rules are checked in <strong>priority order</strong> (priority 1 before priority 2, etc.)</li>
                        <li>- The first rule where the lead&apos;s <strong>persona matches</strong> AND <strong>lead_score &gt;= min_score</strong> wins</li>
                        <li>- The lead is assigned to that rule&apos;s target campaign</li>
                        <li>- If <strong>no rule matches</strong>, the lead stays <code className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">HELD</code> — check your Configuration page to add a matching rule</li>
                    </ul>
                    <p className="mt-3"><strong>Where to see it:</strong> Leads page → lead detail → Execution Context shows the assigned campaign</p>
                </div>
            </div>

            {/* Stage 4: Platform Push */}
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-12">
                <h3 className="text-xl font-bold text-green-800 mb-3">Stage 4: Platform Push</h3>
                <p className="text-gray-700 mb-3">
                    After routing, Superkabe pushes the lead directly into the target campaign on your sender platform:
                </p>
                <div className="space-y-3 text-sm text-gray-600 not-prose">
                    <div className="flex items-center gap-2">
                        <Image src="/smartlead.webp" alt="Smartlead" width={20} height={20} />
                        <span><strong>Smartlead:</strong> POST /campaigns/{'{id}'}/leads with email, name, and company fields</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src="/instantly.png" alt="Instantly" width={20} height={20} />
                        <span><strong>Instantly:</strong> POST /leads with campaign mapping and contact data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src="/emailbison.png" alt="EmailBison" width={20} height={20} />
                        <span><strong>EmailBison:</strong> POST /leads with sender assignment and contact data</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <p className="text-green-700 font-medium">If push succeeds: lead is marked <code className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-bold">ACTIVE</code> — it is now in the campaign and will be sent to.</p>
                    <p className="text-amber-700 font-medium">If push fails: the campaign assignment is rolled back. The lead stays <code className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-bold">HELD</code> for automatic retry.</p>
                </div>
                <p className="text-gray-500 text-sm mt-3">
                    <strong>Where to see it:</strong> Leads page → lead status changes from HELD → ACTIVE upon successful push
                </p>
            </div>

            {/* ==================== Section 9: Monitoring After Push ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Monitoring After Push</h2>
            <p className="text-gray-600 mb-4">
                Once leads are ACTIVE in campaigns, Superkabe continues to protect your sending infrastructure:
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-12 shadow-sm">
                <ul className="space-y-3 text-gray-600 text-sm">
                    <li>- <strong>Bounce rate tracking</strong> — monitored per mailbox and per domain in real time</li>
                    <li>- <strong>Auto-pause</strong> — mailboxes are automatically paused if bounce thresholds are breached</li>
                    <li>- <strong>5-phase healing pipeline</strong> — paused mailboxes enter an automated recovery process to restore them safely</li>
                    <li>- <strong>Campaign health</strong> — campaigns are paused only when ALL their mailboxes are paused or removed</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/docs/monitoring" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        Monitoring system →
                    </Link>
                    <Link href="/docs/help/auto-healing" className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        Auto-healing pipeline →
                    </Link>
                </div>
            </div>

            {/* ==================== Section 10: Lead Statuses ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Understanding Lead Statuses</h2>
            <p className="text-gray-600 mb-4">
                Every lead in Superkabe has a status that tells you exactly where it is in the pipeline:
            </p>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-12 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Status</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">What It Means</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">What To Do</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">BLOCKED</code></td>
                            <td className="px-5 py-4 text-gray-600">Failed validation or health gate</td>
                            <td className="px-5 py-4 text-gray-600">Check lead detail for the reason. No action needed — this is protection working correctly.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">HELD</code></td>
                            <td className="px-5 py-4 text-gray-600">Passed validation but not yet in a campaign</td>
                            <td className="px-5 py-4 text-gray-600">Check routing rules — no rule may match this lead&apos;s persona or score. Or a platform push failed and will retry.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">ACTIVE</code></td>
                            <td className="px-5 py-4 text-gray-600">Successfully pushed to sender platform</td>
                            <td className="px-5 py-4 text-gray-600">Lead is in a campaign and will be emailed. No action needed.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">PAUSED</code></td>
                            <td className="px-5 py-4 text-gray-600">Campaign or mailbox was paused</td>
                            <td className="px-5 py-4 text-gray-600">Check campaign and mailbox health in the dashboard.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4"><code className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold">BOUNCED</code></td>
                            <td className="px-5 py-4 text-gray-600">Email bounced after sending</td>
                            <td className="px-5 py-4 text-gray-600">Check bounce analytics. The lead will not be sent to again.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ==================== Section 11: Troubleshooting ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Troubleshooting</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-12 shadow-sm not-prose">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Issue</th>
                            <th className="px-5 py-3 text-gray-600 font-semibold">Solution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Webhook returns 401</td>
                            <td className="px-5 py-4 text-gray-600">Check that the <code className="px-2 py-1 bg-gray-100 rounded text-xs">x-organization-id</code> header matches your org ID in Settings.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Leads not appearing in Superkabe</td>
                            <td className="px-5 py-4 text-gray-600">Verify the webhook URL ends with <code className="px-2 py-1 bg-gray-100 rounded text-xs">/api/ingest/clay</code>. Check that Clay is sending a POST request.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">All leads showing BLOCKED</td>
                            <td className="px-5 py-4 text-gray-600">Check if the emails are from disposable domains or have invalid syntax. Click a blocked lead to see the specific rejection reason.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Leads stuck in HELD status</td>
                            <td className="px-5 py-4 text-gray-600">No routing rule matches this lead&apos;s persona and score combination. Go to Configuration and add or adjust a rule.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Lead is HELD but has a campaign assigned</td>
                            <td className="px-5 py-4 text-gray-600">The platform push failed. Check your sender platform API key in Settings and verify the target campaign is still active.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Validation shows &quot;internal only&quot;</td>
                            <td className="px-5 py-4 text-gray-600">Upgrade to the Growth plan for MillionVerifier API verification. Internal checks (syntax, MX, disposable) are available on all plans.</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-4 text-gray-700 font-medium">Campaign not in routing dropdown</td>
                            <td className="px-5 py-4 text-gray-600">Run a platform sync first. Go to Settings → your platform → click <strong>Sync</strong> to pull in new campaigns.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ==================== Section 12: Next Steps ==================== */}
            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Next Steps</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm not-prose">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/docs/smartlead-integration" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Image src="/smartlead.webp" alt="Smartlead" width={24} height={24} />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Smartlead Integration</p>
                            <p className="text-xs text-gray-500">Detailed setup and webhook config</p>
                        </div>
                    </Link>
                    <Link href="/docs/instantly-integration" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Image src="/instantly.png" alt="Instantly" width={24} height={24} />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Instantly Integration</p>
                            <p className="text-xs text-gray-500">Detailed setup and webhook config</p>
                        </div>
                    </Link>
                    <Link href="/docs/emailbison-integration" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Image src="/emailbison.png" alt="EmailBison" width={24} height={24} />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">EmailBison Integration</p>
                            <p className="text-xs text-gray-500">Detailed setup and webhook config</p>
                        </div>
                    </Link>
                    <Link href="/docs/monitoring" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Image src="/image/logo-v2.png" alt="Monitoring" width={24} height={24} />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Infrastructure Monitoring</p>
                            <p className="text-xs text-gray-500">Bounce tracking and health dashboards</p>
                        </div>
                    </Link>
                    <Link href="/docs/help/email-validation" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Image src="/image/logo-v2.png" alt="Validation" width={24} height={24} />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Email Validation Explained</p>
                            <p className="text-xs text-gray-500">Deep dive into validation stages</p>
                        </div>
                    </Link>
                    <Link href="/docs/help/entity-statuses" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Image src="/image/logo-v2.png" alt="Statuses" width={24} height={24} />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">All Status Labels Explained</p>
                            <p className="text-xs text-gray-500">Leads, mailboxes, domains, campaigns</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

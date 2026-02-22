export default function ClayIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Clay Integration Guide
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Step-by-step guide to connect Clay tables with Drason for automated lead routing
            </p>

            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What You'll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    By the end of this guide, enriched leads from your Clay tables will automatically:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>✅ Flow into Drason for campaign routing</li>
                    <li>✅ <strong>Pass through the Lead Health Gate</strong> (blocking disposable/spam domains)</li>
                    <li>✅ Match to the correct Smartlead campaign based on ICP</li>
                    <li>✅ Be protected by real-time monitoring thresholds</li>
                </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-12">
                <h3 className="text-lg font-bold text-amber-700 mb-2">⚠️ Automatic Quality Filtering</h3>
                <p className="text-gray-600">
                    Drason automatically blocks leads with <strong>disposable domains</strong> (e.g., mailinator.com) or <strong>role-based emails</strong> (e.g., admin@).
                    These leads will be marked as <code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">BLOCKED</code> and will NOT be routed to Smartlead.
                </p>
            </div>

            {/* Prerequisites */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Prerequisites</h2>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                <ul className="space-y-3 text-gray-600">
                    <li>✓ Active Drason account (<a href="/signup" className="text-blue-600 hover:text-blue-800">Sign up here</a>)</li>
                    <li>✓ Clay account with at least one table containing lead data</li>
                    <li>✓ Your leads should have: <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">email</code>, <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">firstName</code>, <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">lastName</code>, <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">company</code></li>
                    <li>✓ Smartlead campaign IDs ready for routing</li>
                </ul>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 1: Get Your Organization ID</h2>
            <p className="text-gray-600 mb-4">
                Your organization ID is required for webhook authentication.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> Log in to Drason dashboard</li>
                    <li><strong>2.</strong> Navigate to <strong>Settings → API Keys</strong></li>
                    <li><strong>3.</strong> Copy your <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">Organization ID</code> (UUID format)</li>
                </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-amber-700 mb-2">🔒 Security Note</h3>
                <p className="text-gray-600">
                    Your Organization ID is safe to use in webhooks. It identifies your account but cannot be used to make unauthorized changes.
                </p>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 2: Prepare Your Clay Table</h2>
            <p className="text-gray-600 mb-4">
                Ensure your Clay table has the required fields for Drason ingestion.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Required Fields</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Field Name</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Type</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Example</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">email</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">john.doe@company.com</td>
                            <td className="px-6 py-4 text-green-600 font-medium">Yes</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">persona</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">VP Engineering</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">lead_score</td>
                            <td className="px-6 py-4 text-gray-600">Number</td>
                            <td className="px-6 py-4 text-gray-600">85</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
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
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-600">campaignId</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">sl_campaign_xyz</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-700 mb-2">💡 Field Flexibility</h3>
                <p className="text-gray-600 mb-4">
                    Drason's Clay webhook supports <strong>case-insensitive field matching</strong>. These work interchangeably:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• <code className="px-2 py-1 bg-white rounded text-gray-700">email</code> = <code className="px-2 py-1 bg-white rounded text-gray-700">Email</code> = <code className="px-2 py-1 bg-white rounded text-gray-700">work email</code></li>
                    <li>• <code className="px-2 py-1 bg-white rounded text-gray-700">persona</code> = <code className="px-2 py-1 bg-white rounded text-gray-700">job title</code> = <code className="px-2 py-1 bg-white rounded text-gray-700">title</code></li>
                    <li>• <code className="px-2 py-1 bg-white rounded text-gray-700">lead_score</code> = <code className="px-2 py-1 bg-white rounded text-gray-700">score</code> = <code className="px-2 py-1 bg-white rounded text-gray-700">Lead Score</code></li>
                </ul>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 3: Add Webhook Integration in Clay</h2>
            <p className="text-gray-600 mb-4">
                Configure Clay to send enriched leads to Drason automatically.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-4 text-gray-600">
                    <li>
                        <strong>1. Open your Clay table</strong>
                        <p className="text-sm text-gray-500 mt-1">Navigate to the table you want to integrate</p>
                    </li>
                    <li>
                        <strong>2. Add an Enrichment Column</strong>
                        <p className="text-sm text-gray-500 mt-1">Click <strong>+ Add Enrichment</strong> → Search for "HTTP API" or "Webhook"</p>
                    </li>
                    <li>
                        <strong>3. Configure the HTTP API Integration</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Method:</p>
                                <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded">POST</code>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">URL:</p>
                                <code className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm">https://api.drason.com/api/ingest/clay</code>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Headers:</p>
                                <pre className="text-gray-700 bg-gray-50 p-2 rounded text-xs mt-1">{`Content-Type: application/json
x-organization-id: YOUR_ORG_ID`}</pre>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>4. Map Your Fields to JSON Body</strong>
                        <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-2">Use Clay's column references:</p>
                            <pre className="text-gray-700 bg-gray-50 p-3 rounded text-xs overflow-x-auto">{`{
  "email": {{email}},
  "firstName": {{firstName}},
  "lastName": {{lastName}},
  "company": {{company}},
  "persona": {{jobTitle}},
  "lead_score": {{leadScore}},
  "campaignId": "sl_YOUR_CAMPAIGN_ID"
}`}</pre>
                        </div>
                    </li>
                    <li>
                        <strong>5. Run on existing rows</strong>
                        <p className="text-sm text-gray-500 mt-1">Test the integration on a few rows first, then enable "Run on all rows"</p>
                    </li>
                </ol>
            </div>

            {/* Step 4 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 4: Set Up Campaign Routing Rules</h2>
            <p className="text-gray-600 mb-4">
                Configure which leads go to which Smartlead campaigns based on ICP.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> In Drason, navigate to <strong>Dashboard → Routing Rules</strong></li>
                    <li><strong>2.</strong> Click <strong>Add Rule</strong></li>
                    <li><strong>3.</strong> Configure your rule:</li>
                </ol>
                <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 text-sm space-y-2">
                    <p><strong className="text-gray-700">Persona:</strong> <code className="px-2 py-1 bg-purple-50 rounded text-purple-600">VP Engineering</code></p>
                    <p><strong className="text-gray-700">Minimum Score:</strong> <code className="px-2 py-1 bg-blue-50 rounded text-blue-600">70</code></p>
                    <p><strong className="text-gray-700">Campaign ID:</strong> <code className="px-2 py-1 bg-green-50 rounded text-green-600">sl_campaign_abc123</code></p>
                </div>
                <ol start={4} className="space-y-3 text-gray-600 mt-4">
                    <li><strong>4.</strong> Repeat for each ICP segment you want to target</li>
                    <li><strong>5.</strong> Set rule priorities (higher priority rules are checked first)</li>
                </ol>
            </div>

            {/* Step 5 */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Step 5: Verify Integration</h2>
            <p className="text-gray-600 mb-4">
                Test that leads are flowing correctly from Clay to Drason.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> In Clay, trigger the webhook on 1-2 test rows</li>
                    <li><strong>2.</strong> In Drason dashboard, check <strong>Leads</strong> tab</li>
                    <li><strong>3.</strong> Verify the test leads appear with status <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">HELD</code> or <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">ACTIVE</code></li>
                    <li><strong>4.</strong> Check <strong>Audit Log</strong> to see routing decisions</li>
                    <li><strong>5.</strong> Confirm leads were assigned to the correct campaign</li>
                </ol>
            </div>

            {/* Troubleshooting */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Troubleshooting</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Issue</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Solution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Webhook returns 401</td>
                            <td className="px-6 py-4 text-gray-600">Check <code className="px-2 py-1 bg-gray-100 rounded">x-organization-id</code> header is correct</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Leads not appearing in Drason</td>
                            <td className="px-6 py-4 text-gray-600">Verify webhook URL: <code className="px-2 py-1 bg-gray-100 rounded text-xs">/api/ingest/clay</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">No campaign assigned</td>
                            <td className="px-6 py-4 text-gray-600">Check routing rules match persona/score criteria</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-700">Missing fields</td>
                            <td className="px-6 py-4 text-gray-600">Ensure Clay column mapping includes required fields</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">🎉 Integration Complete!</h2>
                <p className="text-gray-600 mb-4">
                    Your Clay leads are now flowing into Drason. Next steps:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/smartlead-integration" className="text-blue-600 hover:text-blue-800">Set up Smartlead webhook</a> for bounce monitoring</li>
                    <li>✓ <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-800">Review platform rules</a> to understand thresholds</li>
                    <li>✓ <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-800">Learn about monitoring</a> to track mailbox health</li>
                </ul>
            </div>
        </div>
    );
}

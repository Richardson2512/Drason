export default function ClayIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Clay Integration Guide
            </h1>
            <p className="text-xl text-gray-600 mb-12">
                Step-by-step guide to connect Clay tables with Drason for automated lead routing
            </p>

            {/* Overview */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4">What You'll Accomplish</h2>
                <p className="text-gray-600 mb-4">
                    By the end of this guide, enriched leads from your Clay tables will automatically:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li>✅ Flow into Drason for campaign routing</li>
                    <li>✅ Match to the correct Smartlead campaign based on ICP</li>
                    <li>✅ Be protected by real-time monitoring thresholds</li>
                </ol>
            </div>

            {/* Prerequisites */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Prerequisites</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <ul className="space-y-3 text-gray-600">
                    <li>✓ Active Drason account (<a href="/signup" className="text-blue-400 hover:text-blue-300">Sign up here</a>)</li>
                    <li>✓ Clay account with at least one table containing lead data</li>
                    <li>✓ Your leads should have: <code className="px-2 py-1 bg-gray-50 rounded">email</code>, <code className="px-2 py-1 bg-gray-50 rounded">firstName</code>, <code className="px-2 py-1 bg-gray-50 rounded">lastName</code>, <code className="px-2 py-1 bg-gray-50 rounded">company</code></li>
                    <li>✓ Smartlead campaign IDs ready for routing</li>
                </ul>
            </div>

            {/* Step 1 */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Step 1: Get Your Organization ID</h2>
            <p className="text-gray-600 mb-4">
                Your organization ID is required for webhook authentication.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> Log in to Drason dashboard</li>
                    <li><strong>2.</strong> Navigate to <strong>Settings → API Keys</strong></li>
                    <li><strong>3.</strong> Copy your <code className="px-2 py-1 bg-gray-800 rounded">Organization ID</code> (starts with <code className="px-2 py-1 bg-gray-800 rounded">org_</code>)</li>
                </ol>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">🔒 Security Note</h3>
                <p className="text-gray-600">
                    Your Organization ID is safe to use in webhooks. It identifies your account but cannot be used to make unauthorized changes.
                </p>
            </div>

            {/* Step 2 */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Step 2: Prepare Your Clay Table</h2>
            <p className="text-gray-600 mb-4">
                Ensure your Clay table has the required fields for Drason ingestion.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Required Fields</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Field Name</th>
                            <th className="px-6 py-3 text-gray-600">Type</th>
                            <th className="px-6 py-3 text-gray-600">Example</th>
                            <th className="px-6 py-3 text-gray-600">Required</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">email</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">john.doe@company.com</td>
                            <td className="px-6 py-4 text-green-400">Yes</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">persona</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">VP Engineering</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">lead_score</td>
                            <td className="px-6 py-4 text-gray-600">Number</td>
                            <td className="px-6 py-4 text-gray-600">85</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">firstName</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">John</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">lastName</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">Doe</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">company</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">Acme Corp</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-blue-300">campaignId</td>
                            <td className="px-6 py-4 text-gray-600">String</td>
                            <td className="px-6 py-4 text-gray-600">sl_campaign_xyz</td>
                            <td className="px-6 py-4 text-gray-400">Optional</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-400 mb-2">💡 Field Flexibility</h3>
                <p className="text-gray-600 mb-4">
                    Drason's Clay webhook supports <strong>case-insensitive field matching</strong>. These work interchangeably:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• <code className="px-2 py-1 bg-gray-50 rounded">email</code> = <code className="px-2 py-1 bg-gray-50 rounded">Email</code> = <code className="px-2 py-1 bg-gray-50 rounded">work email</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-50 rounded">persona</code> = <code className="px-2 py-1 bg-gray-50 rounded">job title</code> = <code className="px-2 py-1 bg-gray-50 rounded">title</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-50 rounded">lead_score</code> = <code className="px-2 py-1 bg-gray-50 rounded">score</code> = <code className="px-2 py-1 bg-gray-50 rounded">Lead Score</code></li>
                </ul>
            </div>

            {/* Step 3 */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Step 3: Add Webhook Integration in Clay</h2>
            <p className="text-gray-600 mb-4">
                Configure Clay to send enriched leads to Drason automatically.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <ol className="space-y-4 text-gray-600">
                    <li>
                        <strong>1. Open your Clay table</strong>
                        <p className="text-sm text-gray-400 mt-1">Navigate to the table you want to integrate</p>
                    </li>
                    <li>
                        <strong>2. Add an Enrichment Column</strong>
                        <p className="text-sm text-gray-400 mt-1">Click <strong>+ Add Enrichment</strong> → Search for "HTTP API" or "Webhook"</p>
                    </li>
                    <li>
                        <strong>3. Configure the HTTP API Integration</strong>
                        <div className="mt-2 bg-gray-800 rounded p-4 space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">Method:</p>
                                <code className="text-blue-300">POST</code>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">URL:</p>
                                <code className="text-green-300">https://api.drason.com/api/ingest/clay</code>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">Headers:</p>
                                <pre className="text-blue-300 text-xs mt-1">{`Content-Type: application/json
x-organization-id: YOUR_ORG_ID`}</pre>
                            </div>
                        </div>
                    </li>
                    <li>
                        <strong>4. Map Your Fields to JSON Body</strong>
                        <div className="mt-2 bg-gray-800 rounded p-4">
                            <p className="text-sm text-gray-400 mb-2">Use Clay's column references:</p>
                            <pre className="text-gray-600 text-xs overflow-x-auto">{`{
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
                        <p className="text-sm text-gray-400 mt-1">Test the integration on a few rows first, then enable "Run on all rows"</p>
                    </li>
                </ol>
            </div>

            {/* Step 4 */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Step 4: Set Up Campaign Routing Rules</h2>
            <p className="text-gray-600 mb-4">
                Configure which leads go to which Smartlead campaigns based on ICP.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> In Drason, navigate to <strong>Dashboard → Routing Rules</strong></li>
                    <li><strong>2.</strong> Click <strong>Add Rule</strong></li>
                    <li><strong>3.</strong> Configure your rule:</li>
                </ol>
                <div className="mt-4 bg-gray-800 rounded p-4 text-sm space-y-2">
                    <p><strong className="text-gray-600">Persona:</strong> <code className="px-2 py-1 bg-gray-50 rounded text-blue-300">VP Engineering</code></p>
                    <p><strong className="text-gray-600">Minimum Score:</strong> <code className="px-2 py-1 bg-gray-50 rounded text-blue-300">70</code></p>
                    <p><strong className="text-gray-600">Campaign ID:</strong> <code className="px-2 py-1 bg-gray-50 rounded text-green-300">sl_campaign_abc123</code></p>
                </div>
                <ol start={4} className="space-y-3 text-gray-600 mt-4">
                    <li><strong>4.</strong> Repeat for each ICP segment you want to target</li>
                    <li><strong>5.</strong> Set rule priorities (higher priority rules are checked first)</li>
                </ol>
            </div>

            {/* Step 5 */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Step 5: Verify Integration</h2>
            <p className="text-gray-600 mb-4">
                Test that leads are flowing correctly from Clay to Drason.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> In Clay, trigger the webhook on 1-2 test rows</li>
                    <li><strong>2.</strong> In Drason dashboard, check <strong>Leads</strong> tab</li>
                    <li><strong>3.</strong> Verify the test leads appear with status <code className="px-2 py-1 bg-gray-50 rounded">HELD</code> or <code className="px-2 py-1 bg-gray-50 rounded">ACTIVE</code></li>
                    <li><strong>4.</strong> Check <strong>Audit Log</strong> to see routing decisions</li>
                    <li><strong>5.</strong> Confirm leads were assigned to the correct campaign</li>
                </ol>
            </div>

            {/* Troubleshooting */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Troubleshooting</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Issue</th>
                            <th className="px-6 py-3 text-gray-600">Solution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 text-gray-600">Webhook returns 401</td>
                            <td className="px-6 py-4 text-gray-600">Check <code className="px-2 py-1 bg-gray-50 rounded">x-organization-id</code> header is correct</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-600">Leads not appearing in Drason</td>
                            <td className="px-6 py-4 text-gray-600">Verify webhook URL: <code className="px-2 py-1 bg-gray-50 rounded text-xs">/api/ingest/clay</code></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-600">No campaign assigned</td>
                            <td className="px-6 py-4 text-gray-600">Check routing rules match persona/score criteria</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-gray-600">Missing fields</td>
                            <td className="px-6 py-4 text-gray-600">Ensure Clay column mapping includes required fields</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Next Steps */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4">🎉 Integration Complete!</h2>
                <p className="text-gray-600 mb-4">
                    Your Clay leads are now flowing into Drason. Next steps:
                </p>
                <ul className="space-y-2 text-gray-600">
                    <li>✓ <a href="/docs/smartlead-integration" className="text-blue-400 hover:text-blue-300">Set up Smartlead webhook</a> for bounce monitoring</li>
                    <li>✓ <a href="/docs/platform-rules" className="text-blue-400 hover:text-blue-300">Review platform rules</a> to understand thresholds</li>
                    <li>✓ <a href="/docs/monitoring" className="text-blue-400 hover:text-blue-300">Learn about monitoring</a> to track mailbox health</li>
                </ul>
            </div>
        </div>
    );
}

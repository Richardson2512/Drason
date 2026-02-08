export default function APIIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                API & Webhook Integration
            </h1>
            <p className="text-xl text-gray-600 mb-12">
                Complete API reference for integrating Clay webhooks, Smartlead monitoring, and direct lead ingestion
            </p>

            {/* Overview */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4">Integration Overview</h2>
                <p className="text-gray-600 mb-4">
                    Drason provides three primary integration points:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li><strong>1. Clay Webhook</strong> — Receive enriched leads from Clay tables</li>
                    <li><strong>2. Smartlead Webhook</strong> — Monitor bounce/sent events from Smartlead campaigns</li>
                    <li><strong>3. Direct Ingestion API</strong> — Programmatic lead submission</li>
                </ol>
            </div>

            {/* SECTION 1: Clay Webhook */}
            <h2 className="text-3xl font-bold mb-4 mt-12">1. Clay Webhook Integration</h2>
            <p className="text-gray-600 mb-6">
                Send enriched leads from Clay directly to Drason for campaign routing and protection.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Endpoint</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <code className="text-green-300">POST https://api.drason.com/api/ingest/clay</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Authentication</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <p className="text-gray-600 mb-4">
                    <strong>Header:</strong> <code className="px-2 py-1 bg-gray-50 rounded">x-organization-id</code>
                </p>
                <p className="text-gray-600">
                    Your organization ID from Drason dashboard (Settings → API Keys)
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Request Body</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 overflow-x-auto">
                <pre className="text-sm text-gray-600">
                    {`{
  "email": "john.doe@example.com",          // Required
  "persona": "VP Engineering",              // Optional, defaults to "General"
  "lead_score": 85,                         // Optional, defaults to 50
  "firstName": "John",                      // Optional
  "lastName": "Doe",                        // Optional
  "company": "Acme Corp",                   // Optional
  "campaignId": "smartlead_campaign_xyz"    // Optional (for direct assignment)
}`}
                </pre>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">💡 Flexible Field Mapping</h3>
                <p className="text-gray-600 mb-4">
                    Clay webhook supports <strong>case-insensitive field lookup</strong>:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• <code className="px-2 py-1 bg-gray-50 rounded">email</code>, <code className="px-2 py-1 bg-gray-50 rounded">E-mail</code>, or <code className="px-2 py-1 bg-gray-50 rounded">work email</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-50 rounded">persona</code>, <code className="px-2 py-1 bg-gray-50 rounded">job title</code>, <code className="px-2 py-1 bg-gray-50 rounded">title</code>, or <code className="px-2 py-1 bg-gray-50 rounded">role</code></li>
                    <li>• <code className="px-2 py-1 bg-gray-50 rounded">lead score</code>, <code className="px-2 py-1 bg-gray-50 rounded">score</code>, or <code className="px-2 py-1 bg-gray-50 rounded">lead_score</code></li>
                </ul>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Response</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <pre className="text-sm text-green-300">
                    {`{
  "message": "Lead ingested successfully",
  "leadId": "lead_abc123",
  "assignedCampaignId": "smartlead_xyz" // null if no routing rule matched
}`}
                </pre>
            </div>

            {/* SECTION 2: Smartlead Webhook */}
            <h2 className="text-3xl font-bold mb-4 mt-12">2. Smartlead Webhook Integration</h2>
            <p className="text-gray-600 mb-6">
                Smartlead sends real-time bounce and delivery events to Drason for monitoring.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Endpoint</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <code className="text-green-300">POST https://api.drason.com/api/monitor/smartlead-webhook</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Setup in Smartlead</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> Navigate to Smartlead → Settings → Webhooks</li>
                    <li><strong>2.</strong> Add webhook URL: <code className="px-2 py-1 bg-gray-50 rounded">https://api.drason.com/api/monitor/smartlead-webhook</code></li>
                    <li><strong>3.</strong> Add header: <code className="px-2 py-1 bg-gray-50 rounded">x-organization-id: YOUR_ORG_ID</code></li>
                    <li><strong>4.</strong> Select events: <code className="px-2 py-1 bg-gray-50 rounded">email_sent</code>, <code className="px-2 py-1 bg-gray-50 rounded">email_bounce</code>, <code className="px-2 py-1 bg-gray-50 rounded">delivery_failure</code></li>
                    <li><strong>5.</strong> (Optional) Configure webhook secret in Drason Settings for signature validation</li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Supported Event Types</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Smartlead Event</th>
                            <th className="px-6 py-3 text-gray-600">Drason Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-blue-300">email_sent</td>
                            <td className="px-6 py-4 text-gray-600">Increment mailbox send count</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-red-300">email_bounce</td>
                            <td className="px-6 py-4 text-gray-600">Record hard bounce, check thresholds</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-red-300">hard_bounce</td>
                            <td className="px-6 py-4 text-gray-600">Record hard bounce, check thresholds</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-yellow-300">soft_bounce</td>
                            <td className="px-6 py-4 text-gray-600">Log soft bounce (no threshold trigger)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-red-300">delivery_failure</td>
                            <td className="px-6 py-4 text-gray-600">Record failure, update risk score</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Expected Payload Format</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <pre className="text-sm text-gray-600">
                    {`{
  "event": "email_bounce",
  "mailbox_id": "mailbox_abc123",      // or "mailbox": {...}
  "campaign_id": "campaign_xyz",
  "email": "recipient@example.com",
  "timestamp": "2026-02-08T12:00:00Z"
}`}
                </pre>
            </div>

            {/* SECTION 3: Direct Ingestion API */}
            <h2 className="text-3xl font-bold mb-4 mt-12">3. Direct Ingestion API</h2>
            <p className="text-gray-600 mb-6">
                Programmatically submit leads to Drason from your own systems.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Endpoint</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <code className="text-green-300">POST https://api.drason.com/api/ingest</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Authentication</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <p className="text-gray-600 mb-4">
                    <strong>Header:</strong> <code className="px-2 py-1 bg-gray-50 rounded">x-organization-id</code>
                </p>
                <p className="text-gray-600">
                    Your organization ID from Drason dashboard
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Request Body</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <pre className="text-sm text-gray-600">
                    {`{
  "email": "jane.smith@company.com",   // Required
  "persona": "CTO",                    // Required
  "lead_score": 90,                    // Required (0-100)
  "source": "api"                      // Optional
}`}
                </pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8">Response</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <pre className="text-sm text-green-300">
                    {`{
  "message": "Lead ingested successfully",
  "leadId": "lead_def456",
  "assignedCampaignId": "campaign_123"
}`}
                </pre>
            </div>

            {/* Error Codes */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Error Codes</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Status</th>
                            <th className="px-6 py-3 text-gray-600">Reason</th>
                            <th className="px-6 py-3 text-gray-600">Solution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 text-red-400 font-semibold">400</td>
                            <td className="px-6 py-4 text-gray-600">Missing required fields</td>
                            <td className="px-6 py-4 text-gray-600">Check request body for email, persona, lead_score</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-400 font-semibold">401</td>
                            <td className="px-6 py-4 text-gray-600">Missing organization context</td>
                            <td className="px-6 py-4 text-gray-600">Add <code className="px-2 py-1 bg-gray-50 rounded">x-organization-id</code> header</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-400 font-semibold">409</td>
                            <td className="px-6 py-4 text-gray-600">Duplicate webhook event</td>
                            <td className="px-6 py-4 text-gray-600">Event already processed (idempotency)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-400 font-semibold">500</td>
                            <td className="px-6 py-4 text-gray-600">Internal server error</td>
                            <td className="px-6 py-4 text-gray-600">Retry with exponential backoff</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Best Practices */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mt-8">
                <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
                <ul className="space-y-3 text-gray-600">
                    <li>
                        <strong className="text-green-400">1. Idempotency:</strong> All webhook endpoints use idempotency keys to prevent duplicate processing
                    </li>
                    <li>
                        <strong className="text-green-400">2. Retries:</strong> Implement exponential backoff for 5xx errors
                    </li>
                    <li>
                        <strong className="text-green-400">3. Webhook Security:</strong> Configure webhook secrets in Smartlead and Drason for signature validation
                    </li>
                    <li>
                        <strong className="text-green-400">4. Field Mapping:</strong> Use consistent field names in Clay to avoid case-sensitivity issues
                    </li>
                    <li>
                        <strong className="text-green-400">5. Monitoring:</strong> Check Drason audit logs to verify successful webhook delivery
                    </li>
                </ul>
            </div>

            {/* Testing */}
            <h2 className="text-3xl font-bold mb-4 mt-12">Testing Your Integration</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">cURL Example - Clay Webhook</h3>
                <pre className="text-sm text-blue-300 overflow-x-auto">
                    {`curl -X POST https://api.drason.com/api/ingest/clay \\
  -H "Content-Type: application/json" \\
  -H "x-organization-id: org_YOUR_ORG_ID" \\
  -d '{
    "email": "test@example.com",
    "persona": "VP Sales",
    "lead_score": 75,
    "firstName": "Test",
    "lastName": "User"
  }'`}
                </pre>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">cURL Example - Smartlead Webhook Test</h3>
                <pre className="text-sm text-blue-300 overflow-x-auto">
                    {`curl -X POST https://api.drason.com/api/monitor/smartlead-webhook \\
  -H "Content-Type: application/json" \\
  -H "x-organization-id: org_YOUR_ORG_ID" \\
  -d '{
    "event": "email_bounce",
    "mailbox_id": "mailbox_test_123",
    "campaign_id": "campaign_abc",
    "email": "bounced@example.com"
  }'`}
                </pre>
            </div>
        </div>
    );
}

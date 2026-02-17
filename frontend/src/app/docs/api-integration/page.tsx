export default function APIIntegrationPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                API & Webhook Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Complete API reference for integrating Clay webhooks, Smartlead monitoring, and direct lead ingestion
            </p>

            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Integration Overview</h2>
                <p className="text-gray-600 mb-4">
                    Superkabe provides three primary integration points:
                </p>
                <ol className="space-y-2 text-gray-600">
                    <li><strong>1. Clay Webhook</strong> — Receive enriched leads from Clay tables</li>
                    <li><strong>2. Smartlead Webhook</strong> — Monitor bounce/sent events from Smartlead campaigns</li>
                    <li><strong>3. Direct Ingestion API</strong> — Programmatic lead submission</li>
                </ol>
            </div>

            {/* SECTION 1: Clay Webhook */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">1. Clay Webhook Integration</h2>
            <p className="text-gray-600 mb-6">
                Send enriched leads from Clay directly to Superkabe for campaign routing and protection.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Endpoint</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <code className="text-green-600">POST https://api.superkabe.com/api/ingest/clay</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Authentication</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-gray-600 mb-4">
                    <strong>Header:</strong> <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">x-organization-id</code>
                </p>
                <p className="text-gray-600">
                    Your organization ID from Superkabe dashboard (Settings → API Keys)
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Request Body</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 overflow-x-auto">
                <pre className="text-sm text-gray-700">
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

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-amber-700 mb-2">💡 Flexible Field Mapping</h3>
                <p className="text-gray-600 mb-4">
                    Clay webhook supports <strong>case-insensitive field lookup</strong>:
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• <code className="px-2 py-1 bg-white rounded text-gray-700">email</code>, <code className="px-2 py-1 bg-white rounded text-gray-700">E-mail</code>, or <code className="px-2 py-1 bg-white rounded text-gray-700">work email</code></li>
                    <li>• <code className="px-2 py-1 bg-white rounded text-gray-700">persona</code>, <code className="px-2 py-1 bg-white rounded text-gray-700">job title</code>, <code className="px-2 py-1 bg-white rounded text-gray-700">title</code>, or <code className="px-2 py-1 bg-white rounded text-gray-700">role</code></li>
                    <li>• <code className="px-2 py-1 bg-white rounded text-gray-700">lead score</code>, <code className="px-2 py-1 bg-white rounded text-gray-700">score</code>, or <code className="px-2 py-1 bg-white rounded text-gray-700">lead_score</code></li>
                </ul>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Response</h3>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
                <pre className="text-sm text-green-700">
                    {`{
  "message": "Lead ingested successfully",
  "leadId": "lead_abc123",
  "assignedCampaignId": "smartlead_xyz" // null if no routing rule matched
}`}
                </pre>
            </div>

            {/* SECTION 2: Smartlead Webhook */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">2. Smartlead Webhook Integration</h2>
            <p className="text-gray-600 mb-6">
                Smartlead sends real-time bounce and delivery events to Superkabe for monitoring.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Endpoint</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <code className="text-green-600">POST https://api.superkabe.com/api/monitor/smartlead-webhook</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Setup in Smartlead</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <ol className="space-y-3 text-gray-600">
                    <li><strong>1.</strong> Navigate to Smartlead → Settings → Webhooks</li>
                    <li><strong>2.</strong> Add webhook URL: <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">https://api.superkabe.com/api/monitor/smartlead-webhook</code></li>
                    <li><strong>3.</strong> Add header: <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">x-organization-id: YOUR_ORG_ID</code></li>
                    <li><strong>4.</strong> Select events: <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">email_sent</code>, <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">email_bounce</code>, <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">delivery_failure</code></li>
                    <li><strong>5.</strong> (Optional) Configure webhook secret in Superkabe Settings for signature validation</li>
                </ol>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Supported Event Types</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Smartlead Event</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Superkabe Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-blue-600">email_sent</td>
                            <td className="px-6 py-4 text-gray-600">Increment mailbox send count</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-red-600">email_bounce</td>
                            <td className="px-6 py-4 text-gray-600">Record hard bounce, check thresholds</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-red-600">hard_bounce</td>
                            <td className="px-6 py-4 text-gray-600">Record hard bounce, check thresholds</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-amber-600">soft_bounce</td>
                            <td className="px-6 py-4 text-gray-600">Log soft bounce (no threshold trigger)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono text-sm text-red-600">delivery_failure</td>
                            <td className="px-6 py-4 text-gray-600">Record failure, update risk score</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Expected Payload Format</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-8">
                <pre className="text-sm text-gray-700">
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
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">3. Direct Ingestion API</h2>
            <p className="text-gray-600 mb-6">
                Programmatically submit leads to Superkabe from your own systems.
            </p>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Endpoint</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <code className="text-green-600">POST https://api.superkabe.com/api/ingest</code>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Authentication</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <p className="text-gray-600 mb-4">
                    <strong>Header:</strong> <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">x-organization-id</code>
                </p>
                <p className="text-gray-600">
                    Your organization ID from Superkabe dashboard
                </p>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Request Body</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
                <pre className="text-sm text-gray-700">
                    {`{
  "email": "jane.smith@company.com",   // Required
  "persona": "CTO",                    // Required
  "lead_score": 90,                    // Required (0-100)
  "source": "api"                      // Optional
}`}
                </pre>
            </div>

            <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Response</h3>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
                <pre className="text-sm text-green-700">
                    {`{
  "message": "Lead ingested successfully",
  "leadId": "lead_def456",
  "assignedCampaignId": "campaign_123"
}`}
                </pre>
            </div>

            {/* Error Codes */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Error Codes</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Status</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Reason</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Solution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-semibold">400</td>
                            <td className="px-6 py-4 text-gray-600">Missing required fields</td>
                            <td className="px-6 py-4 text-gray-600">Check request body for email, persona, lead_score</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-semibold">401</td>
                            <td className="px-6 py-4 text-gray-600">Missing organization context</td>
                            <td className="px-6 py-4 text-gray-600">Add <code className="px-2 py-1 bg-gray-100 rounded">x-organization-id</code> header</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-semibold">409</td>
                            <td className="px-6 py-4 text-gray-600">Duplicate webhook event</td>
                            <td className="px-6 py-4 text-gray-600">Event already processed (idempotency)</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-red-600 font-semibold">500</td>
                            <td className="px-6 py-4 text-gray-600">Internal server error</td>
                            <td className="px-6 py-4 text-gray-600">Retry with exponential backoff</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Best Practices */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Best Practices</h2>
                <ul className="space-y-3 text-gray-600">
                    <li>
                        <strong className="text-green-700">1. Idempotency:</strong> All webhook endpoints use idempotency keys to prevent duplicate processing
                    </li>
                    <li>
                        <strong className="text-green-700">2. Retries:</strong> Implement exponential backoff for 5xx errors
                    </li>
                    <li>
                        <strong className="text-green-700">3. Webhook Security:</strong> Configure webhook secrets in Smartlead and Superkabe for signature validation
                    </li>
                    <li>
                        <strong className="text-green-700">4. Field Mapping:</strong> Use consistent field names in Clay to avoid case-sensitivity issues
                    </li>
                    <li>
                        <strong className="text-green-700">5. Monitoring:</strong> Check Superkabe audit logs to verify successful webhook delivery
                    </li>
                </ul>
            </div>

            {/* Testing */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Testing Your Integration</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">cURL Example - Clay Webhook</h3>
                <pre className="text-sm text-blue-600 overflow-x-auto">
                    {`curl -X POST https://api.superkabe.com/api/ingest/clay \\
  -H "Content-Type: application/json" \\
  -H "x-organization-id: YOUR_ORG_ID" \\
  -d '{
    "email": "test@example.com",
    "persona": "VP Sales",
    "lead_score": 75,
    "firstName": "Test",
    "lastName": "User"
  }'`}
                </pre>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">cURL Example - Smartlead Webhook Test</h3>
                <pre className="text-sm text-blue-600 overflow-x-auto">
                    {`curl -X POST https://api.superkabe.com/api/monitor/smartlead-webhook \\
  -H "Content-Type: application/json" \\
  -H "x-organization-id: YOUR_ORG_ID" \\
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

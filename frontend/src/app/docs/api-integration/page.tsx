import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'API & Webhook Integration | Superkabe Docs',
 description: 'Complete API reference for Clay webhooks and direct lead ingestion into Superkabe.',
 alternates: { canonical: '/docs/api-integration' },
 openGraph: {
 title: 'API & Webhook Integration | Superkabe Docs',
 description: 'Complete API reference for Clay webhooks and direct lead ingestion into Superkabe.',
 url: '/docs/api-integration',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function APIIntegrationPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 API & Webhook Integration
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Complete API reference for Clay webhooks, direct lead ingestion, and campaign resolution
 </p>

 {/* Overview */}
 <div className="bg-blue-50 border border-blue-200 p-6 mb-12">
 <h2 className="text-2xl font-bold mb-4 text-gray-900">Integration Overview</h2>
 <p className="text-gray-600 mb-4">
 Superkabe provides three primary integration points:
 </p>
 <ol className="space-y-2 text-gray-600">
 <li><strong>1. Clay Webhook</strong> — Receive enriched leads from Clay tables</li>
 <li><strong>2. Direct Ingestion API</strong> — Programmatic lead submission</li>
 <li><strong>3. Campaign Resolution API</strong> — Automate stalled campaign recovery</li>
 </ol>
 </div>

 {/* SECTION 1: Clay Webhook */}
 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">1. Clay Webhook Integration</h2>
 <p className="text-gray-600 mb-6">
 Send enriched leads from Clay directly to Superkabe for campaign routing and protection.
 </p>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Endpoint</h3>
 <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
 <code className="text-green-600">POST https://api.superkabe.com/api/ingest/clay</code>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Authentication</h3>
 <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
 <p className="text-gray-600 mb-4">
 <strong>Header:</strong> <code className="px-2 py-1 bg-gray-100 text-gray-700">x-organization-id</code>
 </p>
 <p className="text-gray-600">
 Your organization ID from Superkabe dashboard (Settings → API Keys)
 </p>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Request Body</h3>
 <div className="bg-gray-50 border border-gray-200 p-4 mb-6 overflow-x-auto">
 <pre className="text-sm text-gray-700">
 {`{
 "email": "john.doe@example.com", // Required
 "persona": "VP Engineering", // Optional, defaults to "General"
 "lead_score": 85, // Optional, defaults to 50
 "firstName": "John", // Optional
 "lastName": "Doe", // Optional
 "company": "Acme Corp", // Optional
 "campaignId": "campaign_xyz" // Optional (for direct assignment)
}`}
 </pre>
 </div>

 <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
 <h3 className="text-lg font-bold text-amber-700 mb-2">💡 Flexible Field Mapping</h3>
 <p className="text-gray-600 mb-4">
 Clay webhook supports <strong>case-insensitive field lookup</strong>:
 </p>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li>• <code className="px-2 py-1 bg-white text-gray-700">email</code>, <code className="px-2 py-1 bg-white text-gray-700">E-mail</code>, or <code className="px-2 py-1 bg-white text-gray-700">work email</code></li>
 <li>• <code className="px-2 py-1 bg-white text-gray-700">persona</code>, <code className="px-2 py-1 bg-white text-gray-700">job title</code>, <code className="px-2 py-1 bg-white text-gray-700">title</code>, or <code className="px-2 py-1 bg-white text-gray-700">role</code></li>
 <li>• <code className="px-2 py-1 bg-white text-gray-700">lead score</code>, <code className="px-2 py-1 bg-white text-gray-700">score</code>, or <code className="px-2 py-1 bg-white text-gray-700">lead_score</code></li>
 </ul>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Response</h3>
 <div className="bg-green-50 border border-green-200 p-4 mb-8">
 <pre className="text-sm text-green-700">
 {`{
 "message": "Lead ingested successfully",
 "leadId": "lead_abc123",
 "assignedCampaignId": "campaign_xyz" // null if no routing rule matched
}`}
 </pre>
 </div>

 {/* SECTION 2: Direct Ingestion API */}
 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">2. Direct Ingestion API</h2>
 <p className="text-gray-600 mb-6">
 Programmatically submit leads to Superkabe from your own systems.
 </p>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Endpoint</h3>
 <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
 <code className="text-green-600">POST https://api.superkabe.com/api/ingest</code>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Authentication</h3>
 <div className="bg-white border border-gray-200 p-6 mb-6 shadow-sm">
 <p className="text-gray-600 mb-4">
 <strong>Header:</strong> <code className="px-2 py-1 bg-gray-100 text-gray-700">x-organization-id</code>
 </p>
 <p className="text-gray-600">
 Your organization ID from Superkabe dashboard
 </p>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Request Body</h3>
 <div className="bg-gray-50 border border-gray-200 p-4 mb-6">
 <pre className="text-sm text-gray-700">
 {`{
 "email": "jane.smith@company.com", // Required
 "persona": "CTO", // Required
 "lead_score": 90, // Required (0-100)
 "source": "api" // Optional
}`}
 </pre>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">Response</h3>
 <div className="bg-green-50 border border-green-200 p-4 mb-8">
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
 <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm">
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
 <td className="px-6 py-4 text-gray-600">Add <code className="px-2 py-1 bg-gray-100 ">x-organization-id</code> header</td>
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
 <div className="bg-green-50 border border-green-200 p-6 mt-8">
 <h2 className="text-2xl font-bold mb-4 text-gray-900">Best Practices</h2>
 <ul className="space-y-3 text-gray-600">
 <li>
 <strong className="text-green-700">1. Idempotency:</strong> All webhook endpoints use idempotency keys to prevent duplicate processing
 </li>
 <li>
 <strong className="text-green-700">2. Retries:</strong> Implement exponential backoff for 5xx errors
 </li>
 <li>
 <strong className="text-green-700">3. Webhook Security:</strong> Configure webhook secrets in Clay and Superkabe for HMAC signature validation
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
 <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
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

 </div>
 );
}

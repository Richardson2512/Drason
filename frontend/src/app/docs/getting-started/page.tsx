import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Getting Started | Superkabe Docs',
 description: 'Set up Superkabe to protect your outbound email infrastructure in minutes. Connect your sending platforms and start monitoring.',
 alternates: { canonical: '/docs/getting-started' },
 openGraph: {
 title: 'Getting Started | Superkabe Docs',
 description: 'Set up Superkabe to protect your outbound email infrastructure in minutes. Connect your sending platforms and start monitoring.',
 url: '/docs/getting-started',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function GettingStartedPage() {
 return (
 <div className="prose prose-lg max-w-none">
 <h1 className="text-5xl font-bold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
 Getting Started
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Set up Superkabe to protect your outbound infrastructure in minutes
 </p>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What is Superkabe?</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 Superkabe is an AI-powered cold email platform with native deliverability protection. Draft sequences with AI, send across unlimited mailboxes (Google Workspace, Microsoft 365, or any SMTP provider), validate every lead, and let the protection layer auto-pause, reroute, and heal your senders in real time. You can also run Superkabe in Protection Mode — connecting your Gmail, Microsoft 365, or SMTP mailboxes to send natively with the same safety layer.
 </p>
 <p className="text-gray-600 leading-relaxed mb-4">
 Every lead that enters Superkabe flows through the same pipeline: email validation (syntax, MX, disposable, catch-all, plus MillionVerifier API on risky leads), the GREEN/YELLOW/RED health gate, ESP-aware mailbox routing, and continuous post-send monitoring with a 5-phase auto-healing recovery pipeline for any mailbox that degrades.
 </p>

 <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
 <h3 className="font-bold text-blue-900 text-lg mb-3">What Superkabe Does</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Email Validation</strong> — Syntax, MX records, disposable domains, catch-all detection + MillionVerifier API for risky leads</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Health Gate</strong> — Classifies leads as GREEN (safe), YELLOW (caution), or RED (block) based on validation score and domain health</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Lead Routing</strong> — Routes leads to campaigns by persona and minimum score, with wildcard catch-all rules and priority ordering</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Real-Time Monitoring</strong> — Checks mailbox health every 60 seconds: bounce rates, SMTP/IMAP connectivity, DNS authentication</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Auto-Pause</strong> — Pauses mailboxes and domains when bounce thresholds are breached, with correlation engine to detect root cause</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>5-Phase Healing</strong> — Paused → Quarantine → Restricted Send → Warm Recovery → Healthy. Fully automated with graduation criteria per phase</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Mailbox Rotation</strong> — When a mailbox is paused, a healthy standby mailbox is automatically swapped in to keep campaigns sending</div>
 <div className="flex items-start gap-2 text-blue-800"><span className="text-blue-500 mt-0.5">▸</span> <strong>Native sending</strong> — Gmail, Microsoft 365, or SMTP mailboxes connected via OAuth or encrypted credentials</div>
 </div>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How It Works</h2>
 <p className="text-gray-600 leading-relaxed mb-4">
 When a lead enters Superkabe — from a Clay webhook, API call, or CSV upload — it passes through a multi-stage pipeline before reaching your sending platform:
 </p>
 <div className="bg-white border border-gray-200 p-6 mb-8 shadow-lg shadow-gray-100">
 <ol className="space-y-4 text-gray-600 list-decimal list-inside">
 <li><strong className="text-gray-900">Email Validation:</strong> Every email is checked for syntax, MX records, disposable domains, and catch-all detection. Growth and Scale plans additionally verify risky leads through the MillionVerifier API. Invalid emails are blocked here — they never reach your sender.</li>
 <li><strong className="text-gray-900">Health Gate:</strong> Each lead receives a GREEN (safe), YELLOW (proceed with caution), or RED (block) classification based on validation score, domain health, and engagement signals. RED leads are blocked.</li>
 <li><strong className="text-gray-900">Routing:</strong> GREEN and YELLOW leads are matched to campaigns using your routing rules (persona + minimum score). YELLOW leads are distributed with per-mailbox risk caps — no more than 2 risky leads per 60 sends per mailbox.</li>
 <li><strong className="text-gray-900">Native Send:</strong> Validated, routed leads enter Superkabe&apos;s sequencer for dispatch through your connected mailboxes. Lead status changes to ACTIVE when enrolled in a sequence.</li>
 <li><strong className="text-gray-900">Monitoring:</strong> Once campaigns are running, Superkabe monitors mailbox health every 60 seconds — bounce rates, SMTP/IMAP connectivity, DNS authentication (SPF, DKIM, DMARC), and domain reputation.</li>
 <li><strong className="text-gray-900">Protection:</strong> When a mailbox exceeds bounce thresholds, Superkabe auto-pauses it and removes it from campaigns on the platform. The correlation engine checks if the root cause is the mailbox, the domain, or a bad campaign before deciding what to pause.</li>
 <li><strong className="text-gray-900">Healing:</strong> Paused mailboxes enter a 5-phase recovery pipeline: Pause (cooldown) → Quarantine (DNS verification) → Restricted Send (conservative warmup) → Warm Recovery (graduated volume) → Healthy (re-added to campaigns). Each phase has specific graduation criteria.</li>
 <li><strong className="text-gray-900">Alerts:</strong> Every significant action — pauses, rotations, healings, threshold breaches — triggers a Slack notification with context about what happened and what Superkabe did.</li>
 </ol>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Quick Start</h2>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">1. Create an Account</h3>
 <p className="text-gray-600">
 Sign up at <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">superkabe.com/signup</code> and choose your pricing tier.
 </p>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">2. Connect Your Sending Platform</h3>
 <p className="text-gray-600 mb-4">
 Navigate to <strong className="text-gray-900">Mailboxes</strong> and connect your sending mailboxes via OAuth (Gmail or Microsoft 365) or encrypted SMTP credentials:
 </p>
 <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
 <code className="text-blue-600">Settings → Integrations → Add API Key</code>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">3. Set Up Clay Webhook</h3>
 <p className="text-gray-600 mb-4">
 In Clay, configure your webhook to send enriched leads to Superkabe:
 </p>
 <div className="bg-gray-50 border border-gray-200 p-4 mb-4">
 <code className="text-green-600">https://api.superkabe.com/api/ingest/clay</code>
 </div>
 <p className="text-gray-600 mb-2">
 Include header: <code className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800">x-organization-id: YOUR_ORG_ID</code>
 </p>
 <p className="text-gray-600">
 Include fields: email, firstName, lastName, company, persona (job title), lead_score. See the <a href="/docs/clay-integration" className="text-blue-600 hover:text-blue-800">full Clay integration guide</a> for detailed setup.
 </p>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">4. Choose System Mode</h3>
 <div className="bg-blue-50 border border-blue-200 p-6 mb-6">
 <p className="text-gray-700 mb-4">
 Superkabe operates in 3 modes:
 </p>
 <ul className="space-y-3">
 <li>
 <strong className="text-blue-600">OBSERVE:</strong>
 <span className="text-gray-600 ml-2">Logs events without blocking (testing)</span>
 </li>
 <li>
 <strong className="text-green-600">SUGGEST:</strong>
 <span className="text-gray-600 ml-2">Provides recommendations without automated action</span>
 </li>
 <li>
 <strong className="text-purple-600">ENFORCE:</strong>
 <span className="text-gray-600 ml-2">Fully automated protection (production)</span>
 </li>
 </ul>
 </div>

 <h3 className="text-2xl font-semibold mb-3 mt-8 text-gray-900">5. Monitor Your Dashboard</h3>
 <p className="text-gray-600">
 View real-time stats on:
 </p>
 <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
 <li>Active leads by state (held, active, paused)</li>
 <li>Mailbox health and bounce rates</li>
 <li>Domain-level aggregations</li>
 <li>Execution gate blocking reasons</li>
 </ul>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What Happens Next?</h2>
 <p className="text-gray-600 mb-4">
 Once integrated, Superkabe will automatically:
 </p>
 <ol className="space-y-3 text-gray-600 list-decimal list-inside mb-8">
 <li>Validate every incoming lead (syntax, MX, disposable, catch-all, MillionVerifier for risky leads)</li>
 <li>Block invalid and disposable emails before they reach your sender</li>
 <li>Classify leads as GREEN/YELLOW/RED and route them to campaigns by persona and score</li>
 <li>Enroll validated leads in Superkabe sequencer campaigns for native dispatch</li>
 <li>Monitor mailbox health every 60 seconds (bounce rates, connectivity, DNS)</li>
 <li>Auto-pause mailboxes when bounce thresholds are breached</li>
 <li>Correlate failures across mailboxes, domains, and campaigns to find root cause</li>
 <li>Rotate in standby mailboxes to keep campaigns sending</li>
 <li>Heal paused mailboxes through the 5-phase recovery pipeline</li>
 <li>Send Slack alerts for every significant infrastructure event</li>
 </ol>

 <div className="bg-amber-50 border border-amber-200 p-6 mt-8">
 <h3 className="text-xl font-bold text-amber-700 mb-2">💡 Pro Tip</h3>
 <p className="text-gray-700">
 Start in <strong className="text-gray-900">OBSERVE</strong> mode for your first week to understand baseline metrics
 before enabling <strong className="text-gray-900">ENFORCE</strong> mode for production protection.
 </p>
 </div>

 <div className="mt-12 bg-white border border-gray-200 p-6 shadow-lg shadow-gray-100">
 <h3 className="text-xl font-bold mb-3 text-gray-900">Next Steps</h3>
 <ul className="space-y-2">
 <li>
 <a href="/docs/platform-rules" className="text-blue-600 hover:text-blue-700 font-medium">
 → Read Platform Rules to understand thresholds
 </a>
 </li>
 <li>
 <a href="/docs/monitoring" className="text-blue-600 hover:text-blue-700 font-medium">
 → Learn about the Monitoring System
 </a>
 </li>
 <li>
 <a href="/docs/configuration" className="text-blue-600 hover:text-blue-700 font-medium">
 → Configure thresholds for your team
 </a>
 </li>
 </ul>
 </div>
 </div>
 );
}

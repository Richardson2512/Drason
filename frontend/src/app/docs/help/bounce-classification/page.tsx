import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'How Does Bounce Classification Work? | Superkabe Help',
 description: 'Learn how Superkabe classifies hard and soft bounces, calculates bounce rates, and automatically protects your sender reputation with threshold enforcement.',
 alternates: { canonical: '/docs/help/bounce-classification' },
 openGraph: {
 title: 'How Does Bounce Classification Work? | Superkabe Help',
 description: 'Learn how Superkabe classifies hard and soft bounces, calculates bounce rates, and automatically protects your sender reputation with threshold enforcement.',
 url: '/docs/help/bounce-classification',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function BounceClassificationPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 How Does Bounce Classification Work?
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Understanding how Superkabe classifies bounces and enforces thresholds to protect your sender reputation
 </p>

 {/* Quick Answer */}
 <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
 <p className="text-blue-800 mb-4">
 Superkabe classifies every bounce event as either a <strong>hard bounce</strong> (permanent failure) or <strong>soft bounce</strong> (temporary issue).
 Only hard bounces count toward your bounce rate. When a mailbox exceeds the <strong>3% hard bounce threshold</strong> after a minimum of 60 sends,
 Superkabe automatically pauses it to prevent reputation damage.
 </p>
 </div>

 {/* Hard vs Soft */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">What Is the Difference Between Hard and Soft Bounces?</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
 <div className="bg-red-50 border-2 border-red-200 p-6">
 <div className="text-3xl mb-3">🔴</div>
 <h3 className="text-xl font-bold text-red-900 mb-3">Hard Bounces</h3>
 <p className="text-gray-700 mb-4 text-sm">
 Permanent delivery failures. The email can never be delivered to this address. These are the bounces that damage your reputation.
 </p>
 <ul className="space-y-2 text-sm text-gray-600">
 <li>&#x2022; <strong>5xx SMTP codes</strong> &mdash; Recipient address doesn't exist</li>
 <li>&#x2022; <strong>Invalid domain</strong> &mdash; The domain has no MX records</li>
 <li>&#x2022; <strong>Mailbox disabled</strong> &mdash; Account has been deactivated</li>
 <li>&#x2022; <strong>Rejected by policy</strong> &mdash; Permanent block by receiving server</li>
 </ul>
 <div className="mt-4 bg-red-100 p-3">
 <p className="text-xs text-red-800 font-medium">These count toward your bounce rate and trigger automatic protections.</p>
 </div>
 </div>

 <div className="bg-amber-50 border-2 border-amber-200 p-6">
 <div className="text-3xl mb-3">🟡</div>
 <h3 className="text-xl font-bold text-amber-900 mb-3">Soft Bounces</h3>
 <p className="text-gray-700 mb-4 text-sm">
 Temporary delivery failures. The email might be deliverable if retried later. These do not count toward your bounce rate.
 </p>
 <ul className="space-y-2 text-sm text-gray-600">
 <li>&#x2022; <strong>Mailbox full</strong> &mdash; Recipient's inbox is over quota</li>
 <li>&#x2022; <strong>Server temporarily unavailable</strong> &mdash; Transient connectivity issue</li>
 <li>&#x2022; <strong>Rate limiting</strong> &mdash; Sending too fast to this server</li>
 <li>&#x2022; <strong>Message too large</strong> &mdash; Attachment size exceeded</li>
 </ul>
 <div className="mt-4 bg-amber-100 p-3">
 <p className="text-xs text-amber-800 font-medium">Logged but do not trigger automatic protections. Your sending platform may retry these.</p>
 </div>
 </div>
 </div>

 {/* How Is Bounce Rate Calculated */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How Is Bounce Rate Calculated?</h2>
 <div className="bg-white border-2 border-gray-200 p-8 mb-12 shadow-sm">
 <div className="bg-gray-50 p-6 mb-6 text-center">
 <p className="text-lg font-mono text-gray-800 mb-2">
 <strong>Bounce Rate</strong> = (Hard Bounces &divide; Total Emails Sent) &times; 100
 </p>
 <p className="text-sm text-gray-500">Only hard bounces are included. Soft bounces are excluded from this calculation.</p>
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">Below 2%</span>
 <span className="text-gray-600 text-sm">Healthy &mdash; No action needed</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">2% &ndash; 3%</span>
 <span className="text-gray-600 text-sm">Warning &mdash; Monitor closely, clean your list</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">Above 3%</span>
 <span className="text-gray-600 text-sm">Critical &mdash; Mailbox auto-paused (after minimum 60 sends)</span>
 </div>
 </div>
 </div>

 {/* What Happens When Threshold Is Exceeded */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">What Happens When the Bounce Threshold Is Exceeded?</h2>
 <div className="bg-gradient-to-br from-gray-50 to-red-50 border border-gray-200 p-8 mb-12">
 <ol className="space-y-4">
 <li className="flex items-start gap-3">
 <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
 <div>
 <h3 className="font-bold text-gray-900">Immediate Mailbox Pause</h3>
 <p className="text-gray-600 text-sm">The mailbox is automatically paused and removed from all active campaigns to stop further damage.</p>
 </div>
 </li>
 <li className="flex items-start gap-3">
 <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
 <div>
 <h3 className="font-bold text-gray-900">Notification Sent</h3>
 <p className="text-gray-600 text-sm">You receive a critical notification explaining why the mailbox was paused, with the current bounce rate and send count.</p>
 </div>
 </li>
 <li className="flex items-start gap-3">
 <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
 <div>
 <h3 className="font-bold text-gray-900">Cooldown Period Begins</h3>
 <p className="text-gray-600 text-sm">A cooldown timer starts (4-48 hours depending on history). This gives receiving servers time to &ldquo;forget&rdquo; the bad behavior.</p>
 </div>
 </li>
 <li className="flex items-start gap-3">
 <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
 <div>
 <h3 className="font-bold text-gray-900">Auto-Healing Pipeline Starts</h3>
 <p className="text-gray-600 text-sm">The 5-phase recovery process begins automatically. The mailbox progresses through quarantine, restricted sending, warm recovery, and back to healthy.</p>
 </div>
 </li>
 </ol>
 </div>

 {/* Where Can I See Bounce Data */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Where Can I See Bounce Data?</h2>
 <div className="space-y-4 mb-12">
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">Mailboxes Page</h3>
 <p className="text-gray-600 text-sm">View per-mailbox bounce count, bounce rate (color-coded), delivery failures, recovery phase, clean sends, relapse count, and resilience score. Sort mailboxes by bounce rate to identify problem accounts quickly.</p>
 </div>
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">Domains Page</h3>
 <p className="text-gray-600 text-sm">See aggregate bounce rates across all mailboxes on a domain. If 50%+ of a domain's mailboxes are unhealthy, the domain itself is flagged.</p>
 </div>
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">Analytics Page</h3>
 <p className="text-gray-600 text-sm">Track daily bounce trends per campaign over time. Bounce spikes are immediately visible in the trend chart as red area fills.</p>
 </div>
 <div className="bg-white border border-gray-200 p-6 shadow-sm">
 <h3 className="font-bold text-gray-900 mb-2">Audit Logs</h3>
 <p className="text-gray-600 text-sm">Every bounce event is recorded with the exact SMTP code, mailbox affected, and resulting system action (pause, phase transition, etc.).</p>
 </div>
 </div>

 {/* Resilience Score */}
 <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 p-8 mb-12">
 <h2 className="text-2xl font-bold mb-4 text-gray-900">What Is the Resilience Score?</h2>
 <p className="text-gray-700 mb-4">
 Each mailbox has a <strong>Resilience Score</strong> (0-100) that reflects its long-term health stability. Frequent relapses lower the score while sustained clean sending raises it.
 </p>
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">70-100</span>
 <span className="text-gray-600 text-sm">Strong &mdash; Mailbox has a clean track record</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">30-69</span>
 <span className="text-gray-600 text-sm">Moderate &mdash; Some recovery history, monitor closely</span>
 </div>
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">0-29</span>
 <span className="text-gray-600 text-sm">Weak &mdash; Frequent relapses, consider replacing this mailbox</span>
 </div>
 </div>
 </div>

 {/* Related Articles */}
 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
 <div className="space-y-2">
 <a href="/docs/help/auto-healing" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Auto-Healing Works (5-Phase Pipeline)
 </a>
 <a href="/docs/help/campaign-paused" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Why Is My Campaign Paused?
 </a>
 <a href="/docs/help/infrastructure-score-explained" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Understanding Infrastructure Score
 </a>
 </div>
 </div>
 </div>
 );
}

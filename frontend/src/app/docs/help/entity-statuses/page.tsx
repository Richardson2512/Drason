import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Understanding Status Labels | Superkabe Help',
 description: 'A comprehensive reference for all status labels across Superkabe — mailboxes, domains, campaigns, and leads — with color codes and recommended actions.',
 alternates: { canonical: '/docs/help/entity-statuses' },
 openGraph: {
 title: 'Understanding Status Labels | Superkabe Help',
 description: 'A comprehensive reference for all status labels across Superkabe — mailboxes, domains, campaigns, and leads — with color codes and recommended actions.',
 url: '/docs/help/entity-statuses',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function EntityStatusesPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 Understanding Status Labels
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 A complete reference for every status across mailboxes, domains, campaigns, and leads
 </p>

 {/* Quick Answer */}
 <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
 <p className="text-blue-800">
 Every entity in Superkabe has a status that tells you its current health. <strong>Green = healthy</strong>,{' '}
 <strong>yellow = warning</strong>, <strong>red = paused or blocked</strong>. Statuses are managed automatically
 by the system &mdash; you rarely need to change them manually.
 </p>
 </div>

 {/* Color Legend */}
 <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 p-8 mb-12">
 <h2 className="text-2xl font-bold mb-6 text-gray-900">Color Guide</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
 <div className="text-center p-4 bg-white border border-gray-200">
 <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
 <p className="text-sm font-bold text-gray-900">Green</p>
 <p className="text-xs text-gray-500">Healthy / Active</p>
 </div>
 <div className="text-center p-4 bg-white border border-gray-200">
 <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto mb-2"></div>
 <p className="text-sm font-bold text-gray-900">Yellow / Amber</p>
 <p className="text-xs text-gray-500">Warning / Recovering</p>
 </div>
 <div className="text-center p-4 bg-white border border-gray-200">
 <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
 <p className="text-sm font-bold text-gray-900">Red</p>
 <p className="text-xs text-gray-500">Paused / Blocked</p>
 </div>
 <div className="text-center p-4 bg-white border border-gray-200">
 <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2"></div>
 <p className="text-sm font-bold text-gray-900">Gray</p>
 <p className="text-xs text-gray-500">Unknown / Pending</p>
 </div>
 </div>
 </div>

 {/* Mailbox Statuses */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Mailbox Statuses</h2>
 <p className="text-gray-700 mb-6">
 Mailboxes have the most statuses because they go through the auto-healing pipeline when issues arise.
 </p>
 <div className="space-y-4 mb-12">
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">healthy</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The mailbox is fully operational with no health concerns. Bounce rate is within acceptable limits. All sending privileges are active.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> None needed. Keep monitoring.</p>
 </div>

 <div className="bg-white border-l-4 border-amber-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">warning</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The mailbox is showing early signs of trouble. Bounce rate is between 2&ndash;3%, approaching the threshold. Still sending but at risk.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Review your email list quality. Consider pausing low-quality campaigns using this mailbox.</p>
 </div>

 <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">paused</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The mailbox has been auto-paused due to exceeding the 3% bounce threshold (after 60+ sends). It has been removed from all campaigns and is in the cooldown phase of auto-healing.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Wait for the cooldown to expire. The system handles recovery automatically.</p>
 </div>

 <div className="bg-white border-l-4 border-amber-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">quarantine</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">Cooldown has expired. The system is now validating DNS health (SPF, DKIM, blacklists). No sending allowed until checks pass.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Verify your DNS records are correct. Check for blacklist listings. See the quarantine help article for details.</p>
 </div>

 <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">restricted_send</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">DNS checks passed. The mailbox is now sending at very low volume (5 emails/day) to prove it can deliver cleanly. Every send is monitored.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Ensure only high-quality leads are being sent to. Any bounce resets progress.</p>
 </div>

 <div className="bg-white border-l-4 border-blue-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">warm_recovery</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">Restricted sending was successful. Volume is ramping up (25 emails/day) with continued monitoring. The mailbox must sustain clean sends for 3&ndash;7 days.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Almost there. Continue monitoring and avoid adding low-quality leads.</p>
 </div>
 </div>

 {/* Domain Statuses */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Domain Statuses</h2>
 <p className="text-gray-700 mb-6">
 Domain status reflects the aggregate health of all mailboxes on that domain.
 </p>
 <div className="space-y-4 mb-12">
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">healthy</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">Most mailboxes on this domain are healthy. DNS records are valid. No blacklist issues detected.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> None needed.</p>
 </div>

 <div className="bg-white border-l-4 border-amber-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">warning</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">Some mailboxes on this domain are unhealthy, but fewer than 50%. The domain is at risk if more mailboxes degrade.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Review which mailboxes are struggling. Check DNS records proactively.</p>
 </div>

 <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">paused</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">50% or more of the domain&rsquo;s mailboxes are paused or unhealthy. The entire domain is flagged as compromised.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Investigate DNS issues, blacklist status, and email list quality. This domain needs immediate attention.</p>
 </div>
 </div>

 {/* Campaign Statuses */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Campaign Statuses</h2>
 <p className="text-gray-700 mb-6">
 Campaign statuses reflect the sending state of each campaign on your platform.
 </p>
 <div className="space-y-4 mb-12">
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">active</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The campaign is actively sending emails. At least one healthy mailbox is assigned to it.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> None needed. Monitor bounce rates on the analytics page.</p>
 </div>

 <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">paused</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The campaign has stopped sending. This happens only when <strong>all</strong> mailboxes assigned to the campaign are paused or removed. Bounce rate alone never pauses a campaign.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Wait for mailboxes to recover through auto-healing, or assign new healthy mailboxes manually.</p>
 </div>

 <div className="bg-white border-l-4 border-gray-400 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">completed</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">All leads in the campaign have been contacted. No more emails will be sent from this campaign.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Review campaign analytics. Archive if no longer needed.</p>
 </div>

 <div className="bg-white border-l-4 border-gray-400 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">deleted</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The campaign has been deleted on your sending platform. Superkabe retains historical data for analytics but no actions can be taken.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> None. Data is preserved for reporting purposes.</p>
 </div>
 </div>

 {/* Lead Statuses */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Lead Statuses</h2>
 <p className="text-gray-700 mb-6">
 Lead statuses track each contact from ingestion through to delivery outcome.
 </p>
 <div className="space-y-4 mb-12">
 <div className="bg-white border-l-4 border-amber-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">held</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The lead has been ingested but not yet pushed to the sending platform. Could be waiting for routing, failed a push attempt, or is queued for retry.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Check audit logs if a lead stays held for more than a few minutes.</p>
 </div>

 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">active</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The lead has been successfully pushed to the sending platform and is part of an active campaign sequence.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> None needed. The lead is being contacted.</p>
 </div>

 <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">paused</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The lead&rsquo;s sequence has been paused, typically because the campaign or mailbox was paused.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Will resume automatically when the campaign/mailbox recovers.</p>
 </div>

 <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">bounced</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">An email sent to this lead resulted in a hard bounce. The address is confirmed undeliverable. No further emails will be sent.</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> Remove this contact from your lists. The address is invalid.</p>
 </div>

 <div className="bg-white border-l-4 border-red-500 p-6 shadow-sm">
 <div className="flex items-center gap-3 mb-2">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">invalid</span>
 </div>
 <p className="text-gray-700 text-sm mb-2">The lead&rsquo;s email address failed validation before any email was sent. Caught by the hybrid validation layer (syntax, MX, disposable, or API verification).</p>
 <p className="text-gray-500 text-xs"><strong>Action:</strong> This lead was blocked to protect your reputation. No action needed unless you believe the validation was incorrect.</p>
 </div>
 </div>

 {/* Important Rules */}
 <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-amber-900">Important Rules About Status Changes</h2>
 <ul className="space-y-3 text-sm text-amber-800">
 <li>&#x2022; <strong>All status changes go through the Entity State Service</strong> &mdash; a single authority that enforces rules and logs every transition.</li>
 <li>&#x2022; <strong>Campaigns never pause on bounce rate alone</strong> &mdash; only when all assigned mailboxes are paused or removed.</li>
 <li>&#x2022; <strong>Mailbox recovery phases cannot be skipped</strong> &mdash; every mailbox must progress through the full healing pipeline.</li>
 <li>&#x2022; <strong>Domain status is derived from its mailboxes</strong> &mdash; if 50%+ of mailboxes are unhealthy, the domain status escalates.</li>
 </ul>
 </div>

 {/* Quick Reference Table */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Quick Reference</h2>
 <div className="bg-white border-2 border-gray-200 p-6 mb-12 shadow-sm overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b-2 border-gray-200">
 <th className="text-left py-3 px-4 text-gray-900">Entity</th>
 <th className="text-left py-3 px-4 text-gray-900">Status</th>
 <th className="text-left py-3 px-4 text-gray-900">Color</th>
 <th className="text-left py-3 px-4 text-gray-900">Sending?</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr><td className="py-2 px-4">Mailbox</td><td className="py-2 px-4">healthy</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Green</td><td className="py-2 px-4">Yes</td></tr>
 <tr><td className="py-2 px-4">Mailbox</td><td className="py-2 px-4">warning</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span> Amber</td><td className="py-2 px-4">Yes</td></tr>
 <tr><td className="py-2 px-4">Mailbox</td><td className="py-2 px-4">paused</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Red</td><td className="py-2 px-4">No</td></tr>
 <tr><td className="py-2 px-4">Mailbox</td><td className="py-2 px-4">quarantine</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span> Amber</td><td className="py-2 px-4">No</td></tr>
 <tr><td className="py-2 px-4">Mailbox</td><td className="py-2 px-4">restricted_send</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span> Blue</td><td className="py-2 px-4">Limited</td></tr>
 <tr><td className="py-2 px-4">Mailbox</td><td className="py-2 px-4">warm_recovery</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span> Blue</td><td className="py-2 px-4">Limited</td></tr>
 <tr className="border-t-2 border-gray-200"><td className="py-2 px-4">Domain</td><td className="py-2 px-4">healthy</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Green</td><td className="py-2 px-4">Yes</td></tr>
 <tr><td className="py-2 px-4">Domain</td><td className="py-2 px-4">warning</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span> Amber</td><td className="py-2 px-4">Yes</td></tr>
 <tr><td className="py-2 px-4">Domain</td><td className="py-2 px-4">paused</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Red</td><td className="py-2 px-4">No</td></tr>
 <tr className="border-t-2 border-gray-200"><td className="py-2 px-4">Campaign</td><td className="py-2 px-4">active</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Green</td><td className="py-2 px-4">Yes</td></tr>
 <tr><td className="py-2 px-4">Campaign</td><td className="py-2 px-4">paused</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Red</td><td className="py-2 px-4">No</td></tr>
 <tr><td className="py-2 px-4">Campaign</td><td className="py-2 px-4">completed</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span> Gray</td><td className="py-2 px-4">No</td></tr>
 <tr><td className="py-2 px-4">Campaign</td><td className="py-2 px-4">deleted</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span> Gray</td><td className="py-2 px-4">No</td></tr>
 <tr className="border-t-2 border-gray-200"><td className="py-2 px-4">Lead</td><td className="py-2 px-4">held</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span> Amber</td><td className="py-2 px-4">Pending</td></tr>
 <tr><td className="py-2 px-4">Lead</td><td className="py-2 px-4">active</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Green</td><td className="py-2 px-4">Yes</td></tr>
 <tr><td className="py-2 px-4">Lead</td><td className="py-2 px-4">paused</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Red</td><td className="py-2 px-4">No</td></tr>
 <tr><td className="py-2 px-4">Lead</td><td className="py-2 px-4">bounced</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Red</td><td className="py-2 px-4">No</td></tr>
 <tr><td className="py-2 px-4">Lead</td><td className="py-2 px-4">invalid</td><td className="py-2 px-4"><span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> Red</td><td className="py-2 px-4">Blocked</td></tr>
 </tbody>
 </table>
 </div>

 {/* Related Articles */}
 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
 <div className="space-y-2">
 <a href="/docs/help/auto-healing" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Auto-Healing Works (5-Phase Pipeline)
 </a>
 <a href="/docs/help/quarantine" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Why Is My Mailbox In Quarantine?
 </a>
 <a href="/docs/help/email-validation" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Does Email Validation Work?
 </a>
 <a href="/docs/help/bounce-classification" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Does Bounce Classification Work?
 </a>
 </div>
 </div>
 </div>
 );
}

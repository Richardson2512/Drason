import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Why Is My Mailbox In Quarantine? | Superkabe Help',
 description: 'Learn what quarantine means in the Superkabe healing pipeline, why your mailbox is stuck, and how to fix it to resume sending.',
 alternates: { canonical: '/docs/help/quarantine' },
 openGraph: {
 title: 'Why Is My Mailbox In Quarantine? | Superkabe Help',
 description: 'Learn what quarantine means in the Superkabe healing pipeline, why your mailbox is stuck, and how to fix it to resume sending.',
 url: '/docs/help/quarantine',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function QuarantinePage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 Why Is My Mailbox In Quarantine?
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Understanding the quarantine phase and how to get your mailbox back to sending
 </p>

 {/* Quick Answer */}
 <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
 <p className="text-blue-800">
 Your mailbox is in quarantine because it was auto-paused and the cooldown period has expired. The system is now
 checking if your domain&rsquo;s DNS is healthy before allowing any sends. If DNS checks pass, your mailbox
 will automatically graduate to the next recovery phase.
 </p>
 </div>

 {/* What Is Quarantine */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">What Does Quarantine Mean?</h2>
 <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-8 mb-12">
 <p className="text-gray-700 mb-4 text-lg">
 Quarantine is <strong>Phase 2</strong> of the auto-healing pipeline. It sits between the initial cooldown pause and
 the restricted sending phase. Think of it as a health checkpoint &mdash; the system needs to confirm your infrastructure
 is sound before it lets any mail flow again.
 </p>
 <div className="bg-white p-6 border border-amber-200">
 <h3 className="font-bold text-gray-900 mb-3">Where Quarantine Fits in the Pipeline</h3>
 <div className="flex flex-wrap items-center gap-2 text-sm">
 <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">Phase 1: Paused</span>
 <span className="text-gray-400">&rarr;</span>
 <span className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full font-bold ring-2 ring-amber-400">Phase 2: Quarantine</span>
 <span className="text-gray-400">&rarr;</span>
 <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">Phase 3: Restricted Send</span>
 <span className="text-gray-400">&rarr;</span>
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">Phase 4: Warm Recovery</span>
 <span className="text-gray-400">&rarr;</span>
 <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">Phase 5: Healthy</span>
 </div>
 </div>
 </div>

 {/* What Is Being Checked */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">What Is the System Checking?</h2>
 <p className="text-gray-700 mb-6">
 During quarantine, Superkabe runs a full DNS health audit on your mailbox&rsquo;s domain. All checks must pass before the mailbox can move forward.
 </p>
 <div className="space-y-4 mb-12">
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
 SPF
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-1">SPF Record</h3>
 <p className="text-gray-600 text-sm">Verifies that your domain&rsquo;s SPF record exists and includes the sending servers you use. A missing or misconfigured SPF record means receiving servers can&rsquo;t trust your mail.</p>
 </div>
 </div>
 </div>
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
 DKIM
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-1">DKIM Record</h3>
 <p className="text-gray-600 text-sm">Confirms your DKIM signing key is published correctly. DKIM proves that emails haven&rsquo;t been tampered with in transit. Missing DKIM significantly increases spam placement risk.</p>
 </div>
 </div>
 </div>
 <div className="bg-white border-l-4 border-green-500 p-6 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
 BL
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-1">Blacklist Check</h3>
 <p className="text-gray-600 text-sm">Scans major blacklists (Spamhaus, Barracuda, SORBS, SpamCop) for your domain and sending IPs. Being listed on any of these will block delivery to large portions of the internet.</p>
 </div>
 </div>
 </div>
 </div>

 {/* What Keeps a Mailbox Stuck */}
 <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-red-900">What Keeps a Mailbox Stuck in Quarantine?</h2>
 <p className="text-red-800 mb-4">
 Your mailbox will remain in quarantine indefinitely until the underlying issues are resolved. Common blockers:
 </p>
 <ul className="space-y-3 text-sm text-red-800">
 <li>&#x2022; <strong>Missing or broken SPF record</strong> &mdash; Your DNS provider may have overwritten it, or you exceeded the 10-lookup limit</li>
 <li>&#x2022; <strong>Missing or invalid DKIM record</strong> &mdash; The DKIM key wasn&rsquo;t published, or it doesn&rsquo;t match what your sending platform expects</li>
 <li>&#x2022; <strong>Domain is blacklisted</strong> &mdash; Your domain or IP appears on one or more major blacklists</li>
 <li>&#x2022; <strong>DNS propagation delay</strong> &mdash; You fixed the record but it hasn&rsquo;t propagated yet (can take up to 48 hours)</li>
 </ul>
 </div>

 {/* How to Fix It */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How to Fix It</h2>
 <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 mb-12">
 <div className="space-y-6">
 <div>
 <h3 className="font-bold text-gray-900 mb-2">Step 1: Check Your DNS Records</h3>
 <p className="text-gray-600 text-sm mb-2">
 Log into your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.) and verify:
 </p>
 <ul className="text-sm text-gray-600 space-y-1">
 <li>&#x2022; SPF record exists as a TXT record on your root domain</li>
 <li>&#x2022; DKIM record exists as a TXT or CNAME record (check your sending platform for the exact selector)</li>
 <li>&#x2022; No conflicting or duplicate records</li>
 </ul>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2">Step 2: Check Blacklist Status</h3>
 <p className="text-gray-600 text-sm mb-2">
 Use a tool like MXToolbox or multirbl.valli.org to check if your domain or IP is listed. If listed:
 </p>
 <ul className="text-sm text-gray-600 space-y-1">
 <li>&#x2022; Visit each blacklist&rsquo;s website and submit a delisting request</li>
 <li>&#x2022; Spamhaus and Barracuda typically delist within 24&ndash;48 hours after request</li>
 <li>&#x2022; SORBS may take longer &mdash; follow their specific process</li>
 </ul>
 </div>
 <div>
 <h3 className="font-bold text-gray-900 mb-2">Step 3: Wait for the Next Check</h3>
 <p className="text-gray-600 text-sm">
 Superkabe periodically re-checks quarantined mailboxes. Once your DNS is clean and blacklist removals have propagated,
 the system will automatically graduate your mailbox to the restricted_send phase on its next check cycle.
 </p>
 </div>
 </div>
 </div>

 {/* How Long Does It Take */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">How Long Does Quarantine Last?</h2>
 <div className="bg-white border-2 border-gray-200 p-8 mb-12 shadow-sm">
 <div className="space-y-4">
 <div className="flex items-center gap-4">
 <span className="flex-shrink-0 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">Instant</span>
 <div>
 <p className="text-gray-700 text-sm"><strong>DNS is healthy:</strong> If SPF, DKIM, and blacklist checks all pass, the mailbox graduates immediately on the next check cycle.</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <span className="flex-shrink-0 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">Hours</span>
 <div>
 <p className="text-gray-700 text-sm"><strong>DNS recently fixed:</strong> If you just corrected a record, allow up to a few hours for propagation and the next system check.</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <span className="flex-shrink-0 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold">Indefinite</span>
 <div>
 <p className="text-gray-700 text-sm"><strong>Unresolved issues:</strong> If DNS is broken or domain is blacklisted, the mailbox stays in quarantine until you fix the underlying problem.</p>
 </div>
 </div>
 </div>
 </div>

 {/* What Happens Next */}
 <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-green-900">What Happens After Quarantine?</h2>
 <p className="text-green-800 mb-4">
 Once all DNS checks pass, your mailbox graduates to <strong>Restricted Send</strong> (Phase 3). In this phase:
 </p>
 <ul className="space-y-2 text-sm text-green-800">
 <li>&#x2022; Warmup is re-enabled at a very low volume (5 emails/day)</li>
 <li>&#x2022; Every send is monitored for bounces</li>
 <li>&#x2022; The mailbox must achieve 10&ndash;20 consecutive clean sends to graduate further</li>
 <li>&#x2022; Any bounce during this phase resets progress</li>
 </ul>
 <p className="text-green-700 text-sm mt-4">
 <strong>The goal:</strong> Prove the mailbox can send cleanly before ramping volume back up.
 </p>
 </div>

 {/* Warning */}
 <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-12 ">
 <h2 className="text-xl font-bold mb-3 text-amber-900">Common Mistake</h2>
 <p className="text-amber-800">
 Do <strong>not</strong> try to manually re-enable or force-send from a quarantined mailbox on your sending platform (Smartlead, Instantly, etc.).
 Superkabe has already removed it from active campaigns for a reason. Sending from a quarantined mailbox bypasses the healing pipeline
 and can cause permanent reputation damage.
 </p>
 </div>

 {/* Related Articles */}
 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
 <div className="space-y-2">
 <a href="/docs/help/auto-healing" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Auto-Healing Works (5-Phase Pipeline)
 </a>
 <a href="/docs/help/entity-statuses" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; Understanding Status Labels
 </a>
 <a href="/docs/help/bounce-classification" className="block p-3 bg-white hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
 &rarr; How Does Bounce Classification Work?
 </a>
 </div>
 </div>
 </div>
 );
}

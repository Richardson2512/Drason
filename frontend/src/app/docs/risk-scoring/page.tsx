import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Risk Scoring | Superkabe Docs',
 description: 'How Superkabe separates hard and soft signals to score leads and infrastructure risk before sending emails.',
 alternates: { canonical: '/docs/risk-scoring' },
 openGraph: {
 title: 'Risk Scoring | Superkabe Docs',
 description: 'How Superkabe separates hard and soft signals to score leads and infrastructure risk before sending emails.',
 url: '/docs/risk-scoring',
 siteName: 'Superkabe',
 type: 'article',
 },
};

export default function RiskScoringPage() {
 return (
 <div className="prose prose-lg text-gray-700 max-w-none">
 <h1 className="text-5xl font-bold mb-6 text-gray-900">
 Risk Scoring
 </h1>
 <p className="text-xl text-gray-500 mb-12">
 Separated hard and soft signals ensure bounce-based issues trigger blocks while velocity spikes only log warnings
 </p>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">1. Lead Health Scoring (Pre-Send)</h2>
 <p className="text-gray-600 mb-6">
 Before a lead even enters the system, it is classified based on intrinsic quality signals.
 This prevents "trash" data from ever reaching your campaigns.
 </p>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
 <div className="bg-green-50 border border-green-200 p-6">
 <h3 className="text-xl font-bold text-green-700 mb-2">GREEN</h3>
 <p className="text-sm text-gray-600 mb-2"><strong>Score: 80-100</strong></p>
 <p className="text-sm text-gray-600">
 Professional business email. Valid domain. No risk signals.
 </p>
 <div className="mt-3 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold ">Active</div>
 </div>

 <div className="bg-amber-50 border border-amber-200 p-6">
 <h3 className="text-xl font-bold text-amber-700 mb-2">YELLOW</h3>
 <p className="text-sm text-gray-600 mb-2"><strong>Score: 50-79</strong></p>
 <p className="text-sm text-gray-600">
 Acceptable but risky. Catch-all domain or unknown provider.
 </p>
 <div className="mt-3 inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold ">Held for Review</div>
 </div>

 <div className="bg-red-50 border border-red-200 p-6">
 <h3 className="text-xl font-bold text-red-700 mb-2">RED</h3>
 <p className="text-sm text-gray-600 mb-2"><strong>Score: 0-49</strong></p>
 <p className="text-sm text-gray-600">
 Disposable domain, role-based (admin@), or blacklisted.
 </p>
 <div className="mt-3 inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold ">Immediate Block</div>
 </div>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">2. Mailbox Risk Scoring (Hard vs Soft)</h2>
 <h2 className="text-xl font-bold mb-4 text-gray-700">The Problem with Combined Risk Scores</h2>
 <p className="text-gray-600 mb-6">
 Traditional systems combine all risk signals into a single score. This causes <strong>false positives</strong>:
 </p>

 <div className="bg-red-50 border border-red-200 p-6 mb-8">
 <h3 className="text-lg font-bold text-red-700 mb-3">❌ Old System (Combined Score)</h3>
 <div className="bg-white/80 p-4 mb-4">
 <p className="text-gray-700 mb-2">
 <strong>Scenario:</strong> A clean mailbox sends 100 emails in 1 hour (high velocity)
 </p>
 <p className="text-gray-600 mb-2">• Bounces: 0</p>
 <p className="text-gray-600 mb-2">• Velocity component: 80/100 (very high)</p>
 <p className="text-amber-600 mb-2">→ Combined risk score: 80</p>
 <p className="text-red-600 font-semibold">→ Result: Mailbox paused (false positive!)</p>
 </div>
 <p className="text-gray-500 text-sm">
 Problem: High velocity alone shouldn't block a mailbox with zero bounces.
 </p>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Hard vs Soft Signal Separation</h2>
 <p className="text-gray-600 mb-6">
 Superkabe separates risk signals into two independent scores:
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="bg-red-50 border border-red-200 p-6">
 <h3 className="text-xl font-bold text-red-700 mb-3">Hard Signals (Bounce-Based)</h3>
 <p className="text-gray-600 mb-4">These CAN block execution:</p>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li>• <strong>Bounce rate</strong> - Hard bounces / total sends</li>
 <li>• <strong>Failure rate</strong> - Failures / total sends</li>
 </ul>
 <div className="mt-4 bg-white/80 p-3">
 <p className="text-sm text-gray-500">
 <strong>Formula:</strong><br />
 <code className="text-red-600">hardScore = (bounceRate × 0.7) + (failureRate × 0.3)</code>
 </p>
 </div>
 <div className="mt-4 p-3 bg-red-100 ">
 <p className="text-sm text-red-700 font-semibold">
 Blocks at: ≥60
 </p>
 </div>
 </div>

 <div className="bg-blue-50 border border-blue-200 p-6">
 <h3 className="text-xl font-bold text-blue-700 mb-3">Soft Signals (Behavior-Based)</h3>
 <p className="text-gray-600 mb-4">These ONLY log, never block:</p>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li>• <strong>Velocity</strong> - Send rate trends</li>
 <li>• <strong>Domain warnings</strong> - Historical incidents</li>
 </ul>
 <div className="mt-4 bg-white/80 p-3">
 <p className="text-sm text-gray-500">
 <strong>Formula:</strong><br />
 <code className="text-blue-600">softScore = (velocity × 20) + (domainWarnings × 10)</code>
 </p>
 </div>
 <div className="mt-4 p-3 bg-blue-100 ">
 <p className="text-sm text-blue-700 font-semibold">
 Logs at: ≥75 (but never blocks)
 </p>
 </div>
 </div>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Comparison: Before vs After</h2>
 <div className="bg-white border border-gray-200 overflow-hidden mb-8 shadow-sm">
 <table className="w-full text-left text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-gray-600 font-semibold">Scenario</th>
 <th className="px-6 py-3 text-gray-600 font-semibold">Hard Score</th>
 <th className="px-6 py-3 text-gray-600 font-semibold">Soft Score</th>
 <th className="px-6 py-3 text-gray-600 font-semibold">Old System</th>
 <th className="px-6 py-3 text-gray-600 font-semibold">New System</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 <tr>
 <td className="px-6 py-4 text-gray-700">0% bounces, high velocity</td>
 <td className="px-6 py-4 text-green-600">0</td>
 <td className="px-6 py-4 text-amber-600">80</td>
 <td className="px-6 py-4 text-red-600">❌ Blocked</td>
 <td className="px-6 py-4 text-green-600">✅ Allowed</td>
 </tr>
 <tr>
 <td className="px-6 py-4 text-gray-700">5% bounces, low velocity</td>
 <td className="px-6 py-4 text-red-600">65</td>
 <td className="px-6 py-4 text-green-600">10</td>
 <td className="px-6 py-4 text-red-600">❌ Blocked</td>
 <td className="px-6 py-4 text-red-600">❌ Blocked</td>
 </tr>
 <tr>
 <td className="px-6 py-4 text-gray-700">1% bounces, normal velocity</td>
 <td className="px-6 py-4 text-green-600">15</td>
 <td className="px-6 py-4 text-green-600">35</td>
 <td className="px-6 py-4 text-green-600">✅ Allowed</td>
 <td className="px-6 py-4 text-green-600">✅ Allowed</td>
 </tr>
 <tr>
 <td className="px-6 py-4 text-gray-700">3% bounces, high velocity</td>
 <td className="px-6 py-4 text-amber-600">45</td>
 <td className="px-6 py-4 text-amber-600">85</td>
 <td className="px-6 py-4 text-red-600">❌ Blocked</td>
 <td className="px-6 py-4 text-green-600">✅ Allowed (logs warning)</td>
 </tr>
 </tbody>
 </table>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How It Works in Practice</h2>
 <p className="text-gray-600 mb-6">
 The execution gate uses <strong>only hardScore</strong> for blocking decisions:
 </p>

 <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
 <code className="text-sm text-gray-700">
 <pre>
 {`// Execution Gate Check (simplified)

const avgHardScore = calculateHardScore(healthyMailboxes);
const avgSoftScore = calculateSoftScore(healthyMailboxes);

// ONLY hard score blocks
if (avgHardScore >= 60) {
 return {
 allowed: false,
 reason: "Hard risk score (65) exceeds threshold. Bounce rate too high.",
 failureType: "HEALTH_ISSUE"
 };
}

// Soft score just logs
if (avgSoftScore >= 75) {
 console.log(\`⚠️ High velocity detected: \${avgSoftScore} (not blocking)\`);
}

return { allowed: true };`}
 </pre>
 </code>
 </div>

 <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Risk Components in Detail</h2>
 <div className="bg-white border border-gray-200 p-6 mb-8 shadow-sm">
 <h3 className="text-lg font-semibold mb-4 text-gray-900">Hard Score Calculation</h3>
 <div className="space-y-3 text-sm text-gray-600">
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>1. Calculate 24h bounce rate:</strong></p>
 <code className="text-blue-600">bounceRate = (bounces_24h / sent_24h) × 100</code>
 </div>
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>2. Calculate 24h failure rate:</strong></p>
 <code className="text-blue-600">failureRate = (failures_24h / sent_24h) × 100</code>
 </div>
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>3. Weighted combination:</strong></p>
 <code className="text-blue-600">hardScore = (bounceRate × 0.7) + (failureRate × 0.3)</code>
 </div>
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>4. Scale to 0-100:</strong></p>
 <code className="text-blue-600">hardScore = min(hardScore × 10, 100)</code>
 </div>
 </div>
 </div>

 <div className="bg-white border border-gray-200 p-6 mb-8 shadow-sm">
 <h3 className="text-lg font-semibold mb-4 text-gray-900">Soft Score Calculation</h3>
 <div className="space-y-3 text-sm text-gray-600">
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>1. Velocity component (from metrics):</strong></p>
 <code className="text-green-600">velocityComponent = mailbox.metrics.velocity × 20</code>
 </div>
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>2. Domain warning component:</strong></p>
 <code className="text-green-600">escalationComponent = domain.warning_count × 10</code>
 </div>
 <div className="bg-gray-50 p-3">
 <p className="mb-2"><strong>3. Sum and cap:</strong></p>
 <code className="text-green-600">softScore = min(velocityComponent + escalationComponent, 100)</code>
 </div>
 </div>
 </div>

 <div className="bg-green-50 border border-green-200 p-6 mt-8">
 <h3 className="text-xl font-bold text-green-700 mb-2">✅ Key Benefit</h3>
 <p className="text-gray-600 mb-4">
 Signal separation eliminates false positives:
 </p>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li>• Clean mailboxes with high send volume stay active</li>
 <li>• Only bounce/failure-based issues trigger pauses</li>
 <li>• Velocity spikes are logged but don't disrupt operations</li>
 <li>• Infrastructure protection focuses on real reputation threats</li>
 </ul>
 </div>

 <div className="bg-blue-50 border border-blue-200 p-6 mt-8">
 <h3 className="text-xl font-bold text-blue-700 mb-2">🔧 Configuration</h3>
 <p className="text-gray-600 mb-4">
 Thresholds are tunable in the Configuration section:
 </p>
 <ul className="space-y-2 text-gray-600 text-sm">
 <li>• <code className="px-2 py-1 bg-white text-gray-700">HARD_RISK_CRITICAL: 60</code> — Blocks execution</li>
 <li>• <code className="px-2 py-1 bg-white text-gray-700">SOFT_RISK_HIGH: 75</code> — Logs warning only</li>
 </ul>
 </div>
 </div>
 );
}

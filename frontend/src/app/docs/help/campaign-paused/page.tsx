export default function CampaignPausedPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Why Is My Campaign Paused?
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding automatic campaign pausing and how to get back to sending
            </p>

            {/* Quick Answer */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-blue-900">Quick Answer</h2>
                <p className="text-blue-800 mb-4">
                    Campaigns are automatically paused when your <strong>bounce rate exceeds 10%</strong> OR when the underlying infrastructure (domains/mailboxes) becomes unhealthy.
                </p>
                <p className="text-blue-700 text-sm">
                    This is a protective measure to prevent permanent reputation damage. The system will automatically heal and resume when conditions improve.
                </p>
            </div>

            {/* Reasons for Pausing */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Common Reasons</h2>

            <div className="space-y-6 mb-12">
                <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                            📧
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">1. High Bounce Rate (Most Common)</h3>
                            <p className="text-gray-600 mb-3">
                                Your campaign's emails are bouncing at over 10%. This usually means:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 ml-4">
                                <li>• Email list quality is poor (invalid addresses)</li>
                                <li>• Purchased or scraped email lists</li>
                                <li>• Old, stale contacts (email addresses no longer exist)</li>
                                <li>• Spam trap addresses in your list</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                            🌐
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Domain Health Issues</h3>
                            <p className="text-gray-600 mb-3">
                                Your domain was flagged as unhealthy:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 ml-4">
                                <li>• Domain is blacklisted (Spamhaus, Barracuda, etc.)</li>
                                <li>• 50%+ of mailboxes on this domain are unhealthy</li>
                                <li>• DNS authentication broken (SPF/DKIM/DMARC)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                            📬
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Mailbox Health Issues</h3>
                            <p className="text-gray-600 mb-3">
                                All mailboxes assigned to this campaign are unhealthy:
                            </p>
                            <ul className="space-y-1 text-sm text-gray-600 ml-4">
                                <li>• Mailboxes hit 10%+ bounce rate individually</li>
                                <li>• Mailboxes were manually paused</li>
                                <li>• Mailboxes are in recovery mode</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">4. Manual Pause</h3>
                            <p className="text-gray-600 mb-3">
                                Someone on your team manually paused the campaign from the dashboard or via Smartlead.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What Happens When Paused */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">What Happens When a Campaign Is Paused?</h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 mb-12">
                <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Immediate Stop</h3>
                            <p className="text-gray-600 text-sm">All new emails for this campaign are blocked from sending</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Smartlead Sync</h3>
                            <p className="text-gray-600 text-sm">Campaign is paused in Smartlead (if integrated)</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Notification Sent</h3>
                            <p className="text-gray-600 text-sm">You'll receive a critical notification explaining why</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Auto-Healing Begins</h3>
                            <p className="text-gray-600 text-sm">If caused by infrastructure issues, the 5-phase healing pipeline starts automatically</p>
                        </div>
                    </li>
                </ol>
            </div>

            {/* How to Resume */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">How to Resume Your Campaign</h2>

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-green-900 mb-3">Option 1: Wait for Auto-Healing (Recommended)</h3>
                <p className="text-green-800 mb-4">
                    If paused due to infrastructure issues, the system will automatically heal and resume when safe. This takes 4-14 days depending on severity.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-2"><strong>Healing Timeline:</strong></p>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Phase 1: Cooldown (4-48 hours)</li>
                        <li>• Phase 2: DNS validation (instant)</li>
                        <li>• Phase 3: Restricted sending (2-4 days, 5 sends/day)</li>
                        <li>• Phase 4: Warm recovery (7-14 days, 25 sends/day)</li>
                        <li>• Phase 5: Fully healthy → Campaign auto-resumes</li>
                    </ul>
                </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-12">
                <h3 className="text-xl font-bold text-amber-900 mb-3">Option 2: Fix Issues Manually</h3>
                <p className="text-amber-800 mb-4">
                    Speed up the process by addressing root causes:
                </p>
                <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h4 className="font-bold text-gray-900 mb-1">For High Bounce Rates:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Clean your email list (remove invalid addresses)</li>
                            <li>• Use email verification tools (ZeroBounce, NeverBounce)</li>
                            <li>• Remove old contacts (6+ months inactive)</li>
                            <li>• Switch to better lead sources</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h4 className="font-bold text-gray-900 mb-1">For Domain Blacklisting:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Check blacklist status at <a href="https://mxtoolbox.com/blacklists.aspx" target="_blank" className="text-blue-600 hover:underline">mxtoolbox.com</a></li>
                            <li>• Request delisting from each blacklist</li>
                            <li>• Fix SPF/DKIM/DMARC records</li>
                            <li>• Trigger manual re-assessment in Superkabe</li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h4 className="font-bold text-gray-900 mb-1">For Mailbox Issues:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Wait for mailbox recovery (auto-healing)</li>
                            <li>• Add new, healthy mailboxes to the campaign</li>
                            <li>• Reduce daily send volume</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Important Warnings */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-12 rounded-r-lg">
                <h2 className="text-xl font-bold mb-3 text-red-900">⚠️ Important Warnings</h2>
                <ul className="space-y-2 text-red-800 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span><strong>Don't force resume manually</strong> - If the system paused your campaign, there's a good reason. Forcing it back on without fixing root causes will cause more damage.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span><strong>Don't bypass Superkabe</strong> - Resuming directly in Smartlead will cause sync conflicts. Always use Superkabe's controls.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span><strong>Don't ignore notifications</strong> - Each pause notification contains specific remediation steps. Follow them.</span>
                    </li>
                </ul>
            </div>

            {/* Preventing Future Pauses */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Preventing Future Pauses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">✅ Best Practices</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Use verified, opted-in email lists</li>
                        <li>• Set up SPF/DKIM/DMARC correctly</li>
                        <li>• Monitor bounce rates weekly</li>
                        <li>• Start with low volume (20-30/day)</li>
                        <li>• Warm up new mailboxes gradually</li>
                        <li>• Remove hard bounces immediately</li>
                    </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">❌ Avoid</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Buying email lists</li>
                        <li>• Scraping emails from websites</li>
                        <li>• Sending to unverified contacts</li>
                        <li>• Ignoring bounce rate warnings</li>
                        <li>• Sending high volume immediately</li>
                        <li>• Using shared/public domains</li>
                    </ul>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/auto-healing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → How Auto-Healing Works (5-Phase Pipeline)
                    </a>
                    <a href="/docs/help/status-colors" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → Understanding Status Colors
                    </a>
                    <a href="/docs/monitoring" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → Monitoring System (Technical Details)
                    </a>
                </div>
            </div>
        </div>
    );
}

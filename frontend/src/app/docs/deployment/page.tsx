export default function DeploymentPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Deployment Checklist
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Production deployment steps for Drason billing integration and infrastructure
            </p>

            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold text-green-800 mb-3 mt-0">✅ Implementation Status</h2>
                <p className="text-gray-700 mb-4">
                    All code has been written, committed, and pushed to repositories. Ready for deployment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Backend Complete</h3>
                        <ul className="text-sm text-gray-600 space-y-1 m-0">
                            <li>✅ Prisma schema with subscription fields</li>
                            <li>✅ Polar API client service</li>
                            <li>✅ Billing service & webhook processing</li>
                            <li>✅ Trial expiration worker (hourly cron)</li>
                            <li>✅ Feature gate middleware</li>
                            <li>✅ Capacity checks & usage tracking</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Frontend Complete</h3>
                        <ul className="text-sm text-gray-600 space-y-1 m-0">
                            <li>✅ BillingSection component</li>
                            <li>✅ Trial countdown banner</li>
                            <li>✅ Dynamic pricing page CTAs</li>
                            <li>✅ Authentication-aware routing</li>
                            <li>✅ Checkout & cancellation flows</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 mt-12 text-gray-900">🚀 Deployment Steps</h2>

            {/* Step 1 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">STEP 1</span>
                    <h3 className="text-xl font-bold text-blue-900 m-0">Configure Railway Environment Variables</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    Add these variables to your Railway backend project:
                </p>
                <div className="bg-white rounded-lg p-4 mb-4 overflow-x-auto">
                    <pre className="text-xs text-gray-800 m-0">
{`POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_WEBHOOK_SECRET=polar_whs_...
POLAR_STARTER_PRODUCT_ID=f82a3f93-14d5-49c6-b6cf-6bc0d8e6ca6c
POLAR_GROWTH_PRODUCT_ID=0690578b-2fe7-4e05-a2e2-a258a90599e9
POLAR_SCALE_PRODUCT_ID=edae6a6e-bfd2-4f24-9092-197021cf984d
FRONTEND_URL=https://your-frontend-domain.vercel.app`}
                    </pre>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                    <p className="text-sm text-gray-700 mb-2 font-semibold">How to add in Railway:</p>
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. Go to Railway project → Backend service</li>
                        <li>2. Click "Variables" tab</li>
                        <li>3. Add each variable with its value</li>
                        <li>4. Railway will automatically redeploy</li>
                    </ol>
                </div>
            </div>

            {/* Step 2 */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">STEP 2</span>
                    <h3 className="text-xl font-bold text-purple-900 m-0">Configure Polar Webhook</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    Webhook endpoint: <code className="px-2 py-1 bg-white rounded text-purple-700 text-sm">https://your-backend-domain.railway.app/api/billing/polar-webhook</code>
                </p>
                <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2 font-semibold">Setup in Polar Dashboard:</p>
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. Go to <a href="https://polar.sh/dashboard" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">Polar Dashboard</a> → Settings → Webhooks</li>
                        <li>2. Click "Add Webhook"</li>
                        <li>3. Enter webhook URL above</li>
                        <li>4. Select events:
                            <ul className="pl-4 mt-1">
                                <li>• subscription.created</li>
                                <li>• subscription.updated</li>
                                <li>• subscription.canceled</li>
                                <li>• invoice.paid</li>
                                <li>• invoice.payment_failed</li>
                            </ul>
                        </li>
                        <li>5. Save webhook</li>
                    </ol>
                </div>
            </div>

            {/* Step 3 */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">STEP 3</span>
                    <h3 className="text-xl font-bold text-green-900 m-0">Run Database Migration</h3>
                </div>
                <div className="bg-white rounded-lg p-4">
                    <pre className="text-sm text-gray-800 m-0">
{`cd backend
npx prisma migrate deploy
npx prisma generate`}
                    </pre>
                </div>
                <p className="text-sm text-gray-600 mt-3 m-0">
                    This adds subscription fields to Organization table, creates SubscriptionEvent table, and updates usage tracking columns.
                </p>
            </div>

            {/* Step 4 */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold">STEP 4</span>
                    <h3 className="text-xl font-bold text-orange-900 m-0">Backfill Existing Organizations</h3>
                </div>
                <p className="text-gray-700 mb-3">
                    Initialize trial status for existing organizations:
                </p>
                <div className="bg-white rounded-lg p-4 mb-3">
                    <pre className="text-sm text-gray-800 m-0">
{`cd backend
npx ts-node scripts/backfillSubscriptions.ts`}
                    </pre>
                </div>
                <div className="bg-orange-100 rounded-lg p-3">
                    <p className="text-sm text-gray-700 m-0">
                        <strong>Expected:</strong> <code className="px-2 py-1 bg-white rounded">✅ Backfilled 5 organizations with trial status</code>
                    </p>
                </div>
            </div>

            {/* Step 5 */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">STEP 5</span>
                    <h3 className="text-xl font-bold text-indigo-900 m-0">Verify Deployment</h3>
                </div>
                <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-800 mb-2">1. Check Backend Health:</p>
                        <pre className="text-xs text-gray-700 m-0">curl https://your-backend-domain.railway.app/api/health</pre>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-800 mb-2">2. Verify Trial Worker Started:</p>
                        <p className="text-xs text-gray-600 m-0">Check Railway logs for: "Trial expiration worker started (runs hourly)"</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-800 mb-2">3. Test Billing Endpoint:</p>
                        <pre className="text-xs text-gray-700 m-0">{`curl -X GET https://your-backend.railway.app/api/billing/subscription \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}</pre>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-800 mb-2">4. Check Frontend:</p>
                        <ul className="text-xs text-gray-600 space-y-1 m-0 pl-4">
                            <li>• Visit /dashboard/settings</li>
                            <li>• Verify BillingSection appears with trial status</li>
                            <li>• Check trial countdown banner (if {'<'} 7 days)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 mt-12 text-gray-900">📋 Feature Verification</h2>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Environment variables added to Railway</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Polar webhook configured & receiving events</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Database migration applied</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Backfill script executed successfully</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Trial countdown banner appears ({'<'} 7 days)</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">BillingSection displays plan & usage</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Pricing page CTAs redirect correctly</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Checkout flow completes & webhook processes</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Feature gates block at capacity</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Trial worker logs appear hourly</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Usage counts increment correctly</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-gray-700">Subscription upgrades work end-to-end</span>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 mt-12 text-gray-900">🐛 Troubleshooting</h2>

            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-red-800 mb-2">Webhook Not Receiving Events</h3>
                    <ul className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>• Verify webhook URL matches in Polar dashboard</li>
                        <li>• Check webhook secret matches POLAR_WEBHOOK_SECRET</li>
                        <li>• Verify backend deployed & accessible</li>
                        <li>• Check Railway logs for incoming requests</li>
                    </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-amber-800 mb-2">Feature Gates Not Blocking</h3>
                    <ul className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>• Verify migration applied (check database schema)</li>
                        <li>• Check current usage counts are accurate</li>
                        <li>• Run refreshUsageCounts endpoint manually</li>
                        <li>• Verify TIER_LIMITS in polarClient.ts</li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">Checkout Not Completing</h3>
                    <ul className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>• Verify FRONTEND_URL is set correctly</li>
                        <li>• Check Polar product IDs match dashboard</li>
                        <li>• Ensure Polar access token has permissions</li>
                        <li>• Test with Polar test mode first</li>
                    </ul>
                </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold text-green-800 mb-3 mt-0">🎉 Post-Deployment</h2>
                <p className="text-gray-700 mb-4">Once all checks pass:</p>
                <ul className="text-gray-700 space-y-2 m-0 pl-4">
                    <li>• Test with a real user signup</li>
                    <li>• Monitor first week for trial expirations</li>
                    <li>• Track conversion rates from trial to paid</li>
                    <li>• Set up alerts for webhook failures</li>
                    <li>• Monitor usage count accuracy</li>
                </ul>
                <p className="text-xl font-bold text-green-700 mt-6 m-0">Your billing system is now live! 🚀</p>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">📞 Support Resources</h3>
                <ul className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                    <li>• <a href="https://docs.polar.sh" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Polar Documentation</a></li>
                    <li>• <a href="https://www.prisma.io/docs/concepts/components/prisma-migrate" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Prisma Migrations</a></li>
                    <li>• Railway Dashboard → Service → Logs</li>
                    <li>• Railway Dashboard → Service → Database → Data</li>
                </ul>
            </div>
        </div>
    );
}

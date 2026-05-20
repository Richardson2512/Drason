import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Polar Billing Integration | Superkabe Docs',
    description: 'How Superkabe billing works via Polar - subscription tiers, the Dedicated IP add-on, validation credit top-ups, and Standard Webhooks for sync.',
    alternates: { canonical: '/docs/integrations/polar' },
    openGraph: {
        title: 'Polar Billing Integration | Superkabe Docs',
        description: 'How Superkabe billing works via Polar - subscription tiers and add-ons.',
        url: '/docs/integrations/polar',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function PolarIntegrationDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Polar Billing Integration
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Superkabe subscriptions, add-ons, and credit top-ups all run through Polar - one billing surface for everything.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What billing covers</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><strong>Subscription tiers.</strong> Starter ($19/mo), Growth ($49/mo), Scale ($199/mo), Enterprise ($349/mo). Flat per-tier with unlimited operators.</li>
                <li><strong>Dedicated IP add-on.</strong> $39/mo per workspace. Allocated on AWS SES, 4-8 week automatic warm-up.</li>
                <li><strong>Validation credit top-ups.</strong> Pay-as-you-go credits for MillionVerifier probing on risky leads.</li>
                <li><strong>Annual discount.</strong> 20% off when billed annually.</li>
            </ul>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">How upgrades and downgrades work</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Tier changes take effect immediately via Polar checkout. Upgrades are prorated against the remaining cycle. Downgrades take effect at the next billing cycle (you do not lose access to the higher tier until the period ends). Polar handles all proration math; Superkabe reads the subscription state from Polar via Standard Webhooks.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Standard Webhooks sync</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Polar emits Standard Webhooks for every subscription event - created, updated, cancelled, payment failed. Superkabe verifies the HMAC-SHA256 signature on every webhook (5-minute replay window) and reconciles workspace entitlements within seconds.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
                In addition to webhook-driven sync, Superkabe runs a daily reconciliation worker that polls Polar&apos;s API for any subscription whose state in the Superkabe database is older than 24 hours. This catches the rare case where a webhook is missed or fails to verify, ensuring entitlement state never drifts.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Customer portal</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Dashboard - Billing - Manage subscription opens the Polar-hosted customer portal in a new tab. From there you can update payment methods, change billing email, download invoices, and cancel. Cancellation flows through Polar; Superkabe receives the webhook and downgrades the workspace at the end of the paid period.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Invoices and tax</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Polar handles VAT, sales tax, and invoice generation according to your billing country. Invoices are accessible from the Polar customer portal. For enterprise / annual plans Polar can also generate manual invoices for AP departments that require a PO process - contact <Link href="/contact" className="text-blue-600 hover:underline">support</Link> if you need this.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Failed payments</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
                Polar retries failed payments according to its default schedule. During the retry window the subscription stays active and Superkabe shows a banner reminding the operator to update payment. After the retry window expires, Polar cancels the subscription and Superkabe downgrades the workspace to the free tier (read-only access; outreach pauses). Re-activating with a working payment method restores the previous tier.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Related</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li><Link href="/pricing" className="text-blue-600 hover:underline">Pricing</Link> - tier breakdown and what each tier includes</li>
                <li><Link href="/product/dedicated-ip" className="text-blue-600 hover:underline">Dedicated IP add-on</Link> - the $39/mo add-on</li>
                <li><Link href="/docs/help/billing" className="text-blue-600 hover:underline">Billing FAQ</Link> - operator-facing billing questions</li>
                <li><Link href="/docs/help/validation-credits" className="text-blue-600 hover:underline">Validation credits</Link> - how validation credits work and top up</li>
            </ul>
        </div>
    );
}

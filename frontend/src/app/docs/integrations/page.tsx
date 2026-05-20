import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Integrations | Superkabe Docs',
    description: 'Every Superkabe integration - CRMs, sending platforms, LinkedIn via Unipile, warmup, validation, alerting, billing. Index with links to each setup guide.',
    alternates: { canonical: '/docs/integrations' },
    openGraph: {
        title: 'Integrations | Superkabe Docs',
        description: 'Every integration Superkabe supports - CRMs, sending platforms, LinkedIn, warmup, validation, alerting, and billing.',
        url: '/docs/integrations',
        siteName: 'Superkabe',
        type: 'website',
    },
};

interface Integration {
    name: string;
    category: 'crm' | 'sending' | 'mailbox' | 'linkedin' | 'data' | 'alerting' | 'warmup' | 'billing' | 'validation';
    docHref: string;
    description: string;
    status: 'live' | 'beta';
}

const integrations: Integration[] = [
    // CRM
    { name: 'HubSpot', category: 'crm', docHref: '/docs/integrations/hubspot', description: 'Import contacts, push activity to the timeline, mirror the suppression list - all via OAuth.', status: 'live' },
    { name: 'Salesforce', category: 'crm', docHref: '/docs/integrations/salesforce', description: 'Bidirectional sync of leads, contacts, and engagement signals via OAuth.', status: 'live' },
    { name: 'Outreach', category: 'crm', docHref: '/docs/integrations/outreach', description: 'Sequence-handoff and reply-event sync with the Outreach sales engagement platform.', status: 'live' },
    { name: 'Apollo', category: 'crm', docHref: '/docs/integrations/apollo', description: 'Pull enriched contacts from Apollo searches; push engagement signals back.', status: 'live' },

    // Sending platforms (multi-platform sync)
    { name: 'Smartlead', category: 'sending', docHref: '/docs/integrations/smartlead', description: 'Layer the Superkabe protection layer on top of Smartlead campaigns - auto-pause, healing, ESP routing.', status: 'live' },
    { name: 'Instantly', category: 'sending', docHref: '/docs/integrations/instantly', description: 'Layer the Superkabe protection layer on top of Instantly campaigns - same auto-pause and healing.', status: 'live' },
    { name: 'EmailBison', category: 'sending', docHref: '/docs/multi-platform-sync', description: 'Ingest EmailBison delivery events and govern bounce-rate enforcement across the platform.', status: 'live' },

    // Mailbox providers (OAuth at connect-time, no dedicated integration doc needed - see getting-started)
    { name: 'Gmail / Google Workspace', category: 'mailbox', docHref: '/docs/getting-started', description: 'Connect Gmail / Google Workspace mailboxes via OAuth from Dashboard - Sequencer - Mailboxes.', status: 'live' },
    { name: 'Microsoft 365 / Outlook', category: 'mailbox', docHref: '/docs/getting-started', description: 'Connect Microsoft 365 mailboxes via OAuth. Tenant admin consent may be required.', status: 'live' },
    { name: 'Custom SMTP / IMAP', category: 'mailbox', docHref: '/docs/getting-started', description: 'Connect arbitrary SMTP/IMAP mailboxes via encrypted credentials.', status: 'live' },

    // LinkedIn (Super LinkedIn)
    { name: 'Super LinkedIn (Unipile)', category: 'linkedin', docHref: '/docs/integrations/super-linkedin', description: 'LinkedIn outreach via Unipile - HeyReach-class sending plus the 4-agent supervisor stack and cross-channel halt with email.', status: 'live' },

    // Data layer
    { name: 'Clay', category: 'data', docHref: '/docs/clay-integration', description: 'Webhook ingestion from Clay tables for enriched lead import.', status: 'live' },

    // Alerting
    { name: 'Slack', category: 'alerting', docHref: '/docs/slack-integration', description: 'Real-time Slack alerts for infrastructure events - pauses, healings, blacklist listings.', status: 'live' },

    // Warmup
    { name: 'Zapmail', category: 'warmup', docHref: '/docs/help/24-7-monitoring', description: 'Warmup integration via Zapmail - bundled credits available on every Superkabe tier.', status: 'live' },

    // Validation
    { name: 'MillionVerifier', category: 'validation', docHref: '/docs/help/email-validation', description: 'Conditional MillionVerifier probing for risky leads via the hybrid validation pipeline.', status: 'live' },

    // Billing
    { name: 'Polar (billing)', category: 'billing', docHref: '/docs/integrations/polar', description: 'Subscription billing via Polar - upgrade, downgrade, dedicated-IP add-on purchase, validation credit top-ups.', status: 'live' },
];

const CATEGORIES: { key: Integration['category']; label: string; description: string }[] = [
    { key: 'crm', label: 'CRM', description: 'Two-way sync of contacts and activity' },
    { key: 'sending', label: 'Sending platforms', description: 'Apply Superkabe protection on top of Smartlead, Instantly, and EmailBison' },
    { key: 'mailbox', label: 'Mailbox providers', description: 'Gmail, Microsoft 365, custom SMTP - the actual sending surface' },
    { key: 'linkedin', label: 'LinkedIn', description: 'Super LinkedIn module via Unipile authentication' },
    { key: 'data', label: 'Data & enrichment', description: 'Pull enriched leads from your enrichment layer' },
    { key: 'alerting', label: 'Alerting', description: 'Real-time notifications for infrastructure events' },
    { key: 'warmup', label: 'Warmup', description: 'Inbox warmup networks integrated with the sending pipeline' },
    { key: 'validation', label: 'Validation', description: 'External validation providers feeding the hybrid gate' },
    { key: 'billing', label: 'Billing', description: 'Subscription management and credit purchases' },
];

export default function IntegrationsIndexDocs() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Integrations
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Every integration Superkabe supports. CRMs, sending platforms, LinkedIn, mailbox providers, data, warmup, validation, alerting, and billing.
            </p>

            {CATEGORIES.map((cat) => {
                const list = integrations.filter((i) => i.category === cat.key);
                if (list.length === 0) return null;
                return (
                    <section key={cat.key} className="mb-12">
                        <h2 className="text-3xl font-bold mb-2 mt-12 text-gray-900">{cat.label}</h2>
                        <p className="text-gray-500 mb-6">{cat.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {list.map((i) => (
                                <Link
                                    key={i.name}
                                    href={i.docHref}
                                    className="block bg-white border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 m-0 group-hover:text-blue-700">{i.name}</h3>
                                        {i.status === 'beta' && (
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold tracking-wider uppercase rounded-sm">
                                                Beta
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed m-0">{i.description}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}

            <h2 className="text-3xl font-bold mb-4 mt-16 text-gray-900">Missing an integration?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                If a platform you depend on is not listed, reach out via <Link href="/contact" className="text-blue-600 hover:underline">contact</Link>. The most-requested integrations get scoped and built; many of the current adapters were originally customer requests.
            </p>
        </div>
    );
}

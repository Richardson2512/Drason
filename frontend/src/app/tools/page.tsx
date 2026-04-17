import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Free Email Authentication Tools – SPF, DKIM | Superkabe',
    description: 'Free SPF, DKIM, and DMARC lookup and generator tools. Check your DNS records, generate properly formatted authentication records, and protect your email.',
    openGraph: {
        title: 'Free Email Authentication Tools – SPF, DKIM & DMARC | Superkabe',
        description: 'Free SPF, DKIM, and DMARC lookup and generator tools. Check your DNS records and generate properly formatted authentication records.',
        url: '/tools',
        siteName: 'Superkabe',
        type: 'website',
    },
    alternates: {
        canonical: '/tools',
    },
};

const tools = [
    {
        title: 'SPF Record Lookup',
        description: 'Check if your domain has a valid SPF record. See authorized sending servers and detect misconfigurations that cause authentication failures.',
        href: '/tools/spf-lookup',
        icon: 'search',
        color: 'blue',
    },
    {
        title: 'SPF Record Generator',
        description: 'Generate a properly formatted SPF TXT record for your domain. Add authorized IPs, include third-party senders, and set your failure policy.',
        href: '/tools/spf-generator',
        icon: 'settings',
        color: 'blue',
    },
    {
        title: 'DKIM Record Lookup',
        description: 'Verify your DKIM DNS record is published correctly. Check the public key, key type, and flags to ensure email signatures can be validated.',
        href: '/tools/dkim-lookup',
        icon: 'search',
        color: 'emerald',
    },
    {
        title: 'DKIM Record Generator',
        description: 'Generate a DKIM TXT record with your public key. Configure the selector, key type, and flags for proper email signature verification.',
        href: '/tools/dkim-generator',
        icon: 'key',
        color: 'emerald',
    },
    {
        title: 'DMARC Record Lookup',
        description: 'Check your domain\'s DMARC policy. See the enforcement level, reporting addresses, and alignment settings that control unauthenticated email handling.',
        href: '/tools/dmarc-lookup',
        icon: 'search',
        color: 'purple',
    },
    {
        title: 'DMARC Record Generator',
        description: 'Generate a DMARC TXT record with your preferred policy. Configure reporting, alignment mode, and percentage for gradual enforcement rollout.',
        href: '/tools/dmarc-generator',
        icon: 'shield',
        color: 'purple',
    },
];

const colorMap: Record<string, { bg: string; border: string; iconBg: string; iconText: string; hover: string }> = {
    blue: { bg: 'bg-blue-50/50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconText: 'text-blue-600', hover: 'hover:border-blue-300 hover:shadow-blue-100/50' },
    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', hover: 'hover:border-emerald-300 hover:shadow-emerald-100/50' },
    purple: { bg: 'bg-purple-50/50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconText: 'text-purple-600', hover: 'hover:border-purple-300 hover:shadow-purple-100/50' },
};

export default function ToolsPage() {
    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Free Email Authentication Tools",
        "description": "Free SPF, DKIM, and DMARC lookup and generator tools for email deliverability.",
        "url": "https://www.superkabe.com/tools",
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": tools.map((tool, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "name": tool.title,
                "item": `https://www.superkabe.com${tool.href}`,
            })),
        },
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What are SPF, DKIM, and DMARC?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC (Domain-based Message Authentication, Reporting & Conformance) are three DNS-based email authentication protocols. Together they verify that emails are sent from authorized servers, have not been tampered with, and define what happens when authentication fails. All three are required by Google and Yahoo for bulk senders since February 2024."
                }
            },
            {
                "@type": "Question",
                "name": "Why should I check my SPF, DKIM, and DMARC records?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Misconfigured or missing authentication records cause emails to land in spam or get rejected entirely. Checking your records identifies issues like exceeding the SPF 10-lookup limit, missing DKIM public keys, or weak DMARC policies before they impact deliverability. Regular checks are essential because DNS changes, provider migrations, and new sending services can break authentication."
                }
            },
            {
                "@type": "Question",
                "name": "Are these email tools free to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all Superkabe DNS lookup and generator tools are completely free with no signup required. You can check SPF, DKIM, and DMARC records and generate new ones as many times as needed. For continuous automated monitoring across all your sending domains, Superkabe offers paid plans starting with a free tier."
                }
            },
            {
                "@type": "Question",
                "name": "How often should I check my email authentication records?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Check your records after any DNS change, email provider migration, or when adding a new sending service. For production sending domains, weekly checks catch drift before it causes deliverability problems. Superkabe automates this with 24-hour DNS monitoring across all connected domains."
                }
            },
            {
                "@type": "Question",
                "name": "What happens if my domain has no DMARC record?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Without a DMARC record, receiving servers have no policy for handling emails that fail SPF or DKIM checks. This means spoofed emails using your domain may reach recipients unchallenged. Since February 2024, Google and Yahoo require at least a p=none DMARC record for all bulk senders. Missing DMARC records directly impact inbox placement rates."
                }
            },
        ],
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans overflow-x-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <Navbar />

            {/* Fixed Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="cloud-bg">
                    <div className="cloud-shadow" />
                    <div className="cloud-puff-1" />
                    <div className="cloud-puff-2" />
                    <div className="cloud-puff-3" />
                </div>
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            {/* Hero */}
            <div className="relative">
                <div className="relative z-10 pt-36 md:pt-44 pb-16 md:pb-24 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-medium text-gray-600 mb-8">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            100% Free &middot; No Signup Required
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                            Free Email Authentication Tools
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                            Check and generate SPF, DKIM, and DMARC records for your domain. Identify misconfigurations before they damage your sender reputation.
                        </p>
                        <p className="text-sm text-gray-400">
                            Used by outbound teams to validate DNS authentication before scaling campaigns
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tools.map((tool) => {
                            const c = colorMap[tool.color];
                            return (
                                <Link
                                    key={tool.href}
                                    href={tool.href}
                                    className={`group block p-8 rounded-2xl border ${c.border} ${c.bg} ${c.hover} hover:shadow-xl transition-all duration-300`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                                            <ToolIcon name={tool.icon} className={c.iconText} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                {tool.title}
                                            </h2>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {tool.description}
                                            </p>
                                            <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                                                Use tool <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Authentication Matters */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl p-10 md:p-14 shadow-lg shadow-gray-200/50 border border-gray-100">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                            Why Email Authentication Matters for Deliverability
                        </h2>

                        <div className="space-y-6 text-gray-600 leading-relaxed">
                            <p>
                                Email authentication is the foundation of inbox placement. Without properly configured SPF, DKIM, and DMARC records, receiving mail servers have no way to verify that your emails are legitimate. The result: messages land in spam, get rejected, or worse &mdash; your domain gets flagged as a spoofing source.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <h3 className="font-bold text-gray-900 mb-2">SPF</h3>
                                    <p className="text-sm text-gray-600">Authorizes which mail servers can send email on behalf of your domain. Prevents unauthorized servers from using your domain name.</p>
                                </div>
                                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                    <h3 className="font-bold text-gray-900 mb-2">DKIM</h3>
                                    <p className="text-sm text-gray-600">Adds a cryptographic signature to each email. Receiving servers verify the signature to confirm the message is authentic and unaltered.</p>
                                </div>
                                <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                                    <h3 className="font-bold text-gray-900 mb-2">DMARC</h3>
                                    <p className="text-sm text-gray-600">Tells receiving servers what to do when SPF or DKIM checks fail. Enables reporting so you can monitor authentication across all sending sources.</p>
                                </div>
                            </div>

                            <p>
                                Since February 2024, Google and Yahoo require all bulk senders to have SPF, DKIM, and DMARC configured. Domains without proper authentication see significantly lower inbox placement rates and are more likely to be flagged by spam filters.
                            </p>
                        </div>

                        <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Need continuous monitoring?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                These free tools check your records on demand. Superkabe monitors SPF, DKIM, and DMARC across all your sending domains automatically &mdash; every 24 hours &mdash; and alerts you before misconfigurations cause deliverability failures.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Start free trial
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'What are SPF, DKIM, and DMARC?',
                                a: 'SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC (Domain-based Message Authentication, Reporting & Conformance) are three DNS-based email authentication protocols. Together they verify that emails are sent from authorized servers, have not been tampered with, and define what happens when authentication fails. All three are required by Google and Yahoo for bulk senders since February 2024.',
                            },
                            {
                                q: 'Why should I check my SPF, DKIM, and DMARC records?',
                                a: 'Misconfigured or missing authentication records cause emails to land in spam or get rejected entirely. Checking your records identifies issues like exceeding the SPF 10-lookup limit, missing DKIM public keys, or weak DMARC policies before they impact deliverability.',
                            },
                            {
                                q: 'Are these email tools free to use?',
                                a: 'Yes, all Superkabe DNS lookup and generator tools are completely free with no signup required. You can check SPF, DKIM, and DMARC records and generate new ones as many times as needed.',
                            },
                            {
                                q: 'How often should I check my email authentication records?',
                                a: 'Check your records after any DNS change, email provider migration, or when adding a new sending service. For production sending domains, weekly checks catch drift before it causes deliverability problems.',
                            },
                            {
                                q: 'What happens if my domain has no DMARC record?',
                                a: 'Without a DMARC record, receiving servers have no policy for handling emails that fail SPF or DKIM checks. Spoofed emails using your domain may reach recipients unchallenged. Since February 2024, Google and Yahoo require at least a p=none DMARC record for all bulk senders.',
                            },
                        ].map((faq) => (
                            <details key={faq.q} className="group bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                    <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">&#9660;</span>
                                </summary>
                                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Blog Posts */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'SPF, DKIM & DMARC Setup Guide',
                                description: 'Step-by-step DNS authentication setup for outbound email teams.',
                                href: '/blog/spf-dkim-dmarc-explained',
                            },
                            {
                                title: 'Complete Deliverability Guide',
                                description: 'Everything you need to know about email deliverability and inbox placement.',
                                href: '/blog/email-deliverability-guide',
                            },
                            {
                                title: 'How Spam Filters Work',
                                description: 'Understand the mechanisms behind spam filtering and how authentication plays a role.',
                                href: '/blog/how-spam-filters-work',
                            },
                        ].map((post) => (
                            <Link key={post.href} href={post.href} className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">{post.title}</h3>
                                <p className="text-xs text-gray-500">{post.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

function ToolIcon({ name, className }: { name: string; className: string }) {
    const iconClass = `w-6 h-6 ${className}`;
    switch (name) {
        case 'search':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
        case 'settings':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
        case 'key':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>;
        case 'shield':
            return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
        default:
            return null;
    }
}

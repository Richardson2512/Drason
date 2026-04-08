import type { Metadata } from 'next';
import Link from 'next/link';
import SpfGeneratorClient from './SpfGeneratorClient';

export const metadata: Metadata = {
    title: 'Free SPF Record Generator – Create Your SPF TXT Record | Superkabe',
    description:
        'Free SPF record generator tool. Configure authorized sending servers, IP addresses, and third-party includes to create a properly formatted SPF TXT record for your domain.',
    openGraph: {
        title: 'Free SPF Record Generator – Create Your SPF TXT Record | Superkabe',
        description:
            'Free SPF record generator tool. Configure authorized sending servers, IP addresses, and third-party includes to create a properly formatted SPF TXT record for your domain.',
        url: '/tools/spf-generator',
        siteName: 'Superkabe',
        type: 'website',
    },
    alternates: {
        canonical: '/tools/spf-generator',
    },
};

const faqItems = [
    {
        q: 'What is an SPF record?',
        a: 'An SPF (Sender Policy Framework) record is a DNS TXT record published at your domain that lists the mail servers and IP addresses authorized to send email on your behalf. Receiving servers check this record to verify that incoming mail claiming to come from your domain actually originates from an authorized source.',
    },
    {
        q: 'What does the -all vs ~all qualifier mean?',
        a: 'The -all qualifier (hard fail) tells receiving servers to reject emails from unauthorized sources. The ~all qualifier (soft fail) marks unauthorized emails as suspicious but still delivers them. For production domains, -all provides the strongest protection against spoofing. Use ~all only during initial setup or testing.',
    },
    {
        q: 'Why is there a 10 DNS lookup limit for SPF?',
        a: 'RFC 7208 limits SPF records to 10 DNS lookups to prevent denial-of-service attacks and excessive DNS traffic. Each include:, a, mx, ptr, and redirect mechanism counts as one lookup. The ip4: and ip6: mechanisms do not count because they do not require DNS resolution. Exceeding 10 lookups causes a permerror, which most receivers treat as an SPF failure.',
    },
    {
        q: 'Can I have multiple SPF records on one domain?',
        a: 'No. RFC 7208 specifies that a domain must have at most one SPF record. If a domain publishes multiple SPF TXT records, receiving servers should return a permerror. If you need to authorize additional senders, add them to your existing SPF record using include: or ip4:/ip6: mechanisms rather than creating a second record.',
    },
    {
        q: 'How do I add a third-party email service to my SPF record?',
        a: 'Each email service provider publishes an SPF include domain. Add it to your record using the include: mechanism. For example, Google Workspace uses include:_spf.google.com and SendGrid uses include:sendgrid.net. Check your provider\'s documentation for their specific SPF include domain. Each include counts as one DNS lookup toward the 10-lookup limit.',
    },
];

export default function SpfGeneratorPage() {
    const webAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'SPF Record Generator',
        description:
            'Free SPF record generator tool. Configure authorized sending servers, IP addresses, and third-party includes to create a properly formatted SPF TXT record for your domain.',
        url: 'https://www.superkabe.com/tools/spf-generator',
        applicationCategory: 'Utility',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        publisher: { '@id': 'https://www.superkabe.com/#organization' },
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Generate an SPF Record',
        description: 'Create a properly formatted SPF TXT record for your domain using this free generator tool.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Add authorized IPs',
                text: 'Enter any IPv4 or IPv6 addresses that are authorized to send email for your domain.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Include third-party senders',
                text: 'Add include: mechanisms for third-party email services like Google Workspace, SendGrid, or Microsoft 365.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Set failure policy',
                text: 'Choose a failure policy: hard fail (-all) for strict enforcement, soft fail (~all) for monitoring, or neutral (?all) for no action.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Copy and publish',
                text: 'Copy the generated SPF record and publish it as a TXT record at the root (@) of your domain in your DNS provider.',
            },
        ],
        publisher: { '@id': 'https://www.superkabe.com/#organization' },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
            },
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Interactive Generator */}
            <SpfGeneratorClient />

            {/* Educational Content */}
            <div className="mt-16 space-y-12">
                {/* How SPF Records Work */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">How SPF Records Work</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                        <p>
                            SPF (Sender Policy Framework) is a DNS-based email authentication protocol defined in RFC 7208. When a receiving mail server gets an email claiming to be from your domain, it queries your domain&apos;s DNS for a TXT record starting with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">v=spf1</code>. This record contains a list of mechanisms that define which servers are authorized to send email on your behalf.
                        </p>
                        <p>
                            The receiving server evaluates each mechanism in order from left to right. If the sending server&apos;s IP matches a mechanism, SPF returns the qualifier associated with that mechanism (pass, fail, softfail, or neutral). If no mechanism matches, the record&apos;s default qualifier (the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">all</code> mechanism at the end) applies.
                        </p>
                        <p>
                            SPF alone does not prevent spoofing &mdash; it only checks the envelope sender (MAIL FROM), not the visible From: header. This is why SPF works best combined with DKIM and DMARC, which together provide full authentication coverage.
                        </p>
                    </div>
                </section>

                {/* SPF Mechanisms Explained */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">SPF Mechanisms Explained</h2>
                    <div className="space-y-4">
                        {[
                            {
                                mechanism: 'ip4:',
                                desc: 'Matches a specific IPv4 address or CIDR range. Does not count toward the 10-lookup limit because no DNS query is needed.',
                                example: 'ip4:192.0.2.1 or ip4:192.0.2.0/24',
                            },
                            {
                                mechanism: 'ip6:',
                                desc: 'Matches a specific IPv6 address or CIDR range. Like ip4, does not count toward the lookup limit.',
                                example: 'ip6:2001:db8::1 or ip6:2001:db8::/32',
                            },
                            {
                                mechanism: 'include:',
                                desc: 'References another domain\'s SPF record. The receiving server performs a recursive SPF check on the included domain. Counts as 1 DNS lookup.',
                                example: 'include:_spf.google.com',
                            },
                            {
                                mechanism: 'a',
                                desc: 'Matches the IP addresses returned by your domain\'s A (and AAAA) record. Counts as 1 DNS lookup.',
                                example: 'a (resolves your domain\'s A record)',
                            },
                            {
                                mechanism: 'mx',
                                desc: 'Matches the IP addresses of your domain\'s MX (mail exchange) servers. Counts as 1 DNS lookup plus 1 per MX hostname resolved.',
                                example: 'mx (resolves your domain\'s MX records)',
                            },
                            {
                                mechanism: 'all',
                                desc: 'Matches everything. Always placed at the end of the record as the catch-all for any sender not matched by earlier mechanisms.',
                                example: '-all (hard fail), ~all (soft fail), ?all (neutral)',
                            },
                        ].map((item) => (
                            <div key={item.mechanism} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <code className="bg-gray-900 text-green-400 px-2 py-1 rounded text-xs font-mono shrink-0 mt-0.5">{item.mechanism}</code>
                                    <div>
                                        <p className="text-sm text-gray-700">{item.desc}</p>
                                        <p className="text-xs text-gray-500 mt-1 font-mono">{item.example}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SPF Qualifiers */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">SPF Qualifiers</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Each mechanism can be prefixed with a qualifier that determines how a match is treated. If no qualifier is specified, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">+</code> (pass) is the default.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { qualifier: '+', name: 'Pass', desc: 'The sender is authorized. This is the default if no qualifier is specified.', color: 'green' },
                            { qualifier: '-', name: 'Fail (Hard Fail)', desc: 'The sender is not authorized. Receiving servers should reject the email.', color: 'red' },
                            { qualifier: '~', name: 'SoftFail', desc: 'The sender is probably not authorized. Email is accepted but marked as suspicious.', color: 'amber' },
                            { qualifier: '?', name: 'Neutral', desc: 'No assertion is made about the sender. Equivalent to having no SPF record for that mechanism.', color: 'gray' },
                        ].map((item) => (
                            <div key={item.qualifier} className={`p-4 rounded-xl border border-${item.color}-100 bg-${item.color}-50/50`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <code className="bg-gray-900 text-green-400 px-2 py-1 rounded text-sm font-mono">{item.qualifier}</code>
                                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                </div>
                                <p className="text-xs text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Best Practices */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">SPF Best Practices</h2>
                    <ul className="space-y-4">
                        {[
                            {
                                title: 'Use -all (hard fail) in production',
                                desc: 'Hard fail provides the strongest protection against unauthorized senders. Only use ~all during initial setup when you are still identifying all legitimate sending sources.',
                            },
                            {
                                title: 'Stay under 10 DNS lookups',
                                desc: 'Each include:, a, mx, ptr, exists, and redirect mechanism counts as one lookup. Exceeding 10 causes a permerror that most receivers treat as a fail. Use ip4: and ip6: where possible since they do not require DNS lookups.',
                            },
                            {
                                title: 'Never use +all',
                                desc: 'The +all qualifier authorizes every server on the internet to send email as your domain. This completely defeats the purpose of SPF and may cause receiving servers to flag your domain as a spoofing risk.',
                            },
                            {
                                title: 'Publish only one SPF record per domain',
                                desc: 'Multiple SPF records cause a permerror. If you need to authorize additional senders, modify your existing record rather than adding a new one.',
                            },
                            {
                                title: 'Keep records under 255 characters per string',
                                desc: 'DNS TXT records have a 255-character string limit. Long SPF records can be split into multiple strings within a single record, but it is better to keep them concise by removing unused mechanisms.',
                            },
                            {
                                title: 'Combine with DKIM and DMARC',
                                desc: 'SPF alone only authenticates the envelope sender, not the visible From: header. Deploy all three protocols together for comprehensive email authentication.',
                            },
                        ].map((item) => (
                            <li key={item.title} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">&#10003;</span>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* FAQ Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqItems.map((faq) => (
                            <details key={faq.q} className="group bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                    <span className="font-semibold text-gray-900 pr-4 text-sm">{faq.q}</span>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">&#9660;</span>
                                </summary>
                                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Related Tools */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'SPF Record Lookup', desc: 'Check if your domain has a valid SPF record and see all authorized senders.', href: '/tools/spf-lookup' },
                            { title: 'DKIM Record Generator', desc: 'Generate a DKIM TXT record with your public key for email signing.', href: '/tools/dkim-generator' },
                            { title: 'DMARC Record Generator', desc: 'Create a DMARC policy to control how unauthenticated emails are handled.', href: '/tools/dmarc-generator' },
                        ].map((tool) => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                            >
                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">{tool.title}</h3>
                                <p className="text-xs text-gray-500">{tool.desc}</p>
                                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
                                    Use tool <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Related Reading */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                    <Link
                        href="/blog/spf-dkim-dmarc-explained"
                        className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                    >
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm">
                            SPF, DKIM &amp; DMARC Explained &mdash; Complete Setup Guide
                        </h3>
                        <p className="text-xs text-gray-500">
                            Step-by-step DNS authentication setup for outbound email teams. Learn how SPF, DKIM, and DMARC work together to protect your sender reputation.
                        </p>
                        <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
                            Read guide <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </span>
                    </Link>
                </section>

                {/* CTA */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Need Continuous SPF Monitoring?</h2>
                    <p className="text-gray-600 text-sm max-w-xl mx-auto mb-6">
                        This generator creates your SPF record, but DNS records can break after provider changes, migrations, or accidental edits. Superkabe monitors SPF, DKIM, and DMARC across all your sending domains automatically and alerts you before misconfigurations damage deliverability.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                    >
                        Start free trial
                    </Link>
                    <p className="text-xs text-gray-400 mt-3">No credit card required</p>
                </section>
            </div>
        </>
    );
}

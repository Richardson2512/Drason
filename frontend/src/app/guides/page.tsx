import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import MarketingBackdrop from '@/components/MarketingBackdrop';

export const metadata: Metadata = {
    title: 'Guides | Superkabe',
    description: 'Long-form guides on cold-email deliverability, email validation, and the modern outbound infrastructure stack. Authority reference for operators.',
    alternates: { canonical: '/guides' },
    openGraph: {
        title: 'Guides | Superkabe',
        description: 'Long-form, evergreen guides on cold-email deliverability, email validation, and the modern outbound infrastructure stack.',
        url: '/guides',
        siteName: 'Superkabe',
        type: 'website',
    },
};

interface Guide {
    href: string;
    title: string;
    description: string;
    tag: string;
    readTime: string;
}

const guides: Guide[] = [
    {
        href: '/guides/outbound-email-infrastructure-stack',
        title: 'The modern outbound email infrastructure stack',
        description: 'How the 6 layers of outbound email infrastructure fit together. Data enrichment, validation, sending platforms, mailbox providers, monitoring, and alerting - with tool comparisons, cost breakdowns, and the gaps most teams miss.',
        tag: 'Architecture',
        readTime: '18 min read',
    },
    {
        href: '/guides/email-validation-cold-outreach',
        title: 'Email validation for cold outreach',
        description: 'A complete reference on email validation: syntax, MX, disposable, catch-all, role-based, and spam-trap detection. When external validation pays back and when platform-bundled validation is enough.',
        tag: 'Validation',
        readTime: '14 min read',
    },
    {
        href: '/guides/email-deliverability-glossary',
        title: 'The email deliverability glossary',
        description: 'Every term that matters in deliverability - from authentication (SPF, DKIM, DMARC) through reputation (sender score, bounce rate, complaint rate) through filtering (Gmail tabs, Microsoft SCL, Postmaster tools). One reference, plain English.',
        tag: 'Glossary',
        readTime: '22 min read',
    },
];

export default function GuidesIndexPage() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.superkabe.com' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.superkabe.com/guides' },
        ],
    };

    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Superkabe Guides',
        description: 'Long-form, evergreen guides on cold-email deliverability and outbound infrastructure.',
        itemListElement: guides.map((g, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://www.superkabe.com${g.href}`,
            name: g.title,
        })),
    };

    return (
        <div className="relative bg-[#F7F2EB] text-gray-900 font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

            <Navbar />
            <MarketingBackdrop />

            <div className="max-w-5xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 mb-6 font-mono text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <span>Superkabe - AI cold email + LinkedIn outreach platform</span>
                </Link>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-[1.05] tracking-tight">
                    Guides
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
                    Long-form, evergreen reference material for outbound operators. Architecture overviews, deliverability deep-dives, and the operational glossary every email-marketing team eventually needs.
                </p>

                <div className="space-y-4">
                    {guides.map((g) => (
                        <Link
                            key={g.href}
                            href={g.href}
                            className="block bg-white border border-gray-200 p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase rounded-sm">
                                    {g.tag}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">{g.readTime}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                {g.title}
                            </h2>
                            <p className="text-gray-600 leading-relaxed">{g.description}</p>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 bg-white border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Looking for shorter reads?</h2>
                    <p className="text-gray-600 mb-5 leading-relaxed">
                        Guides are the long-form reference layer. The <Link href="/blog" className="text-blue-600 hover:text-blue-800 underline font-medium">blog</Link> covers tactical playbooks, comparison posts, and category overviews. The <Link href="/docs" className="text-blue-600 hover:text-blue-800 underline font-medium">docs</Link> cover product mechanics; the <Link href="/docs/help/24-7-monitoring" className="text-blue-600 hover:text-blue-800 underline font-medium">help center</Link> covers concrete operator questions.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}

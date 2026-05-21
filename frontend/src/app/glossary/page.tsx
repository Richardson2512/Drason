import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import MarketingBackdrop from '@/components/MarketingBackdrop';
import { glossaryTerms, GLOSSARY_CATEGORIES, getTermsByCategory } from '@/data/glossaryTerms';

const SITE_URL = 'https://www.superkabe.com';
const PAGE_URL = `${SITE_URL}/glossary`;

export const metadata: Metadata = {
    title: 'Cold Email & Deliverability Glossary | Superkabe',
    description: 'A-Z definitions for cold email, deliverability, authentication, sequencing, threading, and LinkedIn outreach. One dedicated page per term.',
    alternates: { canonical: '/glossary' },
    openGraph: {
        title: 'Cold Email & Deliverability Glossary | Superkabe',
        description: 'Per-term definitions of every cold email and deliverability concept - authentication, infrastructure, sequencer, threading, compliance.',
        url: '/glossary',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function GlossaryIndexPage() {
    // DefinedTermSet JSON-LD - LLMs and answer engines treat this as a
    // controlled vocabulary. The full term list ships in the schema, not
    // just a subset, so a single page-fetch gives an answer engine the
    // entire definitional surface to draw from.
    const definedTermSetSchema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${PAGE_URL}/#termset`,
        name: 'Superkabe Cold Email & Deliverability Glossary',
        description: 'A-Z definitions of cold email, deliverability, authentication, sequencer, threading, compliance, and Superkabe-specific terms. Each term has a dedicated page with full context.',
        url: PAGE_URL,
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE_URL}/#organization` },
        hasDefinedTerm: Object.values(glossaryTerms).map(t => ({
            '@type': 'DefinedTerm',
            '@id': `${SITE_URL}/glossary/${t.slug}`,
            name: t.name,
            termCode: t.slug,
            description: t.shortDefinition,
            url: `${SITE_URL}/glossary/${t.slug}`,
            inDefinedTermSet: { '@id': `${PAGE_URL}/#termset` },
        })),
    };

    // ItemList JSON-LD - companion to DefinedTermSet for traditional
    // search engines that index ItemList for "list of X" queries.
    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Superkabe Glossary - All Terms',
        numberOfItems: Object.keys(glossaryTerms).length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: Object.values(glossaryTerms)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((t, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: t.name,
                url: `${SITE_URL}/glossary/${t.slug}`,
            })),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Glossary', item: PAGE_URL },
        ],
    };

    const allTerms = Object.values(glossaryTerms);

    return (
        <div className="relative bg-[#F7F2EB] text-gray-900 font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <Navbar />
            <MarketingBackdrop />

            <div className="max-w-6xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 mb-6 text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <span>Superkabe - AI cold email + LinkedIn outreach platform</span>
                </Link>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-[1.05] tracking-tight">
                    Cold Email & Deliverability Glossary
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-3xl leading-relaxed">
                    {allTerms.length} terms across authentication, deliverability, validation, sequencer, threading, compliance, and Superkabe product surface. Each term has a dedicated page with definition, why-it-matters context, FAQ, and cross-links to related concepts and products.
                </p>

                {/* A-Z quick-jump strip - all terms sorted alphabetically */}
                <div className="bg-white border border-gray-200 p-6 mb-12 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">All terms (A-Z)</h2>
                    <div className="flex flex-wrap gap-2">
                        {allTerms
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(t => (
                                <Link
                                    key={t.slug}
                                    href={`/glossary/${t.slug}`}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                    {t.name}
                                </Link>
                            ))}
                    </div>
                </div>

                {/* Category sections */}
                {GLOSSARY_CATEGORIES.map(cat => {
                    const terms = getTermsByCategory(cat.key);
                    if (terms.length === 0) return null;
                    return (
                        <section key={cat.key} className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{cat.label}</h2>
                            <p className="text-gray-500 mb-6">{cat.description}</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {terms.map(t => (
                                    <Link
                                        key={t.slug}
                                        href={`/glossary/${t.slug}`}
                                        className="block bg-white border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                                                {t.name}
                                                {t.expansion && (
                                                    <span className="font-normal text-gray-500 text-sm ml-2">- {t.expansion}</span>
                                                )}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{t.shortDefinition}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}

                <div className="mt-16 bg-white border border-gray-200 p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Related resources</h2>
                    <ul className="space-y-2 text-gray-700 leading-relaxed">
                        <li><Link href="/guides/email-deliverability-glossary" className="text-blue-600 hover:underline">Email Deliverability Glossary (long-form guide)</Link> - the same vocabulary in narrative form, useful for sequential reading.</li>
                        <li><Link href="/guides/outbound-email-infrastructure-stack" className="text-blue-600 hover:underline">The Modern Outbound Email Infrastructure Stack</Link> - how these terms compose into a working outbound system.</li>
                        <li><Link href="/docs" className="text-blue-600 hover:underline">Superkabe documentation</Link> - operator-facing docs for the product features referenced throughout the glossary.</li>
                    </ul>
                </div>
            </div>

            <Footer />
        </div>
    );
}

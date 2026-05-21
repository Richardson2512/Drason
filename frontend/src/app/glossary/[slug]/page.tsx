import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import MarketingBackdrop from '@/components/MarketingBackdrop';
import { glossaryTerms, GLOSSARY_CATEGORIES } from '@/data/glossaryTerms';
import { productPages } from '@/data/productPages';
import { FaqJsonLd } from '@/components/seo/FaqSection';

const SITE_URL = 'https://www.superkabe.com';
const TERMSET_ID = `${SITE_URL}/glossary/#termset`;

// Statically generate every glossary term at build time.
export async function generateStaticParams() {
    return Object.keys(glossaryTerms).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const term = glossaryTerms[slug];
    if (!term) return {};

    const title = `${term.name} | Superkabe Glossary`;
    return {
        title,
        description: term.shortDefinition,
        alternates: { canonical: `/glossary/${slug}` },
        openGraph: {
            title,
            description: term.shortDefinition,
            url: `/glossary/${slug}`,
            siteName: 'Superkabe',
            type: 'article',
            modifiedTime: term.dateModified,
        },
    };
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const term = glossaryTerms[slug];

    if (!term) {
        notFound();
    }

    const pageUrl = `${SITE_URL}/glossary/${slug}`;
    const categoryMeta = GLOSSARY_CATEGORIES.find(c => c.key === term.category);

    // Resolve related products to actual page metadata so we link to
    // titles that exist (no dead links to product slugs that don't
    // exist in productPages.ts).
    const relatedProductsResolved = (term.relatedProducts || [])
        .map(slugRef => ({ slug: slugRef, data: productPages[slugRef] }))
        .filter(x => !!x.data);

    // Resolve related terms similarly - prune any that don't exist.
    const relatedTermsResolved = (term.relatedTerms || [])
        .map(slugRef => glossaryTerms[slugRef])
        .filter((x): x is NonNullable<typeof x> => !!x);

    // ── DefinedTerm JSON-LD ──
    // This is the load-bearing schema for AEO/GEO. The @id stable URL
    // lets answer engines de-duplicate when this term is referenced
    // from other pages (via mentions[] etc.). inDefinedTermSet anchors
    // the term to the parent vocabulary so the answer engine knows
    // this is one of N coordinated definitions.
    const definedTermSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        '@id': pageUrl,
        name: term.name,
        ...(term.expansion ? { alternateName: term.expansion } : {}),
        termCode: term.slug,
        description: term.shortDefinition,
        url: pageUrl,
        inDefinedTermSet: { '@id': TERMSET_ID },
        inLanguage: 'en-US',
        ...(term.dateModified ? { dateModified: term.dateModified } : {}),
        ...(term.sameAs ? { sameAs: [term.sameAs] } : {}),
    };

    // mentions linkage - if this term references SoftwareApplication
    // entities (the feature-level product pages), declare them so AI
    // engines can follow the entity graph from term → product.
    if (relatedProductsResolved.length > 0) {
        definedTermSchema.mentions = relatedProductsResolved.map(p => ({
            '@id': `${SITE_URL}/#feature-${p.slug}`,
            '@type': 'SoftwareApplication',
            name: p.data.title,
            url: `${SITE_URL}/product/${p.slug}`,
        }));
    }

    // WebPage envelope - lets the article inherit the right
    // publisher/breadcrumb context.
    const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': pageUrl,
        name: term.name,
        description: term.shortDefinition,
        url: pageUrl,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        primaryImageOfPage: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/image/og-image.png`,
            width: 1200,
            height: 630,
        },
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntity: { '@id': pageUrl },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['.aeo-quick-definition', '.aeo-tldr'],
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${SITE_URL}/glossary` },
            { '@type': 'ListItem', position: 3, name: term.name, item: pageUrl },
        ],
    };

    return (
        <div className="relative bg-[#F7F2EB] text-gray-900 font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {term.faq && term.faq.length > 0 && <FaqJsonLd items={term.faq} />}

            <Navbar />
            <MarketingBackdrop />

            <div className="max-w-4xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                    <Link href="/glossary" className="hover:text-blue-700 hover:underline">Glossary</Link>
                    <span className="text-gray-400">/</span>
                    {categoryMeta && (
                        <>
                            <span className="text-gray-600">{categoryMeta.label}</span>
                            <span className="text-gray-400">/</span>
                        </>
                    )}
                    <span className="text-gray-900">{term.name}</span>
                </nav>

                {/* H1 + expansion */}
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3 leading-[1.05] tracking-tight">
                    {term.name}
                </h1>
                {term.expansion && (
                    <p className="text-xl text-gray-500 mb-8 font-medium">{term.expansion}</p>
                )}

                {/* Quick definition - speakable surface + the "direct answer"
                    in the first 50 words AI engines extract for citation.
                    The data-aeo and aria-label attributes give answer engines
                    explicit hints about which block to lift as the canonical
                    short definition. The class name also matches the speakable
                    cssSelector on the WebPage schema below. */}
                <div
                    className="aeo-quick-definition aeo-tldr not-prose mb-10 p-6 bg-blue-50/70 border-l-4 border-blue-500"
                    data-aeo="direct-answer"
                    aria-label={`Definition of ${term.name}`}
                >
                    <div className="text-blue-700 font-semibold text-[11px] uppercase tracking-widest mb-2">
                        Direct answer
                    </div>
                    <p className="text-lg text-gray-800 leading-relaxed m-0">
                        <strong className="text-gray-900">{term.name}{term.expansion ? ` (${term.expansion})` : ''}:</strong>{' '}
                        {term.shortDefinition}
                    </p>
                </div>

                {/* Long-form definition */}
                <div className="prose prose-lg max-w-none mb-10">
                    {term.longDefinition.map((para, i) => (
                        <p key={i} className="text-gray-700 leading-relaxed">{para}</p>
                    ))}
                </div>

                {/* Why it matters - product-context callout */}
                {term.whyItMatters && (
                    <div className="bg-white border-2 border-emerald-200 p-6 mb-10 shadow-sm">
                        <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-3 mt-0">Why it matters in Superkabe</h2>
                        <p className="text-gray-700 leading-relaxed m-0">{term.whyItMatters}</p>
                    </div>
                )}

                {/* FAQ - visible accordion paired with FaqJsonLd above */}
                {term.faq && term.faq.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
                        <div className="space-y-4">
                            {term.faq.map((item, i) => (
                                <details key={i} className="group bg-white border border-gray-200 p-6 open:shadow-md transition-shadow">
                                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-bold text-gray-900 pr-4 m-0">{item.q}</h3>
                                        <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none select-none">+</span>
                                    </summary>
                                    <p className="mt-4 text-gray-700 leading-relaxed text-[16px] m-0">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}

                {/* See also - related terms + products + blog */}
                {(relatedTermsResolved.length > 0 || relatedProductsResolved.length > 0 || (term.relatedBlog && term.relatedBlog.length > 0)) && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">See also</h2>

                        {relatedTermsResolved.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Related terms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {relatedTermsResolved.map(t => (
                                        <Link
                                            key={t.slug}
                                            href={`/glossary/${t.slug}`}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                        >
                                            {t.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {relatedProductsResolved.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Related Superkabe features</h3>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {relatedProductsResolved.map(p => (
                                        <Link
                                            key={p.slug}
                                            href={`/product/${p.slug}`}
                                            className="block bg-white border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                                        >
                                            <div className="text-sm font-bold text-gray-900 mb-1">{p.data.title}</div>
                                            <p className="text-xs text-gray-500 line-clamp-2 m-0">{p.data.description}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {term.relatedBlog && term.relatedBlog.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Related reading</h3>
                                <div className="flex flex-wrap gap-2">
                                    {term.relatedBlog.map(blogSlug => (
                                        <Link
                                            key={blogSlug}
                                            href={`/blog/${blogSlug}`}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                        >
                                            {blogSlug.replace(/-/g, ' ')}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Authoritative source link */}
                {term.sameAs && (
                    <div className="bg-gray-50 border border-gray-200 p-5 mb-12 text-sm">
                        <span className="font-semibold text-gray-700">Authoritative source:</span>{' '}
                        <a
                            href={term.sameAs}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                        >
                            {term.sameAs}
                        </a>
                    </div>
                )}

                {/* Back to glossary */}
                <div className="border-t border-gray-200 pt-8">
                    <Link
                        href="/glossary"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        <span>&larr; Back to glossary index</span>
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}

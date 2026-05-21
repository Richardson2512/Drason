import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import MarketingBackdrop from '@/components/MarketingBackdrop';
import { glossaryTerms, GLOSSARY_CATEGORIES } from '@/data/glossaryTerms';
import { productPages } from '@/data/productPages';
import FaqSection, { FaqJsonLd } from '@/components/seo/FaqSection';
import TldrBlock from '@/components/seo/TldrBlock';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import BlogHeader from '@/components/blog/BlogHeader';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';

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

    // Breadcrumb structure shared by both the BreadcrumbJsonLd schema
    // emitter AND the visible breadcrumb above the H1 - one source of
    // truth so they cannot drift.
    const crumbs = [
        { name: 'Home', url: SITE_URL },
        { name: 'Glossary', url: `${SITE_URL}/glossary` },
        { name: term.name, url: pageUrl },
    ];

    // Featured product for the bottom CTA - first related product when
    // present. Glossary terms that are pure concepts (e.g. SMTP code,
    // RFC headers) have no related product, in which case the CTA is
    // omitted entirely rather than shown with a generic link.
    const featuredProduct = relatedProductsResolved[0];

    return (
        <div className="relative bg-[#F7F2EB] text-gray-900 font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
            <BreadcrumbJsonLd crumbs={crumbs} />
            {term.faq && term.faq.length > 0 && <FaqJsonLd items={term.faq} />}

            <Navbar />
            <MarketingBackdrop />

            <div className="max-w-4xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24">
                {/* Visible breadcrumb - paired with BreadcrumbJsonLd above.
                    Same trail as the schema; the schema is the machine-
                    readable copy and this nav is the human-readable one. */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
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

                <article>
                    {/* BlogHeader for visual consistency with /product, /blog,
                        and /guides pages. The tag uses the category name so
                        readers see where the term sits in the vocabulary;
                        the author byline is the platform author (same
                        convention every other page on the site uses). */}
                    <BlogHeader
                        tag={categoryMeta ? `Glossary - ${categoryMeta.label}` : 'Glossary'}
                        title={term.name + (term.expansion ? ` (${term.expansion})` : '')}
                        dateModified={term.dateModified || '2026-05-21'}
                        authorName="Robert Smith"
                        authorRole="Deliverability Specialist - Superkabe"
                    />

                    {/* TL;DR / speakable surface. The aeo-tldr class is what
                        WebPage.speakable.cssSelector targets, so this block
                        is the canonical short definition AI engines lift
                        for citation. Wrapping with strong term-name + colon
                        keeps the first 50 words self-contained ("X is Y"). */}
                    <TldrBlock text={`${term.name}${term.expansion ? ` (${term.expansion})` : ''}: ${term.shortDefinition}`} />

                    {/* Long-form definition. Paragraph entries become <p>
                        nodes inside prose styling - matches the product /
                        blog / guide article surfaces. */}
                    <div className="prose prose-lg max-w-none mb-10">
                        {term.longDefinition.map((para, i) => (
                            <p key={i} className="text-gray-700 leading-relaxed">{para}</p>
                        ))}
                    </div>

                    {/* Why it matters - product-context callout. Kept as a
                        distinct visual surface (not folded into TldrBlock)
                        because it is semantically different from the
                        definition: the definition is universal; "why it
                        matters in Superkabe" is product-specific framing
                        for E-E-A-T + the mentions[] entity graph. */}
                    {term.whyItMatters && (
                        <div className="bg-white border-2 border-emerald-200 p-6 mb-10 shadow-sm">
                            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-3 mt-0">Why it matters in Superkabe</h2>
                            <p className="text-gray-700 leading-relaxed m-0">{term.whyItMatters}</p>
                        </div>
                    )}

                    {/* FAQ - FaqSection is the shared component used by
                        product + blog pages. Paired with FaqJsonLd above so
                        the same Q&As are both visible and machine-readable. */}
                    {term.faq && term.faq.length > 0 && (
                        <FaqSection items={term.faq} />
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

                    {/* Bottom CTA - shared component, only rendered when
                        the term has at least one related product. Pure-
                        concept terms (e.g. RFC headers, SMTP codes) skip
                        this section rather than show a generic CTA - a
                        weak CTA is worse than no CTA for conversion. */}
                    {featuredProduct && (
                        <BottomCtaStrip
                            headline={`See how ${featuredProduct.data.title} works`}
                            body={featuredProduct.data.description}
                            primaryCta={{ label: 'Read product details', href: `/product/${featuredProduct.slug}` }}
                            secondaryCta={{ label: 'Start free trial', href: '/signup' }}
                        />
                    )}
                </article>

                {/* Back to glossary - kept outside <article> as utility nav
                    rather than article content. */}
                <div className="border-t border-gray-200 pt-8 mt-12">
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { productPages } from '@/data/productPages';
import { productPageSeo } from '@/data/productPageSeo';
import TldrBlock from '@/components/seo/TldrBlock';
import FaqSection, { FaqJsonLd } from '@/components/seo/FaqSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import BlogHeader from '@/components/blog/BlogHeader';
import FeaturedHero from '@/components/blog/FeaturedHero';
import BottomCtaStrip from '@/components/blog/BottomCtaStrip';
import MaileveryToc from '@/components/blog/MaileveryToc';

const SITE_URL = 'https://www.superkabe.com';
const DEFAULT_PUBLISHED = '2025-11-01';
const DEFAULT_MODIFIED = '2026-04-25';

// Statically generate all routes at build time for SEO
export async function generateStaticParams() {
    return Object.keys(productPages).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = productPages[slug];
    if (!data) return {};

    return {
        title: `${data.title} | Superkabe`,
        description: data.description,
        alternates: { canonical: `/product/${slug}` },
        openGraph: {
            title: `${data.title} | Superkabe`,
            description: data.description,
            url: `/product/${slug}`,
            siteName: 'Superkabe',
            type: 'article',
            publishedTime: data.datePublished || DEFAULT_PUBLISHED,
            modifiedTime: data.dateModified || DEFAULT_MODIFIED,
        },
    };
}

/**
 * Derive a punchy 3-6 word FeaturedHero tagline from the product title.
 * Strips trailing qualifiers like "(Roadmap)" and limits to 6 words.
 */
function deriveTagline(title: string): string {
    const cleaned = title.replace(/\([^)]+\)/g, '').trim();
    const words = cleaned.split(/\s+/);
    if (words.length <= 6) return cleaned;
    return words.slice(0, 6).join(' ');
}

export default async function DynamicProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = productPages[slug];

    if (!data) {
        notFound();
    }

    // Merge in supplementary SEO data (TL;DR, FAQ, comparison table,
    // dateModified). Inline fields on `data` take precedence; `seo`
    // provides the fallback so pages can be enriched incrementally.
    const seo = productPageSeo[slug] || {};
    const tldr = data.tldr || seo.tldr;
    const faq = data.faq || seo.faq;
    const comparisonTable = data.comparisonTable || seo.comparisonTable;

    const datePublished = data.datePublished || DEFAULT_PUBLISHED;
    const dateModified = data.dateModified || seo.dateModified || DEFAULT_MODIFIED;
    const pageUrl = `${SITE_URL}/product/${slug}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": data.title,
        "description": data.description,
        "url": pageUrl,
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": SITE_URL,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/image/logo-v2.png`
            }
        },
        "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "Superkabe",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "url": SITE_URL,
            "featureList": data.title
        },
        "datePublished": datePublished,
        "dateModified": dateModified,
    };

    // Auto-generate TL;DR from first section paragraph if neither explicit
    // `tldr` nor the supplementary seo entry provides one.
    const autoTldr = !tldr && data.sections?.[0]?.paragraphs?.[0]
        ? data.sections[0].paragraphs[0].split(/\s+/).slice(0, 55).join(' ').replace(/[,;:]$/, '') + '…'
        : null;
    const tldrText = tldr || autoTldr;

    const crumbs = [
        { name: 'Home', url: SITE_URL },
        { name: 'Product', url: `${SITE_URL}/product` },
        { name: data.title, url: pageUrl },
    ];

    return (
        <div className="bg-[#F7F2EB] text-gray-900 font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <BreadcrumbJsonLd crumbs={crumbs} />
            {faq && faq.length > 0 && <FaqJsonLd items={faq} />}

            <Navbar />

            <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-10 lg:gap-16">
                    {/* Sticky left TOC — auto-extracts from <article> headings */}
                    <aside className="hidden lg:block">
                        <MaileveryToc />
                    </aside>

                    {/* Main article column */}
                    <main className="min-w-0 max-w-3xl">
                        <article>
                            {/* Breadcrumb badge — situates this deep-dive page within the platform */}
                            <Link
                                href="/product"
                                className="inline-flex items-center gap-1.5 mb-6 text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <span>Part of Superkabe — the AI cold email platform</span>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>

                            <BlogHeader
                                tag="Product"
                                title={data.title}
                                dateModified={dateModified}
                                authorName="Edward Sam"
                                authorRole="Deliverability Specialist · Superkabe"
                            />

                            <FeaturedHero
                                badge="PRODUCT · 2026"
                                eyebrow="Deep dive"
                                tagline={deriveTagline(data.title)}
                                sub="Superkabe — the AI cold email platform"
                            />

                            {tldrText && <TldrBlock text={tldrText} />}

                            <p className="text-lg text-gray-700 leading-relaxed mb-12">
                                <strong className="text-gray-900">Superkabe</strong> {data.intro}
                            </p>

                            <div className="prose prose-lg max-w-none text-gray-700">
                                {data.sections.map((section, index) => (
                                    <div key={index}>
                                        {index === 0 ? (
                                            <h2 className="text-3xl font-bold mb-6 mt-12 text-gray-900">{section.heading}</h2>
                                        ) : (
                                            <h3 className="text-2xl font-bold mb-4 mt-10 text-gray-800">{section.heading}</h3>
                                        )}
                                        {section.paragraphs.map((p, pIdx) => (
                                            <p key={pIdx} className="mb-6 text-gray-700 leading-relaxed text-lg">{p}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {comparisonTable && <ComparisonTable data={comparisonTable} />}

                            {faq && faq.length > 0 && <FaqSection items={faq} />}

                            {data.relatedBlog && data.relatedBlog.length > 0 && (
                                <div className="mt-16">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {data.relatedBlog.map((blog, i) => (
                                            <Link key={i} href={`/blog/${blog.slug}`} className="bg-white p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                                                <h4 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-gray-700 transition-colors">{blog.title}</h4>
                                                <p className="text-gray-500 text-xs">{blog.description}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </article>

                        <BottomCtaStrip
                            headline={`Ready to implement ${data.title}?`}
                            body="Run your cold email outreach on Superkabe — AI sequences, multi-mailbox sending, and the full protection layer, all in one platform."
                            primaryCta={{ label: 'Start free trial', href: '/signup' }}
                            secondaryCta={{ label: 'See pricing', href: '/pricing' }}
                        />
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}

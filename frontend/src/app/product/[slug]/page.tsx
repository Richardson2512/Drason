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

const SITE_URL = 'https://www.superkabe.com';
const DEFAULT_PUBLISHED = '2025-11-01';
const DEFAULT_MODIFIED = '2026-04-24';

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
 // `tldr` nor the supplementary seo entry provides one. This ensures
 // every product page has an answer-engine-friendly summary block.
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
 <div className="bg-[#F7F2EB] text-[#1E1E2F] font-sans min-h-screen">
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
 <BreadcrumbJsonLd crumbs={crumbs} />
 {faq && faq.length > 0 && <FaqJsonLd items={faq} />}

 {/* ================= NAVBAR ================= */}
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

 <article className="pt-32 md:pt-36 pb-10 max-w-4xl mx-auto px-6 relative z-10">
 {/* Positioning breadcrumb — contextualizes this deep-dive page within the broader platform */}
 <Link
 href="/product"
 className="inline-flex items-center gap-1.5 mb-6 text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
 >
 <span>Part of Superkabe — the AI cold email platform</span>
 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
 </Link>

 <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
 {data.title}
 </h1>

 <p className="text-xs text-gray-400 mb-8 tracking-wide">
 Last updated {new Date(dateModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
 </p>

 {tldrText && <TldrBlock text={tldrText} />}

 <div className="max-w-4xl mx-auto mb-10 p-6 bg-blue-50/50 border border-blue-100/50">
 <p className="text-lg text-blue-900 leading-relaxed font-medium">
 <strong className="text-blue-950">Superkabe</strong> {data.intro}
 </p>
 </div>

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
 <Link key={i} href={`/blog/${blog.slug}`} className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
 <h4 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors">{blog.title}</h4>
 <p className="text-gray-500 text-xs">{blog.description}</p>
 </Link>
 ))}
 </div>
 </div>
 )}

 <div className="mt-20 p-10 md:p-14 bg-white border border-gray-100 shadow-xl text-center">
 <h3 className="text-2xl font-bold mb-4">Ready to implement {data.title}?</h3>
 <p className="text-gray-500 mb-8">Run your cold email outreach on Superkabe — AI sequences, multi-mailbox sending, and the full protection layer, all in one platform.</p>
 <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all">
 Start Free Trial
 </Link>
 </div>
 </article>

 <Footer />
 </div>
 );
}

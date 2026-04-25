import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import { releaseNotes } from '@/data/releaseNotes';

// Generate static paths for all release versions
export async function generateStaticParams() {
 return releaseNotes.map(r => ({ slug: r.slug }));
}

// Dynamic metadata per release
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
 const { slug } = await params;
 const release = releaseNotes.find(r => r.slug === slug);
 if (!release) return {};

 const title = `Superkabe ${release.version} — ${release.headline}`;
 const description = release.summary;

 return {
 title,
 description,
 alternates: { canonical: `/release-notes/${slug}` },
 openGraph: {
 title,
 description,
 url: `/release-notes/${slug}`,
 siteName: 'Superkabe',
 type: 'article',
 publishedTime: release.isoDate,
 },
 };
}

export default async function ReleaseNotePage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const release = releaseNotes.find(r => r.slug === slug);
 if (!release) notFound();

 const currentIndex = releaseNotes.findIndex(r => r.slug === slug);
 const prevRelease = currentIndex < releaseNotes.length - 1 ? releaseNotes[currentIndex + 1] : null;
 const nextRelease = currentIndex > 0 ? releaseNotes[currentIndex - 1] : null;

 // NewsArticle schema
 const newsArticleSchema = {
 "@context": "https://schema.org",
 "@type": "NewsArticle",
 "headline": `Superkabe ${release.version} — ${release.headline}`,
 "description": release.summary,
 "datePublished": release.isoDate,
 "dateModified": release.isoDate,
 "author": {
 "@type": "Organization",
 "name": "Superkabe",
 "@id": "https://www.superkabe.com/#organization"
 },
 "publisher": {
 "@id": "https://www.superkabe.com/#organization"
 },
 "mainEntityOfPage": {
 "@type": "WebPage",
 "@id": `https://www.superkabe.com/release-notes/${slug}`
 },
 "articleSection": "Release Notes",
 "about": {
 "@type": "SoftwareApplication",
 "@id": "https://www.superkabe.com/#software"
 },
 "softwareVersion": release.version,
 };

 // BreadcrumbList schema
 const breadcrumbSchema = {
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
 { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com" },
 { "@type": "ListItem", "position": 2, "name": "Release Notes", "item": "https://www.superkabe.com/release-notes" },
 { "@type": "ListItem", "position": 3, "name": `v${release.version}`, "item": `https://www.superkabe.com/release-notes/${slug}` },
 ]
 };

 // FAQ schema from sections
 const faqItems = release.sections.flatMap(s =>
 s.items.map(item => ({
 "@type": "Question" as const,
 "name": `What is ${item.title} in Superkabe ${release.version}?`,
 "acceptedAnswer": {
 "@type": "Answer" as const,
 "text": item.detail,
 }
 }))
 ).slice(0, 8); // Max 8 FAQ items

 const faqSchema = faqItems.length > 0 ? {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": faqItems,
 } : null;

 return (
 <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }} />
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
 {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

 <Navbar />

 <div className="fixed inset-0 pointer-events-none z-0">
 <div className="cloud-bg">
 <div className="cloud-shadow" />
 <div className="cloud-puff-1" />
 <div className="cloud-puff-2" />
 <div className="cloud-puff-3" />
 </div>
 <div className="absolute inset-0 hero-grid" />
 </div>

 <article className="relative z-10 pt-32 md:pt-36 pb-10 px-6">
 <div className="max-w-4xl mx-auto">

 {/* Breadcrumb */}
 <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
 <Link href="/release-notes" className="hover:text-blue-600 transition-colors">Release Notes</Link>
 <span>/</span>
 <span className="text-gray-700 font-medium">v{release.version}</span>
 </nav>

 {/* Header */}
 <div className="mb-12">
 <div className="flex items-center gap-3 mb-4">
 <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-bold">
 v{release.version}
 </span>
 <span className="text-gray-400 text-sm">{release.date}</span>
 {release.label && (
 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold">
 {release.label}
 </span>
 )}
 </div>
 <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
 {release.headline}
 </h1>
 <p className="text-lg text-gray-500 leading-relaxed max-w-3xl">
 {release.summary}
 </p>
 </div>

 {/* Quick overview */}
 <div className="bg-white border border-gray-200 p-6 mb-10 shadow-sm">
 <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">What&apos;s in this release</h2>
 <ul className="space-y-2">
 {release.features.map((f, i) => (
 <li key={i} className="flex items-start gap-3 text-gray-700">
 <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
 {i + 1}
 </span>
 {f}
 </li>
 ))}
 </ul>
 </div>

 {/* Detailed Sections */}
 {release.sections.map((section, si) => (
 <div key={si} className="mb-10">
 <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
 <p className="text-gray-500 mb-6 leading-relaxed">{section.description}</p>

 <div className="space-y-4">
 {section.items.map((item, ii) => (
 <div key={ii} className="bg-white border border-gray-100 p-5 shadow-sm hover:border-blue-200 transition-colors">
 <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
 <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
 </div>
 ))}
 </div>
 </div>
 ))}

 {/* Navigation */}
 <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-200">
 {prevRelease ? (
 <Link href={`/release-notes/${prevRelease.slug}`} className="group">
 <div className="text-xs text-gray-400 mb-1">&larr; Previous Release</div>
 <div className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
 v{prevRelease.version} — {prevRelease.date}
 </div>
 </Link>
 ) : <div />}
 {nextRelease ? (
 <Link href={`/release-notes/${nextRelease.slug}`} className="text-right group">
 <div className="text-xs text-gray-400 mb-1">Next Release &rarr;</div>
 <div className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
 v{nextRelease.version} — {nextRelease.date}
 </div>
 </Link>
 ) : <div />}
 </div>

 {/* Back to all releases */}
 <div className="text-center mt-10">
 <Link href="/release-notes" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
 &larr; View all release notes
 </Link>
 </div>
 </div>
 </article>

 <Footer />
 </div>
 );
}

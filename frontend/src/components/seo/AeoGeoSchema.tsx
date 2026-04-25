import React from 'react';

/**
 * AEO / GEO enrichment layer for blog posts.
 *
 * Emits four coordinated JSON-LD blocks that answer engines and generative
 * search platforms specifically look for:
 *
 * 1. BreadcrumbList — path context for deep links
 * 2. SpeakableSpecification — tells voice assistants what to read aloud
 * 3. Author Person with sameAs — E-E-A-T signal for GEO
 * 4. Dataset (optional) — marks benchmark data as citable research
 *
 * Used by the 5 cold-email-tools blog posts to close AEO/GEO gaps beyond
 * the baseline BlogPosting + FAQPage schema.
 */

export interface AuthorIdentity {
 name: string;
 jobTitle: string;
 url?: string;
 sameAs?: string[];
}

export interface DatasetDescriptor {
 name: string;
 description: string;
 creator: string;
 temporalCoverage: string;
 measurementTechnique: string[];
 variableMeasured: string[];
}

export function BreadcrumbSchema({ slug, title }: { slug: string; title: string }) {
 const jsonLd = {
 '@context': 'https://schema.org',
 '@type': 'BreadcrumbList',
 itemListElement: [
 { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.superkabe.com' },
 { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.superkabe.com/blog' },
 { '@type': 'ListItem', position: 3, name: title, item: `https://www.superkabe.com/blog/${slug}` },
 ],
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function AuthorSchema({ author }: { author: AuthorIdentity }) {
 const jsonLd = {
 '@context': 'https://schema.org',
 '@type': 'Person',
 name: author.name,
 jobTitle: author.jobTitle,
 url: author.url || 'https://www.superkabe.com',
 worksFor: { '@type': 'Organization', name: 'Superkabe', url: 'https://www.superkabe.com' },
 sameAs: author.sameAs || [],
 knowsAbout: [
 'Cold email deliverability',
 'Sender reputation management',
 'Email infrastructure protection',
 'ESP-aware routing',
 'Bounce rate management',
 ],
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export function DatasetSchema({ dataset, url }: { dataset: DatasetDescriptor; url: string }) {
 const jsonLd = {
 '@context': 'https://schema.org',
 '@type': 'Dataset',
 name: dataset.name,
 description: dataset.description,
 creator: { '@type': 'Organization', name: dataset.creator, url: 'https://www.superkabe.com' },
 temporalCoverage: dataset.temporalCoverage,
 measurementTechnique: dataset.measurementTechnique,
 variableMeasured: dataset.variableMeasured,
 license: 'https://www.superkabe.com/terms',
 url,
 isAccessibleForFree: true,
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

/**
 * Inline "quick answer" card rendered immediately after a Q-format H2 so
 * AI crawlers scanning linearly can extract a 40–80 word answer block
 * without needing to open the FAQ accordion. Pairs with FAQPage schema
 * but adds a second extraction surface inside the article body.
 */
export function QuickAnswer({ question, answer }: { question: string; answer: string }) {
 return (
 <div className="aeo-quick-answer not-prose mb-8 p-5 bg-emerald-50/60 border-l-4 border-emerald-500 " data-aeo="quick-answer">
 <div className="text-emerald-700 font-semibold text-[11px] uppercase tracking-widest mb-2">Quick answer</div>
 <div className="text-[15px] text-gray-800 leading-relaxed">
 <strong className="text-gray-900">{question}</strong> {answer}
 </div>
 </div>
 );
}

/**
 * Build the enriched BlogPosting JSON-LD that includes speakable,
 * inLanguage, wordCount, and author linkage. Returns a plain object
 * to drop into a `<script type="application/ld+json">`.
 */
export function buildEnhancedBlogPosting(args: {
 slug: string;
 headline: string;
 description: string;
 author: AuthorIdentity;
 datePublished: string;
 dateModified: string;
 wordCount: number;
 keywords: string[];
 about?: string[];
}) {
 return {
 '@context': 'https://schema.org',
 '@type': 'BlogPosting',
 headline: args.headline,
 description: args.description,
 author: {
 '@type': 'Person',
 name: args.author.name,
 jobTitle: args.author.jobTitle,
 url: args.author.url || 'https://www.superkabe.com',
 sameAs: args.author.sameAs || [],
 },
 publisher: { '@id': 'https://www.superkabe.com/#organization' },
 mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.superkabe.com/blog/${args.slug}` },
 datePublished: args.datePublished,
 dateModified: args.dateModified,
 inLanguage: 'en-US',
 wordCount: args.wordCount,
 keywords: args.keywords.join(', '),
 about: (args.about || []).map((name) => ({ '@type': 'Thing', name })),
 speakable: {
 '@type': 'SpeakableSpecification',
 cssSelector: ['.aeo-tldr', '.aeo-takeaways', '.aeo-quick-answer'],
 },
 };
}

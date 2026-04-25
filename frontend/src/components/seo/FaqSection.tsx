import React from 'react';

export interface FaqItem {
 q: string;
 a: string;
}

/**
 * Accessible FAQ section rendered as visible content. Pair with FaqJsonLd to
 * emit FAQPage schema.org markup so answer engines surface these as rich
 * results.
 */
export default function FaqSection({ items, heading = 'Frequently Asked Questions' }: { items: FaqItem[]; heading?: string }) {
 if (!items || items.length === 0) return null;
 return (
 <section className="mt-16 not-prose">
 <h2 className="text-3xl font-bold text-gray-900 mb-6">{heading}</h2>
 <div className="space-y-4">
 {items.map((item, i) => (
 <details key={i} className="group bg-white border border-gray-200 p-6 open:shadow-md transition-shadow">
 <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
 <h3 className="text-lg font-bold text-gray-900 pr-4">{item.q}</h3>
 <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none select-none">+</span>
 </summary>
 <p className="mt-4 text-gray-700 leading-relaxed text-[16px]">{item.a}</p>
 </details>
 ))}
 </div>
 </section>
 );
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
 if (!items || items.length === 0) return null;
 const jsonLd = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: items.map((i) => ({
 '@type': 'Question',
 name: i.q,
 acceptedAnswer: { '@type': 'Answer', text: i.a },
 })),
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

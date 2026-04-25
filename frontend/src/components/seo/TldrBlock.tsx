import React from 'react';

/**
 * TL;DR callout used at the top of long-form content pages (product, blog, docs).
 * Rendered as a visible summary block so AI answer engines (Google AI Overviews,
 * Bing Copilot, Perplexity, ChatGPT) can extract the 40-60 word answer cleanly.
 */
export default function TldrBlock({ text }: { text: string }) {
 if (!text) return null;
 return (
 <div className="aeo-tldr not-prose mb-10 p-5 md:p-6 bg-amber-50/70 border border-amber-200 " data-aeo="tldr">
 <div className="flex items-center gap-2 mb-2">
 <span className="inline-flex items-center px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-widest">TL;DR</span>
 </div>
 <p className="text-base md:text-[17px] text-amber-950 leading-relaxed">{text}</p>
 </div>
 );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface ArticleItem {
    slug: string;
    title: string;
    description: string;
    readTime: string;
    tag: string;
}

const GRID_LINE = '#D1CBC5';

export default function BlogArticleGrid({ articles }: { articles: ArticleItem[] }) {
    const [visibleCount, setVisibleCount] = useState(12);
    const visibleArticles = articles.slice(0, visibleCount);
    const hasMore = visibleCount < articles.length;

    return (
        <section className="relative z-10 pb-16">
            <div className="max-w-6xl mx-auto px-6 mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">{articles.length} articles</p>
            </div>

            {/* Grid with continuous border lines popl-style */}
            <div className="max-w-6xl mx-auto" style={{ borderTop: `1px solid ${GRID_LINE}`, borderLeft: `1px solid ${GRID_LINE}` }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {visibleArticles.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className="group relative block p-8 md:p-10 hover:bg-white transition-colors duration-300"
                            style={{
                                borderRight: `1px solid ${GRID_LINE}`,
                                borderBottom: `1px solid ${GRID_LINE}`,
                            }}
                        >
                            <div className="flex items-center justify-between gap-3 mb-6">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{article.tag}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{article.readTime}</span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 leading-[1.25] tracking-tight group-hover:text-blue-600 transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">{article.description}</p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 group-hover:gap-2.5 group-hover:text-blue-600 transition-all">
                                Read article
                                <ArrowRight size={12} />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {hasMore && (
                <div className="text-center mt-12 px-6">
                    <button
                        onClick={() => setVisibleCount((prev) => prev + 12)}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        Load more ({articles.length - visibleCount} remaining)
                        <ChevronDown size={16} />
                    </button>
                </div>
            )}
        </section>
    );
}

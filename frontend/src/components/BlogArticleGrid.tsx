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

export default function BlogArticleGrid({ articles }: { articles: ArticleItem[] }) {
    const [visibleCount, setVisibleCount] = useState(10);
    const visibleArticles = articles.slice(0, visibleCount);
    const hasMore = visibleCount < articles.length;

    return (
        <section className="relative z-10 pb-10 px-6">
            <div className="max-w-5xl mx-auto">
                <p className="text-sm text-gray-400 mb-6 text-center">{articles.length} articles</p>
                <div className="grid md:grid-cols-2 gap-8">
                    {visibleArticles.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className="block bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs text-gray-400 font-medium">{article.readTime}</span>
                                <span className="ml-auto px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full">{article.tag}</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{article.title}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">{article.description}</p>
                            <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Article <ArrowRight size={14} />
                            </span>
                        </Link>
                    ))}
                </div>
                {hasMore && (
                    <div className="text-center mt-10">
                        <button
                            onClick={() => setVisibleCount((prev) => prev + 10)}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            Load More ({articles.length - visibleCount} remaining)
                            <ChevronDown size={16} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

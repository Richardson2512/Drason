import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { productPages } from '@/data/productPages';


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
        },
    };
}

export default async function DynamicProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = productPages[slug];

    if (!data) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "author": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.superkabe.com/image/logo-v2.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.superkabe.com/product/${slug}`
        }
    };

    return (
        <div className="bg-[#F5F8FF] text-[#1E1E2F] font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

            <article className="pt-32 md:pt-36 pb-40 max-w-4xl mx-auto px-6 relative z-10">
                <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-8">
                    {data.title}
                </h1>

                <div className="max-w-4xl mx-auto mb-10 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
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

                {data.relatedBlog && data.relatedBlog.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {data.relatedBlog.map((blog, i) => (
                                <Link key={i} href={`/blog/${blog.slug}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                                    <h4 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-blue-600 transition-colors">{blog.title}</h4>
                                    <p className="text-gray-500 text-xs">{blog.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-20 p-10 md:p-14 bg-white rounded-[2rem] border border-gray-100 shadow-xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to implement {data.title}?</h3>
                    <p className="text-gray-500 mb-8">Join the modern outbound teams using Superkabe to protect their revenue.</p>
                    <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all">
                        Start Free Trial
                    </Link>
                </div>
            </article>

            <Footer />
        </div>
    );
}

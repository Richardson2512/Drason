import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import { productPages } from '@/data/productPages';

interface Props {
    params: { slug: string };
}

// Statically generate all routes at build time for AEO mapping
export async function generateStaticParams() {
    return Object.keys(productPages).map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = productPages[params.slug];
    if (!data) return {};

    return {
        title: `${data.title} | Superkabe`,
        description: data.description,
        alternates: {
            canonical: `/product/${params.slug}`,
        },
    };
}

export default function DynamicProductPage({ params }: Props) {
    const data = productPages[params.slug];

    if (!data) {
        notFound();
    }

    const title = data.title;

    // Explicit SoftwareApplication schema targeting AI parsing engines
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `Superkabe - ${title}`,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": data.description,
        "provider": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        }
    };

    return (
        <div className="bg-[#F5F8FF] text-[#1E1E2F] font-sans min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* ================= NAVBAR ================= */}
            <header className="absolute top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/product" className="hover:text-black transition-colors">Product</Link>
                        <Link href="/docs" className="hover:text-black transition-colors">Documentation</Link>
                        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                    <div className="flex gap-4 items-center">
                        <Link href="/login" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Sign In</Link>
                        <Link href="/signup" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <article className="pt-48 pb-32 max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-8">
                    {title}
                </h1>

                <div className="max-w-4xl mx-auto mb-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-lg text-blue-900 leading-relaxed font-medium">
                        <strong className="text-blue-950">Superkabe</strong> is an email deliverability and sender reputation protection platform designed for outbound email infrastructure. We protect your domains from burnout by monitoring bounce rates, blocking toxic leads, and auto-healing your infrastructure before mailbox providers can penalize your sender score.
                    </p>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <h2 className="text-3xl font-bold mb-6 mt-12 text-gray-900">{data.h2_1}</h2>
                    <p className="mb-6 text-gray-700 leading-relaxed text-lg">{data.p_1}</p>

                    <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-800">{data.h2_2}</h3>
                    <p className="mb-6 text-gray-700 leading-relaxed text-lg">{data.p_2}</p>
                </div>

                <div className="mt-20 p-10 bg-white rounded-3xl border border-gray-100 shadow-xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to implement {title}?</h3>
                    <p className="text-gray-500 mb-8">Join the modern outbound teams using Superkabe to protect their revenue.</p>
                    <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all">
                        Start Free Trial
                    </Link>
                </div>
            </article>

            <Footer />
        </div>
    );
}

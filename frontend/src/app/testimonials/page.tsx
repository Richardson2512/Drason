'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import MarketingBackdrop from '@/components/MarketingBackdrop';
import { appUrl } from '@/lib/urls';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
    logo: string;
    metric?: { value: string; label: string };
    accent: 'orange' | 'blue' | 'green';
}

const TESTIMONIALS: Testimonial[] = [
    {
        quote:
            "We were burning a domain a month before Superkabe. The auto-healing pipeline picked up the dip 36 hours before our old monitoring would have flagged it — we haven't replaced a sending domain in five months.",
        author: 'Aarav Singh',
        role: 'Founder',
        company: 'Rihario',
        logo: '/image/customers/rihario-v2.png',
        metric: { value: '0', label: 'Domains burned in Q1' },
        accent: 'orange',
    },
    {
        quote:
            "Multi-mailbox routing is the feature I didn't know I needed. Superkabe quietly sends Priya's note from the mailbox with the best ESP track record for that lead. Reply rates went up 23% with zero copy changes.",
        author: 'Priya Sen',
        role: 'Head of Outbound',
        company: 'GoBengali',
        logo: '/image/customers/gobengali.png',
        metric: { value: '+23%', label: 'Reply rate uplift' },
        accent: 'blue',
    },
    {
        quote:
            "The AI sequence builder writes drafts that actually sound like me. I spend the time I used to spend writing on iterating instead. We shipped three new campaigns last week — that used to be a month of work.",
        author: 'Maya Patel',
        role: 'GTM Lead',
        company: 'PrompTrim',
        logo: '/image/customers/promptrim.png',
        metric: { value: '3x', label: 'Campaign throughput' },
        accent: 'orange',
    },
    {
        quote:
            "Hybrid validation is genuinely the most accurate I've used. Catch-all detection finally works. Our bounce rate dropped from 4.1% to 0.3% the first week we switched our enrichment pipeline through Superkabe.",
        author: 'Daniel Cho',
        role: 'Growth',
        company: 'Insightsnap',
        logo: '/image/customers/insightsnap.png',
        metric: { value: '0.3%', label: 'Bounce rate' },
        accent: 'blue',
    },
    {
        quote:
            "We send 100,000+ emails a day across seven brand domains. The fatigue detection auto-paused two mailboxes last week before they hit a complaint threshold. That alone justifies the contract.",
        author: 'Elena Marković',
        role: 'Head of Operations',
        company: 'Vanishdrop',
        logo: '/image/customers/vanishdrop.png',
        metric: { value: '100k+', label: 'Daily sends' },
        accent: 'blue',
    },
    {
        quote:
            "Our reputation score climbed 18 points in six weeks. The 5-phase healing pipeline is the only thing I've seen that recovers a domain instead of telling you to throw it away. It paid for itself in domain costs alone.",
        author: 'Theo Lambert',
        role: 'Founder',
        company: 'Syllabus Tracker',
        logo: '/image/customers/syllabus-tracker.png',
        metric: { value: '+18', label: 'Reputation pts' },
        accent: 'green',
    },
    {
        quote:
            "I've used five cold email tools in two years. Superkabe is the first one that treats deliverability as a product surface, not a checkbox. Slack alerts hit before our oncall does — we route around problems, not into them.",
        author: 'Noor Hassan',
        role: 'Head of Sales',
        company: 'Pricewise',
        logo: '/image/customers/pricewise.png',
        metric: { value: '99.4%', label: 'Inbox placement' },
        accent: 'orange',
    },
    {
        quote:
            "The unified inbox is what keeps my team on Superkabe. Replies from twelve sender addresses land in one queue with the right context attached. Our SDRs stopped missing warm replies in the noise.",
        author: 'Jordan Reyes',
        role: 'RevOps Manager',
        company: 'PrompTrim',
        logo: '/image/customers/promptrim.png',
        accent: 'orange',
    },
    {
        quote:
            "Switched off SmartLead and Instantly to consolidate on Superkabe. The infra-score dashboard is what sold our CTO — we finally have a single number to point at when leadership asks 'is outbound healthy this quarter?'",
        author: 'Linnea Berg',
        role: 'VP Growth',
        company: 'Insightsnap',
        logo: '/image/customers/insightsnap.png',
        metric: { value: '1', label: 'Tool, not three' },
        accent: 'blue',
    },
];

const ACCENT_BAR: Record<Testimonial['accent'], string> = {
    orange: 'bg-[#E68B1F]',
    blue: 'bg-[#2563EB]',
    green: 'bg-[#1B9D4A]',
};

const ACCENT_METRIC: Record<Testimonial['accent'], string> = {
    orange: 'text-[#B36710] bg-[#FFF3E0] border-[#FFE0B0]',
    blue: 'text-[#1846AE] bg-[#E6F0FE] border-[#C9DCFB]',
    green: 'text-[#0F6A30] bg-[#E6F6EA] border-[#BFE6CB]',
};

function QuoteMark({ accent }: { accent: Testimonial['accent'] }) {
    const colors: Record<Testimonial['accent'], string> = {
        orange: '#E68B1F',
        blue: '#2563EB',
        green: '#1B9D4A',
    };
    return (
        <svg
            width="32"
            height="24"
            viewBox="0 0 32 24"
            fill="none"
            aria-hidden
            style={{ color: colors[accent] }}
        >
            <path
                d="M0 24V14C0 10.1 0.9 6.8 2.6 4.1C4.4 1.4 7.2 0 11 0V5C8.6 5 6.9 5.7 5.8 7.1C4.7 8.5 4.2 10.1 4.2 12H10V24H0ZM18 24V14C18 10.1 18.9 6.8 20.6 4.1C22.4 1.4 25.2 0 29 0V5C26.6 5 24.9 5.7 23.8 7.1C22.7 8.5 22.2 10.1 22.2 12H28V24H18Z"
                fill="currentColor"
                fillOpacity="0.18"
            />
        </svg>
    );
}

function Card({ t }: { t: Testimonial }) {
    return (
        <article className="relative bg-white border border-gray-200 rounded-2xl p-7 md:p-8 flex flex-col gap-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <span
                className={`absolute top-0 left-7 right-7 h-0.5 rounded-full ${ACCENT_BAR[t.accent]}`}
                aria-hidden
            />

            <div className="flex items-start justify-between gap-4">
                <QuoteMark accent={t.accent} />
                {t.metric && (
                    <div
                        className={`shrink-0 inline-flex flex-col items-end px-3 py-1.5 border rounded-lg text-right ${ACCENT_METRIC[t.accent]}`}
                    >
                        <span className="text-base font-bold leading-none tracking-tight">{t.metric.value}</span>
                        <span className="text-[9px] uppercase tracking-[0.12em] font-semibold mt-1 opacity-80">
                            {t.metric.label}
                        </span>
                    </div>
                )}
            </div>

            <blockquote className="text-[15px] md:text-base leading-relaxed text-gray-800 flex-1">
                &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                        src={t.logo}
                        alt={`${t.company} logo`}
                        width={28}
                        height={28}
                        className="max-w-[80%] max-h-[80%] w-auto h-auto object-contain"
                    />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{t.author}</div>
                    <div className="text-xs text-gray-500 truncate">
                        {t.role} · {t.company}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function TestimonialsPage() {
    const reviewSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Superkabe',
        description:
            'AI-powered cold email platform with native deliverability protection, multi-mailbox sending, and 5-phase domain healing.',
        brand: { '@type': 'Brand', name: 'Superkabe' },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: TESTIMONIALS.length.toString(),
            bestRating: '5',
            worstRating: '1',
        },
        review: TESTIMONIALS.map((t) => ({
            '@type': 'Review',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5',
            },
            author: { '@type': 'Person', name: t.author },
            reviewBody: t.quote,
        })),
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
            />

            <Navbar />
            <MarketingBackdrop />

            {/* Hero */}
            <section className="relative pt-32 md:pt-36 pb-10 md:pb-14 text-center px-4 md:px-6">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-5">
                        <span className="block w-7 h-px bg-[#D1CBC5]" aria-hidden />
                        Testimonials · 2026
                        <span className="block w-7 h-px bg-[#D1CBC5]" aria-hidden />
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-5 tracking-tight leading-[1.05]">
                        Operators choose{' '}
                        <em
                            className="not-italic font-normal italic"
                            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', color: '#E68B1F' }}
                        >
                            Superkabe
                        </em>
                        .
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Founders, growth leads, and RevOps teams use Superkabe to ship cold email at scale —
                        and keep their senders healthy while they do it. Here&apos;s what they say.
                    </p>
                </div>
            </section>

            {/* Card grid */}
            <section className="relative z-10 px-4 md:px-6 pb-16 md:pb-24">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t) => (
                        <Card key={`${t.author}-${t.company}`} t={t} />
                    ))}
                </div>
            </section>

            {/* CTA strip */}
            <section className="relative z-10 px-4 md:px-6 pb-16 md:pb-20">
                <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center shadow-sm">
                    <h2 className="h2-rule mb-3">
                        Want to be the next story on this page?
                    </h2>
                    <p className="text-gray-600 max-w-xl mx-auto mb-7">
                        Start a free trial, plug in your mailboxes, and ship your first AI-drafted sequence in
                        under ten minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                        <a
                            href={appUrl('/signup')}
                            className="px-8 py-3.5 bg-black text-white rounded-full text-sm font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Start your trial
                        </a>
                        <Link
                            href="/contact"
                            className="px-8 py-3.5 bg-white text-gray-900 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Talk to the team
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

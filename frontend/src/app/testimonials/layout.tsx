import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Customer Testimonials | Superkabe',
    description: 'See how outbound teams use Superkabe to send AI-personalized cold email at scale, protect deliverability, and heal burned domains automatically.',
    alternates: { canonical: '/testimonials' },
    openGraph: {
        title: 'Customer Testimonials | Superkabe',
        description: 'Stories from operators shipping cold email on Superkabe.',
        url: '/testimonials',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function TestimonialsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing | Superkabe',
    description: 'Simple, transparent pricing for Superkabe infrastructure protection. Protect your outbound domains today.',
    alternates: { canonical: '/pricing' },
    openGraph: {
        title: 'Pricing | Superkabe',
        description: 'Simple, transparent pricing for Superkabe infrastructure protection.',
        url: '/pricing',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

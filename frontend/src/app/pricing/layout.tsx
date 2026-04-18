import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Superkabe Pricing — Plans from $49/mo | Free Trial',
    description: 'Transparent pricing for email infrastructure protection. Starter $49/mo, Growth $199/mo, Scale $349/mo. Includes validation credits and ESP-aware routing.',
    alternates: { canonical: '/pricing' },
    openGraph: {
        title: 'Superkabe Pricing — Plans from $49/mo | Free Trial',
        description: 'Transparent pricing for email infrastructure protection. Starter $49/mo, Growth $199/mo, Scale $349/mo.',
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

import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Superkabe Pricing — Plans from $19/mo | Free Trial',
 description: 'Transparent pricing for cold email platform. Starter $19/mo, Pro $49/mo, Growth $199/mo, Scale $349/mo. Includes sending, validation, and protection.',
 alternates: { canonical: '/pricing' },
 openGraph: {
 title: 'Superkabe Pricing — Plans from $19/mo | Free Trial',
 description: 'Transparent pricing for cold email platform. Starter $19/mo, Pro $49/mo, Growth $199/mo, Scale $349/mo.',
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

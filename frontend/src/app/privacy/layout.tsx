import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Superkabe',
    description: 'Superkabe privacy policy and data protection guidelines. How we handle and protect your data.',
    alternates: { canonical: '/privacy' },
    openGraph: {
        title: 'Privacy Policy | Superkabe',
        description: 'Superkabe privacy policy and data protection guidelines.',
        url: '/privacy',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

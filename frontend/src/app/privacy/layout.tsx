import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Superkabe',
    description: 'Our privacy policy and data protection guidelines.',
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions | Superkabe',
    description: 'Terms of service and user agreements for Superkabe infrastructure protection.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

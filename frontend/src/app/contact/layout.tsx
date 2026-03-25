import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | Superkabe',
    description: 'Get in touch with the Superkabe team. Whether you need technical support, have a sales question, or want to explore a partnership, we respond within 24 hours.',
    alternates: { canonical: '/contact' },
    openGraph: {
        title: 'Contact Us | Superkabe',
        description: 'Get in touch with the Superkabe team. We respond within 24 hours.',
        url: '/contact',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

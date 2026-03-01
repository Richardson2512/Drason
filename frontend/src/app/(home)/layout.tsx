import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Superkabe – Email Deliverability & Infrastructure Protection for Outbound Teams',
    description: 'Superkabe is an email deliverability and sender reputation protection platform — infrastructure armor between your enrichment data and sending accounts.',
    alternates: { canonical: '/' },
    openGraph: {
        title: 'Superkabe – Infrastructure Protection for Outbound Email',
        description: 'Superkabe is an email deliverability and sender reputation protection platform — infrastructure armor between your enrichment data and sending accounts.',
        url: '/',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

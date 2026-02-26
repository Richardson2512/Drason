import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Superkabe – Email Deliverability & Infrastructure Protection for Outbound Teams',
    description: 'Superkabe monitors bounce rates, DNS authentication, mailbox fatigue, and lead health in real time to prevent domain burnout and protect sender reputation.',
    alternates: { canonical: '/' },
    openGraph: {
        title: 'Superkabe – Infrastructure Protection for Outbound Email',
        description: 'Monitor bounce rates, DNS authentication, and mailbox health in real time. Prevent domain burnout and protect sender reputation.',
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

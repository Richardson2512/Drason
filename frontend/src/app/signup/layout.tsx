import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get Started | Superkabe',
    description: 'Create your Superkabe account and protect your email infrastructure from domain burnout.',
    alternates: {
        canonical: '/signup',
    },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

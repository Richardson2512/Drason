import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get Started | Superkabe',
    description: 'Create your Superkabe account - the AI-powered cold email platform with built-in deliverability and LinkedIn signal-based automated outreach.',
    alternates: { canonical: '/signup' },
    robots: { index: false, follow: false },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

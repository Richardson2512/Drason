import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In | Superkabe',
    description: 'Sign in to Superkabe - the AI-powered cold email platform with built-in deliverability and LinkedIn signal-based automated outreach.',
    alternates: { canonical: '/login' },
    robots: { index: false, follow: false },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

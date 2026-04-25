import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In | Superkabe',
    description: 'Sign in to Superkabe — the AI cold email platform with native deliverability protection.',
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

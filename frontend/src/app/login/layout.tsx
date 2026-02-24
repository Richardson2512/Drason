import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In | Superkabe',
    description: 'Sign in to access your Superkabe dashboard and monitor your outbound infrastructure.',
    alternates: {
        canonical: '/login',
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

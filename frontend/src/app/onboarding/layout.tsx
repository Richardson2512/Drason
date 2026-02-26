import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Onboarding | Superkabe',
    description: 'Set up your Superkabe account and connect your email infrastructure.',
    robots: { index: false, follow: false },
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

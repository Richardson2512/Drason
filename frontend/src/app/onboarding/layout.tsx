import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Onboarding | Superkabe',
    description: 'Set up your Superkabe account — connect mailboxes and launch AI cold email sequences with deliverability protection built in.',
    robots: { index: false, follow: false },
};

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

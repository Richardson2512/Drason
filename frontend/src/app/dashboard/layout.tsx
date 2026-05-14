import type { Metadata } from 'next';
import { Suspense } from 'react';
import DashboardShell from './DashboardShell';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { AgencyModeProvider } from '@/hooks/useAgencyMode';

export const metadata: Metadata = {
    title: 'Dashboard | Superkabe',
    robots: { index: false, follow: false },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardProvider>
            <AgencyModeProvider>
                <DashboardShell>
                    {/* Suspense boundary is required for any child page that
                        reads useSearchParams() — Next.js App Router will
                        bail out of static prerendering otherwise. Putting
                        it at the layout level covers every dashboard page
                        in one place so individual pages don't need to
                        wrap themselves. The fallback is null because
                        DashboardShell already owns the loading chrome. */}
                    <Suspense fallback={null}>{children}</Suspense>
                </DashboardShell>
            </AgencyModeProvider>
        </DashboardProvider>
    );
}

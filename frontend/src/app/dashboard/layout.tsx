import type { Metadata } from 'next';
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
                <DashboardShell>{children}</DashboardShell>
            </AgencyModeProvider>
        </DashboardProvider>
    );
}

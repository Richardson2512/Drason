import type { Metadata } from 'next';
import DashboardShell from './DashboardShell';
import { DashboardProvider } from '@/contexts/DashboardContext';

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
            <DashboardShell>{children}</DashboardShell>
        </DashboardProvider>
    );
}

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
        // dashboard-type-scope pins the logged-in app to its own neutral
        // system-sans stack so the Velvet Ledger marketing typography
        // (Outfit display + Cormorant italic accents + mono labels) does
        // NOT bleed into the data UI. See globals.css for the reset rule.
        // A plain wrapper around the providers is layout-safe: providers
        // render no DOM, and DashboardShell's fixed/absolute chrome is
        // unaffected by a static parent.
        <div className="dashboard-type-scope">
            <DashboardProvider>
                <AgencyModeProvider>
                    <DashboardShell>{children}</DashboardShell>
                </AgencyModeProvider>
            </DashboardProvider>
        </div>
    );
}

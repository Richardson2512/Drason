import type { Metadata } from 'next';
import ConsentReacceptanceModal from '@/components/ConsentReacceptanceModal';

export const metadata: Metadata = {
    title: 'Admin Console | Superkabe',
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            {/* Super admins are force-redirected here by middleware (step 4)
                and never reach the dashboard, where this modal normally
                lives (DashboardShell). Without it, a super admin whose ToS /
                Privacy consent is stale gets a 412 on every admin API call
                with no way to accept the new version - permanently bricked.
                Same self-contained component the dashboard uses: it listens
                for the global `consent-required` event apiClient dispatches
                on 412, blocks, records acceptance, then reloads. */}
            <ConsentReacceptanceModal />
        </>
    );
}

import { redirect } from 'next/navigation';

// Reports was folded into the Analytics tabbed page on 2026-04-25.
export default function ReportsRedirect() {
    redirect('/dashboard/analytics?tab=reports');
}

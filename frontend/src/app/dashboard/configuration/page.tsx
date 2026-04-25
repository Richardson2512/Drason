import { redirect } from 'next/navigation';

// Routing config was folded into the Configuration (formerly Settings)
// tabbed page on 2026-04-25.
export default function ConfigurationRedirect() {
    redirect('/dashboard/settings?tab=routing');
}

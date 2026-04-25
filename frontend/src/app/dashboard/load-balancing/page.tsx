import { redirect } from 'next/navigation';

// Load Balancing was folded into the Insights tabbed page on 2026-04-25.
// Deep links continue to land on the matching tab.
export default function LoadBalancingRedirect() {
    redirect('/dashboard/insights?tab=load-balancing');
}

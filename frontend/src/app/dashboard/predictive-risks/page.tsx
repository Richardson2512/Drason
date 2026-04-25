import { redirect } from 'next/navigation';

// Predictive Risks was folded into the Insights tabbed page on 2026-04-25.
export default function PredictiveRisksRedirect() {
    redirect('/dashboard/insights?tab=predictive-risks');
}

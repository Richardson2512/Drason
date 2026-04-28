'use client';

/**
 * Insights — protection-side advisory page that combines what used to be
 *   /dashboard/load-balancing  and  /dashboard/predictive-risks
 * into a single tabbed view. Both panels are forward-looking (recommendations
 * + risk forecasts), so they share a sidebar slot.
 *
 * Old routes redirect here:
 *   /dashboard/load-balancing      → /dashboard/insights?tab=load-balancing
 *   /dashboard/predictive-risks    → /dashboard/insights?tab=predictive-risks
 */

import Tabs, { useTabState, type TabItem } from '@/components/ui/Tabs';
import { Scale, Sparkles } from 'lucide-react';
import LoadBalancingPanel from './LoadBalancingPanel';
import PredictiveRisksPanel from './PredictiveRisksPanel';

const TABS: TabItem[] = [
    { key: 'load-balancing',  label: 'Load Balancing',  icon: <Scale size={12} strokeWidth={1.75} /> },
    { key: 'predictive-risks', label: 'Predictive Risks', icon: <Sparkles size={12} strokeWidth={1.75} /> },
];

export default function InsightsPage() {
    const [active, setActive] = useTabState(TABS, 'load-balancing');

    return (
        <div className="px-6 py-6">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Insights</h1>
                <p className="text-xs text-gray-500 mt-0.5">Forward-looking guidance — load distribution and campaign-stall risk forecasts.</p>
            </div>

            <Tabs tabs={TABS} defaultTab="load-balancing" activeTab={active} onChange={setActive} />

            {active === 'load-balancing' && <LoadBalancingPanel />}
            {active === 'predictive-risks' && <PredictiveRisksPanel />}
        </div>
    );
}

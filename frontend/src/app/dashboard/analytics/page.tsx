'use client';

/**
 * Analytics — tabbed shell. The original analytics body lives in
 * AnalyticsLivePanel; the former /dashboard/reports page is now the
 * Reports tab via ReportsPanel. The /dashboard/reports route redirects
 * here with ?tab=reports.
 */

import { Suspense } from 'react';
import Tabs, { useTabState, type TabItem } from '@/components/ui/Tabs';
import { LineChart, FileText } from 'lucide-react';
import AnalyticsLivePanel from './AnalyticsLivePanel';
import ReportsPanel from './ReportsPanel';

const TABS: TabItem[] = [
    { key: 'live',    label: 'Live',    icon: <LineChart size={12} strokeWidth={1.75} /> },
    { key: 'reports', label: 'Reports', icon: <FileText size={12} strokeWidth={1.75} /> },
];

export default function AnalyticsPage() {
    return (
        <Suspense fallback={null}>
            <AnalyticsPageInner />
        </Suspense>
    );
}

function AnalyticsPageInner() {
    const [active] = useTabState(TABS, 'live');

    return (
        <div className="px-6 py-6">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Analytics</h1>
                <p className="text-xs text-gray-500 mt-0.5">Live performance metrics and exportable reports.</p>
            </div>

            <Tabs tabs={TABS} defaultTab="live" />

            {active === 'live' && <AnalyticsLivePanel />}
            {active === 'reports' && <ReportsPanel />}
        </div>
    );
}

'use client';

/**
 * Settings — tabbed shell. Holds the original general-settings panel plus
 * the former /dashboard/configuration (Routing rules) as a Routing tab.
 *
 * The /dashboard/configuration route redirects here with ?tab=routing.
 *
 * The sidebar entry has been renamed from "Settings" to "Configuration"
 * but the route stays at /dashboard/settings to avoid breaking deep links.
 */

import { Suspense } from 'react';
import Tabs, { useTabState, type TabItem } from '@/components/ui/Tabs';
import { Wrench, GitBranch } from 'lucide-react';
import GeneralSettingsPanel from './GeneralSettingsPanel';
import RoutingPanel from './RoutingPanel';

const TABS: TabItem[] = [
    { key: 'general', label: 'General', icon: <Wrench size={12} strokeWidth={1.75} /> },
    { key: 'routing', label: 'Routing', icon: <GitBranch size={12} strokeWidth={1.75} /> },
];

export default function ConfigurationPage() {
    return (
        <Suspense fallback={null}>
            <ConfigurationPageInner />
        </Suspense>
    );
}

function ConfigurationPageInner() {
    const [active] = useTabState(TABS, 'general');

    return (
        <div className="px-6 py-6">
            <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Configuration</h1>
                <p className="text-xs text-gray-500 mt-0.5">Account-level settings and routing rules.</p>
            </div>

            <Tabs tabs={TABS} defaultTab="general" />

            {active === 'general' && <GeneralSettingsPanel />}
            {active === 'routing' && <RoutingPanel />}
        </div>
    );
}

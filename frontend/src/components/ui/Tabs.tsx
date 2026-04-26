'use client';

/**
 * Tabs — reusable horizontal tab strip used by parent pages that fold in
 * what used to be sibling sidebar entries (Insights, Configuration, etc.).
 *
 * Tab state is mirrored to the URL via ?tab=<key> so deep links still work
 * and browser back/forward stays sane.
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export interface TabItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    /** Default tab key to use when ?tab is absent. Defaults to first tab. */
    defaultTab?: string;
    /** Override the active tab from outside (uncontrolled if omitted). */
    activeTab?: string;
    onChange?: (key: string) => void;
}

export function useTabState(tabs: TabItem[], defaultKey?: string): [string, (k: string) => void] {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const fallback = defaultKey || tabs[0]?.key || '';
    const fromUrl = searchParams.get('tab');
    const active = tabs.some(t => t.key === fromUrl) ? (fromUrl as string) : fallback;

    const setActive = useCallback((key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (key === fallback) params.delete('tab');
        else params.set('tab', key);
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [router, pathname, searchParams, fallback]);

    return [active, setActive];
}

export default function Tabs({ tabs, activeTab, defaultTab, onChange }: TabsProps) {
    const [internalActive, setInternalActive] = useTabState(tabs, defaultTab);
    const active = activeTab !== undefined ? activeTab : internalActive;

    const handle = (key: string) => {
        if (onChange) onChange(key);
        if (activeTab === undefined) setInternalActive(key);
    };

    return (
        <div className="flex items-center gap-1 border-b border-[#E8E3DC] mb-6">
            {tabs.map(t => {
                const isActive = active === t.key;
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => handle(t.key)}
                        className={`
                            relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors
                            ${isActive
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-800'}
                        `}
                    >
                        {t.icon && <span className="text-gray-400">{t.icon}</span>}
                        {t.label}
                        {isActive && (
                            <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-gray-900" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

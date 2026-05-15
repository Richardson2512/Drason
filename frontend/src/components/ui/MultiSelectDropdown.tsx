'use client';
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    /** Optional leading icon shown before the label in the menu rows AND
     *  in the trigger when only this option is selected. Useful for
     *  per-option color indicators (e.g., colored tag-icon swatches in
     *  the All tags filter). */
    icon?: React.ReactNode;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    /**
     * When set, an in-menu search input appears above the option list. Leave
     * undefined to keep the search bar entirely off (matches prior behaviour).
     * Defaults to `auto` - search shows up automatically when there are 8+
     * options, since that's the threshold where a list becomes hard to scan.
     */
    searchable?: boolean | 'auto';
    /** Placeholder text inside the search input. */
    searchPlaceholder?: string;
}

export default function MultiSelectDropdown({
    options,
    selected,
    onChange,
    placeholder = 'All',
    className = '',
    searchable = 'auto',
    searchPlaceholder = 'Search…',
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    // Menu is portalled to document.body so a parent with overflow:hidden,
    // transform, or its own stacking context never clips it. Position is
    // computed from the trigger's bounding rect on open + on scroll/resize.
    // `placement` flips above the trigger when there isn't enough room below;
    // `maxHeight` is clamped to the actual available viewport space so the
    // menu's internal scroll handles the rest of the list.
    const [menuRect, setMenuRect] = useState<
        { top?: number; bottom?: number; left: number; width: number; maxHeight: number; placement: 'below' | 'above' }
        | null
    >(null);

    // Outside-click detection - must check both the anchor wrapper AND the
    // portalled menu since the menu lives outside the wrapper's DOM subtree.
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (ref.current && ref.current.contains(target)) return;
            if (menuRef.current && menuRef.current.contains(target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Compute portal coordinates whenever the menu opens, or when the page
    // scrolls/resizes while it's open. useLayoutEffect avoids a one-frame
    // flash where the menu would otherwise render at (0,0) before reposition.
    useLayoutEffect(() => {
        if (!isOpen) { setMenuRect(null); return; }
        const update = () => {
            const t = triggerRef.current;
            if (!t) return;
            const r = t.getBoundingClientRect();
            const GAP = 4;           // breathing room between trigger + menu
            const VIEWPORT_PAD = 8;  // never glue the menu to the viewport edge
            const DESIRED_MAX = 320; // matches the prior maxHeight (20rem)
            const viewportH = window.innerHeight;
            const spaceBelow = viewportH - r.bottom - GAP - VIEWPORT_PAD;
            const spaceAbove = r.top - GAP - VIEWPORT_PAD;
            // Prefer below unless above has materially more room AND below is
            // too cramped for a useful menu (under ~140px would show maybe two
            // options + the search bar, which is jarring).
            const flipUp = spaceBelow < 140 && spaceAbove > spaceBelow;
            if (flipUp) {
                setMenuRect({
                    bottom: viewportH - r.top + GAP,
                    left: r.left,
                    width: r.width,
                    maxHeight: Math.min(DESIRED_MAX, spaceAbove),
                    placement: 'above',
                });
            } else {
                setMenuRect({
                    top: r.bottom + GAP,
                    left: r.left,
                    width: r.width,
                    maxHeight: Math.max(140, Math.min(DESIRED_MAX, spaceBelow)),
                    placement: 'below',
                });
            }
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [isOpen]);

    // Reset the query each time the dropdown closes so the next open is clean,
    // and auto-focus the search input on open so users can type immediately.
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            return;
        }
        // Tiny delay so focus lands after the menu has mounted.
        const t = setTimeout(() => searchRef.current?.focus(), 0);
        return () => clearTimeout(t);
    }, [isOpen]);

    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const selectAll = () => onChange([]);
    const isAllSelected = selected.length === 0;

    const displayLabel = isAllSelected
        ? placeholder
        : selected.length === 1
            ? options.find(o => o.value === selected[0])?.label || selected[0]
            : `${selected.length} selected`;

    // Show the search bar based on the prop. `auto` = on iff list is 8+ long,
    // which keeps small dropdowns clean without needing the caller to pick.
    const showSearch =
        searchable === true || (searchable === 'auto' && options.length >= 8);

    const filteredOptions = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.trim().toLowerCase();
        return options.filter(o =>
            o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
        );
    }, [options, query]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Trigger - matches CustomSelect's button visually so the multi-
                select reads as the same control type, just with multi-checkbox
                semantics inside. */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 rounded-lg text-xs text-left bg-white flex items-center justify-between gap-2 cursor-pointer transition-colors hover:bg-[#FAFAF8] border border-[#D1CBC5]"
            >
                <span className="flex items-center gap-1.5 min-w-0">
                    {/* When exactly one option is selected, show its icon (if any)
                        next to the label so the trigger reflects the chosen
                        item's visual identity (e.g., a colored tag swatch). */}
                    {selected.length === 1 && options.find(o => o.value === selected[0])?.icon && (
                        <span className="shrink-0 flex items-center">
                            {options.find(o => o.value === selected[0])?.icon}
                        </span>
                    )}
                    <span className={`truncate ${isAllSelected ? 'text-gray-400' : 'text-gray-900'}`}>
                        {displayLabel}
                    </span>
                </span>
                <ChevronDown
                    size={12}
                    className="text-gray-400 shrink-0"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
                />
            </button>

            {isOpen && menuRect && typeof document !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    className="bg-white overflow-hidden flex flex-col"
                    style={{
                        position: 'fixed',
                        // Anchor either top (open-below) or bottom (open-above)
                        // depending on which side has room.
                        ...(menuRect.placement === 'above'
                            ? { bottom: menuRect.bottom }
                            : { top: menuRect.top }),
                        left: menuRect.left,
                        width: menuRect.width,
                        zIndex: 9999,
                        border: '1px solid #D1CBC5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        // Clamped to the actual viewport space available;
                        // anything past this scrolls inside the options list.
                        maxHeight: menuRect.maxHeight,
                    }}
                >
                    {showSearch && (
                        <div className="p-1.5" style={{ borderBottom: '1px solid #E8E3DC' }}>
                            <div className="relative">
                                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-6 pr-6 py-1.5 text-xs outline-none bg-transparent"
                                    onClick={e => e.stopPropagation()}
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            searchRef.current?.focus();
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-[11px]"
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* All option - always visible (even during search) since
                        it's how users reset the filter. */}
                    <button
                        type="button"
                        onClick={selectAll}
                        className="w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-[#F5F1EA] flex items-center gap-2.5"
                        style={{
                            borderBottom: '1px solid #F0EBE3',
                            background: isAllSelected ? '#F5F1EA' : 'transparent',
                            fontWeight: isAllSelected ? 600 : 400,
                            color: isAllSelected ? '#111827' : '#4B5563',
                        }}
                    >
                        <span
                            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0"
                            style={{
                                border: `1.5px solid ${isAllSelected ? '#111827' : '#D1CBC5'}`,
                                background: isAllSelected ? '#111827' : 'transparent',
                            }}
                        >
                            {isAllSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </span>
                        <span className="truncate">{placeholder}</span>
                    </button>

                    <div className="overflow-y-auto flex-1 scrollbar-hide">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-xs text-gray-400 text-center">
                                {query ? 'No matches' : 'No options'}
                            </div>
                        ) : (
                            filteredOptions.map(opt => {
                                const isSel = selected.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => toggle(opt.value)}
                                        className="w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-[#F5F1EA] flex items-center gap-2.5"
                                        style={{
                                            borderBottom: '1px solid #F0EBE3',
                                            background: isSel ? '#F5F1EA' : 'transparent',
                                            fontWeight: isSel ? 600 : 400,
                                            color: isSel ? '#111827' : '#4B5563',
                                        }}
                                    >
                                        <span
                                            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0"
                                            style={{
                                                border: `1.5px solid ${isSel ? '#111827' : '#D1CBC5'}`,
                                                background: isSel ? '#111827' : 'transparent',
                                            }}
                                        >
                                            {isSel && (
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        {opt.icon && (
                                            <span className="shrink-0 flex items-center">{opt.icon}</span>
                                        )}
                                        <span className="truncate">{opt.label}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}

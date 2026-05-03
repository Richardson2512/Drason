'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    searchable?: boolean;
    className?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...', searchable = false, className = '' }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Anchor coords for the portal-rendered dropdown. Recomputed on open
    // and on scroll/resize so the dropdown stays glued to its trigger even
    // when an ancestor scrolls. Portal rendering is the only way to escape
    // overflow:hidden / stacking-context clipping from chart libraries
    // (Recharts' ResponsiveContainer is a known clipper).
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

    const selectedOption = options.find(o => o.value === value);

    const filteredOptions = search
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    const updateCoords = () => {
        if (!wrapperRef.current) return;
        const r = wrapperRef.current.getBoundingClientRect();
        setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
    };

    useLayoutEffect(() => {
        if (!isOpen) return;
        updateCoords();
        window.addEventListener('resize', updateCoords);
        window.addEventListener('scroll', updateCoords, true); // capture, so ancestor scrolls fire too
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

    // Close on outside click — checks BOTH the trigger wrapper and the
    // portal-rendered dropdown so clicking inside the open menu doesn't
    // count as "outside" and dismiss it before the option-click fires.
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (wrapperRef.current?.contains(t)) return;
            if (dropdownRef.current?.contains(t)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                className="w-full px-3 py-2 rounded-lg text-xs text-left bg-white flex items-center justify-between gap-2 cursor-pointer transition-colors hover:bg-[#FAFAF8] border border-[#D1CBC5]"
            >
                <span className={selectedOption ? 'text-gray-900 truncate' : 'text-gray-400'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown size={12} className="text-gray-400 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }} />
            </button>

            {/* Dropdown — rendered via portal so no ancestor's overflow or
                stacking context can clip it. Positioned with fixed coords
                computed from the trigger's bounding rect. */}
            {isOpen && coords && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    className="bg-white overflow-hidden"
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        zIndex: 10000,
                        border: '1px solid #D1CBC5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Search */}
                    {searchable && (
                        <div className="p-1.5" style={{ borderBottom: '1px solid #E8E3DC' }}>
                            <div className="relative">
                                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    autoFocus
                                    className="w-full pl-6 pr-2 py-1.5 text-xs outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="overflow-y-auto max-h-[240px] scrollbar-hide">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-xs text-gray-400 text-center">No matches</div>
                        ) : (
                            filteredOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => { onChange(option.value); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-[#F5F1EA] flex items-center justify-between"
                                    style={{
                                        borderBottom: '1px solid #F0EBE3',
                                        background: option.value === value ? '#F5F1EA' : 'transparent',
                                        fontWeight: option.value === value ? 600 : 400,
                                        color: option.value === value ? '#111827' : '#4B5563',
                                    }}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <span className="text-[10px] text-gray-400 shrink-0 ml-2">✓</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}

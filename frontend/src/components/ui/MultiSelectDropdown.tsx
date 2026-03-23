'use client';
import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export default function MultiSelectDropdown({
    options,
    selected,
    onChange,
    placeholder = 'All',
    className = '',
}: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none cursor-pointer bg-white flex items-center justify-between gap-2 text-left"
            >
                <span className={`truncate ${isAllSelected ? 'text-gray-500' : 'text-gray-900'}`}>
                    {displayLabel}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {/* All option */}
                    <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={selectAll}
                            className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 font-medium">{placeholder}</span>
                    </label>

                    {options.map(opt => (
                        <label
                            key={opt.value}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.value)}
                                onChange={() => toggle(opt.value)}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

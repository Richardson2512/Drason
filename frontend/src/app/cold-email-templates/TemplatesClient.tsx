'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Tag, FileText, Building2, User, Layers, ChevronDown, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import {
    type ColdEmailTemplate,
    type TemplateGoal,
    type TemplateIndustry,
    type TemplateRole,
    type TemplateFramework,
    GOAL_META,
    INDUSTRY_META,
    ROLE_META,
    FRAMEWORK_META,
    wordCount,
} from '@/data/coldEmailTemplates';

interface TemplatesClientProps {
    templates: ColdEmailTemplate[];
    goalValues: TemplateGoal[];
    industryValues: TemplateIndustry[];
    roleValues: TemplateRole[];
    frameworkValues: TemplateFramework[];
    goalMeta: typeof GOAL_META;
    industryMeta: typeof INDUSTRY_META;
    roleMeta: typeof ROLE_META;
    frameworkMeta: typeof FRAMEWORK_META;
}

export default function TemplatesClient({
    templates,
    goalValues,
    industryValues,
    roleValues,
    frameworkValues,
    goalMeta,
    industryMeta,
    roleMeta,
    frameworkMeta,
}: TemplatesClientProps) {
    const [query, setQuery] = useState('');
    const [selectedGoal, setSelectedGoal] = useState<TemplateGoal | null>(null);
    const [selectedIndustry, setSelectedIndustry] = useState<TemplateIndustry | null>(null);
    const [selectedRole, setSelectedRole] = useState<TemplateRole | null>(null);
    const [selectedFramework, setSelectedFramework] = useState<TemplateFramework | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return templates.filter((t) => {
            if (selectedGoal && t.goal !== selectedGoal) return false;
            if (selectedIndustry && t.industry !== selectedIndustry) return false;
            if (selectedRole && t.role !== selectedRole) return false;
            if (selectedFramework && t.framework !== selectedFramework) return false;
            if (q) {
                const hay = `${t.title} ${t.subject} ${t.body} ${t.bestFor} ${t.goal} ${t.industry} ${t.role} ${t.framework} ${t.tone}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [templates, query, selectedGoal, selectedIndustry, selectedRole, selectedFramework]);

    const activeFilterCount =
        (selectedGoal ? 1 : 0) +
        (selectedIndustry ? 1 : 0) +
        (selectedRole ? 1 : 0) +
        (selectedFramework ? 1 : 0);
    const hasAnyFilter = activeFilterCount > 0 || query.trim().length > 0;

    function clearAll() {
        setQuery('');
        setSelectedGoal(null);
        setSelectedIndustry(null);
        setSelectedRole(null);
        setSelectedFramework(null);
    }

    return (
        <div>
            {/* ─── Search bar — prominent, centered ─────────────────── */}
            <div className="mb-5 flex justify-center">
                <div className="relative w-full max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5E4F]" size={18} />
                    <input
                        type="text"
                        placeholder="Search templates by goal, industry, or what you want to write..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-white border border-[#D1CBC5] focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/15 focus:border-[#1E1E2F] text-base shadow-sm transition"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#6B5E4F] hover:text-[#1E1E2F] hover:bg-[#F7F2EB]"
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Filter bar — compact dropdowns ──────────────────── */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#6B5E4F] font-semibold mr-1">
                    <Filter size={12} strokeWidth={2} />
                    Filter
                </span>

                <FilterDropdown
                    label="Goal"
                    icon={<FileText size={12} strokeWidth={2} />}
                    selectedValue={selectedGoal}
                    selectedLabel={selectedGoal ? goalMeta[selectedGoal].label : null}
                    options={goalValues.map((v) => ({ value: v, label: goalMeta[v].label, description: goalMeta[v].description }))}
                    onSelect={(v) => setSelectedGoal(v as TemplateGoal | null)}
                    counts={countByKey(templates, 'goal') as Record<string, number>}
                />
                <FilterDropdown
                    label="Industry"
                    icon={<Building2 size={12} strokeWidth={2} />}
                    selectedValue={selectedIndustry}
                    selectedLabel={selectedIndustry ? industryMeta[selectedIndustry] : null}
                    options={industryValues.map((v) => ({ value: v, label: industryMeta[v] }))}
                    onSelect={(v) => setSelectedIndustry(v as TemplateIndustry | null)}
                    counts={countByKey(templates, 'industry') as Record<string, number>}
                />
                <FilterDropdown
                    label="Role"
                    icon={<User size={12} strokeWidth={2} />}
                    selectedValue={selectedRole}
                    selectedLabel={selectedRole ? roleMeta[selectedRole] : null}
                    options={roleValues.map((v) => ({ value: v, label: roleMeta[v] }))}
                    onSelect={(v) => setSelectedRole(v as TemplateRole | null)}
                    counts={countByKey(templates, 'role') as Record<string, number>}
                />
                <FilterDropdown
                    label="Framework"
                    icon={<Layers size={12} strokeWidth={2} />}
                    selectedValue={selectedFramework}
                    selectedLabel={selectedFramework ? frameworkMeta[selectedFramework].label : null}
                    options={frameworkValues.map((v) => ({ value: v, label: frameworkMeta[v].label, description: frameworkMeta[v].description }))}
                    onSelect={(v) => setSelectedFramework(v as TemplateFramework | null)}
                    counts={countByKey(templates, 'framework') as Record<string, number>}
                />
            </div>

            {/* ─── Active filter pills (only when any are set) ─────── */}
            {hasAnyFilter && (
                <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                    {query.trim() && (
                        <ActivePill
                            label={`Search: "${query.trim()}"`}
                            onRemove={() => setQuery('')}
                        />
                    )}
                    {selectedGoal && (
                        <ActivePill
                            label={`Goal: ${goalMeta[selectedGoal].label}`}
                            onRemove={() => setSelectedGoal(null)}
                        />
                    )}
                    {selectedIndustry && (
                        <ActivePill
                            label={`Industry: ${industryMeta[selectedIndustry]}`}
                            onRemove={() => setSelectedIndustry(null)}
                        />
                    )}
                    {selectedRole && (
                        <ActivePill
                            label={`Role: ${roleMeta[selectedRole]}`}
                            onRemove={() => setSelectedRole(null)}
                        />
                    )}
                    {selectedFramework && (
                        <ActivePill
                            label={`Framework: ${frameworkMeta[selectedFramework].label}`}
                            onRemove={() => setSelectedFramework(null)}
                        />
                    )}
                    <button
                        onClick={clearAll}
                        className="text-xs text-[#6B5E4F] underline hover:text-[#1E1E2F] ml-1"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* ─── Result count ────────────────────────────────────── */}
            <div className="mb-5 text-center">
                <p className="text-sm text-[#6B5E4F]">
                    <span className="font-semibold text-[#1E1E2F]">{filtered.length}</span> {filtered.length === 1 ? 'template' : 'templates'}
                    {hasAnyFilter && ` matching your filters`}
                </p>
            </div>

            {/* ─── Grid ───────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <EmptyState onClear={clearAll} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((t) => (
                        <TemplateCard
                            key={t.slug}
                            template={t}
                            goalLabel={goalMeta[t.goal].label}
                            roleLabel={roleMeta[t.role]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// FILTER DROPDOWN — searchable, click-outside-to-close, count-aware
// ============================================================================

interface FilterOption {
    value: string;
    label: string;
    description?: string;
}

interface FilterDropdownProps {
    label: string;
    icon: React.ReactNode;
    selectedValue: string | null;
    selectedLabel: string | null;
    options: FilterOption[];
    onSelect: (value: string | null) => void;
    counts: Record<string, number>;
}

function FilterDropdown({
    label,
    icon,
    selectedValue,
    selectedLabel,
    options,
    onSelect,
    counts,
}: FilterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const filtered = search
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    const isSelected = !!selectedValue;
    const showSearch = options.length > 8;

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition border ${
                    isSelected
                        ? 'bg-[#1E1E2F] text-white border-[#1E1E2F]'
                        : 'bg-white text-[#1E1E2F] border-[#D1CBC5] hover:border-[#1E1E2F]'
                }`}
            >
                {icon}
                <span>{isSelected ? `${label}: ${selectedLabel}` : label}</span>
                <ChevronDown size={12} strokeWidth={2.25} className={`transition ${open ? 'rotate-180' : ''} ${isSelected ? 'opacity-80' : 'opacity-60'}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-white border border-[#D1CBC5] shadow-xl z-30 overflow-hidden">
                    {showSearch && (
                        <div className="p-2 border-b border-[#F0EBE3]">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B5E4F]" size={12} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={`Search ${label.toLowerCase()}…`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#F7F2EB] border border-transparent focus:outline-none focus:border-[#D1CBC5] text-xs"
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-72 overflow-y-auto py-1">
                        {selectedValue && (
                            <button
                                type="button"
                                onClick={() => {
                                    onSelect(null);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#6B5E4F] hover:bg-[#F7F2EB] flex items-center gap-2"
                            >
                                <X size={11} />
                                Clear {label.toLowerCase()}
                            </button>
                        )}
                        {filtered.length === 0 && (
                            <p className="px-3 py-3 text-xs text-[#6B5E4F] text-center">No matches</p>
                        )}
                        {filtered.map((opt) => {
                            const isActive = opt.value === selectedValue;
                            const count = counts[opt.value] ?? 0;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onSelect(opt.value);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs transition flex items-start justify-between gap-2 ${
                                        isActive
                                            ? 'bg-[#1E1E2F] text-white'
                                            : 'text-[#1E1E2F] hover:bg-[#F7F2EB]'
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">{opt.label}</div>
                                        {opt.description && (
                                            <div className={`mt-0.5 text-[11px] line-clamp-1 ${
                                                isActive ? 'text-white/70' : 'text-[#6B5E4F]'
                                            }`}>
                                                {opt.description}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-semibold tabular-nums ${
                                        isActive ? 'text-white/80' : 'text-[#6B5E4F]'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#D1CBC5] text-xs text-[#1E1E2F]">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="-mr-0.5 p-0.5 rounded-full hover:bg-[#F7F2EB]"
                aria-label={`Remove filter: ${label}`}
            >
                <X size={11} strokeWidth={2.5} />
            </button>
        </span>
    );
}

function TemplateCard({
    template,
    goalLabel,
    roleLabel,
}: {
    template: ColdEmailTemplate;
    goalLabel: string;
    roleLabel: string;
}) {
    const wc = wordCount(template.body);
    return (
        <Link
            href={`/cold-email-templates/${template.slug}`}
            className="group block rounded-xl bg-white border border-[#D1CBC5] p-5 hover:border-[#1E1E2F] hover:shadow-md transition"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-semibold leading-tight text-[#1E1E2F] line-clamp-2 group-hover:underline">
                    {template.title}
                </h3>
                <DeliverabilityBadge score={template.deliverabilityScore} />
            </div>

            <div className="mb-3 pb-3 border-b border-[#F0EBE3]">
                <p className="text-xs uppercase tracking-wide text-[#6B5E4F] mb-1">Subject</p>
                <p className="text-sm text-[#1E1E2F] font-medium line-clamp-1">{template.subject}</p>
            </div>

            <p className="text-sm text-[#4A3F30] line-clamp-3 mb-4 whitespace-pre-line">
                {template.body.split('\n').slice(0, 3).join(' ')}
            </p>

            <p className="text-xs text-[#6B5E4F] mb-3 italic line-clamp-1">
                Best for: {template.bestFor}
            </p>

            <div className="flex flex-wrap gap-1.5 text-[11px]">
                <Pill icon={<Tag size={10} strokeWidth={2} />} label={goalLabel} />
                {template.role !== 'general' && <Pill icon={<User size={10} strokeWidth={2} />} label={roleLabel} />}
                <Pill icon={<Layers size={10} strokeWidth={2} />} label={`${wc}w`} />
            </div>
        </Link>
    );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F7F2EB] text-[#4A3F30]">
            {icon}
            {label}
        </span>
    );
}

function DeliverabilityBadge({ score }: { score: number }) {
    const tone =
        score >= 90 ? { bg: '#E8F4EC', fg: '#1F6F3A' }
        : score >= 80 ? { bg: '#F0F6FF', fg: '#1F4C8F' }
        : { bg: '#FDF3E2', fg: '#8B5A1A' };
    return (
        <span
            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ background: tone.bg, color: tone.fg }}
            title={`Deliverability score: ${score}/100`}
        >
            <ShieldCheck size={10} strokeWidth={2.25} />
            {score}
        </span>
    );
}

function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <div className="text-center py-16 rounded-xl bg-white border border-[#D1CBC5]">
            <Sparkles className="mx-auto mb-3 text-[#6B5E4F]" size={28} strokeWidth={1.5} />
            <h3 className="text-base font-semibold mb-1">No templates match those filters</h3>
            <p className="text-sm text-[#6B5E4F] mb-4">Try clearing one filter or searching differently.</p>
            <button
                onClick={onClear}
                className="text-sm underline text-[#1E1E2F] hover:no-underline"
            >
                Clear all filters
            </button>
        </div>
    );
}

// ============================================================================
// HELPERS
// ============================================================================

function countByKey<T extends ColdEmailTemplate, K extends keyof T>(
    items: T[],
    key: K,
): Record<string, number> {
    return items.reduce<Record<string, number>>((acc, item) => {
        const k = String(item[key]);
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});
}

'use client';
import { Eye, MessageSquare, Wrench, Settings, Check } from 'lucide-react';
import { CAPABILITY_KEYS, CAPABILITY_META, PRESETS, type Capability } from '@/hooks/useAgencyMode';

interface Props {
    value: Capability[];
    onChange: (next: Capability[]) => void;
}

const GROUP_META: Record<'view' | 'engage' | 'build' | 'configure', { label: string; description: string; icon: React.ReactNode }> = {
    view:      { label: 'View',      description: 'Read-only insight into what\'s happening.',         icon: <Eye size={12} /> },
    engage:    { label: 'Engage',    description: 'Reply to inboxes and run existing campaigns.',      icon: <MessageSquare size={12} /> },
    build:     { label: 'Build',     description: 'Create campaigns, sequences, and lead lists.',      icon: <Wrench size={12} /> },
    configure: { label: 'Configure', description: 'Connect mailboxes, domains, and integrations.',     icon: <Settings size={12} /> },
};

export default function CapabilityPicker({ value, onChange }: Props) {
    const isOn = (cap: Capability) => value.includes(cap);

    const toggle = (cap: Capability) => {
        if (isOn(cap)) {
            onChange(value.filter((c) => c !== cap));
        } else {
            onChange([...value, cap]);
        }
    };

    const applyPreset = (preset: keyof typeof PRESETS) => {
        onChange([...PRESETS[preset].caps]);
    };

    const selectAll = () => onChange([...CAPABILITY_KEYS]);
    const deselectAll = () => onChange([]);

    const groups: ('view' | 'engage' | 'build' | 'configure')[] = ['view', 'engage', 'build', 'configure'];

    return (
        <div className="space-y-4">
            {/* Presets row */}
            <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Quick presets</div>
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => applyPreset(key)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors text-gray-700"
                            title={PRESETS[key].description}
                        >
                            {PRESETS[key].label}
                        </button>
                    ))}
                    <span className="w-px bg-gray-200 mx-1" />
                    <button
                        type="button"
                        onClick={selectAll}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Select all
                    </button>
                    <button
                        type="button"
                        onClick={deselectAll}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Deselect all
                    </button>
                </div>
            </div>

            {/* Grouped capability checkboxes */}
            <div className="space-y-3">
                {groups.map((g) => {
                    const groupCaps = CAPABILITY_META.filter((c) => c.group === g);
                    return (
                        <div key={g} className="rounded-xl border border-gray-200 bg-white">
                            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                                <span className="w-5 h-5 rounded-md bg-gray-900 text-white flex items-center justify-center">
                                    {GROUP_META[g].icon}
                                </span>
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-900">{GROUP_META[g].label}</div>
                                    <div className="text-[10px] text-gray-500">{GROUP_META[g].description}</div>
                                </div>
                            </div>
                            <div className="p-2">
                                {groupCaps.map((cap) => {
                                    const on = isOn(cap.key);
                                    return (
                                        <label
                                            key={cap.key}
                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <span
                                                className="w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors"
                                                style={{
                                                    background: on ? '#10B981' : '#FFFFFF',
                                                    borderColor: on ? '#10B981' : '#D1D5DB',
                                                }}
                                            >
                                                {on && <Check size={10} className="text-white" strokeWidth={3} />}
                                            </span>
                                            <span className="text-[12px] text-gray-800 flex-1">{cap.label}</span>
                                            <input
                                                type="checkbox"
                                                checked={on}
                                                onChange={() => toggle(cap.key)}
                                                className="sr-only"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Always-agency-only footnote */}
            <div className="text-[10px] text-gray-500 italic px-1 leading-relaxed">
                Workspace branding, billing, user management, and the Agency Mode toggle are agency-only and never grantable.
                Clients also cannot switch workspaces — they're hard-locked to this one.
            </div>
        </div>
    );
}

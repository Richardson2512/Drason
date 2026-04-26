import { useSortFilterModal } from '@/hooks/useSortFilterModal';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import CustomSelect from '@/components/ui/CustomSelect';

interface LeadSortFilterModalProps {
    sortFilter: ReturnType<typeof useSortFilterModal>;
    onApply: () => void;
    onClear: () => void;
}

const SORT_OPTIONS = [
    { value: 'created_desc', label: 'Newest First' },
    { value: 'created_asc', label: 'Oldest First' },
    { value: 'email_asc', label: 'Email (A-Z)' },
    { value: 'email_desc', label: 'Email (Z-A)' },
    { value: 'score_desc', label: 'Score (High to Low)' },
    { value: 'score_asc', label: 'Score (Low to High)' },
    { value: 'activity_desc', label: 'Recently Active' },
    { value: 'activity_asc', label: 'Least Active' },
];

const ENGAGEMENT_OPTIONS = [
    { value: 'all', label: 'All Leads' },
    { value: 'yes', label: 'With Engagement (Opens/Clicks/Replies)' },
    { value: 'no', label: 'No Engagement Yet' },
];

export default function LeadSortFilterModal({ sortFilter, onApply, onClear }: LeadSortFilterModalProps) {
    if (!sortFilter.isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[1000] p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => sortFilter.close()}
        >
            <div
                className="bg-white rounded-3xl max-w-[500px] w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 m-0">
                        Sort & Filter Leads
                    </h2>
                    <button
                        onClick={() => sortFilter.close()}
                        className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-1 leading-none"
                    >
                        x
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Sort By */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sort By
                        </label>
                        <CustomSelect
                            value={sortFilter.temp.sortBy}
                            onChange={(v) => sortFilter.setTempValue('sortBy', v)}
                            options={SORT_OPTIONS}
                        />
                    </div>

                    {/* Score Range */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lead Score Range
                        </label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="number"
                                placeholder="Min (0)"
                                value={sortFilter.temp.minScore}
                                onChange={(e) => sortFilter.setTempValue('minScore', e.target.value)}
                                min="0"
                                max="100"
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                            />
                            <span className="text-gray-500 text-base font-medium">&rarr;</span>
                            <input
                                type="number"
                                placeholder="Max (100)"
                                value={sortFilter.temp.maxScore}
                                onChange={(e) => sortFilter.setTempValue('maxScore', e.target.value)}
                                min="0"
                                max="100"
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Engagement Filter */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Has Engagement
                        </label>
                        <CustomSelect
                            value={sortFilter.temp.hasEngagement}
                            onChange={(v) => sortFilter.setTempValue('hasEngagement', v)}
                            options={ENGAGEMENT_OPTIONS}
                        />
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClear}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onApply}
                        className="flex-1 px-4 py-3 rounded-xl border-none bg-blue-500 text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-600"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

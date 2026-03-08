'use client';
import Link from 'next/link';
import type { InfraRecommendation } from '@/types/api';

interface RecommendationsListProps {
    recommendations: InfraRecommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
    if (recommendations.length === 0) return null;

    return (
        <div className="premium-card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💡 Recommendations
            </h2>
            <div className="flex flex-col gap-3">
                {recommendations.sort((a, b) => a.priority - b.priority).map((rec, idx) => (
                    <div key={idx} className="flex gap-4 items-start px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 transition-all duration-200 hover:shadow-md">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.8rem] font-extrabold shrink-0" style={{
                            background: rec.priority <= 2 ? '#FEF2F2' : rec.priority <= 4 ? '#FFFBEB' : '#EFF6FF',
                            color: rec.priority <= 2 ? '#EF4444' : rec.priority <= 4 ? '#F59E0B' : '#3B82F6',
                            border: `1px solid ${rec.priority <= 2 ? '#FECACA' : rec.priority <= 4 ? '#FDE68A' : '#BFDBFE'}`
                        }}>
                            {rec.priority}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-800 text-[0.9rem] mb-1">
                                {rec.action}
                            </div>
                            <div className="text-slate-500 text-[0.825rem] leading-normal">
                                {rec.reason}
                            </div>
                        </div>
                        {rec.link && (
                            <Link
                                href={rec.link}
                                className="py-[0.4rem] px-4 rounded-[10px] bg-[#2563EB] text-white text-xs font-bold no-underline whitespace-nowrap flex items-center gap-1 shrink-0 self-center"
                            >
                                View &rarr;
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

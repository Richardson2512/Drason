/**
 * Loading Skeleton Component
 *
 * Provides skeleton loading states for different UI elements
 */

interface LoadingSkeletonProps {
    type?: 'table' | 'card' | 'stat' | 'chart' | 'list';
    rows?: number;
    className?: string;
}

export default function LoadingSkeleton({
    type = 'table',
    rows = 5,
    className = ''
}: LoadingSkeletonProps) {
    if (type === 'table') {
        return (
            <div className={`animate-pulse ${className}`}>
                {/* Table Header */}
                <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>

                {/* Table Rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 mb-3 items-center">
                        <div className="w-12 h-4 bg-gray-100 rounded"></div>
                        <div className="flex-1 h-4 bg-gray-100 rounded"></div>
                        <div className="w-32 h-4 bg-gray-100 rounded"></div>
                        <div className="w-24 h-6 bg-gray-100 rounded-full"></div>
                        <div className="w-20 h-4 bg-gray-100 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className={`animate-pulse space-y-4 ${className}`}>
                {Array.from({ length: rows || 3 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'stat') {
        return (
            <div className={`animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
                {Array.from({ length: rows || 4 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                            <div className="w-16 h-6 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded w-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'chart') {
        return (
            <div className={`animate-pulse bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${className}`}>
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="h-64 bg-gray-100 rounded flex items-end gap-2 p-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gray-200 rounded-t"
                            style={{ height: `${Math.random() * 80 + 20}%` }}
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className={`animate-pulse space-y-3 ${className}`}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-100 rounded-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

/**
 * Inline skeleton for smaller elements
 */
export function InlineSkeleton({ width = 'w-full', height = 'h-4', className = '' }: {
    width?: string;
    height?: string;
    className?: string;
}) {
    return <div className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}></div>;
}

/**
 * Skeleton for page header
 */
export function PageHeaderSkeleton() {
    return (
        <div className="animate-pulse mb-8">
            <div className="h-10 bg-gray-200 rounded w-64 mb-3"></div>
            <div className="h-6 bg-gray-100 rounded w-96"></div>
        </div>
    );
}

/**
 * Status Helper Functions
 *
 * Reusable utilities for consistent color coding and status display across the app
 */

/**
 * Get color for infrastructure health score
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return '#16A34A'; // Green - Healthy
    if (score >= 60) return '#F59E0B'; // Yellow/Amber - Warning
    return '#EF4444'; // Red - Critical
}

/**
 * Get background color for score badges
 */
export function getScoreBgColor(score: number): string {
    if (score >= 80) return '#F0FDF4'; // Light green
    if (score >= 60) return '#FFFBEB'; // Light yellow
    return '#FEF2F2'; // Light red
}

/**
 * Get text color for score displays
 */
export function getScoreTextColor(score: number): string {
    if (score >= 80) return '#15803D'; // Dark green
    if (score >= 60) return '#B45309'; // Dark yellow
    return '#B91C1C'; // Dark red
}

/**
 * Get status label with emoji
 */
export function getScoreLabel(score: number): string {
    if (score >= 80) return '✅ Healthy';
    if (score >= 60) return '⚠️ Warning';
    return '❌ Critical';
}

/**
 * Get severity color for findings
 */
export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low'): string {
    switch (severity) {
        case 'critical':
            return '#DC2626'; // Red-600
        case 'high':
            return '#EA580C'; // Orange-600
        case 'medium':
            return '#F59E0B'; // Amber-500
        case 'low':
            return '#3B82F6'; // Blue-500
        default:
            return '#6B7280'; // Gray-500
    }
}

/**
 * Get severity background color
 */
export function getSeverityBgColor(severity: 'critical' | 'high' | 'medium' | 'low'): string {
    switch (severity) {
        case 'critical':
            return '#FEF2F2'; // Red-50
        case 'high':
            return '#FFF7ED'; // Orange-50
        case 'medium':
            return '#FFFBEB'; // Amber-50
        case 'low':
            return '#EFF6FF'; // Blue-50
        default:
            return '#F9FAFB'; // Gray-50
    }
}

/**
 * Get lead status color
 */
export function getLeadStatusColor(status: 'active' | 'held' | 'paused' | 'completed' | string): string {
    switch (status) {
        case 'active':
            return '#10B981'; // Green
        case 'held':
            return '#F59E0B'; // Amber
        case 'paused':
            return '#EF4444'; // Red
        case 'completed':
            return '#6B7280'; // Gray
        default:
            return '#6B7280';
    }
}

/**
 * Get campaign status color
 */
export function getCampaignStatusColor(status: 'active' | 'paused' | 'completed' | string): string {
    switch (status) {
        case 'active':
            return '#10B981'; // Green
        case 'paused':
            return '#F59E0B'; // Amber
        case 'completed':
            return '#6B7280'; // Gray
        default:
            return '#6B7280';
    }
}

/**
 * Get mailbox/domain health status color
 */
export function getHealthStatusColor(status: 'healthy' | 'warning' | 'critical' | 'paused' | string): string {
    switch (status) {
        case 'healthy':
            return '#10B981'; // Green
        case 'warning':
            return '#F59E0B'; // Amber
        case 'critical':
            return '#EF4444'; // Red
        case 'paused':
            return '#6B7280'; // Gray
        default:
            return '#6B7280';
    }
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

/**
 * Get score trend indicator
 */
export function getScoreTrend(current: number, previous: number): {
    direction: 'up' | 'down' | 'stable';
    color: string;
    icon: string;
} {
    const diff = current - previous;
    if (Math.abs(diff) < 2) {
        return { direction: 'stable', color: '#6B7280', icon: '→' };
    }
    if (diff > 0) {
        return { direction: 'up', color: '#10B981', icon: '↑' };
    }
    return { direction: 'down', color: '#EF4444', icon: '↓' };
}

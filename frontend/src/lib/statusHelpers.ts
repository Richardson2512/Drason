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
 * Get status label with emoji
 */
export function getScoreLabel(score: number): string {
    if (score >= 80) return '✅ Healthy';
    if (score >= 60) return '⚠️ Warning';
    return '❌ Critical';
}

/**
 * Get emoji indicator for score
 */
export function getScoreEmoji(score: number): string {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '🚨';
}

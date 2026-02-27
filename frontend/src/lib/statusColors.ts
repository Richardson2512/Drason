/**
 * Centralized status color definitions for consistent styling across the app
 */

export interface StatusStyle {
    bg: string;
    color: string;
}

export function getStatusColors(status: string): StatusStyle {
    const statusMap: Record<string, StatusStyle> = {
        // Success states - Green
        healthy: { bg: '#DCFCE7', color: '#166534' },
        active: { bg: '#DCFCE7', color: '#166534' },

        // Warning states - Yellow
        warning: { bg: '#FEF3C7', color: '#B45309' },
        held: { bg: '#FEF3C7', color: '#92400E' },

        // Error/Critical states - Red
        paused: { bg: '#FEE2E2', color: '#991B1B' },
        blocked: { bg: '#FEE2E2', color: '#991B1B' },
        error: { bg: '#FEE2E2', color: '#991B1B' },

        // Completed/Done states - Orange
        completed: { bg: '#FFF7ED', color: '#C2410C' },
        done: { bg: '#FFF7ED', color: '#C2410C' },

        // Inactive/Neutral states - Gray
        inactive: { bg: '#F3F4F6', color: '#6B7280' },
        idle: { bg: '#F3F4F6', color: '#6B7280' },
    };

    return statusMap[status.toLowerCase()] || { bg: '#F3F4F6', color: '#374151' };
}

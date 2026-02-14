import { toast } from 'react-hot-toast';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch(endpoint, {
            ...options,
            signal: controller.signal,
            credentials: 'include', // CRITICAL: Send cookies
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(id);

        let data: any = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch {
                throw new Error('Invalid JSON response from server');
            }
        }

        // Global Auth Handler
        if (response.status === 401) {
            // Only redirect if not already on login/public page
            if (!window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/signup')) {
                window.location.assign('/login?expired=true');
                throw new Error('Session expired. Please log in again.');
            }
            // If on login page, let it fall through to standard error handling
            // so we can show "Invalid credentials" etc.
        }

        if (!response.ok) {
            // Handle new standardized error format { success: false, error: ... }
            const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        // Return data.data if it exists (standardized), otherwise data (legacy)
        return (data?.success && data?.data) ? data.data : data;

    } catch (error: any) {
        clearTimeout(id);

        // Auto-toast for non-GET requests (mutations)
        if (options.method && options.method !== 'GET') {
            toast.error(error.message || 'An unexpected error occurred');
        }

        throw error;
    }
}

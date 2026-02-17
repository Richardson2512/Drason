import { toast } from 'react-hot-toast';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Default timeout for API requests (15 seconds).
 * Pass a custom `timeout` in options to override for slow operations.
 */
const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 2; // Retry failed requests up to 2 times

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (network errors, timeouts, 5xx errors)
 */
function isRetryableError(error: any, statusCode?: number): boolean {
    // Retry on network errors or timeouts
    if (error.name === 'AbortError' || error.message?.includes('network') || error.message?.includes('timeout')) {
        return true;
    }
    // Retry on 5xx server errors
    if (statusCode && statusCode >= 500 && statusCode < 600) {
        return true;
    }
    // Don't retry 4xx client errors (auth, validation, etc.)
    return false;
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number; retries?: number } = {}
): Promise<T> {
    const { timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, ...fetchOptions } = options;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(endpoint, {
                ...fetchOptions,
                signal: controller.signal,
                credentials: 'include', // CRITICAL: Send httpOnly cookies
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...fetchOptions.headers,
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
            // Handle standardized error format { success: false, error: ... }
            const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

            // Return data.data if it exists (standardized), otherwise data (legacy)
            return (data?.success && data?.data) ? data.data : data;

        } catch (error: any) {
            clearTimeout(id);

            // Check if we should retry
            const statusCode = error.response?.status;
            const shouldRetry = isRetryableError(error, statusCode) && attempt < retries;

            if (shouldRetry) {
                // Exponential backoff: wait 1s, 2s, 4s, etc.
                const backoffMs = Math.pow(2, attempt) * 1000;
                await sleep(backoffMs);
                continue; // Retry the request
            }

            // Final attempt failed or non-retryable error
            // Auto-toast for non-GET requests (mutations)
            if (fetchOptions.method && fetchOptions.method !== 'GET') {
                toast.error(error.message || 'An unexpected error occurred');
            }

            throw error;
        }
    }

    // Should never reach here due to throw in catch, but TypeScript needs it
    throw new Error('Request failed after all retries');
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // Refresh every 12 hours
let refreshTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Silently refresh the auth token. Called periodically to extend session.
 */
async function doTokenRefresh(): Promise<void> {
    try {
        await apiClient('/api/auth/refresh', { method: 'POST' });
    } catch {
        // If refresh fails (expired/invalid), the 401 handler in apiClient
        // will redirect to login. No action needed here.
    }
}

/**
 * Start the automatic token refresh cycle.
 * Call this after successful login/signup.
 * Refreshes immediately on start, then every 12 hours.
 */
export function startTokenRefresh(): void {
    stopTokenRefresh(); // Clear any existing timer
    doTokenRefresh();   // Refresh immediately to set fresh httpOnly cookie
    refreshTimer = setInterval(doTokenRefresh, REFRESH_INTERVAL);
}

/**
 * Stop the automatic token refresh cycle.
 * Call this on logout or when navigating to public pages.
 */
export function stopTokenRefresh(): void {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

/**
 * Logout — clears server cookie and stops refresh.
 */
export async function logout(): Promise<void> {
    stopTokenRefresh();
    try {
        await apiClient('/api/auth/logout', { method: 'POST' });
    } catch {
        // Best-effort — even if the API call fails, clear local state
    }
    window.location.assign('/login');
}

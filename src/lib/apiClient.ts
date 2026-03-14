/**
 * Centralized API Client
 * Consolidates duplicate fetch patterns across the codebase
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Enhanced fetch with timeout, retries, and error handling
 */
export async function apiFetch<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<T | null> {
    const {
        timeout = 10000,
        retries = 0,
        ...fetchOptions
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            lastError = error as Error;
            
            // Don't retry on abort or if it's the last attempt
            if (error instanceof Error && error.name === 'AbortError') {
                console.error(`Request timeout after ${timeout}ms:`, url);
                break;
            }
            
            if (attempt < retries) {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    console.error('API fetch failed:', url, lastError);
    return null;
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
    endpoint: string,
    options?: FetchOptions
): Promise<T | null> {
    return apiFetch<T>(endpoint, {
        method: 'GET',
        ...options,
    });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
    endpoint: string,
    body?: any,
    options?: FetchOptions
): Promise<T | null> {
    return apiFetch<T>(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
    });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(
    endpoint: string,
    body?: any,
    options?: FetchOptions
): Promise<T | null> {
    return apiFetch<T>(endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...options,
    });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
    endpoint: string,
    options?: FetchOptions
): Promise<T | null> {
    return apiFetch<T>(endpoint, {
        method: 'DELETE',
        ...options,
    });
}

// ============================================================================
// CACHING UTILITIES
// ============================================================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class ApiCache<T = any> {
    private cache = new Map<string, CacheEntry<T>>();
    private duration: number;

    constructor(durationMs: number = 10 * 60 * 1000) {
        this.duration = durationMs;
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > this.duration) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    set(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    clear(): void {
        this.cache.clear();
    }

    delete(key: string): void {
        this.cache.delete(key);
    }
}

/**
 * Fetch with caching support
 */
export async function cachedFetch<T = any>(
    url: string,
    cache: ApiCache<T>,
    cacheKey?: string,
    options?: FetchOptions
): Promise<T | null> {
    const key = cacheKey || url;
    
    // Check cache first
    const cached = cache.get(key);
    if (cached !== null) {
        return cached;
    }

    // Fetch fresh data
    const data = await apiFetch<T>(url, options);
    
    if (data !== null) {
        cache.set(key, data);
    }

    return data;
}

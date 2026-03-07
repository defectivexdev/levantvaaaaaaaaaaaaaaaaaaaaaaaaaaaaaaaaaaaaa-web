/**
 * VA Settings Context Provider
 * Provides global configuration to the entire application with real-time sync
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { VASettings } from '@/types/settings';
import { DEFAULT_VA_SETTINGS } from '@/types/settings';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface VASettingsContextType {
    settings: VASettings | null;
    isLoading: boolean;
    error: string | null;
    updateSettings: (updates: Partial<VASettings>) => Promise<void>;
    refreshSettings: () => Promise<void>;
    isConnected: boolean;
}

const VASettingsContext = createContext<VASettingsContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function VASettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<VASettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    /**
     * Fetch settings from API
     */
    const fetchSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/settings');
            
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            setSettings(data.settings);
            setIsConnected(true);
        } catch (err: any) {
            console.error('Failed to fetch VA settings:', err);
            setError(err.message);
            setIsConnected(false);
            
            // Fallback to default settings
            setSettings({
                id: 'default',
                ...DEFAULT_VA_SETTINGS,
                updated_at: new Date(),
                updated_by: 'system',
                version: 1,
            } as VASettings);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update settings
     */
    const updateSettings = useCallback(async (updates: Partial<VASettings>) => {
        try {
            setError(null);

            const response = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const data = await response.json();
            setSettings(data.settings);

            // Broadcast settings change event
            window.dispatchEvent(new CustomEvent('va-settings-updated', {
                detail: data.settings,
            }));
        } catch (err: any) {
            console.error('Failed to update VA settings:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    /**
     * Refresh settings (manual refresh)
     */
    const refreshSettings = useCallback(async () => {
        await fetchSettings();
    }, [fetchSettings]);

    /**
     * Initial fetch and setup real-time listener
     */
    useEffect(() => {
        fetchSettings();

        // Listen for settings updates from other tabs/windows
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'va-settings-update') {
                fetchSettings();
            }
        };

        // Listen for custom settings update events
        const handleSettingsUpdate = (e: CustomEvent) => {
            setSettings(e.detail);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('va-settings-updated' as any, handleSettingsUpdate as any);

        // Poll for updates every 60 seconds (fallback)
        const pollInterval = setInterval(() => {
            fetchSettings();
        }, 60000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('va-settings-updated' as any, handleSettingsUpdate as any);
            clearInterval(pollInterval);
        };
    }, [fetchSettings]);

    const value: VASettingsContextType = {
        settings,
        isLoading,
        error,
        updateSettings,
        refreshSettings,
        isConnected,
    };

    return (
        <VASettingsContext.Provider value={value}>
            {children}
        </VASettingsContext.Provider>
    );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useVASettings() {
    const context = useContext(VASettingsContext);
    
    if (context === undefined) {
        throw new Error('useVASettings must be used within a VASettingsProvider');
    }
    
    return context;
}

// ============================================================================
// SELECTOR HOOKS (for optimized re-renders)
// ============================================================================

export function useOperationalLimits() {
    const { settings } = useVASettings();
    return settings?.operational_limits || DEFAULT_VA_SETTINGS.operational_limits;
}

export function useScoringWeights() {
    const { settings } = useVASettings();
    return settings?.scoring_weights || DEFAULT_VA_SETTINGS.scoring_weights;
}

export function useFuelConstants() {
    const { settings } = useVASettings();
    return settings?.fuel_constants || DEFAULT_VA_SETTINGS.fuel_constants;
}

export function useAcarsConfig() {
    const { settings } = useVASettings();
    return settings?.acars_config || DEFAULT_VA_SETTINGS.acars_config;
}

export function useFlightOperations() {
    const { settings } = useVASettings();
    return settings?.flight_operations || DEFAULT_VA_SETTINGS.flight_operations;
}

export function useEconomics() {
    const { settings } = useVASettings();
    return settings?.economics || DEFAULT_VA_SETTINGS.economics;
}

export function useGeneralSettings() {
    const { settings } = useVASettings();
    return settings?.general || DEFAULT_VA_SETTINGS.general;
}

// ============================================================================
// REAL-TIME SYNC HOOK
// ============================================================================

/**
 * Hook to subscribe to specific setting changes
 */
export function useSettingSubscription<T>(
    selector: (settings: VASettings) => T,
    callback: (value: T) => void
) {
    const { settings } = useVASettings();

    useEffect(() => {
        if (settings) {
            const value = selector(settings);
            callback(value);
        }
    }, [settings, selector, callback]);
}

/**
 * Hook to get a specific setting value with real-time updates
 */
export function useSetting<T>(selector: (settings: VASettings) => T): T | undefined {
    const { settings } = useVASettings();
    return settings ? selector(settings) : undefined;
}

/**
 * useFlightTracking Hook
 * Enterprise-grade real-time flight tracking with TanStack Query
 * Auto-refreshing telemetry data without full-page reloads
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import type { LiveFlight, FlightTrackingData, Telemetry } from '@/types/flight';

// ============================================================================
// CONFIGURATION
// ============================================================================

const QUERY_KEYS = {
    liveFlights: ['flights', 'live'] as const,
    flightById: (id: string) => ['flights', 'live', id] as const,
    flightTelemetry: (id: string) => ['flights', 'telemetry', id] as const,
};

const REFETCH_INTERVALS = {
    liveMap: 5000,        // 5 seconds for live map
    dashboard: 10000,     // 10 seconds for dashboard
    details: 3000,        // 3 seconds for single flight details
};

// ============================================================================
// SMOOTH INTERPOLATION
// ============================================================================

interface InterpolatedPosition {
    lat: number;
    lng: number;
    heading: number;
    alt: number;
}

class PositionInterpolator {
    private positions: Map<string, {
        current: Telemetry;
        target: Telemetry;
        startTime: number;
        duration: number;
    }> = new Map();

    updateTarget(flightId: string, newTelemetry: Telemetry, duration: number = 5000) {
        const existing = this.positions.get(flightId);
        
        this.positions.set(flightId, {
            current: existing?.target || newTelemetry,
            target: newTelemetry,
            startTime: Date.now(),
            duration,
        });
    }

    getInterpolated(flightId: string): Telemetry | null {
        const data = this.positions.get(flightId);
        if (!data) return null;

        const elapsed = Date.now() - data.startTime;
        const progress = Math.min(elapsed / data.duration, 1);

        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);

        return {
            lat: this.lerp(data.current.lat, data.target.lat, eased),
            lng: this.lerp(data.current.lng, data.target.lng, eased),
            alt: this.lerp(data.current.alt, data.target.alt, eased),
            heading: this.lerpAngle(data.current.heading, data.target.heading, eased),
            v_speed: this.lerp(data.current.v_speed, data.target.v_speed, eased),
            groundspeed: data.target.groundspeed,
            ias: data.target.ias,
            timestamp: data.target.timestamp,
        };
    }

    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    private lerpAngle(start: number, end: number, t: number): number {
        // Handle angle wrapping (0-360)
        let diff = end - start;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return (start + diff * t + 360) % 360;
    }

    cleanup(flightId: string) {
        this.positions.delete(flightId);
    }
}

// Global interpolator instance
const interpolator = new PositionInterpolator();

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchLiveFlights(): Promise<FlightTrackingData> {
    const response = await fetch('/api/flights/live');
    if (!response.ok) {
        throw new Error('Failed to fetch live flights');
    }
    const data = await response.json();
    return {
        flights: data.flights || [],
        totalActive: data.totalActive || 0,
        lastRefresh: new Date(),
    };
}

async function fetchFlightById(flightId: string): Promise<LiveFlight> {
    const response = await fetch(`/api/flights/live/${flightId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch flight');
    }
    const data = await response.json();
    return data.flight;
}

// ============================================================================
// MAIN HOOK: useFlightTracking
// ============================================================================

export interface UseFlightTrackingOptions {
    refetchInterval?: number;
    enabled?: boolean;
    smoothInterpolation?: boolean;
}

export function useFlightTracking(options: UseFlightTrackingOptions = {}) {
    const {
        refetchInterval = REFETCH_INTERVALS.liveMap,
        enabled = true,
        smoothInterpolation = true,
    } = options;

    const queryClient = useQueryClient();
    const [interpolatedFlights, setInterpolatedFlights] = useState<LiveFlight[]>([]);

    const query = useQuery({
        queryKey: QUERY_KEYS.liveFlights,
        queryFn: fetchLiveFlights,
        refetchInterval,
        enabled,
        staleTime: refetchInterval - 1000,
        gcTime: 60000, // Keep data for 1 minute
    });

    // Update interpolator when new data arrives
    useEffect(() => {
        if (!query.data?.flights || !smoothInterpolation) {
            setInterpolatedFlights(query.data?.flights || []);
            return;
        }

        // Update targets for interpolation
        query.data.flights.forEach(flight => {
            if (flight.telemetry) {
                interpolator.updateTarget(flight._id, flight.telemetry, refetchInterval);
            }
        });

        // Animate interpolation
        let animationFrame: number;
        const animate = () => {
            const interpolated = query.data.flights.map(flight => {
                const interpolatedTelemetry = interpolator.getInterpolated(flight._id);
                return interpolatedTelemetry
                    ? { ...flight, telemetry: interpolatedTelemetry }
                    : flight;
            });
            setInterpolatedFlights(interpolated);
            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [query.data, smoothInterpolation, refetchInterval]);

    return {
        flights: smoothInterpolation ? interpolatedFlights : (query.data?.flights || []),
        totalActive: query.data?.totalActive || 0,
        lastRefresh: query.data?.lastRefresh,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================================================
// HOOK: useFlightDetails
// ============================================================================

export function useFlightDetails(flightId: string | null, options: UseFlightTrackingOptions = {}) {
    const {
        refetchInterval = REFETCH_INTERVALS.details,
        enabled = true,
        smoothInterpolation = true,
    } = options;

    const [interpolatedFlight, setInterpolatedFlight] = useState<LiveFlight | null>(null);

    const query = useQuery({
        queryKey: QUERY_KEYS.flightById(flightId || ''),
        queryFn: () => fetchFlightById(flightId!),
        refetchInterval,
        enabled: enabled && !!flightId,
        staleTime: refetchInterval - 1000,
    });

    // Interpolation for single flight
    useEffect(() => {
        if (!query.data || !smoothInterpolation || !flightId) {
            setInterpolatedFlight(query.data || null);
            return;
        }

        if (query.data.telemetry) {
            interpolator.updateTarget(flightId, query.data.telemetry, refetchInterval);
        }

        let animationFrame: number;
        const animate = () => {
            const interpolatedTelemetry = interpolator.getInterpolated(flightId);
            setInterpolatedFlight(
                interpolatedTelemetry
                    ? { ...query.data, telemetry: interpolatedTelemetry }
                    : query.data
            );
            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            interpolator.cleanup(flightId);
        };
    }, [query.data, smoothInterpolation, flightId, refetchInterval]);

    return {
        flight: smoothInterpolation ? interpolatedFlight : query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}

// ============================================================================
// HOOK: useFlightStats
// ============================================================================

export function useFlightStats() {
    return useQuery({
        queryKey: ['flights', 'stats'],
        queryFn: async () => {
            const response = await fetch('/api/flights/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            return response.json();
        },
        refetchInterval: 30000, // 30 seconds
        staleTime: 25000,
    });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useInvalidateFlights() {
    const queryClient = useQueryClient();

    return useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['flights'] });
    }, [queryClient]);
}

export function usePrefetchFlight(flightId: string) {
    const queryClient = useQueryClient();

    return useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.flightById(flightId),
            queryFn: () => fetchFlightById(flightId),
        });
    }, [queryClient, flightId]);
}

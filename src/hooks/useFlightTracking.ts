'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LiveFlight } from '@/types/flight';

interface UseFlightTrackingOptions {
    refetchInterval?: number;
    smoothInterpolation?: boolean;
}

/**
 * Hook for tracking live flights with real-time updates
 * Fetches flight data and provides smooth position interpolation
 */
export function useFlightTracking(options: UseFlightTrackingOptions = {}) {
    const { refetchInterval = 30000, smoothInterpolation = false } = options;
    const [flights, setFlights] = useState<LiveFlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFlights = useCallback(async () => {
        try {
            // Try ACARS traffic API first
            const trafficRes = await fetch('/api/acars?action=traffic');
            if (trafficRes.ok) {
                const tData = await trafficRes.json();
                if (tData.traffic && Array.isArray(tData.traffic) && tData.traffic.length > 0) {
                    const normalizedFlights = tData.traffic.map((f: any) => ({
                        callsign: f.callsign,
                        pilot: f.pilotName || f.pilot_name || '',
                        departure: f.departureIcao || f.departure_icao || '',
                        arrival: f.arrivalIcao || f.arrival_icao || '',
                        equipment: f.aircraftType || f.aircraft_type || '',
                        latitude: f.latitude,
                        longitude: f.longitude,
                        altitude: f.altitude,
                        heading: f.heading,
                        groundspeed: f.groundSpeed || f.ground_speed || 0,
                        ias: f.ias || 0,
                        verticalSpeed: f.verticalSpeed || f.vertical_speed || 0,
                        phase: f.phase || f.status || '',
                        status: f.phase || f.status || '',
                        fuel: f.fuel || 0,
                        comfort_score: f.comfortScore || f.comfort_score || 100,
                        started_at: f.startedAt || f.started_at || '',
                    }));
                    setFlights(normalizedFlights);
                    setLoading(false);
                    return;
                }
            }

            // Fallback to live-map endpoint
            const lmRes = await fetch('/api/acars/live-map');
            if (lmRes.ok) {
                const data = await lmRes.json();
                const flightData = Array.isArray(data) ? data : (data.flights || []);
                setFlights(flightData);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching flights:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch flights');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFlights();
        const interval = setInterval(fetchFlights, refetchInterval);
        
        return () => clearInterval(interval);
    }, [fetchFlights, refetchInterval]);

    return {
        flights,
        loading,
        isLoading: loading,
        error,
        totalActive: flights.length,
        refetch: fetchFlights,
    };
}

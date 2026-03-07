/**
 * Great Circle Route Component
 * Draws geodesic path between two airports using @turf/turf
 */

'use client';

import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { greatCircle } from '@turf/great-circle';
import type { Position } from 'geojson';

interface GreatCircleRouteProps {
    departure: string;
    arrival: string;
    color?: string;
    weight?: number;
}

// AirportDB.io API configuration
const AIRPORTDB_API_TOKEN = '9cade662e6ead0aeb8104ee946ffc365e061a7f3e30db6f0c45322944bdbea25111c511f3894d6c7e4b76b370da8a105';
const AIRPORTDB_API_BASE = 'https://airportdb.io/api/v1';

// In-memory cache for airport coordinates
const airportCache = new Map<string, [number, number]>();

export default function GreatCircleRoute({
    departure,
    arrival,
    color = '#FFD700',
    weight = 2,
}: GreatCircleRouteProps) {
    const [routePath, setRoutePath] = useState<Position[]>([]);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                // Fetch coordinates for both airports
                const [depCoords, arrCoords] = await Promise.all([
                    fetchAirportCoords(departure),
                    fetchAirportCoords(arrival),
                ]);

                if (!depCoords || !arrCoords) {
                    console.warn('Could not find coordinates for route');
                    return;
                }

                // Calculate great circle route
                const start = [depCoords[1], depCoords[0]]; // [lng, lat]
                const end = [arrCoords[1], arrCoords[0]];   // [lng, lat]

                const route = greatCircle(start, end, { npoints: 100 });
                
                if (route.geometry.type === 'LineString') {
                    setRoutePath(route.geometry.coordinates);
                }
            } catch (error) {
                console.error('Error calculating great circle route:', error);
            }
        };

        fetchRoute();
    }, [departure, arrival]);

    if (routePath.length === 0) return null;

    // Convert [lng, lat] to [lat, lng] for Leaflet
    const leafletPath = routePath.map(([lng, lat]) => [lat, lng] as [number, number]);

    return (
        <Polyline
            positions={leafletPath}
            pathOptions={{
                color,
                weight,
                opacity: 0.6,
                dashArray: '10, 10',
            }}
        />
    );
}

/**
 * Fetch airport coordinates from AirportDB.io API with caching
 */
async function fetchAirportCoords(icao: string): Promise<[number, number] | null> {
    // Check cache first
    const cached = airportCache.get(icao.toUpperCase());
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(
            `${AIRPORTDB_API_BASE}/airport/${icao.toUpperCase()}?apiToken=${AIRPORTDB_API_TOKEN}`
        );
        
        if (!response.ok) {
            console.warn(`Airport ${icao} not found in AirportDB.io`);
            return null;
        }
        
        const data = await response.json();
        
        if (data.latitude_deg && data.longitude_deg) {
            const coords: [number, number] = [
                parseFloat(data.latitude_deg),
                parseFloat(data.longitude_deg)
            ];
            
            // Cache the result
            airportCache.set(icao.toUpperCase(), coords);
            
            return coords;
        }
        
        return null;
    } catch (error) {
        console.error(`Failed to fetch coordinates for ${icao}:`, error);
        return null;
    }
}

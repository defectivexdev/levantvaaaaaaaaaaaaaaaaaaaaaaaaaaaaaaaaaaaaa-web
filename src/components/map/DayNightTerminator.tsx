/**
 * Day/Night Terminator Component
 * Shows the boundary between day and night on the map
 */

'use client';

import { useEffect, useState } from 'react';
import { Polygon } from 'react-leaflet';
import { geoPath, geoCircle } from 'd3-geo';

export default function DayNightTerminator() {
    const [terminatorPath, setTerminatorPath] = useState<[number, number][]>([]);

    useEffect(() => {
        const updateTerminator = () => {
            const now = new Date();
            const path = calculateTerminator(now);
            setTerminatorPath(path);
        };

        updateTerminator();
        const interval = setInterval(updateTerminator, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    if (terminatorPath.length === 0) return null;

    return (
        <Polygon
            positions={terminatorPath}
            pathOptions={{
                color: '#000000',
                fillColor: '#000000',
                fillOpacity: 0.3,
                weight: 0,
            }}
        />
    );
}

/**
 * Calculate solar terminator position
 */
function calculateTerminator(date: Date): [number, number][] {
    const points: [number, number][] = [];
    const dayOfYear = getDayOfYear(date);
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60;

    // Solar declination
    const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));

    // Generate terminator line
    for (let lat = -90; lat <= 90; lat += 2) {
        const lng = calculateLongitude(lat, declination, hour);
        points.push([lat, lng]);
    }

    // Close the polygon
    points.push(points[0]);

    return points;
}

function calculateLongitude(lat: number, declination: number, hour: number): number {
    const latRad = (lat * Math.PI) / 180;
    const decRad = (declination * Math.PI) / 180;

    const cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
    
    if (cosHourAngle > 1 || cosHourAngle < -1) {
        return hour * 15 - 180;
    }

    const hourAngle = Math.acos(cosHourAngle) * (180 / Math.PI);
    return hour * 15 - 180 + (lat >= 0 ? -hourAngle : hourAngle);
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

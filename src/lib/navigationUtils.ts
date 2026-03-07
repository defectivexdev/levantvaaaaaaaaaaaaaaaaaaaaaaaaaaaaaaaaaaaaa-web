/**
 * Navigation Utilities
 * Cross-track error calculation and route deviation detection
 */

import type { Telemetry, RouteWaypoint } from '@/types/flight';

// ============================================================================
// CONSTANTS
// ============================================================================

const EARTH_RADIUS_NM = 3440.065; // Nautical miles
const DEVIATION_THRESHOLD_NM = 5; // 5 NM deviation triggers alert

// ============================================================================
// GREAT CIRCLE CALCULATIONS
// ============================================================================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Calculate great circle distance between two points (Haversine formula)
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_NM * c;
}

/**
 * Calculate bearing from point A to point B
 */
export function calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δλ = toRadians(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    const θ = Math.atan2(y, x);
    return (toDegrees(θ) + 360) % 360;
}

// ============================================================================
// CROSS-TRACK ERROR
// ============================================================================

/**
 * Calculate cross-track error (XTE)
 * Returns the perpendicular distance from current position to the great circle path
 */
export function calculateCrossTrackError(
    currentLat: number,
    currentLon: number,
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
): number {
    const δ13 = calculateDistance(startLat, startLon, currentLat, currentLon) / EARTH_RADIUS_NM;
    const θ13 = toRadians(calculateBearing(startLat, startLon, currentLat, currentLon));
    const θ12 = toRadians(calculateBearing(startLat, startLon, endLat, endLon));

    const δxt = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));
    
    return Math.abs(toDegrees(δxt) * EARTH_RADIUS_NM);
}

/**
 * Calculate along-track distance
 * Returns the distance along the great circle path from start to the closest point to current position
 */
export function calculateAlongTrackDistance(
    currentLat: number,
    currentLon: number,
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
): number {
    const δ13 = calculateDistance(startLat, startLon, currentLat, currentLon) / EARTH_RADIUS_NM;
    const θ13 = toRadians(calculateBearing(startLat, startLon, currentLat, currentLon));
    const θ12 = toRadians(calculateBearing(startLat, startLon, endLat, endLon));

    const δxt = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));
    const δat = Math.acos(Math.cos(δ13) / Math.cos(δxt));
    
    return toDegrees(δat) * EARTH_RADIUS_NM;
}

// ============================================================================
// ROUTE DEVIATION DETECTION
// ============================================================================

export interface RouteDeviation {
    crossTrackError: number;      // NM
    alongTrackDistance: number;   // NM
    isDeviated: boolean;
    severity: 'normal' | 'warning' | 'alert';
    message: string;
    closestWaypoint?: RouteWaypoint;
    nextWaypoint?: RouteWaypoint;
}

/**
 * Check if aircraft is deviating from planned route
 */
export function checkRouteDeviation(
    telemetry: Telemetry,
    route: RouteWaypoint[]
): RouteDeviation {
    if (route.length < 2) {
        return {
            crossTrackError: 0,
            alongTrackDistance: 0,
            isDeviated: false,
            severity: 'normal',
            message: 'No route defined',
        };
    }

    // Find the current leg (closest two waypoints)
    const { from, to, index } = findCurrentLeg(telemetry, route);

    // Calculate cross-track error
    const xte = calculateCrossTrackError(
        telemetry.lat,
        telemetry.lng,
        from.lat,
        from.lng,
        to.lat,
        to.lng
    );

    // Calculate along-track distance
    const atd = calculateAlongTrackDistance(
        telemetry.lat,
        telemetry.lng,
        from.lat,
        from.lng,
        to.lat,
        to.lng
    );

    // Determine severity
    let severity: 'normal' | 'warning' | 'alert' = 'normal';
    let message = `On course (XTE: ${xte.toFixed(1)} NM)`;

    if (xte > DEVIATION_THRESHOLD_NM * 2) {
        severity = 'alert';
        message = `ROUTE DEVIATION ALERT: ${xte.toFixed(1)} NM off course`;
    } else if (xte > DEVIATION_THRESHOLD_NM) {
        severity = 'warning';
        message = `Route deviation warning: ${xte.toFixed(1)} NM off course`;
    }

    return {
        crossTrackError: xte,
        alongTrackDistance: atd,
        isDeviated: xte > DEVIATION_THRESHOLD_NM,
        severity,
        message,
        closestWaypoint: from,
        nextWaypoint: to,
    };
}

/**
 * Find the current leg of the route
 */
function findCurrentLeg(
    telemetry: Telemetry,
    route: RouteWaypoint[]
): { from: RouteWaypoint; to: RouteWaypoint; index: number } {
    let minDistance = Infinity;
    let closestIndex = 0;

    // Find closest waypoint
    for (let i = 0; i < route.length; i++) {
        const distance = calculateDistance(
            telemetry.lat,
            telemetry.lng,
            route[i].lat,
            route[i].lng
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
        }
    }

    // Determine if we're heading to or from this waypoint
    const from = closestIndex > 0 ? route[closestIndex - 1] : route[closestIndex];
    const to = closestIndex < route.length - 1 ? route[closestIndex + 1] : route[closestIndex];

    return { from, to, index: closestIndex };
}

/**
 * Calculate estimated time to next waypoint
 */
export function calculateETA(
    currentLat: number,
    currentLon: number,
    waypointLat: number,
    waypointLon: number,
    groundSpeed: number
): number {
    const distance = calculateDistance(currentLat, currentLon, waypointLat, waypointLon);
    
    if (groundSpeed <= 0) return 0;
    
    return (distance / groundSpeed) * 60; // minutes
}

/**
 * Calculate fuel required to next waypoint
 */
export function calculateFuelToWaypoint(
    currentLat: number,
    currentLon: number,
    waypointLat: number,
    waypointLon: number,
    groundSpeed: number,
    fuelBurnRate: number
): number {
    const eta = calculateETA(currentLat, currentLon, waypointLat, waypointLon, groundSpeed);
    return (eta / 60) * fuelBurnRate; // gallons
}

/**
 * Check if aircraft is within approach range of destination
 */
export function isInApproachRange(
    telemetry: Telemetry,
    destinationLat: number,
    destinationLon: number,
    rangeNM: number = 50
): boolean {
    const distance = calculateDistance(
        telemetry.lat,
        telemetry.lng,
        destinationLat,
        destinationLon
    );
    return distance <= rangeNM;
}

/**
 * Calculate progress along route (0-100%)
 */
export function calculateRouteProgress(
    telemetry: Telemetry,
    route: RouteWaypoint[]
): number {
    if (route.length < 2) return 0;

    const totalDistance = calculateDistance(
        route[0].lat,
        route[0].lng,
        route[route.length - 1].lat,
        route[route.length - 1].lng
    );

    const distanceFromStart = calculateDistance(
        route[0].lat,
        route[0].lng,
        telemetry.lat,
        telemetry.lng
    );

    return Math.min(100, (distanceFromStart / totalDistance) * 100);
}

/**
 * Format distance for display
 */
export function formatDistance(nm: number): string {
    if (nm < 1) {
        return `${(nm * 6076).toFixed(0)} ft`;
    }
    return `${nm.toFixed(1)} NM`;
}

/**
 * Format bearing for display
 */
export function formatBearing(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return `${Math.round(degrees)}° ${directions[index]}`;
}

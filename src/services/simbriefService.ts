/**
 * SimBrief API Integration Service
 * Fetch and parse flight plans from SimBrief
 */

import type { FlightPlan, Airport, FuelPlan } from '@/types/flight';
import { calculateFuelPlan } from './fuelCalculation';

// ============================================================================
// TYPES
// ============================================================================

export interface SimBriefFlightPlan {
    origin: {
        icao: string;
        iata: string;
        name: string;
        lat: number;
        lon: number;
        elevation: number;
    };
    destination: {
        icao: string;
        iata: string;
        name: string;
        lat: number;
        lon: number;
        elevation: number;
    };
    alternate?: {
        icao: string;
        iata: string;
        name: string;
        lat: number;
        lon: number;
    };
    general: {
        route: string;
        cruise_altitude: number;
        cruise_speed: number;
        flight_time: number;
        distance: number;
        cost_index: number;
        callsign: string;
    };
    fuel: {
        plan_ramp: number;      // Total fuel
        plan_takeoff: number;   // Fuel at takeoff
        plan_landing: number;   // Expected landing fuel
        taxi: number;
        trip: number;
        contingency: number;
        alternate: number;
        reserve: number;
        extra: number;
    };
    aircraft: {
        icao: string;
        name: string;
        registration: string;
    };
    weights: {
        payload: number;
        cargo: number;
        pax_count: number;
    };
    times: {
        est_out: string;
        est_off: string;
        est_on: string;
        est_in: string;
    };
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

const SIMBRIEF_API_BASE = 'https://www.simbrief.com/api';
const SIMBRIEF_XML_API = `${SIMBRIEF_API_BASE}/xml.fetcher.php`;
const SIMBRIEF_JSON_API = `${SIMBRIEF_API_BASE}/json.fetcher.php`;

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch SimBrief flight plan by pilot ID
 */
export async function fetchSimBriefPlan(
    pilotId: string,
    format: 'json' | 'xml' = 'json'
): Promise<SimBriefFlightPlan | null> {
    try {
        const url = format === 'json' 
            ? `${SIMBRIEF_JSON_API}?userid=${pilotId}&json=1`
            : `${SIMBRIEF_XML_API}?userid=${pilotId}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('SimBrief API error:', response.status);
            return null;
        }

        if (format === 'json') {
            const data = await response.json();
            return parseSimBriefJSON(data);
        } else {
            const xmlText = await response.text();
            return parseSimBriefXML(xmlText);
        }
    } catch (error) {
        console.error('Failed to fetch SimBrief plan:', error);
        return null;
    }
}

/**
 * Fetch by flight ID instead of pilot ID
 */
export async function fetchSimBriefPlanByFlightId(
    flightId: string
): Promise<SimBriefFlightPlan | null> {
    try {
        const url = `${SIMBRIEF_JSON_API}?flightid=${flightId}&json=1`;
        const response = await fetch(url);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return parseSimBriefJSON(data);
    } catch (error) {
        console.error('Failed to fetch SimBrief plan by flight ID:', error);
        return null;
    }
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parse SimBrief JSON response
 */
function parseSimBriefJSON(data: any): SimBriefFlightPlan {
    return {
        origin: {
            icao: data.origin?.icao_code || '',
            iata: data.origin?.iata_code || '',
            name: data.origin?.name || '',
            lat: parseFloat(data.origin?.pos_lat || '0'),
            lon: parseFloat(data.origin?.pos_long || '0'),
            elevation: parseInt(data.origin?.elevation || '0'),
        },
        destination: {
            icao: data.destination?.icao_code || '',
            iata: data.destination?.iata_code || '',
            name: data.destination?.name || '',
            lat: parseFloat(data.destination?.pos_lat || '0'),
            lon: parseFloat(data.destination?.pos_long || '0'),
            elevation: parseInt(data.destination?.elevation || '0'),
        },
        alternate: data.alternate ? {
            icao: data.alternate.icao_code || '',
            iata: data.alternate.iata_code || '',
            name: data.alternate.name || '',
            lat: parseFloat(data.alternate.pos_lat || '0'),
            lon: parseFloat(data.alternate.pos_long || '0'),
        } : undefined,
        general: {
            route: data.general?.route || '',
            cruise_altitude: parseInt(data.general?.initial_altitude || '0'),
            cruise_speed: parseInt(data.general?.avg_tropopause || '0'),
            flight_time: parseInt(data.times?.est_time_enroute || '0'),
            distance: parseInt(data.general?.air_distance || '0'),
            cost_index: parseInt(data.general?.costindex || '0'),
            callsign: data.atc?.callsign || '',
        },
        fuel: {
            plan_ramp: parseFloat(data.fuel?.plan_ramp || '0'),
            plan_takeoff: parseFloat(data.fuel?.plan_takeoff || '0'),
            plan_landing: parseFloat(data.fuel?.plan_landing || '0'),
            taxi: parseFloat(data.fuel?.taxi || '0'),
            trip: parseFloat(data.fuel?.enroute_burn || '0'),
            contingency: parseFloat(data.fuel?.contingency || '0'),
            alternate: parseFloat(data.fuel?.alternate_burn || '0'),
            reserve: parseFloat(data.fuel?.reserve || '0'),
            extra: parseFloat(data.fuel?.extra || '0'),
        },
        aircraft: {
            icao: data.aircraft?.icaocode || '',
            name: data.aircraft?.name || '',
            registration: data.aircraft?.reg || '',
        },
        weights: {
            payload: parseFloat(data.weights?.payload || '0'),
            cargo: parseFloat(data.weights?.cargo || '0'),
            pax_count: parseInt(data.weights?.pax_count || '0'),
        },
        times: {
            est_out: data.times?.est_out || '',
            est_off: data.times?.est_off || '',
            est_on: data.times?.est_on || '',
            est_in: data.times?.est_in || '',
        },
    };
}

/**
 * Parse SimBrief XML response
 */
function parseSimBriefXML(xmlText: string): SimBriefFlightPlan {
    // Basic XML parsing - in production, use DOMParser or xml2js
    const getValue = (tag: string): string => {
        const match = xmlText.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
        return match ? match[1] : '';
    };

    return {
        origin: {
            icao: getValue('origin_icao'),
            iata: getValue('origin_iata'),
            name: getValue('origin_name'),
            lat: parseFloat(getValue('origin_lat') || '0'),
            lon: parseFloat(getValue('origin_lon') || '0'),
            elevation: parseInt(getValue('origin_elevation') || '0'),
        },
        destination: {
            icao: getValue('destination_icao'),
            iata: getValue('destination_iata'),
            name: getValue('destination_name'),
            lat: parseFloat(getValue('destination_lat') || '0'),
            lon: parseFloat(getValue('destination_lon') || '0'),
            elevation: parseInt(getValue('destination_elevation') || '0'),
        },
        general: {
            route: getValue('route'),
            cruise_altitude: parseInt(getValue('initial_altitude') || '0'),
            cruise_speed: parseInt(getValue('avg_wind_spd') || '0'),
            flight_time: parseInt(getValue('est_time_enroute') || '0'),
            distance: parseInt(getValue('air_distance') || '0'),
            cost_index: parseInt(getValue('costindex') || '0'),
            callsign: getValue('callsign'),
        },
        fuel: {
            plan_ramp: parseFloat(getValue('plan_ramp') || '0'),
            plan_takeoff: parseFloat(getValue('plan_takeoff') || '0'),
            plan_landing: parseFloat(getValue('plan_landing') || '0'),
            taxi: parseFloat(getValue('taxi') || '0'),
            trip: parseFloat(getValue('enroute_burn') || '0'),
            contingency: parseFloat(getValue('contingency') || '0'),
            alternate: parseFloat(getValue('alternate_burn') || '0'),
            reserve: parseFloat(getValue('reserve') || '0'),
            extra: parseFloat(getValue('extra') || '0'),
        },
        aircraft: {
            icao: getValue('aircraft_icao'),
            name: getValue('aircraft_name'),
            registration: getValue('aircraft_reg'),
        },
        weights: {
            payload: parseFloat(getValue('payload') || '0'),
            cargo: parseFloat(getValue('cargo') || '0'),
            pax_count: parseInt(getValue('pax_count') || '0'),
        },
        times: {
            est_out: getValue('est_out'),
            est_off: getValue('est_off'),
            est_on: getValue('est_on'),
            est_in: getValue('est_in'),
        },
    };
}

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert SimBrief plan to internal FlightPlan format
 */
export function convertToFlightPlan(simbriefPlan: SimBriefFlightPlan): FlightPlan {
    const departure: Airport = {
        icao: simbriefPlan.origin.icao,
        iata: simbriefPlan.origin.iata,
        name: simbriefPlan.origin.name,
        city: '',
        country: '',
        lat: simbriefPlan.origin.lat,
        lng: simbriefPlan.origin.lon,
        elevation: simbriefPlan.origin.elevation,
        timezone: 'UTC',
    };

    const arrival: Airport = {
        icao: simbriefPlan.destination.icao,
        iata: simbriefPlan.destination.iata,
        name: simbriefPlan.destination.name,
        city: '',
        country: '',
        lat: simbriefPlan.destination.lat,
        lng: simbriefPlan.destination.lon,
        elevation: simbriefPlan.destination.elevation,
        timezone: 'UTC',
    };

    const alternate: Airport | undefined = simbriefPlan.alternate ? {
        icao: simbriefPlan.alternate.icao,
        iata: simbriefPlan.alternate.iata,
        name: simbriefPlan.alternate.name,
        city: '',
        country: '',
        lat: simbriefPlan.alternate.lat,
        lng: simbriefPlan.alternate.lon,
        elevation: 0,
        timezone: 'UTC',
    } : undefined;

    return {
        id: `simbrief_${Date.now()}`,
        callsign: simbriefPlan.general.callsign,
        departure,
        arrival,
        alternate,
        route: simbriefPlan.general.route,
        cruiseAltitude: simbriefPlan.general.cruise_altitude,
        cruiseSpeed: simbriefPlan.general.cruise_speed,
        estimatedDuration: simbriefPlan.general.flight_time,
        estimatedFuel: simbriefPlan.fuel.plan_ramp,
        distance: simbriefPlan.general.distance,
        createdAt: new Date(),
    };
}

/**
 * Convert SimBrief fuel to internal FuelPlan format
 */
export function convertToFuelPlan(simbriefPlan: SimBriefFlightPlan): FuelPlan {
    return {
        tripFuel: Math.round(simbriefPlan.fuel.trip),
        contingency: Math.round(simbriefPlan.fuel.contingency),
        alternate: Math.round(simbriefPlan.fuel.alternate),
        finalReserve: Math.round(simbriefPlan.fuel.reserve),
        taxi: Math.round(simbriefPlan.fuel.taxi),
        totalRequired: Math.round(simbriefPlan.fuel.plan_takeoff),
        plannedOnboard: Math.round(simbriefPlan.fuel.plan_ramp),
        estimatedLanding: Math.round(simbriefPlan.fuel.plan_landing),
    };
}

/**
 * Auto-populate flight booking form from SimBrief
 */
export interface FlightBookingData {
    departure: string;
    arrival: string;
    alternate?: string;
    route: string;
    cruiseAltitude: number;
    cruiseSpeed: number;
    aircraft: string;
    registration: string;
    blockFuel: number;
    costIndex: number;
    estimatedDuration: number;
    distance: number;
    callsign: string;
}

export function extractBookingData(simbriefPlan: SimBriefFlightPlan): FlightBookingData {
    return {
        departure: simbriefPlan.origin.icao,
        arrival: simbriefPlan.destination.icao,
        alternate: simbriefPlan.alternate?.icao,
        route: simbriefPlan.general.route,
        cruiseAltitude: simbriefPlan.general.cruise_altitude,
        cruiseSpeed: simbriefPlan.general.cruise_speed,
        aircraft: simbriefPlan.aircraft.icao,
        registration: simbriefPlan.aircraft.registration,
        blockFuel: simbriefPlan.fuel.plan_ramp,
        costIndex: simbriefPlan.general.cost_index,
        estimatedDuration: simbriefPlan.general.flight_time,
        distance: simbriefPlan.general.distance,
        callsign: simbriefPlan.general.callsign,
    };
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

const planCache = new Map<string, { plan: SimBriefFlightPlan; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedPlan(pilotId: string): SimBriefFlightPlan | null {
    const cached = planCache.get(pilotId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.plan;
    }
    return null;
}

export function cachePlan(pilotId: string, plan: SimBriefFlightPlan): void {
    planCache.set(pilotId, { plan, timestamp: Date.now() });
}

export function clearPlanCache(): void {
    planCache.clear();
}

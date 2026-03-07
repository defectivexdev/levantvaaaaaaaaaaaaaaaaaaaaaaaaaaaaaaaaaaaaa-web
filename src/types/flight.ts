/**
 * Enterprise-Grade Flight Data Models
 * Strict type definitions for Virtual Airline platform
 */

// ============================================================================
// TELEMETRY & TRACKING
// ============================================================================

export interface Telemetry {
    lat: number;
    lng: number;
    alt: number;           // Altitude in feet
    v_speed: number;       // Vertical speed in feet/min
    heading: number;       // Heading in degrees (0-360)
    groundspeed?: number;  // Ground speed in knots
    ias?: number;          // Indicated airspeed in knots
    timestamp: Date;
}

export interface FlightPosition extends Telemetry {
    flightId: string;
    pilotId: string;
    callsign: string;
}

// ============================================================================
// FLIGHT PHASES
// ============================================================================

export enum FlightPhase {
    PREFLIGHT = 'preflight',
    TAXI_OUT = 'taxi_out',
    TAKEOFF = 'takeoff',
    CLIMB = 'climb',
    CRUISE = 'cruise',
    DESCENT = 'descent',
    APPROACH = 'approach',
    LANDING = 'landing',
    TAXI_IN = 'taxi_in',
    ARRIVED = 'arrived',
    CANCELLED = 'cancelled'
}

export enum FlightStatus {
    SCHEDULED = 'scheduled',
    BOARDING = 'boarding',
    DEPARTED = 'departed',
    AIRBORNE = 'airborne',
    ARRIVED = 'arrived',
    CANCELLED = 'cancelled'
}

// ============================================================================
// AIRPORT DATA
// ============================================================================

export interface Airport {
    icao: string;          // Always uppercase, 4 characters
    iata?: string;         // Always uppercase, 3 characters
    name: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
    elevation: number;     // Feet above sea level
    timezone: string;
}

export interface Runway {
    ident: string;
    length: number;        // Feet
    width: number;         // Feet
    surface: string;
    heading: number;
}

// ============================================================================
// AIRCRAFT DATA
// ============================================================================

export interface Aircraft {
    id: string;
    registration: string;
    type: string;          // e.g., "A320", "B737-800"
    icaoType: string;      // e.g., "A320", "B738"
    manufacturer: string;
    model: string;
    maxPax: number;
    maxCargo: number;      // Pounds
    fuelCapacity: number;  // Gallons
    cruiseSpeed: number;   // Knots
    range: number;         // Nautical miles
    burnRate: number;      // Gallons per hour
}

export interface AircraftPerformance {
    burnRate: number;      // Gallons/hour at cruise
    climbRate: number;     // Feet/min average
    descentRate: number;   // Feet/min average
    cruiseAltitude: number; // Feet
    cruiseSpeed: number;   // Knots
}

// ============================================================================
// FLIGHT PLAN
// ============================================================================

export interface FlightPlan {
    id: string;
    callsign: string;
    departure: Airport;
    arrival: Airport;
    alternate?: Airport;
    route: string;
    cruiseAltitude: number;
    cruiseSpeed: number;
    estimatedDuration: number;  // Minutes
    estimatedFuel: number;      // Gallons
    distance: number;           // Nautical miles
    createdAt: Date;
}

export interface RouteWaypoint {
    ident: string;
    name?: string;
    lat: number;
    lng: number;
    altitude?: number;
    type: 'airport' | 'waypoint' | 'vor' | 'ndb' | 'fix';
}

// ============================================================================
// FUEL CALCULATION
// ============================================================================

export interface FuelPlan {
    tripFuel: number;          // Gallons needed for trip
    contingency: number;       // 5% of trip fuel
    alternate: number;         // Fuel to alternate airport
    finalReserve: number;      // 30 min reserve
    taxi: number;              // Taxi fuel
    totalRequired: number;     // Sum of all above
    plannedOnboard: number;    // What pilot plans to load
    estimatedLanding: number;  // Expected fuel at landing
}

export interface FuelCalculationParams {
    distance: number;          // Nautical miles
    cruiseSpeed: number;       // Knots
    burnRate: number;          // Gallons per hour
    alternateDistance?: number; // NM to alternate
    taxiTime?: number;         // Minutes
}

// ============================================================================
// WEATHER DATA
// ============================================================================

export interface METAR {
    icao: string;
    rawText: string;
    observationTime: Date;
    temperature: number;       // Celsius
    dewpoint: number;          // Celsius
    windDirection: number;     // Degrees
    windSpeed: number;         // Knots
    windGust?: number;         // Knots
    visibility: number;        // Statute miles
    altimeter: number;         // inHg
    clouds: CloudLayer[];
    weatherConditions: string[];
    flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
}

export interface CloudLayer {
    coverage: 'FEW' | 'SCT' | 'BKN' | 'OVC';
    altitude: number;          // Feet AGL
    type?: 'CB' | 'TCU';
}

export interface TAF {
    icao: string;
    rawText: string;
    issueTime: Date;
    validFrom: Date;
    validTo: Date;
    forecast: TAFPeriod[];
}

export interface TAFPeriod {
    from: Date;
    to: Date;
    windDirection: number;
    windSpeed: number;
    visibility: number;
    clouds: CloudLayer[];
    weatherConditions: string[];
}

// ============================================================================
// FLIGHT RECORD
// ============================================================================

export interface Flight {
    _id: string;
    pilotId: string;
    pilotName: string;
    callsign: string;
    
    // Route Information
    departure: string;         // ICAO code (uppercase)
    arrival: string;           // ICAO code (uppercase)
    alternate?: string;        // ICAO code (uppercase)
    route?: string;
    
    // Aircraft
    aircraft: string;
    registration?: string;
    
    // Schedule
    scheduledDeparture?: Date;
    scheduledArrival?: Date;
    
    // Actual Times
    actualDeparture?: Date;
    actualArrival?: Date;
    blockTime?: number;        // Minutes
    flightTime?: number;       // Minutes
    
    // Status & Phase
    status: FlightStatus;
    phase: FlightPhase;
    
    // Telemetry (current position)
    telemetry?: Telemetry;
    
    // Performance Metrics
    distance?: number;         // Nautical miles
    maxAltitude?: number;      // Feet
    landingRate?: number;      // Feet per minute (negative)
    fuelUsed?: number;         // Gallons
    fuelRemaining?: number;    // Gallons
    
    // Scoring
    score?: number;
    smoothness?: number;       // 0-100
    efficiency?: number;       // 0-100
    
    // Financial
    earnings?: number;
    expenses?: number;
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

// ============================================================================
// LIVE TRACKING
// ============================================================================

export interface LiveFlight extends Flight {
    telemetry: Telemetry;      // Required for live flights
    lastUpdate: Date;
    isOnline: boolean;
}

export interface FlightTrackingData {
    flights: LiveFlight[];
    totalActive: number;
    lastRefresh: Date;
}

// ============================================================================
// DISPATCH RELEASE
// ============================================================================

export interface DispatchRelease {
    flightId: string;
    releaseNumber: string;
    callsign: string;
    
    // Route
    departure: Airport;
    arrival: Airport;
    alternate?: Airport;
    route: string;
    
    // Aircraft
    aircraft: Aircraft;
    registration: string;
    
    // Times
    scheduledDeparture: Date;
    estimatedArrival: Date;
    estimatedDuration: number; // Minutes
    
    // Fuel
    fuelPlan: FuelPlan;
    
    // Weather
    departureMetar?: METAR;
    arrivalMetar?: METAR;
    departureTaf?: TAF;
    arrivalTaf?: TAF;
    
    // Performance
    cruiseAltitude: number;
    cruiseSpeed: number;
    distance: number;
    
    // Crew
    captain: string;
    dispatcher: string;
    
    // Metadata
    generatedAt: Date;
    validUntil: Date;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ICAOCode = string & { __brand: 'ICAO' };
export type IATACode = string & { __brand: 'IATA' };

export const validateICAO = (code: string): ICAOCode | null => {
    const normalized = code.toUpperCase().trim();
    return normalized.length === 4 && /^[A-Z]{4}$/.test(normalized) 
        ? normalized as ICAOCode 
        : null;
};

export const validateIATA = (code: string): IATACode | null => {
    const normalized = code.toUpperCase().trim();
    return normalized.length === 3 && /^[A-Z]{3}$/.test(normalized)
        ? normalized as IATACode
        : null;
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

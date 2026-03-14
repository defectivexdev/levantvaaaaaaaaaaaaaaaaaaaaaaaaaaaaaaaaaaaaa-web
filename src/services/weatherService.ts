/**
 * Weather Service
 * Real-time METAR/TAF data integration
 */

import type { METAR, TAF, CloudLayer } from '@/types/flight';
import { cachedFetch, ApiCache } from '@/lib/apiClient';

// ============================================================================
// CONFIGURATION
// ============================================================================

const WEATHER_API_BASE = 'https://aviationweather.gov/api/data';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Centralized cache for raw API responses
const metarCache = new ApiCache<any[]>(CACHE_DURATION);
const tafCache = new ApiCache<any[]>(CACHE_DURATION);

// ============================================================================
// METAR PARSING & FETCHING
// ============================================================================

/**
 * Fetch METAR for an airport
 */
export async function fetchMETAR(icao: string): Promise<METAR | null> {
    const url = `${WEATHER_API_BASE}/metar?ids=${icao.toUpperCase()}&format=json`;
    const cacheKey = `metar_${icao.toUpperCase()}`;

    const data = await cachedFetch<any[]>(url, metarCache, cacheKey);
    
    if (!data || data.length === 0) return null;

    return parseMETAR(data[0]);
}

/**
 * Parse raw METAR data
 */
function parseMETAR(raw: any): METAR {
    return {
        icao: raw.icaoId || raw.stationId,
        rawText: raw.rawOb || raw.rawText || '',
        observationTime: new Date(raw.obsTime || raw.observation_time),
        temperature: raw.temp || 0,
        dewpoint: raw.dewp || 0,
        windDirection: raw.wdir || 0,
        windSpeed: raw.wspd || 0,
        windGust: raw.wgst,
        visibility: raw.visib || 10,
        altimeter: raw.altim || 29.92,
        clouds: parseCloudLayers(raw.clouds || raw.skyConditions || []),
        weatherConditions: raw.wxString ? raw.wxString.split(' ') : [],
        flightCategory: determineFlightCategory(raw),
    };
}

/**
 * Parse cloud layers
 */
function parseCloudLayers(clouds: any[]): CloudLayer[] {
    if (!Array.isArray(clouds)) return [];

    return clouds.map((cloud: any) => ({
        coverage: cloud.cover || cloud.skyCover || 'CLR',
        altitude: cloud.base || cloud.cloudBase || 0,
        type: cloud.type || cloud.cloudType,
    }));
}

/**
 * Determine flight category from METAR
 */
function determineFlightCategory(metar: any): 'VFR' | 'MVFR' | 'IFR' | 'LIFR' {
    const vis = metar.visib || 10;
    const ceiling = getLowestCeiling(metar.clouds || []);

    if (vis >= 5 && ceiling >= 3000) return 'VFR';
    if (vis >= 3 && ceiling >= 1000) return 'MVFR';
    if (vis >= 1 && ceiling >= 500) return 'IFR';
    return 'LIFR';
}

/**
 * Get lowest ceiling from cloud layers
 */
function getLowestCeiling(clouds: any[]): number {
    const ceilings = clouds
        .filter((c: any) => ['BKN', 'OVC'].includes(c.cover || c.skyCover))
        .map((c: any) => c.base || c.cloudBase || 10000);

    return ceilings.length > 0 ? Math.min(...ceilings) : 10000;
}

// ============================================================================
// TAF PARSING & FETCHING
// ============================================================================

/**
 * Fetch TAF for an airport
 */
export async function fetchTAF(icao: string): Promise<TAF | null> {
    const url = `${WEATHER_API_BASE}/taf?ids=${icao.toUpperCase()}&format=json`;
    const cacheKey = `taf_${icao.toUpperCase()}`;

    const data = await cachedFetch<any[]>(url, tafCache, cacheKey);
    
    if (!data || data.length === 0) return null;

    return parseTAF(data[0]);
}

/**
 * Parse raw TAF data
 */
function parseTAF(raw: any): TAF {
    return {
        icao: raw.icaoId || raw.stationId,
        rawText: raw.rawTAF || raw.rawText || '',
        issueTime: new Date(raw.issueTime || raw.bulletinTime),
        validFrom: new Date(raw.validTimeFrom),
        validTo: new Date(raw.validTimeTo),
        forecast: raw.forecast || [],
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format METAR for display
 */
export function formatMETAR(metar: METAR): string {
    const time = metar.observationTime.toISOString().slice(11, 16);
    const wind = `${metar.windDirection.toString().padStart(3, '0')}°/${metar.windSpeed}kt`;
    const temp = `${metar.temperature}°C/${metar.dewpoint}°C`;
    const alt = `${metar.altimeter.toFixed(2)}"`;

    return `${metar.icao} ${time}Z ${wind} ${metar.visibility}SM ${temp} ${alt} ${metar.flightCategory}`;
}

/**
 * Check if weather is suitable for VFR flight
 */
export function isVFRWeather(metar: METAR): boolean {
    return metar.flightCategory === 'VFR' || metar.flightCategory === 'MVFR';
}

/**
 * Get wind component (headwind/tailwind/crosswind)
 */
export function getWindComponents(
    windDirection: number,
    windSpeed: number,
    runwayHeading: number
): {
    headwind: number;
    crosswind: number;
    tailwind: number;
} {
    const angleDiff = ((windDirection - runwayHeading + 180) % 360) - 180;
    const angleRad = (angleDiff * Math.PI) / 180;

    const headwind = Math.cos(angleRad) * windSpeed;
    const crosswind = Math.sin(angleRad) * windSpeed;

    return {
        headwind: headwind > 0 ? headwind : 0,
        crosswind: Math.abs(crosswind),
        tailwind: headwind < 0 ? Math.abs(headwind) : 0,
    };
}

/**
 * Fetch weather for multiple airports
 */
export async function fetchWeatherBrief(icaoCodes: string[]): Promise<{
    metars: Map<string, METAR>;
    tafs: Map<string, TAF>;
}> {
    const metarPromises = icaoCodes.map(icao => fetchMETAR(icao));
    const tafPromises = icaoCodes.map(icao => fetchTAF(icao));

    const [metars, tafs] = await Promise.all([
        Promise.all(metarPromises),
        Promise.all(tafPromises),
    ]);

    const metarMap = new Map<string, METAR>();
    const tafMap = new Map<string, TAF>();

    metars.forEach((metar, i) => {
        if (metar) metarMap.set(icaoCodes[i], metar);
    });

    tafs.forEach((taf, i) => {
        if (taf) tafMap.set(icaoCodes[i], taf);
    });

    return { metars: metarMap, tafs: tafMap };
}

/**
 * Clear weather cache
 */
export function clearWeatherCache(): void {
    metarCache.clear();
    tafCache.clear();
}

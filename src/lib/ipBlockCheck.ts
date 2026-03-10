import { NextRequest } from 'next/server';
import CountryBlacklist from '@/models/CountryBlacklist';

/**
 * Check if the request IP is from a blacklisted country
 * @param request - NextRequest object
 * @returns true if IP is blacklisted, false otherwise
 */
export async function isIpBlacklisted(request: NextRequest): Promise<boolean> {
    try {
        const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
        const ipCountry = ipCountryHeader.toUpperCase();
        
        if (!ipCountry) {
            return false; // No IP country detected, allow access
        }
        
        const blacklisted = await CountryBlacklist.findOne({ country_code: ipCountry });
        return !!blacklisted;
    } catch (error) {
        console.error('[IP Block Check] Error:', error);
        return false; // On error, allow access (fail open)
    }
}

/**
 * Get the IP country code from request headers
 * @param request - NextRequest object
 * @returns Country code or empty string
 */
export function getIpCountry(request: NextRequest): string {
    const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
    return ipCountryHeader.toUpperCase();
}

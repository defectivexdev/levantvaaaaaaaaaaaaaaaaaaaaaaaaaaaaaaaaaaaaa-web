import { NextRequest } from 'next/server';
import CountryBlacklist from '@/models/CountryBlacklist';
import { sendBlockedAccessAlert } from './discordWebhook';
import { getRequestGeolocation } from './ipGeolocation';

/**
 * Check if the request IP is from a blacklisted country
 * @param request - NextRequest object
 * @param endpoint - Name of the endpoint being accessed
 * @param additionalData - Optional additional data for webhook notification
 * @returns true if IP is blacklisted, false otherwise
 */
export async function isIpBlacklisted(
    request: NextRequest, 
    endpoint?: string,
    additionalData?: { pilotId?: string; email?: string }
): Promise<boolean> {
    try {
        const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
        const ipCountry = ipCountryHeader.toUpperCase();
        
        if (!ipCountry) {
            return false; // No IP country detected, allow access
        }
        
        const blacklisted = await CountryBlacklist.findOne({ country_code: ipCountry });
        
        if (blacklisted) {
            // Get full geolocation data for webhook
            const geoData = await getRequestGeolocation(request);
            const userAgent = request.headers.get('user-agent') || undefined;
            
            // Send Discord webhook notification with full geolocation data
            sendBlockedAccessAlert({
                endpoint: endpoint || 'Unknown',
                ipAddress: geoData?.ip,
                ipCountry,
                countryName: geoData?.country_name,
                city: geoData?.city,
                isp: geoData?.isp,
                pilotId: additionalData?.pilotId,
                email: additionalData?.email,
                timestamp: new Date().toISOString(),
                userAgent,
                suspectedVpn: false
            }).catch(err => console.error('[Webhook] Failed to send:', err));
        }
        
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

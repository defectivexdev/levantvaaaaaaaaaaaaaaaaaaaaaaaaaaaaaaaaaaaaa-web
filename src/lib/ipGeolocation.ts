import { NextRequest } from 'next/server';

export interface IpGeolocationData {
    ip: string;
    country_code: string;
    country_name: string;
    city?: string;
    region?: string;
    isp?: string;
}

/**
 * Get IP address from request headers
 */
export function getIpAddress(request: NextRequest): string {
    // Try various headers in order of preference
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, get the first one
        return forwardedFor.split(',')[0].trim();
    }
    
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }
    
    return 'Unknown';
}

/**
 * Get geolocation data for an IP address using ip-api.com (free, no API key required)
 * Rate limit: 45 requests per minute
 */
export async function getIpGeolocation(ip: string): Promise<IpGeolocationData | null> {
    try {
        if (!ip || ip === 'Unknown' || ip === '127.0.0.1' || ip === 'localhost') {
            return null;
        }

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,isp`, {
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
            console.error('[IP Geolocation] API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.status === 'fail') {
            console.error('[IP Geolocation] Failed:', data.message);
            return null;
        }

        return {
            ip,
            country_code: data.countryCode || 'Unknown',
            country_name: data.country || 'Unknown',
            city: data.city,
            region: data.regionName,
            isp: data.isp
        };
    } catch (error) {
        console.error('[IP Geolocation] Error fetching data:', error);
        return null;
    }
}

/**
 * Get comprehensive IP and geolocation data from request
 */
export async function getRequestGeolocation(request: NextRequest): Promise<IpGeolocationData | null> {
    const ip = getIpAddress(request);
    
    if (!ip || ip === 'Unknown') {
        // Fallback to headers if IP extraction failed (Vercel provides x-vercel-ip-country)
        const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
        if (ipCountryHeader) {
            return {
                ip: 'Unknown',
                country_code: ipCountryHeader.toUpperCase(),
                country_name: ipCountryHeader.toUpperCase() // Will be replaced by API call if IP is available
            };
        }
        return null;
    }
    
    // Fetch full geolocation data from API
    const geoData = await getIpGeolocation(ip);
    
    // If API call fails, fallback to headers (Vercel provides x-vercel-ip-country)
    if (!geoData) {
        const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
        if (ipCountryHeader) {
            return {
                ip,
                country_code: ipCountryHeader.toUpperCase(),
                country_name: ipCountryHeader.toUpperCase()
            };
        }
    }
    
    return geoData;
}

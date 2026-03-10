import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import CountryBlacklist from '@/models/CountryBlacklist';

export const dynamic = 'force-dynamic';

/**
 * Public API endpoint to check if an IP or country is blacklisted
 * Can be used by external websites to sync blacklist
 * 
 * Usage:
 * GET /api/public/blacklist/check?ip=123.45.67.89
 * GET /api/public/blacklist/check?country=US
 * GET /api/public/blacklist/check?ip=123.45.67.89&country=US
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const ip = searchParams.get('ip');
        const country = searchParams.get('country');
        const apiKey = searchParams.get('api_key') || request.headers.get('x-api-key');

        // Simple API key validation (optional - you can make this required)
        const validApiKey = process.env.BLACKLIST_API_KEY || 'levant-va-blacklist-2026';
        if (apiKey && apiKey !== validApiKey) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        if (!ip && !country) {
            return NextResponse.json({ 
                error: 'Either ip or country parameter is required' 
            }, { status: 400 });
        }

        let countryCode = country?.toUpperCase();

        // If IP is provided, try to get country from geolocation
        if (ip && !countryCode) {
            try {
                const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
                    signal: AbortSignal.timeout(3000)
                });
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    countryCode = geoData.countryCode;
                }
            } catch (error) {
                console.error('[Blacklist Check] Geolocation error:', error);
            }
        }

        if (!countryCode) {
            return NextResponse.json({ 
                blacklisted: false,
                message: 'Could not determine country'
            });
        }

        // Check if country is blacklisted
        const blacklisted = await CountryBlacklist.findOne({ country_code: countryCode });

        return NextResponse.json({
            blacklisted: !!blacklisted,
            country_code: countryCode,
            country_name: blacklisted?.country_name || null,
            reason: blacklisted?.reason || null,
            added_at: blacklisted?.created_at || null
        });

    } catch (error: any) {
        console.error('[Blacklist Check] Error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            blacklisted: false // Fail open
        }, { status: 500 });
    }
}

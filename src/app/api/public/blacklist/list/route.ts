import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import CountryBlacklist from '@/models/CountryBlacklist';

export const dynamic = 'force-dynamic';

/**
 * Public API endpoint to get full blacklist
 * Can be used by external websites to sync entire blacklist
 * 
 * Usage:
 * GET /api/public/blacklist/list
 * GET /api/public/blacklist/list?api_key=your-key
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('api_key') || request.headers.get('x-api-key');

        // Simple API key validation (optional)
        const validApiKey = process.env.BLACKLIST_API_KEY || 'levant-va-blacklist-2026';
        if (apiKey && apiKey !== validApiKey) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        // Get all blacklisted countries
        const blacklist = await CountryBlacklist.find().select('country_code country_name reason created_at').sort({ created_at: -1 });

        return NextResponse.json({
            success: true,
            count: blacklist.length,
            blacklist: blacklist.map(entry => ({
                country_code: entry.country_code,
                country_name: entry.country_name || null,
                reason: entry.reason || null,
                added_at: entry.created_at
            })),
            last_updated: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[Blacklist List] Error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            blacklist: []
        }, { status: 500 });
    }
}

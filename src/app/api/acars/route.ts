import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';
import ActiveFlight from '@/models/ActiveFlight';
import { corsHeaders } from '@/lib/acars/helpers';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// GET — status page (browser) or traffic/pilot-stats queries (ACARS client)
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'traffic') {
            const { POST: trafficHandler } = await import('@/app/api/acars/traffic/route');
            return trafficHandler(request);
        }

        if (action === 'pilot-stats') {
            const { GET: statsHandler } = await import('@/app/api/acars/pilot-stats/route');
            return statsHandler(request);
        }

        // Status page (redirect to the new beautiful docs page)
        return NextResponse.redirect(new URL('/developer/acars', request.url));
    } catch (error: any) {
        console.error('ACARS error [GET]:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500, headers: corsHeaders() });
    }
}

// POST — forward to dedicated action route
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { action } = body;

        const req = new Request(request.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        let res: Response;
        switch (action) {
            case 'auth':
                res = await (await import('@/app/api/acars/auth/route')).POST(req as any); break;
            case 'bid':
            case 'book':
            case 'cancel-bid':
                res = await (await import('@/app/api/acars/bid/route')).POST(req as any); break;
            case 'start':
                res = await (await import('@/app/api/acars/start/route')).POST(req as any); break;
            case 'position':
                res = await (await import('@/app/api/acars/position/route')).POST(req as any); break;
            case 'pirep':
                res = await (await import('@/app/api/acars/pirep/route')).POST(req as any); break;
            case 'end':
                res = await (await import('@/app/api/acars/end/route')).POST(req as any); break;
            case 'aircraft-health':
                res = await (await import('@/app/api/acars/aircraft-health/route')).POST(req as any); break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders() });
        }

        Object.entries(corsHeaders()).forEach(([k, v]) => res.headers.set(k, v));
        return res;
    } catch (error: any) {
        console.error('ACARS error [POST]:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500, headers: corsHeaders() });
    }
}

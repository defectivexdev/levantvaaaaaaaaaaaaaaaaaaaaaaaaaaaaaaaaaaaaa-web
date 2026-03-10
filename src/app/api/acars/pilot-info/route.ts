import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { PilotModel } from '@/models';
import { corsHeaders } from '@/lib/acars/helpers';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
    try {
        const { pilotId } = await request.json();
        
        console.log(`[PilotInfo] Fetching info for pilot:`, pilotId);
        
        if (!pilotId) {
            return NextResponse.json({ error: 'Pilot ID required' }, { status: 400, headers: corsHeaders() });
        }

        await connectDB();
        const pilot = await PilotModel.findOne({ pilot_id: pilotId })
            .select('simbrief_id hoppie_code sim_mode')
            .lean();

        if (!pilot) {
            console.error(`[PilotInfo] Pilot not found: ${pilotId}`);
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404, headers: corsHeaders() });
        }
        
        console.log(`[PilotInfo] Found pilot ${pilotId} with SimBrief ID:`, pilot.simbrief_id || 'NOT SET');
        console.log(`[PilotInfo] Full pilot data:`, JSON.stringify(pilot));

        return NextResponse.json({ 
            simbriefId: pilot.simbrief_id || null,
            hoppieCode: pilot.hoppie_code || null,
            simMode: pilot.sim_mode || 'fsuipc'
        }, { headers: corsHeaders() });
    } catch (error: any) {
        console.error('[PilotInfo] Fetch error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch pilot info',
            details: error.message 
        }, { status: 500, headers: corsHeaders() });
    }
}

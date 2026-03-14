import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { findPilot, corsHeaders } from '@/lib/acars/helpers';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const { pilotId } = await request.json();
        
        if (!pilotId) {
            return NextResponse.json({ error: 'Missing pilot ID' }, { status: 400, headers: corsHeaders() });
        }

        const pilot = await findPilot(pilotId);
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404, headers: corsHeaders() });
        }

        return NextResponse.json({
            success: true,
            pilot: {
                id: pilot.id.toString(),
                pilotId: pilot.pilot_id,
                name: `${pilot.first_name} ${pilot.last_name}`,
                rank: pilot.rank,
                totalHours: pilot.total_hours,
                xp: pilot.xp || 0,
                avatarUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'dxvfbxnfx'}/image/upload/c_fill,w_200,h_200,f_auto,q_auto/levant-va/pilots/pilot_${pilot.pilot_id}`,
                hoppieCode: pilot.hoppie_code || '',
                simbriefId: pilot.simbrief_id || '',
                weightUnit: pilot.weight_unit || 'lbs'
            }
        }, { headers: corsHeaders() });
    } catch (error: any) {
        console.error('[ACARS Profile]', error);
        return NextResponse.json({ error: 'Profile fetch failed', details: error.message }, { status: 500, headers: corsHeaders() });
    }
}

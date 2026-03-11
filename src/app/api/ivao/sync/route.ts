import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Pilot, IVAOVerification } from '@/models';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
        const { payload } = await jwtVerify(token, secret);
        const pilotId = payload.pilotId as string;
        
        if (!pilotId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await connectDB();

        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot || !pilot.ivao_vid) {
            return NextResponse.json({ error: 'IVAO account not linked' }, { status: 400 });
        }

        const ivaoApiUrl = `https://api.ivao.aero/v2/users/${pilot.ivao_vid}`;
        const response = await fetch(ivaoApiUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to sync IVAO data' }, { status: 400 });
        }

        const ivaoData = await response.json();

        const atcRating = ivaoData.rating?.atcRating?.id || 1;
        const pilotRating = ivaoData.rating?.pilotRating?.id || 2;
        const division = ivaoData.divisionId || '';

        pilot.ivao_atc_rating = atcRating;
        pilot.ivao_pilot_rating = pilotRating;
        await pilot.save();

        const verification = await IVAOVerification.findOne({ pilot_id: pilot.pilot_id });
        if (verification) {
            verification.atc_rating = atcRating;
            verification.pilot_rating = pilotRating;
            verification.division = division;
            verification.last_sync = new Date();
            verification.discord_roles_assigned = false;
            await verification.save();
        }

        return NextResponse.json({
            success: true,
            message: 'IVAO data synced successfully',
            data: {
                atc_rating: atcRating,
                pilot_rating: pilotRating,
                division,
            },
        });
    } catch (error) {
        console.error('IVAO sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        const { ivao_vid } = await req.json();

        if (!ivao_vid) {
            return NextResponse.json({ error: 'IVAO VID is required' }, { status: 400 });
        }

        await connectDB();

        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const ivaoApiUrl = `https://api.ivao.aero/v2/users/${ivao_vid}`;
        const response = await fetch(ivaoApiUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch IVAO data. Please check your VID.' }, { status: 400 });
        }

        const ivaoData = await response.json();

        const atcRating = ivaoData.rating?.atcRating?.id || 1;
        const pilotRating = ivaoData.rating?.pilotRating?.id || 2;
        const division = ivaoData.divisionId || '';

        pilot.ivao_vid = ivao_vid;
        pilot.ivao_atc_rating = atcRating;
        pilot.ivao_pilot_rating = pilotRating;
        pilot.ivao_verified = true;
        await pilot.save();

        const existingVerification = await IVAOVerification.findOne({ pilot_id: pilot.pilot_id });
        
        if (existingVerification) {
            existingVerification.ivao_vid = ivao_vid;
            existingVerification.atc_rating = atcRating;
            existingVerification.pilot_rating = pilotRating;
            existingVerification.division = division;
            existingVerification.last_sync = new Date();
            existingVerification.discord_roles_assigned = false;
            await existingVerification.save();
        } else {
            await IVAOVerification.create({
                pilot_id: pilot.pilot_id,
                ivao_vid,
                atc_rating: atcRating,
                pilot_rating: pilotRating,
                division,
                verified_at: new Date(),
                last_sync: new Date(),
                discord_roles_assigned: false,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'IVAO account verified successfully',
            data: {
                ivao_vid,
                atc_rating: atcRating,
                pilot_rating: pilotRating,
                division,
            },
        });
    } catch (error) {
        console.error('IVAO verification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
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
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const verification = await IVAOVerification.findOne({ pilot_id: pilot.pilot_id });

        return NextResponse.json({
            verified: pilot.ivao_verified || false,
            ivao_vid: pilot.ivao_vid || null,
            atc_rating: pilot.ivao_atc_rating || null,
            pilot_rating: pilot.ivao_pilot_rating || null,
            discord_roles_assigned: verification?.discord_roles_assigned || false,
            last_sync: verification?.last_sync || null,
        });
    } catch (error) {
        console.error('IVAO verification status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

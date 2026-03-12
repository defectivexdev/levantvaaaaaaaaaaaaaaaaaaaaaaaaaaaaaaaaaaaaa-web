import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Pilot, VATSIMVerification } from '@/models';
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

        const { vatsim_cid } = await req.json();

        if (!vatsim_cid) {
            return NextResponse.json({ error: 'VATSIM CID is required' }, { status: 400 });
        }

        await connectDB();

        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        // Fetch VATSIM member data
        const vatsimApiUrl = `https://api.vatsim.net/v2/members/${vatsim_cid}`;
        const response = await fetch(vatsimApiUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch VATSIM data. Please check your CID.' }, { status: 400 });
        }

        const vatsimData = await response.json();

        // Fetch VATSIM stats
        const statsUrl = `https://api.vatsim.net/v2/members/${vatsim_cid}/stats`;
        let statsData = null;
        try {
            const statsResponse = await fetch(statsUrl);
            if (statsResponse.ok) {
                statsData = await statsResponse.json();
            }
        } catch (error) {
            console.log('Stats fetch failed, continuing without stats');
        }

        const rating = vatsimData.rating || 1;
        const pilotrating = vatsimData.pilotrating || 0;
        const division = vatsimData.division?.id || '';
        const region = vatsimData.region?.id || '';
        const subdivision = vatsimData.subdivision?.id || '';

        // Update pilot record
        pilot.vatsim_cid = vatsim_cid;
        pilot.vatsim_rating = rating;
        pilot.vatsim_pilotrating = pilotrating;
        pilot.vatsim_verified = true;
        await pilot.save();

        // Update or create VATSIM verification record
        const existingVerification = await VATSIMVerification.findOne({ pilot_id: pilot.pilot_id });
        
        if (existingVerification) {
            existingVerification.vatsim_cid = vatsim_cid;
            existingVerification.rating = rating;
            existingVerification.pilotrating = pilotrating;
            existingVerification.division = division;
            existingVerification.region = region;
            existingVerification.subdivision = subdivision;
            existingVerification.last_sync = new Date();
            existingVerification.discord_roles_assigned = false;
            await existingVerification.save();
        } else {
            await VATSIMVerification.create({
                pilot_id: pilot.pilot_id,
                vatsim_cid,
                rating,
                pilotrating,
                division,
                region,
                subdivision,
                verified_at: new Date(),
                last_sync: new Date(),
                discord_roles_assigned: false,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'VATSIM account verified successfully',
            data: {
                vatsim_cid,
                rating,
                pilotrating,
                division,
                region,
                subdivision,
            },
        });
    } catch (error) {
        console.error('VATSIM verification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('lva_session')?.value;
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

        const verification = await VATSIMVerification.findOne({ pilot_id: pilot.pilot_id });

        return NextResponse.json({
            verified: pilot.vatsim_verified || false,
            vatsim_cid: pilot.vatsim_cid || null,
            rating: pilot.vatsim_rating || null,
            pilotrating: pilot.vatsim_pilotrating || null,
            discord_roles_assigned: verification?.discord_roles_assigned || false,
            last_sync: verification?.last_sync || null,
        });
    } catch (error) {
        console.error('VATSIM verification status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

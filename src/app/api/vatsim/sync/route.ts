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

        await connectDB();

        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        if (!pilot.vatsim_cid) {
            return NextResponse.json({ error: 'No VATSIM CID linked to this account' }, { status: 400 });
        }

        // Fetch VATSIM member data
        const vatsimApiUrl = `https://api.vatsim.net/v2/members/${pilot.vatsim_cid}`;
        const response = await fetch(vatsimApiUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch VATSIM data' }, { status: 400 });
        }

        const vatsimData = await response.json();

        const rating = vatsimData.rating || 1;
        const pilotrating = vatsimData.pilotrating || 0;
        const division = vatsimData.division?.id || '';
        const region = vatsimData.region?.id || '';
        const subdivision = vatsimData.subdivision?.id || '';

        // Update pilot record
        pilot.vatsim_rating = rating;
        pilot.vatsim_pilotrating = pilotrating;
        await pilot.save();

        // Update verification record
        const verification = await VATSIMVerification.findOne({ pilot_id: pilot.pilot_id });
        if (verification) {
            verification.rating = rating;
            verification.pilotrating = pilotrating;
            verification.division = division;
            verification.region = region;
            verification.subdivision = subdivision;
            verification.last_sync = new Date();
            await verification.save();
        }

        return NextResponse.json({
            success: true,
            message: 'VATSIM data synced successfully',
            data: {
                rating,
                pilotrating,
                division,
                region,
                subdivision,
            },
        });
    } catch (error) {
        console.error('VATSIM sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

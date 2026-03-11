import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Pilot, IVAOVerification } from '@/models';

export const dynamic = 'force-dynamic';

// POST - Sync user's IVAO profile and update ratings
export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
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

        const vid = pilot.ivao_vid;

        try {
            // Fetch user profile from IVAO API v2
            const profileResponse = await fetch(`https://api.ivao.aero/v2/users/${vid}`, {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store',
            });

            if (!profileResponse.ok) {
                throw new Error(`IVAO API returned ${profileResponse.status}`);
            }

            const profileData = await profileResponse.json();

            // Extract ATC hours if available
            let atcHours = 0;
            if (profileData.atcHours !== undefined) {
                atcHours = parseFloat(profileData.atcHours) || 0;
            } else if (profileData.statistics?.atcHours !== undefined) {
                atcHours = parseFloat(profileData.statistics.atcHours) || 0;
            } else if (profileData.hours?.atc?.total !== undefined) {
                atcHours = parseFloat(profileData.hours.atc.total) || 0;
            }

            // Extract pilot hours
            let pilotHours = 0;
            if (profileData.pilotHours !== undefined) {
                pilotHours = parseFloat(profileData.pilotHours) || 0;
            } else if (profileData.statistics?.pilotHours !== undefined) {
                pilotHours = parseFloat(profileData.statistics.pilotHours) || 0;
            } else if (profileData.hours?.pilot?.total !== undefined) {
                pilotHours = parseFloat(profileData.hours.pilot.total) || 0;
            }

            // Update ratings
            const atcRating = profileData.rating?.atcRating?.id || pilot.ivao_atc_rating || 1;
            const pilotRating = profileData.rating?.pilotRating?.id || pilot.ivao_pilot_rating || 2;

            // Update division
            const division = profileData.divisionId || profileData.division?.id || '';

            // Update pilot record
            pilot.ivao_atc_rating = atcRating;
            pilot.ivao_pilot_rating = pilotRating;
            pilot.ivao_last_sync = new Date();
            await pilot.save();

            // Update IVAO verification record
            const verification = await IVAOVerification.findOne({ pilot_id: pilotId });
            if (verification) {
                verification.atc_rating = atcRating;
                verification.pilot_rating = pilotRating;
                verification.division = division;
                verification.last_sync = new Date();
                await verification.save();
            }

            return NextResponse.json({
                success: true,
                data: {
                    vid,
                    atcRating,
                    pilotRating,
                    atcHours,
                    pilotHours,
                    division,
                    lastSync: new Date().toISOString(),
                },
            });
        } catch (apiError: any) {
            console.error('IVAO API error:', apiError.message);
            return NextResponse.json(
                { error: 'Failed to sync with IVAO API. Please try again later.' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json(
            { error: 'Failed to sync IVAO data' },
            { status: 500 }
        );
    }
}

// GET - Get user's IVAO sync status
export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
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

        const verification = await IVAOVerification.findOne({ pilot_id: pilotId });

        return NextResponse.json({
            vid: pilot.ivao_vid,
            atcRating: pilot.ivao_atc_rating,
            pilotRating: pilot.ivao_pilot_rating,
            lastSync: pilot.ivao_last_sync,
            verified: pilot.ivao_verified,
            division: verification?.division,
        });
    } catch (error: any) {
        console.error('Error fetching IVAO sync status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch IVAO sync status' },
            { status: 500 }
        );
    }
}

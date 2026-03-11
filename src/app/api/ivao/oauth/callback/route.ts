import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Pilot, IVAOVerification } from '@/models';

const IVAO_API_URL = 'https://api.ivao.aero/v2';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?error=invalid_request`);
        }

        const pilotId = Buffer.from(state, 'base64').toString('utf-8');

        // Exchange code for access token
        const tokenResponse = await fetch(`${IVAO_API_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.IVAO_CLIENT_ID!,
                client_secret: process.env.IVAO_CLIENT_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.BASE_URL}/api/ivao/oauth/callback`,
            }),
        });

        if (!tokenResponse.ok) {
            console.error('IVAO token exchange failed:', await tokenResponse.text());
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user data from IVAO
        const userResponse = await fetch(`${IVAO_API_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            console.error('Failed to fetch IVAO user:', await userResponse.text());
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?error=user_fetch_failed`);
        }

        const ivaoData = await userResponse.json();

        await connectDB();

        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?error=pilot_not_found`);
        }

        const ivaoVid = ivaoData.id?.toString() || '';
        const atcRating = ivaoData.rating?.atcRating?.id || 1;
        const pilotRating = ivaoData.rating?.pilotRating?.id || 2;
        const division = ivaoData.divisionId || '';

        // Update pilot with IVAO data
        pilot.ivao_vid = ivaoVid;
        pilot.ivao_atc_rating = atcRating;
        pilot.ivao_pilot_rating = pilotRating;
        pilot.ivao_verified = true;
        await pilot.save();

        // Update or create IVAO verification record
        const existingVerification = await IVAOVerification.findOne({ pilot_id: pilot.pilot_id });
        
        if (existingVerification) {
            existingVerification.ivao_vid = ivaoVid;
            existingVerification.atc_rating = atcRating;
            existingVerification.pilot_rating = pilotRating;
            existingVerification.division = division;
            existingVerification.last_sync = new Date();
            existingVerification.discord_roles_assigned = false;
            await existingVerification.save();
        } else {
            await IVAOVerification.create({
                pilot_id: pilot.pilot_id,
                ivao_vid: ivaoVid,
                atc_rating: atcRating,
                pilot_rating: pilotRating,
                division,
                verified_at: new Date(),
                last_sync: new Date(),
                discord_roles_assigned: false,
            });
        }

        return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?ivao_verified=success`);
    } catch (error) {
        console.error('IVAO OAuth callback error:', error);
        return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?error=server_error`);
    }
}

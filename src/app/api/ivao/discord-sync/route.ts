import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { IVAOVerification } from '@/models';

export async function POST(req: NextRequest) {
    try {
        const { secret, pilot_id } = await req.json();

        if (secret !== process.env.DISCORD_BOT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const verification = await IVAOVerification.findOne({ pilot_id });
        if (!verification) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        return NextResponse.json({
            pilot_id: verification.pilot_id,
            ivao_vid: verification.ivao_vid,
            atc_rating: verification.atc_rating,
            pilot_rating: verification.pilot_rating,
            discord_roles_assigned: verification.discord_roles_assigned,
        });
    } catch (error) {
        console.error('Discord sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { secret, pilot_id, discord_roles_assigned } = await req.json();

        if (secret !== process.env.DISCORD_BOT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const verification = await IVAOVerification.findOne({ pilot_id });
        if (!verification) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
        }

        verification.discord_roles_assigned = discord_roles_assigned;
        await verification.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Discord sync update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

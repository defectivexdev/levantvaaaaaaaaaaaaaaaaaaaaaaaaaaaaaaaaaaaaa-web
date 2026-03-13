import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getPilotRankInfo, getTierByHours, getTierBadge, getTierName } from '@/services/rankService';
import Pilot from '@/models/Pilot';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        if (!decoded?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const pilot = await Pilot.findById(decoded.id);
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const rankInfo = await getPilotRankInfo(decoded.id);
        if (!rankInfo) {
            return NextResponse.json({ error: 'Failed to get rank info' }, { status: 500 });
        }

        const tier = getTierByHours(rankInfo.totalHours);

        return NextResponse.json({
            currentRank: rankInfo.currentRank,
            nextRank: rankInfo.nextRank,
            totalHours: rankInfo.totalHours,
            progress: rankInfo.progress,
            hoursToNext: rankInfo.hoursToNext,
            tier: {
                level: tier,
                badge: getTierBadge(tier),
                name: getTierName(tier)
            }
        });
    } catch (error) {
        console.error('Error fetching rank info:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

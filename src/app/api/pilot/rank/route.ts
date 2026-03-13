import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getPilotRankInfo, getTierByHours, getTierBadge, getTierName } from '@/services/rankService';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await verifyAuth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const rankInfo = await getPilotRankInfo(session.id);
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

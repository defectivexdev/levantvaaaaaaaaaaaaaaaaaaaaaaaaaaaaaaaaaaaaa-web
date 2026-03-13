import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getPilotRankInfo, getTierByHours, getTierBadge, getTierName } from '@/services/rankService';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('lva_session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
        const { payload } = await jwtVerify(token, secret);

        if (!payload.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const rankInfo = await getPilotRankInfo(payload.id as string);
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

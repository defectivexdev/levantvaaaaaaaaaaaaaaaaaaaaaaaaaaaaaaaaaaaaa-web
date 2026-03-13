import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getPilotBadges, getBadgeProgress, checkAndAwardBadges } from '@/services/badgeService';
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

        // Check and award any missing badges first (e.g. from transferred hours or retroactive badges)
        await checkAndAwardBadges(payload.id as string);

        const { searchParams } = new URL(request.url);
        const includeProgress = searchParams.get('progress') === 'true';

        if (includeProgress) {
            const progress = await getBadgeProgress(payload.id as string);
            return NextResponse.json({ badges: progress });
        }

        const badges = await getPilotBadges(payload.id as string);
        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

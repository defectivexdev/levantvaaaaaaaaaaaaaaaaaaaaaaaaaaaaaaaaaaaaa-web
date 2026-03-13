import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getPilotBadges, getBadgeProgress } from '@/services/badgeService';
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

        const { searchParams } = new URL(request.url);
        const includeProgress = searchParams.get('progress') === 'true';

        if (includeProgress) {
            const progress = await getBadgeProgress(decoded.id);
            return NextResponse.json({ badges: progress });
        }

        const badges = await getPilotBadges(decoded.id);
        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

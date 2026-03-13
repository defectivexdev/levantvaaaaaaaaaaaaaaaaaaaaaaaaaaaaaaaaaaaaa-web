import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { BADGE_DEFINITIONS } from '@/config/badges';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const tier = searchParams.get('tier');

        let badges = BADGE_DEFINITIONS;

        if (category) {
            badges = badges.filter(b => b.category === category);
        }

        if (tier) {
            badges = badges.filter(b => b.tier === tier);
        }

        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Error fetching badge definitions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

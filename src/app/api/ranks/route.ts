import { NextResponse } from 'next/server';
import { PILOT_RANKS } from '@/config/ranks';

// GET /api/ranks - Return all ranks defined in the system
export async function GET() {
    try {
        return NextResponse.json(PILOT_RANKS);
    } catch (error) {
        console.error('Error fetching ranks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ranks' },
            { status: 500 }
        );
    }
}

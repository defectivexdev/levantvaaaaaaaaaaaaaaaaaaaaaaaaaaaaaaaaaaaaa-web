import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Bid from '@/models/Bid';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const result = await Bid.deleteMany({});

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Successfully deleted ${result.deletedCount} bids`,
        });
    } catch (error: any) {
        console.error('[Clear Bids] Error:', error);
        return NextResponse.json(
            { error: 'Failed to clear bids', details: error.message },
            { status: 500 }
        );
    }
}

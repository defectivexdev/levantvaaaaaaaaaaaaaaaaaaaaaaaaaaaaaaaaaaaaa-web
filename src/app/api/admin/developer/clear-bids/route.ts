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

        // Only delete bids that are not in progress
        // Delete: Completed, Cancelled, or expired Active bids
        const result = await Bid.deleteMany({
            $or: [
                { status: 'Completed' },
                { status: 'Cancelled' },
                { status: 'Active', expires_at: { $lt: new Date() } }
            ]
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Successfully deleted ${result.deletedCount} inactive bids`,
        });
    } catch (error: any) {
        console.error('[Clear Bids] Error:', error);
        return NextResponse.json(
            { error: 'Failed to clear bids', details: error.message },
            { status: 500 }
        );
    }
}

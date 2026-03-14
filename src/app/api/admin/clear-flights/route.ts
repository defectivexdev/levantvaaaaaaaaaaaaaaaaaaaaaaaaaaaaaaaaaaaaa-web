import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { ActiveFlightModel } from '@/models';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || authResult.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Delete ALL active flights (clears test/mock data)
        const result = await ActiveFlightModel.deleteMany({});

        return NextResponse.json({ 
            success: true, 
            message: `Cleared ${result.deletedCount} active flights`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error clearing flights:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

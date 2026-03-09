import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import DownloadLog from '@/models/DownloadLog';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();

        const result = await DownloadLog.deleteMany({});

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Successfully deleted ${result.deletedCount} download logs`,
        });
    } catch (error: any) {
        console.error('[Clear Download Logs] Error:', error);
        return NextResponse.json(
            { error: 'Failed to clear download logs', details: error.message },
            { status: 500 }
        );
    }
}

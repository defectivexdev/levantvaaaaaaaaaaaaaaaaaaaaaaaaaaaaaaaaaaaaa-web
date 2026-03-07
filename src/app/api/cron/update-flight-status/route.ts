import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import MultiplayerEvent from '@/models/MultiplayerEvent';

// This endpoint can be called by a cron job to automatically update flight statuses
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const now = new Date();

        // Find all scheduled events that have started (startTime <= now)
        const eventsToActivate = await MultiplayerEvent.find({
            status: 'scheduled',
            startTime: { $lte: now }
        });

        // Update them to active
        const updatePromises = eventsToActivate.map(event => {
            event.status = 'active';
            return event.save();
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ 
            success: true,
            message: `Updated ${eventsToActivate.length} events to active status`,
            count: eventsToActivate.length
        });
    } catch (error: any) {
        console.error('Auto-update status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

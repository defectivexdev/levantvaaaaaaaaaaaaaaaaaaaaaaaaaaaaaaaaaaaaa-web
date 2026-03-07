import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import MultiplayerEvent from '@/models/MultiplayerEvent';

export async function PATCH(request: NextRequest) {
    const session = await verifyAuth();
    if (!session?.isAdmin && session?.role !== 'Groupflight') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();

        const { eventId, status } = await request.json();

        if (!eventId || !status) {
            return NextResponse.json({ error: 'Missing eventId or status' }, { status: 400 });
        }

        const validStatuses = ['scheduled', 'active', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const event = await MultiplayerEvent.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Update status
        event.status = status;
        await event.save();

        return NextResponse.json({ 
            success: true, 
            message: `Event status updated to ${status}`,
            event 
        });
    } catch (error: any) {
        console.error('Update status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

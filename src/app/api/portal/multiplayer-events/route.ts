import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import MultiplayerEvent from '@/models/MultiplayerEvent';

// GET - List public multiplayer events for pilots
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const now = new Date();

        // Auto-transition scheduled events to active if start time has passed
        await MultiplayerEvent.updateMany(
            {
                status: 'scheduled',
                startTime: { $lte: now }
            },
            {
                $set: { status: 'active' }
            }
        );

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'upcoming';

        let query: any = { isPublic: true };

        switch (filter) {
            case 'upcoming':
                query.status = 'scheduled';
                query.startTime = { $gte: now };
                break;
            case 'active':
                query.status = 'active';
                break;
            case 'completed':
                query.status = 'completed';
                break;
            case 'all':
                // No additional filter
                break;
        }

        const events = await MultiplayerEvent.find(query)
            .sort({ startTime: filter === 'completed' ? -1 : 1 })
            .select('-discordWebhook -createdBy')
            .lean();

        return NextResponse.json({ success: true, events });
    } catch (error: any) {
        console.error('Get public events error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Join an event
export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();

        const { eventId } = await request.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        const event = await MultiplayerEvent.findById(eventId);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check if event is full
        if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
            return NextResponse.json({ error: 'Event is full' }, { status: 400 });
        }

        // Check if already joined
        const alreadyJoined = event.participants.some((p: any) => p.pilotId === session.pilotId);
        if (alreadyJoined) {
            return NextResponse.json({ error: 'Already joined this event' }, { status: 400 });
        }

        // Check if event has started
        if (event.status !== 'scheduled') {
            return NextResponse.json({ error: 'Cannot join event that has already started' }, { status: 400 });
        }

        // Add participant
        event.participants.push({
            pilotId: session.pilotId,
            pilotName: (session as any).pilotName || session.pilotId,
            joinedAt: new Date(),
            status: 'registered',
        } as any);

        await event.save();

        return NextResponse.json({ 
            success: true,
            message: 'Successfully joined the event!',
            event 
        });
    } catch (error: any) {
        console.error('Join event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Leave an event
export async function DELETE(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        const event = await MultiplayerEvent.findById(eventId);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check if event has started
        if (event.status !== 'scheduled') {
            return NextResponse.json({ error: 'Cannot leave event that has already started' }, { status: 400 });
        }

        // Remove participant
        event.participants = event.participants.filter((p: any) => p.pilotId !== session.pilotId);
        await event.save();

        return NextResponse.json({ 
            success: true,
            message: 'Successfully left the event' 
        });
    } catch (error: any) {
        console.error('Leave event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

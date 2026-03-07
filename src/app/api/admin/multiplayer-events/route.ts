import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import MultiplayerEvent from '@/models/MultiplayerEvent';
import { sendGroupFlightAnnouncement } from '@/lib/discord';

// GET - List all multiplayer events (admin view)
export async function GET(request: NextRequest) {
    const session = await verifyAuth();
    if (!session?.isAdmin && session?.role !== 'Groupflight') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
        const status = searchParams.get('status');

        const query = status ? { status } : {};
        const events = await MultiplayerEvent.find(query)
            .sort({ startTime: -1 })
            .lean();

        return NextResponse.json({ success: true, events });
    } catch (error: any) {
        console.error('Get multiplayer events error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new multiplayer event
export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session?.isAdmin && session?.role !== 'Groupflight') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();

        const data = await request.json();

        // Validate required fields
        if (!data.title || !data.departureIcao || !data.arrivalIcao || !data.startTime) {
            return NextResponse.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        // Create event
        const event = await MultiplayerEvent.create({
            ...data,
            createdBy: session.pilotId,
            participants: [],
            leaderboard: [],
        });

        // Send Discord announcement for group flights
        if (data.eventType === 'group_flight') {
            try {
                await sendGroupFlightAnnouncement(event);
            } catch (error) {
                console.error('Failed to send Discord announcement:', error);
                // Don't fail the request if Discord webhook fails
            }
        }

        return NextResponse.json({ 
            success: true, 
            event,
            message: 'Multiplayer event created successfully' 
        });
    } catch (error: any) {
        console.error('Create multiplayer event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update multiplayer event
export async function PUT(request: NextRequest) {
    const session = await verifyAuth();
    if (!session?.isAdmin && session?.role !== 'Groupflight') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();

        const { eventId, ...updates } = await request.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        const event = await MultiplayerEvent.findByIdAndUpdate(
            eventId,
            { $set: updates },
            { new: true }
        );

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            event,
            message: 'Event updated successfully' 
        });
    } catch (error: any) {
        console.error('Update multiplayer event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete multiplayer event
export async function DELETE(request: NextRequest) {
    const session = await verifyAuth();
    if (!session?.isAdmin && session?.role !== 'Groupflight') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        const event = await MultiplayerEvent.findByIdAndDelete(eventId);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Event deleted successfully' 
        });
    } catch (error: any) {
        console.error('Delete multiplayer event error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

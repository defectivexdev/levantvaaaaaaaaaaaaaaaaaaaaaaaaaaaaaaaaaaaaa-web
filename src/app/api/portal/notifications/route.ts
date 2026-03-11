import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET — Fetch notifications for the logged-in pilot
export async function GET(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const unreadOnly = searchParams.get('unread') === 'true';

    const pilotQuery = {
        $or: [
            { pilot_id: session.pilotId },
            { pilot_id: new mongoose.Types.ObjectId(session.id) }
        ]
    };

    const filter: any = { ...pilotQuery };
    if (unreadOnly) filter.read = false;

    const [notifications, unreadCount] = await Promise.all([
        Notification.find(filter)
            .sort({ created_at: -1 })
            .limit(limit)
            .lean(),
        Notification.countDocuments({ ...pilotQuery, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
}

// PATCH — Mark notifications as read
export async function PATCH(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { ids, markAll } = body;

    const pilotQuery = {
        $or: [
            { pilot_id: session.pilotId },
            { pilot_id: session.id }
        ]
    };

    if (markAll) {
        await Notification.updateMany(
            { ...pilotQuery, read: false },
            { $set: { read: true } }
        );
    } else if (ids && Array.isArray(ids)) {
        await Notification.updateMany(
            { _id: { $in: ids }, ...pilotQuery },
            { $set: { read: true } }
        );
    }

    return NextResponse.json({ success: true });
}

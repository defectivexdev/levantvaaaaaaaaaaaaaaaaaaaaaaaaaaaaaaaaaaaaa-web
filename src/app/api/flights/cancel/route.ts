import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/database';
import Bid from '@/models/Bid';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('lva_session')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
        const { payload } = await jwtVerify(token, secret);

        const body = await request.json();
        const { bidId } = body;

        await connectDB();

        const userId = payload.id as string;
        const pilotIdString = payload.pilotId as string;
        
        let result;

        if (bidId) {
            // Cancel specific bid (verify ownership)
            const result = await Bid.updateOne(
                {
                    _id: bidId,
                    pilot_id: new mongoose.Types.ObjectId(userId)
                },
                { status: 'Cancelled' }
            );
        } else {
             // Cancel all active bids for this pilot
            const result = await Bid.updateMany(
                {
                    pilot_id: new mongoose.Types.ObjectId(userId),
                    status: 'Active'
                },
                {
                    $set: {
                        status: 'Cancelled',
                        cancelled_at: new Date(),
                        cancelled_by: userId
                    }
                }
            );
        }

        if (result) {
            return NextResponse.json({ success: true, message: 'Booking cancelled' });
        } else {
             return NextResponse.json({ success: true, message: 'No active booking found or already cancelled' });
        }

    } catch (error: any) {
        console.error('Cancel booking error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel booking' },
            { status: 500 }
        );
    }
}

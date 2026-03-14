import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import Bid from '@/models/Bid';
import { PilotModel } from '@/models';
import mongoose from 'mongoose';

function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}

// POST - Create a new flight bid
export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        await connectDB();

        const { 
            departure, 
            arrival, 
            aircraft, 
            callsign,
            route,
            estimated_flight_time,
            pax,
            cargo,
            simbrief_ofp_id,
            activity_id,
            client_version
        } = await request.json();

        // Require minimum client version 1.0.9 to place bids from web
        const minVersion = '1.0.9';
        if (!client_version || compareVersions(client_version, minVersion) < 0) {
            return NextResponse.json({ 
                error: `Please download and install Levant ACARS v${minVersion} or later to place bids. Web booking requires the latest desktop client.`,
                updateRequired: true,
                minVersion,
                downloadUrl: 'https://github.com/defectivexdev/levantvaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-web/releases/latest'
            }, { status: 426 });
        }

        if (!departure || !arrival || !aircraft) {
            return NextResponse.json(
                { error: 'Departure, arrival, and aircraft are required' },
                { status: 400 }
            );
        }

        // Get pilot info
        const pilot = await PilotModel.findById(session.id);
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        // Delete any existing active bids for this pilot
        await Bid.deleteMany(
            { pilot_id: session.id, status: 'Active' }
        );

        // Create new bid
        const bid = await Bid.create({
            pilot_id: session.id,
            pilot_name: `${pilot.first_name} ${pilot.last_name}`,
            callsign: callsign || pilot.pilot_id,
            departure_icao: departure.toUpperCase(),
            arrival_icao: arrival.toUpperCase(),
            aircraft_type: aircraft,
            route,
            estimated_flight_time,
            pax,
            cargo,
            simbrief_ofp_id,
            activity_id
        });

        return NextResponse.json({
            success: true,
            bid: {
                id: bid.id,
                callsign: bid.callsign,
                departure: bid.departure_icao,
                arrival: bid.arrival_icao,
                aircraft: bid.aircraft_type,
                expiresAt: bid.expires_at,
                route: bid.route,
                estimated_flight_time: bid.estimated_flight_time,
                pax: bid.pax,
                cargo: bid.cargo,
                simbrief_ofp_id: bid.simbrief_ofp_id,
                activity_id: bid.activity_id
            }
        });
    } catch (error: any) {
        console.error('Bid creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET - Get pilot's active bid
export async function GET() {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        await connectDB();

        // Delete any expired bids first
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() - 30);
        await Bid.deleteMany({
            pilot_id: new mongoose.Types.ObjectId(session.id),
            status: 'Active',
            created_at: { $lt: expiryTime }
        });

        const bid = await Bid.findOne({
            pilot_id: new mongoose.Types.ObjectId(session.id),
            status: { $in: ['Active', 'InProgress'] }
        })
            .sort({ created_at: -1 })
            .lean();

        if (!bid) {
            return NextResponse.json({ bid: null });
        }

        return NextResponse.json({
            bid: {
                id: bid.id,
                callsign: bid.callsign,
                departure: bid.departure_icao,
                arrival: bid.arrival_icao,
                aircraft: bid.aircraft_type,
                createdAt: bid.created_at,
                expiresAt: bid.expires_at,
                route: bid.route,
                estimated_flight_time: bid.estimated_flight_time,
                pax: bid.pax,
                cargo: bid.cargo,
                simbrief_ofp_id: bid.simbrief_ofp_id,
                activity_id: bid.activity_id
            }
        });
    } catch (error: any) {
        console.error('Get bid error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Cancel a bid
export async function DELETE(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const bidId = searchParams.get('id');

        if (bidId) {
            await Bid.deleteOne(
                { _id: bidId, pilot_id: session.id }
            );
        } else {
            // Delete all active bids
            await Bid.deleteMany(
                { pilot_id: session.id, status: 'Active' }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Cancel bid error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

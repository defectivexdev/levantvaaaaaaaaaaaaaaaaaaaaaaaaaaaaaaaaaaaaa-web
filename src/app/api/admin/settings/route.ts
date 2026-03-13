import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import GlobalConfig from '@/models/GlobalConfig';
import jwt from 'jsonwebtoken';
import Pilot from '@/models/Pilot';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const pilot = await Pilot.findById(decoded.id);
        
        if (!pilot || !pilot.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const config = await GlobalConfig.findOne({ key: 'LVT_MAIN' });

        if (!config) {
            return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
        }

        return NextResponse.json({ config });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const pilot = await Pilot.findById(decoded.id);
        
        if (!pilot || !pilot.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();

        const config = await GlobalConfig.findOneAndUpdate(
            { key: 'LVT_MAIN' },
            { 
                ...body,
                updated_at: new Date(),
                updated_by: pilot.pilot_id
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

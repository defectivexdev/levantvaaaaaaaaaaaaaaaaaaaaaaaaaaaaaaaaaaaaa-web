import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import AirlineFinance from '@/models/AirlineFinance';
import FinanceLog from '@/models/FinanceLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await verifyAuth();
    if (!session || !session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        // Ensure AirlineFinance exists
        let finance = await AirlineFinance.findOne();
        if (!finance) {
            finance = await AirlineFinance.create({ balance: 1000000 });
        }

        const query: any = {};
        
        // Exclude internal flight revenue split unless specifically requested
        const includeFlightDetails = searchParams.get('includeFlights') === 'true';
        if (!includeFlightDetails) {
            query.type = { $nin: ['Pilot Pay', 'Maintenance', 'Fuel Cost', 'Landing Fee'] };
        }

        const [logs, total] = await Promise.all([
            FinanceLog.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .populate('pilot_id', 'first_name last_name pilot_id')
                .lean(),
            FinanceLog.countDocuments(query)
        ]);

        return NextResponse.json({
            finance,
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('[Admin Finance API Error]:', error);
        return NextResponse.json({ error: 'Failed to fetch finance data' }, { status: 500 });
    }
}

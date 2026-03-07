import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { verifyAuth } from '@/lib/auth';
import SecurityConfig from '@/models/SecurityConfig';

// GET: Fetch security settings (HWID lock, country blocking, blocked countries)
export async function GET() {
    const auth = await verifyAuth();
    if (!auth || !auth.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();

        let config = await SecurityConfig.findOne({ key: 'LVT_SECURITY' });
        if (!config) {
            config = await SecurityConfig.create({ key: 'LVT_SECURITY' });
        }

        return NextResponse.json({ success: true, config });
    } catch (error: any) {
        console.error('SecurityConfig GET Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update security settings
export async function PUT(request: NextRequest) {
    const auth = await verifyAuth();
    if (!auth || !auth.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        await connectDB();

        const updates = await request.json();
        const sanitized: Record<string, any> = {};

        if (typeof updates.hwidLockEnabled === 'boolean') {
            sanitized.hwid_lock_enabled = updates.hwidLockEnabled;
        }

        if (typeof updates.countryBlockEnabled === 'boolean') {
            sanitized.country_block_enabled = updates.countryBlockEnabled;
        }

        if (typeof updates.blockedCountries === 'string') {
            const parsed = updates.blockedCountries
                .split(/[\s,]+/)
                .map((c: string) => c.trim().toUpperCase())
                .filter((c: string) => c.length > 0);
            sanitized.blocked_login_countries = parsed;
        } else if (Array.isArray(updates.blockedCountries)) {
            const parsed = (updates.blockedCountries as string[])
                .map(c => (c || '').trim().toUpperCase())
                .filter(c => c.length > 0);
            sanitized.blocked_login_countries = parsed;
        }

        sanitized.updated_at = new Date();
        sanitized.updated_by = auth.id;

        const config = await SecurityConfig.findOneAndUpdate(
            { key: 'LVT_SECURITY' },
            { $set: sanitized },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, config });
    } catch (error: any) {
        console.error('SecurityConfig PUT Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

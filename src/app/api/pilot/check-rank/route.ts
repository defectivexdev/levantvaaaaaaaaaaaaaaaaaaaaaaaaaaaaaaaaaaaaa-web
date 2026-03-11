import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import { checkAndUpgradeRank } from '@/lib/ranks';

export async function POST() {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        
        const newRank = await checkAndUpgradeRank(session.id);
        
        if (newRank) {
            return NextResponse.json({ 
                success: true, 
                message: `Promoted to ${newRank}!`,
                newRank 
            });
        } else {
            return NextResponse.json({ 
                success: true, 
                message: 'No rank promotion available at this time.' 
            });
        }
    } catch (error: any) {
        console.error('Check rank error:', error);
        return NextResponse.json({ 
            error: 'Failed to check rank',
            details: error.message 
        }, { status: 500 });
    }
}

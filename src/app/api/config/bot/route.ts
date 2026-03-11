import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const secret = req.headers.get('x-bot-secret');
        
        if (secret !== process.env.DISCORD_BOT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            web_api_url: process.env.BASE_URL || '',
            mongodb_uri: process.env.MONGODB_URI,
        });
    } catch (error) {
        console.error('Bot config error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
        const { payload } = await jwtVerify(token, secret);
        
        const pilotId = payload.pilotId as string;
        if (!pilotId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const state = Buffer.from(pilotId).toString('base64');
        const redirectUri = `${process.env.BASE_URL}/api/discord/oauth/callback`;
        const clientId = process.env.DISCORD_CLIENT_ID;

        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20guilds.join&state=${state}`;

        return NextResponse.json({
            authUrl: discordAuthUrl,
        });
    } catch (error) {
        console.error('Discord verify link error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

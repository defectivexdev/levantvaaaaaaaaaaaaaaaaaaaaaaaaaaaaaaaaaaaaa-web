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
        const redirectUri = `${process.env.BASE_URL}/api/ivao/oauth/callback`;
        const clientId = process.env.IVAO_CLIENT_ID;

        const ivaoAuthUrl = `https://api.ivao.aero/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile&state=${state}`;

        return NextResponse.json({
            authUrl: ivaoAuthUrl,
        });
    } catch (error) {
        console.error('IVAO OAuth authorize error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

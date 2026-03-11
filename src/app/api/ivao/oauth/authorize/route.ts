import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL = 'https://api.ivao.aero/oauth/authorize';
const STATE_COOKIE = 'ivao_oauth_state';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const redirectPath = searchParams.get('redirect') || '/portal/link-discord';

    const state = randomUUID();

    // Get the actual host from headers (more reliable behind proxies)
    const host = request.headers.get('host') || request.nextUrl.hostname;
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const protocol = forwardedProto
        ? forwardedProto.split(',')[0].trim()
        : request.nextUrl.protocol === 'https:' ? 'https' : 'http';

    // Construct redirect URI
    const redirectUri = `${protocol}://${host}/api/ivao/oauth/callback`;

    console.log('IVAO OAuth authorize:', {
        redirectUri,
        host,
        protocol,
        redirectPath,
    });

    const url = new URL(AUTH_URL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.IVAO_CLIENT_ID!);
    url.searchParams.set('scope', 'profile');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', `${state}:${redirectPath}`);

    const response = NextResponse.redirect(url.toString(), { status: 302 });

    response.cookies.set({
        name: STATE_COOKIE,
        value: state,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60,
    });

    return response;
}

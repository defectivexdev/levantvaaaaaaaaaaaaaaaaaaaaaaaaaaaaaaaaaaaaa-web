import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Pilot, IVAOVerification } from '@/models';

const IVAO_API_URL = 'https://api.ivao.aero/v2';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const stateParam = searchParams.get('state');
        const storedState = req.cookies.get('ivao_oauth_state')?.value;

        // Get the actual host from headers (must match authorize request)
        const host = req.headers.get('host') || req.nextUrl.hostname;
        const forwardedProto = req.headers.get('x-forwarded-proto');
        const protocol = forwardedProto
            ? forwardedProto.split(',')[0].trim()
            : req.nextUrl.protocol === 'https:' ? 'https' : 'http';

        const baseUrl = `${protocol}://${host}`;
        const redirectUri = `${baseUrl}/api/ivao/oauth/callback`;

        if (!code || !stateParam) {
            return NextResponse.redirect(`${baseUrl}/portal/link-discord?error=invalid_request`);
        }

        // Parse state: format is "uuid:redirectPath"
        const [state, redirectPath = '/portal/link-discord'] = stateParam.split(':', 2);
        
        if (state !== storedState) {
            console.error('State mismatch:', { state, storedState });
            return NextResponse.redirect(`${baseUrl}/portal/link-discord?error=state_mismatch`);
        }

        // Discover token endpoint from OpenID configuration
        let tokenEndpoint = `${IVAO_API_URL}/oauth/token`;
        try {
            const discoveryUrl = 'https://api.ivao.aero/.well-known/openid-configuration';
            const discoveryResponse = await fetch(discoveryUrl, { cache: 'no-store' });
            if (discoveryResponse.ok) {
                const discovery = await discoveryResponse.json();
                if (discovery.token_endpoint) {
                    tokenEndpoint = discovery.token_endpoint;
                    console.log('Discovered token endpoint:', tokenEndpoint);
                }
            }
        } catch (err) {
            console.error('Discovery error:', err);
        }

        console.log('IVAO OAuth callback - Token exchange:', {
            redirectUri,
            host,
            protocol,
            tokenEndpoint,
        });

        // Exchange code for access token
        const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: new URLSearchParams({
                client_id: process.env.IVAO_CLIENT_ID!,
                client_secret: process.env.IVAO_CLIENT_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('IVAO token exchange failed:', {
                status: tokenResponse.status,
                error: errorText,
                redirectUri,
            });
            return NextResponse.redirect(`${baseUrl}/portal/link-discord?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user data from IVAO
        const userResponse = await fetch(`${IVAO_API_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (!userResponse.ok) {
            console.error('Failed to fetch IVAO user:', await userResponse.text());
            return NextResponse.redirect(`${baseUrl}/portal/link-discord?error=user_fetch_failed`);
        }

        const userInfo = await userResponse.json();
        console.log('IVAO UserInfo received:', {
            hasId: !!userInfo.id,
            hasRating: !!userInfo.rating,
            keys: Object.keys(userInfo),
        });

        // Extract VID from user info
        const ivaoVid = userInfo.id?.toString() || userInfo.userId?.toString() || '';
        
        if (!ivaoVid) {
            console.error('No VID found in IVAO response');
            return NextResponse.redirect(`${baseUrl}/portal/link-discord?error=missing_vid`);
        }

        // Fetch detailed profile
        let profileData: any = null;
        try {
            const profileResponse = await fetch(`${IVAO_API_URL}/users/${ivaoVid}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                cache: 'no-store',
            });
            
            if (profileResponse.ok) {
                profileData = await profileResponse.json();
                console.log('IVAO profile fetched:', {
                    hasData: !!profileData,
                    keys: profileData ? Object.keys(profileData) : [],
                });
            }
        } catch (err) {
            console.error('Error fetching IVAO profile:', err);
        }

        const profile = profileData || userInfo;
        
        // Extract ratings
        const atcRating = profile.rating?.atcRating?.id || profile.atcRating?.id || 1;
        const pilotRating = profile.rating?.pilotRating?.id || profile.pilotRating?.id || 2;
        const division = profile.divisionId || profile.division?.id || '';

        console.log('Extracted IVAO data:', {
            ivaoVid,
            atcRating,
            pilotRating,
            division,
        });

        // Store IVAO data in session/cookie for later use when linking to pilot account
        const ivaoData = {
            vid: ivaoVid,
            atcRating,
            pilotRating,
            division,
        };

        console.log('IVAO verification successful:', ivaoData);
        
        const response = NextResponse.redirect(`${baseUrl}${redirectPath}?ivao_verified=success&ivao_vid=${ivaoVid}`);
        
        // Store IVAO data in cookie for the link-discord page to use
        response.cookies.set({
            name: 'ivao_temp_data',
            value: JSON.stringify(ivaoData),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 10 * 60, // 10 minutes
        });

        // Clear state cookie
        response.cookies.delete('ivao_oauth_state');

        return response;
    } catch (error) {
        console.error('IVAO OAuth callback error:', error);
        return NextResponse.redirect(`${process.env.BASE_URL}/portal/link-discord?error=server_error`);
    }
}

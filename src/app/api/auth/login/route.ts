import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import SecurityConfig from '@/models/SecurityConfig';
import CountryBlacklist from '@/models/CountryBlacklist';

export async function POST(request: NextRequest) {
    try {
        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ error: 'Server misconfiguration: Database not configured' }, { status: 500 });
        }
        if (!process.env.JWT_SECRET) {
            return NextResponse.json({ error: 'Server misconfiguration: Auth secret not configured' }, { status: 500 });
        }

        await connectDB();
        
        const { email, password, hwid } = await request.json();

        const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
        const ipCountry = ipCountryHeader.toUpperCase();

        // Check IP against CountryBlacklist first
        if (ipCountry) {
            const ipBlacklisted = await CountryBlacklist.findOne({ country_code: ipCountry });
            if (ipBlacklisted) {
                console.log(`[Login] Blocked IP from blacklisted country: ${ipCountry}`);
                return NextResponse.json(
                    { error: 'Access from your location is currently not available.' },
                    { status: 403 }
                );
            }
        }

        // Defaults from environment
        let countryBlockEnabled = process.env.COUNTRY_BLOCK_ENABLED === 'true';
        let hwidLockEnabled = process.env.HWID_LOCK_ENABLED !== 'false';
        const blockedCountriesEnv = process.env.BLOCKED_LOGIN_COUNTRIES || '';
        let blockedCountries = blockedCountriesEnv
            .split(',')
            .map(c => c.trim().toUpperCase())
            .filter(Boolean);

        // Override from SecurityConfig if present
        try {
            const sec = await SecurityConfig.findOne({ key: 'LVT_SECURITY' }).lean();
            if (sec) {
                if (typeof sec.country_block_enabled === 'boolean') {
                    countryBlockEnabled = sec.country_block_enabled;
                }
                if (typeof sec.hwid_lock_enabled === 'boolean') {
                    hwidLockEnabled = sec.hwid_lock_enabled;
                }
                if (Array.isArray(sec.blocked_login_countries)) {
                    blockedCountries = sec.blocked_login_countries
                        .map((c: string) => (c || '').trim().toUpperCase())
                        .filter((c: string) => c.length > 0);
                }
            }
        } catch (e) {
            console.error('SecurityConfig load error:', e);
        }

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Fetch user from MongoDB
        const user = await Pilot.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (user.status === 'Blacklist') {
            return NextResponse.json(
                { error: 'Your account has been blacklisted. Contact administrator.' },
                { status: 403 }
            );
        }

        const userCountryCode = (user.country || '').toUpperCase();

        const blockChecksActive = countryBlockEnabled && blockedCountries.length > 0;

        // Case 1: IP is from a blocked country but the user's registered country is different → block (likely VPN/proxy)
        if (
            blockChecksActive &&
            ipCountry &&
            blockedCountries.includes(ipCountry) &&
            userCountryCode !== ipCountry
        ) {
            return NextResponse.json(
                { error: 'Access from your country is currently blocked. Contact staff if you believe this is a mistake.' },
                { status: 403 }
            );
        }

        // Case 2: User is registered in a blocked country but appears to log in from a different country → block VPN/DNS bypass
        if (
            blockChecksActive &&
            userCountryCode &&
            blockedCountries.includes(userCountryCode) &&
            ipCountry &&
            ipCountry !== userCountryCode
        ) {
            return NextResponse.json(
                { error: 'Login blocked: VPN/Proxy detected for a restricted country. Disable VPN/DNS changer or contact staff.' },
                { status: 403 }
            );
        }

        // Case 3: User is registered in a blocked country and no IP country header is present (likely VPN/hidden IP)
        if (
            blockChecksActive &&
            userCountryCode &&
            blockedCountries.includes(userCountryCode) &&
            !ipCountry
        ) {
            return NextResponse.json(
                { error: 'Login blocked: Country restriction in place and IP location cannot be verified. Disable VPN/DNS changer or contact staff.' },
                { status: 403 }
            );
        }

        // --- HWID Locking ---
        if (hwidLockEnabled && hwid) {
            if (!user.hwid) {
                user.hwid = hwid;
            } else if (user.hwid !== hwid) {
                return NextResponse.json(
                    { error: 'Security Alert: Device ID Mismatch. Account is locked to a different PC. Contact staff.' },
                    { status: 403 }
                );
            }
        }

        // Update last activity and restore status if needed
        user.last_activity = new Date();
        if (user.status === 'On leave (LOA)' || user.status === 'Inactive') user.status = 'Active';
        if (email.toLowerCase() === 'admin@levant-va.com') { user.is_admin = true; user.role = 'Admin'; }
        await user.save();

        // Create JWT payload
        const payload = {
            id: user._id.toString(),
            pilotId: user.pilot_id,
            isAdmin: user.is_admin === true || user.role === 'Admin',
            email: user.email,
            status: user.status,
            role: user.role,
        };

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        // Create response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                pilotId: user.pilot_id,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin,
                role: user.role,
            }
        });

        // Set Cookie
        response.cookies.set('lva_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, 
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

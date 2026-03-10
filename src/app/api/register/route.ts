import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import CountryBlacklist from '@/models/CountryBlacklist';
import CountryBlacklistBypass from '@/models/CountryBlacklistBypass';
import { sendWelcomeEmail } from '@/lib/email';
import { sendBlockedAccessAlert, sendVpnBypassWarning } from '@/lib/discordWebhook';
import { getRequestGeolocation } from '@/lib/ipGeolocation';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Check IP country first (before processing any data)
        const ipCountryHeader = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
        const ipCountry = ipCountryHeader.toUpperCase();
        
        if (ipCountry) {
            const ipBlacklisted = await CountryBlacklist.findOne({ country_code: ipCountry });
            if (ipBlacklisted) {
                console.log(`[Registration] Blocked IP from blacklisted country: ${ipCountry}`);
                
                // Get full geolocation data
                const geoData = await getRequestGeolocation(request);
                const userAgent = request.headers.get('user-agent') || undefined;
                
                // Send Discord webhook notification with full geolocation data
                sendBlockedAccessAlert({
                    endpoint: 'Registration',
                    ipAddress: geoData?.ip,
                    ipCountry,
                    countryName: geoData?.country_name,
                    city: geoData?.city,
                    isp: geoData?.isp,
                    timestamp: new Date().toISOString(),
                    userAgent,
                    suspectedVpn: false
                }).catch(err => console.error('[Webhook] Failed to send:', err));
                
                return NextResponse.json(
                    { error: 'Access from your location is currently not available.' },
                    { status: 403 }
                );
            }
        }
        
        const body = await request.json();
        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        const firstName = capitalize(body.firstName);
        const lastName = capitalize(body.lastName);
        const {
            email,
            password,
            phoneNumber,
            country,
            city,
            timezone,
            desiredCallsign,
            baseAirport,
        } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !country || !timezone || !baseAirport) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate callsign format first to get pilot_id
        const callsign = desiredCallsign?.trim().toUpperCase();
        if (!callsign) {
            return NextResponse.json(
                { error: 'Callsign is required' },
                { status: 400 }
            );
        }

        if (!/^LVT[A-Z0-9]{1,3}$/.test(callsign)) {
            return NextResponse.json(
                { error: 'Callsign must start with LVT followed by 1-3 characters' },
                { status: 400 }
            );
        }

        // Check if country is blacklisted
        const blacklistedCountry = await CountryBlacklist.findOne({ country_code: country.toUpperCase() });
        if (blacklistedCountry) {
            // Check if this pilot ID is in the bypass list
            const isBypassed = await CountryBlacklistBypass.findOne({ pilot_id: callsign });
            if (!isBypassed) {
                console.log(`[Registration] Blocked registration from blacklisted country: ${country} (Pilot: ${callsign})`);
                
                // Send webhook notification
                sendBlockedAccessAlert({
                    endpoint: 'Registration (Form Country)',
                    ipCountry: country.toUpperCase(),
                    pilotId: callsign,
                    email,
                    timestamp: new Date().toISOString(),
                    suspectedVpn: !!(ipCountry && ipCountry !== country.toUpperCase())
                }).catch(err => console.error('[Webhook] Failed to send:', err));
                
                return NextResponse.json(
                    { error: 'Registration from your country is currently not available.' },
                    { status: 403 }
                );
            } else {
                console.log(`[Registration] Allowing bypassed pilot ${callsign} from blacklisted country: ${country}`);
            }
        }
        
        // VPN Detection: Check if IP country differs from form country
        if (ipCountry && country && ipCountry !== country.toUpperCase()) {
            console.log(`[Registration] VPN suspected - IP: ${ipCountry}, Form: ${country} (Pilot: ${callsign})`);
            sendVpnBypassWarning({
                endpoint: 'Registration',
                ipCountry,
                formCountry: country.toUpperCase(),
                pilotId: callsign,
                email
            }).catch(err => console.error('[Webhook] Failed to send VPN warning:', err));
        }

        // Only allow @gmail.com email addresses
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return NextResponse.json(
                { error: 'Only Gmail addresses (@gmail.com) are accepted for registration.' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await Pilot.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Check if callsign already exists
        const existingCallsign = await Pilot.findOne({ pilot_id: callsign });
        if (existingCallsign) {
            return NextResponse.json(
                { error: 'Callsign already in use' },
                { status: 400 }
            );
        }

        const pilotId = callsign;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new pilot with Active status (Key System removed)
        let finalBase = baseAirport;
        if (baseAirport === 'RANDOM') {
            const options = ['OSDI', 'OJAI', 'ORBI'];
            finalBase = options[Math.floor(Math.random() * options.length)];
        }

        const newPilot = await Pilot.create({
            pilot_id: pilotId,
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone_number: phoneNumber,
            country,
            city,
            timezone,
            desired_callsign: desiredCallsign,
            rank: 'Cadet',
            status: 'Active', 
            role: 'Pilot',
            is_admin: false,
            current_location: finalBase,
            home_base: finalBase,
        });

        // Send Welcome Aboard briefing email
        await sendWelcomeEmail(email, pilotId, firstName);

        return NextResponse.json({
            success: true,
            message: 'Registration successful. Your account is pending activation.',
            pilotId: newPilot.pilot_id,
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

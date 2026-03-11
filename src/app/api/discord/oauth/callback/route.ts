import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Pilot, IVAOVerification } from '@/models';

const DISCORD_API_URL = 'https://discord.com/api/v10';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/profile?error=invalid_request`);
        }

        const pilotId = Buffer.from(state, 'base64').toString('utf-8');

        const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.BASE_URL}/api/discord/oauth/callback`,
            }),
        });

        if (!tokenResponse.ok) {
            console.error('Discord token exchange failed:', await tokenResponse.text());
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/profile?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            console.error('Failed to fetch Discord user:', await userResponse.text());
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/profile?error=user_fetch_failed`);
        }

        const discordUser = await userResponse.json();

        await connectDB();

        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.redirect(`${process.env.BASE_URL}/portal/profile?error=pilot_not_found`);
        }

        pilot.discord_id = discordUser.id;
        pilot.discord_username = `${discordUser.username}#${discordUser.discriminator}`;
        await pilot.save();

        const guildId = process.env.DISCORD_GUILD_ID;
        const botToken = process.env.DISCORD_BOT_TOKEN;

        if (guildId && botToken) {
            try {
                const addMemberResponse = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bot ${botToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        access_token: accessToken,
                    }),
                });

                if (addMemberResponse.ok || addMemberResponse.status === 204) {
                    console.log(`Added user ${discordUser.username} to guild`);
                }

                const levantMemberRoleId = process.env.ROLE_LEVANT_MEMBERS_ID || '1293262463940427869';
                const rolesToAssign = [levantMemberRoleId];

                const verification = await IVAOVerification.findOne({ pilot_id: pilotId });
                if (verification && pilot.ivao_verified) {
                    const atcRating = verification.atc_rating;
                    const pilotRating = verification.pilot_rating;

                    // ATC Ratings: 5-7 (ADC-ACC) → ADIR, 8-10 (SEC-CAI) → DIR
                    if (atcRating >= 5 && atcRating <= 7) {
                        rolesToAssign.push(process.env.ROLE_ADIR_ID || '1440763539794169939');
                    } else if (atcRating >= 8 && atcRating <= 10) {
                        rolesToAssign.push(process.env.ROLE_DIR_ID || '1440763280028336211');
                    }

                    // Pilot Ratings: 5-6 (PP-SPP) → AWM, 7-8 (CP-ATP) → WM, 9 (SFI) → FM, 10 (CFI) → AFM
                    if (pilotRating === 5 || pilotRating === 6) {
                        rolesToAssign.push(process.env.ROLE_AWM_ID || '1440765576770224230');
                    } else if (pilotRating === 7 || pilotRating === 8) {
                        rolesToAssign.push(process.env.ROLE_WM_ID || '1440764377665110027');
                    } else if (pilotRating === 9) {
                        rolesToAssign.push(process.env.ROLE_FM_ID || '1440765742491631747');
                    } else if (pilotRating === 10) {
                        rolesToAssign.push(process.env.ROLE_AFM_ID || '1440765823726915625');
                    }
                }

                for (const roleId of rolesToAssign) {
                    try {
                        await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordUser.id}/roles/${roleId}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bot ${botToken}`,
                            },
                        });
                    } catch (error) {
                        console.error(`Failed to assign role ${roleId}:`, error);
                    }
                }

                if (verification) {
                    verification.discord_roles_assigned = true;
                    await verification.save();
                }

                console.log(`Assigned ${rolesToAssign.length} role(s) to ${discordUser.username}`);
                
                // Remove unlinked role after successful linking
                const unlinkedRoleId = '1481168075876466740';
                try {
                    await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordUser.id}/roles/${unlinkedRoleId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bot ${botToken}`,
                        },
                    });
                    console.log(`Removed unlinked role from ${discordUser.username}`);
                } catch (error) {
                    console.error(`Failed to remove unlinked role:`, error);
                }
            } catch (error) {
                console.error('Failed to add member to guild or assign roles:', error);
            }
        }

        return NextResponse.redirect(`${process.env.BASE_URL}/portal/profile?discord_linked=success`);
    } catch (error) {
        console.error('Discord OAuth callback error:', error);
        return NextResponse.redirect(`${process.env.BASE_URL}/portal/profile?error=server_error`);
    }
}

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
        
        // Prepare nickname: "Pilot Name | PILOT_ID"
        const pilotName = `${pilot.first_name} ${pilot.last_name}`;
        const nickname = `${pilotName} | ${pilotId}`;

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
                
                // Wait a moment for member to be fully added
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Update nickname to "Pilot Name | PILOT_ID"
                const nicknameResponse = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordUser.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bot ${botToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nick: nickname,
                    }),
                });
                
                if (nicknameResponse.ok) {
                    console.log(`Updated nickname for ${discordUser.username} to: ${nickname}`);
                } else {
                    const errorText = await nicknameResponse.text();
                    console.error(`Failed to update nickname (${nicknameResponse.status}):`, errorText);
                }

                const levantMemberRoleId = process.env.ROLE_LEVANT_MEMBERS_ID || '1293262463940427869';
                const rolesToAssign = [levantMemberRoleId];

                const verification = await IVAOVerification.findOne({ pilot_id: pilotId });
                if (verification && pilot.ivao_verified) {
                    const atcRating = verification.atc_rating;
                    const pilotRating = verification.pilot_rating;

                    // IVAO ATC Rating Roles (individual roles per rating from IVAO API)
                    const atcRoleMap: Record<number, string> = {
                        2: process.env.ROLE_AS1_ID || '1481212423057838181',
                        3: process.env.ROLE_AS2_ID || '1481212461888573453',
                        4: process.env.ROLE_AS3_ID || '1481212564133380187',
                        5: process.env.ROLE_ADC_ID || '1481212575470456853',
                        6: process.env.ROLE_APC_ID || '1481212584630947910',
                        7: process.env.ROLE_ACC_ID || '1481212594868977736',
                        8: process.env.ROLE_SEC_ID || '1481212601588387861',
                        9: process.env.ROLE_SAI_ID || '1481212601588387861',
                        10: process.env.ROLE_CAI_ID || '1481313822210785421',
                    };

                    // IVAO Pilot Rating Roles (individual roles per rating from IVAO API)
                    const pilotRoleMap: Record<number, string> = {
                        2: process.env.ROLE_FS1_ID || '1481212666340053053',
                        3: process.env.ROLE_FS2_ID || '1481212683293294613',
                        4: process.env.ROLE_FS3_ID || '1481212691186978826',
                        5: process.env.ROLE_PP_ID || '1481212699395493888',
                        6: process.env.ROLE_SPP_ID || '1481212715904270437',
                        7: process.env.ROLE_CP_ID || '1481212733860085761',
                        8: process.env.ROLE_ATP_ID || '1481212752231010345',
                        9: process.env.ROLE_SFI_ID || '1481313746629693510',
                        10: process.env.ROLE_CFI_ID || '1481313822210785421',
                    };

                    // Assign IVAO ATC role based on API data
                    if (atcRating && atcRoleMap[atcRating]) {
                        rolesToAssign.push(atcRoleMap[atcRating]);
                    }

                    // Assign IVAO Pilot role based on API data
                    if (pilotRating && pilotRoleMap[pilotRating]) {
                        rolesToAssign.push(pilotRoleMap[pilotRating]);
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
                const removeRoleResponse = await fetch(`${DISCORD_API_URL}/guilds/${guildId}/members/${discordUser.id}/roles/${unlinkedRoleId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bot ${botToken}`,
                    },
                });
                
                if (removeRoleResponse.ok || removeRoleResponse.status === 204) {
                    console.log(`Removed unlinked role from ${discordUser.username}`);
                } else {
                    const errorText = await removeRoleResponse.text();
                    console.error(`Failed to remove unlinked role (${removeRoleResponse.status}):`, errorText);
                }

                // Send webhook notification for successful linking
                try {
                    const webhookUrl = 'https://discordapp.com/api/webhooks/1481338125111398474/RFiWxLbN8ZxxUQITBEXR9N4-xUxThhzcr1IUsuDARdMKP3bVWAjjugGaqSiPWTqzkzjg';
                    
                    const roleNames: string[] = ['Levant Members'];
                    if (verification && pilot.ivao_verified) {
                        const atcRatingNames: Record<number, string> = {
                            2: 'AS1', 3: 'AS2', 4: 'AS3', 5: 'ADC', 6: 'APC', 7: 'ACC', 8: 'SEC', 9: 'SAI', 10: 'CAI'
                        };
                        const pilotRatingNames: Record<number, string> = {
                            2: 'FS1', 3: 'FS2', 4: 'FS3', 5: 'PP', 6: 'SPP', 7: 'CP', 8: 'ATP', 9: 'SFI', 10: 'CFI'
                        };
                        
                        if (verification.atc_rating && atcRatingNames[verification.atc_rating]) {
                            roleNames.push(atcRatingNames[verification.atc_rating]);
                        }
                        if (verification.pilot_rating && pilotRatingNames[verification.pilot_rating]) {
                            roleNames.push(pilotRatingNames[verification.pilot_rating]);
                        }
                    }

                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            embeds: [{
                                title: '🔗 Discord Account Linked',
                                description: `**${pilot.first_name} ${pilot.last_name}** has successfully linked their Discord account.`,
                                color: 0x00ff00,
                                fields: [
                                    { name: 'Pilot ID', value: pilotId, inline: true },
                                    { name: 'Discord User', value: `${discordUser.username}`, inline: true },
                                    { name: '\u200b', value: '\u200b', inline: false },
                                    { name: 'Roles Assigned', value: roleNames.join(', '), inline: false },
                                    { name: 'IVAO Verified', value: pilot.ivao_verified ? '✅ Yes' : '❌ No', inline: true },
                                ],
                                footer: { text: 'Levant Virtual Airlines' },
                                timestamp: new Date().toISOString(),
                            }],
                        }),
                    });
                } catch (webhookError) {
                    console.error('Failed to send webhook notification:', webhookError);
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

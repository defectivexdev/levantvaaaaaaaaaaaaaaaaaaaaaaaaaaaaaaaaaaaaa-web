/**
 * Discord Webhook Notification System
 * Sends alerts when blacklisted IPs attempt to access the system
 */

const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1480942868909789397/EBYoZBwsUCJMd5Q5Bf-zuTF62yts3daGprdXVvUsMHQyE7j6BGFmc8Pw7Gro3LWIl2r9';

interface BlockedAccessAlert {
    endpoint: string;
    ipAddress?: string;
    ipCountry: string;
    countryName?: string;
    city?: string;
    isp?: string;
    pilotId?: string;
    email?: string;
    timestamp: string;
    userAgent?: string;
    suspectedVpn?: boolean;
}

/**
 * Send Discord webhook notification for blocked access attempts
 */
export async function sendBlockedAccessAlert(data: BlockedAccessAlert): Promise<void> {
    try {
        const embed = {
            title: '🚨 Blocked Access Attempt',
            color: 0xFF0000, // Red
            fields: [
                {
                    name: '📍 Endpoint',
                    value: `\`${data.endpoint}\``,
                    inline: true
                },
                {
                    name: '🌍 Country',
                    value: data.countryName ? `${data.countryName} (\`${data.ipCountry}\`)` : `\`${data.ipCountry}\``,
                    inline: true
                },
                {
                    name: '⏰ Timestamp',
                    value: data.timestamp,
                    inline: true
                }
            ],
            footer: {
                text: 'Levant VA Security System'
            }
        };

        // Add IP address if available
        if (data.ipAddress) {
            embed.fields.push({
                name: '🔍 IP Address',
                value: `\`${data.ipAddress}\``,
                inline: true
            });
        }

        // Add city if available
        if (data.city) {
            embed.fields.push({
                name: '🏙️ City',
                value: `\`${data.city}\``,
                inline: true
            });
        }

        // Add ISP if available
        if (data.isp) {
            embed.fields.push({
                name: '🌐 ISP',
                value: `\`${data.isp}\``,
                inline: true
            });
        }

        // Add pilot ID if available
        if (data.pilotId) {
            embed.fields.push({
                name: '👤 Pilot ID',
                value: `\`${data.pilotId}\``,
                inline: true
            });
        }

        // Add email if available
        if (data.email) {
            embed.fields.push({
                name: '📧 Email',
                value: `\`${data.email}\``,
                inline: true
            });
        }

        // Add VPN warning if suspected
        if (data.suspectedVpn) {
            embed.fields.push({
                name: '⚠️ VPN/Proxy Suspected',
                value: 'IP country differs from form country - possible VPN bypass attempt',
                inline: false
            });
        }

        // Add user agent if available
        if (data.userAgent) {
            embed.fields.push({
                name: '🖥️ User Agent',
                value: `\`${data.userAgent.substring(0, 100)}\``,
                inline: false
            });
        }

        const payload = {
            username: 'Levant VA Security',
            avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
            embeds: [embed]
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('[Discord Webhook] Failed to send:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('[Discord Webhook] Error sending notification:', error);
        // Don't throw - webhook failures shouldn't break the app
    }
}

/**
 * Send VPN bypass warning when IP country differs from form country
 */
export async function sendVpnBypassWarning(data: {
    endpoint: string;
    ipCountry: string;
    formCountry: string;
    pilotId?: string;
    email?: string;
}): Promise<void> {
    try {
        const embed = {
            title: '⚠️ Potential VPN Bypass Attempt',
            color: 0xFFA500, // Orange
            description: `IP country (${data.ipCountry}) differs from form country (${data.formCountry})`,
            fields: [
                {
                    name: '📍 Endpoint',
                    value: `\`${data.endpoint}\``,
                    inline: true
                },
                {
                    name: '🌍 IP Country',
                    value: `\`${data.ipCountry}\``,
                    inline: true
                },
                {
                    name: '📝 Form Country',
                    value: `\`${data.formCountry}\``,
                    inline: true
                },
                {
                    name: '⏰ Timestamp',
                    value: new Date().toISOString(),
                    inline: true
                }
            ],
            footer: {
                text: 'Levant VA Security System - VPN Detection'
            }
        };

        if (data.pilotId) {
            embed.fields.push({
                name: '👤 Pilot ID',
                value: `\`${data.pilotId}\``,
                inline: true
            });
        }

        if (data.email) {
            embed.fields.push({
                name: '📧 Email',
                value: `\`${data.email}\``,
                inline: true
            });
        }

        const payload = {
            username: 'Levant VA Security',
            avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
            embeds: [embed]
        };

        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error('[Discord Webhook] Error sending VPN warning:', error);
    }
}

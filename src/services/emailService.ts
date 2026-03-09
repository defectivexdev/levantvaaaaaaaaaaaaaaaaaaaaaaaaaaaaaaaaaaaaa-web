/**
 * Email Service
 * Comprehensive email notification system with Nodemailer
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
    EmailNotificationType,
    EmailPriority,
} from '@/types/notifications';
import type {
    EmailTemplateData,
    EmailNotification,
} from '@/types/notifications';

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    tls: {
        rejectUnauthorized: boolean;
        minVersion: string;
    };
    from: {
        name: string;
        email: string;
    };
}

const emailConfig: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
    },
    from: {
        name: process.env.EMAIL_FROM_NAME || 'Levant Virtual Airline',
        email: process.env.EMAIL_FROM || 'noreply@levant-va.com',
    },
};

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================

export class EmailService {
    private transporter!: Transporter;
    private isConfigured: boolean;

    constructor() {
        this.isConfigured = this.validateConfig();
        
        if (this.isConfigured) {
            this.transporter = nodemailer.createTransport({
                host: emailConfig.host,
                port: emailConfig.port,
                secure: emailConfig.secure,
                auth: emailConfig.auth,
                tls: emailConfig.tls,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            } as any);

            this.transporter.verify((error: any) => {
                if (error) {
                    console.error('[EmailService] SMTP connection verification failed:', error.message);
                    console.error('[EmailService] Host:', emailConfig.host, 'Port:', emailConfig.port);
                } else {
                    console.log('[EmailService] SMTP server connection verified and ready');
                    console.log('[EmailService] Host:', emailConfig.host, 'Port:', emailConfig.port);
                }
            });
        } else {
            console.warn('Email service not configured. Emails will be logged only.');
        }
    }

    private validateConfig(): boolean {
        return !!(
            emailConfig.host &&
            emailConfig.auth.user &&
            emailConfig.auth.pass
        );
    }

    /**
     * Send email
     */
    async sendEmail(
        to: string,
        subject: string,
        html: string,
        text: string,
        priority: EmailPriority = EmailPriority.NORMAL
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        if (!this.isConfigured) {
            console.log('[EMAIL] Would send:', { to, subject });
            return { success: false, error: 'Email service not configured' };
        }

        try {
            const info: any = await this.transporter.sendMail({
                from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
                to,
                subject,
                html,
                text,
                priority: this.getPriorityHeader(priority) as any,
            });

            console.log('[EMAIL] Sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            console.error('[EmailService] Failed to send email');
            console.error('[EmailService] Recipient:', to);
            console.error('[EmailService] Subject:', subject);
            console.error('[EmailService] Error:', error.message);
            console.error('[EmailService] SMTP Host:', emailConfig.host, 'Port:', emailConfig.port);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send notification email using template
     */
    async sendNotification(
        type: EmailNotificationType,
        to: string,
        data: EmailTemplateData,
        priority?: EmailPriority
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const template = this.getTemplate(type, data);
        const emailPriority = priority || this.getDefaultPriority(type);

        return this.sendEmail(
            to,
            template.subject,
            template.html,
            template.text,
            emailPriority
        );
    }

    /**
     * Get email template
     */
    private getTemplate(
        type: EmailNotificationType,
        data: EmailTemplateData
    ): { subject: string; html: string; text: string } {
        const templates = {
            welcome: this.getWelcomeTemplate,
            registration_approved: this.getRegistrationApprovedTemplate,
            registration_rejected: this.getRegistrationRejectedTemplate,
            account_blacklisted: this.getAccountBlacklistedTemplate,
            password_reset: this.getPasswordResetTemplate,
            pirep_approved: this.getPIREPApprovedTemplate,
            pirep_rejected: this.getPIREPRejectedTemplate,
            group_flight_reminder_24h: this.getGroupFlightReminder24hTemplate,
            group_flight_reminder_1h: this.getGroupFlightReminder1hTemplate,
            badge_earned: this.getBadgeEarnedTemplate,
            rank_promotion: this.getRankPromotionTemplate,
            loa_approved: this.getLOAApprovedTemplate,
            loa_rejected: this.getLOARejectedTemplate,
            event_results: this.getEventResultsTemplate,
        };

        const templateFn = templates[type as keyof typeof templates];
        if (templateFn) {
            return templateFn.call(this, data);
        }

        return this.getGenericTemplate(type, data);
    }

    /**
     * Get priority header
     */
    private getPriorityHeader(priority: EmailPriority): string {
        const map: Record<EmailPriority, string> = {
            [EmailPriority.LOW]: 'low',
            [EmailPriority.NORMAL]: 'normal',
            [EmailPriority.HIGH]: 'high',
            [EmailPriority.URGENT]: 'high',
        };
        return map[priority];
    }

    /**
     * Get default priority for notification type
     */
    private getDefaultPriority(type: EmailNotificationType): EmailPriority {
        const urgentTypes = [EmailNotificationType.PASSWORD_RESET, EmailNotificationType.ACCOUNT_BLACKLISTED, EmailNotificationType.GROUP_FLIGHT_REMINDER_1H];
        const highTypes = [EmailNotificationType.REGISTRATION_APPROVED, EmailNotificationType.PIREP_APPROVED, EmailNotificationType.RANK_PROMOTION];
        
        if (urgentTypes.includes(type)) return EmailPriority.URGENT;
        if (highTypes.includes(type)) return EmailPriority.HIGH;
        return EmailPriority.NORMAL;
    }

    // ========================================================================
    // EMAIL TEMPLATES
    // ========================================================================

    private getWelcomeTemplate(data: EmailTemplateData) {
        const subject = `Welcome to ${data.va_name}! 🎉`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome Aboard, ${data.pilot_name}!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${data.pilot_name},</p>
                        <p>Welcome to <strong>${data.va_name}</strong>! We're thrilled to have you join our community of virtual pilots.</p>
                        <p>Your registration is currently under review. You'll receive another email once your account has been approved by our team.</p>
                        <p>In the meantime, feel free to explore our website and familiarize yourself with our operations.</p>
                        <a href="${data.dashboard_url}" class="button">Visit Dashboard</a>
                        <p>If you have any questions, don't hesitate to reach out to us at ${data.support_email}.</p>
                        <p>Blue skies,<br>The ${data.va_name} Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${data.va_name}. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Welcome to ${data.va_name}, ${data.pilot_name}!

Your registration is currently under review. You'll receive another email once your account has been approved.

Visit your dashboard: ${data.dashboard_url}

Questions? Contact us at ${data.support_email}

Blue skies,
The ${data.va_name} Team
        `;

        return { subject, html, text };
    }

    private getRegistrationApprovedTemplate(data: any) {
        const subject = `✅ Your ${data.va_name} Application Has Been Approved!`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .checklist { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Congratulations, ${data.pilot_name}!</h1>
                    </div>
                    <div class="content">
                        <p>Great news! Your application to join ${data.va_name} has been <strong>approved</strong> by ${data.approved_by}.</p>
                        <p>You can now log in and start flying with us!</p>
                        <a href="${data.login_url}" class="button">Login to Dashboard</a>
                        <div class="checklist">
                            <h3>Next Steps:</h3>
                            <ul>
                                ${data.next_steps.map((step: string) => `<li>${step}</li>`).join('')}
                            </ul>
                        </div>
                        <p>Welcome to the team, and happy flying!</p>
                        <p>Blue skies,<br>The ${data.va_name} Team</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Congratulations, ${data.pilot_name}!

Your application to join ${data.va_name} has been approved by ${data.approved_by}.

Login now: ${data.login_url}

Next Steps:
${data.next_steps.map((step: string) => `- ${step}`).join('\n')}

Welcome to the team!
        `;

        return { subject, html, text };
    }

    private getRegistrationRejectedTemplate(data: any) {
        const subject = `${data.va_name} Application Update`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div class="container">
                    <h2>Application Status Update</h2>
                    <p>Dear ${data.pilot_name},</p>
                    <p>Thank you for your interest in ${data.va_name}. After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
                    <p><strong>Reason:</strong> ${data.rejection_reason}</p>
                    ${data.reapply_allowed ? '<p>You are welcome to reapply in the future.</p>' : ''}
                    <p>If you have questions, please contact us at ${data.contact_email}.</p>
                </div>
            </body>
            </html>
        `;

        const text = `
Application Status Update

Dear ${data.pilot_name},

We regret to inform you that we are unable to approve your application to ${data.va_name} at this time.

Reason: ${data.rejection_reason}

${data.reapply_allowed ? 'You are welcome to reapply in the future.' : ''}

Questions? Contact: ${data.contact_email}
        `;

        return { subject, html, text };
    }

    private getAccountBlacklistedTemplate(data: any) {
        const subject = `⚠️ Important: Account Status Update`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #ef4444; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1>Account Suspended</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Dear ${data.pilot_name},</p>
                        <p>Your account with ${data.va_name} has been suspended.</p>
                        <p><strong>Reason:</strong> ${data.reason}</p>
                        <p><strong>Suspended by:</strong> ${data.blacklisted_by}</p>
                        <p><strong>Date:</strong> ${new Date(data.blacklisted_at).toLocaleDateString()}</p>
                        ${data.appeal_url ? `<p>If you believe this is an error, you may <a href="${data.appeal_url}">submit an appeal</a>.</p>` : ''}
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Account Suspended

Dear ${data.pilot_name},

Your account with ${data.va_name} has been suspended.

Reason: ${data.reason}
Suspended by: ${data.blacklisted_by}
Date: ${new Date(data.blacklisted_at).toLocaleDateString()}

${data.appeal_url ? `Appeal: ${data.appeal_url}` : ''}
        `;

        return { subject, html, text };
    }

    private getPasswordResetTemplate(data: any) {
        const subject = `🔐 Password Reset Request`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${data.pilot_name},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="${data.reset_link}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                    <p>This link will expire in ${data.expires_in_minutes} minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    ${data.ip_address ? `<p style="color: #666; font-size: 12px;">Request from IP: ${data.ip_address}</p>` : ''}
                </div>
            </body>
            </html>
        `;

        const text = `
Password Reset Request

Hi ${data.pilot_name},

Click this link to reset your password:
${data.reset_link}

This link expires in ${data.expires_in_minutes} minutes.

If you didn't request this, ignore this email.
        `;

        return { subject, html, text };
    }

    private getPIREPApprovedTemplate(data: any) {
        const subject = `✅ PIREP Approved - ${data.flight_number}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1>✈️ PIREP Approved!</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Congratulations, ${data.pilot_name}!</p>
                        <p>Your PIREP for flight <strong>${data.flight_number}</strong> has been approved.</p>
                        <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                            <p><strong>Route:</strong> ${data.route}</p>
                            <p><strong>Score:</strong> ${data.score}/100</p>
                            <p><strong>Earnings:</strong> $${data.earnings.toLocaleString()}</p>
                            <p><strong>Approved by:</strong> ${data.approved_by}</p>
                        </div>
                        <a href="${data.view_pirep_url}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View PIREP</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
PIREP Approved!

Congratulations, ${data.pilot_name}!

Your PIREP for flight ${data.flight_number} has been approved.

Route: ${data.route}
Score: ${data.score}/100
Earnings: $${data.earnings.toLocaleString()}
Approved by: ${data.approved_by}

View PIREP: ${data.view_pirep_url}
        `;

        return { subject, html, text };
    }

    private getPIREPRejectedTemplate(data: any) {
        const subject = `❌ PIREP Rejected - ${data.flight_number}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>PIREP Rejected</h2>
                    <p>Dear ${data.pilot_name},</p>
                    <p>Your PIREP for flight <strong>${data.flight_number}</strong> (${data.route}) has been rejected.</p>
                    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                        <p><strong>Reason:</strong> ${data.rejection_reason}</p>
                    </div>
                    <p><strong>Rejected by:</strong> ${data.rejected_by}</p>
                    ${data.can_resubmit ? '<p>You may resubmit this flight after making the necessary corrections.</p>' : ''}
                </div>
            </body>
            </html>
        `;

        const text = `
PIREP Rejected

Dear ${data.pilot_name},

Your PIREP for flight ${data.flight_number} (${data.route}) has been rejected.

Reason: ${data.rejection_reason}
Rejected by: ${data.rejected_by}

${data.can_resubmit ? 'You may resubmit after making corrections.' : ''}
        `;

        return { subject, html, text };
    }

    private getGroupFlightReminder24hTemplate(data: any) {
        const subject = `📅 Group Flight Tomorrow: ${data.event_name}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1>🛫 Group Flight Reminder</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Hi ${data.pilot_name},</p>
                        <p>This is a reminder that you're registered for the group flight <strong>${data.event_name}</strong> departing in approximately 24 hours!</p>
                        <div style="background: white; padding: 20px; margin: 20px 0;">
                            <p><strong>Route:</strong> ${data.departure} → ${data.arrival}</p>
                            <p><strong>Aircraft:</strong> ${data.aircraft}</p>
                            <p><strong>Departure:</strong> ${new Date(data.scheduled_time).toLocaleString()}</p>
                        </div>
                        <a href="${data.briefing_url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px;">View Briefing</a>
                        <a href="${data.event_url}" style="display: inline-block; background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px;">Event Details</a>
                        <p>See you in the skies!</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Group Flight Reminder

Hi ${data.pilot_name},

You're registered for: ${data.event_name}
Departing in approximately 24 hours!

Route: ${data.departure} → ${data.arrival}
Aircraft: ${data.aircraft}
Departure: ${new Date(data.scheduled_time).toLocaleString()}

Briefing: ${data.briefing_url}
Event Details: ${data.event_url}

See you in the skies!
        `;

        return { subject, html, text };
    }

    private getGroupFlightReminder1hTemplate(data: any) {
        const subject = `⏰ Group Flight Starting Soon: ${data.event_name}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1>⏰ Final Call!</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Hi ${data.pilot_name},</p>
                        <p><strong>${data.event_name}</strong> is starting in approximately 1 hour!</p>
                        <p style="font-size: 18px; color: #f59e0b;"><strong>Time to get ready! ✈️</strong></p>
                        <div style="background: white; padding: 20px; margin: 20px 0;">
                            <p><strong>Route:</strong> ${data.departure} → ${data.arrival}</p>
                            <p><strong>Aircraft:</strong> ${data.aircraft}</p>
                            <p><strong>Departure:</strong> ${new Date(data.scheduled_time).toLocaleString()}</p>
                        </div>
                        <a href="${data.event_url}" style="display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px;">Join Now</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
⏰ FINAL CALL!

${data.event_name} is starting in approximately 1 hour!

Route: ${data.departure} → ${data.arrival}
Aircraft: ${data.aircraft}
Departure: ${new Date(data.scheduled_time).toLocaleString()}

Join now: ${data.event_url}

Time to get ready! ✈️
        `;

        return { subject, html, text };
    }

    private getBadgeEarnedTemplate(data: any) {
        const subject = `🏆 New Badge Earned: ${data.badge_name}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="font-size: 48px; margin: 0;">${data.badge_icon}</h1>
                        <h2>Achievement Unlocked!</h2>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Congratulations, ${data.pilot_name}!</p>
                        <p>You've earned the <strong>${data.badge_name}</strong> badge!</p>
                        <div style="background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
                            <p><strong>Description:</strong> ${data.badge_description}</p>
                            <p><strong>Rarity:</strong> ${data.badge_rarity}</p>
                            ${data.cash_reward ? `<p><strong>Reward:</strong> $${data.cash_reward}</p>` : ''}
                        </div>
                        <a href="${data.view_badges_url}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View All Badges</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
🏆 Achievement Unlocked!

Congratulations, ${data.pilot_name}!

You've earned: ${data.badge_name}

Description: ${data.badge_description}
Rarity: ${data.badge_rarity}
${data.cash_reward ? `Reward: $${data.cash_reward}` : ''}

View all badges: ${data.view_badges_url}
        `;

        return { subject, html, text };
    }

    private getRankPromotionTemplate(data: any) {
        const subject = `🎖️ Promoted to ${data.new_rank}!`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="font-size: 48px; margin: 0;">🎖️</h1>
                        <h2>Rank Promotion!</h2>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Congratulations, ${data.pilot_name}!</p>
                        <p>${data.congratulations_message}</p>
                        <div style="background: white; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 24px; margin: 10px 0;"><strong>${data.old_rank}</strong> → <strong style="color: #f59e0b;">${data.new_rank}</strong></p>
                            <p style="color: #10b981; font-size: 20px;"><strong>New Pay Rate: $${data.new_hourly_rate}/hour</strong></p>
                        </div>
                        <div style="background: white; padding: 20px; border-left: 4px solid #fbbf24; margin: 20px 0;">
                            <h3>Your Stats:</h3>
                            <p>Total Hours: ${data.total_hours}</p>
                            <p>Total Flights: ${data.total_flights}</p>
                            <p>Average Score: ${data.avg_score}</p>
                        </div>
                        <p>Keep up the excellent work!</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
🎖️ Rank Promotion!

Congratulations, ${data.pilot_name}!

${data.old_rank} → ${data.new_rank}

New Pay Rate: $${data.new_hourly_rate}/hour

Your Stats:
- Total Hours: ${data.total_hours}
- Total Flights: ${data.total_flights}
- Average Score: ${data.avg_score}

${data.congratulations_message}
        `;

        return { subject, html, text };
    }

    private getLOAApprovedTemplate(data: any) {
        const subject = `✅ Leave of Absence Approved`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Leave of Absence Approved</h2>
                    <p>Hi ${data.pilot_name},</p>
                    <p>Your leave of absence request has been approved by ${data.approved_by}.</p>
                    <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                        <p><strong>Start Date:</strong> ${new Date(data.start_date).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> ${new Date(data.end_date).toLocaleDateString()}</p>
                        <p><strong>Return Date:</strong> ${new Date(data.return_date).toLocaleDateString()}</p>
                    </div>
                    <p>We'll see you when you return. Safe travels!</p>
                </div>
            </body>
            </html>
        `;

        const text = `
Leave of Absence Approved

Hi ${data.pilot_name},

Your LOA request has been approved by ${data.approved_by}.

Start Date: ${new Date(data.start_date).toLocaleDateString()}
End Date: ${new Date(data.end_date).toLocaleDateString()}
Return Date: ${new Date(data.return_date).toLocaleDateString()}

We'll see you when you return!
        `;

        return { subject, html, text };
    }

    private getLOARejectedTemplate(data: any) {
        const subject = `Leave of Absence Request Update`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Leave of Absence Request</h2>
                    <p>Hi ${data.pilot_name},</p>
                    <p>We regret to inform you that your leave of absence request has not been approved at this time.</p>
                    <p>If you have questions, please contact our staff.</p>
                </div>
            </body>
            </html>
        `;

        const text = `
Leave of Absence Request

Hi ${data.pilot_name},

Your LOA request has not been approved at this time.

Please contact staff if you have questions.
        `;

        return { subject, html, text };
    }

    private getEventResultsTemplate(data: any) {
        const subject = `🏁 ${data.event_name} - Results`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1>🏁 Event Results</h1>
                        <h2>${data.event_name}</h2>
                    </div>
                    <div style="background: #f9fafb; padding: 30px;">
                        <p>Hi ${data.pilot_name},</p>
                        <p>The results are in for ${data.event_name}!</p>
                        <div style="background: white; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 36px; margin: 10px 0;"><strong>#${data.your_position}</strong></p>
                            <p>out of ${data.total_participants} participants</p>
                            <p><strong>Your Score:</strong> ${data.your_score}</p>
                        </div>
                        <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #fbbf24; margin: 20px 0;">
                            <h3>🏆 Winner</h3>
                            <p><strong>${data.winner_name}</strong> - ${data.winner_score}</p>
                        </div>
                        ${data.reward_earned ? `
                            <div style="background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                                <h3>Your Rewards:</h3>
                                ${data.reward_earned.cash ? `<p>💰 $${data.reward_earned.cash}</p>` : ''}
                                ${data.reward_earned.badge ? `<p>🏆 ${data.reward_earned.badge}</p>` : ''}
                            </div>
                        ` : ''}
                        <a href="${data.leaderboard_url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Full Leaderboard</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Event Results: ${data.event_name}

Hi ${data.pilot_name},

Your Position: #${data.your_position} out of ${data.total_participants}
Your Score: ${data.your_score}

Winner: ${data.winner_name} - ${data.winner_score}

${data.reward_earned ? `
Your Rewards:
${data.reward_earned.cash ? `- $${data.reward_earned.cash}` : ''}
${data.reward_earned.badge ? `- ${data.reward_earned.badge}` : ''}
` : ''}

Full Leaderboard: ${data.leaderboard_url}
        `;

        return { subject, html, text };
    }

    private getGenericTemplate(type: EmailNotificationType, data: EmailTemplateData) {
        const subject = `Notification from ${data.va_name}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Notification</h2>
                    <p>Hi ${data.pilot_name},</p>
                    <p>You have a new notification from ${data.va_name}.</p>
                    <p>Type: ${type}</p>
                    <a href="${data.dashboard_url}">Visit Dashboard</a>
                </div>
            </body>
            </html>
        `;

        const text = `
Notification from ${data.va_name}

Hi ${data.pilot_name},

You have a new notification.
Type: ${type}

Visit: ${data.dashboard_url}
        `;

        return { subject, html, text };
    }
}

// Export singleton instance
export const emailService = new EmailService();

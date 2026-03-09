import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth();
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { testEmail } = await request.json();

        // Check environment variables
        const config = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET',
            from: process.env.SMTP_FROM,
        };

        console.log('[Email Test] Configuration:', config);

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
                minVersion: 'TLSv1.2',
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 15000,
        });

        // Verify connection
        console.log('[Email Test] Verifying SMTP connection...');
        await transporter.verify();
        console.log('[Email Test] SMTP connection verified successfully');

        // Send test email
        if (testEmail) {
            console.log('[Email Test] Sending test email to:', testEmail);
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: testEmail,
                subject: 'Test Email - Levant VA',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Email Test Successful</h2>
                        <p>This is a test email from Levant Virtual Airlines.</p>
                        <p>If you received this, your SMTP configuration is working correctly.</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    </div>
                `,
            });
            console.log('[Email Test] Email sent successfully:', info.messageId);

            return NextResponse.json({
                success: true,
                message: 'Email sent successfully',
                messageId: info.messageId,
                config: config,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'SMTP connection verified',
            config: config,
        });

    } catch (error: any) {
        console.error('[Email Test] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
        }, { status: 500 });
    }
}

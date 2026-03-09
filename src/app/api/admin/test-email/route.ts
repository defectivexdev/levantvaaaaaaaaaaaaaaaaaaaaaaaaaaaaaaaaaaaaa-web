import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';

const resolveDns = promisify(dns.resolve);

export async function POST(request: NextRequest) {
    // Declare variables outside try block for error handling scope
    const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET',
        from: process.env.SMTP_FROM,
    };
    let dnsResult = 'Unknown';

    try {
        const user = await verifyAuth();
        if (!user || user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { testEmail } = await request.json();

        console.log('[Email Test] Configuration:', config);

        // DNS Resolution Test
        try {
            const addresses = await resolveDns(process.env.SMTP_HOST || '', 'A');
            dnsResult = addresses.join(', ');
            console.log('[Email Test] DNS Resolution:', dnsResult);
        } catch (dnsError: any) {
            dnsResult = `DNS Error: ${dnsError.message}`;
            console.error('[Email Test] DNS Resolution Failed:', dnsError.message);
        }

        // Create transporter with extended timeouts
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
            connectionTimeout: 30000, // 30 seconds
            greetingTimeout: 30000,
            socketTimeout: 30000,
            logger: true, // Enable logging
            debug: true, // Enable debug output
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
            dns: dnsResult,
        });

    } catch (error: any) {
        console.error('[Email Test] Error:', error);
        
        // Provide detailed error information
        const errorResponse: any = {
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
            config: config,
        };

        // Add DNS info if available
        if (dnsResult) {
            errorResponse.dns = dnsResult;
        }

        // Add specific troubleshooting based on error type
        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
            errorResponse.troubleshooting = [
                'Your hosting provider may be blocking outbound SMTP connections',
                'Try contacting your hosting provider to allow SMTP on ports 465/587',
                'Consider using an SMTP relay service (SendGrid, Mailgun, Amazon SES)',
                'Check if your server has firewall rules blocking SMTP'
            ];
        } else if (error.code === 'EAUTH') {
            errorResponse.troubleshooting = [
                'SMTP credentials are incorrect',
                'Check SMTP_USER and SMTP_PASSWORD in your .env file',
                'Verify your email account allows SMTP authentication'
            ];
        }

        return NextResponse.json(errorResponse, { status: 500 });
    }
}

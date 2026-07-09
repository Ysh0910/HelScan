const nodemailer = require('nodemailer');

async function sendResetEmail(email, resetUrl) {
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    const messageText = `You requested a password reset on HelScan. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this, you can safely ignore this email.`;

    const messageHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-top: 0;">HelScan Password Reset</h2>
            <p>You requested a password reset for your HelScan account.</p>
            <p>Click the button below to reset your password. This link is valid for 15 minutes.</p>
            <div style="margin: 24px 0;">
                <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                If the button above does not work, copy and paste this URL into your browser:<br/>
                <a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
            <p style="color: #9ca3af; font-size: 11px;">If you did not request this, you can safely ignore this email.</p>
        </div>
    `;

    if (hasSmtp) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM || `"HelScan Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'HelScan Password Reset',
                text: messageText,
                html: messageHtml
            });

            console.log(`Password reset email sent to ${email} via SMTP.`);
            return true;
        } catch (error) {
            console.error('SMTP Email sending failed:', error.message);
            // Fallback to console log so it's not lost in local dev
            console.log('\n--- PASSWORD RESET EMAIL (FALLBACK LOG) ---');
            console.log(`To: ${email}`);
            console.log(`URL: ${resetUrl}`);
            console.log('-------------------------------------------\n');
            return false;
        }
    } else {
        console.log('\n--- PASSWORD RESET EMAIL (SMTP NOT CONFIGURED) ---');
        console.log(`To: ${email}`);
        console.log(`URL: ${resetUrl}`);
        console.log('--------------------------------------------------\n');
        return true;
    }
}

module.exports = { sendResetEmail };

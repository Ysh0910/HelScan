const nodemailer = require('nodemailer');

async function sendScanAlertEmail(ownerEmail, riderName, scanDetails) {
    const { ip, latitude, longitude, timestamp } = scanDetails;
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    const formattedTime = new Date(timestamp).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long'
    });

    const locationText = (latitude && longitude) 
        ? `Coordinates: ${latitude}, ${longitude}\nGoogle Maps Link: https://www.google.com/maps?q=${latitude},${longitude}` 
        : 'Location access was not granted or was unavailable.';

    const locationHtml = (latitude && longitude)
        ? `<p><strong>Location coordinates:</strong> ${latitude}, ${longitude}</p>
           <p><strong>Google Maps Link:</strong> <a href="https://www.google.com/maps?q=${latitude},${longitude}" style="color: #ef4444; font-weight: bold;">View Scan Location</a></p>`
        : `<p style="color: #ef4444; font-weight: 500;"><em>Location access was not granted by the scanner or was unavailable.</em></p>`;

    const messageText = `Hello,\n\nYour HelScan Emergency Medical ID (${riderName}) has been scanned.\n\nHere are the scan details:\n- Time: ${formattedTime}\n- Scanner IP Address: ${ip}\n- Geolocation: ${locationText}\n\nThis is a precautionary security measure to ensure responsible use.`;

    const messageHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-top: 0;">
                🚨 HelScan ID Scanned
            </h2>
            <p>Hello,</p>
            <p>Your HelScan Emergency Medical ID (<strong>${riderName}</strong>) has been scanned.</p>
            
            <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="margin-top: 0; font-weight: bold;">Scan Details:</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Scanner IP:</strong> ${ip}</p>
                ${locationHtml}
            </div>

            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                This automatic notification is a security feature to ensure you are aware of when and where your profile is accessed.
            </p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
            <p style="color: #9ca3af; font-size: 11px; text-align: center;">Powered by HelScan Support</p>
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
                from: process.env.SMTP_FROM || `"HelScan Alerts" <${process.env.SMTP_USER}>`,
                to: ownerEmail,
                subject: `🚨 HelScan ID Scanned: ${riderName}`,
                text: messageText,
                html: messageHtml
            });

            console.log(`Scan alert email sent to ${ownerEmail} for rider ${riderName}.`);
            return true;
        } catch (error) {
            console.error('SMTP Scan Alert Email sending failed:', error.message);
            // Fallback to console log so it's not lost
            console.log('\n--- SCAN ALERT EMAIL (FALLBACK LOG) ---');
            console.log(`To: ${ownerEmail}`);
            console.log(`Rider: ${riderName}`);
            console.log(`IP: ${ip}`);
            console.log(`Coordinates: ${latitude}, ${longitude}`);
            console.log(`Time: ${formattedTime}`);
            console.log('----------------------------------------\n');
            return false;
        }
    } else {
        console.log('\n--- SCAN ALERT EMAIL (SMTP NOT CONFIGURED) ---');
        console.log(`To: ${ownerEmail}`);
        console.log(`Rider: ${riderName}`);
        console.log(`IP: ${ip}`);
        console.log(`Coordinates: ${latitude}, ${longitude}`);
        console.log(`Time: ${formattedTime}`);
        console.log('----------------------------------------------\n');
        return true;
    }
}

module.exports = { sendScanAlertEmail };

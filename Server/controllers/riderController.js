const User = require('../models/user');
const AuthUser = require('../models/authUser');
const { buildTranslations } = require('../utils/translate');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'helscan-dev-secret-change-in-prod';

// GET /rider/:id
async function getRider(req, res) {
    try {
        const rider = await User.findById(req.params.id);
        if (!rider) return res.status(404).json({ message: 'Rider not found' });
        res.status(200).json(rider);
    } catch (error) {
        console.error('Error fetching rider:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// POST /riderform
async function createRider(req, res) {
    try {
        const newRider = new User(req.body);
        const savedUser = await newRider.save();

        // Link riderId on the auth account if authenticated
        if (req.user?.userId) {
            await AuthUser.findByIdAndUpdate(req.user.userId, { riderId: savedUser._id });
        }

        // Respond immediately — translation runs in the background
        res.status(201).json({ message: 'Saved', id: savedUser._id });

        buildTranslations(savedUser)
            .then(async (translations) => {
                await User.findByIdAndUpdate(savedUser._id, { $set: { translations } });
                console.log(`Translations stored for rider ${savedUser._id}`);
            })
            .catch((err) => {
                console.error('Translation error (non-fatal):', err.message);
            });

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: error.message });
    }
}

// GET /download-qr/:id
async function downloadQR(req, res) {
    try {
        const { id } = req.params;
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, "");
        const publicUrl = `${clientUrl}/rider/${id}`;

        const qrBuffer = await QRCode.toBuffer(publicUrl, {
            width: 500,
            margin: 1,
            errorCorrectionLevel: 'H',
        });

        const PAGE_W = 216; // 3in
        const PAGE_H = 180; // 2.5in

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        const qrImage = await pdfDoc.embedPng(qrBuffer);

        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Helper to center text horizontally
        const centerX = (text, size, font) => (PAGE_W - font.widthOfTextAtSize(text, size)) / 2;

        const RED = rgb(0.78, 0.06, 0.09);
        const DARK = rgb(0.15, 0.15, 0.15);
        const GREY = rgb(0.45, 0.45, 0.45);
        const LIGHT_GREY = rgb(0.8, 0.8, 0.8);

        // --- Dashed cut-guide border (helps whoever trims the sticker) ---
        page.drawRectangle({
            x: 3, y: 3, width: PAGE_W - 6, height: PAGE_H - 6,
            borderColor: LIGHT_GREY, borderWidth: 0.75,
            borderDashArray: [3, 3],
        });

        // --- Header banner ---
        const bannerY = PAGE_H - 28;
        page.drawRectangle({ x: 0, y: bannerY, width: PAGE_W, height: 28, color: RED });

        // Simple white cross icon
        const crossX = 16, crossY = bannerY + 14;
        page.drawRectangle({ x: crossX - 5, y: crossY - 1.5, width: 10, height: 3, color: rgb(1, 1, 1) });
        page.drawRectangle({ x: crossX - 1.5, y: crossY - 5, width: 3, height: 10, color: rgb(1, 1, 1) });

        const title = 'EMERGENCY MEDICAL ID';
        page.drawText(title, {
            x: centerX(title, 11, fontBold) + 6, // slight offset to balance icon
            y: bannerY + 10,
            size: 11,
            font: fontBold,
            color: rgb(1, 1, 1),
        });

        // --- QR frame (white quiet zone + thin red border) ---
        const frameSize = 100;
        const frameX = (PAGE_W - frameSize) / 2;
        const frameY = 44;

        page.drawRectangle({
            x: frameX, y: frameY, width: frameSize, height: frameSize,
            color: rgb(1, 1, 1),
            borderColor: RED, borderWidth: 1.25,
        });

        const qrSize = frameSize - 12;
        page.drawImage(qrImage, {
            x: frameX + 6, y: frameY + 6, width: qrSize, height: qrSize,
        });

        // --- Call to action ---
        const cta = 'SCAN FOR MEDICAL INFO';
        page.drawText(cta, {
            x: centerX(cta, 8, fontBold), y: 30, size: 8, font: fontBold, color: DARK,
        });

        const subtitle = 'In case of an accident, please scan this code';
        page.drawText(subtitle, {
            x: centerX(subtitle, 6, fontRegular), y: 21, size: 6, font: fontRegular, color: GREY,
        });

        // --- Footer divider + ID ---
        page.drawLine({
            start: { x: 20, y: 13 }, end: { x: PAGE_W - 20, y: 13 },
            thickness: 0.5, color: LIGHT_GREY,
        });

        const idText = `ID: ${id}`;
        page.drawText(idText, {
            x: centerX(idText, 6.5, fontRegular), y: 5, size: 6.5, font: fontRegular, color: GREY,
        });

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sticker-${id}.pdf`);
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).send('Error generating PDF');
    }
}

// PATCH /rider/:id
async function updateRider(req, res) {
    try {
        const authUser = await AuthUser.findById(req.user.userId).select('riderId');
        if (!authUser) return res.status(401).json({ error: 'Not authenticated' });
        if (!authUser.riderId || String(authUser.riderId) !== String(req.params.id)) {
            return res.status(403).json({ error: 'You do not have permission to update this rider profile' });
        }

        const updates = req.body;

        // Remove fields that shouldn't be patched directly
        delete updates._id;
        delete updates.createdAt;
        delete updates.translations;

        // Fetch the existing rider to check for photo change
        const existingRider = await User.findById(req.params.id);
        if (existingRider && updates.photo && existingRider.photo && updates.photo !== existingRider.photo) {
            const { extractPublicId, deleteCloudinaryImage } = require('../utils/cloudinary');
            const publicId = extractPublicId(existingRider.photo);
            if (publicId) {
                deleteCloudinaryImage(publicId).catch((err) =>
                    console.error('Cloudinary delete error:', err.message)
                );
            }
        }

        const rider = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        );
        if (!rider) return res.status(404).json({ message: 'Rider not found' });

        res.status(200).json({ message: 'Updated', id: rider._id });

        // Re-run translations in background
        buildTranslations(rider)
            .then(async (translations) => {
                await User.findByIdAndUpdate(rider._id, { $set: { translations } });
            })
            .catch((err) => console.error('Translation error (non-fatal):', err.message));
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
}

// POST /rider/:id/scan
async function logScanEvent(req, res) {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;

        const rider = await User.findById(id);
        if (!rider) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        const owner = await AuthUser.findOne({ riderId: id });
        if (!owner) {
            console.warn(`Scan logged for rider ${id} but no owner email found.`);
            return res.status(200).json({ message: 'Scan logged (no owner account)' });
        }

        // --- Solution A: Ignore common crawler/preview bots ---
        const userAgent = req.headers['user-agent'] || '';
        const isBot = /bot|crawler|spider|facebookexternalhit|whatsapp|slack|telegram/i.test(userAgent);
        if (isBot) {
            console.log(`Scan logged but visitor is a bot/crawler: "${userAgent}". Skipping alert email.`);
            return res.status(200).json({ message: 'Scan logged (bot ignored)' });
        }

        // --- Solution B: Ignore views by the profile owner ---
        let isOwner = false;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.slice(7);
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded && String(decoded.userId) === String(owner._id)) {
                    isOwner = true;
                }
            } catch (err) {
                // If invalid token, just treat as normal visitor
            }
        }

        if (isOwner) {
            console.log(`Scan logged but visitor is the profile owner. Skipping alert email.`);
            return res.status(200).json({ message: 'Scan logged (owner visit ignored)' });
        }

        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const ip = rawIp.split(',')[0].trim();
        const riderName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || 'Emergency ID';

        const { sendScanAlertEmail } = require('../utils/scanEmail');
        await sendScanAlertEmail(owner.email, riderName, {
            ip,
            latitude,
            longitude,
            timestamp: new Date()
        });

        res.status(200).json({ message: 'Scan logged and owner notified' });
    } catch (error) {
        console.error('Error logging scan event:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

module.exports = { getRider, createRider, downloadQR, updateRider, logScanEvent };


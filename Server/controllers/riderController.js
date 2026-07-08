const User = require('../models/user');
const AuthUser = require('../models/authUser');
const { buildTranslations } = require('../utils/translate');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');

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
            width: 400,
            margin: 1,
            errorCorrectionLevel: 'H',
        });

        const pdfDoc = await PDFDocument.create();
        const page   = pdfDoc.addPage([216, 144]);
        const qrImage = await pdfDoc.embedPng(qrBuffer);
        const font    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        page.drawRectangle({ x: 0, y: 120, width: 216, height: 24, color: rgb(0.8, 0, 0) });
        page.drawText('EMERGENCY MEDICAL ID', {
            x: 45, y: 127, size: 10, font, color: rgb(1, 1, 1),
        });
        page.drawImage(qrImage, { x: 58, y: 20, width: 100, height: 100 });
        page.drawText(`ID: ${id}`, {
            x: 10, y: 5, size: 8, color: rgb(0.5, 0.5, 0.5),
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

module.exports = { getRider, createRider, downloadQR, updateRider };


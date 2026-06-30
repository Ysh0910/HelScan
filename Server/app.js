const express = require("express");
const app = express();
const port = 3000;
var cors = require('cors');
var methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/user");
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const translate = require('google-translate-api-x');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.json());

const MONGO_URL = "mongodb://127.0.0.1:27017/HelScan";

main()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Error connecting to MongoDB:", err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

// ── Translation helper ──────────────────────────────────────────────────────

const SUPPORTED_LANGS = ['hi', 'kn']; // English is the source, no need to translate to 'en'

/**
 * Translates a single string to the target language.
 * Returns the original string if translation fails (graceful fallback).
 */
async function translateText(text, targetLang) {
    if (!text || typeof text !== 'string' || text.trim() === '') return text;
    try {
        const result = await translate(text, { from: 'en', to: targetLang });
        return result.text;
    } catch {
        return text; // fall back to original on error
    }
}

/**
 * Builds the translations map for a rider document.
 * Only text fields are translated; booleans, dates, numbers and phone numbers stay as-is.
 */
async function buildTranslations(rider) {
    const translations = {};

    for (const lang of SUPPORTED_LANGS) {
        // Translate each field independently so one failure doesn't block the rest
        const [
            firstName,
            lastName,
            identificationMark,
            allergies,
            medicalConditions,
            currentMedications,
            previousSurgeriesOrImplants,
            vehicleModel,
            homeCity,
            insuranceProviderName,
        ] = await Promise.all([
            translateText(rider.firstName, lang),
            translateText(rider.lastName, lang),
            translateText(rider.identificationMark, lang),
            translateText((rider.allergies || []).join(', '), lang),
            translateText((rider.medicalConditions || []).join(', '), lang),
            translateText(rider.currentMedications, lang),
            translateText(rider.previousSurgeriesOrImplants, lang),
            translateText(rider.vehicleModel, lang),
            translateText(rider.homeCity, lang),
            translateText(rider.insurance?.providerName, lang),
        ]);

        // Translate emergency contact names and relations (phones stay untouched)
        const emergencyContacts = await Promise.all(
            (rider.emergencyContacts || []).map(async (c) => ({
                name:     await translateText(c.name, lang),
                relation: await translateText(c.relation, lang),
                phone:    c.phone, // never translate phone numbers
            }))
        );

        translations[lang] = {
            firstName,
            lastName,
            identificationMark,
            allergies,
            medicalConditions,
            currentMedications,
            previousSurgeriesOrImplants,
            vehicleModel,
            homeCity,
            insuranceProviderName,
            emergencyContacts,
        };
    }

    return translations;
}

// ── Routes ──────────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
    res.send("HelScan API running");
});

app.get('/rider/:id', async (req, res) => {
    try {
        const rider = await User.findById(req.params.id);
        if (!rider) return res.status(404).json({ message: "Rider not found" });
        res.status(200).json(rider);
    } catch (error) {
        console.error("Error fetching rider:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post("/riderform", async (req, res) => {
    try {
        const details = req.body;
        const newRider = new User(details);
        const savedUser = await newRider.save();

        // Build translations in the background after responding so the client
        // isn't kept waiting. We fire-and-forget and patch the document.
        res.status(201).json({ message: "Saved", id: savedUser._id });

        // Async translation — does not affect the response already sent
        buildTranslations(savedUser)
            .then(async (translations) => {
                await User.findByIdAndUpdate(savedUser._id, { $set: { translations } });
                console.log(`Translations stored for rider ${savedUser._id}`);
            })
            .catch((err) => {
                console.error("Translation error (non-fatal):", err.message);
            });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/download-qr/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const publicUrl = `http://localhost:5173/rider/${id}`;

        const qrBuffer = await QRCode.toBuffer(publicUrl, {
            width: 400,
            margin: 1,
            errorCorrectionLevel: 'H'
        });

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([216, 144]);
        const qrImage = await pdfDoc.embedPng(qrBuffer);

        page.drawRectangle({ x: 0, y: 120, width: 216, height: 24, color: rgb(0.8, 0, 0) });

        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
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
        console.error(error);
        res.status(500).send("Error generating PDF");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

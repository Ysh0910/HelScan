const translate = require('google-translate-api-x');

const SUPPORTED_LANGS = ['hi', 'kn'];

/**
 * Translates a single string. Returns original on failure.
 */
async function translateText(text, targetLang) {
    if (!text || typeof text !== 'string' || text.trim() === '') return text;
    try {
        const result = await translate(text, { from: 'en', to: targetLang });
        return result.text;
    } catch {
        return text;
    }
}

/**
 * Builds the full translations map for a rider document.
 * Only translates text fields — phones, dates, booleans, numbers are untouched.
 */
async function buildTranslations(rider) {
    const translations = {};

    for (const lang of SUPPORTED_LANGS) {
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

        const emergencyContacts = await Promise.all(
            (rider.emergencyContacts || []).map(async (c) => ({
                name:     await translateText(c.name, lang),
                relation: await translateText(c.relation, lang),
                phone:    c.phone,
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

module.exports = { buildTranslations };

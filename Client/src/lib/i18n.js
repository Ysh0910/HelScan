export const LANGS = [
  { code: "en", label: "EN", native: "English" },
  { code: "hi", label: "हिं", native: "हिन्दी" },
  { code: "kn", label: "ಕ", native: "ಕನ್ನಡ" },
];

export const T = {
  emergencyId: {
    en: "EMERGENCY MEDICAL ID",
    hi: "आपातकालीन चिकित्सा पहचान",
    kn: "ತುರ್ತು ವೈದ್ಯಕೀಯ ಗುರುತು",
  },
  bloodGroup: { en: "Blood Group", hi: "रक्त समूह", kn: "ರಕ್ತದ ಗುಂಪು" },
  dob: { en: "Date of Birth", hi: "जन्म तिथि", kn: "ಜನ್ಮ ದಿನಾಂಕ" },
  physical: {
    en: "Physical Details",
    hi: "शारीरिक विवरण",
    kn: "ದೈಹಿಕ ವಿವರಗಳು",
  },
  height: { en: "Height", hi: "ऊंचाई", kn: "ಎತ್ತರ" },
  weight: { en: "Weight", hi: "वज़न", kn: "ತೂಕ" },
  identificationMark: {
    en: "Identification Mark",
    hi: "पहचान चिन्ह",
    kn: "ಗುರುತಿನ ಚಿಹ್ನೆ",
  },
  medical: {
    en: "Medical Information",
    hi: "चिकित्सा जानकारी",
    kn: "ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ",
  },
  allergies: { en: "Allergies", hi: "एलर्जी", kn: "ಅಲರ್ಜಿಗಳು" },
  conditions: {
    en: "Medical Conditions",
    hi: "चिकित्सीय स्थितियाँ",
    kn: "ವೈದ್ಯಕೀಯ ಸ್ಥಿತಿಗಳು",
  },
  medications: {
    en: "Current Medications",
    hi: "वर्तमान दवाइयाँ",
    kn: "ಪ್ರಸ್ತುತ ಔಷಧಗಳು",
  },
  surgeries: {
    en: "Previous Surgeries / Implants",
    hi: "पिछली सर्जरी / प्रत्यारोपण",
    kn: "ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳು / ಇಂಪ್ಲಾಂಟ್‌ಗಳು",
  },
  organDonor: { en: "Organ Donor", hi: "अंगदाता", kn: "ಅಂಗ ದಾನಿ" },
  bloodDonor: {
    en: "Blood Donor Card",
    hi: "रक्तदाता कार्ड",
    kn: "ರಕ್ತದಾನಿ ಕಾರ್ಡ್",
  },
  yes: { en: "Yes", hi: "हाँ", kn: "ಹೌದು" },
  no: { en: "No", hi: "नहीं", kn: "ಇಲ್ಲ" },
  emergencyContacts: {
    en: "Emergency Contacts",
    hi: "आपातकालीन संपर्क",
    kn: "ತುರ್ತು ಸಂಪರ್ಕಗಳು",
  },
  insurance: { en: "Insurance", hi: "बीमा", kn: "ವಿಮೆ" },
  provider: { en: "Provider", hi: "प्रदाता", kn: "ಪೂರೈಕೆದಾರ" },
  policyNumber: {
    en: "Policy Number",
    hi: "पॉलिसी संख्या",
    kn: "ಪಾಲಿಸಿ ಸಂಖ್ಯೆ",
  },
  vehicle: { en: "Vehicle", hi: "वाहन", kn: "ವಾಹನ" },
  registration: { en: "Registration", hi: "पंजीकरण", kn: "ನೋಂದಣಿ" },
  model: { en: "Model", hi: "मॉडल", kn: "ಮಾದರಿ" },
  homeCity: { en: "Home City", hi: "गृह शहर", kn: "ಸ್ವಂತ ನಗರ" },
  translationsLoading: {
    en: "(translations loading...)",
    hi: "(अनुवाद लोड हो रहा है...)",
    kn: "(ಅನುವಾದಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...)",
  },
  callNow: { en: "Call", hi: "कॉल", kn: "ಕರೆ" },
};

export function t(key, lang) {
  return T[key]?.[lang] ?? T[key]?.en ?? String(key);
}

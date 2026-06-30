import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
];

const ProfilePage = () => {
    const { id } = useParams();
    const [riderData, setRiderData] = useState(null);
    const [error, setError] = useState(null);
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const fetchRider = async () => {
            try {
                const response = await fetch(`http://localhost:3000/rider/${id}`);
                if (!response.ok) throw new Error('Rider not found');
                const rider = await response.json();
                setRiderData(rider);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRider();
    }, [id]);

    if (error) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'red' }}>{error}</div>;
    if (!riderData) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Searching for rider records...</div>;

    // Pick translated values if available, fall back to original English fields
    const t = (lang !== 'en' && riderData.translations?.[lang]) ? riderData.translations[lang] : null;

    const get = (enValue, transKey) => (t && t[transKey]) ? t[transKey] : enValue;

    const firstName  = get(riderData.firstName,  'firstName');
    const lastName   = get(riderData.lastName,   'lastName');
    const idMark     = get(riderData.identificationMark, 'identificationMark');
    const allergies  = t?.allergies  || (riderData.allergies || []).join(', ');
    const conditions = t?.medicalConditions || (riderData.medicalConditions || []).join(', ');
    const meds       = get(riderData.currentMedications, 'currentMedications');
    const surgeries  = get(riderData.previousSurgeriesOrImplants, 'previousSurgeriesOrImplants');
    const vehicle    = get(riderData.vehicleModel, 'vehicleModel');
    const city       = get(riderData.homeCity, 'homeCity');
    const insurer    = t?.insuranceProviderName || riderData.insurance?.providerName;

    // Emergency contacts — use translated names/relations if available
    const rawContacts = riderData.emergencyContacts || [];
    const transContacts = t?.emergencyContacts || [];
    const contacts = rawContacts.map((c, i) => ({
        name:     transContacts[i]?.name     || c.name,
        relation: transContacts[i]?.relation || c.relation,
        phone:    c.phone, // never translated
    }));

    // UI label maps per language
    const labels = {
        en: {
            header: 'EMERGENCY MEDICAL ID',
            bloodGroup: 'Blood Group', dob: 'DOB',
            physical: 'Physical Details', height: 'Height', weight: 'Weight', idMark: 'Identification Mark',
            medical: 'Medical Information', allergies: 'Allergies', conditions: 'Medical Conditions',
            medications: 'Current Medications', organDonor: 'Organ Donor', bloodDonor: 'Blood Donor Card',
            surgeries: 'Previous Surgeries / Implants',
            emergency: 'Emergency Contacts',
            insurance: 'Insurance', provider: 'Provider', policy: 'Policy Number',
            vehicle: 'Vehicle Information', reg: 'Registration', model: 'Model', city: 'Home City',
            yes: 'Yes', no: 'No', translating: '(translations loading...)',
        },
        hi: {
            header: 'आपातकालीन चिकित्सा पहचान',
            bloodGroup: 'रक्त समूह', dob: 'जन्म तिथि',
            physical: 'शारीरिक विवरण', height: 'ऊंचाई', weight: 'वजन', idMark: 'पहचान चिह्न',
            medical: 'चिकित्सा जानकारी', allergies: 'एलर्जी', conditions: 'चिकित्सा स्थितियाँ',
            medications: 'वर्तमान दवाएं', organDonor: 'अंग दाता', bloodDonor: 'रक्त दाता कार्ड',
            surgeries: 'पूर्व सर्जरी / प्रत्यारोपण',
            emergency: 'आपातकालीन संपर्क',
            insurance: 'बीमा', provider: 'प्रदाता', policy: 'पॉलिसी नंबर',
            vehicle: 'वाहन जानकारी', reg: 'पंजीकरण', model: 'मॉडल', city: 'गृह नगर',
            yes: 'हाँ', no: 'नहीं', translating: '(अनुवाद लोड हो रहा है...)',
        },
        kn: {
            header: 'ತುರ್ತು ವೈದ್ಯಕೀಯ ಗುರುತಿನ ಚೀಟಿ',
            bloodGroup: 'ರಕ್ತದ ಗುಂಪು', dob: 'ಹುಟ್ಟಿದ ದಿನ',
            physical: 'ದೈಹಿಕ ವಿವರಗಳು', height: 'ಎತ್ತರ', weight: 'ತೂಕ', idMark: 'ಗುರುತಿನ ಚಿಹ್ನೆ',
            medical: 'ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ', allergies: 'ಅಲರ್ಜಿಗಳು', conditions: 'ವೈದ್ಯಕೀಯ ಪರಿಸ್ಥಿತಿಗಳು',
            medications: 'ಪ್ರಸ್ತುತ ಔಷಧಗಳು', organDonor: 'ಅಂಗ ದಾನಿ', bloodDonor: 'ರಕ್ತ ದಾನಿ ಕಾರ್ಡ್',
            surgeries: 'ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ / ಅಳವಡಿಕೆ',
            emergency: 'ತುರ್ತು ಸಂಪರ್ಕಗಳು',
            insurance: 'ವಿಮೆ', provider: 'ಪೂರೈಕೆದಾರ', policy: 'ಪಾಲಿಸಿ ಸಂಖ್ಯೆ',
            vehicle: 'ವಾಹನ ಮಾಹಿತಿ', reg: 'ನೋಂದಣಿ', model: 'ಮಾದರಿ', city: 'ತವರು ನಗರ',
            yes: 'ಹೌದು', no: 'ಇಲ್ಲ', translating: '(ಅನುವಾದ ಲೋಡ್ ಆಗುತ್ತಿದೆ...)',
        },
    };

    const L = labels[lang];
    const translationPending = lang !== 'en' && !riderData.translations?.[lang];

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>

            {/* Language selector */}
            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}
                >
                    {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                </select>
            </div>

            {translationPending && (
                <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                    {L.translating}
                </p>
            )}

            {/* Header */}
            <div style={{ background: '#cc0000', color: '#fff', padding: '12px', textAlign: 'center', borderRadius: '6px 6px 0 0' }}>
                <h2 style={{ margin: 0 }}>{L.header}</h2>
            </div>

            {/* Photo + Basic */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #ddd', borderTop: 'none' }}>
                {riderData.photo
                    ? <img src={riderData.photo} alt="Rider" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                    : <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>No photo</div>
                }
                <div>
                    <h2 style={{ margin: '0 0 4px' }}>{firstName} {lastName}</h2>
                    <p style={{ margin: '2px 0', color: '#cc0000', fontWeight: 'bold', fontSize: '18px' }}>{L.bloodGroup}: {riderData.bloodGroup}</p>
                    {riderData.dob && <p style={{ margin: '2px 0', color: '#555' }}>{L.dob}: {new Date(riderData.dob).toLocaleDateString()}</p>}
                </div>
            </div>

            {/* Physical */}
            <Section title={L.physical}>
                <Row label={L.height} value={riderData.height ? `${riderData.height} cm` : null} />
                <Row label={L.weight} value={riderData.weight ? `${riderData.weight} kg` : null} />
                <Row label={L.idMark} value={idMark} />
            </Section>

            {/* Medical */}
            <Section title={L.medical}>
                <Row label={L.allergies}   value={allergies} />
                <Row label={L.conditions}  value={conditions} />
                <Row label={L.medications} value={meds} />
                <Row label={L.organDonor}  value={riderData.organDonor  ? L.yes : null} />
                <Row label={L.bloodDonor}  value={riderData.bloodDonorCard ? L.yes : null} />
                <Row label={L.surgeries}   value={surgeries} />
            </Section>

            {/* Emergency Contacts */}
            {contacts.filter(c => c.phone).length > 0 && (
                <Section title={L.emergency}>
                    {contacts.map((c, i) => (
                        c.phone && (
                            <div key={i} style={{ marginBottom: '8px' }}>
                                <strong>{c.name || `Contact ${i + 1}`}</strong>
                                {c.relation && <span style={{ color: '#555' }}> ({c.relation})</span>}
                                {' — '}
                                <a href={`tel:${c.phone}`} style={{ color: '#cc0000' }}>{c.phone}</a>
                            </div>
                        )
                    ))}
                </Section>
            )}

            {/* Insurance */}
            {(insurer || riderData.insurance?.policyNumber) && (
                <Section title={L.insurance}>
                    <Row label={L.provider} value={insurer} />
                    <Row label={L.policy}   value={riderData.insurance?.policyNumber} />
                </Section>
            )}

            {/* Vehicle */}
            <Section title={L.vehicle}>
                <Row label={L.reg}   value={riderData.vehicleRegistration} />
                <Row label={L.model} value={vehicle} />
                <Row label={L.city}  value={city} />
            </Section>

        </div>
    );
};

const Section = ({ title, children }) => (
    <div style={{ border: '1px solid #ddd', borderTop: 'none', padding: '12px 16px' }}>
        <h3 style={{ margin: '0 0 8px', color: '#cc0000', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
        {children}
    </div>
);

const Row = ({ label, value }) => {
    if (!value) return null;
    return (
        <p style={{ margin: '4px 0' }}>
            <span style={{ color: '#555', marginRight: '6px' }}>{label}:</span>
            <strong>{value}</strong>
        </p>
    );
};

export default ProfilePage;

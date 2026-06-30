import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchRider } from '../api/rider';
import { LABELS } from '../constants/profileLabels';
import Section from '../components/Section';
import Row from '../components/Row';
import LanguageSelect from '../components/LanguageSelect';

export default function ProfilePage() {
    const { id } = useParams();
    const [riderData, setRiderData] = useState(null);
    const [error, setError]         = useState(null);
    const [lang, setLang]           = useState('en');

    useEffect(() => {
        fetchRider(id)
            .then(setRiderData)
            .catch((err) => setError(err.message));
    }, [id]);

    if (error)     return <p style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>{error}</p>;
    if (!riderData) return <p style={{ textAlign: 'center', marginTop: 40 }}>Searching for rider records...</p>;

    const L  = LABELS[lang];
    const t  = lang !== 'en' ? riderData.translations?.[lang] : null;
    const get = (enVal, key) => (t?.[key]) || enVal;

    const firstName  = get(riderData.firstName, 'firstName');
    const lastName   = get(riderData.lastName,  'lastName');
    const idMark     = get(riderData.identificationMark, 'identificationMark');
    const allergies  = t?.allergies      || (riderData.allergies  || []).join(', ');
    const conditions = t?.medicalConditions || (riderData.medicalConditions || []).join(', ');
    const meds       = get(riderData.currentMedications, 'currentMedications');
    const surgeries  = get(riderData.previousSurgeriesOrImplants, 'previousSurgeriesOrImplants');
    const vehicle    = get(riderData.vehicleModel, 'vehicleModel');
    const city       = get(riderData.homeCity, 'homeCity');
    const insurer    = t?.insuranceProviderName || riderData.insurance?.providerName;

    const rawContacts   = riderData.emergencyContacts || [];
    const transContacts = t?.emergencyContacts || [];
    const contacts = rawContacts.map((c, i) => ({
        name:     transContacts[i]?.name     || c.name,
        relation: transContacts[i]?.relation || c.relation,
        phone:    c.phone,
    }));

    const translationPending = lang !== 'en' && !riderData.translations?.[lang];

    return (
        <div style={{ maxWidth: 600, margin: '20px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>

            <LanguageSelect value={lang} onChange={setLang} />

            {translationPending && (
                <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 8 }}>
                    {L.translating}
                </p>
            )}

            {/* Header */}
            <div style={{ background: '#cc0000', color: '#fff', padding: 12, textAlign: 'center', borderRadius: '6px 6px 0 0' }}>
                <h2 style={{ margin: 0 }}>{L.header}</h2>
            </div>

            {/* Photo + Basic */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, border: '1px solid #ddd', borderTop: 'none' }}>
                {riderData.photo
                    ? <img src={riderData.photo} alt="Rider" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                    : <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>No photo</div>
                }
                <div>
                    <h2 style={{ margin: '0 0 4px' }}>{firstName} {lastName}</h2>
                    <p style={{ margin: '2px 0', color: '#cc0000', fontWeight: 'bold', fontSize: 18 }}>{L.bloodGroup}: {riderData.bloodGroup}</p>
                    {riderData.dob && <p style={{ margin: '2px 0', color: '#555' }}>{L.dob}: {new Date(riderData.dob).toLocaleDateString()}</p>}
                </div>
            </div>

            <Section title={L.physical}>
                <Row label={L.height} value={riderData.height ? `${riderData.height} cm` : null} />
                <Row label={L.weight} value={riderData.weight ? `${riderData.weight} kg` : null} />
                <Row label={L.idMark} value={idMark} />
            </Section>

            <Section title={L.medical}>
                <Row label={L.allergies}   value={allergies} />
                <Row label={L.conditions}  value={conditions} />
                <Row label={L.medications} value={meds} />
                <Row label={L.organDonor}  value={riderData.organDonor     ? L.yes : null} />
                <Row label={L.bloodDonor}  value={riderData.bloodDonorCard ? L.yes : null} />
                <Row label={L.surgeries}   value={surgeries} />
            </Section>

            {contacts.filter(c => c.phone).length > 0 && (
                <Section title={L.emergency}>
                    {contacts.map((c, i) => c.phone && (
                        <div key={i} style={{ marginBottom: 8 }}>
                            <strong>{c.name || `Contact ${i + 1}`}</strong>
                            {c.relation && <span style={{ color: '#555' }}> ({c.relation})</span>}
                            {' — '}
                            <a href={`tel:${c.phone}`} style={{ color: '#cc0000' }}>{c.phone}</a>
                        </div>
                    ))}
                </Section>
            )}

            {(insurer || riderData.insurance?.policyNumber) && (
                <Section title={L.insurance}>
                    <Row label={L.provider} value={insurer} />
                    <Row label={L.policy}   value={riderData.insurance?.policyNumber} />
                </Section>
            )}

            <Section title={L.vehicle}>
                <Row label={L.reg}   value={riderData.vehicleRegistration} />
                <Row label={L.model} value={vehicle} />
                <Row label={L.city}  value={city} />
            </Section>

        </div>
    );
}

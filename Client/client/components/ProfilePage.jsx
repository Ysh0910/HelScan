import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { id } = useParams();
  const [riderData, setRiderData] = useState(null);
  const [error, setError] = useState(null);

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

  const contacts = riderData.emergencyContacts || [];

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>

      {/* Header */}
      <div style={{ background: '#cc0000', color: '#fff', padding: '12px', textAlign: 'center', borderRadius: '6px 6px 0 0' }}>
        <h2 style={{ margin: 0 }}>EMERGENCY MEDICAL ID</h2>
      </div>

      {/* Photo + Basic */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #ddd', borderTop: 'none' }}>
        {riderData.photo
          ? <img src={riderData.photo} alt="Rider" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
          : <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>No photo</div>
        }
        <div>
          <h2 style={{ margin: '0 0 4px' }}>{riderData.firstName} {riderData.lastName}</h2>
          <p style={{ margin: '2px 0', color: '#cc0000', fontWeight: 'bold', fontSize: '18px' }}>Blood Group: {riderData.bloodGroup}</p>
          {riderData.dob && <p style={{ margin: '2px 0', color: '#555' }}>DOB: {new Date(riderData.dob).toLocaleDateString()}</p>}
        </div>
      </div>

      {/* Physical */}
      <Section title="Physical Details">
        <Row label="Height" value={riderData.height ? `${riderData.height} cm` : null} />
        <Row label="Weight" value={riderData.weight ? `${riderData.weight} kg` : null} />
        <Row label="Identification Mark" value={riderData.identificationMark} />
      </Section>

      {/* Medical */}
      <Section title="Medical Information">
        <Row label="Allergies" value={riderData.allergies?.join(', ')} />
        <Row label="Medical Conditions" value={riderData.medicalConditions?.join(', ')} />
        <Row label="Current Medications" value={riderData.currentMedications} />
        <Row label="Organ Donor" value={riderData.organDonor === true ? 'Yes' : riderData.organDonor === false ? 'No' : null} />
        <Row label="Blood Donor Card" value={riderData.bloodDonorCard === true ? 'Yes' : riderData.bloodDonorCard === false ? 'No' : null} />
        <Row label="Previous Surgeries / Implants" value={riderData.previousSurgeriesOrImplants} />
      </Section>

      {/* Emergency Contacts */}
      {contacts.length > 0 && (
        <Section title="Emergency Contacts">
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
      {(riderData.insurance?.providerName || riderData.insurance?.policyNumber) && (
        <Section title="Insurance">
          <Row label="Provider" value={riderData.insurance?.providerName} />
          <Row label="Policy Number" value={riderData.insurance?.policyNumber} />
        </Section>
      )}

      {/* Vehicle */}
      <Section title="Vehicle Information">
        <Row label="Registration" value={riderData.vehicleRegistration} />
        <Row label="Model" value={riderData.vehicleModel} />
        <Row label="Home City" value={riderData.homeCity} />
      </Section>

    </div>
  );
};

// Small helpers to keep the JSX clean
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

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchRider, getDownloadQRUrl } from '../api/rider';

export default function ResultPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rider, setRider] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRider(id)
            .then(setRider)
            .catch((err) => setError(err.message));
    }, [id]);

    if (error)  return <p style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>{error}</p>;
    if (!rider) return <p style={{ textAlign: 'center', marginTop: 40 }}>Generating your sticker...</p>;

    const publicUrl = `${window.location.origin}/rider/${id}`;
    const contacts  = (rider.emergencyContacts || []).filter(c => c.phone);

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center', fontFamily: 'sans-serif', padding: '0 16px' }}>
            <h2>Profile Created</h2>

            {/* Rider summary */}
            {rider.photo
                ? <img src={rider.photo} alt="Rider" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }} />
                : <p>No photo uploaded</p>
            }
            <h3 style={{ margin: '12px 0 4px' }}>{rider.firstName} {rider.lastName}</h3>
            <p style={{ color: '#cc0000', fontWeight: 'bold', fontSize: 18, margin: '4px 0' }}>
                Blood Group: {rider.bloodGroup}
            </p>

            {rider.vehicleRegistration && (
                <p style={{ margin: '4px 0' }}>
                    Vehicle: {rider.vehicleModel ? `${rider.vehicleModel} — ` : ''}{rider.vehicleRegistration}
                </p>
            )}

            {rider.insurance?.providerName && (
                <p style={{ margin: '4px 0' }}>
                    Insurance: {rider.insurance.providerName}
                    {rider.insurance.policyNumber ? ` — ${rider.insurance.policyNumber}` : ''}
                </p>
            )}

            {contacts.map((c, i) => (
                <p key={i} style={{ margin: '4px 0' }}>
                    Emergency Contact {i + 1}: {c.name} ({c.relation}) —{' '}
                    <a href={`tel:${c.phone}`} style={{ color: '#cc0000' }}>{c.phone}</a>
                </p>
            ))}

            {/* QR Code */}
            <div style={{ margin: '24px 0 8px' }}>
                <h3>Your Helmet QR Code</h3>
                <QRCodeSVG value={publicUrl} size={200} />
                <p style={{ color: '#888', fontSize: 12 }}>Sticker ID: {id}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <button
                    onClick={() => window.open(getDownloadQRUrl(id), '_blank')}
                    style={{ padding: '10px 24px', cursor: 'pointer', backgroundColor: '#cc0000', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15 }}
                >
                    Download PDF Sticker
                </button>
                <button
                    onClick={() => navigate('/')}
                    style={{ padding: '10px 24px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 6, fontSize: 15 }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const ResultPage = () => {
    const { id } = useParams();
    const [rider, setRider] = useState(null);

    useEffect(() => {
        const getRider = async () => {
            const response = await fetch(`http://localhost:3000/rider/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch rider');
            }

            const riderData = await response.json();
            setRider(riderData);
        };
        getRider();
    }, [id]);

    if (!rider) return <p>Generating your sticker...</p>;

    const publicUrl = `${window.location.origin}/u/${id}`;

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Profile Created!!</p>
            {/* --- ADDED: THE PHOTO & BASIC DETAILS --- */}
            <div>
                {rider.photo ? (
                    <img
                        src={rider.photo}
                        alt="Rider"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
                    />
                ) : (
                    <p>No photo uploaded</p>
                )}
                <h2>{rider.firstName} {rider.lastName}</h2>
                <h3 style={{ color: 'red' }}>Blood Group: {rider.bloodGroup}</h3>
            </div>
            {/* -------------------------------------- */}
            <h3>Your safety qr code</h3>
            <QRCodeSVG value={publicUrl} size={200} />
            <p>Sticker ID: {id}</p>
            <div>
                <p>Download pdf for helmet</p>
                <button
                    onClick={() => window.open(`http://localhost:3000/download-qr/${id}`, '_blank')}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    Download
                </button>
            </div>
        </div>
    )
}

export default ResultPage

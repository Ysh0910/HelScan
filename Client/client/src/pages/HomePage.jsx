import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>HelScan</h1>
            <p style={{ color: '#555', marginBottom: '40px' }}>
                Create your emergency medical ID. Stick the QR code on your helmet.
                First responders can scan it to get your critical info instantly.
            </p>
            <button
                onClick={() => navigate('/inputform')}
                style={{
                    padding: '12px 32px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#cc0000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                }}
            >
                Create My Profile
            </button>
        </div>
    );
}

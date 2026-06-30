export default function Row({ label, value }) {
    if (!value) return null;
    return (
        <p style={{ margin: '4px 0' }}>
            <span style={{ color: '#555', marginRight: '6px' }}>{label}:</span>
            <strong>{value}</strong>
        </p>
    );
}

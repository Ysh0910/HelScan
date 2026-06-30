export default function Section({ title, children }) {
    return (
        <div style={{ border: '1px solid #ddd', borderTop: 'none', padding: '12px 16px' }}>
            <h3 style={{
                margin: '0 0 8px',
                color: '#cc0000',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

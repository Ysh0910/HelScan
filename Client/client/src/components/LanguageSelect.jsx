import { LANGUAGES } from '../constants/profileLabels';

export default function LanguageSelect({ value, onChange }) {
    return (
        <div style={{ textAlign: 'right', marginBottom: '8px' }}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '14px', cursor: 'pointer' }}
            >
                {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                ))}
            </select>
        </div>
    );
}

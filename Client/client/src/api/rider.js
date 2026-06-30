const BASE_URL = 'http://localhost:3000';

export async function fetchRider(id) {
    const res = await fetch(`${BASE_URL}/rider/${id}`);
    if (!res.ok) throw new Error('Rider not found');
    return res.json();
}

export async function createRider(data) {
    const res = await fetch(`${BASE_URL}/riderform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save profile');
    return res.json();
}

export function getDownloadQRUrl(id) {
    return `${BASE_URL}/download-qr/${id}`;
}

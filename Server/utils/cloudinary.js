const crypto = require('crypto');
const https = require('https');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dbxwtln1c';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Extracts public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/dbxwtln1c/image/upload/v1720348271/HelScan_present/ab12cd34.png -> HelScan_present/ab12cd34
 */
function extractPublicId(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('res.cloudinary.com')) return null;
    
    try {
        const parts = url.split('/image/upload/');
        if (parts.length < 2) return null;
        
        let path = parts[1];
        // Remove version component (e.g. v1720348271)
        if (path.match(/^v\d+\//)) {
            const nextSlash = path.indexOf('/');
            if (nextSlash !== -1) {
                path = path.substring(nextSlash + 1);
            }
        }
        
        // Remove file extension
        const dotIndex = path.lastIndexOf('.');
        if (dotIndex !== -1) {
            path = path.substring(0, dotIndex);
        }
        return path;
    } catch (err) {
        console.error('Error parsing Cloudinary URL:', err);
        return null;
    }
}

/**
 * Deletes an image from Cloudinary using its public_id.
 */
async function deleteCloudinaryImage(publicId) {
    if (!publicId) return;
    if (!API_KEY || !API_SECRET) {
        console.warn('Cloudinary delete skipped: CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is not configured.');
        return;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const postData = JSON.stringify({
        public_id: publicId,
        timestamp: timestamp,
        api_key: API_KEY,
        signature: signature
    });

    const options = {
        hostname: 'api.cloudinary.com',
        port: 443,
        path: `/v1_1/${CLOUD_NAME}/image/destroy`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (result.result === 'ok') {
                        console.log(`Successfully deleted Cloudinary image: ${publicId}`);
                        resolve(result);
                    } else {
                        console.error(`Cloudinary deletion failed for ${publicId}:`, result);
                        resolve(null); // Resolve to prevent crashing the server
                    }
                } catch {
                    console.error(`Cloudinary response parsing failed for ${publicId}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`Cloudinary request error for ${publicId}:`, err.message);
            resolve(null); // Resolve to prevent crashing the server
        });

        req.write(postData);
        req.end();
    });
}

module.exports = { extractPublicId, deleteCloudinaryImage };

const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const generateBase32Secret = (length = 20) => {
    const bytes = crypto.randomBytes(length);
    let bits = '';
    let output = '';

    for (const byte of bytes) {
        bits += byte.toString(2).padStart(8, '0');
    }

    for (let i = 0; i + 5 <= bits.length; i += 5) {
        output += ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
    }

    return output;
};

const base32ToBuffer = (secret) => {
    const clean = secret.replace(/=+$/g, '').replace(/\s/g, '').toUpperCase();
    let bits = '';

    for (const char of clean) {
        const value = ALPHABET.indexOf(char);
        if (value === -1) {
            throw new Error('Invalid base32 secret');
        }
        bits += value.toString(2).padStart(5, '0');
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return Buffer.from(bytes);
};

const generateCode = (secret, timeStep = Math.floor(Date.now() / 30000)) => {
    const counter = Buffer.alloc(8);
    counter.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0);
    counter.writeUInt32BE(timeStep & 0xffffffff, 4);

    const hmac = crypto
        .createHmac('sha1', base32ToBuffer(secret))
        .update(counter)
        .digest();

    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    return String((binary >>> 0) % 1000000).padStart(6, '0');
};

const verifyCode = (secret, code, window = 1) => {
    if (!secret || !code) {
        return false;
    }

    const currentStep = Math.floor(Date.now() / 30000);
    const normalizedCode = String(code).padStart(6, '0');

    for (let offset = -window; offset <= window; offset += 1) {
        if (generateCode(secret, currentStep + offset) === normalizedCode) {
            return true;
        }
    }

    return false;
};

const buildOtpAuthUrl = (issuer, accountName, secret) => {
    const label = encodeURIComponent(`${issuer}:${accountName}`);
    const params = new URLSearchParams({
        secret,
        issuer,
        algorithm: 'SHA1',
        digits: '6',
        period: '30'
    });

    return `otpauth://totp/${label}?${params.toString()}`;
};

module.exports = {
    generateBase32Secret,
    verifyCode,
    buildOtpAuthUrl
};

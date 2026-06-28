const crypto = require('crypto');

const PREFIX = 'scrypt';
const KEY_LENGTH = 64;

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .scryptSync(password, salt, KEY_LENGTH)
        .toString('hex');

    return `${PREFIX}$${salt}$${hash}`;
};

const verifyPassword = (password, storedPassword) => {
    if (!storedPassword) {
        return false;
    }

    const parts = storedPassword.split('$');

    if (parts.length !== 3 || parts[0] !== PREFIX) {
        return password === storedPassword;
    }

    const [, salt, hash] = parts;
    const candidate = crypto
        .scryptSync(password, salt, KEY_LENGTH)
        .toString('hex');

    return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(candidate, 'hex')
    );
};

module.exports = {
    hashPassword,
    verifyPassword
};

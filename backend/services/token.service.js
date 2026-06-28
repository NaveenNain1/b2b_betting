const crypto = require('crypto');

const PersonalAccessToken = require('../models/PersonalAccessToken.model');

const createAccessToken = async (user, tokenableType, req, abilities = ['*']) => {
    const plainTextToken = crypto.randomBytes(48).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(plainTextToken)
        .digest('hex');

    await PersonalAccessToken.create({
        tokenable_id: user._id,
        tokenable_type: tokenableType,
        token: hashedToken,
        abilities,
        ip_address: req.ip,
        user_agent: req.get('user-agent') || null
    });

    return plainTextToken;
};

const hashToken = (plainTextToken) => {
    return crypto
        .createHash('sha256')
        .update(plainTextToken)
        .digest('hex');
};

module.exports = {
    createAccessToken,
    hashToken
};

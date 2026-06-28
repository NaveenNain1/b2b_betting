const mongoose = require('mongoose');

const personalAccessTokenSchema = new mongoose.Schema({

    tokenable_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    tokenable_type: {
        type: String,
        enum: ['Admin', 'SuperAdmin'],
        required: true
    },

    name: {
        type: String,
        default: 'auth_token'
    },

    token: {
        type: String,
        required: true,
        unique: true
    },

    abilities: {
        type: [String],
        default: ['*']
    },

    last_used_at: {
        type: Date,
        default: null
    },

    expires_at: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        'PersonalAccessToken',
        personalAccessTokenSchema
    );
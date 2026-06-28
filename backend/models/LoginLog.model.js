const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },

    super_admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        default: null
    },

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        default: null
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    status: {
        type: String,
        enum: ['success', 'failed'],
        required: true
    },

    login_type: {
        type: String,
        enum: ['admin', 'super_admin'],
        required: true
    },

    ip_address: {
        type: String,
        default: null
    },

    user_agent: {
        type: String,
        default: null
    },

    device: {
        type: String,
        default: null
    },

    location: {
        type: String,
        default: null
    },

    reason: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});

loginLogSchema.index({ email: 1 });

loginLogSchema.index({ tenant: 1 });

loginLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LoginLog', loginLogSchema);
const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },

    action: {
        type: String,
        required: true
    },

    module: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: null
    },

    ip_address: {
        type: String,
        default: null
    },

    user_agent: {
        type: String,
        default: null
    },

    meta: {
        type: Object,
        default: {}
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
const mongoose = require('mongoose');

const kycSettingSchema = new mongoose.Schema({

    is_kyc_required: {
        type: Boolean,
        default: false
    },

    kyc_fields: [
        {
            name: {
                type: String,
                required: true
            },

            type: {
                type: String,
                required: true,
                enum: [
                    'text',
                    'number',
                    'email',
                    'file',
                    'textarea',
                    'date'
                ]
            },

            is_required: {
                type: Boolean,
                default: false
            }
        }
    ],

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('KycSetting', kycSettingSchema);
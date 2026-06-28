const mongoose = require('mongoose');

const superOxapaySchema = new mongoose.Schema({

    api_key: {
        type: String,
        required: true
    },

    networks: [
        {
            network: {
                type: String,
                required: true
            },

            is_enabled: {
                type: Boolean,
                default: true
            }
        }
    ]

}, {
    timestamps: true
});

module.exports = mongoose.model('SuperOxapay', superOxapaySchema);
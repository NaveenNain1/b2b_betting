const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    price_per_month: {
        type: Number,
        required: true,
        min: 0
    },

    max_users: {
        type: Number,
        required: true,
        min: 1
    },

    sports_allowed: {
        type: Boolean,
        default: false
    },

    casino_allowed: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
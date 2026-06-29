const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    brand_name: {
        type: String,
        required: true
    },

    primary_domain: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    frontend_url: {
        type: String,
        required: true
    },
    logo_url:{
        type:String,
    },
    theme:{
        type:String,
        required:true,
        default:'default'
    },
    favicon_url:{
        type:String,
    },
    custom_css:{
        type:String,
    },
    website_title:{
        type:String,
        required:true
    },
    website_description:{
        type:String,
        required:true
    },
    is_banned:{
        type:Boolean,
        default:false
    },
    maintenance_mode:{
        type:Boolean,
        default:false
    },
    maintenance_mode_text:{
        type:String
    },
    subscription: {
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            default: null
        },
        status: {
            type: String,
            enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'],
            default: 'trial'
        },
        starts_at: {
            type: Date,
            default: Date.now
        },
        ends_at: {
            type: Date,
            default: null
        }
    },
    connected_domains: [
        {
            domain: {
                type: String,
                required: true,
                lowercase: true,
                trim: true
            },
            status: {
                type: String,
                enum: ['pending', 'verified', 'failed'],
                default: 'pending'
            },
            verified_at: {
                type: Date,
                default: null
            }
        }
    ],
    dns_records: [
        {
            type: {
                type: String
            },
            key: {
                type: String
            },
            value: {
                type: String
            },
            status: {
                type: String,
                enum: ['pending', 'verified'],
                default: 'pending'
            }
        }
    ],
    settings: {
        type: Object,
        default: {}
    },

    onboarding: {
        platform_types: [{ type: String }],
        target_region: { type: String, default: '' },
        launch_date: { type: String, default: '' },
        reference_platform: { type: String, default: '' },
        wallet: {
            single_wallet: { type: Boolean, default: null },
            separate_wallet_per_provider: { type: Boolean, default: null },
            auto_wallet_transfer: { type: Boolean, default: null },
            multi_currency: { type: Boolean, default: null }
        },
        agent: {
            structure: [{ type: String }],
            multi_level_commission: { type: Boolean, default: null },
            commission_levels: { type: Number, default: null }
        },
        affiliate: {
            models: [{ type: String }],
            levels: { type: Number, default: null }
        },
        kyc_security: {
            kyc_verification: { type: Boolean, default: false },
            aml: { type: Boolean, default: false },
            fraud_detection: { type: Boolean, default: false },
            device_fingerprinting: { type: Boolean, default: false },
            geo_blocking: { type: Boolean, default: false },
            realtime_reports: { type: Boolean, default: false },
            responsible_gaming: { type: Boolean, default: false }
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);

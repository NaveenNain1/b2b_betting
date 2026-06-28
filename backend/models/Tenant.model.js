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
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);

const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    brand_name: {
        type: String,
        required: true
    },

    primary_domain: {
        type: String,
        required: true
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
        required:true,
    },
    maintenance_mode:{
        type:Boolean,
        required:true
    },
    maintenance_mode_text:{
        type:String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);
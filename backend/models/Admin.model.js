const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true
   },
   email:{
    type:String,
    required:true,
    lowercase:true,
    trim:true,
   },
   password:{
    type:String,
    required:true,
   },
   type:{
    type:String, // admin/sub-admin
    required:true
   },
   permissions:{
    type:[String],
    default:[]
   },
   tenant:{
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Tenant',
    required:true,
   },
  second_factor_key:{
    type:String,
    default:null
   },
   is_2fa_enabled:{
    type:Boolean,
    default:false
   },
   status:{
    type:String,
    enum:['active','disabled'],
    default:'active'
   }

}, {
    timestamps: true
});

// Global unique email — one email address across ALL tenants
adminSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);

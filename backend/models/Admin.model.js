const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true
   },
   email:{
    type:String,
    required:true,
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
   }

}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);
const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true
   },
   email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
   },
   password:{
    type:String,
    required:true,
   },
   second_factor_key:{
    type:String, 
    default:null
   },
   is_2fa_enabled:{
    type:Boolean,
    default:false
   }
  

}, {
    timestamps: true
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema);

const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
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
   second_factor_key:{
    type:String, 
    default:null
   }
  

}, {
    timestamps: true
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
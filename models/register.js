const mongoose = require('mongoose');
var registermodel = mongoose.model('registermodel', 
{
    username: {type:String, required:true},email:{type: String, required:true},password: {type: String, required:true}


})
module.exports = {registermodel};
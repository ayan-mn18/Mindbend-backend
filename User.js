const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true ,
    }, 
    email : {
        type : String ,
        required : true ,
        unique : true 
    },
    picture : {
        type : String ,
        required : true ,
        unique : true
    },
    referralCode : {
        type : String ,
        unique : true
    }
})

const User = mongoose.model("User" ,userSchema);

module.exports = User;
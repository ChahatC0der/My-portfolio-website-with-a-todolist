const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    profilepic: String,
    password : String,
    isActive : {
        type : Boolean,
        default : true
    },
    
})
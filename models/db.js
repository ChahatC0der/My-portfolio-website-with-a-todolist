const mongoose = require("mongoose");

module.exports.init=async function(){
    await mongoose.connect('mongodb+srv://ChahatKukreja:chiman123@cluster0.vxnlruw.mongodb.net/?retryWrites=true&w=majority');
    console.log("Connected to MongoDB.")
}
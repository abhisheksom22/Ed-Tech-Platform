const mongoose = require("mongoose");
const profileSchema = mongoose.Schema({
    gender: {
        type:String,
    },
    dob: {
        type:String,
        
    },
    about: {
        type:String,
        
    },
    contatcNumber:{
        type:String,
        trim:true
    }
});

module.exports = mongoose.model("Profile",profileSchema);
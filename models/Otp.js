const mailSender = require("../utilities/mailSender");

const mongoose = rquire("mongoose");
const otpSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
});

//function to send email
async function sendVerificationEmail(email,otp){
    try {
        const mailResponse  = await mailSender(email,"Verification Email from Udemy",otp);
        console.log("Email sent successfully:", mailResponse);
    } catch (error) {
        console.log("Error in sending verification mail", error);
        throw error;
    }
}

otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.modle("Otp",otpSchema);
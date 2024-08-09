const User = require("../models/User");
const mailSender = require("../utilities/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");


//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
        //get email from req
        const email = req.body.email;
        //check user for this email
        const user = await User.findOne({ email });
        if (!user) {
            return res.satus(401).json({
                success: false,
                message: "User is not registered"
            })
        }
        //generate token
        const token = crypto.randomUUID();
        //user update by adding token and expiry time
        const updateUser = await User.findOneAndUpdate({ email }, {
            token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000
        }, { new: true });
        //create url
        const url = `http://localhost:3000/upddate-password/${token}`;
        //send mail with url
        await mailSender(email,"Password Reset Link", `Password Reset Link: ${url}`);
        return res.json({
            success:true,
            message:"Pwd reset email sent successfully"
        });
    } catch (error) {
        console.log("Error in resetPasswordToken: ",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while generating reset pwd token and sending email"
        })
    }
}

//reset password
exports.resetPassword = async (req,res)=>{
    try {
        //fetch data
        let {password, confirmPassword, token}= req.body;
        //validate data
        if(password!=confirmPassword){
            return res.status(401).json({
                success:false,
                message:"Password not matching"
            });
        }
        //fetching user using reset password token
        let user = await User.findOne({token});
        //if no entry found it is an invalid token
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid Token"
            });
        }
        //token expiry check
        if(user.resetPasswordExpires<Date.now()){
            return res.status(402).json({
                success:false,
                message:"Token expired"
            });
        }
        //check pwd and confirm pwd if same hash pwd
        const hashedPassword = await bcrypt.hash(password,10);
        //update user
        let updatedUser = await User.findOneAndUpdate({token},{password:hashedPassword},{new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"Password reset successful"
        })
    } catch (error) {
        console.log("error in resetPassword: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in resetPassword"
        });
    }
}
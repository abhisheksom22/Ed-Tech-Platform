const User = require('../models/User');
const Otp = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//sendOtp
exports.sendOtp = async (req, res) => {
    try {
        //fetch email from request
        console.log("master")
        const { email } = req.body;

        //check if user already exists
        const user = await User.findOne({ email });

        //if already exists
        if (user) {
            return res.status(401).json({
                success: false,
                message: "User already registered"
            });
        }

        //generate otp
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("otp", otp);

        //check otp unique
        let otpcheck = await Otp.findOne({ otp });
        while (otpcheck) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            otpcheck = await Otp.findOne({ otp });
        }

        //save it in db
        const otpPayload = {
            otp,
            email
        }

        await Otp.create(otpPayload);

        return res.status(200).json({
            success: true,
            message: "Otp sent successfully",
            otp
        });
    } catch (error) {
        console.log("sendotp controller error: ", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//signup
exports.signUp = async (req, res) => {
    try {
        //fecth from req
        const { firstName, lastName, password, confirmPassword, email, contact, accountType, otp } = req.body;
        //validate data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields required"
            });
        }
        //match both pass
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                messaege: "Password and Confirm Password don't match"
            })
        }
        //check user already exists
        let checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: "User already exits"
            });
        }
        //find most recent otp for user
        let recentOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recent otp: ", recentOtp);
        //validate otp
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Otp not found"
            })
        } else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Incorrect otp entered"
            })
        }
        //hash pass and created entry in db
        let hashedPassword = await bcrypt.hash(password, 10);
        //create entry in db
        let profileDetails = await Profile.create({
            gender: null,
            dob: null,
            about: null,
            contactNumber: null
        })
        let user = await User.create({
            firstName,
            lastName,
            email,
            contact,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success: true,
            message: "user register successfully"
        });
    } catch (error) {
        console.log("error in signup:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//login
exports.login = async (req, res) => {
    try {
        //get data from req body
        let { email, password } = req.body;
        //validate data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields required"
            });
        }
        //check if user exist
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered"
            });
        }
        //check password
        if (await bcrypt.compare(password, user.password)) {
            let payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }
            const token = await jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            user.token = user;
            user.password = undefined;
            //create cookie
            let options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User Loggedin Successfully"
            });
        }else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            });
        }
    } catch (error) {
        console.log("Error in login: ",error);
        return res.status(500).json({
            success:false,
            message:"Login failure"
        })
    }
}

//changePassword
exports.changePassword = async(req,res)=>{
    try {
        //get user from request
        const userDetails = await User.findById(req.user.id);
        //get old, new
        const {oldPassword, newPassword, confirmPassword} = req.body;
        //validation
        // Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
        if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

        // Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

        //update password in db
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);
        //send email-password updated
        const emailResponse = await mailSender(
            updatedUserDetails.email,
            'Password Updation',
            `Hi ${userDetails.firstName} your password has been change successfully. Please login using new password.`
        );
        //return response
        return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
}
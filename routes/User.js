const express = require("express");
const router = express.Router();
const authController = require("../controllers/Auth");
const resetPasswordController = require("../controllers/ResetPassword");

/* ***************Authentication*************** */

//For Login
router.post("/login",authController.login);

//For Signup
router.post("/signup",authController.signUp);

//sending otp
router.post("/sendOtp",authController.sendOtp);



/* ***************Reset Password**************** */
// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordController.resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPasswordController.resetPassword);

// Export the router for use in the main application
module.exports = route
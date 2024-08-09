const express = require("express");
const route = express.Router();
const authController = require("../controllers/Auth");
const resetPasswordController = require("../controllers/ResetPassword");

/* ***************Authentication*************** */

//For Login
route.post("/login",authController.login);

//For Signup
route.post("/signup",authController.signUp);

//sending otp
route.post("/sendOtp",authController.sendOtp);



/* ***************Reset Password**************** */
// Route for generating a reset password token
route.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
route.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = route
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
//auth
exports.auth = async(req,res,next)=>{
    try {
        //verify jwt if correct or not
        //can be extracted from cookie, body, bearer
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer","");
        //if token missing
        if(!token){
            return res.status(401).json({
                success:false,
                message:'token missing'
            });
        }
        //verify token
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        console.log("decode", decode);
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"token invalid"
        });
    }
}

//student
exports.isStudent = async (req,res,next)=>{
    try {
        if(req.user.accountType!="Student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for students only"
            })
        }
        next();
    } catch (error) {
        console.log("isStudent error:",error);
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        });
    }
}

//instructor
exports.isInstructor = async (req,res,next)=>{
    try {
        if(req.user.accountType!="InstructorisInstructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for students only"
            })
        }
        next();
    } catch (error) {
        console.log("isStudent error:",error);
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        });
    }
}

//admin
exports.isAdmin = async (req,res,next)=>{
    try {
        if(req.user.accountType!="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Admins only"
            })
        }
        next();
    } catch (error) {
        console.log("isAdmin error:",error);
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified"
        });
    }
}
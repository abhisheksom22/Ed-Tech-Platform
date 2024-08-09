const { default: mongoose } = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utilities/mailSender");
const crypto = require("crypto")


//capture payment and initiate razorpay request
exports.capturePayment = async (req,res)=>{
    try {
        const {courseId} = req.body;
        const userId = req.user.id;
        if(!courseId){
            return res.status(401).json({
                success:false,
                message:"Please provide course id"
            });
        }
        let course = await Course.findById(courseId);
        if(!course){
            return res.status(401).json({
                success:false,
                message:"Could not find course"
            });
        }
        //convert userId to objectId
        let uid = new mongoose.Types.ObjectId(userId);
        if(course.enrolledStudents.includes(uid)){
            return res.status(401).json({
                success:false,
                message:"student already enrolled"
            });
        }

        //create order
        const amount = course.price;
        const currency = "INR";
        const options = {
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:course._id,
                userId
            }
        }
        //initiate payment
        const paymentResponse = await instance.orders.create(options);
        console.log("payment response: ",paymentResponse);
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount : paymentResponse.amount
        })
    } catch (error) {
        console.log("error in capture payment", error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//verifySignature sent from razorpay
exports.verifySignature = async (req,res)=>{
    try {
        const webhooksecret = "12345678";
        const signature = req.header["x-razorpay-signature"];
        let shasum = crypto.createHmac("sha256",webhooksecret);
        //convert to string
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");
        if(signature === digest){
            console.log("payment is authorised");
            const {courseId,userId} = req.body.payload.payment.entity.notes;
            //enroll student in course
            const enrolled = await Course.findOneAndUpdate({
                _id:courseId
            },{
                $push:{
                    enrolledStudents:userId
                }
            },{new:true});
            if(!enrolled){
                return res.status(401).json({
                    success:false,
                    message:"Course not found"
                });
            }
            //update student
            let enrollStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:userId}},
                {new:true}
            );

            //send confirmation mail
            const emailResponse = await mailSender(enrollStudent.email,`${enrolled.courseName} Registered`,"Thank You For Joining my course");
            return res.status(200).json({
                success:true,
                message:"Course payment done!"
            });
        }
        return res.status(400).json({
            success:false,
            message:"Signature didn't match from razorpay"
        })
    } catch (error) {
        console.log("error in verify payment", error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
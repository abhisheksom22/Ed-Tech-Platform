const RatingAndReviews = require("../models/RatingandReview");
const Course = require("../models/Course");
const User = require("../models/User");
const mongoose = require("mongoose")
//create rating
exports.createRatingReview = async (req, res) => {
    try {
        //get user id
        const userId = req.user.id;
        //fetch data
        const { rating, review, courseId } = req.body;
        //check user if user is enrolled or not
        const courseDetails = await findOne({ _id: courseId, enrolledStudents: { $eleMatch: { $eq: userId } } });
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in course"
            });
        }
        //check if user has already given review
        const alreadyReviewed = await RatingAndReviews.findOne({ user: userId, course: courseId });
        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "You have already reviewed the course"
            });
        }
        //create rating
        const newRatingReview = await RatingAndReviews.create({
            rating: rating,
            review: review,
            course: courseId,
            user: userId
        });
        //update course
        await Course.findByIdAndUpdate({
            _id: courseId,
        },
        {
            $push:{
                ratingAndReviews: newRatingReview._id
            }
        }
        );
        return res.status(200).json({
            success:true,
            message:"Rating and Review added",
            newRatingReview
        })
    } catch (e) {
        console.log("error in create rating:",e);
        return res.status(500).json({
            success:false,
            message:"Error in create rating"
        })
    }
}

//average rating
exports.getAverageRating = async (req,res)=>{
    try {
        //get course Id
        const courseId = req.body.courseId;
        //calculate avg rating
        const result = await RatingAndReviews.aggregate(
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId) // match this course id
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        );
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            });
        }
        //if no review rating
        return res.status(200).json({
            success:true,
            message:"Avreage rating is zero",
            averageRating:0
        });
    } catch (e) {
        console.log("error in get avg rating:",e);
        return res.status(500).json({
            success:false,
            message:"Error in get avg rating"
        })
    }
}

//get all rating
exports.getAllRating = async(req,res)=>{
    try {
        const allRatingAndReviews = await RatingAndReviews.find({}).sort({rating:"desc"}).populate({path: "user", select:"firstName lastName email image"}).populat({path:"course", select:"courseName"}).exec(); 
        return res.status(200).json({
            success:true,
            message:"Successfully fetched all rating & reviews",
            allRatingAndReviews
        })
    } catch (e) {
        console.log("error in get all rating:",e);
        return res.status(500).json({
            success:false,
            message:"Error in get all rating"
        })
    }
}
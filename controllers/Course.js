const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utilities/imageUploader");
const { populate } = require("dotenv");
require("dotenv").config();

//create course
exports.createCourse = async (req, res) => {
    try {
        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category, tag, status, instructions } = req.body;
        //fetch files
        const thumbNail = req.files.thumbNail;
        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbNail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        if (!status || status === undefined) {
            status = "Draft";
        }

        //check if instructor
        let userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("instructorDetails: ", instructorDetails);
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            });
        }


        //check given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found"
            });
        }
        //upload image
        const thumbNailImage = await uploadImageToCloudinary(thumbNail, process.env.FOLDER_NAME);
        //create course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbNail: thumbNailImage.secure_url,
            status: status,
            intructions: instructions
        });
        //update user -> instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        //update Category Schema
        await Category.findByIdAndUpdate(
            {
                _id: categoryDetails._id
            },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });
    } catch (error) {
        console.log("Error in create course: ", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//get all courses
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            courseDescription: true,
            thumbNail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true
        }).populate("instructor").exec();
        return res.status(200).json({
            success: true,
            message: "All courses fetched successfully",
            allCourses
        });
    } catch (error) {
        console.log("Error in showAllCourses:", error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch Course data"
        })
    }
}

//get course details
exports.getCourseDetails = async (req, res) => {
    try {
        //get course id
        let { courseId } = req.body.courseId;

        //getting course details using course id
        let courseDetails = await Course.find({ _id: courseId }).populate({
            path: "instructor", populate: {
                path: "additionalDetails"
            }
        }).populate("category").populate("ratingAndReviews").populate({
            path: "courseContent", populate: {
                path: "subSection"
            }
        }).exec();

        //validation
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find course with course id ${courseId}`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfull",
            courseDetails
        });
    }catch(e){
        console.log("error in getCourseDetails: ",e);
        return res.status(500).json({
            success:false,
            message:"Error in getcoursedetails"
        })
    }
}
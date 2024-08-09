const mongoose = require("mongoose");
const courseSchema = mongoose.Schema({
    courseName: {
        type: String,
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    courseDescription: {
        type: String
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: String
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingandReviews"
        }
    ],
    price: {
        type: Number
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    tag: {
        type: [String]
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    status:{
        type:String,
        enum:["Draft","Published"]
    }
}
);
module.exports = mongoose.model("Course", courseSchema);
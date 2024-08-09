const Section = require("../models/Section");
const Course = require("../models/Course");

//create section
exports.createSection = async (req,res)=>{
    try {
        //fetch data
        let {sectionName, courseId} = req.body;
        //validate
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        //create section
        const newSection = await Section.create({
            sectionName
        });
        //update course
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },
            {new:true}
        );
        return res.status(200).json({
            success:true,
            message:"Section added successfully",
            updatedCourseDetails
        });
    } catch (error) {
        console.log("Error in create section: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in creating section"
        });
    }
}

//update section
exports.updateSection = async (req,res)=>{
    try {
        //fetch data
        const {sectionName, sectionId} = req.body;
        //validation
        if(!sectionName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(
            SectionId,
            {sectionName},
            {new:true}
        );
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            section
        })
    } catch (error) {
        console.log("Error in update section: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in updating section"
        });
    }
}

//delete section
exports.deleteSection = async (req,res)=>{
    try {
        //get Id from params
        const {sectionId} = req.params;
        //delete
        await Section.findByIdAndDelete(sectionId);
        //TODO: delete section from course while testing
        return res.status(200).json({
            success:true,
            message:"Section delete successfully"
        });

    } catch (error) {
        console.log("Error in delete section: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in deleting section"
        });
    }
}
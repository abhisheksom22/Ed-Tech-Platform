const Subsection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utilities/imageUploader");
require('dotenv').config();

//create sub sec
exports.createSubSection = async (req,res)=>{
    try {
        //fetch data
        const {sectionId, timeDuration, title, description} = req.body;
        //extract file/video
        const video = req.files.videoFile;
        //validate data
        if(!sectionId||!timeDuration||!title||!description||!video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        //upload video to cloudinary and fetch url
        const uploadVideo = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        //create subsectio
        const newSubsection = await Subsection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadVideo
        });
        //update section
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push:{
                    subsection:newSubsection._id
                }
            },
            {new:true}
        );
        return res.status(200).json({
            success:true,
            message:"Subsection created successfully",
            updatedSection
        })

    } catch (error) {
        console.log("Error in create Subsection: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in creating Subsection"
        });
    }
}

//update sub sec
exports.updateSubSection = async (req,res)=>{
    try {
        const { sectionId, title, description } = req.body
        const subSection = await Subsection.findById(sectionId)
    
        if (!subSection) {
          return res.status(404).json({
            success: false,
            message: "SubSection not found",
          })
        }
    
        if (title !== undefined) {
          subSection.title = title
        }
    
        if (description !== undefined) {
          subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
          const video = req.files.video
          const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
          )
          subSection.videoUrl = uploadDetails.secure_url
          subSection.timeDuration = `${uploadDetails.duration}`
        }
    
        await subSection.save()
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

//delete sub sec
exports.deleteSubSection = async (req,res)=>{
    try {
        //get Id from params
        const {subSectionId,sectionId} = req.body;
        //remove subsection from section schema
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull:{
                    subSection:subSectionId,
                }
            }
        )
        //delete subsection
        await Subsection.findByIdAndDelete({_id:subSectionId});
        //TODO: delete section from course while testing
        return res.status(200).json({
            success:true,
            message:"Subsection delete successfully"
        });

    } catch (error) {
        console.log("Error in delete sub-section: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in deleting sub-section"
        });
    }
}
const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");

//update profile
exports.updateProfile = async (req, res) => {
    try {
        //get data
        const { dob = "", about = "", contactNumber, gender } = req.body;
        //get userid
        let userId = req.user.id;
        //validation
        if (!contactNumber || !gender) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        //get user
        let user = await User.findById(userId);
        let profileId = user.additionalDetails;
        let profileDetails = await Profile.findById(profileId);
        profileDetails.dob = dob;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails
        });
    } catch (error) {
        console.log("Error in update profile: ", error);
        return res.status(500).json({
            success: false,
            message: "Error in update profile"
        });
    }
}

//delete user
exports.deleteAccount = async (req, res) => {
    try {
        //get user id
        const userId = req.user.id;
        //validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        //delete profile
        await Profile.findByIdAndDelete(user.additionalDetails);
        //remove user from enrolled courses
        if (user.accountType == "Student") {
            // let enrolledCourses = user.courses;
            // for (let course of enrolledCourses) {
            //     await Course.findByIdAndUpdate(
            //         course,
            //         {
            //             $pull: {
            //                 enrolledStudent: userId
            //             }
            //         }
            //     )
            // }
            await Course.updateMany(
                {enrolledStudents:userId},
                {$pull:{enrolledStudents:userId}}
            );
        }
        //delete user
        await User.findByIdAndDelete(userId);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.log("Error in delete profile: ", error);
        return res.status(500).json({
            success: false,
            message: "Error in delete profile"
        });
    }
}

exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
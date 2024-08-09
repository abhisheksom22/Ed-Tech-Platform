const Category = require('../models/Category');

//create Category
exports.createCategory = async (req,res)=>{
    try {
        //fetch data
        let {name,description} = req.body;
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        //create entry in db
        const categoryDetails = await Category.create({
            name,
            description
        });
        console.log("categoryDetails: ",categoryDetails);

        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        });
    } catch (error) {
        console.log("Error in create Category: ",error)
        return res.status(500).json({
            success:false,
            message:"Error in creating Category"
        })
    }
}

//get all tags
exports.showAllCategory = async (req,res)=>{
    try {
        let category = await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"All category fetched".
            tags
        });
    } catch (error) {
        console.log("Error in show all category: ",error);
        return res.status(500).json({
            success:false,
            message:"Error in show all category"
        })
    }
}

//category page details
exports.categoryPageDetails = async (req,res)=>{
    try {
        //get category id
        const {categoryId} = req.body;
        //category ke corresponding fetch all courses
        const allCourses = await Category.findById(categoryId).populate("course").exec();
        //validation
        if(!allCourses){
            return res.status(404).json({
                success:false,
                message:"Data not find"
            });
        }
        //courses from diff category
        const diffCatCourses = await Category.find({
            _id:{$ne:categoryId}
        }).populate("course").exec();
        //top selling courses
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differentCategories,
            },
        });
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
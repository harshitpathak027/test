
import Categorymodel from '../models/Categorymodel.js'
import slugify from 'slugify'

export const CreateCategoryController = async (req, res) => {
    try {
        const { name } = req.body
        if (!name) {
            return res.status(401).send({ message: "name is required" })
        }
        const existingcategory = await Categorymodel.findOne({ name })
        if (existingcategory) {
            return res.status(200).send({
                success: true,
                message: 'Category Already Exists'
            })
        }
        const category = await new Categorymodel({ name, slug: slugify(name) }).save()
        res.status(201).send({
            success: true,
            message: 'new category created',
            category
        })
    }
    catch (error) {
        res.send({
            message: "unaurhorised user to access"
        })
    }

}

//update category

export const updatecategory = async (req,res) => {
    try {
        const { name } = req.body   
        const { id } = req.params
        const category = await Categorymodel.findByIdAndUpdate(id, { name, slug: slugify(name) }, { new: true })
        res.status(200).send({
            success: true,
            message: "category updated successfully",
            category
        })
    } catch (error) {
        res.send({
            success:false,
            error,
            message:"error while updating category"
        })
       
    }
}

export const categoryController=async(req,res)=>{
    try {
        const category = await Categorymodel.find({});
        res.status(200).send({
            success:true,
            message:"All category List",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"error while getting all categories"
        })
    }
}

export const singleController= async(req,res)=>{
    const category   = await Categorymodel.findOne({slug:req.params.slug})
    res.status(200).send({
        success:true,
        message:"get single category successfully",
        category
    })

}

export const deleteeController= async(req,res)=>{
   
    try {
        const {id} = req.params
        const category   = await Categorymodel.findByIdAndDelete(id)
        res.status(200).send({
            success:true,
            message:"category deleted",

        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"error in deleting category",

        })
    }

}




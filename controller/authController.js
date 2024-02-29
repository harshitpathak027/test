import { getRounds } from "bcrypt"
import { comparePassword, hashPassword } from "../helpers/authHelper.js"
import Usermodel from "../models/Usermodel.js"
import JWT from "jsonwebtoken"
import OrderModel from "../models/OrderModel.js"


export const registerController = async(req,res)=>{

    try {
        
        const {name,email,password ,phone,address,answer} = req.body
        if(!name){
            return res.send({message:'Name is Required'})
        }
        if(!email){
            return res.send({message:'email is Required'})
        }
        if(!password){
            return res.send({message:'password is Required'})
        }
        if(!phone){
            return res.send({message:'phone is Required'})
        }
        if(!answer){
            return res.send({message:'answer is Required'})
        }
        if(!address){
            return res.send({message:'address is Required'})
        }
        //check user
        const existinguser = await Usermodel.findOne({email})
        //existing user
        if(existinguser){
            return res.status(200).send({
                    success:false,
                    message:'already register please login'
            })
        }
        //register user
        const hashedPassword = await hashPassword(password)
        //save 
        const user = await new Usermodel({name,email,phone,address,password:hashedPassword,answer}).save()
        res.status(200).send({
            success:true,
            message:"user register successfully",
            user
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in registration"
        })
    }
}

export const loginController = async(req,res)=>{
    try {
            const {email,password} = req.body
            //validation
            if(!email||!password){
                return res.send({
                    success:false,
                    message:"invalid email or password"
                })
            }

            //check user
            const user = await Usermodel.findOne({email})
            console.log(user)
            if(!user){
                return res.status(404).send({
                    success:false,
                    message:"Email is not registered"
                })
            }
            const match = await comparePassword(password,user.password)
            if(!match){
                return res.status(404).send({
                    success:false,
                    message:"Invalid Password"
                })
            }
        //token
        const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET,{
            expiresIn:'7d',
        })
        res.status(200).send({
            success:true,
            message:"login successfully",
            user:{
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role:user.role
            },
            token,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in login"
        })
    }
}

export const testController=async(req,res)=>{
    res.send(
        "protected"
    )
}


export const forgotpasswordController = async(req,res)=>{
    try {
        const {email,answer,newpassword} = req.body
        if(!email){
            return res.status(400).send({message:"email is required"})
        }
        if(!answer){
            return res.status(400).send({message:"answer is required"})
        }
        if(!newpassword){
            return res.status(400).send({message:"newPassword is required"})
        }
        const user = await Usermodel.findOne({email,answer})
        if(!user){
            return res.status(404).send({
                success:false,
                message:"wrong email or answer"
            })
        }
        const hashed = await hashPassword(newpassword);
        await Usermodel.findByIdAndUpdate(user._id,{password:hashed})
        res.status(200).send({
            success:true,
            message:"password reset successfully"
        })

    } catch (error) {
        console.log(error) 
        res.status(500).send({
            success:false,
            message:"Something went wrong",
            error
        })
    }    
}

export const updateProfileController = async(req,res)=>{
try {
    const {name,email,password,address,phone} = req.body
    const user = await Usermodel.findById(req.user._id)

    if(password && password.length<6){
        return res.json({error:"password is required and 6 character long"})
    }

    const hashedPassword = password ?await hashPassword(password ):undefined
    const updatedUser = await Usermodel.findByIdAndUpdate(
        req.user._id,{
            name:name||user.name,
            password:hashedPassword ||user.password,
            phone:phone || user.phone,
            address:address|| user.address,

        },
        {new:true})
    res.status(200).send({
        success:true,
        message:"profile updated successfully",
        updatedUser,
    })
    
} catch (error) {
    console.log(error)
    res.status(400).send({
        success:false,
        message:"error while update ",
        error
    })
}
}


export const getOrderController = async(req,res)=>{
    try {
        const orders = await OrderModel.find({buyer:req.user._id}).populate("products","-photo").populate("buyer","name")
        res.json(orders)

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error while getting order",
            error
        })
    }
}

export const getAllOrdersController = async(req,res)=>{
    try {
        const orders = await OrderModel
          .find({})
          .populate("products", "-photo")
          .populate("buyer", "name")
          
        res.json(orders);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: "Error WHile Geting Orders",
          error,
        });
      }
}

//order status
export const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await OrderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  };
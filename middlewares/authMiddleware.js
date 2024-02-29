import JWT from 'jsonwebtoken'
import Usermodel from '../models/Usermodel.js';

//protected token routes base
export const requireSignIn = async(req,res,next)=>{

    try {
        const decode  = JWT.verify(req.headers.authorization,
            process.env.JWT_SECRET)
            req.user=decode
        next();
    } catch (error) {
        console.log(error)
    }
}

export const isAdmin= async(req,res,next)=>{
    try {
        const user = await Usermodel.findById(req.user._id)
        if(user.role!==1){
            return res.status(401).send({
                success:false,
                message:"unauthorised Access"
            })
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error)
    }
}
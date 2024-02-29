import slugify from "slugify"
import productModel from "../models/productModel.js"
import fs from 'fs'
import braintree from "braintree";
import OrderModel from "../models/OrderModel.js";
import dotenv from 'dotenv'

dotenv.config()

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey:process.env.BRAINTREE_PRIVATE_KEY 
  });
  

export const createProductController = async(req,res) => {
    try {
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files
        switch(true){
            case !name:
                return res.status(500).send({error:'name is Required'})
            case !description:
                return res.status(500).send({error:'description is Required'})
            case !price:
                return res.status(500).send({error:'price is Required'})
            case !category:
                return res.status(500).send({error:'category is Required'})
            case !quantity:
                return res.status(500).send({error:'quantity is Required'})
          
            case photo && photo.size >10000000000000000:
                return res
                    .status(500)
                    .send({error:"photo is Required and should be less than 1mb"})
                
        }
        const products = new productModel({...req.fields,slug:slugify(name)})
        if(photo){
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type

        }
        await products.save()
        res.status(201).send({
            success:true,
            message:"product created successfully",
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"error in creating product",
            success:false
        })
    }
}


export const getProductController = async(req,res)=>{
    try {
        const products= await productModel
            .find({})
            .populate('category')
            .select("-photo ")
            .limit(12)
            .sort({createdAt:-1});
            res.status(200).send({
                success:true,
                message:"allproducts",
                products,
                total:products.length
            })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in getting products",
            error:error.message
        })
    }
         
}

export const getSingleProductController = async(req,res)=>{
    try{

        const product = await productModel.findOne({slug:req.params.slug}).select("-photo")
        res.status(200).send({
            success:true,
            message:'single Product fetched',
            product
        })

    }
    catch(error){

        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in getting single products",
            error:error.message
        })
    }

}


export const productPhotoController=async(req,res)=>{
try {
    const product = await productModel.findById(req.params.pid).select("photo")
    if(product.photo.data){
        res.set("Content-type",product.photo.contentType)
        return res.status(200).send(product.photo.data)
    }
} catch (error) {
    res.status(500).send({
        success:false,
        message:"error in getting single products",
        error:error.message
    })
}

}

export const deleteProductController = async(req,res)=>{
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success:true,
            message:"product deleted successfully"
        })
        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"error while deleting products",
            error:error.message
        })
    }
}

export const updateProductController = async(req,res)=>{
    try {
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files
        switch(true){
            case !name:
                return res.status(500).send({error:'name is Required'})
            case !description:
                return res.status(500).send({error:'description is Required'})
            case !price:
                return res.status(500).send({error:'price is Required'})
            case !category:
                return res.status(500).send({error:'category is Required'})
            case !quantity:
                return res.status(500).send({error:'quantity is Required'})
          
            case photo && photo.size >10000000000000000:
                return res
                    .status(500)
                    .send({error:"photo is Required and should be less than 1mb"})
                
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid,{...req.fields,slug:slugify(name)},{new:true})
        if(photo){
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type

        }
        await products.save()
        res.status(201).send({
            success:true,
            message:"product update successfully",
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"error in creating product",
            success:false
        })
    }
}

export const productFiltersController  = async(req,res)=>{
    try {
        const {checked,radio}= req.body
        let args ={}
        if(checked.length > 0) args.category = checked
        if(radio.length) args.price = {$gte:radio[0],$lte:radio[1]}
        const products = await productModel.find(args)
        res.status(200).send({
            success:true,
            products,
        })

    } catch (error) {
        console.log(error)
    }
}


export const productCountController = async(req,res)=>{
    try {
        const total = await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success:true,
            total,
        })
    } catch (error) {
        console.log(error)
    }
}

export const productListController = async (req,res)=>{
    try {
        const perPage = 6;
        const page = req.params.page?req.params.page:1
        const products = await productModel.find({}).select("-photo").skip((page-1)*perPage).limit(perPage).sort({createdAt:-1})
        res.status(200).send({
            success:true,
            products,
        })
        
    } catch (error) {
        console.log(error)
    }
}

export const searchProductController = async (req,res)=>{
    try {
        const {keyword} = req.params
        const results = await productModel.find({
            $or:[
                {name:{$regex:keyword,$options:'i'}},
                {description:{$regex:keyword,$options:'i'}}
            ]
        }).select("-photo")
        res.json(results)
    } catch (error) {
        console.log(error)
    }
}


export const braintreeTokenController = async(req,res)=>{
    try {
        gateway.clientToken.generate({},function(err,response){
            if(err){
                res.status(500).send(err)
            }
            else{
                res.send(response)

            }
        })
    } catch (error) {
console.log(error)        
    }

}

export const braintreePaymentController = async(req,res)=>{
    try {
        const {cart,nonce} = req.body;
        let total = 0;
        cart.map((i)=>{
            total +=i.price
        })
        let newTransaction = gateway.transaction.sale({
            amount:total,
            paymentMethodNonce:nonce,
            options:{
                submitForSettlement:true
            }
        },
        
        function(error,result){
            if(result){
                const order= new OrderModel({
                    products:cart,
                    payment:result,
                    buyer:req.user._id
                }).save()
                res.json({ok:true})
            }else{
                res.status(500).send(error)
            }
        }
        )
    } catch (error) {
        console.log(error)
    }
    
}
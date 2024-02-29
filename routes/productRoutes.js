import express  from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSingleProductController, productCountController, productFiltersController, productListController, productPhotoController, searchProductController, updateProductController} from "../controller/productController.js";
import Formidable from "express-formidable";



const router = express.Router()

router.post('/create-product',requireSignIn,isAdmin,Formidable(),createProductController)

router.put('/update-product/:pid',requireSignIn,isAdmin,Formidable(),updateProductController)

//get product
router.get('/get-product',getProductController)


router.get('/get-product/:slug',getSingleProductController)

router.get('/product-photo/:pid',productPhotoController)


router.delete('/product/:pid',deleteProductController)

router.post('/product-filters',productFiltersController)


router.post('/product-count',productCountController)

//produc t per page
router.get('/product-list/:page',productListController)


router.get('/search/:keyword',searchProductController)



router.post('/braintree/token',braintreeTokenController)

router.post('/braintree/payment',requireSignIn,braintreePaymentController)






export default router
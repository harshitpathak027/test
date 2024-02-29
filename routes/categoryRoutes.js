import express from "express"
import { isAdmin,requireSignIn } from '../middlewares/authMiddleware.js'
import { CreateCategoryController, categoryController, deleteeController, singleController, updatecategory } from '../controller/categoryController.js'


const router= express.Router()


router.post(
    '/create-category',
    requireSignIn,
    isAdmin,
    CreateCategoryController)




router.put('/update-category/:id',requireSignIn,isAdmin,updatecategory)

router.get('/get-category',categoryController)
router.get('/single-category/:slug',singleController)
router.delete('/delete-category/:id',requireSignIn,isAdmin,deleteeController)
export default router;

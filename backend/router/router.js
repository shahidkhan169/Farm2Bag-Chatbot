const express=require("express")
const auth=require('../middleware/auth')
const langContoller=require("../controller/lang.controller");
const userController =require("../controller/user.controller");
const productController=require("../controller/product.controller")
const router = express.Router();

//user
router.post('/SignUp',userController.signUp);
router.post('/SignIn',userController.signIn);

//product
router.post('/add',productController.addItem)

//lang
router.post('/chat',auth,langContoller.chat)

module.exports=router
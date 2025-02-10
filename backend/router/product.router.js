const express=require("express")

const {
    addItem
}=require("../controller/product.controller")

const userController =require("../controller/user.controller");
const router = express.Router();
router.post('/SignUp',userController.signUp);
router.post('/SignIn',userController.signIn);
router.post('/add',addItem)

module.exports=router
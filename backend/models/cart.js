const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})

const Cart=new mongoose.model("Cart",cartSchema)
module.exports=Cart
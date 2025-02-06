const mongoose=require("mongoose")

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
        enum:['Fruits', 'Vegetables', 'Rice', 'Pulses', 'Spices', 'Dairy', 'Juices', 'Combos']
    },
    price:{
        type:Number,
        required:true
    },
    weight:{
        type:Number,
        required:true
    },
    unit:{
        type:String,
        required:true
    },
    available:{
        type:Boolean,
        default:true
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        default:0
    },
    discount:{
        type:Number,
        default:0
    }
})

const Product=new mongoose.model("Product",productSchema)
module.exports=Product
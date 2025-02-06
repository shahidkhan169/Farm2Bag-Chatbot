const Product=require('../models/product')

module.exports.addItem=async(req,res)=>{
    try{
        const{name,category,price,weight,unit,available,rating,discount}=req.body
        const product=new Product({name,category,price,weight,unit,available,rating,discount})
        await product.save()
        res.status(200).json({message:"Product Succesfully added"})
    }
    catch(err)
    {
        res.status(400).json({error:err.message})
    }
}
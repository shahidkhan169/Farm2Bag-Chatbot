const Product=require('../models/product')
const Order=require('../models/order')

const addItem=async(req,res)=>{
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


const orderItem = async (req, res) => {
    try {
        const { productName, productPrice, quantity } = req.body;
        const userId = req.userId; 

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }

        if (!productName || !productPrice || !quantity ||
            productName.length !== productPrice.length || productName.length !== quantity.length) {
            return res.status(400).json({ message: "Invalid order details" });
        }

        // Creating an array of order items
        const orderItems = productName.map((name, index) => ({
            productName: name,
            productPrice: productPrice[index],
            quantity: quantity[index]
        }));

        // Creating a new order
        const newOrder = new Order({
            userId,
            orderItems, 
            orderStatus: "Order Confirmed",
            orderDate: new Date(),
            expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days later
        });

        // Saving the order in MongoDB
        const savedOrder = await newOrder.save();

        res.status(201).json({ message: "Order Placed Successfully", order: savedOrder });
    } catch (error) {
        res.status(500).json({ message: "Error Placing Order", error: error.message });
    }
};



module.exports={
    addItem,
    orderItem
}
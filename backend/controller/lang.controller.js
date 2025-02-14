const axios = require('axios');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product'); 
const Order = require('../models/order')

const extractNumericQuantity = (amount) => {
    const match = amount.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
};

const chat = async (req, res) => {
    try {
        const userId = req.userId;
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const authToken = req.headers.authorization; // Get token from headers
        if (!authToken) {
            return res.status(401).json({ error: "Unauthorized: Missing token" });
        }

        const response = await axios.post(
            'http://127.0.0.1:8000/route-query',
            { query },
            { headers: { Authorization: authToken } } // Send token in headers
        );
        console.log(response.data)
        if (response.data.role === "cart" && response.data.name.startsWith("AddtoCart")) {
            const { message, name } = response.data;
            const matches = name.match(/\[(.*?)\]/);
            if (matches) {
                const products = JSON.parse(matches[0].replace(/'/g, '"'));
                console.log(products)
                for (const product of products) {
                    const productName = product.product_name;
                    const quantityToAdd = extractNumericQuantity(product.quantity);


                    const existingProduct = await Product.findOne({ name: productName });
                    if (!existingProduct) {
                        return res.json({ message: `Sorry, ${productName} not found.` });
                    }


                    const existingCartItem = await Cart.findOne({ userId, productId: existingProduct._id });

                    if (existingCartItem) {
                        existingCartItem.quantity += quantityToAdd;
                        await existingCartItem.save();
                    } else {

                        const newCartItem = new Cart({
                            userId,
                            productId: existingProduct._id,
                            quantity: quantityToAdd,
                        });
                        await newCartItem.save();
                    }
                }

                return res.json({ message: message });
            }
        }
        else if (response.data.role === "cart" && response.data.name.startsWith("ShowCart()")) {
            const cartItems = await Cart.find({ userId: userId }).populate('productId').select('-__v').exec();
            if (cartItems.length === 0) {
                return res.json({ message: "Your cart is empty." });
            }
            const formattedCartItems = cartItems.map(item => ({
                product: {
                    productId: item.productId._id,
                    name: item.productId.name,
                    category: item.productId.category,
                    price: item.productId.price,
                    unit: item.productId.unit,
                    discount: item.productId.discount
                },
                quantity: item.quantity
            }));
            return res.json({ "status":"sucess" , "data": formattedCartItems });
        }
        else if(response.data.role==="general" || response.data.role==="greeting")
            return res.json({"message":response.data.message})
        else if (response.data.role === "TrackOrder") {
            try {
                const orders = await Order.find({ userId: userId }); // Fetch all orders for user
        
                if (!orders || orders.length === 0) {
                    return res.json({ message: "Sorry, You didn't order anything." }); // ✅ RETURN to prevent further execution
                }
        
                // Ensure authToken is defined
                const authToken = req.headers.authorization; 
                if (!authToken) {
                    return res.status(401).json({ message: "Unauthorized request" }); // ✅ RETURN to stop execution
                }
        
                const formattedOrders = orders.map(order => ({
                    productName: order.orderItems?.map(item => item.productName) || [],  
                    orderStatus: order.orderStatus, 
                    expectedDeliveryDate: order.expectedDeliveryDate
                }));
        
                
                const fastApiResponse = await axios.post(
                    'http://127.0.0.1:8000/order-details',
                    { orders: formattedOrders },
                    { headers: { Authorization: authToken } } 
                );
        
                return res.json({ message: "Order details sent ..successfully", data: fastApiResponse.data });
        
            } catch (error) {
                console.error("Error communicating with FastAPI:", error.message);
        
                if (!res.headersSent) { 
                    return res.status(500).json({ message: "Error tracking order", error: error.message });
                }
            }
        }                
        else{
            return res.json(response.data);
            
        }
        return res.json({ message: "Invalid request" });
    } catch (err) {
        console.error("Error communicating with FastAPI:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    chat
};

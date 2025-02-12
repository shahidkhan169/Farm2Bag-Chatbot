const axios = require('axios');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product'); // Import Product model

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
            'http://127.0.0.1:8000/cart', 
            { query }, 
            { headers: { Authorization: authToken } } // Send token in headers
        );

        if (response.data.role === "cart" && response.data.name.startsWith("AddtoCart")) {
            const { message, name } = response.data;
            const matches = name.match(/\[(.*?)\]/);

            if (matches) {
                const products = JSON.parse(matches[0].replace(/'/g, '"')); 
                
                for (const product of products) {
                    const productName = product.name;
                    const quantityToAdd = extractNumericQuantity(product.amount);

                    // Check if product exists in the Product collection
                    const existingProduct = await Product.findOne({ name: productName });
                    if (!existingProduct) {
                        return res.json({ message: `Sorry, ${productName} not found.` });
                    }

                    // Check if the product is already in the cart
                    const existingCartItem = await Cart.findOne({ userId, productId: existingProduct._id });

                    if (existingCartItem) {
                        // Increase quantity if product already exists
                        existingCartItem.quantity += quantityToAdd;
                        await existingCartItem.save();
                    } else {
                        // Add new item to cart if not exists
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
            // Fetch cart items and populate product details
            const cartItems = await Cart.find({ userId }).populate("productId", "name category amount unit price discount");

            if (cartItems.length === 0) {
                return res.json({ message: "Your cart is empty." });
            }

            const formattedCartItems = cartItems.map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                caterory: item.productId.category,
                amount: item.productId.amount,
                price: item.productId.price,
                unit:item.productId.unit,
                quantity: item.productId.quantity,
                discount:item.productId.discount
            }));

            return res.json({ cartItems: formattedCartItems });
        }

        res.json(response.data);  
    } catch (err) {
        console.error("Error communicating with FastAPI:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    chat
};

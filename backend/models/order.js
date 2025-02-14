const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [
        {
            productName: { type: String, required: true },
            productPrice: { type: String, required: true },
            quantity: { type: String, required: true }
        }
    ],
    orderStatus: {
         type: String,
         enum : ["Order Confirmed","Order Shipped","Out for Delivery","Delivered"],
         default: "Order Confirmed" },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;


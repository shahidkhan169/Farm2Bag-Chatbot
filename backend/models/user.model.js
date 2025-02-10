const mongoose = require("mongoose");
const SchemaType = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        type: SchemaType.ObjectId,
        ref: "Cart"
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const User = require("../models/user.model");
const jwt=require("jsonwebtoken")
const bcrypt =require("bcrypt")
require("dotenv").config();

const signIn = async (req,res) => {
    try{
        const {email,password}=req.body;
        if(!email || !password)
            return res.status(400).send({message:'All fields are required'})
        const user=await User.findOne({email})
        if(!user)
            return res.status(400).send({message:'Invalid email'});

        const isPassword=await bcrypt.compare(password,user.password);
        if(!isPassword)
            return res.status(400).send({message:"Invalid Password"});
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY); 
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({ message: 'Login successful',token});
        }
    catch(err){
        return res.status(500).json({message:err.message})
    }
};

const signUp = async (req, res) => {
    try {
        const { name, email, password, rePassword, phoneNumber } = req.body;
        if (!name || !email || !password || !rePassword || !phoneNumber) {
            return res.status(401).json({ message: "Please fill all the fields" });
        }
        if (password !== rePassword) {
            return res.status(404).json({ message: "Password Must be same" });
        }
        const hashed=await bcrypt.hash(password,10)
        const q = new User({
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            password: hashed
        });
        await q.save();
        return res.status(200).json({message:'User Created Successfully'});
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    signIn,
    signUp
};

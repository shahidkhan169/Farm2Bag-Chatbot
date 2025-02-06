const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const helmet=require("helmet")
const Product = require("./router/product")

const app=express()

app.use(cors())
app.use(helmet())
app.use(express.json())

mongoose.connect("mongodb+srv://shahid1692004:dihahs169@farm2bag-db.sslpa.mongodb.net/?retryWrites=true&w=majority&appName=Farm2Bag-DB")
.then(()=>console.log("connected DB"))
.catch((err)=>console.error("Error:",err.message))

app.use(Product)

app.listen(1609,()=>console.log("Connected to Port"))

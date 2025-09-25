const mongoose=require("mongoose")
const fs=require("fs")
const productSchema= new mongoose.Schema({
    productname:{
        type:String,
        index:true
    },
    category:{
        type: String
    },
    price:{
        type :Number
    }
})


const product= mongoose.model("product",productSchema)



module.exports =product
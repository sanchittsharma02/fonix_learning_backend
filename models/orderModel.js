const mongoose=require("mongoose")
const productSchema=require("../models/productModel")
const customerSchema=require("../models/customerModel")
const fs=require("fs")
const orderSchema= new mongoose.Schema({
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer"
    },
    orderDate:{
        type: Date
    },
    totalamount:{
        type :Number

    },
    products:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"product",
                required:true
            },
            quantity:{
                type:Number,
                min :1
            },
            price:{
                type:Number,
                ref:productSchema,
                min:0
            }
        }
    ]
})

const order=mongoose.model("order",orderSchema)

// const data =  fs.readFileSync("./orders.json","utf-8") 
//         const users=JSON.parse(data)
    
//         const insertUsers = async () => {
//             try {
//               const insertedUsers = await order.insertMany(users); // bulk insert
//               console.log("Users inserted successfully:", insertedUsers.length);
//               mongoose.connection.close(); // close DB connection
//             } catch (error) {
//               console.error("Error inserting users:", error);
//             }
//           };
          
//           insertUsers();   


module.exports=order


/**
     aggregations
     $group
     $project
     $sum
     $avg
 * 
 * 
 */
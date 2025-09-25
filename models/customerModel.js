const mongoose=require("mongoose")
// const { v4:uuidv4 } = require("uuid")
const order=require("./orderModel")
const fs=require("fs")

const customerSchema= new mongoose.Schema({
    mail:{
       type :String,
       index:true,
       unique:true
    },
    name:{
       type: String
    },
    orders:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"order",
      default:0
    }]
   })


const customer= mongoose.model("customer",customerSchema)
async function run() {
   
   const exstcust=  await customer.findOne({ name:"example"}).populate("orders")
   console.log(exstcust);
}
// run()

// async function ex() 
   
// {
//    const exstcust= await customer.findOne({ name:"example"})
//    console.log(exstcust._id);
   
// const neworder= await order.create({
//    customerId:exstcust._id,
//    orderDate:Date.now(),
//    totalamount: 20000,
//    products:[
//       {
//       productId:"68d398dea7beca921f0ec5b8",
//       quantity:2,
//       price:10000
//    }]
// })
// exstcust.orders.push(neworder)
// await exstcust.save()
// }
// ex()
module.exports= customer
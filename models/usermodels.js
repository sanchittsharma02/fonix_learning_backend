const { number, string, date, boolean } = require("joi")
const mongoose=require("mongoose")
const fs=require("fs")

const { type } = require("os")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mail:{
        type:String,
        required:true,
        index:true,
        unique:true
    },
    password:{
     type:String,
     required:true
    },
    image:{
        type:String
    },
    isDeleted: {
        type: Boolean,
        default: false,
      },
      isVerified:{
        type:Boolean,
        default:false
      }
    
})

const tokenschema= new mongoose.Schema({
    mail:{
        type:String
    },
    otp:{
        type :Number,
        default:0
    },
    verifytoken:{
        type:String,
        default:""
    },
    createdAt: { type: Date, default: Date.now, expires: 600 }
})
const collegeSchema=new mongoose.Schema({
    collegeName:{
        type :String

    },
    city:{
        type:String
    },
    pincode:{
        type :Number
    }


})

const userDetails=new mongoose.Schema({
    id:{
        type:Number
    },
    first_name:{
        type: String
    },
    email :{
        type :String
    },
    gender :{
        type :String
    },
    dob:{
        type :Date
    },
    collegedetails:[collegeSchema]
}
,{timestamps:true})

userDetails.virtual("age").get(function(){
    globalThis.Date;
        const currentyear = new globalThis.Date().getFullYear();
        const userage = currentyear - userDetails.dob;
        return userage
})

userDetails.set("toJSON",{virtuals:true})
userDetails.set("toObject",{virtuals:true})

  
const user =mongoose.model("user",userSchema)
const UserDetails =mongoose.model("userDetails",userDetails)
const token=mongoose.model("token",tokenschema)

module.exports={user,UserDetails,token}









// const data =  fs.readFileSync("./usersdata.json","utf-8") 
//         const users=JSON.parse(data)
    
//         const insertUsers = async () => {
//             try {
//               const insertedUsers = await UserDetails.insertMany(users); // bulk insert
//               console.log("Users inserted successfully:", insertedUsers.length);
//               mongoose.connection.close(); // close DB connection
//             } catch (error) {
//               console.error("Error inserting users:", error);
//             }
//           };
          
//           insertUsers();   


 

/**
 * aggregation 
 * $lookup:{
 * for joining the models
 * }
 * $math:{}
 * $addFields:{
 * fieldName:{
 * }
 * }
 */

const { number, string, date } = require("joi")
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
        type : String
    }
},{timestamps:true})

// const users=[]
   

const user =mongoose.model("user",userSchema)
const UserDetails =mongoose.model("userDetails",userDetails)
// const data =  fs.readFileSync("./MOCK_DATA.json","utf-8") 
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
module.exports={user,UserDetails}
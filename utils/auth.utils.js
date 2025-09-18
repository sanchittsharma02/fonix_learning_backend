const jwt=require("jsonwebtoken")
const User=require("../models/usermodels");
const sendResponse = require("./sendResponse.utils");
const key='abc@abc'
function setUser(user) {
       return jwt.sign(
      {
        
        mail: user.mail,
      },
      key,
      { expiresIn: "1h" } // optional expiry
    );
  }


module.exports=setUser
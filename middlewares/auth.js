const jwt=require("jsonwebtoken")
const sendResponse = require("../utils/sendResponse.utils")
const {user}= require("../models/usermodels")
const key ='abc@abc'

async function restrictUser(req, res, next) {
    try {
      const token = req.cookies?.token;
  
      if (!token) {
        return sendResponse(res, false, null, "User not logged in", 401);
      }
  
      const decoded = jwt.verify(token, key);
      // console.log("Decoded JWT:", decoded);
  
      if (!decoded || !decoded.mail) {
        return sendResponse(res, false, null, "Invalid token payload", 401);
      }
  
      const currentUser = await user.findOne({ mail: decoded.mail });
  
      if (!user) {
        return sendResponse(res, false, null, "No user found", 401);
      }
  
      req.user = currentUser;
      next();
    } catch (error) {
      console.log("JWT error:", error);
      return sendResponse(res, false, null, "Error in JWT auth", 401);
    }
  }

module.exports=restrictUser
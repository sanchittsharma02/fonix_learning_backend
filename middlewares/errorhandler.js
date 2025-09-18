const sendResponse = require("../utils/sendResponse.utils")


function errorhandler(err,req,res,next) {
    
    const status= err.status ||500
    const message=err.message 

    return sendResponse(
        res,
        false,
        null,
        message,
        status        
    )
}

module.exports=errorhandler
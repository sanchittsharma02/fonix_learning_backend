// const activitylogger=require("../logs/activitylogger")
const activitylog=require("../models/logs.model")


function sendResponse(res,success,data,message,statuscode=200){
    // try {
    //     const req = res.locals.req;                      // stored request
    //     const userId = res.locals.user?.id || req?.body?.mail || null;
       
    //     const ip = req?.ip || null;
    //     action=message
    //     details={data,statuscode,success}
    //     if (req) {
    //         activitylog.create({
    //             userId,
    //             action,
    //             details,
    //             ip,
    //             timestamp: new Date()
    //           });
    //     }
    //     }
    // catch (err) {
    //     console.error("Activity logging failed", err);
    // }

    return res.status(statuscode).json({
        success,
        data:data || null,
        message,
        statuscode

    })
}

module.exports=sendResponse
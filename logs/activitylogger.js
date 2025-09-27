const winston=require("winston")
const path=require("path")
const activitylog=require("../models/logs.model")



const activitylogger=winston.createLogger({
    level:"info",
    format:winston.format.json(),
    transports:[
        // new MongoDBTransport()
        new winston.transports.File({filename:path.join(__dirname,"./access.log")})
    ]
})

function logactivity(userId,actions,details,ip){
    setImmediate(()=>{
        activitylogger.info({userId, actions, details, ip, timestamp: new Date().toISOString()})

    })
}

module.exports=activitylogger
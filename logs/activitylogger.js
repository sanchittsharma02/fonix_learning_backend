const winston=require("winston")
const path=require("path")
const activitylog=require("../models/logs.model")

// class MongoDBTransport extends winston.Transport {
//     constructor(opts) {
//       super(opts);
//     }
  
//     log(info, callback) {
//       setImmediate(() => {
//         this.emit("logged", info);
//       });
//       const action = info.message;
//       // Save log into MongoDB
//       const { userId, details, ip, timestamp } = info;
//       activitylog.create({ userId, action, details, ip, timestamp })
//         .catch(err => console.error("Failed to save log to DB:", err));
  
//       callback();
//     }
//   }

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
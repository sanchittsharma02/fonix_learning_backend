const mongoose=require("mongoose")
const { level } = require("winston")

const logSchema=new mongoose.Schema({
    userId: { type: String, default: null },
    action: { type: String, required: true },
    details: { type: Object },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
})

const activitylog=mongoose.model("activitylog",logSchema)

module.exports=activitylog
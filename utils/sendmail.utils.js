const nodemailer=require("nodemailer")
const sendResponse = require("./sendResponse.utils")
const { response } = require("express")

async function sendEmail(to,subject,html) {
    const transporter=nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "07e3df1e3cb65d",
          pass: "d824b153d48229"
        }
    })
   const info= await transporter.sendMail({
      from:` demo <support@demo>`,
      to,
      subject,
      html  
    })
    if(info.accepted && info.accepted.length > 0)
    return ({success:true}
    )
    else{
      return ({success:false})
    }
} 

module.exports={sendEmail}
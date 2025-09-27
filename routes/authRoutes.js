const { Register,Login,verifymail} =require("../controllers/authControllers")
const express=require("express")
const multer=require("multer")
const router=express.Router()
const sendEmail=require("../utils/sendmail.utils")
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (file.mimetype === "image/png") {
//       cb(null, "./public/images");
//     } else {
//       cb(null, "./uploads");
//     }
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// function imageFilter(req, file, cb) {
//   const allowed = /jpg|png|jpeg/;
//   if (allowed.test(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only jpg ,png ,jpeg are allowed"), false);
//   }
// }

// const upload = multer({ storage, fileFilter: imageFilter });
const upload=require("../middlewares/fileUploader")
router.post("/register", upload.single("image"), Register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Login a user with email and password
 *     parameters:
 *       - name: mail
 *         in: formData
 *         description: Email of the user
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         description: Password of the user
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User login successfully
 */

router.post("/login", Login);
router.get("/verifypage",(req,res)=>{
    return res.render("verifypage")
})
router.post("/verifyotp",verifymail)

module.exports=router
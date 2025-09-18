const express=require("express")
const multer =require("multer")
const fs=require("fs")
const path=require("path")
const app=express()
const port =1001
const storage= multer.diskStorage({
    destination:function (req,file,cb){
        if(file.mimetype==="image/png"){

            cb(null,("./public/images"))
        }
        else{

            cb(null,("./uploads"))
        }
    },
    filename:function (req,file,cb){
       cb(null, Date.now() + '-'+ file.originalname)
    }   
})
// const storage=multer.diskStorage({
//     destination:(req,file,cb)=> cb(null,"uploads/"),
//     filename:(req,file,cb)=>cb(null, Date.now() + '-' + file.originalname)
// });
app.use(express.static("public"))
const upload=multer({storage})
app.use(express.json())
app.use(express.urlencoded({extended:"false"}))
app.set("view engine","ejs")
app.set("views",path.resolve("./views"))
app.get("/",async(req,res)=>{
     const dir=path.join(__dirname,("/public/images"))
     
  fs.readdir(dir, (err, files) => {
    if (err) return res.send("Error reading images");

    const images = files.map(file => `/images/${file}`);
    res.render("index",{images})
})
})
app.post("/register",upload.fields([
  { name:"userimage",maxCount:1},
  { name:"demo",maxCount:4},
]),async(req,res)=>{
    console.log(req.body);
    console.log(req.files);
    
return res.redirect("/")
})
app.listen(port,()=>{
console.log('server started at port ',port);

})
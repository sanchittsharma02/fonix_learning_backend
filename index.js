const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const ratelimit=require("express-rate-limit")
const mongosanitize=require("express-mongo-sanitize")
const swaggerJsdoc=require("swagger-jsdoc")
const swaggerUi=require("swagger-ui-express")
const app = express();
const port = 1001;

const userRoute = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const errorhandler = require("./middlewares/errorhandler");
const { info } = require("console");
const { title } = require("process");
const { version } = require("os");

const swaggerOptions={
  swaggerDefinition:{
    
    info:{
      title:"learning Backend",
      version:"1.0.0"
    }
  },apis: ["./routes/*.js"]
}
const swaggerdocs=swaggerJsdoc(swaggerOptions)

const limiter=ratelimit(
  {
    windowMs:15 * 60 * 1000,
    max:50,
    message:"too many requests",
    standardHeaders:true,
    legacyHeaders:false
    
  }
)
mongoose.connect("mongodb://127.0.0.1:27017/fonixLearning").then(() => {
  console.log("mongodb connected");
});

app.use("/images",express.static("public/images"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true , limit: "10mb" }));
// app.use(mongosanitize({allowDots: true}))
app.use(limiter)
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerdocs))
app.use("/", userRoute);

app.use(errorhandler);

app.listen(port, () => {
  console.log("server started at port ", port);
});

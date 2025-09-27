const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const ratelimit=require("express-rate-limit")
const mongosanitize=require("express-mongo-sanitize")
const swaggerJsdoc=require("swagger-jsdoc")
const swaggerUi=require("swagger-ui-express")
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan=require("morgan")


const app = express();
const port = 1001;

const userRoute = require("./routes/userRoutes");
const authRoutes=require("./routes/authRoutes")
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
// const swaggerdocs=require("./swagger-output.json")

const accesslogs=fs.createWriteStream(path.join(__dirname,"./logs/access.log"),{flags:"a"})
const limiter=ratelimit(
  {
    windowMs:15 * 60 * 1000,
    max:100,
    message:"too many requests",
    standardHeaders:true,
    legacyHeaders:false
    
  }
)
// CORS configuration
const corsOptions = {
  origin:"*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
mongoose.connect("mongodb://127.0.0.1:27017/fonixLearning").then(() => {
  console.log("mongodb connected");
});

app.use((req, res, next) => {
  res.locals.req = req;        // store request object
  res.locals.user = req.user;  // store authenticated user if available
  next();
});
app.use(cors(corsOptions));
app.use("/images",express.static("public/images"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true , limit: "10mb" }));
// app.use(mongosanitize({allowDots: true}))
app.use(limiter)
app.set("view engine", "ejs");

app.set("views", path.resolve("./views"));
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerdocs))
// app.use(morgan("combined",{stream:accesslogs}))

app.use("/", userRoute);
app.use("/auth", authRoutes);




app.use(errorhandler);

app.listen(port, () => {
  console.log("server started at port ", port);
});

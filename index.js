const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 1001;

const userRoute = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const errorhandler = require("./middlewares/errorhandler");


mongoose.connect("mongodb://127.0.0.1:27017/fonixLearning").then(() => {
  console.log("mongodb connected");
});

app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: "true" }));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/", userRoute);

app.use(errorhandler);

app.listen(port, () => {
  console.log("server started at port ", port);
});

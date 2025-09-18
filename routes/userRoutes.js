const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  userLogin,
  showAllUser,
  updateUser,
  deleteUser,
  userRegister,
} = require("../controllers/userControllers");

const restrictUser = require("../middlewares/auth");
const { error } = require("console");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/png") {
      cb(null, "./public/images");
    } else {
      cb(null, "./uploads");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

function imageFilter(req, file, cb) {
  const allowed = /jpg|png|jpeg/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg ,png ,jpeg are allowed"), false);
  }
}

const upload = multer({ storage, fileFilter: imageFilter });

const router = express.Router();

router.get("/", async (req, res) => {
  res.render("index");
});

router.post("/register", upload.single("image"), userRegister);
router.post("/login", userLogin);
router.get("/allUser", restrictUser, showAllUser);
router.put("/update", restrictUser, updateUser);
router.delete("/delete", restrictUser, deleteUser);

module.exports = router;

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
  renderusers,
  softDelete,
  aggregation,
  popularproduct,
  averageprice
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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a user with name, email, password, and profile image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *               mail:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image
 *     responses:
 *       200:
 *         description: User registered successfully
 */

router.post("/register", upload.single("image"), userRegister);

/**
 * @swagger
 * /login:
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

router.post("/login", userLogin);
// router.get("/allUser", restrictUser, showAllUser);
/**
 * @swagger
 * /allUser:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users in the system
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of users
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.get("/allUser", showAllUser);
// router.get("/users",renderusers)
/**
 * @swagger
 * /update:
 *   put:
 *     summary: update user
 *     description: update a user with email and password
 *     parameters:
 *       - name: name
 *         in: formData
 *         description: name of the user
 *         type: string
 *       - name: mail
 *         in: formData
 *         description: Email of the user
 *         type: string
 *       - name: password
 *         in: formData
 *         description: Password of the user
 *         type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/update", restrictUser, updateUser);
// router.get("/users",renderusers)
/**
 * @swagger
 * /softdelete:
 *   patch:
 *     summary: delete user
 *     description: delete the user
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch("/softdelete", restrictUser, softDelete);
router.delete("/delete", restrictUser, deleteUser);
router.get("/totalspent",aggregation)
router.get("/popularproduct",popularproduct)
router.get("/averageprice",averageprice)

module.exports = router;

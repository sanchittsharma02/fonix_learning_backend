const user = require("../routes/userRoutes");
const User = require("../models/usermodels");
const bcrypt = require("bcrypt");
const sendResponse = require("../utils/sendResponse.utils");
const fs = require("fs");
const setUser = require("../utils/auth.utils");
const { body, validationResult } = require("express-validator");
const joi =require("joi")
const mongosanitize=require("express-mongo-sanitize");
const { abort, send } = require("process");
const { error } = require("console");


async function userRegister(req, res) {
  try {
    // using express handler
    // await body("name")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("name not be empty")
    //   .isString()
    //   .isLength({ min: 3 })
    //   .withMessage("name must contain 3 char")
    //   .run(req);
    // await body("password")
    // .trim()
    //   .notEmpty()
    //   .withMessage("password  is required")
    //   .isLength({ min: 6 })
    //   .withMessage("Password must be 6 digit long")
    //   .run(req);
    // await body("mail")
    // .trim()
    //   .notEmpty()
    //   .withMessage("mail is required")
    //   .isEmail()
    //   .withMessage("mail not valid")
    //   .run(req);

    // const error = validationResult(req);
// if (!error.isEmpty()) {
//   return sendResponse(res, false, null, "validation failed", 400);
// }


//using joi
const schema=joi.object({
  name:joi.string()
  .trim()
       .min(3)
      .required()
      .messages({
        "srting.empty":"name sis required",
        "string.min":"min 3 char required"
      }),
      mail:joi.string()
      .trim()
      .email({tlds:{allow:false}})
      .required()
      .messages({
        "string.mail":"invalid email",
        "string.empty":"mail is required"
      }),
      password:joi.string()
      .trim()
      .min(6)
      .required()
      .messages({
        "string.empty":"password is required",
        "string.min":"password must be 6 characters long"
      })
})
const {error,value}=schema.validate(req.body,{abortEarly:false})
if(error)
{
  return sendResponse(
    res,
    false,
    null,
    "Invalid fields",
    400
  )
}

// if (!name || !password || !mail || !req.file) {
//   return sendResponse(res, false, null, " Missing fiels", 400);
// }
      req.body=mongosanitize.sanitize(req.body)

    // const { name, password, mail } = req.body;
    const { name, password, mail } = value;

    const image = req.file.filename;
    const existingUser = await User.findOne({ mail: mail });
    const hashedpassword = await bcrypt.hash(password, 10);
    console.log(existingUser);

    if (existingUser) {
      return sendResponse(res, false, null, "Email already registered", 409);
    }

    User.create({
      name,
      password: hashedpassword,
      mail,
      image,
    });

    return sendResponse(res, true, null, "User registered Successfully", 200);
  } catch (error) {
    console.log("registration error");
    return sendResponse(res, false, null, "error in register user", 500);
  }
}

async function userLogin(req, res) {
  try {
    // console.log(req.body);
    req.body=mongosanitize.sanitize(req.body)
    // const { mail, password } = req.body;

//using express validator

    // await body("mail")
    // .trim()
    //   .notEmpty()
    //   .withMessage("Mail is required")
    //   .isEmail()
    //   .withMessage("email not valid")
    //   .run(req);
    // await body("password")
    // .trim()
    //   .notEmpty()
    //   .withMessage("password is required")
    //   .isLength({ min: 6 })
    //   .withMessage("Password must be 6 digit long")
    //   .run(req);

    // const error = validationResult(req);
    // if (!error.isEmpty()) {
    //   return sendResponse(res, false, null, "invalid fields", 400);
    // }
    // if (!password || !mail) {
    //   return sendResponse(res, false, null, "Missing fields", 400);
    // }

    //using joi
    const schema=joi.object({
      mail:joi.string()
      .trim()
      .required()
      .email({tlds:{allow:false}})
      .messages({
        "string.empty":"email is required",
        "string.email":"mail not valid"
      }),
      password:joi.string()
      .trim()
      .required()
      .min(6)
      .messages({
        "string.empty":"password is required",
        "string.min":"password must be 6 char long"
      })
    })
    const {error,value}=schema.validate(req.body,{abortEarly:false})
    if(error){
      return sendResponse(
        res,
        false,
        null,
        "Inavlid field",
        400
      )
    }
    const { mail, password } = value;
    const loginUser = await User.findOne({
      mail,
    });
    if (!loginUser) {
      return sendResponse(res, false, null, "No user found", 401);
    }
    const matchPassword = await bcrypt.compare(password, loginUser.password);
    if (!matchPassword) {
      return sendResponse(res, false, null, "Invalid credentials", 401);
    }
    const token = setUser(loginUser);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    const data = {
      id: loginUser._id,
      token: token,
    };

    return sendResponse(res, true, data, "Login Successfull", 200);
  } catch (error) {
    console.log("Login error", error);
    return sendResponse(res, false, null, "login failed", 500);
  }
}

async function showAllUser(req, res) {
  try {
    const users = await User.find({});
    console.log("working");
    console.log(users);

    return sendResponse(res, true, users, "users fetched successfully", 200);
  } catch (error) {
    console.log("error", error);
    return sendResponse(res, false, null, "Error fetching the users", 401);
  }
}

async function updateUser(req, res) {
  try {
    const user = req.user;
    const { name, mail, password } = req.body;

    if (name) {
      await User.findOneAndUpdate(
        {
          name: user.name,
        },
        { $set: { name: name } }
      );
    }
    if (mail) {
      await User.findOneAndUpdate(
        {
          name: user.name,
        },
        { $set: { mail: mail } }
      );
    }
    if (password) {
      await User.findOneAndUpdate(
        {
          name: user.name,
        },
        { $set: { password: password } }
      );
    }
  } catch (error) {
    console.log("error", error);
    return sendResponse(res, false, null, "error while updating user", 400);
  }
  return sendResponse(res, true, null, "user updated", 200);
}

async function deleteUser(req, res) {
  try {
    const user = req.user;
    console.log(user);

    await User.findOneAndDelete({ mail: user.mail });
  } catch (error) {
    console.log("error", error);
    return sendResponse(res, false, null, "error in deleteing account", 500);
  }
}
module.exports = {
  userRegister,
  userLogin,
  showAllUser,
  updateUser,
  deleteUser,
};

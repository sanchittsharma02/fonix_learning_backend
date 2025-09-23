const userRoute = require("../routes/userRoutes");
const User = require("../models/usermodels");
const mongoose = require("mongoose");
const { UserDetails, user } = require("../models/usermodels");
const bcrypt = require("bcrypt");
const sendResponse = require("../utils/sendResponse.utils");
const fs = require("fs");
const setUser = require("../utils/auth.utils");
const { body, validationResult } = require("express-validator");
const joi = require("joi");
const mongosanitize = require("express-mongo-sanitize");
const { abort, send } = require("process");
const { error } = require("console");
const { json } = require("stream/consumers");

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
    // console.log(req.body);
    // console.log(req.file.filename);

    const schema = joi.object({
      name: joi.string().trim().min(3).required().messages({
        "srting.empty": "name is required",
        "string.min": "min 3 char required",
      }),
      mail: joi
        .string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          "string.mail": "invalid email",
          "string.empty": "mail is required",
        }),
      password: joi.string().trim().min(6).required().messages({
        "string.empty": "password is required",
        "string.min": "password must be 6 characters long",
      }),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return sendResponse(res, false, null, "Invalid fields", 400);
    }

    req.body = mongosanitize.sanitize(req.body);

    // const { name, password, mail } = req.body;
    const { name, password, mail } = value;

    const image =  `/images/${req.file.filename.replace(/\s/g, "_")}`;
    // console.log(image);

    const existingUser = await user.findOne({ mail: mail });
    const hashedpassword = await bcrypt.hash(password, 10);
    // console.log(existingUser);

    if (existingUser) {
      return sendResponse(res, false, null, "Email already registered", 409);
    }

    user.create({
      name,
      password: hashedpassword,
      mail,
      image,
    });

    return sendResponse(res, true, null, "User registered Successfully", 201);
  } catch (error) {
    console.log("registration error", error);
    return sendResponse(res, false, null, "error in register user", 500);
  }
}

async function userLogin(req, res) {
  try {
    // console.log(req.body);
    req.body = mongosanitize.sanitize(req.body);
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
    const schema = joi.object({
      mail: joi
        .string()
        .trim()
        .required()
        .email({ tlds: { allow: false } })
        .messages({
          "string.empty": "email is required",
          "string.email": "mail not valid",
        }),
      password: joi.string().trim().required().min(6).messages({
        "string.empty": "password is required",
        "string.min": "password must be 6 char long",
      }),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendResponse(res, false, null, "Inavlid field", 400);
    }
    const { mail, password } = value;
    const loginUser = await user.findOne({
      mail,
    });
    if (!loginUser) {
      return sendResponse(res, false, null, "No user found", 401);
    }
    if(loginUser.isDeleted===true){
      return sendResponse(
        res,
        false,
        null,
        "Deleted User",
        404
      )
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
    // const users = await User.find({});
    // console.log("working");
    // return sendResponse(res, true, null, "users fetched ", 200);
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    // let age = parseInt(req.query.age);
    const search = req.query.age;
    const skip = (page - 1) * limit;
    // let users = await UserDetails.find({}).skip(skip).limit(limit);
    let users = await user.find({
      isDeleted:false
    }).skip(skip).limit(limit);
    // console.log(isNaN(search));
    // console.log(search);

    if (search) {
      if (!isNaN(search)) {
        const age = parseInt(search);
        const years = users.map((user) => {
          return user.dob;
        });
        globalThis.Date;
        const currentyear = new globalThis.Date().getFullYear();
        const userage = currentyear - age;

        const result = users.filter((user) => {
          const year = user.dob ? parseInt(user.dob.split(".")[2]) : null;
          return year === userage;
        });
        // console.log(result);
        users = result;
        // console.log(users);
      } else {
        const result = users.filter((user) => {
          return (
            user.first_name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLocaleLowerCase().includes(search.toLowerCase())
          );
        });

        users = result;
        console.log(users);
      }
    }
    // const users = await UserDetail
    // const users = await UserDetails.find({}).skip(skip).limit(limit);
    // const users=result.slice(skip,skip+limit)
    const totalUsers = await UserDetails.countDocuments({});
    const totalPages = Math.ceil(totalUsers / limit);

    return sendResponse(
      res,
      true,
      { users, page, limit, totalUsers, totalPages },
      "Users fetched",
      200
    );
  } catch (error) {
    console.log("error", error);
  }
}

//  fetching users from mockdata
// async function showAllUser(req, res) {
//   try {
//     // const users = await User.find({});
//     const users= fs.readFileSync("../MOCK_DATA.json")
//     console.log("working");
//     console.log(users);

//     return sendResponse(res, true, users, "users fetched successfully", 200);
//   } catch (error) {
//     console.log("error", error);
//    return res.render("users",{users})
//     // return sendResponse(res, false, null, "Error fetching the users", 401);
//   }
// }

// not using renderusers
async function renderusers(req, res) {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  // let age = parseInt(req.query.age);
  const search = req.query.age;
  const skip = (page - 1) * limit;
  let users = await UserDetails.find({}).skip(skip).limit(limit);
  // console.log(isNaN(search));
  // console.log(search);

  if (search) {
    if (!isNaN(search)) {
      const age = parseInt(search);
      const years = users.map((user) => {
        return user.dob;
      });
      globalThis.Date;
      const currentyear = new globalThis.Date().getFullYear();
      const userage = currentyear - age;

      const result = users.filter((user) => {
        const year = user.dob ? parseInt(user.dob.split(".")[2]) : null;
        return year === userage;
      });
      // console.log(result);
      users = result;
      // console.log(users);
    } else {
      const result = users.filter((user) => {
        return (
          user.first_name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLocaleLowerCase().includes(search.toLowerCase())
        );
      });

      users = result;
      console.log(users);
    }
  }
  // const users = await UserDetail
  // const users = await UserDetails.find({}).skip(skip).limit(limit);
  // const users=result.slice(skip,skip+limit)
  const totalUsers = await UserDetails.countDocuments({});
  const totalPages = Math.ceil(totalUsers / limit);

  return sendResponse(
    res,
    true,
    { users, page, limit, totalUsers, totalPages },
    "Users fetched",
    200
  );
  // return res.render("users", { users, page, limit, totalUsers, totalPages });
}

async function updateUser(req, res) {
  try {
    const currentUser = req.user;
    const { name, mail, password } = req.body;
    // console.log(currentUser);
    

    if (name) {
      await user.findOneAndUpdate(
        {
          mail: currentUser.mail,
        },
        { $set: { name: name } }
      );
    }
    if (mail) {
      await user.findOneAndUpdate(
        {
          mail: currentUser.mail,
        },
        { $set: { mail: mail } }
      );
    }
    if (password) {
      await user.findOneAndUpdate(
        {
          mail: currentUser.mail,
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
async function softDelete(req,res) {
  const currentUser =req.user
  await user.findOneAndUpdate({
    mail:currentUser.mail
  },
{
  $set:{isDeleted:true}
})
  return sendResponse(res,
    true,
    null,
    "user deleted",
    200
  )
}

async function deleteUser(req, res) {
  try {
    const currentUser = req.user;
    console.log(currentUser);

    await user.findOneAndDelete({ mail: currentUser.mail });
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
  renderusers,
  softDelete
};

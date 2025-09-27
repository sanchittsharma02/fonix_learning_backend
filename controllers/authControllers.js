const { UserDetails, user, token } = require("../models/usermodels");
const bcrypt = require("bcrypt");
const sendResponse = require("../utils/sendResponse.utils");
const fs = require("fs");
const setUser = require("../utils/auth.utils");
const { body, validationResult } = require("express-validator");
const joi = require("joi");
const mongosanitize = require("express-mongo-sanitize");
const { sendEmail } = require("../utils/sendmail.utils");

const { send } = require("process");

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}


async function verifymail(req, res) {
  const { otp, mail } = req.body;
  // console.log('otp',otp);

  // console.log('mail',mail);

  const correct = await token.findOne({ mail: mail });
  // console.log('correct',correct.otp);

  if (otp == correct.otp) {
    await user.findOneAndUpdate({ mail: mail }, { isVerified: true });

    await token.findOneAndDelete({ otp: otp });
    return sendResponse(res, true, null, "Email verified", 200);
  }
  return sendResponse(res, false, null, "invalid otp", 401);
}

async function Register(req, res) {
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

    const image = `/images/${req.file.filename.replace(/\s/g, "_")}`;
    // console.log(image);

    const existingUser = await user.findOne({ mail: mail });
    const hashedpassword = await bcrypt.hash(password, 10);
    // console.log(existingUser);

    if (existingUser) {
      return sendResponse(res, false, null, "Email already registered", 409);
    }
    await user.create({
      name,
      password: hashedpassword,
      mail,
      image,
      isVerified: false,
    });
    const verificationtoken = generateOTP();
    const newtoken = token.create({
      mail: mail,
      otp: verificationtoken,
    });
    const verifylink = `http://localhost:1001/verifymail/${verificationtoken}`;
    const html = `<p>Click your top is ${verificationtoken}</p>`;
    const sentmail = await sendEmail(mail, "Registration", html);
    if (sentmail.success === false) {
      return sendResponse(res, false, null, "error in sending mail", 400);
    }

    return sendResponse(
      res,
      true,
      mail,
      "User registered ! Please verify Mail",
      201
    );

    // user.create({
    //   name,
    //   password: hashedpassword,
    //   mail,
    //   image,
    //   isVerified:false
    // });
  } catch (error) {
    console.log("registration error", error);
    return sendResponse(res, false, null, "error in register user", 500);
  }
}

async function Login(req, res) {
  try {
    // console.log(req.body);
    // console.log(req.headers["authorization"]);
    
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
    if (loginUser.isDeleted === true) {
      return sendResponse(res, false, null, "Deleted User", 404);
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

module.exports = { Register, Login, verifymail };

const user = require("../routes/userRoutes");
const User = require("../models/usermodels");
const bcrypt = require("bcrypt");
const sendResponse = require("../utils/sendResponse.utils");
const fs = require("fs");
const setUser = require("../utils/auth.utils");

async function userRegister(req, res) {
  try {
    const { name, password, mail } = req.body;

    if (!name || !password || !mail || !req.file) {
      return sendResponse(res, false, null, " Missing fiels", 400);
    }

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
    console.log(req.body);
    const { mail, password } = req.body;

    if (!password || !mail) {
      return sendResponse(res, false, null, "Missing fields", 400);
    }
    const loginUser = await User.findOne({
      mail,
    });
    if (!loginUser) {
      return sendResponse(res, false, null, "No user found", 401);
    }
    const matchPassword = await bcrypt.compare(password, loginUser.password);
    if (!matchPassword) {
      sendResponse(res, false, null, "Invalid credentials", 401);
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

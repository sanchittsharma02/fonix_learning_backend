const mongoose = require("mongoose");
const { UserDetails, user, token } = require("../models/usermodels");
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

const { sendEmail } = require("../utils/sendmail.utils");
const userRoute = require("../routes/userRoutes");
const User = require("../models/usermodels");
const customer = require("../models/customerModel");
const product = require("../models/productModel");
// const order=require("../models/orderModel");
const order = require("../models/orderModel");
const { name } = require("ejs");

async function aggregation(req, res) {
  /**
   * $gt greater,$lt,$eq
   */
  const orders = await order.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$customer" },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$customerId",
        name: { $first: "$customer.name" },
        productname: { $push: "$product.productname" },
        totalspent: {
          $sum: "$totalamount",
        },
      },
    },
    // {
    //     $addFields:{
    //       orderAmount:"$totalamount"
    //     }
    // },
    {
      $project: {
        totalspent: 1,
        name: 1,
        productname: 1,

        _id: 0,
      },
    },
  ]);
  return sendResponse(res, true, orders, "total spent by customers", 200);
  // console.log(orders);
}

async function popularproduct(req, res) {
  const orders = await order.aggregate([
    { $unwind: "$products" }, // unwind the products array in order
    {
      $group: {
        _id: "$products.productId",
        totalsold: { $sum: "$products.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$productDetails.productname",
        totalsold: 1,
      },
    },
    {
      $sort: {
        totalsold: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return sendResponse(res, true, orders, "popular product", 200);
}

async function averageprice(req, res) {
  const orders = await order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$_id", // group by order
        totalOrder: {
          $sum: { $multiply: ["$products.quantity", "$products.price"] },
        },
      },
    },
    // {
    //   $group:{
    //     _id:"$_id",
    //     totalorders:{ $sum:{ $multiply:["$products.quantity","$products.price"]}},
    //     averagePrice :{
    //       $avg:"$totalorders"
    //     }
    //   }
    // }
    {
      $group: {
        _id: null,
        averagePrice: {
          $avg: "$totalOrder",
        },
      },
    },
    {
      $project: {
        _id: 0,
        averagePrice: 1,
      },
    },
  ]);
  return sendResponse(res, true, orders, "average Price Per order", 200);
}


async function generateToken() {
  const { nanoid } = await import("nanoid"); // dynamic import
  return nanoid(20); // generate 20-char token
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
    let users = await user
      .find({
        isDeleted: false,
      })
      .skip(skip)
      .limit(limit);

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
    const totalUsers = await user.countDocuments({});
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

async function softDelete(req, res) {
  const currentUser = req.user;
  await user.findOneAndUpdate(
    {
      mail: currentUser.mail,
    },
    {
      $set: { isDeleted: true },
    }
  );
  return sendResponse(res, true, null, "user deleted", 200);
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

async function forgotPassword(req, res) {
  try {
    const { mail } = req.body;
    const existinguser = await user.findOne({ mail: mail });
    if (!existinguser) {
      return sendResponse(
        res,
        false,
        null,
        "no user found with this email",
        404
      );
    }
    const newtoken = await generateToken();
    console.log("token ", newtoken);
    await token.create({
      mail: mail,
      otp: "",
      verifytoken: newtoken,
    });
    const resetLink = `http://localhost:1001/resetpassword/${newtoken}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

    const sentmail = await sendEmail(mail, "Reset Password", html);
    if (sentmail.success === false) {
      return sendResponse(res, false, null, "Mail not sent", 401);
    }
    return sendResponse(res, true, null, "Reset Link Sent", 200);
  } catch (error) {
    console.log("error", error);

    return sendResponse(res, false, null, "error in reset password", 400);
  }
}



async function resetpassword(req, res) {
  const { newtoken } = req.params;
  const { password, confirmpassword } = req.body;
  console.log("new", newtoken);
  if (!password || !confirmpassword) {
    return sendResponse(
      res,
      false,
      null,
      "Pasword and confirm password are required"
    );
  }

  const correct = await token.findOne({ verifytoken: newtoken.trim() });
  // console.log(correct);

  if (!correct) {
    return sendResponse(res, false, null, "Token expired");
  }
  if (password !== confirmpassword) {
    return sendResponse(res, false, null, "Condirm password not match", 400);
  }
  const hashedpassword = await bcrypt.hash(confirmpassword, 10);
  await user.findOneAndUpdate(
    { mail: correct.mail },
    {
      password: hashedpassword,
    }
  );
  await token.findOneAndDelete({ mail: correct.mail });

  return sendResponse(res, true, null, "Password changed", 200);
}
module.exports = {
  // userRegister,
  // userLogin,
  showAllUser,
  updateUser,
  deleteUser,
  renderusers,
  softDelete,
  aggregation,
  popularproduct,
  averageprice,
  forgotPassword,
  generateToken,
  resetpassword,
};



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

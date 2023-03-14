const express = require("express");
const userRouter = express.Router();
const { RegisterUser, LoginUser } = require("../controllers/user.controllers");
const {
  RegisterUser_checkEmpty,
  LoginUser_checkEmpty,
} = require("../middlewares/validations/user.validation");

// Thêm người dùng
userRouter.post("/users", RegisterUser_checkEmpty, RegisterUser);

userRouter.post("/login", LoginUser_checkEmpty, LoginUser);

module.exports = userRouter;

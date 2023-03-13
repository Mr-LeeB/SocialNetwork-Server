const express = require("express");
const userRouter = express.Router();
const { RegisterUser_control } = require("../controllers/user.controllers");
const {
  RegisterUser_checkEmpty,
} = require("../middlewares/validations/user.validation");

// Thêm người dùng
userRouter.post("/register", RegisterUser_checkEmpty, RegisterUser_control);

module.exports = userRouter;

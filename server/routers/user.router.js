const express = require("express");
const userRouter = express.Router();
const { RegisterUser } = require("../controllers/user.controllers");
const {
  RegisterUser_checkEmpty,
} = require("../middlewares/validations/user.validation");

// Thêm người dùng
userRouter.post("/register", RegisterUser_checkEmpty, RegisterUser);

module.exports = userRouter;

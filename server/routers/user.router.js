const express = require("express");
const userRouter = express.Router();
const {
  RegisterUser,
  FindUserByID,
} = require("../controllers/user.controllers");
const {
  RegisterUser_checkEmpty,
} = require("../middlewares/validations/user.validation");

userRouter.post("/users", RegisterUser_checkEmpty, RegisterUser);

userRouter.get("/users/:id", FindUserByID);

module.exports = userRouter;

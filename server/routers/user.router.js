const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controllers");
const userValidation = require("../middlewares/validations/user.validation");
const {
  checkAuthentication,
} = require("../middlewares/authentication/checkAuthentication");

userRouter.post(
  "/users",
  userValidation.registerUser_checkEmpty,
  userController.registerUser
);

userRouter.get("/users/:id", checkAuthentication, userController.findUserByID);

userRouter.put("/users/:id", checkAuthentication, userController.updateUser);

module.exports = userRouter;

const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controllers");
const userValidation = require("../middlewares/validations/user.validation");

userRouter.post(
  "/users",
  userValidation.registerUser_checkEmpty,
  userController.registerUser
);

userRouter.get("/users/:id", userController.findUserByID);

userRouter.put("/users/:id", userController.updateUser);

module.exports = userRouter;

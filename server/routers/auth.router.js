const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controllers");
const authValidation = require("../middlewares/validations/auth.validation");

authRouter.post(
  "/checklogin",
  authValidation.checkToken,
  authController.checkLogin
);

authRouter.post(
  "/login",
  authValidation.login_checkEmpty,
  authController.login
);

authRouter.post("/logout", authValidation.checkToken, authController.logout);

module.exports = authRouter;

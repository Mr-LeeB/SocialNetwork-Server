const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controllers");
const authValidation = require("../middlewares/validations/auth.validation");
const client = require("../config/google-config");

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

authRouter.get("/auth/google", authController.login_Google);

authRouter.get(
  "/auth/google/callback",
  authValidation.login_validation_Google,
  authController.login_Google_Callback
);

authRouter.post("/logout", authValidation.checkToken, authController.logout);

authRouter.post(
  "/forgot",
  authValidation.checkEmail_Empty,
  authController.forgot_password
);

authRouter.post("/verify", authController.verify_code);

module.exports = authRouter;

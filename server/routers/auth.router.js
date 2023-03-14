const express = require("express");
const authRouter = express.Router();
const {
  checkLoginBefore,
  LoginUser,
  Logout,
} = require("../controllers/auth.controllers");
const {
  checkToken,
  LoginUser_checkEmpty,
} = require("../middlewares/validations/auth.validation");

authRouter.post("/checkLoginBefore", checkToken, checkLoginBefore);

authRouter.post("/login", LoginUser_checkEmpty, LoginUser);

authRouter.post("/logout", checkToken, Logout);

module.exports = authRouter;

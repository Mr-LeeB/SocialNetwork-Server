const express = require("express");
const authRouter = express.Router();
const { checkLoginBefore } = require("../controllers/auth.controllers");
const { checkToken } = require("../middlewares/validations/auth.validation");
const {
  LoginUser_checkEmpty,
} = require("../middlewares/validations/auth.validation");
const { LoginUser } = require("../controllers/auth.controllers");

authRouter.post("/checkLoginBefore", checkToken, checkLoginBefore);

authRouter.post("/login", LoginUser_checkEmpty, LoginUser);

authRouter.post("/logout", (req, res) => {
  req.session.destroy();
  res.send({ success: true, message: "Logout successfully!" });
});

module.exports = authRouter;

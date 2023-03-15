const express = require("express");
const userRouter = express.Router();
const {
  RegisterUser,
  LoginUser,
  FindUserByID,
} = require("../controllers/user.controllers");
const {
  RegisterUser_checkEmpty,
  LoginUser_checkEmpty,
} = require("../middlewares/validations/user.validation");

// ---------------------------------------------------------------------------

// Thêm người dùng
userRouter.post("/users", RegisterUser_checkEmpty, RegisterUser);

userRouter.post("/login", LoginUser_checkEmpty, LoginUser);

userRouter.post("/logout", (req, res) => {
  req.session.destroy();
  res.send({ success: true, message: "Logout successfully!" });
});

userRouter.get("/users/:id", FindUserByID);

module.exports = userRouter;

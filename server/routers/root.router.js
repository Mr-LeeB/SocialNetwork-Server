const express = require("express");
const router = express.Router();
const userRouter = require("./user.router");
const STATUS_CODE = require("../util/SettingSystem");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

router.use("/users", userRouter);

//check access token
router.post("/checkAuthorized", (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    return res
      .status(STATUS_CODE.BAD_REQUEST)
      .send({ success: false, message: "No token provided!" });
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(STATUS_CODE.UN_AUTHOR)
        .send({ success: false, message: "Invalid token!" });
    } else {
      userModel.getUserById(decoded.userId).then((user) => {
        if (!user) {
          return res
            .status(STATUS_CODE.NOT_FOUND)
            .send({ success: false, message: "User not found!" });
        } else {
          if (user.accessToken === accessToken) {
            return res
              .status(STATUS_CODE.SUCCESS)
              .send({ success: true, message: "Authorized!" });
          } else {
            return res
              .status(STATUS_CODE.UN_AUTHOR)
              .send({ success: false, message: "Unauthorized!" });
          }
        }
      });
    }
  });
});

module.exports = router;

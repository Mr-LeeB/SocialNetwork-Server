const express = require("express");
const router = express.Router();
const userRouter = require("./user.router");
const STATUS_CODE = require("../util/SettingSystem");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

router.use("/", userRouter);

//check access token
router.post("/checkLoginBefore", (req, res) => {
  const accessToken = req.body.accessToken;
  if (!accessToken) {
    return res
      .status(STATUS_CODE.SUCCESS)
      .send({ success: false, message: "No token found!" });
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(STATUS_CODE.SUCCESS)
        .send({ success: false, message: "Invalid token!" });
    } else {
      userModel.getUserById(decoded.userId).then((user) => {
        if (!user) {
          return res
            .status(STATUS_CODE.SUCCESS)
            .send({ success: false, message: "User not found!" });
        } else {
          if (user.accessToken === accessToken) {
            return res
              .status(STATUS_CODE.SUCCESS)
              .send({ success: true, message: "Have already login!" });
          } else {
            return res
              .status(STATUS_CODE.SUCCESS)
              .send({ success: false, message: "Have not login before!" });
          }
        }
      });
    }
  });
});

module.exports = router;

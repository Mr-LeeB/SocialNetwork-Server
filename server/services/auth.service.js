const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const STATUS_CODE = require("../util/SettingSystem");

const checkLoginBefore_Service = async (accessToken) => {
  let userID;
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    userID = decoded.userId;
  });
  userModel.getUserById(userID).then((user) => {
    if (!user) {
      return {
        status: STATUS_CODE.SUCCESS,
        success: false,
        message: "User does not exist!",
      };
    } else {
      if (user.accessToken === accessToken) {
        return {
          status: STATUS_CODE.SUCCESS,
          success: true,
          message: "Have login before!",
        };
      } else {
        return {
          status: STATUS_CODE.SUCCESS,
          success: false,
          message: "Have not login before!",
        };
      }
    }
  });
};

module.exports = {
  checkLoginBefore_Service,
};

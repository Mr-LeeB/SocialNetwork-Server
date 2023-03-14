const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const STATUS_CODE = require("../util/SettingSystem");

const checkLoginBefore_Service = async (accessToken) => {
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const userID = decoded.userId;

  const user = await userModel.getUserById(userID);
  if (!user) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "User does not exist!",
    };
  }
  if (user.accessToken !== accessToken) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "Have not logged in!",
    };
  }

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: "User have logged in!",
  };
};

module.exports = {
  checkLoginBefore_Service,
};

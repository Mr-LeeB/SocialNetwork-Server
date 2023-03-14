const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const STATUS_CODE = require("../util/SettingSystem");
const argon2 = require("argon2");

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

const LoginUser_Service = async (user) => {
  const { email, password } = user;

  // Check for invalid user
  const userFind = await userModel.getUserByEmail(email);
  if (!userFind) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "Email does not exist!",
    };
  }

  // Check for invalid password
  const validPassword = await argon2.verify(userFind.password, password);
  if (!validPassword) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "Invalid password!",
    };
  }

  // All good
  // Update secretKey to user
  const accessToken = jwt.sign(
    { userId: userFind._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  await userModel.updateUser(email, { accessToken: accessToken });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: "User login successfully",
    content: {
      accessToken,
    },
  };
};

const Logout_Service = async (accessToken) => {
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

  await userModel.updateUser(user.email, { accessToken: null });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: "User logout successfully",
  };
};

module.exports = {
  checkLoginBefore_Service,
  LoginUser_Service,
  Logout_Service,
};

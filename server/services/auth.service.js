const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const STATUS_CODE = require("../util/SettingSystem");
const argon2 = require("argon2");

const checkLogin_Service = async (accessToken) => {
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const userID = decoded.userId;

  const user = await userModel.getUserById(userID);
  if (!user) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: "User does not exist!",
    };
  }
  if (user.accessToken !== accessToken) {
    return {
      status: STATUS_CODE.UNAUTHORIZED,
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

const login_Service = async (user) => {
  const { email, password } = user;

  // Check for invalid user
  const userFind = await userModel.getUserByEmail(email);
  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: "Email does not exist!",
    };
  }

  // Check for invalid password
  const validPassword = await argon2.verify(userFind.password, password);
  if (!validPassword) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
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

const logout_Service = async (accessToken) => {
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const userID = decoded.userId;

  const user = await userModel.getUserById(userID);
  if (!user) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: "User does not exist!",
    };
  }

  if (user.accessToken !== accessToken) {
    return {
      status: STATUS_CODE.UNAUTHORIZED,
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
  checkLogin_Service,
  login_Service,
  logout_Service,
};

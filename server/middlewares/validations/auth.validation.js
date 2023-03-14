const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../../util/SettingSystem");

const checkToken = async (req, res, next) => {
  const token = req.body.accessToken;
  const accessToken = token.replaceAll('"', "");

  if (!accessToken) {
    return res
      .status(STATUS_CODE.SUCCESS)
      .send({ success: false, message: "No token found!" });
  }

  try {
    await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res
      .status(STATUS_CODE.SUCCESS)
      .send({ success: false, message: error.message });
  }

  next();
};

const LoginUser_checkEmpty = (req, res, next) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(STATUS_CODE.SUCCESS).send({
      success: false,
      message: "Please enter all fields",
    });
  }
  next();
};

module.exports = {
  checkToken,
  LoginUser_checkEmpty,
};

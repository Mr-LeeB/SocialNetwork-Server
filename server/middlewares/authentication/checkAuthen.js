const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../../util/SettingSystem");

const checkAuthentication = async (req, res, next) => {
  const accessToken = req
    .header("Authorization")
    .split(" ")[1]
    .replace(/"/g, "");

  if (!accessToken) {
    return res
      .status(STATUS_CODE.NOT_FOUND)
      .send({ success: false, message: "No token found!" });
  }

  try {
    await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res
      .status(STATUS_CODE.BAD_REQUEST)
      .send({ success: false, message: error.message });
  }
  next();
};

module.exports = {
  checkAuthentication,
};

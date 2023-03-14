const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../../util/SettingSystem");

const checkToken = async (req, res, next) => {
  const accessToken = req.body.accessToken;

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

module.exports = {
  checkToken,
};

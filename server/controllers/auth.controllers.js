const STATUS_CODE = require("../util/SettingSystem");
const authService = require("../services/auth.service");

const checkLogin = async (req, res) => {
  const token = req.body.accessToken;

  const accessToken = token.replaceAll('"', "");

  try {
    // Call service
    const result = await authService.checkLogin_Service(accessToken);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = { email, password };

  try {
    // Call service
    const result = await authService.login_Service(user);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  const token = req.body.accessToken;

  const accessToken = token.replaceAll('"', "");

  try {
    // Call service
    const result = await authService.logout_Service(accessToken);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  checkLogin,
  login,
  logout,
};

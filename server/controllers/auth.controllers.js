const STATUS_CODE = require("../util/SettingSystem");
const authService = require("../services/auth.service");
const client = require("../config/google-config");

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

const login_Google = async (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
  res.redirect(authUrl);
};

const login_Google_Callback = async (req, res) => {
  const { code } = req.query;

  try {
    const result = await authService.login_Google_Callback_Service(code);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    }
    return res.status(status).send({ success, message, content });
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
  login_Google,
  login_Google_Callback,
};

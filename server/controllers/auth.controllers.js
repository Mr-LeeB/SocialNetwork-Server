const STATUS_CODE = require('../util/SettingSystem');
const authService = require('../services/auth.service');
const client = require('../config/google-config');

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
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const login_Google = async (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
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
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const login_GoogleV2 = async (req, res) => {
  const { token } = req.body;

  try {
    const result = await authService.login_GoogleV2_Service(token);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    }
    return res.status(status).send({ success, message, content });
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  const id = req.id;

  try {
    // Call service
    const result = await authService.logout_Service(id);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const forgot_password = async (req, res) => {
  const { email } = req.body;

  try {
    // Call service
    const result = await authService.forgot_password_Service(email);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const verify_code = async (req, res) => {
  const { code, email } = req.body;

  try {
    // Call service
    const result = await authService.verify_code_Service(email, code);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const checkLogin = async (req, res) => {
  const userID = req.id;

  if (!userID) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      authentication: false,
      success: false,
      message: 'Not Authorized!',
    });
  }

  return res.status(STATUS_CODE.SUCCESS).send({
    authentication: true,
    success: true,
    message: 'Logged in!',
  });
};

const getUserID = async (req, res) => {
  const userID = req.id;

  return res.status(STATUS_CODE.SUCCESS).send({
    success: true,
    message: 'Get user ID successfully!',
    content: userID,
  });
};

module.exports = {
  login,
  logout,
  login_Google,
  login_Google_Callback,
  forgot_password,
  verify_code,
  checkLogin,
  getUserID,
  login_GoogleV2,
};

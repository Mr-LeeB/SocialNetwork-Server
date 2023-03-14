const STATUS_CODE = require("../util/SettingSystem");
const {
  checkLoginBefore_Service,
  LoginUser_Service,
  Logout_Service,
} = require("../services/auth.service");

const checkLoginBefore = async (req, res) => {
  const accessToken = req.body.accessToken;

  try {
    // Call service
    const result = await checkLoginBefore_Service(accessToken);

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

const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = { email, password };

  try {
    // Call service
    const result = await LoginUser_Service(user);

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

const Logout = async (req, res) => {
  const token = req.body.accessToken;

  const accessToken = token.replaceAll('"', "");

  try {
    // Call service
    const result = await Logout_Service(accessToken);

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
  checkLoginBefore,
  LoginUser,
  Logout,
};

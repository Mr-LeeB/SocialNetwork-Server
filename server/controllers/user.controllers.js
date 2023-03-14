const {
  RegisterUser_Service,
  LoginUser_Service,
  FindUserByID_Service,
} = require("../services/user.services");
const STATUS_CODE = require("../util/SettingSystem");

// @route POST api/users
// @desc Register user
// @access Public

const RegisterUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const user = { firstname, lastname, email, password };

  try {
    // Call service
    const result = await RegisterUser_Service(user);

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

const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = { email, password };

  try {
    // Call service
    const result = await LoginUser_Service(req, user);

    // Return result
    const { status, success, message, content, userID } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      req.session.userID = userID;
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const FindUserByID = async (req, res) => {
  const { id } = req.params;

  try {
    // Call service
    const result = await FindUserByID_Service(id);

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

module.exports = {
  RegisterUser,
  LoginUser,
  FindUserByID,
};

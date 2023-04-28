const userService = require("../services/user.services");
const STATUS_CODE = require("../util/SettingSystem");

// @route POST api/users
// @desc Register user
// @access Public

const registerUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const user = { firstname, lastname, email, password };

  try {
    // Call service
    const result = await userService.registerUser_Service(user);

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

const findUserByID = async (req, res) => {
  const { id } = req.params;

  try {
    // Call service
    const result = await userService.findUserByID_Service(id);

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

const UpdateUser = async (req, res) => {
  const { id } = req.params;

  const { firstname, lastname, descriptions } = req.body;

  const user = { firstname, lastname, descriptions };

  try {
    // Call service
    const result = await userService.updateUser_Service(id, user);

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

const Expertise = async (req, res) => {
  const { id } = req.params;

  const { expertise } = req.body;

  const user = { expertise };

  try {
    // Call service
    const result = await userService.expertise_Service(id, user);

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
  registerUser,
  findUserByID,
  UpdateUser,
  Expertise,
};

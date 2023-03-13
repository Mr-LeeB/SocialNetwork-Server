const { RegisterUser_Service } = require("../services/user.services");

// @route POST api/users
// @desc Register user
// @access Public

const RegisterUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = { name, email, password };

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
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  RegisterUser,
};

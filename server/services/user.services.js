const { User } = require("../models/User");
const STATUS_CODE = require("../util/SettingSystem");

const registerUser_Service = async (user) => {
  const { firstname, lastname, email, password } = user;

  // Check for existing user
  const userFind = await User.findOne({ email });
  if (userFind) {
    return {
      status: STATUS_CODE.CONFLICT,
      success: false,
      message: "Email already exists!",
    };
  }
  // All good
  const newUser = new User({
    firstname,
    lastname,
    email,
    password,
  });
  await newUser.save();

  return {
    status: STATUS_CODE.CREATED,
    success: true,
    message: "User created successfully",
    content: {
      accessToken: newUser.accessToken,
    },
  };
};

const findUserByID_Service = async (userID) => {
  const userFind = await User.findById(userID);
  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: "User does not exist!",
    };
  } else {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "User found successfully",
      content: {
        user: userFind,
      },
    };
  }
};

module.exports = {
  registerUser_Service,
  findUserByID_Service,
};

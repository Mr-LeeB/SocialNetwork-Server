const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const userModel = require("../models/User");
const STATUS_CODE = require("../util/SettingSystem");

const RegisterUser_Service = async (user) => {
  const { firstname, lastname, email, password } = user;

  // userModel.getUser('ln26805@gmail.com').then((user) => {
  //     console.log(user);
  // });

  // Check for existing user
  const userFind = await User.findOne({ email });
  if (userFind) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "Email already exists!",
    };
  }
  // All good
  const hashedPassword = await argon2.hash(password);
  const newUser = new User({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });
  await newUser.save();

  // Update secretKey to user
  const accessToken = jwt.sign(
    { userId: newUser._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  await userModel.updateUser(email, { accessToken: accessToken });

  return {
    status: STATUS_CODE.CREATED,
    success: true,
    message: "User created successfully",
    content: {
      accessToken,
    },
  };
};

const LoginUser_Service = async (user) => {
  const { email, password } = user;

  // Check for invalid user
  const userFind = await userModel.getUserByEmail(email);
  if (!userFind) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "Email does not exist!",
    };
  }

  // Check for invalid password
  const validPassword = await argon2.verify(userFind.password, password);
  if (!validPassword) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: false,
      message: "Invalid password!",
    };
  }

  // All good
  // Update secretKey to user
  const accessToken = jwt.sign(
    { userId: userFind._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  await userModel.updateUser(email, { accessToken: accessToken });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: "User login successfully",
    content: {
      accessToken,
    },
  };
};

const FindUserByID_Service = async (userID) => {
  const userFind = await userModel.getUserById(userID);
  if (!userFind) {
    return {
      status: STATUS_CODE.SUCCESS,
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
  RegisterUser_Service,
  LoginUser_Service,
  FindUserByID_Service,
};

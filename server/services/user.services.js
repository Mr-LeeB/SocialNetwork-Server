const { User } = require('../models/User');
const STATUS_CODE = require('../util/SettingSystem');

const registerUser_Service = async (user) => {
  const { firstname, lastname, email, password } = user;

  // Check for existing user
  const userFind = await User.CheckEmail(email);
  if (userFind) {
    return {
      status: STATUS_CODE.CONFLICT,
      success: false,
      message: 'Email already exists!',
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
    message: 'User created successfully',
    content: {
      accessToken: newUser.accessToken,
    },
  };
};

const findUserByID_Service = async (userID) => {
  const userFind = await User.GetUser(userID);
  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  } else {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'User found successfully',
      content: {
        user: userFind,
      },
    };
  }
};

const updateUser_Service = async (userID, userUpdate) => {
  const userFind = await User.UpdateUser(userID, userUpdate);

  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  }

  const user = await User.GetUser(userID);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User updated successfully',
    content: {
      userInfo: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        descriptions: user.description,
        username: user.lastname + ' ' + user.firstname,
        userImage: user.userImage,
      },
    },
  };
};

const expertise_Service = async (userID, expertise) => {
  const user = await User.GetUser(userID);

  if (!user) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  }

  await user.HandleDescription(expertise.expertise);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User updated successfully',
  };
};

const getFollowed_Service = async (userID) => {
  const user = await User.GetFollowers(userID);

  const followers = [...user.followers];

  if (!followers) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not follow anyone!',
    };
  }

  // Remove unnecessary information
  followers.forEach((follower) => {
    follower.password = undefined;
    follower.accessToken = undefined;
    follower.followers = undefined;
    follower.following = undefined;
    follower.shares = undefined;
    follower.favorites = undefined;
    follower.description = undefined;
    follower.__v = undefined;
  });

  const userInfo = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.lastname + ' ' + user.firstname,
    userImage: user.userImage,
  };

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Get all followers successfully',
    content: {
      userInfo,
      followers,
    },
  };
};

module.exports = {
  registerUser_Service,
  findUserByID_Service,
  updateUser_Service,
  expertise_Service,
  getFollowed_Service,
};

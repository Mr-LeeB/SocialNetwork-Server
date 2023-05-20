const userService = require('../services/user.services');
const STATUS_CODE = require('../util/SettingSystem');

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
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const findUserByID = async (req, res) => {
  let { id } = req.params;

  if (id === 'me') {
    id = req.id;
  }

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
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const UpdateUser = async (req, res) => {
  const { id } = req.params;

  const { firstname, lastname, tags, contacts, username, userImage, coverImage, alias, location } = req.body;

  const user = { firstname, lastname, tags, contacts, username, userImage, coverImage, alias, location };

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
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const Expertise = async (req, res) => {
  const id = req.id;

  const des = req.body['des[]'];

  try {
    // Call service
    const result = await userService.expertise_Service(id, des);

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

const getFollowed = async (req, res) => {
  const id = req.id;

  try {
    // Call service
    const result = await userService.getFollowed_Service(id);

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

const followUser = async (req, res) => {
  const { id } = req.params;

  const userID = req.id;

  try {
    // Call service
    const result = await userService.followUser_Service(userID, id);

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

const getShouldFollow = async (req, res) => {
  const id = req.id;

  try {
    // Call service
    const result = await userService.getShouldFollow_Service(id);

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

module.exports = {
  registerUser,
  findUserByID,
  UpdateUser,
  Expertise,
  getFollowed,
  followUser,
  getShouldFollow,
};

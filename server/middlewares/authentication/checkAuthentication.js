const jwt = require('jsonwebtoken');
const STATUS_CODE = require('../../util/SettingSystem');
const { User } = require('../../models/User');

const checkAuthentication = async (req, res, next) => {
  const accessToken = req?.header('Authorization')?.split(' ')[1]?.replace(/"/g, '');

  if (!accessToken) {
    return res.status(STATUS_CODE.NOT_FOUND).send({
      authentication: false,
      success: false,
      message: 'No token found!',
    });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const { id } = decoded;

    //Check user
    const user = await User.GetUser(id);
    if (!user) {
      return res.status(STATUS_CODE.BAD_REQUEST).send({
        authentication: false,
        success: false,
        message: 'User not found',
      });
    }

    if (user.accessToken !== accessToken) {
      return res.status(STATUS_CODE.UNAUTHORIZED).send({
        authentication: false,
        success: false,
        message: 'Have not logged in!',
      });
    }

    req.id = id;
  } catch (error) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      authentication: false,
      success: false,
      message: error.message,
    });
  }
  next();
};

module.exports = {
  checkAuthentication,
};

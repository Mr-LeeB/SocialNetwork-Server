const STATUS_CODE = require('../../util/SettingSystem');

const login_checkEmpty = (req, res, next) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      success: false,
      message: 'Please enter all fields',
    });
  }
  next();
};

const checkEmail_Empty = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      success: false,
      message: 'Please enter email',
    });
  }
  next();
};

const checkPassword_Empty = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      success: false,
      message: 'Please enter password',
    });
  }
  next();
};

module.exports = {
  login_checkEmpty,
  checkEmail_Empty,
  checkPassword_Empty,
};

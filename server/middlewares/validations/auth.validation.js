const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../../util/SettingSystem");
const Joi = require("joi");

const login_checkEmpty = (req, res, next) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      success: false,
      message: "Please enter all fields",
    });
  }
  next();
};

const login_validation_Google = (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().required(),
  }).unknown(true);

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const checkEmail_Empty = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      success: false,
      message: "Please enter email",
    });
  }
  next();
};

module.exports = {
  login_checkEmpty,
  login_validation_Google,
  checkEmail_Empty,
};

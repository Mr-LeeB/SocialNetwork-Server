const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../../util/SettingSystem");
const Joi = require("joi");

const checkToken = async (req, res, next) => {
  const token = req.body.accessToken;

  if (!token) {
    return res
      .status(STATUS_CODE.NOT_FOUND)
      .send({ success: false, message: "No token found!" });
  }

  const accessToken = token.replaceAll('"', "");

  try {
    await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res
      .status(STATUS_CODE.BAD_REQUEST)
      .send({ success: false, message: error.message });
  }

  next();
};

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

module.exports = {
  checkToken,
  login_checkEmpty,
  login_validation_Google,
};

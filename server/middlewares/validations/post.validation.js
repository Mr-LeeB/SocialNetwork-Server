const STATUS_CODE = require("../../util/SettingSystem");

const post_checkEmpty = (req, res, next) => {
  const { title, content } = req.body;

  // Simple validation
  if (!title || !content) {
    return res.status(STATUS_CODE.BAD_REQUEST).send({
      success: false,
      message: "Please enter all fields",
    });
  }
  next();
};

module.exports = {
  post_checkEmpty,
};

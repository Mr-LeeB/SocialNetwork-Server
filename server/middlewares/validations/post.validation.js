const STATUS_CODE = require("../../util/SettingSystem");

const post_checkEmpty = (req, res, next) => {
  // get accessToken from header Authorization and remove "Bearer "
  const accessToken = req
    .header("Authorization")
    .split(" ")[1]
    .replace(/"/g, "");

  const { title, content } = req.body;

  // Simple validation
  if (!title || !content || !accessToken) {
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

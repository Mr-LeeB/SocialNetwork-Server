const STATUS_CODE = require("../util/SettingSystem");
const postService = require("../services/post.service");

const upPost = async (req, res) => {
  const { title, content, user } = req.body;

  const post = { title, content, user };

  try {
    // Call service
    const result = await postService.upPost_Service(post);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    // Call service
    const result = await postService.getPost_Service(id);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const load10Post = async (req, res) => {
  try {
    // Call service
    const result = await postService.load10Post_Service();

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const editPost = async (req, res) => {
  const { id } = req.params;
  const { title, content, user } = req.body;

  const post = { title, content, user };

  try {
    // Call service
    const result = await postService.editPost_Service(id, post);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

const getPostByUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    // Call service
    const result = await postService.getPostByUser_Service(id);

    // Return result
    const { status, success, message, content } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message, content });
    }
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODE.SERVER_ERROR)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  upPost,
  getPost,
  load10Post,
  editPost,
  getPostByUser,
};

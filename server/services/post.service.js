const STATUS_CODE = require("../util/SettingSystem");
const { Post } = require("../models/Post");

const handleError = (error, statusCode) => {
  return {
    status: statusCode,
    success: false,
    message: error.message || "Server Error",
  };
};

const upPost_Service = async (post) => {
  const { title, content, user } = post;

  const newPost = new Post({
    title,
    content,
    user,
  });

  try {
    const result = await newPost.save();
    return {
      status: STATUS_CODE.CREATED,
      success: true,
      message: "Post created successfully",
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const getPost_Service = async (id) => {
  try {
    const result = await Post.findById(id);
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post found",
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const load10Post_Service = async () => {
  try {
    const result = await Post.find().sort({ date: -1 }).limit(10);
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post found",
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const editPost_Service = async (id, post) => {
  const { title, content } = post;
  try {
    await Post.findByIdAndUpdate(id, { title, content });
    const result = await Post.findById(id);
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post updated successfully",
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const getPostByUser_Service = async (id) => {
  try {
    const result = await Post.find({ user: id });
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post found",
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

module.exports = {
  upPost_Service,
  getPost_Service,
  load10Post_Service,
  editPost_Service,
  getPostByUser_Service,
};

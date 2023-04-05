const STATUS_CODE = require("../util/SettingSystem");
const { Post } = require("../models/Post");
const { User } = require("../models/User");

const handleError = (error, statusCode) => {
  return {
    status: statusCode,
    success: false,
    message: error.message || "Server Error",
  };
};

const upPost_Service = async (post) => {
  const { title, content, user } = post;

  const newPost = {
    title,
    content,
    user,
  };

  try {
    const result = await Post.SavePost(newPost);
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
    const result = await Post.GetPost(id);
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

const loadAllPost_Service = async () => {
  try {
    const result = await Post.GetPosts();
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
    await Post.UpdatePost(id, { title, content });
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
    const postArr = await Post.GetPosts({ user: id });
    const user = await User.findById(postArr[0].user);

    const userInfo = {
      id: user._id,
      username: user.lastname + " " + user.firstname,
      userImage: user.userImage,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post found",
      content: {
        userInfo,
        postArr,
      },
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

module.exports = {
  upPost_Service,
  getPost_Service,
  loadAllPost_Service,
  editPost_Service,
  getPostByUser_Service,
};

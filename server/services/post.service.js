const STATUS_CODE = require("../util/SettingSystem");
const { Post } = require("../models/Post");
const { User } = require("../models/User");
const { Like } = require("../models/Like");
const jwt = require("jsonwebtoken");
const aws = require("aws-sdk");
const configAWS = require("../config/config.json");

const REGION = configAWS.REGION;
const ACCESS_KEY = configAWS.AWS_ACCESS_KEY;
const SECRET_KEY = configAWS.AWS_SECRET_KEY;

const handleError = (error, statusCode) => {
  return {
    status: statusCode,
    success: false,
    message: error.message || "Server Error",
  };
};

const upPost_Service = async (post, id) => {
  const { title, content, linkImage } = post;

  const newPost = {
    title,
    content,
    user: id,
    url: linkImage ? linkImage : null,
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

const uploadPostImage_Service = async (
  imageName,
  imageContent,
  imageType,
  imageSize
) => {
  aws.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
  });

  const s3 = new aws.S3();
  const s3Params = {
    Bucket: configAWS.BUCKET,
    Key: imageName,
    Body: imageContent,
    ACL: "public-read",
    ContentType: imageType,
    ContentLength: imageSize,
  };

  // Uploading files to the bucket and waiting for the result
  try {
    const result = await s3.upload(s3Params).promise();
    if (result) {
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Upload image successfully",
        content: result.Location,
      };
    } else {
      return {
        status: STATUS_CODE.BAD_REQUEST,
        success: false,
        message: "Upload image failed",
      };
    }
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

const editPost_Service = async (id, post, userID) => {
  // check owner
  const postFind = await Post.GetPost(id);
  if (postFind.user != userID) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: "You are not authorized to edit this post",
    };
  }

  const { title, content } = post;

  try {
    const result = await Post.UpdatePost(id, { title, content });
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
    const postArr = await Post.GetPostByUser(id);
    const user = postArr[0].user;

    //delete user from post
    postArr.forEach((post) => {
      post.user = undefined;
    });

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

const deletePost_Service = async (id, userID) => {
  //Find post
  const post = await Post.GetPost(id);

  //Check user
  if (post.user.toString() !== userID) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: "User is not the owner of this post",
    };
  }

  try {
    const result = await Post.DeletePost(id);
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post deleted successfully",
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleLikePost_Service = async (id, userID) => {
  //Find post
  const post = await Post.GetPostPopulateLike(id);
  const user = await User.GetUser(userID);

  //Check user liked
  if (post.likes.filter((like) => like.user.toString() === userID).length > 0) {
    //Remove like
    const like = await Like.GetLikeByPostAndUser(id, userID);
    await post.RemoveLike(like);
    await user.RemoveLike(like);
    await Like.DeleteLike(like._id);

    try {
      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Post unliked successfully",
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  } else {
    //Add like
    const like = await Like.SaveLike(userID, id, "like");
    await post.SaveLike(like);
    await user.SaveLike(like);

    try {
      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Post liked successfully",
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  }
};

module.exports = {
  upPost_Service,
  getPost_Service,
  loadAllPost_Service,
  editPost_Service,
  getPostByUser_Service,
  uploadPostImage_Service,
  deletePost_Service,
  handleLikePost_Service,
};

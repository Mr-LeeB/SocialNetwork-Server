const STATUS_CODE = require("../util/SettingSystem");
const { Post } = require("../models/Post");
const { User } = require("../models/User");
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

const upPost_Service = async (post, accessToken) => {
  const { title, content, linkImage } = post;

  //Decode token
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  //Check user
  const user = await User.findById(decoded.id);
  if (!user) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: "User not found",
    };
  }

  const newPost = {
    title,
    content,
    user: user._id,
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
    const postArr = await Post.GetPostByUser(id);
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
  uploadPostImage_Service,
};

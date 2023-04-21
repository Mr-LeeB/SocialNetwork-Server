const STATUS_CODE = require("../util/SettingSystem");
const { Post } = require("../models/Post");
const { User } = require("../models/User");
const { Like } = require("../models/Like");
const { Share } = require("../models/Share");
const aws = require("aws-sdk");
const configAWS = require("../config/config.json");
const { Comment } = require("../models/Comment");

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

const getPostByUser_Service = async (callerID, ownerID) => {
  try {
    let postArr = await Post.GetPostByUser(ownerID);
    const user = postArr[0].user;

    // Thao tác trên mỗi post
    postArr = await Promise.all(
      postArr.map(async (post) => {
        post.user = undefined;

        // thêm biến isLiked vào post
        const postLike = await post.populate("likes");
        const checkLiked = await postLike.likes.some(async (like) => {
          return like?.user.toString() === callerID;
        });

        // thêm biến isShared vào post
        const postShare = await post.populate("shares");
        const checkShared = await postShare.shares.some(async (share) => {
          return share?.user.toString() === callerID;
        });

        // thêm biến isSaved vào post
        const userSave = await user.populate("favorites");
        const checkSaved =
          userSave.favorites.filter(
            (postSaved) => postSaved._id.toString() === post._id.toString()
          ).length > 0;

        post = post.toObject();
        post.isLiked = checkLiked;
        post.isShared = checkShared;
        post.isSaved = checkSaved;

        // tìm thông tin user trong like
        const likeArr = await post.likes.map(async (like) => {
          const user = await User.GetUser(like.user);
          like.user = {
            id: user._id,
            username: user.lastname + " " + user.firstname,
            userImage: user.userImage,
          };
          return like;
        });

        post.likes = await Promise.all(likeArr);

        // tìm thông tin user trong share
        const shareArr = await post.shares.map(async (share) => {
          const user = await User.GetUser(share.user);
          share.user = {
            id: user._id,
            username: user.lastname + " " + user.firstname,
            userImage: user.userImage,
          };
          return share;
        });

        post.shares = await Promise.all(shareArr);

        // tìm thông tin user trong comment và trong list reply
        const commentArr = await post.comments.map(async (comment) => {
          // check nếu comment là comment reply thì xóa comment đó đi
          if (comment.isReply) {
            return;
          }

          const user = await User.GetUser(comment.user);
          comment.user = {
            id: user._id,
            username: user.lastname + " " + user.firstname,
            userImage: user.userImage,
          };

          const replyArr = await comment.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            reply = commentReply.toObject();
            reply.user = undefined;
            reply.user = {
              id: commentReply.user._id,
              username:
                commentReply.user.lastname + " " + commentReply.user.firstname,
              userImage: commentReply.user.userImage,
            };
            return reply;
          });

          comment.listReply = await Promise.all(replyArr);

          return comment;
        });

        post.comments = await Promise.all(commentArr);

        return post;
      })
    );

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
  let post = await Post.GetPost(id);
  post = await post.populate("likes");
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
    const like = await Like.SaveLike(userID, id);
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

const handleSharePost_Service = async (id, userID) => {
  //Find post
  let post = await Post.GetPost(id);
  post = await post.populate("shares");
  const user = await User.GetUser(userID);

  //Check user shared
  if (
    post.shares.filter((share) => share.user.toString() === userID).length > 0
  ) {
    //Remove share
    const share = await Share.GetShareByPostAndUser(id, userID);
    await post.RemoveShare(share);
    await user.RemoveShare(share);
    await Share.DeleteShare(share._id);

    try {
      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Post unshared successfully",
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  } else {
    //Add share
    const share = await Share.SaveShare(userID, id);
    await post.SaveShare(share);
    await user.SaveShare(share);

    try {
      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Post shared successfully",
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  }
};

const handleFavoritePost_Service = async (id, userID) => {
  //Find post
  let post = await Post.GetPost(id);
  let user = await User.GetUser(userID);
  user = await user.populate("favorites");

  //Check user shared
  if (
    user.favorites.filter((favorite) => favorite._id?.toString() === id)
      .length > 0
  ) {
    //Remove favorite
    await user.RemoveFavorite(post);

    try {
      const result = await user.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Post unfavorited successfully",
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  } else {
    //Add favorite
    await user.SaveFavorite(post);

    try {
      const result = await user.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: "Post favorited successfully",
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  }
};

const commentPost_Service = async (id, userID, contentComment) => {
  //Find post
  let post = await Post.GetPost(id);
  post = await post.populate("comments");
  const user = await User.GetUser(userID);

  const commentContent = {
    user: userID,
    content: contentComment,
    post: id,
  };

  //Add comment
  const comment = await Comment.SaveComment(commentContent);
  await post.SaveComment(comment);
  await user.SaveComment(comment);

  try {
    const result = await post.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: "Post commented successfully",
      content: result,
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
  deletePost_Service,
  handleLikePost_Service,
  handleSharePost_Service,
  handleFavoritePost_Service,
  commentPost_Service,
};

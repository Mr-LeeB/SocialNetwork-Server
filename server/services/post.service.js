const STATUS_CODE = require('../util/SettingSystem');
const { Post } = require('../models/Post');
const { User } = require('../models/User');
const { Like } = require('../models/Like');
const { Share } = require('../models/Share');
const aws = require('aws-sdk');
const configAWS = require('../config/config.json');
const { Comment } = require('../models/Comment');

const REGION = configAWS.REGION;
const ACCESS_KEY = configAWS.AWS_ACCESS_KEY;
const SECRET_KEY = configAWS.AWS_SECRET_KEY;

const handleError = (error, statusCode) => {
  return {
    status: statusCode,
    success: false,
    message: error.message || 'Server Error',
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
      message: 'Post created successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const uploadPostImage_Service = async (imageName, imageContent, imageType, imageSize) => {
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
    ACL: 'public-read',
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
        message: 'Upload image successfully',
        content: result.Location,
      };
    } else {
      return {
        status: STATUS_CODE.BAD_REQUEST,
        success: false,
        message: 'Upload image failed',
      };
    }
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const getPost_Service = async (id, callerID) => {
  try {
    let post = await Post.GetPost(id);
    const user = await User.GetUser(callerID);
    // thêm biến isLiked vào post
    const postLike = await post.populate('likes');
    const checkLiked = (await postLike.likes.filter((like) => like.user.toString() === callerID).length) > 0;

    // thêm biến isShared vào post
    const postShare = await post.populate('shares');
    const checkShared = (await postShare.shares.filter((share) => share.user.toString() === callerID).length) > 0;

    // thêm biến isSaved vào post
    const userSave = await user.populate('favorites');
    const checkSaved =
      userSave.favorites.filter((postSaved) => postSaved._id.toString() === post._id.toString()).length > 0;

    post = post.toObject();
    const userPost = post.user;
    post.user = {
      id: userPost._id,
      username: userPost.lastname + ' ' + userPost.firstname,
      userImage: userPost.userImage,
    };
    post.isLiked = checkLiked;
    post.isShared = checkShared;
    post.isSaved = checkSaved;

    // tìm thông tin user trong like
    const likeArr = await post.likes.map(async (like) => {
      const user = await User.GetUser(like.user);
      like.user = {
        id: user._id,
        username: user.lastname + ' ' + user.firstname,
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
        username: user.lastname + ' ' + user.firstname,
        userImage: user.userImage,
      };
      // Remove all fields except user
      Object.keys(share).forEach((key) => {
        if (key !== 'user' && key !== '_id' && key !== 'post' && key !== 'createdAt' && key !== 'updatedAt') {
          delete share[key];
        }
      });

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
        username: user.lastname + ' ' + user.firstname,
        userImage: user.userImage,
      };

      const replyArr = await comment.listReply.map(async (reply) => {
        const commentReply = await Comment.GetCommentByID(reply);
        reply = commentReply.toObject();
        reply.user = {
          id: commentReply.user._id,
          username: commentReply.user.lastname + ' ' + commentReply.user.firstname,
          userImage: commentReply.user.userImage,
        };
        return reply;
      });

      comment.listReply = await Promise.all(replyArr);

      return comment;
    });

    post.comments = await Promise.all(commentArr);

    const userInfo = {
      id: user._id,
      username: user.lastname + ' ' + user.firstname,
      userImage: user.userImage,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        post,
      },
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const getPostShare_Service = async (id, callerID) => {
  try {
    let share = await Share.GetShare(id);
    const post = await Post.GetPost(share.post);
    const user = await User.GetUser(share.user.id);

    // thêm biến isLiked vào post
    const postLike = await share.populate('likes');
    const checkLiked = await postLike.likes.some(async (like) => {
      return like?.user.toString() === callerID;
    });

    // tìm thông tin user trong like
    const likeArr = await postLike.likes.map(async (like) => {
      const user = await User.GetUser(like.user);
      like.user = {
        id: user._id,
        username: user.lastname + ' ' + user.firstname,
        userImage: user.userImage,
      };
      return like;
    });

    // tìm thông tin user trong comment và trong list reply
    const postComment = await share.populate('comments');
    const commentArr = await postComment.comments.map(async (comment) => {
      const commentPopulate = await Comment.GetCommentByID(comment);
      comment = commentPopulate.toObject();
      // check nếu comment là comment reply thì xóa comment đó đi
      if (comment.isReply) {
        return;
      }

      const user = await User.GetUser(comment.user);
      comment.user = {
        id: user._id,
        username: user.lastname + ' ' + user.firstname,
        userImage: user.userImage,
      };

      const replyArr = await comment.listReply.map(async (reply) => {
        const commentReply = await Comment.GetCommentByID(reply);
        reply = commentReply.toObject();
        reply.user = {
          id: commentReply.user._id,
          username: commentReply.user.lastname + ' ' + commentReply.user.firstname,
          userImage: commentReply.user.userImage,
        };
        return reply;
      });

      comment.listReply = await Promise.all(replyArr);

      return comment;
    });

    const _id = share._id;
    const createdAt = share.createdAt;
    const updatedAt = share.updatedAt;
    const postID = post._id;
    const views = share.views;

    share = post.toObject();
    share._id = _id;
    share.owner = {
      id: post.user._id,
      username: post.user.lastname + ' ' + post.user.firstname,
      userImage: post.user.userImage,
    };
    share.shares = undefined;
    share.user = {
      id: user._id,
      username: user.lastname + ' ' + user.firstname,
      userImage: user.userImage,
    };
    share.postID = postID;
    share.createdAt = createdAt;
    share.views = views;
    share.updatedAt = updatedAt;
    share.isLiked = checkLiked;
    share.PostShared = true;
    share.likes = await Promise.all(likeArr);
    share.comments = await Promise.all(commentArr);

    const userInfo = {
      id: user._id,
      username: user.lastname + ' ' + user.firstname,
      userImage: user.userImage,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        post: share,
      },
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const loadAllPost_Service = async (callerID) => {
  try {
    let postArr = await Post.GetPosts();
    const user = await User.GetUser(callerID);

    // Thao tác trên mỗi post
    postArr = await Promise.all(
      postArr.map(async (post) => {
        // thêm biến isLiked vào post
        const postLike = await post.populate('likes');
        const checkLiked = (await postLike.likes.filter((like) => like.user.toString() === callerID).length) > 0;

        // thêm biến isShared vào post
        const postShare = await post.populate('shares');
        const checkShared = (await postShare.shares.filter((share) => share.user.toString() === callerID).length) > 0;

        // thêm biến isSaved vào post
        const userSave = await user.populate('favorites');
        const checkSaved =
          userSave.favorites.filter((postSaved) => postSaved._id.toString() === post._id.toString()).length > 0;

        post = post.toObject();
        const userInfo = post.user;
        post.user = {
          id: userInfo._id,
          username: userInfo.lastname + ' ' + userInfo.firstname,
          userImage: userInfo.userImage,
        };
        post.isLiked = checkLiked;
        post.isShared = checkShared;
        post.isSaved = checkSaved;

        // tìm thông tin user trong like
        const likeArr = await post.likes.map(async (like) => {
          const user = await User.GetUser(like.user);
          like.user = {
            id: user._id,
            username: user.lastname + ' ' + user.firstname,
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
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };
          // Remove all fields except user
          Object.keys(share).forEach((key) => {
            if (key !== 'user' && key !== '_id' && key !== 'post' && key !== 'createdAt' && key !== 'updatedAt') {
              delete share[key];
            }
          });

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
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };

          const replyArr = await comment.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            reply = commentReply.toObject();
            reply.user = {
              id: commentReply.user._id,
              username: commentReply.user.lastname + ' ' + commentReply.user.firstname,
              userImage: commentReply.user.userImage,
            };
            return reply;
          });

          comment.listReply = await Promise.all(replyArr);

          return comment;
        });

        post.comments = await Promise.all(commentArr);

        return post;
      }),
    );

    // Tìm và tạo post mới cho các bài share bởi tất cả user và thêm vào postArr
    let shareArr = await Share.GetShares();
    shareArr = shareArr.flat();
    const sharePostArr = await Promise.all(
      shareArr.map(async (share) => {
        const post = await Post.GetPost(share.post);
        const user = await User.GetUser(share.user._id);
        share = Share(share);

        // thêm biến isLiked vào post
        const postLike = await share.populate('likes');
        const checkLiked = await postLike.likes.some(async (like) => {
          return like?.user.toString() === callerID;
        });

        // tìm thông tin user trong like
        const likeArr = await postLike.likes.map(async (like) => {
          const user = await User.GetUser(like.user);
          like.user = {
            id: user._id,
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };
          return like;
        });

        // tìm thông tin user trong comment và trong list reply
        const postComment = await share.populate('comments');
        const commentArr = await postComment.comments.map(async (comment) => {
          const commentPopulate = await Comment.GetCommentByID(comment);
          comment = commentPopulate.toObject();
          // check nếu comment là comment reply thì xóa comment đó đi
          if (comment.isReply) {
            return;
          }

          const user = await User.GetUser(comment.user);
          comment.user = {
            id: user._id,
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };

          const replyArr = await comment.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            reply = commentReply.toObject();
            reply.user = {
              id: commentReply.user._id,
              username: commentReply.user.lastname + ' ' + commentReply.user.firstname,
              userImage: commentReply.user.userImage,
            };
            return reply;
          });

          comment.listReply = await Promise.all(replyArr);

          return comment;
        });

        const _id = share._id;
        const createdAt = share.createdAt;
        const updatedAt = share.updatedAt;
        const postCreatedAt = post.createdAt;
        const postUpdatedAt = post.updatedAt;
        const postID = post._id;
        const views = share.views;

        share = post.toObject();
        share._id = _id;
        share.owner = {
          id: post.user._id,
          username: post.user.lastname + ' ' + post.user.firstname,
          userImage: post.user.userImage,
        };
        share.shares = undefined;
        share.user = {
          id: user._id,
          username: user.lastname + ' ' + user.firstname,
          userImage: user.userImage,
        };
        share.postID = postID;
        share.createdAt = createdAt;
        share.updatedAt = updatedAt;
        share.views = views;
        share.postCreatedAt = postCreatedAt;
        share.postUpdatedAt = postUpdatedAt;
        share.isLiked = checkLiked;
        share.PostShared = true;
        share.likes = await Promise.all(likeArr);
        share.comments = await Promise.all(commentArr);

        return share;
      }),
    );

    postArr = postArr.concat(sharePostArr);

    // Sắp xếp các bài post theo thời gian gần nhất
    postArr.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    const userInfo = {
      id: user._id,
      username: user.lastname + ' ' + user.firstname,
      userImage: user.userImage,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        postArr,
      },
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const editPost_Service = async (id, post, userID) => {
  // check owner
  const postFind = await Post.GetPost(id);

  if (postFind.user._id != userID) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'You are not authorized to edit this post',
    };
  }

  const { title, content } = post;

  try {
    const result = await Post.UpdatePost(id, { title, content });
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post updated successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const getPostByUser_Service = async (callerID, ownerID) => {
  try {
    let postArr = await Post.GetPostByUser(ownerID);
    const user = await User.GetUser(callerID);
    const owner = await User.GetUser(ownerID);

    // Thao tác trên mỗi post
    postArr = await Promise.all(
      postArr.map(async (post) => {
        post.user = undefined;

        // thêm biến isLiked vào post
        const postLike = await post.populate('likes');
        const checkLiked = (await postLike.likes.filter((like) => like.user.toString() === callerID).length) > 0;

        // thêm biến isShared vào post
        const postShare = await post.populate('shares');
        const checkShared = (await postShare.shares.filter((share) => share.user.toString() === callerID).length) > 0;

        // thêm biến isSaved vào post
        const userSave = await user.populate('favorites');
        const checkSaved =
          userSave.favorites.filter((postSaved) => postSaved._id.toString() === post._id.toString()).length > 0;

        post = post.toObject();
        post.isLiked = checkLiked;
        post.isShared = checkShared;
        post.isSaved = checkSaved;

        // tìm thông tin user trong like
        const likeArr = await post.likes.map(async (like) => {
          const user = await User.GetUser(like.user);
          like.user = {
            id: user._id,
            username: user.lastname + ' ' + user.firstname,
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
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };
          // Remove all fields except user
          Object.keys(share).forEach((key) => {
            if (key !== 'user' && key !== '_id' && key !== 'post' && key !== 'createdAt' && key !== 'updatedAt') {
              delete share[key];
            }
          });

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
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };

          const replyArr = await comment.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            reply = commentReply.toObject();
            reply.user = {
              id: commentReply.user._id,
              username: commentReply.user.lastname + ' ' + commentReply.user.firstname,
              userImage: commentReply.user.userImage,
            };
            return reply;
          });

          comment.listReply = await Promise.all(replyArr);

          return comment;
        });

        post.comments = await Promise.all(commentArr);

        return post;
      }),
    );

    // Tìm và tạo post mới cho các bài share bởi owner user và thêm vào postArr
    let shareArr = await owner.GetShares();
    shareArr = shareArr.shares;
    const sharePostArr = await Promise.all(
      shareArr.map(async (share) => {
        const post = await Post.GetPost(share.post);

        // thêm biến isLiked vào post
        const postLike = await share.populate('likes');
        const checkLiked = (await postLike.likes.filter((like) => like.user.toString() === callerID).length) > 0;

        // tìm thông tin user trong like
        const likeArr = await postLike.likes.map(async (like) => {
          const user = await User.GetUser(like.user);
          like.user = {
            id: user._id,
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };
          return like;
        });

        // tìm thông tin user trong comment và trong list reply
        const postComment = await share.populate('comments');
        const commentArr = await postComment.comments.map(async (comment) => {
          const commentPopulate = await Comment.GetCommentByID(comment);
          comment = commentPopulate.toObject();
          // check nếu comment là comment reply thì xóa comment đó đi
          if (comment.isReply) {
            return;
          }

          const user = await User.GetUser(comment.user);
          comment.user = {
            id: user._id,
            username: user.lastname + ' ' + user.firstname,
            userImage: user.userImage,
          };

          const replyArr = await comment.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            reply = commentReply.toObject();
            reply.user = {
              id: commentReply.user._id,
              username: commentReply.user.lastname + ' ' + commentReply.user.firstname,
              userImage: commentReply.user.userImage,
            };
            return reply;
          });

          comment.listReply = await Promise.all(replyArr);

          return comment;
        });

        const _id = share._id;
        const createdAt = share.createdAt;
        const updatedAt = share.updatedAt;
        const postCreatedAt = post.createdAt;
        const postUpdatedAt = post.updatedAt;
        const postID = post._id;
        const owner = await User.GetUser(post.user);
        const views = share.views;

        share = post.toObject();
        share._id = _id;
        share.postID = postID;
        share.user = undefined;
        share.user = {
          id: owner._id,
          username: owner.lastname + ' ' + owner.firstname,
          userImage: owner.userImage,
        };
        share.shares = undefined;
        share.createdAt = createdAt;
        share.updatedAt = updatedAt;
        share.postCreatedAt = postCreatedAt;
        share.postUpdatedAt = postUpdatedAt;
        share.views = views;
        share.isLiked = checkLiked;
        share.PostShared = true;
        share.likes = await Promise.all(likeArr);
        share.comments = await Promise.all(commentArr);

        return share;
      }),
    );

    postArr = postArr.concat(sharePostArr);

    // Sắp xếp các bài post theo thời gian gần nhất
    postArr.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    const ownerInfo = {
      id: owner._id,
      username: owner.lastname + ' ' + owner.firstname,
      userImage: owner.userImage,
      descriptions: owner.description,
      firstname: owner.firstname,
      lastname: owner.lastname,
    };

    const userInfo = {
      id: user._id,
      username: user.lastname + ' ' + user.firstname,
      userImage: user.userImage,
      descriptions: user.description,
      firstname: user.firstname,
      lastname: user.lastname,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        ownerInfo,
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
  if (post.user._id.toString() !== userID) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'User is not the owner of this post',
    };
  }

  try {
    // Remove every like of this post
    await post.likes.map(async (like) => {
      await Like.DeleteLike(like);
    });

    // Remove every comment of this post
    await post.comments.map(async (comment) => {
      await Comment.DeleteComment(comment);
    });

    // Remove every share of this post
    await post.shares.map(async (share) => {
      await Share.DeleteShare(share);
    });

    // Remove every favorite of this post in every user
    const users = await User.GetAllUsers();
    await users.map(async (user) => {
      await user.favorites.map(async (favorite) => {
        if (favorite.toString() === id) {
          await user.RemoveFavorite(favorite);
        }
      });
    });

    //Delete post
    const result = await Post.DeletePost(id);
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post deleted successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleLikePost_Service = async (id, userID) => {
  //Find post
  let post = await Post.GetPost(id);
  post = await post.populate('likes');

  //Check user liked
  if (post.likes.filter((like) => like.user.toString() === userID).length > 0) {
    //Remove like
    const like = await Like.GetLikeByPostAndUser(id, userID);
    await post.RemoveLike(like);
    await Like.DeleteLike(like._id);

    try {
      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unliked successfully',
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  } else {
    //Add like
    const like = await Like.SaveLike(userID, id);
    await post.SaveLike(like);

    try {
      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post liked successfully',
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
  post = await post.populate('shares');
  const user = await User.GetUser(userID);

  //Check user shared
  if (post.shares.filter((share) => share.user.toString() === userID).length > 0) {
    // Remove every like of this share
    const shareObject = await Share.GetShareByPostAndUser(id, userID);
    const shareLike = await shareObject.populate('likes');
    shareLike.likes.forEach(async (like) => {
      await Like.DeleteLike(like._id);
    });

    // Remove every comment of this share
    const shareComment = await shareObject.populate('comments');
    shareComment.comments.forEach(async (comment) => {
      await Comment.DeleteComment(comment._id);
    });

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
        message: 'Post unshared successfully',
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
        message: 'Post shared successfully',
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
  user = await user.populate('favorites');

  //Check user shared
  if (user.favorites.filter((favorite) => favorite._id?.toString() === id).length > 0) {
    //Remove favorite
    await user.RemoveFavorite(post);

    try {
      const result = await user.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unfavorited successfully',
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
        message: 'Post favorited successfully',
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

  const commentContent = {
    user: userID,
    content: contentComment,
    post: id,
  };

  try {
    //Add comment
    const comment = await Comment.SaveComment(commentContent);
    await post.SaveComment(comment);

    const result = await post.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post commented successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const replyComment_Service = async (id, userID, contentComment, idComment) => {
  //Find post
  let post = await Post.GetPost(id);
  post = await post.populate('comments');

  const commentContent = {
    user: userID,
    content: contentComment,
    post: id,
    isReply: true,
  };

  try {
    //Add comment
    const comment = await Comment.SaveComment(commentContent);
    await post.SaveComment(comment);

    // Add reply to comment
    const commentReply = await Comment.GetComment(idComment);
    await commentReply.ReplyComment(comment);

    const result = await post.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post commented successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const deleteComment_Service = async (id, userID, idComment) => {
  //Find post
  let post = await Post.GetPost(id);
  post = await post.populate('comments');

  try {
    //Find comment on post
    const commentFind = post.comments.filter((comment) => comment._id.toString() === idComment)[0];

    // Find any comment if it has this comment on list reply
    const comments = await Comment.GetComments();
    const commentsReply = comments.filter((comment) => comment.listReply.indexOf(idComment) !== -1);

    // Remove comment on list reply
    commentsReply.forEach(async (comment) => {
      await comment.RemoveReplyComment(idComment);
    });

    // Remove any comment that exists on commentFind's list reply
    commentFind.listReply.forEach(async (idComment) => {
      const comment = await Comment.GetComment(idComment);
      await Comment.DeleteComment(idComment);
      await post.RemoveComment(comment);
    });

    //Remove comment
    await post.RemoveComment(commentFind);
    await Comment.DeleteComment(idComment);

    const result = await post.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post commented successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleLikePostShare_Service = async (userID, idShare) => {
  //Find share
  let share = await Share.GetShare(idShare);
  share = await share.populate('likes');

  //Check user liked
  if (share.likes.filter((like) => like.user.toString() === userID).length > 0) {
    //Remove like
    const like = await Like.GetLikeBySharePostAndUser(idShare, userID);
    await share.RemoveLike(like);
    await Like.DeleteLike(like._id);

    try {
      const result = await share.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unliked successfully',
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  } else {
    //Add like
    const like = await Like.SaveLikeSharePost(userID, idShare);
    await share.SaveLike(like);

    try {
      const result = await share.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post liked successfully',
        content: result,
      };
    } catch (error) {
      return handleError(error, STATUS_CODE.SERVER_ERROR);
    }
  }
};

const commentPostShare_Service = async (userID, idShare, contentComment) => {
  //Find share
  let share = await Share.GetShare(idShare);

  const commentContent = {
    user: userID,
    content: contentComment,
    postShare: idShare,
  };

  try {
    //Add comment
    const comment = await Comment.SaveComment(commentContent);
    await share.SaveComment(comment);

    const result = await share.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post commented successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const replyCommentPostShare_Service = async (userID, idShare, contentComment, idComment) => {
  //Find share
  let share = await Share.GetShare(idShare);
  share = await share.populate('comments');

  const commentContent = {
    user: userID,
    content: contentComment,
    postShare: idShare,
    isReply: true,
  };

  try {
    //Add comment
    const comment = await Comment.SaveComment(commentContent);
    await share.SaveComment(comment);

    // Add reply to comment
    const commentReply = await Comment.GetComment(idComment);
    await commentReply.ReplyComment(comment);

    const result = await share.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post commented successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleViewPost_Service = async (id, userID, res, req) => {
  //Find post
  const post = await Post.GetPost(id);

  if (!post) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Post not found',
      content: null,
    };
  }

  let viewedPosts = req?.cookies?.viewedPosts || [];
  if (viewedPosts.includes(post._id.toString())) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post viewed successfully',
      content: post,
    };
  }

  //Add view
  await post.IncreaseView();

  //Add post to viewedPosts
  viewedPosts.push(post._id);
  res.cookie('viewedPosts', [...viewedPosts, post._id], {
    maxAge: 30 * 24 * 60 * 60,
  });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Post viewed successfully',
    content: post,
  };
};

const handleViewPostShare_Service = async (id, userID, res, req) => {
  //Find post share
  const post = await Share.GetShare(id);

  if (!post) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Post not found',
      content: null,
    };
  }

  let viewedPosts = req?.cookies?.viewedPosts || [];
  if (viewedPosts.includes(post._id.toString())) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post viewed successfully',
      content: post,
    };
  }

  //Add view
  await post.IncreaseView();

  //Add post to viewedPosts
  viewedPosts.push(post._id);
  res.cookie('viewedPosts', [...viewedPosts, post._id], {
    maxAge: 30 * 24 * 60 * 60,
  });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Post viewed successfully',
    content: post,
  };
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
  replyComment_Service,
  deleteComment_Service,
  handleLikePostShare_Service,
  commentPostShare_Service,
  replyCommentPostShare_Service,
  getPostShare_Service,
  handleViewPost_Service,
  handleViewPostShare_Service,
};

const STATUS_CODE = require('../util/SettingSystem');
const { Post } = require('../models/Post');
const { User } = require('../models/User');
const { Like } = require('../models/Like');
const { Share } = require('../models/Share');
const { Comment } = require('../models/Comment');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const handleError = (error, statusCode) => {
  return {
    status: statusCode,
    success: false,
    message: error.message || 'Server Error',
  };
};

const upPost_Service = async (post, id) => {
  const { title, content, linkImage } = post;
  const user = await User.GetUser(id);

  const newPost = {
    title,
    content,
    user: id,
    url: linkImage ? linkImage : null,
  };

  try {
    const result = await Post.SavePost(newPost);

    // thêm post vào user
    await user.SavePost(result);

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

const getPost_Service = async (id, callerID) => {
  try {
    let post = await Post.GetPost(id);

    // Nếu không có ảnh thì thêm link
    let link = null;
    if (!post.image) {
      const dom1 = new JSDOM(post.content);
      // lấy link đầu tiền trong post
      const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

      if (firstLink) {
        await axios.get(firstLink).then((res) => {
          const dom2 = new JSDOM(res.data);

          const title =
            dom2.window.document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            dom2.window.document.querySelector('title')?.textContent;

          const description =
            dom2.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
            dom2.window.document.querySelector('meta[name="description"]')?.getAttribute('content');

          const image = dom2.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');

          link = {
            title,
            description,
            image,
            linkAddress: firstLink,
          };
        });
      }
    }

    const user = await User.GetUser(callerID);
    // thêm biến isLiked vào post
    const checkLiked = (await post.likes.filter((like) => like.user.toString() === callerID).length) > 0;

    // thêm biến isShared vào post
    const checkShared = (await post.shares.filter((share) => share.user.toString() === callerID).length) > 0;

    // thêm biến isSaved vào post
    const userSave = await user.populate('favorites');
    const checkSaved =
      userSave.favorites.filter((postSaved) => postSaved._id.toString() === post._id.toString()).length > 0;

    post = post.toObject();
    const userPost = post.user;
    post.user = {
      id: userPost._id,
      username: userPost.username,
      userImage: userPost.userImage,
      isFollowing: userPost.followers.some((follower) => follower.toString() === callerID),
      followers: userPost.followers,
      following: userPost.following,
      posts: userPost.posts,
    };
    post.isLiked = checkLiked;
    post.isShared = checkShared;
    post.isSaved = checkSaved;
    post.link = link;

    // tìm thông tin user trong like
    const likeArr = await post.likes.map(async (like) => {
      const user = await User.GetUser(like.user);
      like.user = {
        id: user._id,
        username: user.username,
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
        username: user.username,
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
        username: user.username,
        userImage: user.userImage,
      };

      const replyArr = await comment.listReply.map(async (reply) => {
        const commentReply = await Comment.GetCommentByID(reply);
        reply = commentReply.toObject();
        reply.user = {
          id: commentReply.user._id,
          username: commentReply.user.username,
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
      username: user.username,
      userImage: user.userImage,
      tags: user.tags,
      contacts: user.contacts,
      firstname: user.firstname,
      lastname: user.lastname,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      dayJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      location: user.location,
      coverImage: user.coverImage,
      alias: user.alias,
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
    const userCaller = await User.GetUser(callerID);

    // Nếu không có ảnh thì thêm link
    let link = null;
    if (!post.image) {
      const dom1 = new JSDOM(post.content);
      // lấy link đầu tiền trong post
      const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

      if (firstLink) {
        await axios.get(firstLink).then((res) => {
          const dom2 = new JSDOM(res.data);

          const title =
            dom2.window.document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            dom2.window.document.querySelector('title')?.textContent;

          const description =
            dom2.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
            dom2.window.document.querySelector('meta[name="description"]')?.getAttribute('content');

          const image = dom2.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');

          link = {
            title,
            description,
            image,
            linkAddress: firstLink,
          };
        });
      }
    }

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
        username: user.username,
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
        username: user.username,
        userImage: user.userImage,
      };

      const replyArr = await comment.listReply.map(async (reply) => {
        const commentReply = await Comment.GetCommentByID(reply);
        reply = commentReply.toObject();
        reply.user = {
          id: commentReply.user._id,
          username: commentReply.user.username,
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
      username: post.user.username,
      userImage: post.user.userImage,
      isFollowing: post.user.followers.some((follower) => follower.toString() === callerID),
      followers: post.user.followers,
      following: post.user.following,
      posts: post.user.posts,
    };
    share.shares = undefined;
    share.user = {
      id: user._id,
      username: user.username,
      userImage: user.userImage,
      isFollowing: user.followers.some((follower) => follower.toString() === callerID),
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };
    share.link = link;
    share.postCreatedAt = postCreatedAt;
    share.postUpdatedAt = postUpdatedAt;
    share.postID = postID;
    share.createdAt = createdAt;
    share.views = views;
    share.updatedAt = updatedAt;
    share.isLiked = checkLiked;
    share.PostShared = true;
    share.likes = await Promise.all(likeArr);
    share.comments = await Promise.all(commentArr);

    const userInfo = {
      id: userCaller._id,
      username: userCaller.username,
      userImage: userCaller.userImage,
      tags: userCaller.tags,
      contacts: userCaller.contacts,
      firstname: userCaller.firstname,
      lastname: userCaller.lastname,
      followers: userCaller.followers,
      following: userCaller.following,
      posts: userCaller.posts,
      dayJoined: new Date(userCaller.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      location: userCaller.location,
      coverImage: userCaller.coverImage,
      alias: userCaller.alias,
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
    const postArrPromised = await Promise.all(
      postArr.map(async (post) => {
        // Nếu không có ảnh thì thêm link
        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          // lấy link đầu tiền trong post
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            await axios.get(firstLink).then((res) => {
              const dom2 = new JSDOM(res.data);

              const title =
                dom2.window.document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('title')?.textContent;

              const description =
                dom2.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('meta[name="description"]')?.getAttribute('content');

              const image = dom2.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');

              link = {
                title,
                description,
                image,
                linkAddress: firstLink,
              };
            });
          }
        }

        // thêm biến isLiked vào post
        const checkLiked = post.likes.some((like) => like?.user.toString() === callerID);

        // thêm biến isShared vào post
        const checkShared = post.shares.some((share) => share?.user.toString() === callerID);

        // thêm biến isSaved vào post
        const userSave = await user.populate('favorites');
        const checkSaved = userSave.favorites.some((postSaved) => postSaved._id.toString() === post._id.toString());

        post = post.toObject();
        const userInfo = post.user;
        post.user = {
          id: userInfo._id,
          username: userInfo.username,
          userImage: userInfo.userImage,
          followers: userInfo.followers,
          following: userInfo.following,
          posts: userInfo.posts,
          isFollowing: userInfo.followers.some((follower) => follower.toString() === callerID),
        };
        post.isLiked = checkLiked;
        post.isShared = checkShared;
        post.isSaved = checkSaved;
        post.link = link;

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

        // Nếu không có ảnh thì thêm link
        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          // lấy link đầu tiền trong post
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            await axios.get(firstLink).then((res) => {
              const dom2 = new JSDOM(res.data);

              const title =
                dom2.window.document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('title')?.textContent;

              const description =
                dom2.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('meta[name="description"]')?.getAttribute('content');

              const image = dom2.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');

              link = {
                title,
                description,
                image,
                linkAddress: firstLink,
              };
            });
          }
        }

        // thêm biến isLiked vào post
        const postLike = await share.populate('likes');
        const checkLiked = postLike.likes.some(async (like) => like?.user.toString() === callerID);

        const _id = share._id;
        const createdAt = share.createdAt;
        const updatedAt = share.updatedAt;
        const postCreatedAt = post.createdAt;
        const postUpdatedAt = post.updatedAt;
        const postID = post._id;
        const views = share.views;
        const likes = share.likes;
        const comments = share.comments;

        share = post.toObject();
        share._id = _id;
        share.owner = {
          id: post.user._id,
          username: post.user.username,
          userImage: post.user.userImage,
          followers: post.user.followers,
          following: post.user.following,
          posts: post.user.posts,
          isFollowing: post.user.followers.some((follower) => follower.toString() === callerID),
        };
        share.shares = undefined;
        share.user = {
          id: user._id,
          username: user.username,
          userImage: user.userImage,
          followers: user.followers,
          following: user.following,
          posts: user.posts,
          isFollowing: user.followers.some((follower) => follower.toString() === callerID),
        };
        share.postID = postID;
        share.createdAt = createdAt;
        share.updatedAt = updatedAt;
        share.views = views;
        share.link = link;
        share.postCreatedAt = postCreatedAt;
        share.postUpdatedAt = postUpdatedAt;
        share.isLiked = checkLiked;
        share.PostShared = true;
        share.likes = likes;
        share.comments = comments;

        return share;
      }),
    );

    const result = postArrPromised.concat(sharePostArr);

    // Sắp xếp các bài post theo thời gian gần nhất
    result.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    const userInfo = {
      id: user._id,
      username: user.username,
      userImage: user.userImage,
      tags: user.tags,
      contacts: user.contacts,
      firstname: user.firstname,
      lastname: user.lastname,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      dayJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      location: user.location,
      coverImage: user.coverImage,
      alias: user.alias,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        postArr: result,
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

  const { title, content, linkImage } = post;

  const newPost = {
    title,
    content,
    url: linkImage ? linkImage : null,
  };

  try {
    const result = await Post.UpdatePost(id, newPost);
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
    const postArrPromised = await Promise.all(
      postArr.map(async (post) => {
        post.user = undefined;

        // Nếu không có ảnh thì thêm link
        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          // lấy link đầu tiền trong post
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            await axios.get(firstLink).then((res) => {
              const dom2 = new JSDOM(res.data);

              const title =
                dom2.window.document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('title')?.textContent;

              const description =
                dom2.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('meta[name="description"]')?.getAttribute('content');

              const image = dom2.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');

              link = {
                title,
                description,
                image,
                linkAddress: firstLink,
              };
            });
          }
        }

        // thêm biến isLiked vào post
        const checkLiked = (await post.likes.filter((like) => like.user.toString() === callerID).length) > 0;

        // thêm biến isShared vào post
        const checkShared = (await post.shares.filter((share) => share.user.toString() === callerID).length) > 0;

        // thêm biến isSaved vào post
        const userSave = await user.populate('favorites');
        const checkSaved =
          userSave.favorites.filter((postSaved) => postSaved._id.toString() === post._id.toString()).length > 0;

        post = post.toObject();
        post.isLiked = checkLiked;
        post.isShared = checkShared;
        post.isSaved = checkSaved;
        post.link = link;

        return post;
      }),
    );

    // Tìm và tạo post mới cho các bài share bởi owner user và thêm vào postArr
    let shareArr = await owner.GetShares();
    shareArr = shareArr.shares;
    const sharePostArr = await Promise.all(
      shareArr.map(async (share) => {
        const post = await Post.GetPost(share.post);

        // Nếu không có ảnh thì thêm link
        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          // lấy link đầu tiền trong post
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            await axios.get(firstLink).then((res) => {
              const dom2 = new JSDOM(res.data);

              const title =
                dom2.window.document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('title')?.textContent;

              const description =
                dom2.window.document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                dom2.window.document.querySelector('meta[name="description"]')?.getAttribute('content');

              const image = dom2.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content');

              link = {
                title,
                description,
                image,
                linkAddress: firstLink,
              };
            });
          }
        }

        // thêm biến isLiked vào post
        const postLike = await share.populate('likes');
        const checkLiked = (await postLike.likes.filter((like) => like.user.toString() === callerID).length) > 0;

        const _id = share._id;
        const createdAt = share.createdAt;
        const updatedAt = share.updatedAt;
        const postCreatedAt = post.createdAt;
        const postUpdatedAt = post.updatedAt;
        const postID = post._id;
        const owner = await User.GetUser(post.user);
        const views = share.views;
        const likes = share.likes;
        const comments = share.comments;

        share = post.toObject();
        share._id = _id;
        share.postID = postID;
        share.user = undefined;
        share.owner = {
          id: owner._id,
          username: owner.username,
          userImage: owner.userImage,
          followers: owner.followers,
          following: owner.following,
          posts: owner.posts,
          isFollowing: owner.followers.some((follower) => follower.toString() === callerID),
        };
        share.shares = undefined;
        share.link = link;
        share.createdAt = createdAt;
        share.updatedAt = updatedAt;
        share.postCreatedAt = postCreatedAt;
        share.postUpdatedAt = postUpdatedAt;
        share.views = views;
        share.isLiked = checkLiked;
        share.PostShared = true;
        share.likes = likes;
        share.comments = comments;

        return share;
      }),
    );

    const result = postArrPromised.concat(sharePostArr);

    // Sắp xếp các bài post theo thời gian gần nhất
    result.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    const ownerInfo = {
      id: owner._id,
      username: owner.username,
      userImage: owner.userImage,
      tags: owner.tags,
      contacts: owner.contacts,
      firstname: owner.firstname,
      lastname: owner.lastname,
      followers: owner.followers,
      following: owner.following,
      posts: owner.posts,
      dayJoined: new Date(owner.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      isFollowing: user.following.filter((follow) => follow.toString() === owner._id.toString()).length > 0,
      location: owner.location,
      coverImage: owner.coverImage,
      alias: owner.alias,
    };

    const userInfo = {
      id: user._id,
      username: user.username,
      userImage: user.userImage,
      tags: user.tags,
      contacts: user.contacts,
      firstname: user.firstname,
      lastname: user.lastname,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      dayJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      location: user.location,
      coverImage: user.coverImage,
      alias: user.alias,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        ownerInfo,
        postArr: result,
      },
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const deletePost_Service = async (id, userID) => {
  //Find post
  const post = await Post.GetPost(id);
  const user = await User.GetUser(userID);

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

    // Remove post in user
    await user.RemovePost(post);

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

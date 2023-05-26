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
    let [post, user] = await Promise.all([Post.GetPost(id), User.GetUser(callerID)]);

    let link = null;
    if (!post.image) {
      const dom1 = new JSDOM(post.content);
      const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

      if (firstLink) {
        const res = await axios.get(firstLink);
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
      }
    }

    const checkLiked = post.likes.some((like) => like?.user?.toString() === callerID);
    const checkShared = post.shares.some((share) => share?.user?.toString() === callerID);

    const userSave = await user.populate('favorites');
    const checkSaved = userSave.favorites.some((postSaved) => postSaved._id.toString() === post._id.toString());

    post = post.toObject();

    post.user = {
      id: post.user._id,
      username: post.user.username,
      userImage: post.user.userImage,
      isFollowing: post.user.followers.some((follower) => follower.toString() === callerID),
      followers: post.user.followers,
      following: post.user.following,
      posts: post.user.posts,
    };

    post = {
      ...post,
      isLiked: checkLiked,
      isShared: checkShared,
      isSaved: checkSaved,
      link: link,
    };

    const likeArr = await Promise.all(
      post.likes.map(async (like) => {
        const user = await User.GetUser(like.user);
        like.user = {
          id: user._id,
          username: user.username,
          userImage: user.userImage,
        };
        return like;
      }),
    );

    post.likes = likeArr;

    const shareArr = await Promise.all(
      post.shares.map(async (share) => {
        const user = await User.GetUser(share.user);
        share.user = {
          id: user._id,
          username: user.username,
          userImage: user.userImage,
        };
        return {
          user: share.user,
          _id: share._id,
        };
      }),
    );

    post.shares = shareArr;

    const commentArr = await Promise.all(
      post.comments.map(async (comment) => {
        if (comment.isReply) {
          return;
        }

        const user = await User.GetUser(comment.user);
        comment.user = {
          id: user._id,
          username: user.username,
          userImage: user.userImage,
        };

        // check liked
        const checkLiked = comment.likes.some((like) => like?.user?.toString() === callerID);
        // check disliked
        const checkDisliked = comment.dislikes.some((dislike) => dislike?.user?.toString() === callerID);
        comment = {
          ...comment,
          isLiked: checkLiked,
          isDisliked: checkDisliked,
        };

        const replyArr = await Promise.all(
          comment.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            // check liked
            const checkLiked = commentReply.likes.some((like) => like?.user?.toString() === callerID);
            // check disliked
            const checkDisliked = commentReply.dislikes.some((dislike) => dislike?.user?.toString() === callerID);
            return {
              ...commentReply.toObject(),
              isLiked: checkLiked,
              isDisliked: checkDisliked,
              user: {
                id: commentReply.user._id,
                username: commentReply.user.username,
                userImage: commentReply.user.userImage,
              },
            };
          }),
        );

        comment.listReply = replyArr.filter(Boolean);
        return comment;
      }),
    );

    // Sort comment by like amd dislike, the most liked will be on top, the most disliked will be on bottom
    commentArr.sort((a, b) => {
      if (!a || !b) return 0;
      const aTotal = a.likes.length - a.dislikes.length;
      const bTotal = b.likes.length - b.dislikes.length;

      return bTotal - aTotal;
    });

    post.comments = commentArr;

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
      about: user.about,
      experiences: user.experiences,
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
    const share = await Share.GetShare(id);
    const [post, user, userCaller] = await Promise.all([
      Post.GetPost(share.post),
      User.GetUser(share.user.id),
      User.GetUser(callerID),
    ]);

    let link = null;
    if (!post.image) {
      const dom1 = new JSDOM(post.content);
      const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

      if (firstLink) {
        const res = await axios.get(firstLink);
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
      }
    }

    const postLike = await share.populate('likes');
    const checkLiked = postLike.likes.some((like) => like?.user.toString() === callerID);

    const likeArr = await Promise.all(
      postLike.likes.map(async (like) => {
        const user = await User.GetUser(like.user);
        return {
          ...like.toObject(),
          user: {
            id: user._id,
            username: user.username,
            userImage: user.userImage,
          },
        };
      }),
    );

    const postComment = await share.populate('comments');
    const commentArr = await Promise.all(
      postComment.comments.map(async (comment) => {
        const commentPopulate = await Comment.GetCommentByID(comment);
        if (commentPopulate.isReply) {
          return null;
        }

        // check liked
        const checkLiked = commentPopulate.likes.some((like) => like?.user?.toString() === callerID);

        // check disliked
        const checkDisliked = commentPopulate.dislikes.some((dislike) => dislike?.user?.toString() === callerID);

        const user = await User.GetUser(commentPopulate.user);
        const replyArr = await Promise.all(
          commentPopulate.listReply.map(async (reply) => {
            const commentReply = await Comment.GetCommentByID(reply);
            const replyUser = await User.GetUser(commentReply.user);
            // check liked
            const checkLiked = commentReply.likes.some((like) => like?.user?.toString() === callerID);
            // check disliked
            const checkDisliked = commentReply.dislikes.some((dislike) => dislike?.user?.toString() === callerID);
            return {
              ...commentReply.toObject(),
              isLiked: checkLiked,
              isDisliked: checkDisliked,
              user: {
                id: replyUser._id,
                username: replyUser.username,
                userImage: replyUser.userImage,
              },
            };
          }),
        );

        return {
          ...commentPopulate.toObject(),
          isLiked: checkLiked,
          isDisliked: checkDisliked,
          user: {
            id: user._id,
            username: user.username,
            userImage: user.userImage,
          },
          listReply: replyArr.filter(Boolean),
        };
      }),
    );

    // Sort comment by like amd dislike, the most liked will be on top, the most disliked will be on bottom
    commentArr.sort((a, b) => {
      if (!a || !b) return 0;
      const aTotal = a.likes.length - a.dislikes.length;
      const bTotal = b.likes.length - b.dislikes.length;

      return bTotal - aTotal;
    });

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
      about: userCaller.about,
      experiences: userCaller.experiences,
    };

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post found',
      content: {
        userInfo,
        post: {
          ...post.toObject(),
          _id: share._id,
          owner: {
            id: post.user._id,
            username: post.user.username,
            userImage: post.user.userImage,
            isFollowing: post.user.followers.some((follower) => follower.toString() === callerID),
            followers: post.user.followers,
            following: post.user.following,
            posts: post.user.posts,
          },
          shares: undefined,
          user: {
            id: user._id,
            username: user.username,
            userImage: user.userImage,
            isFollowing: user.followers.some((follower) => follower.toString() === callerID),
            followers: user.followers,
            following: user.following,
            posts: user.posts,
          },
          link,
          postCreatedAt: post.createdAt,
          postUpdatedAt: post.updatedAt,
          postID: post._id,
          createdAt: share.createdAt,
          views: share.views,
          updatedAt: share.updatedAt,
          isLiked: checkLiked,
          PostShared: true,
          likes: likeArr,
          comments: commentArr,
        },
      },
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const loadAllPost_Service = async (callerID) => {
  try {
    const [postArr, user] = await Promise.all([Post.GetPosts(), User.GetUser(callerID)]);
    const [shareArr, userSave] = await Promise.all([Share.GetShares(), user.populate('favorites')]);

    const postArrPromised = await Promise.all(
      postArr.map(async (post) => {
        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            const res = await axios.get(firstLink);
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
          }
        }

        const checkLiked = post.likes.some((like) => like?.user.toString() === callerID);
        const checkShared = post.shares.some((share) => share?.user.toString() === callerID);
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

    let sharePostArr = shareArr.flat();
    sharePostArr = await Promise.all(
      sharePostArr.map(async (share) => {
        const [post, user] = await Promise.all([Post.GetPost(share.post), User.GetUser(share.user._id)]);

        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            const res = await axios.get(firstLink);
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
          }
        }

        const postLike = await share.populate('likes');
        const checkLiked = postLike.likes.some((like) => like?.user.toString() === callerID);

        const { _id, createdAt, updatedAt, views, likes, comments } = share;

        const postCreatedAt = post.createdAt;
        const postUpdatedAt = post.updatedAt;

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
        share.postID = post._id;
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

    result.sort((a, b) => b.createdAt - a.createdAt);

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
      about: user.about,
      experiences: user.experiences,
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
    const [postArr, user, owner] = await Promise.all([
      Post.GetPostByUser(ownerID),
      User.GetUser(callerID),
      User.GetUser(ownerID),
    ]);

    const [ownerShareArr, userSave] = await Promise.all([owner.GetShares(), user.populate('favorites')]);

    const postArrPromised = await Promise.all(
      postArr.map(async (post) => {
        post.user = undefined;

        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            const res = await axios.get(firstLink);
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
          }
        }

        const checkLiked = post.likes.some((like) => like?.user?.toString() === callerID);
        const checkShared = post.shares.some((share) => share?.user?.toString() === callerID);
        const checkSaved = userSave.favorites.some((postSaved) => postSaved._id.toString() === post._id.toString());

        post = post.toObject();
        post.isLiked = checkLiked;
        post.isShared = checkShared;
        post.isSaved = checkSaved;
        post.link = link;

        return post;
      }),
    );

    let shareArr = ownerShareArr.shares;
    const sharePostArr = await Promise.all(
      shareArr.map(async (share) => {
        const post = await Post.GetPost(share.post);

        let link = null;
        if (!post.image) {
          const dom1 = new JSDOM(post.content);
          const firstLink = dom1.window.document.querySelector('a')?.getAttribute('href');

          if (firstLink) {
            const res = await axios.get(firstLink);
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
          }
        }

        const postLike = await share.populate('likes');
        const checkLiked = postLike.likes.some((like) => like?.user?.toString() === callerID);

        const { _id, createdAt, updatedAt, views, likes, comments } = share;

        const postCreatedAt = post.createdAt;
        const postUpdatedAt = post.updatedAt;

        share = post.toObject();
        share._id = _id;
        share.postID = post._id;
        share.user = undefined;
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
    result.sort((a, b) => b.createdAt - a.createdAt);

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
      isFollowing: user.following.some((follow) => follow.toString() === owner._id.toString()),
      location: owner.location,
      coverImage: owner.coverImage,
      alias: owner.alias,
      about: owner.about,
      experiences: owner.experiences,
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
      about: user.about,
      experiences: user.experiences,
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
  try {
    // Find post and user
    const post = await Post.GetPost(id);
    const user = await User.GetUser(userID);

    // Check if the user is the owner of the post
    if (post.user._id.toString() !== userID) {
      return {
        status: STATUS_CODE.BAD_REQUEST,
        success: false,
        message: 'User is not the owner of this post',
      };
    }

    // Delete every like of this post
    await Promise.all(post.likes.map((like) => Like.DeleteLike(like)));

    // Delete every comment of this post
    await Promise.all(post.comments.map((comment) => Comment.DeleteComment(comment)));

    // Delete every share of this post
    await Promise.all(post.shares.map((share) => Share.DeleteShare(share)));

    // Remove every favorite of this post in every user
    const users = await User.GetAllUsers();
    await Promise.all(
      users.map(async (user) => {
        const favorites = user.favorites.filter((favorite) => favorite.toString() === id);
        await user.RemoveFavorites(favorites);
      }),
    );

    // Remove post from user
    await user.RemovePost(post);

    // Delete post
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
  try {
    // Find post
    let post = await Post.GetPost(id);
    post = await post.populate('likes');

    // Check if the user has already liked the post
    const userLiked = post.likes.some((like) => like?.user?.toString() === userID);

    if (userLiked) {
      // Unlike post
      const like = await Like.GetLikeByPostAndUser(id, userID);
      await post.RemoveLike(like);
      await Like.DeleteLike(like._id);

      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unliked successfully',
        content: result,
      };
    } else {
      // Like post
      const like = await Like.SaveLike(userID, id);
      await post.SaveLike(like);

      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post liked successfully',
        content: result,
      };
    }
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleSharePost_Service = async (id, userID) => {
  try {
    // Find post
    let post = await Post.GetPost(id);
    post = await post.populate('shares');
    const user = await User.GetUser(userID);

    // Check if the user has already shared the post
    const userShared = post.shares.some((share) => share?.user?.toString() === userID);

    if (userShared) {
      // Unshare post
      const shareObject = await Share.GetShareByPostAndUser(id, userID);
      const shareLike = await shareObject.populate('likes');
      shareLike.likes.forEach(async (like) => {
        await Like.DeleteLike(like._id);
      });

      const shareComment = await shareObject.populate('comments');
      shareComment.comments.forEach(async (comment) => {
        await Comment.DeleteComment(comment._id);
      });

      await post.RemoveShare(shareObject);
      await user.RemoveShare(shareObject);
      await Share.DeleteShare(shareObject._id);

      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unshared successfully',
        content: result,
      };
    } else {
      // Share post
      const share = await Share.SaveShare(userID, id);
      await post.SaveShare(share);
      await user.SaveShare(share);

      const result = await post.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post shared successfully',
        content: result,
      };
    }
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleFavoritePost_Service = async (id, userID) => {
  try {
    // Find post
    let post = await Post.GetPost(id);
    let user = await User.GetUser(userID);
    user = await user.populate('favorites');

    // Check if the post is already in user's favorites
    const postInFavorites = user.favorites.some((favorite) => favorite._id?.toString() === id);

    if (postInFavorites) {
      // Remove favorite
      await user.RemoveFavorite(post);

      const result = await user.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unfavorited successfully',
        content: result,
      };
    } else {
      // Add favorite
      await user.SaveFavorite(post);

      const result = await user.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post favorited successfully',
        content: result,
      };
    }
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const commentPost_Service = async (id, userID, contentComment) => {
  try {
    // Find post
    let post = await Post.GetPost(id);

    const commentContent = {
      user: userID,
      content: contentComment,
      post: id,
    };

    // Add comment
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
  try {
    // Find post
    let post = await Post.GetPost(id);

    const commentContent = {
      user: userID,
      content: contentComment,
      post: id,
      isReply: true,
    };

    // Add comment
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
  try {
    // Find post
    let post = await Post.GetPost(id);

    // Find comment on post
    const commentFind = post.comments.find((comment) => comment._id.toString() === idComment);

    if (!commentFind) {
      return {
        status: STATUS_CODE.BAD_REQUEST,
        success: false,
        message: 'Comment not found',
      };
    }

    // Find any comment if it has this comment on the list of replies
    const commentsReply = await Comment.GetCommentHasReply(idComment);

    // Remove comment from the list of replies in other comments
    for (const comment of commentsReply) {
      await comment.RemoveReplyComment(idComment);
      await comment.save();
    }

    // Remove comments that exist in the list of replies of the comment being deleted
    for (const replyId of commentFind.listReply) {
      const replyComment = await Comment.GetComment(replyId);
      await Comment.DeleteComment(replyId);
      await post.RemoveComment(replyComment);
    }

    // Remove comment
    await post.RemoveComment(commentFind);
    await Comment.DeleteComment(idComment);

    const result = await post.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Comment deleted successfully',
      content: result,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleLikePostShare_Service = async (userID, idShare) => {
  try {
    // Find share
    let share = await Share.GetShare(idShare);
    share = await share.populate('likes');

    // Check if the user has already liked the share
    const like = await Like.GetLikeBySharePostAndUser(idShare, userID);
    const hasLiked = !!like;

    if (hasLiked) {
      // User has already liked the share, remove the like
      await share.RemoveLike(like);
      await Like.DeleteLike(like._id);

      const result = await share.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post unliked successfully',
        content: result,
      };
    } else {
      // User has not liked the share, add the like
      const newLike = await Like.SaveLikeSharePost(userID, idShare);
      await share.SaveLike(newLike);

      const result = await share.save();
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post liked successfully',
        content: result,
      };
    }
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const commentPostShare_Service = async (userID, idShare, contentComment) => {
  try {
    // Find share
    let share = await Share.GetShare(idShare);

    const commentContent = {
      user: userID,
      content: contentComment,
      postShare: idShare,
    };

    // Add comment
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
  try {
    // Find share
    let share = await Share.GetShare(idShare);
    share = await share.populate('comments');

    const commentContent = {
      user: userID,
      content: contentComment,
      postShare: idShare,
      isReply: true,
    };

    // Add comment
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
  try {
    // Find post
    const post = await Post.GetPost(id);

    if (!post) {
      return {
        status: STATUS_CODE.NOT_FOUND,
        success: false,
        message: 'Post not found',
        content: null,
      };
    }

    // Check if the post has already been viewed
    let viewedPosts = req?.cookies?.viewedPosts || [];
    if (viewedPosts.includes(post._id.toString())) {
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post viewed successfully',
        content: post,
      };
    }

    // Increase view count
    await post.IncreaseView();

    // Add post to viewedPosts
    viewedPosts.push(post._id.toString());
    res.cookie('viewedPosts', viewedPosts, {
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post viewed successfully',
      content: post,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleViewPostShare_Service = async (id, userID, res, req) => {
  try {
    // Find post share
    const post = await Share.GetShare(id);

    if (!post) {
      return {
        status: STATUS_CODE.NOT_FOUND,
        success: false,
        message: 'Post not found',
        content: null,
      };
    }

    // Check if the post has already been viewed
    let viewedPosts = req?.cookies?.viewedPosts || [];
    if (viewedPosts.includes(post._id.toString())) {
      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Post viewed successfully',
        content: post,
      };
    }

    // Increase view count
    await post.IncreaseView();

    // Add post to viewedPosts
    viewedPosts.push(post._id.toString());
    res.cookie('viewedPosts', viewedPosts, {
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Post viewed successfully',
      content: post,
    };
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleLikeCommentPost_Service = async (userID, idComment) => {
  try {
    // Find comment
    const comment = await Comment.GetComment(idComment);

    if (!comment) {
      return {
        status: STATUS_CODE.NOT_FOUND,
        success: false,
        message: 'Comment not found',
        content: null,
      };
    }

    // Check if the user has already liked the comment
    const isLiked = comment.likes.find((like) => like?.user?.toString() === userID);

    if (isLiked) {
      // Unlike like
      await comment.RemoveLikeComment(isLiked._id);
      await Like.DeleteLike(isLiked._id);

      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Comment unliked successfully',
        content: null,
      };
    } else {
      // check if the user has already disliked the comment
      const isDisliked = comment.dislikes.find((dislike) => dislike?.user?.toString() === userID);

      if (isDisliked) {
        // Remove dislike
        await comment.RemoveDislikeComment(isDisliked._id);
        await Like.DeleteLike(isDisliked._id);
      }
      // Like comment
      const newLike = await Like.SaveLikeComment(userID, idComment);

      await comment.LikeComment(newLike);

      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Comment liked successfully',
        content: null,
      };
    }
  } catch (error) {
    return handleError(error, STATUS_CODE.SERVER_ERROR);
  }
};

const handleDislikeCommentPost_Service = async (userID, idComment) => {
  try {
    // Find comment
    const comment = await Comment.GetComment(idComment);

    if (!comment) {
      return {
        status: STATUS_CODE.NOT_FOUND,
        success: false,
        message: 'Comment not found',
        content: null,
      };
    }

    // Check if the user has already disliked the comment
    const isDisliked = comment.dislikes.find((dislike) => dislike?.user?.toString() === userID);

    if (isDisliked) {
      // Remove dislike
      await comment.RemoveDislikeComment(isDisliked._id);
      await Like.DeleteLike(isDisliked._id);

      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Comment undisliked successfully',
        content: null,
      };
    } else {
      // check if the user has already liked the comment
      const isLiked = comment.likes.find((like) => like?.user?.toString() === userID);

      if (isLiked) {
        // Remove like
        await comment.RemoveLikeComment(isLiked._id);
        await Like.DeleteLike(isLiked._id);
      }
      // Dislike comment
      const newDislike = await Like.SaveLikeComment(userID, idComment);

      await comment.DislikeComment(newDislike);

      return {
        status: STATUS_CODE.SUCCESS,
        success: true,
        message: 'Comment disliked successfully',
        content: null,
      };
    }
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
  handleLikeCommentPost_Service,
  handleDislikeCommentPost_Service,
};

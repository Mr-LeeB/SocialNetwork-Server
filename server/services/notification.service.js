const STATUS_CODE = require('../util/SettingSystem');
const { Notification } = require('../models/Notification');
const { User } = require('../models/User');
const { Post } = require('../models/Post');
const { Comment } = require('../models/Comment');

const getNotifications_Service = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (!user) {
      return {
        status: STATUS_CODE.NOT_FOUND,
        success: false,
        message: 'User does not exist!',
      };
    }

    const notifications = await user.GetNotifications();

    const notificationsData = await Promise.all(
      notifications.map(async (notification) => {
        let content = '';
        let post = null;
        let comment = null;
        let like = null;
        let share = null;
        const user = await User.findById(notification.triggerUser);
        let image = user.userImage;

        if (notification.post) {
          post = await Post.findById(notification.post);
          if (post) {
            content = user.username + ' has posted a new post';
          }
        }

        if (notification.comment) {
          comment = await Comment.findById(notification.comment);
          if (comment) {
            content = user.username + ' has commented on your post';
          }
        }

        if (notification.like) {
          like = await Post.findById(notification.like);
          if (like) {
            content = user.username + ' has liked your post';
          }
        }

        if (notification.share) {
          share = await Post.findById(notification.share);
          if (share) {
            content = user.username + ' has shared your post';
          }
        }

        return {
          id: notification._id,
          user: notification.user,
          post: notification.post,
          comment: notification.comment,
          like: notification.like,
          share: notification.share,
          content: content,
          isRead: notification.isRead,
          image: image,
          createdAt: notification.createdAt,
        };
      }),
    );

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
      message: 'Get all notifications successfully',
      content: {
        userInfo,
        notifications: notificationsData,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      status: STATUS_CODE.SERVER_ERROR,
      success: false,
      message: 'Internal server error',
    };
  }
};

const createNotification_Service = async (notification) => {
  try {
    const newNotification = await Notification.SaveNotification(notification);
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Create notification successfully',
      content: {
        notification: newNotification,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      status: STATUS_CODE.SERVER_ERROR,
      success: false,
      message: 'Internal server error',
    };
  }
};

module.exports = { getNotifications_Service, createNotification_Service };

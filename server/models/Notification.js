const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    triggerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    like: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like',
      default: null,
    },
    share: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Share',
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

NotificationSchema.statics = {
  SaveNotification: async function (notification) {
    const newNotification = new this(notification);
    return newNotification.save();
  },
};

module.exports = {
  Notification: mongoose.model('Notification', NotificationSchema),
};

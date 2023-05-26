const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    sharepost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Share',
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  { timestamps: true },
);

LikeSchema.statics = {
  GetLike: async function (id) {
    return this.findById(id);
  },
  SaveLike: async function (userID, postID) {
    const newLike = new this({
      user: userID,
      post: postID,
    });
    return newLike.save();
  },
  SaveLikeSharePost: async function (userID, sharepostID) {
    const newLike = new this({
      user: userID,
      sharepost: sharepostID,
    });
    return newLike.save();
  },
  SaveLikeComment: async function (userID, commentID) {
    const newLike = new this({
      user: userID,
      comment: commentID,
    });
    return newLike.save();
  },
  DeleteLike: async function (id) {
    return this.findByIdAndDelete(id);
  },
  GetLikeByPost: async function (postID) {
    return this.find({ post: postID }).populate('user');
  },
  GetLikeByUser: async function (userID) {
    return this.find({ user: userID }).populate('post');
  },
  GetLikeByPostAndUser: async function (postID, userID) {
    return this.find({ user: userID, post: postID });
  },
  GetLikeBySharePostAndUser: async function (sharepostID, userID) {
    return this.find({ user: userID, sharepost: sharepostID });
  },
  GetLikeByCommentAndUser: async function (commentID, userID) {
    return this.find({ user: userID, comment: commentID });
  },
};

module.exports = {
  Like: mongoose.model('Like', LikeSchema),
};

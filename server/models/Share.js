const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
      default: [],
    },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

ShareSchema.methods = {
  SaveLike: async function (like) {
    this.likes.push(like);
    return this.save();
  },
  RemoveLike: async function (likeID) {
    this.likes.pull(likeID);
    return this.save();
  },
  SaveComment: async function (comment) {
    this.comments.push(comment);
    return this.save();
  },
  RemoveComment: async function (commentID) {
    this.comments.pull(commentID);
    return this.save();
  },
  IncreaseView: async function () {
    this.views++;
    return this.save();
  },
};

ShareSchema.statics = {
  GetShare: async function (id) {
    return this.findById(id).populate('user');
  },
  GetShares: async function () {
    return this.find().populate('user');
  },
  SaveShare: async function (userID, postID) {
    const newShare = new this({
      user: userID,
      post: postID,
    });
    return newShare.save();
  },
  DeleteShare: async function (id) {
    return this.findByIdAndDelete(id);
  },
  GetShareByPost: async function (postID) {
    return this.find({ post: postID }).populate('user');
  },
  GetShareByUser: async function (userID) {
    return this.find({ user: userID }).populate('post');
  },
  GetShareByPostAndUser: async function (postID, userID) {
    return this.findOne({ user: userID, post: postID });
  },
};

module.exports = {
  Share: mongoose.model('Share', ShareSchema),
};

const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    postShare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Share',
    },
    content: {
      type: String,
      required: true,
    },
    listReply: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
      default: [],
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
      default: [],
    },
    dislikes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
      default: [],
    },
  },
  { timestamps: true },
);

CommentSchema.statics = {
  SaveComment: async function (comment) {
    const newComment = new this(comment);
    return newComment.save();
  },
  GetComment: async function (commentID) {
    return this.findById(commentID);
  },
  GetComments: async function () {
    return this.find();
  },
  GetCommentWithInfo: async function (commentID) {
    return this.findById(commentID)
      .populate({
        path: 'user',
        select: '_id firstname lastname username email userImage',
      })
      .populate('likes')
      .populate('dislikes');
  },
  GetCommentByPost: async function (postID) {
    return this.find({ post: postID })
      .populate({
        path: 'user',
        select: '_id firstname lastname username email userImage',
      })
      .populate('likes')
      .populate('dislikes');
  },
  GetCommentByUser: async function (userID) {
    return this.find({ user: userID }).populate('post').populate('likes').populate('dislikes');
  },
  GetCommentByPostAndUser: async function (postID, userID) {
    return this.findOne({ user: userID, post: postID }).populate('likes').populate('dislikes');
  },
  DeleteComment: async function (commentID) {
    return this.findByIdAndDelete(commentID);
  },
  GetCommentHasReply: async function (commentID) {
    return this.findOne({ listReply: commentID }).populate('likes').populate('dislikes');
  },
};

CommentSchema.methods = {
  ReplyComment: async function (comment) {
    this.listReply.push(comment);
    return this.save();
  },
  RemoveReplyComment: async function (commentID) {
    this.listReply.pull(commentID);
    return this.save();
  },
  LikeComment: async function (likeID) {
    this.likes.push(likeID);
    return this.save();
  },
  DislikeComment: async function (likeID) {
    this.dislikes.push(likeID);
    return this.save();
  },
  RemoveLikeComment: async function (likeID) {
    this.likes.pull(likeID);
    return this.save();
  },
  RemoveDislikeComment: async function (likeID) {
    this.dislikes.pull(likeID);
    return this.save();
  },
};

module.exports = {
  Comment: mongoose.model('Comment', CommentSchema),
};

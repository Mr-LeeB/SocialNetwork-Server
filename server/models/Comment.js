const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    listReply: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    isReply: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

CommentSchema.statics = {
  SaveComment: async function (comment) {
    const newComment = new this(comment);
    return newComment.save();
  },
  GetCommentByID: async function (commentID) {
    return this.findById(commentID).populate("user");
  },
  GetCommentByPost: async function (postID) {
    return this.find({ post: postID }).populate("user");
  },
  GetCommentByUser: async function (userID) {
    return this.find({ user: userID }).populate("post");
  },
  GetCommentByPostAndUser: async function (postID, userID) {
    return this.findOne({ user: userID, post: postID });
  },
};

module.exports = {
  Comment: mongoose.model("Comment", CommentSchema),
};

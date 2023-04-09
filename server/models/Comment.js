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
  },
  { timestamps: true }
);

CommentSchema.statics = {
  SaveComment: async function (comment) {
    const newComment = new this(comment);
    return newComment.save();
  },
};

module.exports = {
  Comment: mongoose.model("Comment", CommentSchema),
};

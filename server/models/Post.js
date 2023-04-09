const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    status: {
      type: String,
      enum: ["TO LEARN", "LEARNING", "LEARNED"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
      default: [],
    },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
  },
  { timestamps: true }
);

PostSchema.statics = {
  SavePost: async function (post) {
    const newPost = new this(post);
    return newPost.save();
  },
  // Get post by id
  GetPost: async function (id) {
    return this.findById(id);
  },
  // Get post by user id and sort by createdAt, the latest post will be on top
  GetPostByUser: async function (id) {
    return this.find({ user: id }).sort({ createdAt: -1 });
  },
  // Get all posts and sort by createdAt, the latest post will be on top
  GetPosts: async function () {
    return this.find().sort({ createdAt: -1 });
  },
  UpdatePost: async function (id, post) {
    return this.updateOne({ _id: id }, { $set: post });
  },
  DeletePost: async function (id) {
    return this.deleteOne({ _id: id });
  },
};

module.exports = {
  Post: mongoose.model("Post", PostSchema),
};

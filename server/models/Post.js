const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
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
      type: Array,
      default: [],
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

const updatePost = async (id, data) => {
  return await Post.updateOne({ _id: id }, data);
};

const get3LastestPost = async () => {
  return await Post.find().sort({ createdAt: -1 }).limit(3);
};

module.exports = {
  Post,
  updatePost,
  get3LastestPost,
};

const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
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
  DeleteLike: async function (id) {
    return this.findByIdAndDelete(id);
  },
  GetLikeByPost: async function (postID) {
    return this.find({ post: postID }).populate("user");
  },
  GetLikeByUser: async function (userID) {
    return this.find({ user: userID }).populate("post");
  },
  GetLikeByPostAndUser: async function (postID, userID) {
    return this.findOne({ user: userID, post: postID });
  },
};

module.exports = {
  Like: mongoose.model("Like", LikeSchema),
};

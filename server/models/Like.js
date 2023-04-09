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
    },
    type: {
      type: String,
      enum: ["like", "heart", "smile", "sad", "angry"],
      required: true,
    },
  },
  { timestamps: true }
);

LikeSchema.statics = {
  SaveLike: async function (like) {
    const newLike = new this(like);
    return newLike.save();
  },
};

module.exports = {
  Like: mongoose.model("Like", LikeSchema),
};

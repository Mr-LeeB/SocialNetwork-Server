const mongoose = require("mongoose");

const ShareSchema = new mongoose.Schema(
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

ShareSchema.methods = {
    SaveShare: async function (share) {
      this.shares.push(share);
      return this.save();
    },
    DeleteShare: async function (shareID) {
      this.shares.pull(shareID);
      return this.save();
    },
  };

ShareSchema.statics = {
  GetShare: async function (id) {
    return this.findById(id);
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
    return this.find({ post: postID }).populate("user");
  },
  GetShareByUser: async function (userID) {
    return this.find({ user: userID }).populate("post");
  },
  GetShareByPostAndUser: async function (postID, userID) {
    return this.findOne({ user: userID, post: postID });
  },
};

module.exports = {
    Share: mongoose.model("Share", ShareSchema),
};

const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
      default: [],
    },
    tags: {
      type: [{ type: String }],
      default: [],
    },
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    admins: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    rules: {
      type: [{ title: String, content: String }],
    },
  },
  { timestamps: true },
);

CommunitySchema.methods = {};

CommunitySchema.statics = {
  findCommunityByID: async function (id) {
    return this.findById(id);
  },
  saveCommunity: async function (community) {
    const newCommunity = new this(community);
    return newCommunity.save();
  },
};

module.exports = {
  Community: mongoose.model('Community', CommunitySchema),
};

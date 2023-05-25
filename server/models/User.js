const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      maxlength: 16,
    },
    lastname: {
      type: String,
      required: true,
      maxlength: 16,
    },
    username: {
      type: String,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
    },
    password: {
      type: String,
      select: false,
    },
    userRole: {
      type: Number,
      required: true,
      default: 1,
    },
    phoneNumber: {
      type: Number,
    },
    userImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    verified: {
      type: String,
      default: false,
    },
    tags: {
      type: [{ type: String }],
      default: null,
    },
    alias: {
      type: String,
      default: null,
    },
    contacts: {
      type: [{}],
      default: null,
    },
    accessToken: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
      default: [],
    },
    shares: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Share' }],
      default: [],
    },
    favorites: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
      default: [],
    },
    communities: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
      default: [],
    },
    notifications: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
      default: [],
    },
  },
  { timestamps: true },
);

UserSchema.methods = {
  CheckPassword: async function (password) {
    return await argon2.verify(this.password, password);
  },
  SetToken: async function () {
    const accessToken = await promisify(jwt.sign)({ id: this._id }, process.env.ACCESS_TOKEN_SECRET);
    this.accessToken = accessToken;
    await this.save();
    return accessToken;
  },
  SaveShare: async function (share) {
    this.shares.push(share);
    return this.save();
  },
  RemoveShare: async function (shareID) {
    this.shares.pull(shareID);
    return this.save();
  },
  SaveFavorite: async function (post) {
    this.favorites.push(post);
    return this.save();
  },
  RemoveFavorite: async function (postID) {
    this.favorites.pull(postID);
    return this.save();
  },
  GetShares: async function () {
    return this.populate('shares');
  },
  HandleTags: async function (tags) {
    this.tags = tags;
    return this.save();
  },
  GetFollowers: async function () {
    return this.populate('followers');
  },
  SavePost: async function (post) {
    this.posts.push(post);
    return this.save();
  },
  RemovePost: async function (postID) {
    this.posts.pull(postID);
    return this.save();
  },
  SaveFollowing: async function (user) {
    this.following.push(user);
    return this.save();
  },
  RemoveFollowing: async function (userID) {
    this.following.pull(userID);
    return this.save();
  },
  SaveFollower: async function (user) {
    this.followers.push(user);
    return this.save();
  },
  RemoveFollower: async function (userID) {
    this.followers.pull(userID);
    return this.save();
  },
  GetPosts: async function () {
    return this.populate('posts');
  },
  SaveNotification: async function (notification) {
    this.notifications.push(notification);
    return this.save();
  },
  GetNotifications: async function () {
    return this.populate('notifications');
  },
};

UserSchema.statics = {
  CheckEmail: async function (email) {
    const user = await this.findOne({ email: email });
    return user === null ? false : user;
  },
  UpdateUser: async function (id, data) {
    return this.findOneAndUpdate({ _id: id }, { $set: data });
  },
  GetUser: async function (id) {
    return this.findById(id);
  },
  GetAllUsers: async function () {
    return this.find();
  },
  GetFollowers: async function (id) {
    return this.findById(id).populate('followers').populate('following');
  },
};

UserSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = crypto.randomBytes(32);
  const hash = await argon2.hash(user.password, salt);
  user.password = hash;
  next();
});

UserSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    // Generate a new access token
    const accessToken = await promisify(jwt.sign)({ id: this._id }, process.env.ACCESS_TOKEN_SECRET);

    // Save the access token to the user document
    this.accessToken = accessToken;
  }

  next();
});

UserSchema.pre('updateOne', async function (next) {
  if (this.getUpdate().$set.password) {
    try {
      const salt = crypto.randomBytes(32);
      const hashedPassword = await argon2.hash(this.getUpdate().$set.password, salt);
      this.getUpdate().$set.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
};

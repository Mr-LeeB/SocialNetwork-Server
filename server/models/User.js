const mongoose = require("mongoose");
const argon2 = require("argon2");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

// const UserSchema = new mongoose.Schema({
//     userName: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     passWord: {
//         type: String,
//         required: true
//     },
//     createAt: {
//         type: Date,
//         required: true
//     }
// });

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      maxlength: 32,
    },
    lastname: {
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
      default: "user.png",
    },
    verified: {
      type: String,
      default: false,
    },
    accessToken: {
      type: String,
      default: null,
    },
    like: {
      type: Array,
      default: [],
    },
    comment: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.methods = {
  checkPassword: async function (password) {
    return await argon2.verify(this.password, password);
  },
  setToken: async function () {
    const accessToken = await promisify(jwt.sign)(
      { id: this._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    this.accessToken = accessToken;
    await this.save();
    return accessToken;
  },
};

UserSchema.statics = {
  checkEmail: async function (email) {
    const user = await this.findOne({ email: email });
    return user === null ? false : user;
  },
  updateUser: async function (id, data) {
    return this.updateOne({ _id: id }, { $set: data });
  },
};

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = crypto.randomBytes(32);
  const hash = await argon2.hash(user.password, salt);
  user.password = hash;
  next();
});

UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    // Generate a new access token
    const accessToken = await promisify(jwt.sign)(
      { id: this._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    // Save the access token to the user document
    this.accessToken = accessToken;
  }

  next();
});

UserSchema.pre("updateOne", async function (next) {
  if (this.getUpdate().$set.password) {
    try {
      const salt = crypto.randomBytes(32);
      const hashedPassword = await argon2.hash(
        this.getUpdate().$set.password,
        salt
      );
      this.getUpdate().$set.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};

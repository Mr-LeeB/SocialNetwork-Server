const mongoose = require("mongoose");

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
    name: {
      type: String,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    password: {
      type: String,
      required: true,
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

const User = mongoose.model("User", UserSchema);

// Find user by email
const getUserByEmail = async (email) => {
  return await User.findOne({ email: email });
};

// Find user by id
const getUserById = async (id) => {
  return await User.findById({ _id: id });
};

// Update user
const updateUser = async (email, data) => {
  return await User.updateOne({ email: email }, data);
};

module.exports = {
  User,
  getUserByEmail,
  updateUser,
  getUserById,
};

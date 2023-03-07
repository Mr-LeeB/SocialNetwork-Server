const mongoose = require('mongoose');

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
      secretKey: {
        type: String,
        default: null,
      },
      history: {
        type: Array,
        default: [],
      },
    },
    { timestamps: true }
  );

const User = mongoose.model('User', UserSchema);

// Additional function
const getUser = async (email) => {
    return await User.findOne({ email: email })
};

module.exports = {
    User,
    getUser
}


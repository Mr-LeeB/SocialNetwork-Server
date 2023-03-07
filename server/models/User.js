const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    passWord: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        required: true
    }
});
const User = mongoose.model('User', UserSchema);

// Additional function
const getUser = async (username) => {
    return await User.findOne({ userName: username })
};

module.exports = {
    User,
    getUser
}


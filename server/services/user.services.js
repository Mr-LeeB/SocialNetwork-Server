const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const userModel = require('../models/User');
const STATUS_CODE  = require('../util/SettingSystem');


const RegisterUser_se = async (user) => {
    const { name, email, password, userRole, userImage } = user;

    // userModel.getUser('ln26805@gmail.com').then((user) => {
    //     console.log(user);
    // });

    // Check for existing user
    const userFind = await User.findOne({ email });
    if (userFind) {
        return {
            status: STATUS_CODE.CONFLICT, 
            success: false,
            message: 'Email already exists!'
        }
    }
    // All good
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        userRole,
        userImage
    });
    await newUser.save();

    // Update secretKey to user
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    await userModel.updateUser(email, { secretKey: accessToken });

    return {
        status: STATUS_CODE.CREATED,
        success: true,
        message: 'User created successfully',
        content: {
            accessToken
        }
    };
}



module.exports = {
    RegisterUser_se
}



















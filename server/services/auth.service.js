const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const STATUS_CODE = require('../util/SettingSystem');
const client = require('../config/google-config');
const transporter = require('../config/email-config');
const crypto = require('crypto');
const { default: axios } = require('axios');
const qs = require('qs');

const cache = {
  get: (key) => cache[key],
  set: (key, value) => (cache[key] = value),
  del: (key) => delete cache[key],
};

const generateCode = (email) => {
  const code = crypto.randomBytes(3).toString('hex');
  const timestamp = Date.now();
  const expires = timestamp + 30 * 60 * 1000; // 30 minutes in milliseconds
  return {
    code,
    email,
    timestamp,
    expires,
  };
};

const storeCache = (email) => {
  const code = generateCode(email);
  cache.set(email, code);
  setTimeout(() => cache.del(email), 30 * 60 * 1000); // 30 minutes in milliseconds
  return code.code;
};

const fetchUserProfile = async (accessToken) => {
  const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const { data } = await client.request({
    url,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

const login_Service = async (user) => {
  const { email, password } = user;

  // Check for invalid user
  const userFind = await User.CheckEmail(email);

  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Email does not exist!',
    };
  }

  // Check for invalid password
  const validPassword = await userFind.CheckPassword(password);
  if (!validPassword) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'Invalid password!',
    };
  }

  // All good
  // Update secretKey to user
  const accessToken = await userFind.SetToken();

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User login successfully',
    content: {
      accessToken,
    },
  };
};

const login_Google_Callback_Service = async (code) => {
  const { tokens } = await client.getToken(code);

  client.setCredentials(tokens);

  // Use the access token to make API requests on behalf of the user
  const user = await fetchUserProfile(tokens.access_token);

  // Check user exist
  const userFind = await User.findOne({ email: user.email });

  if (!userFind) {
    const newUser = new User({
      email: user.email,
      firstname: user.given_name,
      lastname: user.family_name,
      userImage: user.picture,
      verified: user.email_verified,
    });
    await newUser.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'User login successfully',
      content: {
        accessToken: newUser.accessToken,
      },
    };
  }

  // User exist
  const accessToken = jwt.sign({ id: userFind._id }, process.env.ACCESS_TOKEN_SECRET);
  await User.updateOne({ email: user.email }, { accessToken: accessToken });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User login successfully',
    content: {
      accessToken: accessToken,
    },
  };
};

const logout_Service = async (id) => {
  const userID = id;

  const user = await User.findById(userID);
  if (!user) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  }

  await User.updateOne({ _id: userID }, { accessToken: null });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User logout successfully',
  };
};

const forgot_password_Service = async (email) => {
  const user = await User.CheckEmail(email);

  if (!user) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Email does not exist!',
    };
  }

  //Save code to cache and get code
  const code = storeCache(email);

  //Send email
  await transporter.sendMailForgotPassword(email, code);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Send email successfully',
  };
};

const verify_code_Service = async (email, code) => {
  //Get code from cache
  const codeCache = cache.get(email);

  if (!codeCache) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Code does not exist!',
    };
  }

  //Check code
  if (codeCache && codeCache.code === code && codeCache.expires > Date.now()) {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Code is valid',
    };
  } else {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'Code is invalid',
    };
  }
};

const login_GoogleV2_Service = async (token) => {
  const URL = 'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + token;

  // Get JSON data from Google API
  const response = await axios.get(URL);
  const user = await response.data;

  // Check user exist
  const userFind = await User.findOne({ email: user.email });

  if (!userFind) {
    const newUser = new User({
      email: user.email,
      firstname: user.given_name,
      lastname: user.family_name,
      userImage: user.picture,
      verified: user.email_verified,
      username: user.family_name + ' ' + user.given_name,
    });
    await newUser.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'User login successfully',
      content: {
        accessToken: newUser.accessToken,
      },
    };
  }

  // User exist
  const accessToken = jwt.sign({ id: userFind._id }, process.env.ACCESS_TOKEN_SECRET);
  await User.updateOne({ email: user.email }, { accessToken: accessToken });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User login successfully',
    content: {
      accessToken: accessToken,
    },
  };
};

const login_Github_Service = async (code) => {
  const URL = 'https://github.com/login/oauth/access_token';
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
  };

  const queryString = qs.stringify(options);

  const { data } = await axios.post(`${URL}?${queryString}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const accessTokenGitHub = qs.parse(data).access_token;

  const { data: user } = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessTokenGitHub}`,
    },
  });

  const {data:email} = await axios.get('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessTokenGitHub}`,
    },
  });

  const userEmail = email[0].email;

  // Check user exist
  const userFind = await User.findOne({ email: userEmail });

  if (!userFind) {
    const newUser = new User({
      email: userEmail,
      firstname: user.name,
      lastname: null,
      userImage: user.avatar_url,
      verified: true,
      username: user.name,
    });
    await newUser.save();
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'User login successfully',
      content: {
        accessToken: newUser.accessToken,
      },
    };
  }

  // User exist
  const accessToken = jwt.sign({ id: userFind._id }, process.env.ACCESS_TOKEN_SECRET);
  await User.updateOne({ email: userEmail }, { accessToken: accessToken });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User login successfully',
    content: {
      accessToken: accessToken,
    },
  };
};

module.exports = {
  login_Service,
  login_Google_Callback_Service,
  logout_Service,
  forgot_password_Service,
  verify_code_Service,
  login_GoogleV2_Service,
  login_Github_Service,
};

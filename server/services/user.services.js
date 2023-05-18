const { User } = require('../models/User');
const STATUS_CODE = require('../util/SettingSystem');
const _ = require('lodash');

const registerUser_Service = async (user) => {
  const { firstname, lastname, email, password } = user;

  // let location = ''

  //   await axios
  //     .get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}`)
  //     .then((response) => {
  //       location = response.data.city;
  //     });

  // Check for existing user
  const userFind = await User.CheckEmail(email);
  if (userFind) {
    return {
      status: STATUS_CODE.CONFLICT,
      success: false,
      message: 'Email already exists!',
    };
  }
  // All good
  const newUser = new User({
    firstname,
    lastname,
    email,
    password,
    username: lastname + ' ' + firstname,
  });
  await newUser.save();

  return {
    status: STATUS_CODE.CREATED,
    success: true,
    message: 'User created successfully',
    content: {
      accessToken: newUser.accessToken,
    },
  };
};

const findUserByID_Service = async (userID) => {
  const userFind = await User.GetUser(userID);

  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  } else {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'User found successfully',
      content: {
        userInfo: {
          id: userFind._id,
          firstname: userFind.firstname,
          lastname: userFind.lastname,
          descriptions: userFind.description,
          contacts: userFind.contacts,
          username: userFind.username,
          userImage: userFind.userImage,
          followers: userFind.followers,
          following: userFind.following,
          posts: userFind.posts,
          dayJoined: new Date(userFind.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          location: userFind.location,
        },
      },
    };
  }
};

const updateUser_Service = async (userID, userUpdate) => {
  const userFind = await User.UpdateUser(userID, userUpdate);

  if (!userFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  }

  const user = await User.GetUser(userID);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User updated successfully',
    content: {
      ownerInfo: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        descriptions: user.description,
        contacts: user.contacts,
        username: user.username,
        userImage: user.userImage,
        followers: user.followers,
        following: user.following,
        posts: user.posts,
        dayJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        location: user.location,
      },
    },
  };
};

const expertise_Service = async (userID, expertise) => {
  const user = await User.GetUser(userID);

  if (!user) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  }

  await user.HandleDescription(expertise.expertise);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'User updated successfully',
    content: {
      ownerInfo: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        descriptions: user.description,
        contacts: user.contacts,
        username: user.username,
        userImage: user.userImage,
        followers: user.followers,
        following: user.following,
        posts: user.posts,
        dayJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        location: user.location,
      },
    },
  };
};

const getFollowed_Service = async (userID) => {
  const user = await User.GetFollowers(userID);

  const followers = [...user.followers];

  const following = [...user.following];

  if (!followers || !following) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not follow anyone or have any followers!',
    };
  }

  // Remove unnecessary information
  followers.forEach((follower) => {
    follower.password = undefined;
    follower.accessToken = undefined;
    follower.followers = undefined;
    follower.following = undefined;
    follower.shares = undefined;
    follower.favorites = undefined;
    follower.description = undefined;
    follower.__v = undefined;
  });

  following.forEach((follow) => {
    follow.password = undefined;
    follow.accessToken = undefined;
    follow.followers = undefined;
    follow.following = undefined;
    follow.shares = undefined;
    follow.favorites = undefined;
    follow.description = undefined;
    follow.__v = undefined;
  });

  // Combine followers and following into one array and remove duplicate users
  const followersAndFollowing = _.unionBy(followers, following, 'email');

  const userInfo = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    descriptions: user.description,
    contacts: user.contacts,
    username: user.username,
    userImage: user.userImage,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    dayJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    location: user.location,
  };

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Get all followers successfully',
    content: {
      userInfo,
      followers: followersAndFollowing,
    },
  };
};

const followUser_Service = async (userID, userFollowID) => {
  const user = await User.GetUser(userID);
  const userFollow = await User.GetUser(userFollowID);

  if (!user || !userFollow) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'User does not exist!',
    };
  }

  // Check if user already follow userFollow
  const isFollow = user.following.indexOf(userFollowID) !== -1;
  if (isFollow) {
    // Remove userFollow from user's following
    await user.RemoveFollowing(userFollowID);

    // Remove user from userFollow's followers
    await userFollow.RemoveFollower(userID);

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Unfollow user successfully',
    };
  }

  await user.SaveFollowing(userFollowID);
  await userFollow.SaveFollower(userID);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Follow user successfully',
  };
};

module.exports = {
  registerUser_Service,
  findUserByID_Service,
  updateUser_Service,
  expertise_Service,
  getFollowed_Service,
  followUser_Service,
};

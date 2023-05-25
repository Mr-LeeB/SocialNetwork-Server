const { ConnectionStates } = require('mongoose');
const { Community } = require('../models/Community');
const { User } = require('../models/User');
const STATUS_CODE = require('../util/SettingSystem');

const findCommunityByID_Service = async (id, userID) => {
    try {
        const user = await User.GetUser(userID);

        let community = await Community.findById(id)
            .populate({
                path: 'posts',
                options: { limit: 5 },
            })
            .populate({
                path: 'admins',
                select: '_id firstname lastname email userImage',
            });
        const memberLength = community.members.length;

        const randomMembers = await User.aggregate([
            { $match: { _id: { $in: community.members } } },
            { $sample: { size: 5 } },
            { $project: { _id: 1, firstname: 1, lastname: 1, email: 1, userImage: 1 } },
        ]);

        const recentlyJoined = await User.aggregate([
            { $match: { _id: { $in: community.members } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { _id: 1, firstname: 1, lastname: 1, email: 1, userImage: 1 } },
        ]);

        const result = { ...community._doc, members: randomMembers, recentlyJoined, memberLength };

        const userInfo = {
            id: user._id,
            email: user.email,
            username: user.username,
            userImage: user.userImage,
            role: community.admins.filter((admin) => admin._id.toString() === user._id.toString()).length > 0
                ? 'ADMIN'
                : community.members.indexOf(user._id) !== -1
                    ? 'MEMBER'
                    : 'NO_MEMBER',
            following: user.following,
            followers: user.followers,
            posts: user.posts,
        };

        if (!community) {
            return {
                status: STATUS_CODE.NOT_FOUND,
                success: false,
                message: 'Community not found',
            };
        } else {
            return {
                status: STATUS_CODE.SUCCESS,
                success: true,
                message: 'Get community successfully',
                content: {
                    community: result,
                    userInfo,
                },
            };
        }
    } catch (error) {
        return { status: STATUS_CODE.SERVER_ERROR, success: false, message: 'Internal server error' };
    }
};

const createCommunity_Service = async (community) => {
    try {
        const newCommunity = await Community.saveCommunity(community);
        return { status: STATUS_CODE.SUCCESS, success: true, message: 'Create community successfully', data: newCommunity };
    } catch (error) {
        console.log(error);
        return { status: STATUS_CODE.SERVER_ERROR, success: false, message: 'Internal server error' };
    }
};

module.exports = {
    findCommunityByID_Service,
    createCommunity_Service,
};

const STATUS_CODE = require('../util/SettingSystem');
const communityService = require('../services/community.service');

const findCommunityByID = async (req, res) => {

    const { id } = req.params;

    const userID = req.id

    try {
        // Call service
        const result = await communityService.findCommunityByID_Service(id, userID);

        // Return result
        const { status, success, message, content } = result;
        if (!success) {
            return res.status(status).send({ success, message });
        } else {
            return res.status(status).send({ success, message, content });
        }
    } catch (error) {
        res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
    }
}

const createCommunity = async (req, res) => {
    const { name, description, about } = req.body;

    const community = { name, description, about };

    try {
        // Call service
        const result = await communityService.createCommunity_Service(community);

        // Return result
        const { status, success, message, content } = result;
        if (!success) {
            return res.status(status).send({ success, message });
        } else {
            return res.status(status).send({ success, message, content });
        }
    } catch (error) {
        console.log(error);
        res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    findCommunityByID,
    createCommunity,

};
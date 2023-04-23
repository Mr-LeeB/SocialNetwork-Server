const STATUS_CODE = require("../util/SettingSystem");
const conversationService = require("../services/conversation.service");

//new conv
const newConversation = async (req, res) => {
    const member = { members: [req.body.senderId, req.body.receiverId] };

    try {
        const result = await conversationService.createConversation_Service(member);
        // console.log(member);

        const { status, success, message, content } = result;
        if (!success) {
            return res.status(status).send({ success, message });
        } else {
            return res.status(status).send({ success, message, content });
        }
    } catch (error) {
        console.log(error);
        res
            .status(STATUS_CODE.SERVER_ERROR)
            .send({ success: false, message: "Internal server error" });
    }
}


//get conv of a user
const getConversation = async (req, res) => {
    const userId = {
        members: { $in: [req.params.userId] },
    }

    try {
        const result = await conversationService.getConversation_Service(userId);

        const { status, success, message, content } = result;
        if (!success) {
            return res.status(status).send({ success, message });
        } else {
            return res.status(status).send({ success, message, content });
        }
    } catch (error) {
        console.log(error);
        res
            .status(STATUS_CODE.SERVER_ERROR)
            .send({ success: false, message: "Internal server error" });
    }
}

// get conv includes two userId
const getConversation2Users = async (req, res) => {
    const userId = {
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    }
    try {
        const result = await conversationService.getConversation2Users_Service(userId);

        const { status, success, message, content } = result;
        if (!success) {
            return res.status(status).send({ success, message });
        } else {
            return res.status(status).send({ success, message, content });
        }
    } catch (error) {
        console.log(error);
        res
            .status(STATUS_CODE.SERVER_ERROR)
            .send({ success: false, message: "Internal server error" });
    }
}

module.exports = {
    newConversation,
    getConversation,
    getConversation2Users,


};


const STATUS_CODE = require("../util/SettingSystem");
const messagesService = require("../services/message.service");

//add new message
const newMessage = async (req, res) => {
    const newMessages = req.body;
    try {
        const result = await messagesService.addNewMessage_Service(newMessages);
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


//get messages
const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const result = await messagesService.getMessages_Service(conversationId);
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
};

module.exports = {
    newMessage,
    getMessages,
};

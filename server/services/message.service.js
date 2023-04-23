const STATUS_CODE = require("../util/SettingSystem");
const { Message } = require("../models/Message");

const addNewMessage_Service = async (message) => {
    try {
        const save = await Message.saveMessage(message);
        return {
            status: STATUS_CODE.CREATED,
            success: true,
            message: "Add new message successfully",
            content: save,
        };
    } catch (error) {
        return {
            status: STATUS_CODE.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Add new message failed",
            content: error,
        };
    }
};

const getMessages_Service = async (conversationId) => {
    try {
        const messages = await Message.getMessages(conversationId);
        return {
            status: STATUS_CODE.SUCCESS,
            success: true,
            message: "Get messages successfully",
            content: messages,
        };
    } catch (error) {
        return {
            status: STATUS_CODE.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Get messages failed",
            content: error,
        };
    }
};



module.exports = {
    addNewMessage_Service,
    getMessages_Service,
};
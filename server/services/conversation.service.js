const STATUS_CODE = require("../util/SettingSystem");
const { Conversation } = require("../models/Conversation");

const createConversation_Service = async (members) => {
    try {
        const save = await Conversation.saveConversation(members);
        return {
            status: STATUS_CODE.CREATED,
            success: true,
            message: "Create conversation successfully",
            content: save,
        };
    } catch (error) {
        return {
            status: STATUS_CODE.BAD_REQUEST,
            success: false,
            message: "Create conversation failed",
            content: error,
        };
    }
};

const getConversation_Service = async (userId) => {
    try {
        const conversation = await Conversation.getAllConversation(userId);
        return {
            status: STATUS_CODE.SUCCESS,
            success: true,
            message: "Get conversation successfully",
            content: conversation,
        };
    } catch (error) {
        return {
            status: STATUS_CODE.BAD_REQUEST,
            success: false,
            message: "Get conversation failed",
            content: error,
        };
    }
};

const getConversation2Users_Service = async (userId) => {
    try {
        const conversation = await Conversation.getConversation2Users(userId);
        return {    
            status: STATUS_CODE.SUCCESS,
            success: true,
            message: "Get conversation successfully",
            content: conversation,
        };
    } catch (error) {
        return {
            status: STATUS_CODE.BAD_REQUEST,
            success: false,
            message: "Get conversation failed",
            content: error,
        };
    }
};

module.exports = {
    createConversation_Service,
    getConversation_Service,
    getConversation2Users_Service,

};
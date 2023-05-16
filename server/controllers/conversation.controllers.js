const STATUS_CODE = require('../util/SettingSystem');
const conversationService = require('../services/conversation.service');

const createConversation = async (req, res) => {
  const { name, isGroup } = req.body;

  const users = req.body['users[]'];

  const userID = req.id;

  const conversation = { name, isGroup, users, userID };

  try {
    // Call service
    const result = await conversationService.createConversation_Service(conversation);

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

const getConversationById = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Call service
    const result = await conversationService.getConversationById_Service(conversationId);

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

const getAllConversation = async (req, res) => {
  const userID = req.id;
  try {
    // Call service
    const result = await conversationService.getAllConversation_Service(userID);

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

const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Call service
    const result = await conversationService.deleteConversation_Service(conversationId);

    // Return result
    const { status, success, message } = result;
    if (!success) {
      return res.status(status).send({ success, message });
    } else {
      return res.status(status).send({ success, message });
    }
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODE.SERVER_ERROR).send({ success: false, message: 'Internal server error' });
  }
};

const seenConversation = async (req, res) => {
  const { conversationId } = req.params;
  const userID = req.id;

  try {
    // Call service
    const result = await conversationService.seenConversation_Service(conversationId, userID);

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

module.exports = { createConversation, getConversationById, getAllConversation, deleteConversation, seenConversation };

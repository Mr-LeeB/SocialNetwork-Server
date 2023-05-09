const STATUS_CODE = require('../util/SettingSystem');
const messageService = require('../services/message.service');

const createMessage = async (req, res) => {
  const { body, image, conversationID } = req.body;

  const sender = req.id;

  const messageToSend = { body, image, conversationID, sender };

  try {
    // Call service
    const result = await messageService.createMessage_Service(messageToSend);

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

const getAllMessage = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Call service
    const result = await messageService.getAllMessage_Service(conversationId);

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
  createMessage,
  getAllMessage,
};

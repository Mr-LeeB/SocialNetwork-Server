const STATUS_CODE = require('../util/SettingSystem');
const notificationService = require('../services/notification.service');

const getNotifications = async (req, res) => {
  const userID = req.id;

  try {
    // Call service
    const result = await notificationService.getNotifications_Service(userID);

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

const createNotification = async (req, res) => {
  const { user, post, comment, like, share } = req.body;

  const notification = { user, post, comment, like, share };

  try {
    // Call service
    const result = await notificationService.createNotification_Service(notification);

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

module.exports = { getNotifications, createNotification };

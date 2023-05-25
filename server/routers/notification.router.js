const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notification.controllers');
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');

notificationRouter.get('/notifications', checkAuthentication, notificationController.getNotifications);

notificationRouter.post('/notifications', checkAuthentication, notificationController.createNotification);

module.exports = notificationRouter;

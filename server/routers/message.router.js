const messageRouter = require('express').Router();
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');
const messageController = require('../controllers/message.controllers');

messageRouter.post('/messages', checkAuthentication, messageController.createMessage);

messageRouter.get('/:conversationId/messages/', checkAuthentication, messageController.getAllMessage);

module.exports = messageRouter;

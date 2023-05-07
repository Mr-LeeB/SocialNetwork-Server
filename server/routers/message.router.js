const messageRouter = require('express').Router();
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');
const messageController = require('../controllers/message.controllers');

messageRouter.post('/messages', checkAuthentication, messageController.createMessage);
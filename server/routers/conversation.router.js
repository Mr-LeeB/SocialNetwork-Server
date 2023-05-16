const express = require('express');
const conversationRouter = express.Router();
const { checkAuthentication } = require('../middlewares/authentication/checkAuthentication');

const ConversationController = require('../controllers/conversation.controllers');

conversationRouter.post('/conversations', checkAuthentication, ConversationController.createConversation);

conversationRouter.get('/conversations/:conversationId', checkAuthentication, ConversationController.getConversationById);

conversationRouter.post('/conversations/:conversationId/seen', checkAuthentication, ConversationController.seenConversation);

// router.get(
//   '/conversations/find/:firstUserId/:secondUserId',
//   checkAuthentication,
//   ConversationController.getConversationByTwoUserId,
// );

conversationRouter.get('/conversations', checkAuthentication, ConversationController.getAllConversation);

// router.put('/conversations/:conversationId', checkAuthentication, ConversationController.updateConversation);

conversationRouter.delete('/conversations/:conversationId', checkAuthentication, ConversationController.deleteConversation);

module.exports = conversationRouter;

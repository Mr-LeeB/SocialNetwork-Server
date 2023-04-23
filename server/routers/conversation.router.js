const express = require("express");
const conversationRouter = express.Router();
const conversationController = require("../controllers/conversation.controllers");

conversationRouter.post("/conversations", conversationController.newConversation);
conversationRouter.get("/conversations/:userId", conversationController.getConversation);
conversationRouter.get("/conversations/find/:firstUserId/:secondUserId", conversationController.getConversation2Users);

module.exports = conversationRouter;
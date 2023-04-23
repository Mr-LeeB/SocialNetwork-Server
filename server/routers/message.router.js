const express = require("express");
const messageRouter = express.Router();
const messageController = require("../controllers/message.controllers");

messageRouter.post("/messages", messageController.newMessage);
messageRouter.get("/messages/:conversationId", messageController.getMessages);

module.exports = messageRouter;
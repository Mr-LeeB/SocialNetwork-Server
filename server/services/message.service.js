const STATUS_CODE = require('../util/SettingSystem');
const { Message } = require('../models/Message');
const { Conversation } = require('../models/Conversation');
const { pusherServer } = require('../config/pusher');

const createMessage_Service = async (message) => {
  const { body, image, conversationID, sender } = message;

  const newMessage = await Message.CreateMessage({
    body,
    image,
    conversation: conversationID,
    sender,
    seen: [sender],
  });

  const updatedConversation = await Conversation.UpdateConversation(conversationID, {
    $push: { messages: newMessage._id },
    lastMessageAt: newMessage.createAt,
  })

  await pusherServer.trigger(conversationID, 'new-message', newMessage);

  const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

  updatedConversation.users.forEach((user) => {
    if (user.email) {
      pusherServer.trigger(user.email, 'conversation-update', {
        id: conversationID,
        messages: [lastMessage],
      });
    }
  });
};

module.exports = {
  createMessage_Service,
};

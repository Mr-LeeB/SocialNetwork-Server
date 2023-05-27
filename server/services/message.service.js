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

  await newMessage.populate('sender');
  await newMessage.populate('seen');

  if (image) {
    await Conversation.UpdateConversation(conversationID, {
      $push: { image: newMessage._id },
    });
  }

  const updatedConversation = await Conversation.UpdateConversation(conversationID, {
    $push: { messages: newMessage._id },
    lastMessageAt: newMessage.createdAt,
  });

  await pusherServer.trigger(conversationID, 'new-message', newMessage);

  const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

  updatedConversation.users.forEach((user) => {
    if (user._id) {
      let channel_name = user._id;
      channel_name = channel_name.toString();
      pusherServer.trigger(channel_name, 'conversation-update', {
        id: conversationID,
        messages: [lastMessage],
      });
    }
  });

  if (image) {
    updatedConversation.users.forEach((user) => {
      if (user._id) {
        let channel_name = user._id;
        channel_name = channel_name.toString();
        pusherServer.trigger(channel_name, 'conversation-update-media', {
          id: conversationID,
          image: newMessage,
        });
      }
    });
  }

  updatedConversation.users.forEach((user) => {
    if (user._id && user._id.toString() !== sender.toString()) {
      let channel_name = user._id;
      channel_name = channel_name.toString();
      pusherServer.trigger(channel_name, 'conversation-update-noti', {
        id: conversationID,
        messages: [lastMessage],
      });
    }
  });

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Create message successfully',
    content: {
      message: newMessage,
    },
  };
};

const getAllMessage_Service = async (conversationID) => {
  const messages = await Message.GetMessages(conversationID);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Get all messages successfully',
    content: {
      messages,
    },
  };
};

module.exports = {
  createMessage_Service,
  getAllMessage_Service,
};

const STATUS_CODE = require('../util/SettingSystem');
const { Conversation } = require('../models/Conversation');
const { pusherServer } = require('../config/pusher');
const { Message } = require('../models/Message');
const { User } = require('../models/User');

const createConversation_Service = async (conversation) => {
  const { name, isGroup, users, userID } = conversation;

  if (isGroup && (users.length < 2 || !users || !name)) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'Invalid data',
    };
  }

  if (isGroup) {
    const newConversation = await Conversation.CreateConversation({
      name,
      isGroup,
      users: [...users, userID],
    });

    // Update all connections with new conversation
    newConversation.users.forEach((user) => {
      if (user._id) {
        pusherServer.trigger(user._id, 'new-conversation', newConversation);
      }
    });

    return {
      status: STATUS_CODE.CREATED,
      success: true,
      message: 'Conversation created successfully',
      content: {
        conversation: newConversation,
      },
    };
  }

  const existingConversation = await Conversation.GetConversationByUsers(userID, users[0]);

  if (existingConversation.length > 0) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'Conversation already exists',
    };
  }

  const newConversation = await Conversation.CreateConversation({
    users: [userID, users[0]],
  });

  // Update all connections with new conversation
  newConversation.users.forEach((user) => {
    if (user._id) {
      pusherServer.trigger(user._id, 'new-conversation', newConversation);
    }
  });

  return {
    status: STATUS_CODE.CREATED,
    success: true,
    message: 'Conversation created successfully',
    content: {
      conversation: newConversation,
    },
  };
};

const getConversationById_Service = async (conversationID) => {
  const conversationFind = await Conversation.GetConversation(conversationID);

  if (!conversationFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Conversation does not exist!',
    };
  } else {
    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Conversation found successfully',
      content: {
        conversation: conversationFind,
      },
    };
  }
};

const getAllConversation_Service = async (userID) => {
  const conversations = await Conversation.GetConversations(userID);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Get all conversations successfully',
    content: {
      conversations,
    },
  };
};

const deleteConversation_Service = async (conversationID) => {
  const conversationFind = await Conversation.DeleteConversation(conversationID);

  if (!conversationFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Conversation does not exist!',
    };
  } else {
    // Update all connections with new conversation
    conversationFind.users.forEach((user) => {
      if (user._id) {
        pusherServer.trigger(user._id, 'delete-conversation', conversationID);
      }
    });

    return {
      status: STATUS_CODE.SUCCESS,
      success: true,
      message: 'Conversation deleted successfully',
    };
  }
};

const seenConversation_Service = async (conversationID, userID) => {
  const conversationFind = await Conversation.GetConversation(conversationID);
  const user = User.GetUser(userID);

  if (!conversationFind) {
    return {
      status: STATUS_CODE.NOT_FOUND,
      success: false,
      message: 'Conversation does not exist!',
    };
  }

  const lastMessage = conversationFind.messages[conversationFind.messages.length - 1];

  // Update the last message seen
  const updatedMessage = await Message.UpdateMessage(lastMessage._id, { $addToSet: { seen: userID } });

  // Update all connections with new conversation
  await pusherServer.trigger(user._id, 'conversation-update', {
    id: conversationID,
    messages: [updatedMessage],
  });

  // if user has already seen the message
  if (lastMessage.seen.indexOf(userID) !== -1) {
    return {
      status: STATUS_CODE.BAD_REQUEST,
      success: false,
      message: 'User has already seen the message',
    };
  }

  // Update the last message seen
  await pusherServer.trigger(conversationID, 'message-update', updatedMessage);

  return {
    status: STATUS_CODE.SUCCESS,
    success: true,
    message: 'Conversation seen successfully',
  };
};

module.exports = {
  createConversation_Service,
  getConversationById_Service,
  getAllConversation_Service,
  deleteConversation_Service,
  seenConversation_Service,
};

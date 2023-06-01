const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
  },
  isGroup: {
    type: Boolean,
  },
  messages: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  },
  users: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  image: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    default: [],
  },
});

ConversationSchema.statics = {
  CreateConversation: async function (conversation) {
    const newConversation = new this(conversation);
    return newConversation.save();
  },
  GetConversation: async function (conversationID) {
    return this.findById(conversationID)
      .populate({
        path: 'users',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'messages',
        populate: [
          { path: 'sender', select: '_id firstname lastname username email userImage' },
          { path: 'seen', select: '_id firstname lastname username email userImage' },
        ],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender', select: '_id firstname lastname username email userImage' },
      });
  },
  GetConversations: async function (userID) {
    return this.find({ users: userID })
      .populate({
        path: 'users',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'messages',
        populate: [
          { path: 'sender', select: '_id firstname lastname username email userImage' },
          { path: 'seen', select: '_id firstname lastname username email userImage' },
        ],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender', select: '_id firstname lastname username email userImage' },
      })
      .sort({ lastMessageAt: 'desc' });
  },
  GetConversationByUser: async function (userID) {
    return this.find({ users: userID })
      .populate({
        path: 'users',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'messages',
        populate: [
          { path: 'sender', select: '_id firstname lastname username email userImage' },
          { path: 'seen', select: '_id firstname lastname username email userImage' },
        ],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender', select: '_id firstname lastname username email userImage' },
      });
  },
  GetConversationByUsers: async function (userID1, userID2) {
    return this.find({ users: { $size: 2, $all: [userID1, userID2] } })
      .populate({
        path: 'users',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'messages',
        populate: [
          { path: 'sender', select: '_id firstname lastname username email userImage' },
          { path: 'seen', select: '_id firstname lastname username email userImage' },
        ],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender', select: '_id firstname lastname username email userImage' },
      });
  },
  UpdateConversation: async function (conversationID, updateData) {
    return this.findByIdAndUpdate(conversationID, updateData, { new: true })
      .populate({
        path: 'users',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'messages',
        populate: [
          { path: 'seen', select: '_id firstname lastname username email userImage' },
          { path: 'sender', select: '_id firstname lastname username email userImage' },
        ],
      });
  },
  DeleteConversation: async function (conversationID) {
    return this.findByIdAndDelete(conversationID).populate({
      path: 'users',
      select: '_id firstname lastname username email userImage',
    });
  },
};

module.exports = {
  Conversation: mongoose.model('Conversation', ConversationSchema),
};

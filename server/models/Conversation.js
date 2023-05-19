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
      .populate('users')
      .populate({
        path: 'messages',
        populate: [{ path: 'sender' }, { path: 'seen' }],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender' },
      });
  },
  GetConversations: async function (userID) {
    return this.find({ users: userID })
      .populate('users')
      .populate({
        path: 'messages',
        populate: [{ path: 'sender' }, { path: 'seen' }],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender' },
      })
      .sort({ lastMessageAt: 'desc' });
  },
  GetConversationByUser: async function (userID) {
    return this.find({ users: userID })
      .populate('users')
      .populate({
        path: 'messages',
        populate: [{ path: 'sender' }, { path: 'seen' }],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender' },
      });
  },
  GetConversationByUsers: async function (userID1, userID2) {
    return this.find({ users: { $size: 2, $all: [userID1, userID2] } })
      .populate('users')
      .populate({
        path: 'messages',
        populate: [{ path: 'sender' }, { path: 'seen' }],
      })
      .populate({
        path: 'image',
        populate: { path: 'sender' },
      });
  },
  UpdateConversation: async function (conversationID, updateData) {
    return this.findByIdAndUpdate(conversationID, updateData, { new: true })
      .populate('users')
      .populate({ path: 'messages', populate: [{ path: 'seen' }, { path: 'sender' }] });
  },
  DeleteConversation: async function (conversationID) {
    return this.findByIdAndDelete(conversationID).populate('users');
  },
};

module.exports = {
  Conversation: mongoose.model('Conversation', ConversationSchema),
};

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  body: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  seen: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
});

MessageSchema.statics = {
  CreateMessage: async function (message) {
    const newMessage = new this(message);
    return newMessage.save();
  },
  GetMessage: async function (messageID) {
    return this.findById(messageID)
      .populate({
        path: 'seen',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'sender',
        select: '_id firstname lastname username email userImage',
      });
  },
  GetMessages: async function (conversationID) {
    return this.find({ conversation: conversationID })
      .populate({
        path: 'seen',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'sender',
        select: '_id firstname lastname username email userImage',
      })
      .sort({ createdAt: 'asc' });
  },
  UpdateMessage: async function (messageID, data) {
    return this.findByIdAndUpdate(messageID, data, { new: true })
      .populate({
        path: 'seen',
        select: '_id firstname lastname username email userImage',
      })
      .populate({
        path: 'sender',
        select: '_id firstname lastname username email userImage',
      });
  },
};

module.exports = {
  Message: mongoose.model('Message', MessageSchema),
};

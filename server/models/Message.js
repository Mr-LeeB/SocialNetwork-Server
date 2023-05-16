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
    return this.findById(messageID).populate('sender').populate('seen');
  },
  GetMessages: async function (conversationID) {
    return this.find({ conversation: conversationID }).populate('sender').populate('seen').sort({ createdAt: 'asc' });
  },
  UpdateMessage: async function (messageID, data) {
    return this.findByIdAndUpdate(messageID, data, { new: true }).populate('seen').populate('sender');
  },
};

module.exports = {
  Message: mongoose.model('Message', MessageSchema),
};

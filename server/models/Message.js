const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
        },
        sender: {
            type: String,
        },
        text: {
            type: String,
        },
    },
    { timestamps: true }
);

MessageSchema.statics = {
    saveMessage: async function (message) {
        const newMessage = new this(message);
        return newMessage.save();
    },

    getMessages: async function (conversationId) {
        return this.find({ conversationId });
    },
}

module.exports = {
    Message: mongoose.model("Message", MessageSchema),
};
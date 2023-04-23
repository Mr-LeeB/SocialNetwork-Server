const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        members: {
            type: Array,
        },
    },
    {
        timestamps: true
    }
);

ConversationSchema.statics = {

    saveConversation: async function (members) {
        const newConversation = new this(members);
        return newConversation.save();
    },


    getAllConversation: async function (userId) {
        return this.find(userId);
    },

    getConversation2Users: async function (userId) {
        return this.findOne(userId);
    }
}

module.exports = {
    Conversation: mongoose.model("Conversation", ConversationSchema),
};
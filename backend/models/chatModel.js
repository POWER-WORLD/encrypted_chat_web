const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        chatName: {
            type: String,
            trim: true,
            maxlength: [100, 'Chat name cannot exceed 100 characters'],
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for high-frequency queries
chatSchema.index({ users: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ isGroupChat: 1 });

module.exports = mongoose.model('Chat', chatSchema);

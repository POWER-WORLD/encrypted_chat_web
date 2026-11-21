const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Message must have a valid sender'],
        },
        content: {
            type: String,
            trim: true,
            required: [true, 'Message content cannot be empty'],
            maxlength: [5000, 'Message content cannot exceed 5000 characters'],
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: [true, 'Message must belong to a chat'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for rapid message pagination and search
messageSchema.index({ chat: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);

const { describe, it } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

describe('Chat and Message Models & Schema Rules Tests', () => {
    it('Chat model requires users array and defaults isGroupChat to false', () => {
        const chat = new Chat({
            chatName: 'Direct Channel',
            users: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
        });

        assert.strictEqual(chat.isGroupChat, false);
        assert.strictEqual(chat.users.length, 2);
        assert.strictEqual(chat.chatName, 'Direct Channel');
    });

    it('Message model requires content, sender, and chat', async () => {
        const validMessage = new Message({
            sender: new mongoose.Types.ObjectId(),
            chat: new mongoose.Types.ObjectId(),
            content: 'Hello encrypted world!',
        });

        const validationError = validMessage.validateSync();
        assert.strictEqual(validationError, undefined);
    });

    it('Message model rejects missing content', () => {
        const invalidMessage = new Message({
            sender: new mongoose.Types.ObjectId(),
            chat: new mongoose.Types.ObjectId(),
            content: '',
        });

        const validationError = invalidMessage.validateSync();
        assert.ok(validationError);
        assert.ok(validationError.errors.content);
    });

    it('Message model rejects content exceeding 5000 characters', () => {
        const excessiveContent = 'A'.repeat(5001);
        const oversizedMessage = new Message({
            sender: new mongoose.Types.ObjectId(),
            chat: new mongoose.Types.ObjectId(),
            content: excessiveContent,
        });

        const validationError = oversizedMessage.validateSync();
        assert.ok(validationError);
        assert.ok(validationError.errors.content);
    });
});

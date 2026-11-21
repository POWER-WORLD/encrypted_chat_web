const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const { isValidObjectId } = require('../utils/validators');

/**
 * @desc    Send a new message to a chat
 * @route   POST /api/messages
 * @access  Protected
 */
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        res.status(400);
        throw new Error('content and chatId are required in request body');
    }

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (trimmedContent.length === 0) {
        res.status(400);
        throw new Error('Message content cannot be empty');
    }

    if (trimmedContent.length > 5000) {
        res.status(400);
        throw new Error('Message content exceeds maximum allowed length of 5000 characters');
    }

    if (!isValidObjectId(chatId)) {
        res.status(400);
        throw new Error('Invalid chatId format');
    }

    // Verify chat existence
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    // IDOR Security Authorization: Check if sender is a member of the chat
    const isParticipant = chat.users.some(
        (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
        res.status(403);
        throw new Error('Forbidden: You are not authorized to send messages to this chat');
    }

    const newMessage = {
        sender: req.user._id,
        content: trimmedContent,
        chat: chatId,
    };

    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'name profilePicture pic email');
    message = await message.populate('chat');
    message = await User.populate(message, {
        path: 'chat.users',
        select: 'name profilePicture pic email',
    });

    // Update latestMessage on chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    res.status(201).json(message);
});

/**
 * @desc    Get all messages for a specific chat
 * @route   GET /api/messages/:chatId
 * @access  Protected
 */
const allMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    if (!chatId || !isValidObjectId(chatId)) {
        res.status(400);
        throw new Error('Invalid or missing chatId parameter');
    }

    // Verify chat existence
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    // IDOR Security Authorization: Check if user is a member of the chat
    const isParticipant = chat.users.some(
        (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
        res.status(403);
        throw new Error('Forbidden: You are not authorized to view messages in this chat');
    }

    const messages = await Message.find({ chat: chatId })
        .populate('sender', 'name profilePicture pic email')
        .populate('chat')
        .sort({ createdAt: 1 });

    res.status(200).json(messages);
});

module.exports = {
    sendMessage,
    allMessages,
};

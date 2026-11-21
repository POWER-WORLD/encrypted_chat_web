const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const { isValidObjectId } = require('../utils/validators');

/**
 * @desc    Access an existing 1-on-1 chat or create a new one
 * @route   POST /api/chats
 * @access  Protected
 */
const createChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        res.status(400);
        throw new Error('Target userId parameter is required');
    }

    if (!isValidObjectId(userId)) {
        res.status(400);
        throw new Error('Invalid userId parameter format');
    }

    if (userId.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot create a 1-on-1 chat with yourself');
    }

    // Verify target user exists
    const targetUser = await User.findById(userId).select('-password');
    if (!targetUser) {
        res.status(404);
        throw new Error('Target user does not exist');
    }

    // Find if 1-on-1 chat already exists
    let existingChat = await Chat.findOne({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate('users', '-password')
        .populate('latestMessage');

    if (existingChat) {
        existingChat = await User.populate(existingChat, {
            path: 'latestMessage.sender',
            select: 'name email profilePicture pic',
        });
        return res.status(200).json(existingChat);
    }

    // Create new 1-on-1 chat
    const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(createdChat._id)
        .populate('users', '-password');

    res.status(201).json(fullChat);
});

/**
 * @desc    Fetch all chats for the authenticated user
 * @route   GET /api/chats
 * @access  Protected
 */
const fetchChats = asyncHandler(async (req, res) => {
    let chats = await Chat.find({
        users: { $elemMatch: { $eq: req.user._id } },
    })
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .populate('latestMessage')
        .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
        path: 'latestMessage.sender',
        select: 'name email profilePicture pic',
    });

    res.status(200).json(chats);
});

/**
 * @desc    Create a new group chat
 * @route   POST /api/chats/group
 * @access  Protected
 */
const createGroupChat = asyncHandler(async (req, res) => {
    const { name, users: rawUsers } = req.body;

    if (!rawUsers || !name) {
        res.status(400);
        throw new Error('Please provide both group name and users list');
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        res.status(400);
        throw new Error('Group name must be between 1 and 100 characters');
    }

    let parsedUsers;
    try {
        parsedUsers = typeof rawUsers === 'string' ? JSON.parse(rawUsers) : rawUsers;
    } catch (parseError) {
        res.status(400);
        throw new Error('Invalid JSON format for users field');
    }

    if (!Array.isArray(parsedUsers)) {
        res.status(400);
        throw new Error('Users field must be an array of user IDs');
    }

    // Deduplicate and filter valid IDs
    const uniqueUserIds = [...new Set(parsedUsers.map((u) => (typeof u === 'object' && u._id ? u._id.toString() : u.toString())))];

    if (uniqueUserIds.length < 2) {
        res.status(400);
        throw new Error('At least 2 other users are required to form a group chat');
    }

    for (const uid of uniqueUserIds) {
        if (!isValidObjectId(uid)) {
            res.status(400);
            throw new Error(`Invalid user ID format in members list: ${uid}`);
        }
    }

    // Add current user to group
    if (!uniqueUserIds.includes(req.user._id.toString())) {
        uniqueUserIds.push(req.user._id.toString());
    }

    const groupChat = await Chat.create({
        chatName: trimmedName,
        users: uniqueUserIds,
        isGroupChat: true,
        groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
});

/**
 * @desc    Rename an existing group chat
 * @route   PUT /api/chats/group
 * @access  Protected
 */
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
        res.status(400);
        throw new Error('chatId and chatName are required');
    }

    if (!isValidObjectId(chatId)) {
        res.status(400);
        throw new Error('Invalid chatId format');
    }

    const trimmedName = chatName.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        res.status(400);
        throw new Error('Chat name must be between 1 and 100 characters');
    }

    // Check chat existence and membership authorization
    const existingChat = await Chat.findById(chatId);
    if (!existingChat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (!existingChat.isGroupChat) {
        res.status(400);
        throw new Error('Cannot rename a one-on-one chat');
    }

    const isMember = existingChat.users.some(
        (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isMember) {
        res.status(403);
        throw new Error('Not authorized: You are not a member of this group chat');
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: trimmedName },
        { returnDocument: 'after' }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    res.status(200).json(updatedChat);
});

/**
 * @desc    Add a user to a group chat
 * @route   PUT /api/chats/group/add
 * @access  Protected
 */
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        res.status(400);
        throw new Error('chatId and userId are required');
    }

    if (!isValidObjectId(chatId) || !isValidObjectId(userId)) {
        res.status(400);
        throw new Error('Invalid chatId or userId format');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (!chat.isGroupChat) {
        res.status(400);
        throw new Error('Cannot add members to a one-on-one chat');
    }

    // Authorization: Only admin can add members
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized: Only group admins can add members');
    }

    // Check if user already in group
    const alreadyMember = chat.users.some(
        (uid) => uid.toString() === userId.toString()
    );
    if (alreadyMember) {
        res.status(400);
        throw new Error('User is already a member of this group');
    }

    // Verify user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
        res.status(404);
        throw new Error('User to add not found');
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { returnDocument: 'after' }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    res.status(200).json(updatedChat);
});

/**
 * @desc    Remove a user from a group chat (or leave group)
 * @route   PUT /api/chats/group/remove
 * @access  Protected
 */
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        res.status(400);
        throw new Error('chatId and userId are required');
    }

    if (!isValidObjectId(chatId) || !isValidObjectId(userId)) {
        res.status(400);
        throw new Error('Invalid chatId or userId format');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (!chat.isGroupChat) {
        res.status(400);
        throw new Error('Cannot remove members from a one-on-one chat');
    }

    const isSelfRemoval = userId.toString() === req.user._id.toString();
    const isAdmin = chat.groupAdmin && chat.groupAdmin.toString() === req.user._id.toString();

    // Authorization: Either user removes themselves or group admin removes someone
    if (!isSelfRemoval && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized: Only group admins can remove other members');
    }

    // Check if target user is actually in the group
    const isMember = chat.users.some(
        (uid) => uid.toString() === userId.toString()
    );
    if (!isMember) {
        res.status(400);
        throw new Error('User is not a member of this group');
    }

    const updatedUsers = chat.users.filter(
        (uid) => uid.toString() !== userId.toString()
    );

    let newAdmin = chat.groupAdmin;
    // If admin is leaving and there are remaining users, transfer admin to next user
    if (isAdmin && isSelfRemoval && updatedUsers.length > 0) {
        newAdmin = updatedUsers[0];
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            users: updatedUsers,
            groupAdmin: newAdmin,
        },
        { returnDocument: 'after' }
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

    res.status(200).json(updatedChat);
});

module.exports = {
    createChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
};

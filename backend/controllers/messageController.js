const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
// @desc    Send a new message
// @route   POST /api/messages/
// @access  Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
    if (!content || !chatId) {
    console.log('Invalid data passed into request');
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

    try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'name pic');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.sendStatus(500);
  }
});

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name pic')
      .populate('chat');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.sendStatus(500);
  }
});



module.exports = { sendMessage, allMessages };
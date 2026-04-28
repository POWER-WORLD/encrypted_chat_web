const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup} = require('../controllers/chatControllers');

// All chat routes are protected
router.route('/').post(protect, createChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/group').put(protect, renameGroup);
router.route('/group/add').put(protect, addToGroup);
router.route('/group/remove').put(protect, removeFromGroup);

module.exports = router;
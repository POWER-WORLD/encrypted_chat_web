const expess = require('express');
const router = expess.Router();
const { sendMessage, allMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');


router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);

module.exports = router;
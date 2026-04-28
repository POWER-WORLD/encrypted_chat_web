//user routes
const express = require('express');
const router = express.Router();
const { registerUser, authUser, searchUsers } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

//register and login routes
router.post('/register', registerUser);
router.post('/login', authUser);

//search users route
router.get('/', protect, searchUsers);

module.exports = router;
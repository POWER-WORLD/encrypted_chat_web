const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, profilePicture } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please enter all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password, profilePicture });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Failed to create the user');
    }
});

// Authenticate user & get token
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Search users (filters out current logged-in user)
const searchUsers = asyncHandler(async (req, res) => {
    // 1. Define the search filter
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ],
    } : {};

    // 2. Combine the search filter with the "exclude current user" filter
    // We use $and to ensure both conditions must be met
    const users = await User.find({
        ...keyword,
        _id: { $ne: req.user._id }
    });

    res.send(users);
});

module.exports = { registerUser, authUser, searchUsers };

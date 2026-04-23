// User Controllers
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, profilePicture } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        profilePicture
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// Authenticate user and get token
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid email or password');
    }
});

module.exports = { registerUser, authUser };


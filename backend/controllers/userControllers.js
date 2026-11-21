const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { isValidEmail, isValidPassword, escapeRegex } = require('../utils/validators');

/**
 * @desc    Register a new user account
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, profilePicture, pic } = req.body;

    // Validate presence of required fields
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
    }

    // Validate password strength
    if (!isValidPassword(password)) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        res.status(400);
        throw new Error('A user with this email address already exists');
    }

    const avatarUrl = profilePicture || pic;

    // Create user in database (password is automatically hashed by model pre-save hook)
    const user = await User.create({
        name: trimmedName,
        email: normalizedEmail,
        password,
        ...(avatarUrl ? { profilePicture: avatarUrl } : {}),
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            pic: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Failed to create the user account');
    }
});

/**
 * @desc    Authenticate user credentials and return JWT token
 * @route   POST /api/users/login
 * @access  Public
 */
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide both email and password');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            pic: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

/**
 * @desc    Search users by name or email (excluding current user)
 * @route   GET /api/users
 * @access  Protected
 */
const searchUsers = asyncHandler(async (req, res) => {
    const searchQuery = req.query.search;
    let filter = {
        _id: { $ne: req.user._id },
    };

    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
        const sanitized = escapeRegex(searchQuery.trim());
        filter.$or = [
            { name: { $regex: sanitized, $options: 'i' } },
            { email: { $regex: sanitized, $options: 'i' } },
        ];
    }

    // Limit to 20 results to prevent query DoS and select only public fields
    const users = await User.find(filter)
        .select('name email profilePicture pic')
        .limit(20)
        .lean();

    res.status(200).json(users);
});

module.exports = {
    registerUser,
    authUser,
    searchUsers,
};

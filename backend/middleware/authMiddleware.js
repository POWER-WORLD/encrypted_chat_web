const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * Authentication middleware to verify JWT token and attach user to request object.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token || token.trim() === '') {
                res.status(401);
                throw new Error('Not authorized: Token missing or empty');
            }

            const secret = process.env.JWT_SECRET || 'encrypted_chats_jwt_fallback_secret_key';
            const decoded = jwt.verify(token, secret);

            // Fetch user from DB and exclude password
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('Not authorized: User account not found');
            }

            req.user = user;
            return next();
        } catch (error) {
            res.status(401);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Not authorized: Session expired, please sign in again');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Not authorized: Invalid authentication token');
            }
            throw new Error(error.message || 'Not authorized: Authentication failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized: No token provided in header');
    }
});

module.exports = { protect };

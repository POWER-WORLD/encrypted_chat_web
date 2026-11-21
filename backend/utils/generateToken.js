const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token for authenticated users.
 * @param {string|mongoose.Types.ObjectId} id - The user ID
 * @returns {string} - Signed JWT
 */
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'encrypted_chats_jwt_fallback_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

    return jwt.sign({ id }, secret, {
        expiresIn,
    });
};

module.exports = generateToken;

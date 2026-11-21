const mongoose = require('mongoose');

/**
 * Validates whether a given string is a valid MongoDB ObjectId.
 * @param {string|mongoose.Types.ObjectId} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id.toString();
};

/**
 * Escapes special characters for safe use in regular expressions.
 * Prevents ReDoS and regex query injection attacks.
 * @param {string} string
 * @returns {string}
 */
const escapeRegex = (string) => {
    if (typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates email format according to standard email RFC patterns.
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
};

/**
 * Validates password strength (minimum 6 characters, non-empty).
 * @param {string} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
    return typeof password === 'string' && password.trim().length >= 6;
};

/**
 * Sanitizes input objects to prevent NoSQL query operator injection.
 * Strips any key that starts with '$' or contains '.'.
 * @param {any} input
 * @returns {any}
 */
const sanitizeMongoInput = (input) => {
    if (input === null || typeof input !== 'object') {
        return input;
    }
    if (Array.isArray(input)) {
        return input.map(sanitizeMongoInput);
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
        if (!key.startsWith('$') && !key.includes('.')) {
            sanitized[key] = sanitizeMongoInput(value);
        }
    }
    return sanitized;
};

module.exports = {
    isValidObjectId,
    escapeRegex,
    isValidEmail,
    isValidPassword,
    sanitizeMongoInput,
};

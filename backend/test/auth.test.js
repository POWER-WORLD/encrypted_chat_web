const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = require('../utils/generateToken');
const User = require('../models/userModel');

describe('Authentication & Token Generation Tests', () => {
    it('generateToken() should create a valid JWT with the provided user ID', () => {
        const testUserId = '617a077e18c25468bc7c4dd4';
        const token = generateToken(testUserId);

        assert.ok(token);
        assert.strictEqual(typeof token, 'string');

        // Decode token to verify payload
        const secret = process.env.JWT_SECRET || 'encrypted_chats_jwt_fallback_secret_key';
        const decoded = jwt.verify(token, secret);

        assert.strictEqual(decoded.id, testUserId);
        assert.ok(decoded.exp);
    });

    it('matchPassword() on User model should correctly compare hashes', async () => {
        const plainPassword = 'superSecretPassword123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Create an in-memory document instance without saving to DB
        const testUser = new User({
            name: 'Cipher Test',
            email: 'cipher@example.com',
            password: hashedPassword,
        });

        const isMatch = await testUser.matchPassword(plainPassword);
        assert.strictEqual(isMatch, true);

        const isWrongMatch = await testUser.matchPassword('wrongPassword');
        assert.strictEqual(isWrongMatch, false);

        const emptyMatch = await testUser.matchPassword('');
        assert.strictEqual(emptyMatch, false);
    });

    it('User model should have virtual pic property mapped to profilePicture', () => {
        const testUser = new User({
            name: 'Virtual Pic Test',
            email: 'virtual@example.com',
            password: 'hashedPasswordPlaceholder',
            profilePicture: 'https://example.com/avatar.png',
        });

        assert.strictEqual(testUser.pic, 'https://example.com/avatar.png');

        // Test setter
        testUser.pic = 'https://example.com/new-avatar.png';
        assert.strictEqual(testUser.profilePicture, 'https://example.com/new-avatar.png');
    });
});

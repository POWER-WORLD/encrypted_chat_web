const { describe, it } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const {
    isValidObjectId,
    escapeRegex,
    isValidEmail,
    isValidPassword,
    sanitizeMongoInput,
} = require('../utils/validators');

describe('Backend Validators & Sanitizers Unit Tests', () => {
    describe('isValidObjectId()', () => {
        it('should return true for valid 24-char hex MongoDB ObjectIds', () => {
            const validId = new mongoose.Types.ObjectId().toString();
            assert.strictEqual(isValidObjectId(validId), true);
        });

        it('should return false for invalid strings, empty values, or malformed IDs', () => {
            assert.strictEqual(isValidObjectId(''), false);
            assert.strictEqual(isValidObjectId(null), false);
            assert.strictEqual(isValidObjectId(undefined), false);
            assert.strictEqual(isValidObjectId('12345'), false);
            assert.strictEqual(isValidObjectId('not-a-valid-object-id-string'), false);
            assert.strictEqual(isValidObjectId('617a077e18c25468bc7c4ddZ'), false); // 'Z' is not hex
        });
    });

    describe('escapeRegex()', () => {
        it('should properly escape regex special characters to prevent ReDoS', () => {
            const dangerous = 'user.*+?^${}()|[]\\test';
            const escaped = escapeRegex(dangerous);
            assert.strictEqual(escaped, 'user\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test');
            // Ensure creating a RegExp with the escaped string treats all specials as literals
            const reg = new RegExp(escaped);
            assert.strictEqual(reg.test('user.*+?^${}()|[]\\test'), true);
            assert.strictEqual(reg.test('userANYTHINGtest'), false);
        });

        it('should return empty string for non-string inputs', () => {
            assert.strictEqual(escapeRegex(null), '');
            assert.strictEqual(escapeRegex(123), '');
            assert.strictEqual(escapeRegex(undefined), '');
        });
    });

    describe('isValidEmail()', () => {
        it('should return true for valid email formats', () => {
            assert.strictEqual(isValidEmail('user@example.com'), true);
            assert.strictEqual(isValidEmail('john.doe+work@company.org'), true);
            assert.strictEqual(isValidEmail('admin_123@sub.domain.co'), true);
        });

        it('should return false for invalid emails', () => {
            assert.strictEqual(isValidEmail('plainaddress'), false);
            assert.strictEqual(isValidEmail('@missingusername.com'), false);
            assert.strictEqual(isValidEmail('username@.com'), false);
            assert.strictEqual(isValidEmail('user@domain'), false);
            assert.strictEqual(isValidEmail(''), false);
            assert.strictEqual(isValidEmail(null), false);
        });
    });

    describe('isValidPassword()', () => {
        it('should return true for passwords with 6 or more characters', () => {
            assert.strictEqual(isValidPassword('password123'), true);
            assert.strictEqual(isValidPassword('123456'), true);
        });

        it('should return false for passwords shorter than 6 characters or invalid types', () => {
            assert.strictEqual(isValidPassword('12345'), false);
            assert.strictEqual(isValidPassword(''), false);
            assert.strictEqual(isValidPassword('   '), false);
            assert.strictEqual(isValidPassword(null), false);
        });
    });

    describe('sanitizeMongoInput()', () => {
        it('should strip $ keys to prevent MongoDB query injection', () => {
            const malicious = {
                username: 'alice',
                $gt: '',
                nested: {
                    $where: 'sleep(1000)',
                    safeField: 'ok',
                },
            };
            const sanitized = sanitizeMongoInput(malicious);
            assert.deepStrictEqual(sanitized, {
                username: 'alice',
                nested: {
                    safeField: 'ok',
                },
            });
        });

        it('should strip dotted keys to prevent path injection', () => {
            const malicious = {
                'user.role': 'admin',
                clean: 'value',
            };
            const sanitized = sanitizeMongoInput(malicious);
            assert.deepStrictEqual(sanitized, { clean: 'value' });
        });

        it('should handle arrays correctly', () => {
            const arr = [{ safe: 1, $bad: 2 }, { fine: 3 }];
            const sanitized = sanitizeMongoInput(arr);
            assert.deepStrictEqual(sanitized, [{ safe: 1 }, { fine: 3 }]);
        });
    });
});

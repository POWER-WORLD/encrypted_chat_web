import { describe, it, expect } from 'vitest';
import { getSender, getSenderFull, isMessageFromLoggedUser, formatMessageTime } from '../config/chatLogics';

describe('chatLogics Utilities', () => {
    const loggedUser = { _id: 'user1', name: 'Operator Alpha' };
    const peerUser = { _id: 'user2', name: 'Node Beta' };
    const users = [loggedUser, peerUser];

    describe('getSender', () => {
        it('should return peer name when loggedUser is first in users array', () => {
            expect(getSender(loggedUser, users)).toBe('Node Beta');
        });

        it('should return peer name when loggedUser is second in users array', () => {
            const reversedUsers = [peerUser, loggedUser];
            expect(getSender(loggedUser, reversedUsers)).toBe('Node Beta');
        });

        it('should return empty string if inputs are invalid or missing', () => {
            expect(getSender(null, users)).toBe('');
            expect(getSender(loggedUser, null)).toBe('');
            expect(getSender(loggedUser, [loggedUser])).toBe('');
            expect(getSender(loggedUser, [])).toBe('');
        });
    });

    describe('getSenderFull', () => {
        it('should return full peer object when loggedUser is first', () => {
            expect(getSenderFull(loggedUser, users)).toEqual(peerUser);
        });

        it('should return full peer object when loggedUser is second', () => {
            const reversedUsers = [peerUser, loggedUser];
            expect(getSenderFull(loggedUser, reversedUsers)).toEqual(peerUser);
        });

        it('should return empty object if inputs are invalid', () => {
            expect(getSenderFull(null, users)).toEqual({});
            expect(getSenderFull(loggedUser, null)).toEqual({});
            expect(getSenderFull(loggedUser, [])).toEqual({});
        });
    });

    describe('isMessageFromLoggedUser', () => {
        it('should return true if message sender._id matches loggedUser', () => {
            const msg = { sender: { _id: 'user1', name: 'Operator Alpha' }, content: 'Payload' };
            expect(isMessageFromLoggedUser(loggedUser, msg)).toBe(true);
        });

        it('should return true if message sender is a string id matching loggedUser', () => {
            const msg = { sender: 'user1', content: 'Payload' };
            expect(isMessageFromLoggedUser(loggedUser, msg)).toBe(true);
        });

        it('should return false if message sender does not match loggedUser', () => {
            const msg = { sender: { _id: 'user2', name: 'Node Beta' }, content: 'Payload' };
            expect(isMessageFromLoggedUser(loggedUser, msg)).toBe(false);
        });

        it('should return false for invalid inputs', () => {
            expect(isMessageFromLoggedUser(null, { sender: 'user1' })).toBe(false);
            expect(isMessageFromLoggedUser(loggedUser, null)).toBe(false);
            expect(isMessageFromLoggedUser(loggedUser, {})).toBe(false);
        });
    });

    describe('formatMessageTime', () => {
        it('should format ISO timestamp to HH:mm string', () => {
            const timestamp = '2026-11-21T14:30:00.000Z';
            const formatted = formatMessageTime(timestamp);
            expect(formatted).toMatch(/^\d{2}:\d{2}$/);
        });

        it('should return empty string for null or invalid timestamp', () => {
            expect(formatMessageTime(null)).toBe('');
            expect(formatMessageTime('')).toBe('');
            expect(formatMessageTime('invalid-date')).toBe('');
        });
    });
});

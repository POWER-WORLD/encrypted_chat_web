import { describe, it, expect } from 'vitest';
import { API_BASE_URL, AUTHOR_PROFILE, getAvatarUrl, CLOUDINARY_CONFIG } from '../config/constants';

describe('Global Constants & Helpers', () => {
    it('API_BASE_URL should never end with a trailing slash', () => {
        expect(API_BASE_URL).toBeDefined();
        expect(API_BASE_URL.endsWith('/')).toBe(false);
    });

    it('AUTHOR_PROFILE should contain all specified verified links', () => {
        expect(AUTHOR_PROFILE.PORTFOLIO).toBe('https://pawankumar.info/');
        expect(AUTHOR_PROFILE.LINKEDIN).toBe('https://www.linkedin.com/in/pawankumar101/');
        expect(AUTHOR_PROFILE.LEETCODE).toBe('https://leetcode.com/u/pk3253702/');
        expect(AUTHOR_PROFILE.GITHUB).toBe('https://github.com/POWER-WORLD');
    });

    it('CLOUDINARY_CONFIG should define cloud name and upload url', () => {
        expect(CLOUDINARY_CONFIG.CLOUD_NAME).toBeDefined();
        expect(CLOUDINARY_CONFIG.UPLOAD_PRESET).toBeDefined();
        expect(CLOUDINARY_CONFIG.UPLOAD_URL).toContain('cloudinary.com');
    });

    describe('getAvatarUrl', () => {
        it('should return target.profilePicture if it is a valid http URL', () => {
            const target = { profilePicture: 'https://images.example.com/avatar.jpg' };
            expect(getAvatarUrl(target)).toBe('https://images.example.com/avatar.jpg');
        });

        it('should return target.groupImage for groups with image', () => {
            const target = { groupImage: 'https://images.example.com/group.jpg' };
            expect(getAvatarUrl(target)).toBe('https://images.example.com/group.jpg');
        });

        it('should return Dicebear SVG avatar if no profilePicture exists', () => {
            const target = { name: 'CypherNode' };
            const url = getAvatarUrl(target);
            expect(url).toContain('https://api.dicebear.com/7.x/bottts/svg');
            expect(url).toContain('seed=CypherNode');
        });

        it('should handle null or undefined gracefully', () => {
            const url = getAvatarUrl(null, 'anonymous');
            expect(url).toContain('https://api.dicebear.com/7.x/bottts/svg');
            expect(url).toContain('seed=anonymous');
        });
    });
});

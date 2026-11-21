import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from './test-utils';
import SocialButtons from '../ui/SocialButtons';
import { AUTHOR_PROFILE } from '../config/constants';

describe('SocialButtons Component', () => {
    it('should render all 4 architect links with correct href and rel attributes', () => {
        const { container, unmount } = render(<SocialButtons />);

        const links = Array.from(container.querySelectorAll('a'));
        expect(links.length).toBe(4);

        const urls = links.map(link => link.getAttribute('href'));
        expect(urls).toContain(AUTHOR_PROFILE.PORTFOLIO);
        expect(urls).toContain(AUTHOR_PROFILE.GITHUB);
        expect(urls).toContain(AUTHOR_PROFILE.LINKEDIN);
        expect(urls).toContain(AUTHOR_PROFILE.LEETCODE);

        links.forEach(link => {
            expect(link.getAttribute('target')).toBe('_blank');
            expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        });

        unmount();
    });

    it('should display the architect header text', () => {
        const { container, unmount } = render(<SocialButtons />);
        expect(container.textContent).toContain('ARCHITECT // PAWAN KUMAR');
        unmount();
    });
});

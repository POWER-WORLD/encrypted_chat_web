import React, { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from './test-utils';
import AuthInput from '../ui/AuthInput';
import { Mail } from 'lucide-react';

describe('AuthInput Component', () => {
    it('should render input with correct placeholder, type and value', () => {
        const { container, unmount } = render(
            <AuthInput
                icon={Mail}
                type="email"
                placeholder="OPERATOR_EMAIL"
                value="test@node.sys"
                onChange={() => {}}
            />
        );

        const input = container.querySelector('input[type="email"]');
        expect(input).not.toBeNull();
        expect(input.getAttribute('placeholder')).toBe('OPERATOR_EMAIL');
        expect(input.value).toBe('test@node.sys');
        unmount();
    });

    it('should trigger onChange callback on input changes', () => {
        const handleChange = vi.fn();
        const { container, unmount } = render(
            <AuthInput
                type="text"
                placeholder="HANDLE"
                value=""
                onChange={handleChange}
            />
        );

        const input = container.querySelector('input[placeholder="HANDLE"]');
        expect(input).not.toBeNull();

        act(() => {
            input.value = 'NewHandle';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        unmount();
    });

    it('should render file input without crashing', () => {
        const { container, unmount } = render(
            <AuthInput
                type="file"
                placeholder="AVATAR_IMAGE"
                onChange={() => {}}
                accept="image/*"
            />
        );

        const fileInput = container.querySelector('input[type="file"]');
        expect(fileInput).not.toBeNull();
        expect(fileInput.getAttribute('accept')).toBe('image/*');
        unmount();
    });
});

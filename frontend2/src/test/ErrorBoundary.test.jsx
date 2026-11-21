import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from './test-utils';
import ErrorBoundary from '../components/common/ErrorBoundary';

const FaultyComponent = () => {
    throw new Error('SIMULATED_CORE_BREACH');
};

describe('ErrorBoundary Component', () => {
    it('should render children normally when no error occurs', () => {
        const { container, unmount } = render(
            <ErrorBoundary>
                <div id="child-node">OPERATIONAL</div>
            </ErrorBoundary>
        );

        const child = container.querySelector('#child-node');
        expect(child).not.toBeNull();
        expect(child.textContent).toBe('OPERATIONAL');
        unmount();
    });

    it('should catch runtime errors and render Cyberpunk recovery UI', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { container, unmount } = render(
            <ErrorBoundary>
                <FaultyComponent />
            </ErrorBoundary>
        );

        expect(container.textContent).toContain('CRITICAL SYSTEM FAULT');
        expect(container.textContent).toContain('Reboot Node');
        expect(container.textContent).toContain('Return to Gateway');

        consoleSpy.mockRestore();
        unmount();
    });
});

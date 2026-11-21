import { act } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Pure React 19 Test Render Utility
 * Uses native createRoot and act without bulky external dependencies.
 */
export function render(ui) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  
  act(() => {
    root.render(ui);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
}

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vite-plus/test';

vi.mock('react-pdf', () => ({
  Document: () => null,
  Page: () => null,
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: '',
    },
  },
}));

beforeEach(() => {
  localStorage.clear();
});

// afterEach is not registered globally, so auto cleanup is disabled in testing-library/react, and we need to call it manually after each test to reset the DOM.
afterEach(() => {
  cleanup();
});

if (globalThis.ResizeObserver === undefined) {
  class ResizeObserverMock {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
